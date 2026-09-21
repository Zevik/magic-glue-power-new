// Everything a page starts (animation frames, timers, listeners) hangs off its context,
// so leaving the page cleans all of it up in one call.
export function createPageContext(root) {
    const controller = new AbortController();
    const stops = new Set();
    let alive = true;

    return {
        root,
        signal: controller.signal, // pass as { signal } to addEventListener
        get active() { return alive; },

        // Calls callback(now) on every animation frame until the page is left or stop() is called.
        frame(callback) {
            let id = 0;
            let stopped = false;
            const stop = () => {
                stopped = true;
                cancelAnimationFrame(id);
                stops.delete(stop);
            };
            const tick = now => {
                if (!alive || stopped) return;
                callback(now);
                if (alive && !stopped) id = requestAnimationFrame(tick);
            };
            id = requestAnimationFrame(tick);
            stops.add(stop);
            return stop;
        },

        timeout(callback, ms) {
            const cancel = () => clearTimeout(id);
            const id = setTimeout(() => {
                stops.delete(cancel);
                callback();
            }, ms);
            stops.add(cancel);
            return cancel;
        },

        dispose() {
            alive = false;
            controller.abort();
            [...stops].forEach(stop => stop());
            stops.clear();
        }
    };
}
