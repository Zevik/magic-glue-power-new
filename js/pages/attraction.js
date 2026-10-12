import { fitCanvas, bindCanvasDrag, TAU } from '../lib/canvas.js';
import { fixedStepLoop } from '../lib/interaction.js';
import { marbleSprite, drawMarble, drawShadow } from '../lib/marble-sprite.js';
import { sfx } from '../lib/audio.js';
import { discover } from '../lib/progress.js';

export const slug = 'attraction';
export const title = 'משיכה בין צורונים';
export const chapter = 'מי נאחז חזק יותר';
export const icon = 'link';
export const nextLabel = 'פותרים תעלומות';
export const reinitOnResize = true;

export const sectionClass = 'theme-attraction';

export const html = `
<h2 class="title">צורונים גדולים <em>נאחזים חזק</em></h2>
<p class="lead">ככל שהצורון גדול ומסובך יותר, יש לו יותר גולות שנצמדות לשכנים, והמשיכה מצטברת. נסו להפריד כל זוג, והשוו את המאמץ.</p>
<div class="compare">
    <div class="compare-col">
        <h3>צורוני מים</h3>
        <canvas id="water-canvas" aria-label="שני צורוני מים. אפשר לגרור את התחתון"></canvas>
        <div class="meter"><span class="meter-label">מאמץ</span><div class="meter-track"><div class="meter-fill" id="water-meter"></div></div></div>
        <p class="verdict" id="water-verdict">גררו את הצורון התחתון</p>
    </div>
    <div class="compare-col">
        <h3>צורוני שמן</h3>
        <canvas id="oil-canvas" aria-label="שני צורוני שמן ארוכים. אפשר לגרור את התחתון"></canvas>
        <div class="meter"><span class="meter-label">מאמץ</span><div class="meter-track"><div class="meter-fill" id="oil-meter"></div></div></div>
        <p class="verdict" id="oil-verdict">תפסו את השרשרת התחתונה ומשכו</p>
    </div>
</div>
<p class="insight" id="attraction-insight">השמן נאחז הרבה יותר חזק. כל גולה בשרשרת הארוכה נדבקת לשכנות שלה, ואותו כוח קטנטן, חוזר ארבע־עשרה פעמים, נהפך לאחיזה חזקה. <b>הרבה משיכות קטנות הן משיכה גדולה.</b></p>
<details class="deep">
    <summary>למבוגרים סקרנים</summary>
    <p>כוחות ון דר ואלס בין מולקולות גדלים עם שטח המגע ביניהן, ולכן מולקולות ארוכות נצמדות היטב. מים הם חריגים: קשרי המימן ביניהם חזקים במיוחד, ולכן הם רותחים בטמפרטורה גבוהה מהצפוי. כאן ההדגמה פשוטה בכוונה: הדגשנו את אפקט האורך.</p>
</details>
`;

export function init(page) {
    const state = { water: false, oil: false };
    const insight = page.root.querySelector('#attraction-insight');

    function maybeFinish() {
        if (state.water && state.oil) {
            insight.classList.add('show');
            sfx.success();
            page.ready();
        }
    }

    setupWater(page, state, maybeFinish);
    setupOil(page, state, maybeFinish);
}

