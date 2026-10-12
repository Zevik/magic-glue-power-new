import { fitCanvas, TAU } from '../lib/canvas.js';
import { marbleSprite, drawMarble, drawGlow } from '../lib/marble-sprite.js';
import { sfx } from '../lib/audio.js';
import { burst } from '../lib/fx.js';

export const slug = 'start';
export const title = 'הכוח הנעלם';
export const reinitOnResize = true;
export const nav = false; // this page has its own big button

export const sectionClass = 'theme-start';

export const html = `
<div class="orb-wrap"><canvas id="orb-canvas" aria-label="כדור שעשוי מגולות זוהרות. אפשר לגעת בו"></canvas></div>
<h1 class="title title-hero"><span>הכוח הנעלם</span></h1>
<p class="lead">יש כוח אחד שמחזיק את העולם כולו.<br>אתם נוגעים בו כל יום, ואף פעם לא ראיתם אותו.<br><b>בואו נלך לחפש אותו.</b></p>
<div class="actions">
    <a href="#/gravity" class="btn btn-big btn-pulse" id="start-btn">יוצאים למסע</a>
</div>
<p class="start-meta">כעשר דקות · כדאי עם סאונד · מתאים מגיל 8 ועד 108</p>
`;

const HUES = [215, 245, 268, 292, 318, 344];
const COUNT = 170;

export function init(page) {
    const canvas = page.root.querySelector('#orb-canvas');
    const { ctx, W, H, dpr } = fitCanvas(canvas);
    const sprites = HUES.map(h => marbleSprite(h, 85, 62, 14, dpr));

    // points spread evenly over a sphere
    const pts = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
        const y = 1 - (i / (COUNT - 1)) * 2;
        const rad = Math.sqrt(1 - y * y);
        const th = golden * i;
        pts.push({ x: Math.cos(th) * rad, y, z: Math.sin(th) * rad, ox: 0, oy: 0, vx: 0, vy: 0, seed: Math.random() * TAU });
    }

    const pointer = { x: -999, y: -999, active: false };
    let yawBoost = 0;
    let pulse = 0;
    const rect = () => canvas.getBoundingClientRect();
    const setPointer = e => {
        const b = rect();
        pointer.x = e.clientX - b.left;
        pointer.y = e.clientY - b.top;
        pointer.active = true;
    };
    canvas.addEventListener('pointermove', setPointer, { signal: page.signal });
    canvas.addEventListener('pointerleave', () => { pointer.active = false; pointer.x = pointer.y = -999; }, { signal: page.signal });
    canvas.addEventListener('pointerdown', e => {
        setPointer(e);
        pulse = 1;
        yawBoost = 0.08;
        sfx.pop();
        const b = rect();
        burst(b.left + b.width / 2, b.top + b.height / 2, { count: 26, speed: 6 });
    }, { signal: page.signal });

    const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.34;
    let yaw = 0;
    const start = performance.now();

    page.frame(now => {
        const t = (now - start) / 1000;
        yaw += 0.006 + yawBoost;
        yawBoost *= 0.95;
        pulse *= 0.93;

        ctx.clearRect(0, 0, W, H);

        // soft core light
        const breathe = 1 + Math.sin(t * 1.4) * 0.04;
        const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.6);
        core.addColorStop(0, 'rgba(216, 180, 254, 0.5)');
        core.addColorStop(0.5, 'rgba(147, 90, 255, 0.16)');
        core.addColorStop(1, 'rgba(147, 90, 255, 0)');
        ctx.fillStyle = core;
        ctx.fillRect(0, 0, W, H);

        const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
        const tilt = 0.4;
        const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
        const shells = [];
        for (const p of pts) {
            // slow wobble so the surface shimmers
            const wob = 1 + Math.sin(t * 2 + p.seed) * 0.025 + pulse * 0.28 * Math.sin(p.y * 6 - t * 9);
            let x = p.x * cosY + p.z * sinY;
            let z = -p.x * sinY + p.z * cosY;
            let y = p.y * cosT - z * sinT;
            z = p.y * sinT + z * cosT;
            const persp = 1 / (1 - z * 0.32);
            const sx = cx + x * R * wob * breathe * persp;
            const sy = cy + y * R * wob * breathe * persp;
            // the pointer pushes marbles away, they spring back
            const dx = sx + p.ox - pointer.x, dy = sy + p.oy - pointer.y;
            const d2 = dx * dx + dy * dy;
            if (pointer.active && d2 < 110 * 110 && d2 > 1) {
                const d = Math.sqrt(d2);
                const f = (1 - d / 110) * 2.2;
                p.vx += dx / d * f;
                p.vy += dy / d * f;
            }
            p.vx += -p.ox * 0.06; p.vy += -p.oy * 0.06;
            p.vx *= 0.86; p.vy *= 0.86;
            p.ox += p.vx; p.oy += p.vy;
            shells.push({ x: sx + p.ox, y: sy + p.oy, z, persp, hue: Math.min(5, Math.floor((p.y + 1) / 2 * 5.999)) });
        }
        shells.sort((a, b) => a.z - b.z);

        for (const s of shells) {
            const depth = (s.z + 1) / 2; // 0 back .. 1 front
            const r = (4.5 + depth * 5.5) * s.persp * (0.85 + pulse * 0.2);
            ctx.globalAlpha = 0.35 + depth * 0.65;
            if (depth > 0.55) drawGlow(ctx, s.x, s.y, r, HUES[s.hue], 0.18);
            drawMarble(ctx, sprites[s.hue], s.x, s.y, r);
        }
        ctx.globalAlpha = 1;
    });
}
