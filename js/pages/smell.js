import { marbleSprite, drawMarble } from '../lib/marble-sprite.js';
import { clamp } from '../lib/util.js';

export const slug = 'smell';
export const title = 'איך האף שלנו יודע?';
export const reinitOnResize = true;

export const sectionClass = 'theme-smell';

export const html = `
<span class="kicker">👃 שלב 13</span>
<h2 class="title">איך האף שלנו יודע?</h2>
<p class="lead">אתם בחדר עם דלת סגורה, ופתאום מריחים עוגה שנאפית במטבח. איך האף יודע מה קורה שם? שחקו עם חום התנור וראו מה קורה!</p>
<div class="smell-stage">
    <div class="smell-emoji smell-cake">🎂</div>
    <canvas id="smell-canvas" class="glass-canvas"></canvas>
    <div class="smell-emoji smell-nose">👃</div>
</div>
<div class="slider-row">
    <span class="emoji">❄️</span>
    <input id="smell-slider" type="range" min="0" max="100" value="35" class="temp-slider" aria-label="חום התנור">
    <span class="emoji">🔥</span>
</div>
<p class="callout callout-soft">ריח הוא לא קסם: כשאתם מריחים עוגה, צורונים אמיתיים שלה עפו כל הדרך עד האף שלכם! כל ריח בעולם הוא בעצם צורונים מעופפים שפוגעים בכם.</p>
<div class="actions">
    <a href="#/reactions" class="btn btn-ghost">חזרה</a>
    <a href="#/summary" class="btn">מוכנים לגלות את השמות האמיתיים?</a>
</div>
`;

export function init(page) {
    const canvas = page.root.querySelector('#smell-canvas');
    const ctx = canvas.getContext('2d');
    const slider = page.root.querySelector('#smell-slider');
    const nose = page.root.querySelector('.smell-nose');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const r = Math.max(5, Math.min(8, canvas.width / 55));
    const sprite = marbleSprite(32, 75, 62, r);

    let molecules = [];
    let spawnAccumulator = 0;
    let sniffPulse = 0;
    const noseX = canvas.width * 0.9;

    page.frame(() => {
        const heat = parseFloat(slider.value) / 100;
        const speed = 1 + heat * 3.5;
        const spawnRate = 0.15 + heat * 0.55;

        spawnAccumulator += spawnRate;
        while (spawnAccumulator >= 1) {
            spawnAccumulator -= 1;
            molecules.push({
                x: canvas.width * 0.1,
                y: canvas.height * 0.5 + (Math.random() - 0.5) * canvas.height * 0.3,
                phase: Math.random() * Math.PI * 2,
                amp: canvas.height * (0.05 + Math.random() * 0.08),
                speed: speed * (0.7 + Math.random() * 0.6),
                life: 0
            });
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let reachedNose = false;
        molecules.forEach(m => {
            m.x += m.speed;
            m.life++;
            if (m.x > noseX - r * 4) reachedNose = true;
            const y = m.y + Math.sin(m.life * 0.05 + m.phase) * m.amp * 0.1;
            const t = clamp(m.x / canvas.width, 0, 1);
            const fade = t < 0.12 ? t / 0.12 : (t > 0.85 ? clamp((1 - t) / 0.15, 0, 1) : 1);
            ctx.globalAlpha = fade;
            drawMarble(ctx, sprite, m.x, y, r);
        });
        ctx.globalAlpha = 1;
        molecules = molecules.filter(m => m.x < noseX + r * 2);

        if (reachedNose) sniffPulse = 1;
        sniffPulse *= 0.9;
        nose.style.transform = `translateY(-50%) scale(${1 + sniffPulse * 0.15})`;
    });
}
