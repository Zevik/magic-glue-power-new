// Pointer position relative to a container, for both mouse and touch events.
export function pointerIn(container, e) {
    const rect = container.getBoundingClientRect();
    const point = (e.touches && e.touches[0]) || e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
}

// Mouse and touch dragging that starts on the container but keeps tracking outside of it.
export function bindDrag(page, container, { onStart, onMove, onEnd }) {
    const { signal } = page;
    let dragging = false;
    const start = e => {
        dragging = true;
        container.classList.add('cursor-grabbing');
        if (e.type === 'mousedown') e.preventDefault(); // no text selection while dragging
        onStart(pointerIn(container, e));
    };
    const move = e => {
        if (!dragging) return;
        e.preventDefault();
        onMove(pointerIn(container, e));
    };
    const end = () => {
        if (!dragging) return;
        dragging = false;
        container.classList.remove('cursor-grabbing');
        onEnd();
    };
    container.addEventListener('mousedown', start, { signal });
    container.addEventListener('touchstart', start, { signal, passive: true });
    window.addEventListener('mousemove', move, { signal });
    window.addEventListener('touchmove', move, { signal, passive: false });
    window.addEventListener('mouseup', end, { signal });
    window.addEventListener('touchend', end, { signal });
    window.addEventListener('touchcancel', end, { signal });
}

// Physics at a fixed 60Hz on any display; render runs on every frame.
export function fixedStepLoop(page, update, render) {
    const STEP_MS = 1000 / 60;
    let last = performance.now();
    let accumulator = 0;
    return page.frame(now => {
        accumulator += Math.min(now - last, 100);
        last = now;
        let steps = 0;
        while (accumulator >= STEP_MS && steps < 4) {
            update();
            accumulator -= STEP_MS;
            steps++;
        }
        if (steps === 4) accumulator = 0;
        render();
    });
}
