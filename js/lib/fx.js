// Sparks, rings and confetti on a transparent canvas above the whole page.
// It only runs while there is something to draw.

import { TAU, rand } from './canvas.js';

let canvas, ctx, W, H, dpr;
let parts = [];
let rings = [];
let raf = 0;

function ensure() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'fx-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
}

function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function run() {
    if (!raf) raf = requestAnimationFrame(tick);
}

function tick() {
    raf = 0;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    for (const r of rings) {
        r.life -= r.decay;
        r.radius += (r.max - r.radius) * 0.12;
        if (r.life <= 0) continue;
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = r.life * 0.8;
        ctx.lineWidth = 1 + 4 * r.life;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, TAU);
        ctx.stroke();
    }
    rings = rings.filter(r => r.life > 0);

    for (const p of parts) {
        p.vy += p.gravity;
        p.vx *= p.drag; p.vy *= p.drag;
        p.x += p.vx; p.y += p.vy;
        p.rot += p.spin;
        p.life -= p.decay;
        if (p.life <= 0) continue;
        ctx.globalAlpha = Math.min(1, p.life * 1.6);
        ctx.fillStyle = p.color;
        if (p.kind === 'paper') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.scale(1, Math.abs(Math.cos(p.rot * 1.7)) * 0.9 + 0.1);
            ctx.fillRect(-p.size, -p.size * 0.6, p.size * 2, p.size * 1.2);
            ctx.restore();
            ctx.globalCompositeOperation = 'lighter';
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (0.4 + 0.6 * p.life), 0, TAU);
            ctx.fill();
        }
    }
    parts = parts.filter(p => p.life > 0 && p.y < H + 40);

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    if (parts.length || rings.length) run();
    else ctx.clearRect(0, 0, W, H);
}

const SPARK_COLORS = ['#fff7c2', '#ffd23f', '#ffffff', '#ffb4e6', '#9be7ff'];

// A little fountain of light at a viewport position
export function burst(x, y, { count = 18, color = null, speed = 5, size = 3 } = {}) {
    ensure();
    for (let i = 0; i < count; i++) {
        const a = Math.random() * TAU;
        const s = rand(0.4, 1) * speed;
        parts.push({
            kind: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1,
            gravity: 0.08, drag: 0.96, life: 1, decay: rand(0.016, 0.03),
            size: rand(size * 0.6, size * 1.4), rot: 0, spin: 0,
            color: color || SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0]
        });
    }
    run();
}

export function ring(x, y, { color = 'rgba(255,255,255,0.9)', max = 90 } = {}) {
    ensure();
    rings.push({ x, y, radius: 4, max, life: 1, decay: 0.03, color });
    run();
}

// Burst from the middle of an element
export function burstAt(el, opts) {
    const b = el.getBoundingClientRect();
    burst(b.left + b.width / 2, b.top + b.height / 2, opts);
}

const CONFETTI = ['#ffd23f', '#ff6b9d', '#5eead4', '#a78bfa', '#60a5fa', '#fb923c', '#ffffff'];

export function confetti({ count = 140, x = null } = {}) {
    ensure();
    for (let i = 0; i < count; i++) {
        const fromLeft = i % 2 === 0;
        const originX = x ?? (fromLeft ? -10 : W + 10);
        const dir = x !== null ? (Math.random() - 0.5) * 2 : (fromLeft ? 1 : -1);
        parts.push({
            kind: 'paper', x: originX, y: H * rand(0.35, 0.75),
            vx: dir * rand(4, 12), vy: rand(-14, -4),
            gravity: 0.22, drag: 0.985, life: 1, decay: rand(0.003, 0.006),
            size: rand(4, 8), rot: Math.random() * TAU, spin: rand(-0.25, 0.25),
            color: CONFETTI[(Math.random() * CONFETTI.length) | 0]
        });
    }
    run();
}
