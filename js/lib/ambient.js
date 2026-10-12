// The living background. One canvas behind the whole app paints each page's colour world
// (two gradient colours plus a glow) and floats light dust through it. When the page changes,
// the colours slide to the new world, so moving through the journey feels like one continuous place.

import { TAU } from './canvas.js';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

const hexToRgb = hex => {
    const h = hex.trim().replace('#', '');
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const n = parseInt(full, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export function startAmbient(canvas) {
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, dpr = 1;
    const cur = { c1: [20, 10, 58], c2: [76, 29, 149], glow: [192, 132, 252] };
    const target = { c1: [20, 10, 58], c2: [76, 29, 149], glow: [192, 132, 252] };
    const pointer = { x: 0.5, y: 0.5, sx: 0.5, sy: 0.5 };

    const motes = Array.from({ length: 70 }, () => ({
        x: Math.random(), y: Math.random(),
        z: 0.25 + Math.random() * 0.75,
        r: 0.6 + Math.random() * 2.2,
        phase: Math.random() * TAU,
        speed: 0.004 + Math.random() * 0.012
    }));

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('pointermove', e => {
        pointer.x = e.clientX / Math.max(1, W);
        pointer.y = e.clientY / Math.max(1, H);
    }, { passive: true });

    const rgb = c => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
    const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

    function draw(time) {
        for (const key of ['c1', 'c2', 'glow']) {
            for (let i = 0; i < 3; i++) cur[key][i] += (target[key][i] - cur[key][i]) * 0.045;
        }
        pointer.sx += (pointer.x - pointer.sx) * 0.04;
        pointer.sy += (pointer.y - pointer.sy) * 0.04;

        const g = ctx.createLinearGradient(0, 0, W * 0.6, H);
        g.addColorStop(0, rgb(cur.c1));
        g.addColorStop(1, rgb(cur.c2));
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        // two big slow lights that follow the pointer a little
        const t = time / 1000;
        const size = Math.max(W, H) * 0.8;
        const blobs = [
            { x: W * (0.15 + 0.1 * Math.sin(t * 0.13)) + (pointer.sx - 0.5) * 80, y: H * (0.1 + 0.08 * Math.cos(t * 0.11)) + (pointer.sy - 0.5) * 60, a: 0.34 },
            { x: W * (0.88 + 0.07 * Math.cos(t * 0.1)) - (pointer.sx - 0.5) * 60, y: H * (0.95 + 0.06 * Math.sin(t * 0.12)) - (pointer.sy - 0.5) * 50, a: 0.24 }
        ];
        ctx.globalCompositeOperation = 'lighter';
        for (const b of blobs) {
            const rg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, size * 0.6);
            rg.addColorStop(0, rgba(cur.glow, b.a));
            rg.addColorStop(1, rgba(cur.glow, 0));
            ctx.fillStyle = rg;
            ctx.fillRect(0, 0, W, H);
        }

        // dust: closer motes (bigger z) drift more and shift more with the pointer
        for (const m of motes) {
            m.y -= m.speed * 0.01 * (0.4 + m.z);
            m.x += Math.sin(t * 0.3 + m.phase) * 0.00012;
            if (m.y < -0.02) { m.y = 1.02; m.x = Math.random(); }
            const px = m.x * W + (pointer.sx - 0.5) * 40 * m.z;
            const py = m.y * H + (pointer.sy - 0.5) * 30 * m.z;
            const twinkle = 0.45 + 0.55 * Math.sin(t * (0.8 + m.z) + m.phase);
            ctx.fillStyle = `rgba(255,255,255,${(0.1 + 0.4 * m.z) * twinkle})`;
            ctx.beginPath();
            ctx.arc(px, py, m.r * m.z * 1.3, 0, TAU);
            ctx.fill();
        }

        // soft vignette keeps the eye on the middle
        ctx.globalCompositeOperation = 'source-over';
        const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.8);
        v.addColorStop(0, 'rgba(0,0,0,0)');
        v.addColorStop(1, 'rgba(0,0,0,0.38)');
        ctx.fillStyle = v;
        ctx.fillRect(0, 0, W, H);
    }

    let raf = 0;
    function loop(now) {
        draw(now);
        raf = requestAnimationFrame(loop);
    }
    if (reduce.matches) {
        draw(0);
    } else {
        raf = requestAnimationFrame(loop);
    }

    return {
        // Takes the three colours of a page's theme, as CSS hex strings
        setTheme({ c1, c2, glow }) {
            target.c1 = hexToRgb(c1);
            target.c2 = hexToRgb(c2);
            target.glow = hexToRgb(glow);
            if (reduce.matches) {
                cur.c1 = [...target.c1]; cur.c2 = [...target.c2]; cur.glow = [...target.glow];
                draw(0);
            }
        },
        stop() { cancelAnimationFrame(raf); }
    };
}
