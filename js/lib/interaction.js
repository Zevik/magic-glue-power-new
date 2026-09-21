// Pointer position relative to a container, for both mouse and touch events.
export function pointerIn(container, e) {
    const rect = container.getBoundingClientRect();
    const point = (e.touches && e.touches[0]) || e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
}

// Mouse and touch dragging that can only start on the given handles (by default the whole
// container), but keeps tracking wherever the pointer goes. Keep handles small: touching
// anywhere else on the page has to stay a normal scroll.
export function bindDrag(page, container, { onStart, onMove, onEnd }, handles = [container]) {
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
    handles.forEach(handle => {
        handle.addEventListener('mousedown', start, { signal });
        handle.addEventListener('touchstart', start, { signal, passive: true });
    });
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
