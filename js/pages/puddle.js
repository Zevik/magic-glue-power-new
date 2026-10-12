import { marbleSprite, drawMarble, drawGlow } from '../lib/marble-sprite.js';
import { fixedStepLoop } from '../lib/interaction.js';
import { fitCanvas, TAU, rand } from '../lib/canvas.js';
import { clamp } from '../lib/util.js';
import { icon as svg } from '../lib/icons.js';
import { sfx } from '../lib/audio.js';
import { discover } from '../lib/progress.js';

export const slug = 'puddle';
export const title = 'תעלומת השלולית שנעלמה';
export const chapter = 'השלולית שנעלמה';
export const icon = 'drop';
export const nextLabel = 'בואו נריח!';
export const reinitOnResize = true;

export const sectionClass = 'theme-puddle';

export const html = `
<h2 class="title">לאן נעלמה <em>השלולית</em>?</h2>
<p class="lead">אחרי הגשם נשארה שלולית על המדרכה. כמה שעות אחר כך היא נעלמה, אבל הרחוב לא רתח! אז איך מים נעלמים בלי להרתיח?</p>
<canvas id="particle-canvas-8-puddle" class="glass-canvas" aria-label="שלולית שהגולות שלה בורחות אחת־אחת לאוויר"></canvas>
<p id="puddle-status" class="state-chip"></p>
<div class="btn-row"><button id="wind-btn" type="button" class="btn btn-ghost btn-small wind-btn">${svg('wind', { size: 22 })}<span>תנו רוח</span></button></div>
<p class="insight" id="puddle-insight">זה <b>לוטו הצורונים</b>: הגולות בשלולית מתנגשות כל הזמן. לפעמים כמה מהן דוחפות גולה אחת בדיוק באותו רגע, והיא מקבלת מספיק מהירות כדי להתנתק מהדבקסם ולברוח לאוויר. הרוח רק מפנה מקום לעוד גולות שרוצות לברוח.</p>
<details class="deep">
    <summary>למבוגרים סקרנים</summary>
    <p>זה אידוי: המהירויות של המולקולות בנוזל מתפלגות סביב ממוצע, ותמיד יש מעטות מהירות מאוד. אלה שנמצאות סמוך לפני השטח ומהירות מספיק, בורחות. כשהן עוזבות, הן לוקחות איתן אנרגיה, ולכן הנוזל שנשאר מתקרר. כך גם הזיעה מקררת אותנו.</p>
</details>
`;

const INITIAL_COUNT = 64;
const BASE_ESCAPE_P = 0.006;
const WIND_ESCAPE_P = 0.02;
const SURFACE_CANDIDATES = 4;

