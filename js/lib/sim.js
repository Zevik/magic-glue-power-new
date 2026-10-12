// Small particle simulations shared by the canvas pages.

// Marbles that fly in straight lines and bounce off the walls and off each other, like a gas.
// Speed is "temperature": scale it any time with step(speedScale).
export function createGas({ W, H, r, count, speed = 2, onCollide = null }) {
    const p = [];
    for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = speed * (0.5 + Math.random());
        p.push({ x: r + Math.random() * (W - 2 * r), y: r + Math.random() * (H - 2 * r), vx: Math.cos(a) * s, vy: Math.sin(a) * s, heat: 0 });
    }

    function step(scale = 1) {
        const minD = r * 2;
        for (const a of p) {
            a.x += a.vx * scale;
            a.y += a.vy * scale;
            if (a.x < r) { a.x = r; a.vx = Math.abs(a.vx); }
            else if (a.x > W - r) { a.x = W - r; a.vx = -Math.abs(a.vx); }
            if (a.y < r) { a.y = r; a.vy = Math.abs(a.vy); }
            else if (a.y > H - r) { a.y = H - r; a.vy = -Math.abs(a.vy); }
            a.heat *= 0.9;
        }
        for (let i = 0; i < p.length; i++) {
            const a = p[i];
            for (let j = i + 1; j < p.length; j++) {
                const b = p[j];
                const dx = b.x - a.x, dy = b.y - a.y;
                const d2 = dx * dx + dy * dy;
                if (d2 >= minD * minD || d2 < 1e-9) continue;
                const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
                // push apart, then exchange the speed along the line between them (equal masses)
                const overlap = (minD - d) / 2;
                a.x -= nx * overlap; a.y -= ny * overlap;
                b.x += nx * overlap; b.y += ny * overlap;
                const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
                if (rel < 0) {
                    a.vx += rel * nx; a.vy += rel * ny;
                    b.vx -= rel * nx; b.vy -= rel * ny;
                    const impact = -rel;
                    a.heat = Math.min(1, a.heat + impact * 0.3);
                    b.heat = Math.min(1, b.heat + impact * 0.3);
                    if (onCollide && impact > 0.8) onCollide(a, b, impact);
                }
            }
        }
    }
    return { p, step };
}

// Marbles that jostle, push each other apart and pull gently together when close:
// a liquid blob. `heat` controls how hard they get kicked around; gravity is optional.
export function createLiquid({ x0, x1, y0, y1, r, count, gravity = 0 }) {
    const p = [];
    const w = x1 - x0;
    const cols = Math.max(2, Math.floor(w / (r * 2.1)));
    for (let i = 0; i < count; i++) {
        const row = Math.floor(i / cols), col = i % cols;
        p.push({
            x: x0 + r + (col + (row % 2) * 0.5) * (w - 2 * r) / cols + (Math.random() - 0.5) * 2,
            y: y1 - r - row * r * 1.85,
            vx: 0, vy: 0
        });
    }
    const minD = r * 1.9, cohD = r * 2.8;

    function step(heat = 0.22) {
        for (const a of p) {
            a.vx += (Math.random() - 0.5) * heat;
            a.vy += (Math.random() - 0.5) * heat + gravity;
        }
        for (let i = 0; i < p.length; i++) {
            const a = p[i];
            for (let j = i + 1; j < p.length; j++) {
                const b = p[j];
                const dx = b.x - a.x, dy = b.y - a.y;
                const d2 = dx * dx + dy * dy;
                if (d2 > cohD * cohD || d2 < 1e-6) continue;
                const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
                if (d < minD) {
                    const push = (minD - d) * 0.25;
                    a.x -= nx * push; a.y -= ny * push;
                    b.x += nx * push; b.y += ny * push;
                } else {
                    const pull = 0.02 * (1 - (d - minD) / (cohD - minD));
                    a.vx += nx * pull; a.vy += ny * pull;
                    b.vx -= nx * pull; b.vy -= ny * pull;
                }
            }
        }
        for (const a of p) {
            a.vx *= 0.92; a.vy *= 0.92;
            a.x += a.vx; a.y += a.vy;
            if (a.x < x0 + r) { a.x = x0 + r; a.vx *= -0.4; }
            if (a.x > x1 - r) { a.x = x1 - r; a.vx *= -0.4; }
            if (a.y > y1 - r) { a.y = y1 - r; a.vy *= -0.3; }
            if (a.y < y0 + r) { a.y = y0 + r; a.vy *= -0.3; }
        }
    }
    return { p, step };
}
