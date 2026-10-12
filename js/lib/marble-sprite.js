// Glossy glass marbles for the canvases. Each look is drawn once on a tiny canvas and then
// stamped with drawImage, which is far cheaper than a gradient per marble per frame.
// The look: a deep body, light bending through the glass (a bright lower rim), a crisp window
// reflection on top and a soft contact shadow so marbles feel like they sit in the scene.

const cache = new Map();
const dprNow = () => Math.min(window.devicePixelRatio || 1, 2);

// Returns a canvas that is (2 * radius * dpr) pixels wide. Draw it 2 * radius CSS pixels wide.
// dpr defaults to the screen's, so callers on a sharp canvas do not need to pass it.
export function marbleSprite(hue, saturation, lightness, radius, dpr = dprNow()) {
    const key = `${hue}|${saturation}|${lightness}|${radius}|${dpr}`;
    if (cache.has(key)) return cache.get(key);

    const size = Math.max(4, Math.round(radius * 2 * dpr));
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const g = canvas.getContext('2d');
    const c = size / 2;
    const r = c - Math.max(1, dpr);
    const hsl = (h, s, l, a = 1) => `hsla(${h}, ${s}%, ${l}%, ${a})`;

    // body: dark at the edge, glowing toward the lit side
    const body = g.createRadialGradient(c - r * 0.3, c - r * 0.35, r * 0.05, c, c, r);
    body.addColorStop(0, hsl(hue, saturation, Math.min(94, lightness + 30)));
    body.addColorStop(0.45, hsl(hue, saturation, lightness));
    body.addColorStop(1, hsl((hue + 12) % 360, Math.min(100, saturation + 6), Math.max(6, lightness - 30)));
    g.fillStyle = body;
    g.beginPath();
    g.arc(c, c, r, 0, Math.PI * 2);
    g.fill();

    // light that passed through the glass and pools in the lower right
    const caustic = g.createRadialGradient(c + r * 0.38, c + r * 0.46, 0, c + r * 0.38, c + r * 0.46, r * 0.8);
    caustic.addColorStop(0, hsl((hue + 20) % 360, 100, Math.min(88, lightness + 34), 0.55));
    caustic.addColorStop(1, hsl(hue, 100, lightness, 0));
    g.save();
    g.beginPath();
    g.arc(c, c, r, 0, Math.PI * 2);
    g.clip();
    g.fillStyle = caustic;
    g.fillRect(0, 0, size, size);

    // rim: a thin bright edge, brighter toward the bottom
    const rim = g.createLinearGradient(0, c - r, 0, c + r);
    rim.addColorStop(0, 'rgba(255,255,255,0.25)');
    rim.addColorStop(1, 'rgba(255,255,255,0.65)');
    g.strokeStyle = rim;
    g.lineWidth = Math.max(1, r * 0.07);
    g.beginPath();
    g.arc(c, c, r - g.lineWidth / 2, 0, Math.PI * 2);
    g.stroke();
    g.restore();

    // window reflection and a pinpoint glint
    g.fillStyle = 'rgba(255,255,255,0.8)';
    g.beginPath();
    g.ellipse(c - r * 0.36, c - r * 0.44, r * 0.27, r * 0.15, -0.65, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.95)';
    g.beginPath();
    g.arc(c + r * 0.3, c + r * 0.34, r * 0.07, 0, Math.PI * 2);
    g.fill();

    cache.set(key, canvas);
    return canvas;
}

export function drawMarble(ctx, sprite, x, y, radius) {
    ctx.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
}

// A soft shadow on the "floor" under a marble. Cheap: one gradient reused through a sprite.
let shadowSprite = null;
export function drawShadow(ctx, x, y, radius, alpha = 0.35) {
    if (!shadowSprite) {
        shadowSprite = document.createElement('canvas');
        shadowSprite.width = shadowSprite.height = 64;
        const g = shadowSprite.getContext('2d');
        const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(0,0,0,0.9)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grad;
        g.fillRect(0, 0, 64, 64);
    }
    ctx.globalAlpha = alpha;
    ctx.drawImage(shadowSprite, x - radius * 1.3, y - radius * 0.45, radius * 2.6, radius * 0.9);
    ctx.globalAlpha = 1;
}

// A soft coloured glow behind a marble, for "hot" or "energised" looks
const glowCache = new Map();
export function drawGlow(ctx, x, y, radius, hue, alpha = 0.5) {
    const key = hue;
    let sprite = glowCache.get(key);
    if (!sprite) {
        sprite = document.createElement('canvas');
        sprite.width = sprite.height = 64;
        const g = sprite.getContext('2d');
        const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, `hsla(${hue}, 100%, 65%, 0.9)`);
        grad.addColorStop(1, `hsla(${hue}, 100%, 55%, 0)`);
        g.fillStyle = grad;
        g.fillRect(0, 0, 64, 64);
        glowCache.set(key, sprite);
    }
    const prev = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = alpha;
    ctx.drawImage(sprite, x - radius * 2.4, y - radius * 2.4, radius * 4.8, radius * 4.8);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = prev;
}