function setupWater(page, state, done) {
    const canvas = page.root.querySelector('#water-canvas');
    const meter = page.root.querySelector('#water-meter');
    const verdict = page.root.querySelector('#water-verdict');
    const { ctx, W, H, dpr } = fitCanvas(canvas);

    const s = Math.min(1.3, W / 300);
    const rO = 22 * s, rH = 14 * s;
    const sprites = {
        O: marbleSprite(0, 85, 52, rO, dpr),
        H: marbleSprite(210, 14, 86, rH, dpr)
    };
    const touching = 64 * s;
    const top = { x: W / 2, y: H / 2 - touching / 2 };
    const home = { x: W / 2, y: H / 2 + touching / 2 };
    const pos = { ...home };
    const vel = { x: 0, y: 0 };
    let angle = 0, angleVel = 0;
    let grab = null;
    let lastX = 0;
    let maxPull = 0;
    let peakEffort = 0;
    const stiffness = 0.1;

    function drawWater(x, y, a, lift = 0) {
        // H atoms sit above and to the sides of the O; the whole molecule turns by angle
        const c = Math.cos(a), si = Math.sin(a);
        const rot = (dx, dy) => [x + dx * c - dy * si, y + dx * si + dy * c];
        const [h1x, h1y] = rot(-24 * s, -20 * s);
        const [h2x, h2y] = rot(24 * s, -20 * s);
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 7 * s;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(h1x, h1y); ctx.lineTo(x, y); ctx.lineTo(h2x, h2y);
        ctx.stroke();
        drawMarble(ctx, sprites.H, h1x, h1y, rH);
        drawMarble(ctx, sprites.H, h2x, h2y, rH);
        drawMarble(ctx, sprites.O, x, y, rO);
    }

    bindCanvasDrag(page, canvas, {
        hit: p => Math.hypot(p.x - pos.x, p.y - pos.y) < 50 * s,
        onStart(p) { grab = { x: pos.x - p.x, y: pos.y - p.y }; lastX = p.x; vel.x = vel.y = 0; sfx.tap(); },
        onMove(p) {
            pos.x = Math.min(W - rO, Math.max(rO, p.x + grab.x));
            pos.y = Math.min(H - rO, Math.max(rO, p.y + grab.y));
            angle += (p.x - lastX) * 0.012;
            lastX = p.x;
            vel.x = vel.y = angleVel = 0;
            const d = Math.hypot(pos.x - home.x, pos.y - home.y);
            maxPull = Math.max(maxPull, d);
            const effort = stiffness * d / 14;
            peakEffort = Math.max(peakEffort, effort);
            if (Math.random() < 0.15) sfx.stretch(Math.min(1, effort));
        },
        onEnd() {
            grab = null;
            sfx.snap();
            if (maxPull > W * 0.18 && !state.water) {
                state.water = true;
                discover('water-pull');
                verdict.textContent = 'הם נפרדו בקלות יחסית. עכשיו נסו את השמן';
                done();
            }
        }
    });

    fixedStepLoop(page, () => {
        if (grab) return;
        vel.x = (vel.x + (home.x - pos.x) * stiffness) * 0.9;
        vel.y = (vel.y + (home.y - pos.y) * stiffness) * 0.9;
        pos.x += vel.x; pos.y += vel.y;
        angleVel = (angleVel + (0 - angle) * 0.1) * 0.8;
        angle += angleVel;
    }, () => {
        const d = Math.hypot(pos.x - home.x, pos.y - home.y);
        meter.style.transform = `scaleX(${Math.min(1, stiffness * d / 14).toFixed(3)})`;
        ctx.clearRect(0, 0, W, H);
        drawShadow(ctx, W / 2, H * 0.9, rO * 1.6, 0.35);
        drawWater(top.x, top.y, 0);
        drawWater(pos.x, pos.y, angle);
    });
}

