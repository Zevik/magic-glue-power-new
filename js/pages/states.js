import { smoothstep } from '../lib/util.js';
import { marbleSprite, drawMarble } from '../lib/marble-sprite.js';

export const slug = 'states';
export const title = 'מסיבת הגולות הגדולה!';
export const reinitOnResize = () => step7SizeChanged();

export const sectionClass = 'theme-states';

export const html = `
<span class="kicker">🧊 שלב 7</span>
<h2 class="title">מסיבת הגולות הגדולה!</h2>
<p class="lead">עכשיו נראה איך הכל מתחבר ביחד. לפנינו מיכל מלא בגולות של מים. גררו את מד הטמפרטורה כדי להגביר את הלהבה שמתחת למיכל ולחמם את הגולות, ואז לקרר אותן שוב! שימו לב לחור הקטן בראש המיכל.</p>
<div class="card tank-card">
    <canvas id="particle-canvas-7"></canvas>
    <div class="slider-row">
        <span class="emoji">❄️</span>
        <input id="temp-slider-7" type="range" min="0" max="100" value="10" class="temp-slider" aria-label="טמפרטורה">
        <span class="emoji">☀️</span>
    </div>
    <p id="state-explanation" class="state-chip"></p>
</div>
<div class="actions">
    <a href="#/heat" class="btn btn-ghost">חזרה</a>
    <a href="#/puddle" class="btn">רגע, למה שלוליות מתאדות בלי לרתוח?</a>
</div>
`;

// Lets the router skip re-setting-up the tank when the size did not really change
// (on mobile, scrolling resizes the window as the address bar hides).
let step7Size = '';
function step7SizeChanged() {
    const c = document.getElementById('particle-canvas-7');
    return `${c.clientWidth}x${c.clientHeight}` !== step7Size;
}

