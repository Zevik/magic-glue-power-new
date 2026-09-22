import { marbleSprite, drawMarble } from '../lib/marble-sprite.js';
import { fixedStepLoop } from '../lib/interaction.js';
import { clamp } from '../lib/util.js';

export const slug = 'puddle';
export const title = 'תעלומת השלולית שנעלמה';
export const reinitOnResize = true;

export const sectionClass = 'theme-puddle';

export const html = `
<span class="kicker">💧 שלב 10</span>
<h2 class="title">תעלומת השלולית שנעלמה</h2>
<p class="callout">חזרו רגע לשאלה מהעולם האמיתי: אחרי הגשם, שלולית על המדרכה נעלמת מעצמה... אבל הרחוב לא רותח! איך?</p>
<canvas id="particle-canvas-8-puddle" class="glass-canvas"></canvas>
<p id="puddle-status" class="state-chip"></p>
<button id="wind-btn" type="button" class="btn btn-ghost wind-btn">💨 תנו רוח!</button>
<p class="lead">הצצה מבפנים: צורוני המים בשלולית מתנגשים כל הזמן. לפעמים כמה מהם דוחפים צורון אחד בדיוק באותו רגע, והוא מקבל מספיק מהירות כדי לנתק את כוח הדבקסם ולברוח לאוויר - זה "לוטו הצורונים"! הרוח רק מפנה מקום לעוד צורונים שרוצים לברוח.</p>
<p class="callout callout-soft">עכשיו אתם כבר מומחים לצורונים ולכוח הדבקסם. מוכנים להפעיל את הידע הזה ולפתור עוד כמה תעלומות אמיתיות?</p>
<div class="actions">
    <a href="#/attraction" class="btn btn-ghost">חזרה</a>
    <a href="#/mysteries" class="btn">בואו נפתור עוד תעלומות!</a>
</div>
`;

const INITIAL_COUNT = 42;
const BASE_ESCAPE_P = 0.006;
const WIND_ESCAPE_P = 0.02;
const SURFACE_CANDIDATES = 4;

export function init(page) {
    const canvas = page.root.querySelector('#particle-canvas-8-puddle');
    const ctx = canvas.getContext('2d');
    const status = page.root.querySelector('#puddle-status');
    const windBtn = page.root.querySelector('#wind-btn');

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // in case init() runs again after a resize, put the wind button back to its default look
    windBtn.classList.remove('on');
    windBtn.textContent = '💨 תנו רוח!';

    let windOn = false;
    windBtn.addEventListener('click', () => {
        windOn = !windOn;
        windBtn.classList.toggle('on', windOn);
        windBtn.textContent = windOn ? '💨 הרוח נושבת!' : '💨 תנו רוח!';
    }, { signal: page.signal });

    const r = Math.max(6, Math.min(9, canvas.width / 46));
    const minD = r * 1.9;
    const cohesionD = r * 2.8;
    const sprite = marbleSprite(198, 85, 55, r);
    const steamSprite = marbleSprite(198, 40, 85, r * 0.8);

    const puddleW = canvas.width * 0.82;
    const puddleLeft = (canvas.width - puddleW) / 2;
    const puddleBottom = canvas.height - r * 1.5;
    const puddleTop = canvas.height * 0.45;

    let liquid = [];
    let steam = [];

    function spawnPuddle() {
        liquid = [];
        steam = [];
        const cols = Math.max(4, Math.floor(puddleW / (r * 2.1)));
        let placed = 0;
        for (let row = 0; placed < INITIAL_COUNT; row++) {
            for (let col = 0; col < cols && placed < INITIAL_COUNT; col++) {
                const x = puddleLeft + r + col * (puddleW - r * 2) / Math.max(1, cols - 1) + (Math.random() - 0.5) * r * 0.4;
                const y = puddleBottom - r - row * r * 1.9 + (Math.random() - 0.5) * r * 0.3;
                liquid.push({ x, y, vx: 0, vy: 0 });
                placed++;
            }
        }
    }
    spawnPuddle();

    function updateStatus() {
        if (liquid.length === 0) {
            status.textContent = 'השלולית התייבשה! ✨';
            status.style.setProperty('--chip', '#7c3aed');
        } else {
            status.textContent = `💧 נשארו ${liquid.length} צורונים בשלולית`;
            status.style.setProperty('--chip', '#0891b2');
        }
    }
    updateStatus();

    fixedStepLoop(page, () => {
        liquid.forEach(p => {
            p.vx += (Math.random() - 0.5) * 0.22;
            p.vy += (Math.random() - 0.5) * 0.22 + 0.015;
        });

        // marbles that are close push each other apart; a bit further, they pull gently together
        for (let i = 0; i < liquid.length; i++) {
            for (let j = i + 1; j < liquid.length; j++) {
                const a = liquid[i], b = liquid[j];
                const dx = b.x - a.x, dy = b.y - a.y;
                const d2 = dx * dx + dy * dy;
                if (d2 > cohesionD * cohesionD || d2 < 1e-6) continue;
                const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
                if (d < minD) {
                    const push = (minD - d) * 0.5;
                    a.x -= nx * push * 0.5; a.y -= ny * push * 0.5;
                    b.x += nx * push * 0.5; b.y += ny * push * 0.5;
                } else {
                    const pull = 0.02 * (1 - (d - minD) / (cohesionD - minD));
                    a.vx += nx * pull; a.vy += ny * pull;
                    b.vx -= nx * pull; b.vy -= ny * pull;
                }
            }
        }

        liquid.forEach(p => {
            p.vx *= 0.92; p.vy *= 0.92;
            p.x += p.vx; p.y += p.vy;
            if (p.x < puddleLeft + r) { p.x = puddleLeft + r; p.vx *= -0.4; }
            if (p.x > puddleLeft + puddleW - r) { p.x = puddleLeft + puddleW - r; p.vx *= -0.4; }
            if (p.y > puddleBottom - r) { p.y = puddleBottom - r; p.vy *= -0.3; }
            if (p.y < puddleTop) { p.y = puddleTop; p.vy *= -0.3; }
        });

        // the lottery: every so often, a marble near the surface gets lucky and escapes
        if (liquid.length > 0) {
            const escapeP = windOn ? WIND_ESCAPE_P : BASE_ESCAPE_P;
            const surface = [...liquid].sort((a, b) => a.y - b.y).slice(0, SURFACE_CANDIDATES);
            let escaped = false;
            surface.forEach(candidate => {
                if (Math.random() < escapeP) {
                    liquid.splice(liquid.indexOf(candidate), 1);
                    steam.push({ x: candidate.x, y: candidate.y, vx: (Math.random() - 0.5) * 1.2, vy: -(1.2 + Math.random() * 1.4), opacity: 1 });
                    escaped = true;
                }
            });
            if (escaped) updateStatus();
            if (liquid.length === 0) {
                page.timeout(() => { spawnPuddle(); updateStatus(); }, 3000);
            }
        }

        steam.forEach(s => {
            s.vy -= 0.012;
            s.x += s.vx;
            s.y += s.vy;
            s.opacity -= 0.007;
        });
        steam = steam.filter(s => s.opacity > 0 && s.y > -r * 3);
    }, () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        steam.forEach(s => {
            ctx.globalAlpha = clamp(s.opacity, 0, 1);
            drawMarble(ctx, steamSprite, s.x, s.y, r * 0.8);
        });
        ctx.globalAlpha = 1;
        liquid.forEach(p => drawMarble(ctx, sprite, p.x, p.y, r));
    });
}
