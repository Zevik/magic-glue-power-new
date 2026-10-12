// Molecules drawn as little 3D models on a canvas: glass marbles joined by soft bonds, turning
// slowly. Before they are "built" the marbles float around loose; build() sends each one home.

import { marbleSprite } from './marble-sprite.js';
import { TAU } from './canvas.js';

const LOOKS = {
    red: [0, 85, 52],
    white: [210, 14, 86],
    dark: [222, 14, 30],
    light: [220, 10, 80],
    green: [140, 70, 46],
    blue: [217, 92, 56]
};

const easeOutBack = t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

// Positions are in "marble units"; the molecule is scaled to fit its canvas.
export const MOLECULES = {
    water: {
        atoms: [
            { k: 'red', r: 1, x: 0, y: 0.35, z: 0 },
            { k: 'white', r: 0.62, x: -1.15, y: -0.7, z: 0.15 },
            { k: 'white', r: 0.62, x: 1.15, y: -0.7, z: -0.15 }
        ],
        bonds: [[0, 1], [0, 2]]
    },
    alcohol: {
        atoms: [
            { k: 'dark', r: 0.8, x: -1.6, y: 0.25, z: 0 },
            { k: 'dark', r: 0.8, x: 0, y: -0.25, z: 0.2 },
            { k: 'red', r: 0.8, x: 1.6, y: 0.25, z: 0 }
        ],
        bonds: [[0, 1], [1, 2]]
    },
    oil: {
        atoms: Array.from({ length: 14 }, (_, i) => ({
            k: i % 2 === 0 ? 'dark' : 'light', r: 0.42,
            x: (i - 6.5) * 0.74, y: Math.sin(i * 0.85) * 0.5, z: Math.cos(i * 0.85) * 0.5
        })),
        bonds: Array.from({ length: 13 }, (_, i) => [i, i + 1])
    },
    soap: (() => {
        const atoms = [{ k: 'blue', r: 1.0, x: -4.1, y: 0, z: 0 }];
        for (let i = 0; i < 14; i++) atoms.push({ k: 'green', r: 0.42, x: -2.7 + i * 0.58, y: Math.sin(i * 0.8) * 0.4, z: Math.cos(i * 0.8) * 0.4 });
        const bonds = [[0, 1]];
        for (let i = 1; i < 14; i++) bonds.push([i, i + 1]);
        return { atoms, bonds };
    })()
};

export function createMolecule(canvas, def, { W, H, dpr, ctx }) {
    // fit: the farthest any marble reaches from the centre
    let reach = 0;
    for (const a of def.atoms) reach = Math.max(reach, Math.hypot(a.x, a.y, a.z) + a.r);
    const unit = Math.min(W, H) * 0.46 / reach;

    const sprites = {};
    for (const [k, look] of Object.entries(LOOKS)) sprites[k] = marbleSprite(look[0], look[1], look[2], 24, dpr);

    const atoms = def.atoms.map(a => ({
        ...a,
        // where it floats while loose
        sx: (Math.random() - 0.5) * reach * 2.4, sy: (Math.random() - 0.5) * reach * 2.4, sz: (Math.random() - 0.5) * reach * 2,
        ph: Math.random() * TAU,
        t: 0, startAt: Infinity
    }));

    let built = false;
    let yaw = Math.random() * TAU;
    let buildTime = 0;

    return {
        get built() { return built; },
        build(now) {
            if (built) return;
            built = true;
            buildTime = now;
            atoms.forEach((a, i) => { a.startAt = now + i * 45; });
        },
        reset() {
            built = false;
            atoms.forEach(a => { a.t = 0; a.startAt = Infinity; });
        },
        draw(now) {
            const speed = built ? 0.012 : 0.004;
            yaw += speed;
            const cy = Math.cos(yaw), sy = Math.sin(yaw);
            const tilt = 0.38, ct = Math.cos(tilt), st = Math.sin(tilt);

            const items = [];
            for (const a of atoms) {
                a.t = Math.min(1, Math.max(0, (now - a.startAt) / 650));
                const e = a.t === 0 ? 0 : easeOutBack(a.t);
                const wob = (1 - Math.min(1, a.t)) * 0.35;
                const fx = a.sx + Math.sin(now / 900 + a.ph) * wob;
                const fy = a.sy + Math.cos(now / 1100 + a.ph) * wob;
                const x0 = fx + (a.x - fx) * e;
                const y0 = fy + (a.y - fy) * e;
                const z0 = a.sz + (a.z - a.sz) * e;
                // rotate about the vertical axis, then tilt
                let x = x0 * cy + z0 * sy;
                let z = -x0 * sy + z0 * cy;
                const y = y0 * ct - z * st;
                z = y0 * st + z * ct;
                const persp = 1 / (1 - z * 0.06);
                items.push({ type: 'atom', a, x: W / 2 + x * unit * persp, y: H / 2 + y * unit * persp, z, r: a.r * unit * persp });
            }

            const bondAlpha = built ? Math.min(1, Math.max(0, (now - buildTime - 350) / 450)) : 0;
            if (bondAlpha > 0) {
                for (const [i, j] of def.bonds) {
                    const p = items[i], q = items[j];
                    items.push({ type: 'bond', p, q, z: (p.z + q.z) / 2 - 0.01 });
                }
            }
            items.sort((m, n) => m.z - n.z);

            // soft contact shadow under the whole molecule
            ctx.globalAlpha = 0.25;
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(W / 2, H * 0.93, W * 0.3, H * 0.035, 0, 0, TAU);
            ctx.fill();
            ctx.globalAlpha = 1;

            for (const it of items) {
                if (it.type === 'bond') {
                    ctx.globalAlpha = bondAlpha;
                    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                    ctx.lineCap = 'round';
                    ctx.lineWidth = Math.max(3, Math.min(it.p.r, it.q.r) * 0.55);
                    ctx.beginPath();
                    ctx.moveTo(it.p.x, it.p.y);
                    ctx.lineTo(it.q.x, it.q.y);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                } else {
                    const shade = 0.72 + 0.28 * ((it.z / reach) * 0.5 + 0.5);
                    ctx.globalAlpha = shade;
                    ctx.drawImage(sprites[it.a.k], it.x - it.r, it.y - it.r, it.r * 2, it.r * 2);
                    ctx.globalAlpha = 1;
                }
            }
        }
    };
}
