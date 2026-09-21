// Glossy glass marbles for the canvases. Each look is drawn once on a tiny canvas and then
// stamped with drawImage, which is far cheaper than a gradient per marble per frame.

const cache = new Map();

// Returns a canvas that is (2 * radius * dpr) pixels wide. Draw it 2 * radius CSS pixels wide.
export function marbleSprite(hue, saturation, lightness, radius, dpr = 1) {
    const key = `${hue}|${saturation}|${lightness}|${radius}|${dpr}`;
    if (cache.has(key)) return cache.get(key);

    const size = Math.max(2, Math.round(radius * 2 * dpr));
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const g = canvas.getContext('2d');
    const c = size / 2;
    const r = c - 1;

    const body = g.createRadialGradient(c - r * 0.35, c - r * 0.4, r * 0.1, c, c, r);
    body.addColorStop(0, `hsl(${hue}, ${saturation}%, ${Math.min(96, lightness + 28)}%)`);
    body.addColorStop(0.5, `hsl(${hue}, ${saturation}%, ${lightness}%)`);
    body.addColorStop(1, `hsl(${hue}, ${saturation}%, ${Math.max(8, lightness - 22)}%)`);
    g.fillStyle = body;
    g.beginPath();
    g.arc(c, c, r, 0, Math.PI * 2);
    g.fill();

    // thin glassy rim
    g.lineWidth = Math.max(1, dpr);
    g.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    g.stroke();

    // the little shine
    g.fillStyle = 'rgba(255, 255, 255, 0.85)';
    g.beginPath();
    g.ellipse(c - r * 0.38, c - r * 0.44, r * 0.24, r * 0.15, -0.6, 0, Math.PI * 2);
    g.fill();

    cache.set(key, canvas);
    return canvas;
}

export function drawMarble(ctx, sprite, x, y, radius) {
    ctx.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
}
