import { fitCanvas, bindCanvasDrag, TAU, rand } from '../lib/canvas.js';
import { fixedStepLoop } from '../lib/interaction.js';
import { marbleSprite, drawMarble, drawGlow, drawShadow } from '../lib/marble-sprite.js';
import { sfx } from '../lib/audio.js';
import { discover } from '../lib/progress.js';

export const slug = 'dabkesem';
export const title = 'כוח הדבקסם!';
export const chapter = 'כוח הדבקסם';
export const icon = 'magnet';
export const nextLabel = 'הבנתי. אבל...';
export const reinitOnResize = true;

export const sectionClass = 'theme-dabkesem';

export const html = `
<h2 class="title">כוח <em>הדבקסם</em></h2>
<p class="lead">מה גורם לגולות להישאר יחד? כוח שמושך כל גולה אל הגולות שלידה. נקרא לו <b>כוח הדבקסם</b>. תפסו את הגולה הכחולה ונסו להרחיק אותה.</p>
<div class="stage pull-stage"><canvas id="pull-canvas" aria-label="שתי גולות. אפשר לגרור את הכחולה"></canvas></div>
<div class="meter"><span class="meter-label">עוצמת המשיכה</span><div class="meter-track"><div class="meter-fill" id="pull-meter"></div></div></div>
<p class="hint" id="pull-hint">גררו את הגולה הכחולה</p>
<p class="insight" id="pull-insight">הרגשתם? <b>ככל שמרחיקים את הגולה, הדבקסם מושך חזק יותר</b>, ומיד כשעוזבים היא חוזרת הביתה. זה הכוח שמחזיק גולות יחד.</p>
<details class="deep">
    <summary>למבוגרים סקרנים</summary>
    <p>בין אטומים ומולקולות פועלים כוחות חשמליים: משיכה בין מטענים מנוגדים, דחייה בין זהים. הכוח האלקטרומגנטי הזה הוא ה"דבקסם" שלנו, והוא מחזיק חומר שלם יחד. קל לדמות אותו לקפיץ: ככל שמותחים יותר, הוא מושך חזק יותר.</p>
</details>
`;

