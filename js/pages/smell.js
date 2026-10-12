import { marbleSprite, drawMarble, drawGlow } from '../lib/marble-sprite.js';
import { fitCanvas, TAU, rand } from '../lib/canvas.js';
import { clamp } from '../lib/util.js';
import { icon as svg } from '../lib/icons.js';
import { sfx } from '../lib/audio.js';
import { discover } from '../lib/progress.js';

export const slug = 'smell';
export const title = 'איך האף שלנו יודע?';
export const chapter = 'איך האף יודע';
export const icon = 'nose';
export const nextLabel = 'השמות האמיתיים';
export const reinitOnResize = true;

export const sectionClass = 'theme-smell';

const cake = `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="sm-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#d97706"/></linearGradient></defs>
<ellipse cx="50" cy="90" rx="38" ry="6" fill="rgba(0,0,0,0.3)"/>
<path d="M14 52h72v34a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6Z" fill="url(#sm-c)"/>
<path d="M14 52c0-14 16-22 36-22s36 8 36 22c-6 8-14-2-22 6s-14-2-22 6-14-2-22 6-14-2-26-6Z" fill="#fb7185"/>
<path d="M44 30c0-8 8-8 8 0" stroke="#7c2d12" stroke-width="3" fill="none"/><rect x="47" y="14" width="6" height="18" rx="3" fill="#fef3c7"/><path d="M50 4c4 4 4 8 0 10-4-2-4-6 0-10Z" fill="#fb923c"/></svg>`;
const nose = `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="sm-n" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ffd6b8"/><stop offset="1" stop-color="#e8a37a"/></radialGradient></defs>
<path d="M54 10c-2 24-14 36-18 52-3 12 6 22 18 22s24-8 24-18c0-6-4-10-8-12-6-4-10-14-10-44Z" fill="url(#sm-n)"/>
<ellipse cx="46" cy="78" rx="5" ry="4" fill="#9a4f2c"/><ellipse cx="66" cy="76" rx="5" ry="4" fill="#9a4f2c"/></svg>`;

export const html = `
<h2 class="title">איך האף <em>יודע</em>?</h2>
<p class="lead">אתם בחדר, הדלת סגורה, ופתאום מריחים עוגה שנאפית במטבח. איך האף שלכם יודע מה קורה שם? חממו את התנור, וצפו.</p>
<div class="smell-stage">
    <canvas id="smell-canvas" class="glass-canvas" aria-label="גולות ריח שעפות מהעוגה אל האף"></canvas>
</div>
<div class="slider-row">
    <span class="cold">${svg('snow', { size: 32 })}</span>
    <input id="smell-slider" type="range" min="0" max="100" value="35" class="temp-slider" aria-label="חום התנור">
    <span class="hot">${svg('flame', { size: 32 })}</span>
</div>
<p class="chip" id="smell-count">הגיעו לאף: 0 גולות</p>
<p class="insight" id="smell-insight">ריח הוא לא קסם: כשאתם מריחים עוגה, <b>צורונים אמיתיים שלה</b> עפו כל הדרך עד לאף שלכם. כל ריח בעולם הוא צורונים קטנטנים שפוגעים בכם.</p>
<details class="deep">
    <summary>למבוגרים סקרנים</summary>
    <p>מולקולות הריח נעות בדיפוזיה: תנועה אקראית עם סחף איטי, ולכן הן לא עפות בקו ישר אלא מתפזרות בחדר. בחום הן מהירות יותר ויוצאות בכמות גדולה יותר מהמקור. באף שלנו קולטנים מיוחדים נקשרים למולקולות, והמוח מפענח את הדפוס כ"עוגה".</p>
</details>
`;

export function init(page) {
    const canvas = page.root.querySelector('#smell-canvas');
    const slider = page.root.querySelector('#smell-slider');
    const counter = page.root.querySelector('#smell-count');
    const insight = page.root.querySelector('#smell-insight');
    const { ctx, W, H, dpr } = fitCanvas(canvas);

    // the cake and the nose are drawn into the canvas as images
    const load = markup => {
        const img = new Image();
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '))}`;
        return img;
    };
    const cakeImg = load(cake), noseImg = load(nose);

    const r = Math.max(5, Math.min(8, W / 55));
    const sprite = marbleSprite(32, 78, 60, r, dpr);
    const iconSize = Math.min(100, H * 0.42);
    const cakeBox = { x: 8, y: H / 2 - iconSize / 2 };
    const noseBox = { x: W - iconSize - 8, y: H / 2 - iconSize / 2 };
    const noseX = noseBox.x + iconSize * 0.18;

    let molecules = [];
    let spawnAccumulator = 0;
    let sniff = 0;
    let reached = 0;
    let revealed = false;
    let lastPing = 0;

    let lastT = performance.now();
    page.frame(now => {
        const dt = Math.min(3, (now - lastT) / 16.67);
        lastT = now;
        const heat = parseFloat(slider.value) / 100;
        const drift = 0.8 + heat * 2.4;      // average push toward the nose
        const jitter = 1.4 + heat * 1.6;     // random walk: molecules zigzag
        const spawnRate = 0.12 + heat * 0.5;

        spawnAccumulator += spawnRate * dt;
        while (spawnAccumulator >= 1) {
            spawnAccumulator -= 1;
            molecules.push({ x: cakeBox.x + iconSize * 0.8, y: H / 2 + rand(-iconSize * 0.3, iconSize * 0.2), vx: 0, vy: 0, life: 0 });
        }

        ctx.clearRect(0, 0, W, H);

        // warm glow around the cake: stronger when the oven is hot
        drawGlow(ctx, cakeBox.x + iconSize / 2, H / 2, iconSize * 0.5, 30, 0.15 + heat * 0.5);

        // steam wisps from the cake
        ctx.drawImage(cakeImg, cakeBox.x, cakeBox.y + Math.sin(now / 600) * 1.5, iconSize, iconSize);
        ctx.save();
        const s = 1 + sniff * 0.18;
        ctx.translate(noseBox.x + iconSize / 2, noseBox.y + iconSize / 2);
        ctx.scale(s, s);
        ctx.drawImage(noseImg, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
        ctx.restore();

        molecules = molecules.filter(m => {
            m.life += dt;
            // random walk with a drift toward the nose: a molecule never flies in a straight line
            m.vx = m.vx * 0.7 + (Math.random() - 0.4) * jitter * 0.6 + drift * 0.08;
            m.vy = m.vy * 0.7 + (Math.random() - 0.5) * jitter * 0.9;
            m.x += (m.vx * 1.4 + drift * 0.35) * dt;
            m.y = clamp(m.y + m.vy * dt, r, H - r);
            if (m.x > noseX) {
                reached++;
                sniff = 1;
                if (now - lastPing > 130) { sfx.ping(reached % 8); lastPing = now; }
                counter.textContent = `הגיעו לאף: ${reached} גולות`;
                if (!revealed && reached >= 12) {
                    revealed = true;
                    discover('smell');
                    insight.classList.add('show');
                    page.ready();
                }
                return false;
            }
            const t = clamp((m.x - cakeBox.x) / (noseX - cakeBox.x), 0, 1);
            ctx.globalAlpha = t < 0.08 ? t / 0.08 : 1;
            drawMarble(ctx, sprite, m.x, m.y, r);
            return true;
        });
        ctx.globalAlpha = 1;
        sniff *= Math.pow(0.9, dt);
    });
}