// The oil molecule is a long flexible chain. It sticks to the molecule above it, so when
// you pull on it the part that is being held bends, and only lets go bit by bit.
function setupOil(page, state, done) {
    const canvas = page.root.querySelector('#oil-canvas');
    const meter = page.root.querySelector('#oil-meter');
    const verdict = page.root.querySelector('#oil-verdict');
    const { ctx, W, H, dpr } = fitCanvas(canvas);

    const stiffness = 0.4;
    const count = 28;
    const spacing = Math.min(11, (W - 40) / count);
    const ballR = spacing * 0.88;
    const rowGap = ballR * 1.8;
    const y1 = H / 2 - rowGap / 2;
    const y2 = H / 2 + rowGap / 2;
    const x0 = W / 2 - (count - 1) * spacing / 2;
    const xEnd = x0 + (count - 1) * spacing;
    const floorY = y1 + ballR * 1.6; // the lowest edge of the fixed chain
    const adhesion = stiffness * 0.5;
    const damping = 0.9;
    const sprites = [marbleSprite(222, 14, 30, ballR, dpr), marbleSprite(220, 10, 80, ballR, dpr)];

    const nodes = [];
    for (let i = 0; i < count; i++) {
        const ax = x0 + i * spacing;
        nodes.push({
            ax, ay: y2, x: ax, y: y2, px: ax, py: y2,
            stuck: true,
            breakAt: ballR * (2.2 + Math.random() * 2),
            i
        });
    }

    let handle = null;
    let grab = null;
    let target = null;
    let peeled = false;

    const keepInside = p => ({
        x: Math.min(W - ballR, Math.max(ballR, p.x)),
        y: Math.min(H - ballR, Math.max(ballR, p.y))
    });

    bindCanvasDrag(page, canvas, {
        hit: p => nodes.some(n => Math.hypot(n.x - p.x, n.y - p.y) < spacing * 2.2),
        onStart(p) {
            let best = Infinity;
            for (const n of nodes) {
                const d = Math.hypot(n.x - p.x, n.y - p.y);
                if (d < best) { best = d; handle = n; }
            }
            grab = { x: handle.x - p.x, y: handle.y - p.y };
            target = { x: handle.x, y: handle.y };
            sfx.tap();
        },
        onMove(p) { target = keepInside({ x: p.x + grab.x, y: p.y + grab.y }); },
        onEnd() {
            handle = null;
            sfx.snap();
            for (const n of nodes) n.stuck = true; // it sticks again, and the chain snaps back
        }
    });

    function link(a, b, rest, strength) {
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1e-6;
        const wa = a === handle ? 0 : 1, wb = b === handle ? 0 : 1;
        if (wa + wb === 0) return;
        const k = (d - rest) / d * strength / (wa + wb);
        a.x += dx * k * wa; a.y += dy * k * wa;
        b.x -= dx * k * wb; b.y -= dy * k * wb;
    }

    let brokeSound = 0;

    function update() {
        for (const n of nodes) {
            if (n === handle) continue;
            const vx = (n.x - n.px) * damping, vy = (n.y - n.py) * damping;
            n.px = n.x; n.py = n.y;
            n.x += vx; n.y += vy;
            if (n.stuck || !handle) {
                n.x += (n.ax - n.x) * adhesion;
                n.y += (n.ay - n.y) * adhesion;
            }
        }
        if (handle) {
            // while the ball you hold is still stuck, it lags heavily behind your finger: it takes
            // real effort. The moment it breaks free, it moves with you.
            const resist = handle.stuck ? 0.06 : 0.85;
            handle.x += (target.x - handle.x) * resist;
            handle.y += (target.y - handle.y) * resist;
            handle.px = handle.x;
            handle.py = handle.y;
        }

        for (let it = 0; it < 12; it++) {
            for (let i = 0; i < count - 1; i++) link(nodes[i], nodes[i + 1], spacing, 1);
            // resist sharp bends so it behaves like a molecule and not like a rope
            for (let i = 0; i < count - 2; i++) link(nodes[i], nodes[i + 2], spacing * 2, 0.5);
            for (let i = 0; i < count - 4; i++) link(nodes[i], nodes[i + 4], spacing * 4, 0.25);
        }

        for (const n of nodes) {
            if (n.x > x0 - ballR && n.x < xEnd + ballR && n.y < floorY) n.y = floorY; // the other molecule is solid
            n.x = Math.min(W - ballR, Math.max(ballR, n.x));
            n.y = Math.min(H - ballR, Math.max(ballR, n.y));
        }

        // peeling off: a ball lets go once it has been pulled too far from where it was stuck
        for (const n of nodes) {
            const drift = Math.hypot(n.x - n.ax, n.y - n.ay);
            if (handle && n.stuck && drift > n.breakAt) {
                n.stuck = false;
                if (performance.now() - brokeSound > 90) { sfx.click(n.i); brokeSound = performance.now(); }
            } else if (!n.stuck && drift < n.breakAt * 0.3) n.stuck = true;
        }

        if (!peeled && handle && !handle.stuck && Math.hypot(handle.x - handle.ax, handle.y - handle.ay) > H * 0.22) {
            peeled = true;
            state.oil = true;
            discover('oil-pull');
            verdict.textContent = 'וואו, כמה אחיזה! הגולות עזבו אחת־אחת';
            done();
        }
    }

    fixedStepLoop(page, update, () => {
        // effort adds up from every ball that is still holding on
        let effort = 0;
        for (const n of nodes) if (n.stuck) effort += adhesion * Math.hypot(n.x - n.ax, n.y - n.ay);
        meter.style.transform = `scaleX(${Math.min(1, effort / 14).toFixed(3)})`;

        ctx.clearRect(0, 0, W, H);
        drawShadow(ctx, W / 2, H * 0.9, ballR * 16, 0.3);
        for (let i = 0; i < count; i++) drawMarble(ctx, sprites[i % 2], x0 + i * spacing, y1, ballR);
        for (const n of nodes) drawMarble(ctx, sprites[(n.i + 1) % 2], n.x, n.y, ballR);
    });
}
