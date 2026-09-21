export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function smoothstep(x) {
    x = clamp(x, 0, 1);
    return x * x * (3 - 2 * x);
}

export const href = slug => `#/${slug}`;
