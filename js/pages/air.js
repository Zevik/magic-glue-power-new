import { fitCanvas, TAU, lerp } from '../lib/canvas.js';
import { marbleSprite, drawMarble } from '../lib/marble-sprite.js';
import { createGas } from '../lib/sim.js';
import { icon as svg } from '../lib/icons.js';
import { sfx } from '../lib/audio.js';
import { discover } from '../lib/progress.js';

export const slug = 'air';
export const title = 'תעלומת האוויר';
export const chapter = 'תעלומת האוויר';
export const icon = 'wind';
export const nextLabel = 'מה הסוד?';
export const reinitOnResize = true;

export const sectionClass = 'theme-air';

export const html = `
<h2 class="title">אם יש דבקסם, למה האוויר <em>לא נדבק</em>?</h2>
<p class="lead">גם האוויר עשוי מגולות, והדבקסם פועל גם עליהן. ובכל זאת הן מתעופפות בחופשיות ולא הופכות לגוש. מוזר, נכון?</p>
<canvas id="particle-canvas-5-gas" class="glass-canvas" aria-label="גולות אוויר שמתנגשות ומתפזרות"></canvas>
<div class="btn-row"><button type="button" id="cool-btn" class="btn btn-ghost btn-small">${svg('snow', { size: 22 })}<span>קררו את האוויר</span></button></div>
<p class="hint" id="air-hint">אפשר גם להעביר אצבע או עכבר בין הגולות</p>
<p class="insight" id="air-insight">גילית! כשהגולות <b>איטיות</b>, הדבקסם מספיק לתפוס אותן והן מתחילות להידבק. באוויר חם הן עפות מהר מדי: הן עוברות על פני הגולות לפני שהכוח מספיק לעבוד. <b>הסוד הוא מהירות.</b></p>
<details class="deep">
    <summary>למבוגרים סקרנים</summary>
    <p>בטמפרטורת החדר מולקולות אוויר נעות בממוצע במהירות של כמה מאות מטרים בשנייה, והן מתנגשות זו בזו מיליארדי פעמים בכל שנייה. כשמקררים גז מספיק (חנקן נעשה נוזל בכ-196 מעלות מתחת לאפס), האנרגיה הקינטית כבר לא מספיקה כדי להתגבר על המשיכה, והגז מתעבה.</p>
</details>
`;

export function init(page) {
    const canvas = page.root.querySelector('#particle-canvas-5-gas');
    const btn = page.root.querySelector('#cool-btn');
    const hint = page.root.querySelector('#air-hint');
    const insight = page.root.querySelector('#air-insight');
    const { ctx, W, H, dpr } = fitCanvas(canvas);

    const r = Math.max(7, Math.min(11, W / 38));
    const count = Math.min(60, Math.floor(W * H / 3600));
    const warm = marbleSprite(38, 95, 56, r, dpr);
    const cold = marbleSprite(200, 90, 56, r, dpr);
    const sim = createGas({ W, H, r, count, speed: 2.4, onCollide: (a, b, impact) => { if (impact > 2.2 && cooling < 0.3) sfx.click(); } });

    let cooling = 0;      // 0 hot .. 1 cold, eased
    let wantCold = false;
    let coldFor = 0;
    let revealed = false;
    const pointer = { x: -999, y: -999, vx: 0, vy: 0 };

    btn.addEventListener('click', () => {
        wantCold = !wantCold;
        btn.querySelector('span').textContent = wantCold ? 'החזירו את החום' : 'קררו את האוויר';
        sfx.tap();
        hint.textContent = wantCold ? 'שימו לב מה קורה לגולות כשהן מאטות...' : 'אפשר גם להעביר אצבע או עכבר בין הגולות';
    }, { signal: page.signal });

    canvas.addEventListener('pointermove', e => {
        const b = canvas.getBoundingClientRect();
        const x = e.clientX - b.left, y = e.clientY - b.top;
        pointer.vx = x - pointer.x; pointer.vy = y - pointer.y;
        pointer.x = x; pointer.y = y;
    }, { signal: page.signal });
    canvas.addEventListener('pointerleave', () => { pointer.x = pointer.y = -999; }, { signal: page.signal });

    page.frame(() => {
        cooling = lerp(cooling, wantCold ? 1 : 0, 0.02);
        const speedScale = lerp(1, 0.14, cooling);

        // stirring with the pointer
        if (pointer.x > -900) {
            for (const p of sim.p) {
                const dx = p.x - pointer.x, dy = p.y - pointer.y;
                const d = Math.hypot(dx, dy);
                if (d < 45 && d > 1) {
                    p.vx += dx / d * 0.5 + pointer.vx * 0.02;
                    p.vy += dy / d * 0.5 + pointer.vy * 0.02;
                }
            }
        }

        sim.step(speedScale);

        // when it is cold the pull finally matters: close marbles drag each other, and energy drains away
        if (cooling > 0.35) {
            const reach = r * 3.6;
            for (let i = 0; i < sim.p.length; i++) {
                const a = sim.p[i];
                for (let j = i + 1; j < sim.p.length; j++) {
                    const b = sim.p[j];
                    const dx = b.x - a.x, dy = b.y - a.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 > reach * reach || d2 < 1) continue;
                    const d = Math.sqrt(d2);
                    const pull = 0.05 * cooling * (1 - d / reach);
                    a.vx += dx / d * pull; a.vy += dy / d * pull;
                    b.vx -= dx / d * pull; b.vy -= dy / d * pull;
                }
                a.vx *= 0.992; a.vy *= 0.992;
            }
        } else {
            // warm again: keep the average speed up so they scatter and fly
            for (const a of sim.p) {
                const sp = Math.hypot(a.vx, a.vy);
                if (sp < 1.4) { const k = 1.4 / Math.max(sp, 0.05); a.vx *= Math.min(k, 1.06); a.vy *= Math.min(k, 1.06); }
            }
        }

        // trails when hot
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = `rgba(0,0,0,${0.28 + cooling * 0.5})`;
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';

        // bonds between marbles that are sticking
        if (cooling > 0.5) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = `rgba(190, 240, 255, ${0.4 * cooling})`;
            ctx.beginPath();
            for (let i = 0; i < sim.p.length; i++) {
                for (let j = i + 1; j < sim.p.length; j++) {
                    const a = sim.p[i], b = sim.p[j];
                    if ((a.x - b.x) ** 2 + (a.y - b.y) ** 2 < (r * 2.5) ** 2) { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
                }
            }
            ctx.stroke();
        }

        for (const p of sim.p) {
            drawMarble(ctx, warm, p.x, p.y, r);
            if (cooling > 0.02) {
                ctx.globalAlpha = cooling;
                drawMarble(ctx, cold, p.x, p.y, r);
                ctx.globalAlpha = 1;
            }
        }

        if (wantCold && cooling > 0.8) {
            coldFor++;
            if (!revealed && coldFor > 90) {
                revealed = true;
                discover('air-cool');
                insight.classList.add('show');
                sfx.success();
                page.ready();
            }
        }
    });
}