export function init(page) {
    const canvas = page.root.querySelector('#pull-canvas');
    const meter = page.root.querySelector('#pull-meter');
    const hint = page.root.querySelector('#pull-hint');
    const insight = page.root.querySelector('#pull-insight');
    const { ctx, W, H, dpr } = fitCanvas(canvas);

    const R = Math.min(34, W / 8);
    const C = { x: W / 2, y: H / 2 };
    const home = { x: C.x + R * 2.02, y: C.y };
    const dHome = home.x - C.x;
    const DMAX = W / 2 - R * 1.2;               // the farthest the marble can be dragged inside the canvas
    const pos = { ...home };
    const vel = { x: 0, y: 0 };
    let grab = null;
    let last = { x: 0, y: 0 };
    let throwV = { x: 0, y: 0 };
    let stretchedFar = false;
    let done = false;
    let lastSoundAt = 0;
    let tetherPulse = 0;
    let t = 0;

    const red = marbleSprite(0, 85, 52, R, dpr);
    const blue = marbleSprite(217, 90, 55, R, dpr);

    const dist = () => Math.hypot(pos.x - C.x, pos.y - C.y);
    // 0..1: how strongly the pull acts at this distance. It never lets go: the farther, the stronger.
    const strength = d => Math.min(1, Math.max(0.15, d / DMAX));

    bindCanvasDrag(page, canvas, {
        hit: p => Math.hypot(p.x - pos.x, p.y - pos.y) < R * 1.6,
        onStart(p) {
            grab = { x: pos.x - p.x, y: pos.y - p.y };
            last = { x: p.x, y: p.y };
            vel.x = vel.y = 0;
            sfx.tap();
            hint.textContent = 'מרגישים את המשיכה?';
        },
        onMove(p) {
            pos.x = Math.min(W - R, Math.max(R, p.x + grab.x));
            pos.y = Math.min(H - R, Math.max(R, p.y + grab.y));
            throwV = { x: p.x - last.x, y: p.y - last.y };
            last = { x: p.x, y: p.y };
            const d = dist();
            if (d > dHome + (DMAX - dHome) * 0.5) stretchedFar = true;
            const now = performance.now();
            if (now - lastSoundAt > 70) { sfx.stretch(Math.min(1, d / DMAX)); lastSoundAt = now; }
        },
        onEnd() {
            grab = null;
            vel.x = throwV.x * 0.3;
            vel.y = throwV.y * 0.3;
            sfx.snap();
            hint.textContent = 'ראו איך היא חוזרת? גררו שוב, ונסו להרחיק עוד';
        }
    });

    fixedStepLoop(page, () => {
        t++;
        tetherPulse *= 0.92;
        if (grab) return;
        const k = 0.07 * strength(dist());
        vel.x += (home.x - pos.x) * k;
        vel.y += (home.y - pos.y) * k;
        vel.x *= 0.88; vel.y *= 0.88;
        pos.x += vel.x; pos.y += vel.y;
        pos.x = Math.min(W - R, Math.max(R, pos.x));
        pos.y = Math.min(H - R, Math.max(R, pos.y));

        // it came back after being stretched: that is the discovery
        if (!done && stretchedFar && Math.hypot(pos.x - home.x, pos.y - home.y) < 4 && Math.hypot(vel.x, vel.y) < 0.2) {
            done = true;
            sfx.click(7);
            discover('pull');
            insight.classList.add('show');
            page.ready();
            hint.textContent = 'כל פעם שתרחיקו, הדבקסם יחזיר אותה';
        }
    }, () => {
        const d = dist();
        const s = strength(d);
        // the meter shows how hard the pull is: nothing at rest, strongest at full stretch, fading outside the range
        const pull = Math.max(0, (d - dHome) / (DMAX - dHome));
        meter.style.transform = `scaleX(${Math.min(1, pull).toFixed(3)})`;

        ctx.clearRect(0, 0, W, H);

        drawShadow(ctx, C.x, C.y + R * 1.05, R, 0.4);
        drawShadow(ctx, pos.x, pos.y + R * 1.05, R, 0.4);

        // the tether: a few glowing strands that wobble, thin out as the pull weakens and flicker when it breaks
        const gap = d - R * 2;
        if (gap > -R) {
            const ang = Math.atan2(pos.y - C.y, pos.x - C.x);
            const sx = C.x + Math.cos(ang) * R * 0.9, sy = C.y + Math.sin(ang) * R * 0.9;
            const ex = pos.x - Math.cos(ang) * R * 0.9, ey = pos.y - Math.sin(ang) * R * 0.9;
            const len = Math.hypot(ex - sx, ey - sy);
            const nx = -Math.sin(ang), ny = Math.cos(ang);
            const alpha = 0.35 + s * 0.65;
            if (alpha > 0.02 && len > 2) {
                ctx.globalCompositeOperation = 'lighter';
                for (let strand = 0; strand < 3; strand++) {
                    ctx.strokeStyle = strand === 0 ? `rgba(253, 224, 71, ${alpha})` : `rgba(244, 114, 182, ${alpha * 0.7})`;
                    ctx.lineWidth = (strand === 0 ? 5 : 2.4) * (0.35 + s * 0.65);
                    ctx.shadowColor = 'rgba(253, 224, 71, 0.9)';
                    ctx.shadowBlur = 14;
                    ctx.beginPath();
                    const steps = 24;
                    for (let i = 0; i <= steps; i++) {
                        const u = i / steps;
                        const envelope = Math.sin(u * Math.PI);
                        const wobble = Math.sin(u * 12 + t * 0.25 * (strand + 1) + strand * 2) * envelope * (2 + d * 0.04 * (strand ? 1 : 0.3)) * (1 + tetherPulse * 2);
                        const x = sx + (ex - sx) * u + nx * wobble;
                        const y = sy + (ey - sy) * u + ny * wobble;
                        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                }
                ctx.shadowBlur = 0;
                ctx.globalCompositeOperation = 'source-over';
            }
        }

        drawGlow(ctx, C.x, C.y, R, 0, 0.35 + s * 0.3);
        drawGlow(ctx, pos.x, pos.y, R, 217, 0.35 + s * 0.3);
        drawMarble(ctx, red, C.x, C.y, R);
        drawMarble(ctx, blue, pos.x + (grab ? rand(-1, 1) * s * 1.5 : 0), pos.y + (grab ? rand(-1, 1) * s * 1.5 : 0), R);
    });
}
