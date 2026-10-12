// Crisp canvases on every screen: the backing store is sized in device pixels, drawing code
// keeps using CSS pixels.
export function fitCanvas(canvas, maxDpr = 2) {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, W, H, dpr };
}

export const currentDpr = (max = 2) => Math.min(window.devicePixelRatio || 1, max);

export const rand = (min, max) => min + Math.random() * (max - min);
export const lerp = (a, b, t) => a + (b - a) * t;
export const TAU = Math.PI * 2;

// Pointer position inside a canvas (CSS pixels), for mouse, touch and pen.
export function canvasPoint(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    const p = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return { x: p.clientX - rect.left, y: p.clientY - rect.top };
}

// Dragging on a canvas where only some spots are grabbable. The page keeps scrolling normally
// unless the touch started on a handle (hit() returns true).
export function bindCanvasDrag(page, canvas, { hit, onStart, onMove, onEnd }) {
    const { signal } = page;
    let dragging = false;

    const start = e => {
        const p = canvasPoint(canvas, e);
        if (!hit(p)) return;
        dragging = true;
        canvas.classList.add('cursor-grabbing');
        if (e.type === 'mousedown') e.preventDefault();
        onStart(p);
    };
    const move = e => {
        if (!dragging) return;
        if (e.cancelable) e.preventDefault();
        onMove(canvasPoint(canvas, e));
    };
    const end = () => {
        if (!dragging) return;
        dragging = false;
        canvas.classList.remove('cursor-grabbing');
        onEnd();
    };
    canvas.addEventListener('mousedown', start, { signal });
    canvas.addEventListener('touchstart', start, { signal, passive: true });
    window.addEventListener('mousemove', move, { signal });
    window.addEventListener('touchmove', move, { signal, passive: false });
    window.addEventListener('mouseup', end, { signal });
    window.addEventListener('touchend', end, { signal });
    window.addEventListener('touchcancel', end, { signal });

    // Show the grab cursor only over a handle
    canvas.addEventListener('mousemove', e => {
        if (!dragging) canvas.style.cursor = hit(canvasPoint(canvas, e)) ? 'grab' : '';
    }, { signal });
}

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