export function init(page) {
    const canvas = document.getElementById('particle-canvas-7');
    const ctx = canvas.getContext('2d');
    const slider = document.getElementById('temp-slider-7');
    const explanation = document.getElementById('state-explanation');

    const STEP_MS = 1000 / 60;            // physics runs at a fixed 60Hz on any display
    const MELT_FROM = 34, MELT_TO = 40;   // slider range where the ice lets go
    const BOIL_FROM = 58, BOIL_TO = 68;   // slider range where the water starts boiling away
    const MODE_SOLID = 0, MODE_FREE = 1, MODE_FREEZING = 2;
    const SHADE_LIGHTNESS = [44, 50, 56, 62]; // water blue, a few tones so the marbles are not identical

    let W, H, r, tank, hole, bounds, flameRoom;
    let particles = [];
    let steam = [];
    let minD, cohesionD;
    const grid = { cell: 0, w: 0, h: 0, head: null, next: null };
    let flameTime = 0;
    let lastState = '';
    let sprites = [];

    function setup() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = canvas.clientWidth;
        H = canvas.clientHeight;
        step7Size = `${W}x${H}`;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Layout: a little headroom for the steam, the tank, and room below it for the burner.
        const headroom = Math.max(28, H * 0.08);
        flameRoom = Math.max(58, H * 0.16);
        tank = { x: W * 0.04, y: headroom, w: W * 0.92, h: H - headroom - flameRoom };
        r = Math.min(7, Math.max(3.5, W / 70));
        sprites = SHADE_LIGHTNESS.map(lightness => marbleSprite(198, 90, lightness, r, dpr));
        minD = r * 1.85;
        cohesionD = r * 2.7;

        const wall = 3;
        bounds = {
            left: tank.x + wall + r,
            right: tank.x + tank.w - wall - r,
            top: tank.y + wall + r,
            bottom: tank.y + tank.h - wall - r
        };
        const holeW = r * 4;
        hole = { x0: tank.x + tank.w / 2 - holeW / 2, x1: tank.x + tank.w / 2 + holeW / 2 };

        // Fill the whole tank with a hexagonal lattice, stretched a hair so it reaches every wall.
        const pitch = r * 2.35;
        const cols = Math.max(2, Math.floor((bounds.right - bounds.left) / pitch + 0.5));
        const pitchX = (bounds.right - bounds.left) / (cols - 0.5);
        const rows = Math.max(2, Math.floor((bounds.bottom - bounds.top) / (pitch * 0.866)) + 1);
        const pitchY = (bounds.bottom - bounds.top) / (rows - 1);

        particles = [];
        steam = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const hx = bounds.left + col * pitchX + (row % 2 ? pitchX / 2 : 0);
                const hy = bounds.bottom - row * pitchY;
                const heightFrac = (hy - tank.y) / tank.h; // 0 = top of the tank, 1 = bottom
                particles.push({
                    hx, hy, x: hx, y: hy, vx: 0, vy: 0, jx: 0, jy: 0,
                    mode: MODE_SOLID,
                    escaped: false,
                    fade: 1,
                    // The bottom (closest to the flame) lets go first
                    meltAt: MELT_FROM + (MELT_TO - MELT_FROM) * (0.6 * Math.random() + 0.4 * (1 - heightFrac)),
                    shade: Math.floor(Math.random() * SHADE_LIGHTNESS.length)
                });
            }
        }

        grid.cell = cohesionD;
        grid.w = Math.ceil(W / grid.cell) + 2;
        grid.h = Math.ceil(H / grid.cell) + 2;
        grid.head = new Int32Array(grid.w * grid.h);
        grid.next = new Int32Array(particles.length);
    }

    function escape(p) {
        p.escaped = true;
        steam.push({ x: p.x, y: p.y, vx: p.vx * 0.2 + (Math.random() - 0.5) * 0.6, vy: -(1.2 + Math.random() * 1.2), life: 1 });
    }

    // Marbles that are close push each other apart; melted ones that are a bit further pull
    // gently together, which is what keeps the liquid in one blob. Solid marbles never move.
    function collide(a, b, k) {
        const dx = b.x - a.x, dy = b.y - a.y;
        const d2 = dx * dx + dy * dy;
        if (d2 >= cohesionD * cohesionD || d2 < 1e-6) return;
        const aStatic = a.mode === MODE_SOLID, bStatic = b.mode === MODE_SOLID;
        if (aStatic && bStatic) return;
        const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
        const wa = aStatic ? 0 : 1, wb = bStatic ? 0 : 1, ws = wa + wb;
        if (d < minD) {
            const push = (minD - d) * 0.6 * k;
            a.x -= nx * push * wa / ws; a.y -= ny * push * wa / ws;
            b.x += nx * push * wb / ws; b.y += ny * push * wb / ws;
        } else {
            const pull = 0.03 * k * (1 - (d - minD) / (cohesionD - minD));
            a.vx += nx * pull * wa; a.vy += ny * pull * wa;
            b.vx -= nx * pull * wb; b.vy -= ny * pull * wb;
        }
    }

    function resolveCollisions(k) {
        const { cell, w, h, head, next } = grid;
        head.fill(-1);
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (p.escaped || p.mode === MODE_FREEZING) continue; // freezing marbles slip through
            const c = Math.floor(p.y / cell) * w + Math.floor(p.x / cell);
            next[i] = head[c];
            head[c] = i;
            p.sx = p.x;
            p.sy = p.y;
        }
        for (let pass = 0; pass < 4; pass++) {
            for (let cy = 0; cy < h - 1; cy++) {
                for (let cx = 0; cx < w - 1; cx++) {
                    const c = cy * w + cx;
                    for (let i = head[c]; i !== -1; i = next[i]) {
                        const a = particles[i];
                        for (let j = next[i]; j !== -1; j = next[j]) collide(a, particles[j], k);
                        const neighbours = [c + 1, c + w - 1, c + w, c + w + 1];
                        for (let n = 0; n < 4; n++) {
                            for (let j = head[neighbours[n]]; j !== -1; j = next[j]) collide(a, particles[j], k);
                        }
                    }
                }
            }
        }
        // Whatever the pushing moved a marble is also how its velocity changes. This is what
        // stops gravity from piling up speed in marbles that are resting on the ones below.
        for (const p of particles) {
            if (p.escaped || p.mode !== MODE_FREE) continue;
            p.vx += p.x - p.sx;
            p.vy += p.y - p.sy;
        }
    }

    function step(t) {
        const jitter = 0.5 + 4.5 * Math.pow(Math.min(t, MELT_TO) / MELT_FROM, 2.2);
        const boil = smoothstep((t - BOIL_FROM) / (BOIL_TO - BOIL_FROM));
        const u = Math.min(1, Math.max(0, (t - 62) / 38));
        const gasSpeed = 1.3 + 2.7 * u + 7 * u * u * u; // gets dramatically faster near the top of the slider
        const gravity = 0.42 * (1 - boil);
        const kick = (0.9 + Math.max(0, t - MELT_TO) * 0.05) * (1 - boil);
        const restitution = 0.25 + 0.75 * boil;
        const damping = 0.965 + 0.035 * boil;
        const speedCap = r * 0.8;
        const refill = t < 52;
        let anyFree = false;

        for (const p of particles) {
            if (p.escaped) {
                // Once it cools down the steam condenses and drips back in through the hole
                if (!(refill && Math.random() < 0.02)) continue;
                p.escaped = false;
                p.x = (hole.x0 + hole.x1) / 2 + (Math.random() - 0.5) * (hole.x1 - hole.x0) * 0.6;
                p.y = tank.y - r * 1.5;
                p.vx = 0;
                p.vy = 2;
                p.mode = MODE_FREE;
                p.fade = 0;
            }
            p.fade = Math.min(1, p.fade + 0.05);

            if (t < p.meltAt) {
                if (p.mode === MODE_SOLID) {
                    // Vibrating in place: small at the coldest, growing with the temperature
                    p.jx = p.jx * 0.6 + (Math.random() - 0.5) * jitter * 0.9;
                    p.jy = p.jy * 0.6 + (Math.random() - 0.5) * jitter * 0.9;
                    p.x = p.hx + p.jx;
                    p.y = p.hy + p.jy;
                } else {
                    // Freezing: glide back to its spot in the lattice
                    p.mode = MODE_FREEZING;
                    p.x += (p.hx - p.x) * 0.2;
                    p.y += (p.hy - p.y) * 0.2;
                    if (Math.abs(p.hx - p.x) < 1.2 && Math.abs(p.hy - p.y) < 1.2) {
                        p.mode = MODE_SOLID;
                        p.vx = p.vy = 0;
                        p.jx = p.x - p.hx;
                        p.jy = p.y - p.hy;
                    }
                }
                continue;
            }

            if (p.mode !== MODE_FREE) { p.mode = MODE_FREE; p.vx = 0; p.vy = 0; }
            anyFree = true;

            p.vx += (Math.random() - 0.5) * kick;
            p.vy += (Math.random() - 0.5) * kick + gravity;
            if (boil > 0) {
                p.vx += (Math.random() - 0.5) * 0.15 * boil;
                p.vy += (Math.random() - 0.5) * 0.15 * boil;
                let speed = Math.hypot(p.vx, p.vy);
                if (speed < 0.01) {
                    const angle = Math.random() * Math.PI * 2;
                    p.vx = Math.cos(angle) * 0.5;
                    p.vy = Math.sin(angle) * 0.5;
                    speed = 0.5;
                }
                const scale = 1 + ((gasSpeed * boil - speed) / speed) * 0.06 * boil;
                p.vx *= scale;
                p.vy *= scale;
            }
            p.vx *= damping;
            p.vy *= damping;
            if (boil < 0.9) {
                const speed = Math.hypot(p.vx, p.vy);
                if (speed > speedCap) { p.vx *= speedCap / speed; p.vy *= speedCap / speed; }
            }
            p.x += p.vx;
            p.y += p.vy;
        }

        if (anyFree && boil < 0.95) resolveCollisions(1 - boil);

        for (const p of particles) {
            if (p.escaped || p.mode !== MODE_FREE) continue;
            if (p.x < bounds.left) { p.x = bounds.left; p.vx = Math.abs(p.vx) * restitution; }
            else if (p.x > bounds.right) { p.x = bounds.right; p.vx = -Math.abs(p.vx) * restitution; }
            if (p.y > bounds.bottom) { p.y = bounds.bottom; p.vy = -Math.abs(p.vy) * restitution; p.vx *= 0.98; }
            if (p.y < bounds.top) {
                const inHole = p.x > hole.x0 + r * 0.5 && p.x < hole.x1 - r * 0.5;
                if (!inHole) { p.y = bounds.top; p.vy = Math.abs(p.vy) * restitution; }
                else if (p.y < tank.y - r) escape(p);
            }
        }

        for (let i = steam.length - 1; i >= 0; i--) {
            const s = steam[i];
            s.x += s.vx;
            s.y += s.vy;
            s.life -= 0.014;
            if (s.life <= 0 || s.y < -r) steam.splice(i, 1);
        }
    }

    function tankPath() {
        const { x, y, w, h } = tank, rad = 12;
        ctx.beginPath();
        ctx.moveTo(x + rad, y);
        ctx.arcTo(x + w, y, x + w, y + h, rad);
        ctx.arcTo(x + w, y + h, x, y + h, rad);
        ctx.arcTo(x, y + h, x, y, rad);
        ctx.arcTo(x, y, x + w, y, rad);
        ctx.closePath();
    }

    function drawTongue(xc, base, w, height, sway, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(xc - w / 2, base);
        ctx.bezierCurveTo(xc - w / 2, base - height * 0.45, xc - w * 0.15 + sway * 0.5, base - height * 0.7, xc + sway, base - height);
        ctx.bezierCurveTo(xc + w * 0.15 + sway * 0.5, base - height * 0.7, xc + w / 2, base - height * 0.45, xc + w / 2, base);
        ctx.closePath();
        ctx.fill();
    }

    function drawFlame(heat) {
        const cx = tank.x + tank.w / 2;
        const burnerW = tank.w * 0.36;
        const base = H - 10;                 // top of the burner
        const maxHeight = flameRoom - 12;    // the tallest flame just tucks under the tank

        const glow = ctx.createRadialGradient(cx, tank.y + tank.h, 0, cx, tank.y + tank.h, tank.w * 0.55);
        glow.addColorStop(0, `rgba(255, 140, 40, ${0.05 + heat * 0.35})`);
        glow.addColorStop(1, 'rgba(255, 140, 40, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, tank.y + tank.h - tank.w * 0.3, W, tank.w * 0.55);

        const flameHeight = 8 + heat * (maxHeight - 8);
        const spread = burnerW * (0.5 + 0.5 * heat);
        const tongues = 5;
        const layers = [
            { s: 1, color: 'rgba(239, 68, 68, 0.92)' },
            { s: 0.72, color: 'rgba(251, 146, 60, 0.95)' },
            { s: 0.45, color: 'rgba(253, 224, 71, 0.97)' }
        ];
        for (let i = 0; i < tongues; i++) {
            const k = i - (tongues - 1) / 2;
            const xc = cx + k * spread / (tongues - 1);
            const flicker = 0.88 + 0.12 * Math.sin(flameTime * 0.35 + i * 1.9) + 0.06 * Math.sin(flameTime * 0.83 + i * 3.7);
            const height = flameHeight * (1 - Math.abs(k) * 0.16) * flicker;
            const width = (spread / (tongues - 1)) * (1.5 + heat * 0.6);
            const sway = Math.sin(flameTime * 0.21 + i * 2.3) * width * 0.18;
            for (const layer of layers) drawTongue(xc, base, width * layer.s, height * layer.s, sway * layer.s, layer.color);
            drawTongue(xc, base, width * 0.4, Math.min(height * 0.25, 10), 0, 'rgba(96, 165, 250, 0.9)');
        }

        ctx.fillStyle = '#4b5563';
        ctx.beginPath();
        ctx.moveTo(cx - burnerW / 2 + 4, base);
        ctx.lineTo(cx + burnerW / 2 - 4, base);
        ctx.lineTo(cx + burnerW / 2, base + 8);
        ctx.lineTo(cx - burnerW / 2, base + 8);
        ctx.closePath();
        ctx.fill();
    }

    function drawTank(heat) {
        tankPath();
        const glass = ctx.createLinearGradient(0, tank.y, 0, tank.y + tank.h);
        glass.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
        glass.addColorStop(1, 'rgba(255, 255, 255, 0.06)');
        ctx.fillStyle = glass;
        ctx.fill();
        const tint = ctx.createLinearGradient(0, tank.y, 0, tank.y + tank.h);
        tint.addColorStop(0.55, 'rgba(255, 140, 40, 0)');
        tint.addColorStop(1, `rgba(255, 140, 40, ${heat * 0.3})`);
        ctx.fillStyle = tint;
        ctx.fill();
    }

    function drawWalls() {
        const { x, y, w, h } = tank, rad = 12;
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.moveTo(hole.x1, y);
        ctx.lineTo(x + w - rad, y);
        ctx.arcTo(x + w, y, x + w, y + rad, rad);
        ctx.lineTo(x + w, y + h - rad);
        ctx.arcTo(x + w, y + h, x + w - rad, y + h, rad);
        ctx.lineTo(x + rad, y + h);
        ctx.arcTo(x, y + h, x, y + h - rad, rad);
        ctx.lineTo(x, y + rad);
        ctx.arcTo(x, y, x + rad, y, rad);
        ctx.lineTo(hole.x0, y);
        ctx.stroke();
    }

    function drawParticles() {
        for (const p of particles) {
            if (p.escaped) continue;
            if (p.fade < 1) ctx.globalAlpha = p.fade; // marbles dripping back in through the hole fade in
            drawMarble(ctx, sprites[p.shade], p.x, p.y, r);
            if (p.fade < 1) ctx.globalAlpha = 1;
        }
    }

    function drawSteam() {
        ctx.fillStyle = 'rgb(226, 240, 255)';
        for (const s of steam) {
            ctx.globalAlpha = s.life * 0.7;
            ctx.beginPath();
            ctx.arc(s.x, s.y, r * (1 + (1 - s.life) * 0.8), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    function updateExplanation(t) {
        let key, text;
        if (t < MELT_FROM) { key = 'solid'; text = '🧊 זהו מצב מוצק! (קרח)'; }
        else if (t < MELT_TO) { key = 'melting'; text = '🫨 הרעידות מתגברות והקרח מתחיל להימס!'; }
        else if (t < 62) { key = 'liquid'; text = '💧 הקרח נמס! זהו מצב נוזל. (מים)'; }
        else { key = 'gas'; text = '♨️ המים רותחים! זהו מצב גז. (אדים)'; }
        if (key === lastState) return;
        lastState = key;
        explanation.textContent = text;
        explanation.className = `state-chip state-${key}`;
    }

    setup();
    let last = performance.now();
    let accumulator = 0;

    function frame(now) {
        accumulator += Math.min(now - last, 100);
        last = now;
        flameTime = now / STEP_MS;
        const t = parseFloat(slider.value);

        let steps = 0;
        while (accumulator >= STEP_MS && steps < 4) {
            step(t);
            accumulator -= STEP_MS;
            steps++;
        }
        if (steps === 4) accumulator = 0;

        ctx.clearRect(0, 0, W, H);
        drawFlame(t / 100);
        drawTank(t / 100);
        drawParticles();
        drawSteam();
        drawWalls();
        updateExplanation(t);

    }
    page.frame(frame);
}