export function init(page) {
    const canvas = page.root.querySelector('#particle-canvas-8-puddle');
    const status = page.root.querySelector('#puddle-status');
    const windBtn = page.root.querySelector('#wind-btn');
    const insight = page.root.querySelector('#puddle-insight');
    const { ctx, W, H, dpr } = fitCanvas(canvas);

    let windOn = false;
    windBtn.addEventListener('click', () => {
        windOn = !windOn;
        windBtn.classList.toggle('on', windOn);
        windBtn.querySelector('span').textContent = windOn ? 'הרוח נושבת' : 'תנו רוח';
        sfx.whoosh();
    }, { signal: page.signal });

    const r = Math.max(6, Math.min(9, W / 46));
    const minD = r * 1.9;
    const cohesionD = r * 2.8;
    const sprite = marbleSprite(198, 85, 55, r, dpr);

    const puddleW = W * 0.82;
    const puddleLeft = (W - puddleW) / 2;
    const puddleBottom = H - r * 1.5 - 6;
    const puddleTop = H * 0.45;

    let liquid = [];
    let steam = [];
    let ripples = [];
    let dried = false;

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
            status.textContent = 'השלולית התייבשה!';
            status.style.setProperty('--chip', '#7c3aed');
        } else {
            status.textContent = `נשארו ${liquid.length} גולות בשלולית`;
            status.style.setProperty('--chip', '#0891b2');
        }
    }
    updateStatus();

    let windPhase = 0;
    const puff = (() => {
        const c = document.createElement('canvas');
        c.width = c.height = 48;
        const g = c.getContext('2d');
        const grad = g.createRadialGradient(24, 24, 0, 24, 24, 24);
        grad.addColorStop(0, 'rgba(235, 247, 255, 0.9)');
        grad.addColorStop(1, 'rgba(235, 247, 255, 0)');
        g.fillStyle = grad;
        g.fillRect(0, 0, 48, 48);
        return c;
    })();

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
                    steam.push({ x: candidate.x, y: candidate.y, vx: windOn ? rand(0.4, 1.8) : rand(-0.6, 0.6), vy: -(1.2 + Math.random() * 1.4), opacity: 1 });
                    ripples.push({ x: candidate.x, y: candidate.y, t: 0 });
                    sfx.ping(liquid.length % 8);
                    escaped = true;
                }
            });
            if (escaped) updateStatus();
            if (liquid.length === 0) {
                if (!dried) {
                    dried = true;
                    discover('puddle');
                    insight.classList.add('show');
                    page.ready();
                }
                page.timeout(() => { spawnPuddle(); updateStatus(); }, 3500);
            }
        }

        steam.forEach(s => {
            s.vy -= 0.012;
            s.x += s.vx + (windOn ? 0.6 : 0);
            s.y += s.vy;
            s.opacity -= 0.007;
        });
        steam = steam.filter(s => s.opacity > 0 && s.y > -r * 3);
        ripples.forEach(rp => { rp.t += 0.04; });
        ripples = ripples.filter(rp => rp.t < 1);
        windPhase += windOn ? 0.03 : 0;
    }, () => {
        ctx.clearRect(0, 0, W, H);

        // sun
        const sunX = W * 0.86, sunY = H * 0.16;
        drawGlow(ctx, sunX, sunY, 26, 45, 0.8);
        ctx.save();
        ctx.translate(sunX, sunY);
        ctx.rotate(performance.now() / 6000);
        ctx.strokeStyle = 'rgba(255, 235, 150, 0.55)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        for (let i = 0; i < 12; i++) {
            ctx.rotate(TAU / 12);
            ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(i % 2 ? 36 : 42, 0); ctx.stroke();
        }
        ctx.restore();
        ctx.fillStyle = '#fff3b0';
        ctx.beginPath(); ctx.arc(sunX, sunY, 17, 0, TAU); ctx.fill();

        // the pavement under the puddle
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath();
        ctx.roundRect(puddleLeft - 12, puddleBottom - 2, puddleW + 24, H - puddleBottom + 2, [0, 0, 18, 18]);
        ctx.fill();

        // wind streaks
        if (windOn) {
            ctx.strokeStyle = 'rgba(255,255,255,0.35)';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            for (let i = 0; i < 7; i++) {
                const y = H * (0.12 + i * 0.1);
                const x = ((windPhase * 140 + i * 97) % (W + 120)) - 60;
                ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + 24, y - 6, x + 44, y + 6, x + 70, y); ctx.stroke();
            }
        }

        // a gentle sheen on the water
        if (liquid.length > 0) {
            const g = ctx.createLinearGradient(0, puddleTop, 0, puddleBottom);
            g.addColorStop(0, 'rgba(125, 211, 252, 0.2)');
            g.addColorStop(1, 'rgba(125, 211, 252, 0.06)');
            ctx.fillStyle = g;
            const surfaceY = Math.min(...liquid.map(p => p.y)) - r;
            ctx.beginPath();
            ctx.roundRect(puddleLeft, surfaceY, puddleW, puddleBottom - surfaceY, 18);
            ctx.fill();
        }

        for (const rp of ripples) {
            ctx.strokeStyle = `rgba(255,255,255,${(1 - rp.t) * 0.8})`;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(rp.x, rp.y, r + rp.t * 26, 0, TAU); ctx.stroke();
        }

        steam.forEach(s => {
            const size = r * (1.6 + (1 - s.opacity) * 2.2);
            ctx.globalAlpha = clamp(s.opacity, 0, 1);
            ctx.drawImage(puff, s.x - size, s.y - size, size * 2, size * 2);
        });
        ctx.globalAlpha = 1;
        liquid.forEach(p => drawMarble(ctx, sprite, p.x, p.y, r));
    });
}
