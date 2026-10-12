import { fitCanvas, TAU, rand } from '../lib/canvas.js';
import { marbleSprite, drawMarble, drawGlow } from '../lib/marble-sprite.js';
import { sfx } from '../lib/audio.js';
import { discover } from '../lib/progress.js';

export const slug = 'reactions';
export const title = 'מהפכת הלגו (תגובות כימיות)';
export const chapter = 'מהפכת הלגו';
export const icon = 'flame';
export const nextLabel = 'עוד קסם: השלולית';
export const reinitOnResize = true;

export const sectionClass = 'theme-reactions';

const smokeIcon = '<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true"><defs><linearGradient id="rx-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cbd5e1"/><stop offset="1" stop-color="#64748b"/></linearGradient></defs><path d="M18 46a10 10 0 0 1 2-19.800 14 14 0 0 1 26 3A9 9 0 0 1 46 46Z" fill="url(#rx-s)"/></svg>';
const vaporIcon = '<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true"><defs><linearGradient id="rx-v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0f9ff"/><stop offset="1" stop-color="#7dd3fc"/></linearGradient></defs><path d="M18 46a10 10 0 0 1 2-19.800 14 14 0 0 1 26 3A9 9 0 0 1 46 46Z" fill="url(#rx-v)"/><path d="M24 52v4M32 52v6M40 52v4" stroke="#7dd3fc" stroke-width="3" stroke-linecap="round"/></svg>';
const ashIcon = '<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true"><defs><radialGradient id="rx-a" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#a8a29e"/><stop offset="1" stop-color="#292524"/></radialGradient></defs><circle cx="22" cy="40" r="11" fill="url(#rx-a)"/><circle cx="42" cy="42" r="9" fill="url(#rx-a)"/><circle cx="32" cy="26" r="8" fill="url(#rx-a)"/></svg>';

export const html = `
<h2 class="title">מהפכת <em>הלגו</em></h2>
<p class="lead">עד עכשיו רק הפרדנו צורונים שלמים. אבל מה קורה כשהוא עצמו מתפרק? כשהגולות בתוך הצורון מקבלות מספיק אנרגיה, הקשרים נשברים, והגולות בונות <b>צורונים חדשים לגמרי</b>. זאת תגובה כימית. בואו נדליק גפרור ונשרוף קצת עץ.</p>
<div class="reaction-stage"><canvas id="reaction-canvas" aria-label="גולות של עץ ושל אוויר שמתפרקות ונבנות מחדש באש"></canvas></div>
<button id="ignite-btn" type="button" class="btn btn-big btn-pulse">הציתו את האש</button>
<div id="reaction-legend" class="facts hidden">
    <div class="card fact" style="--f1: #cbd5e1; --f2: #94a3b8;">
        <div class="icon">${smokeIcon}</div>
        <p>גולה כהה + גולת אוויר =</p>
        <h3>עשן</h3>
    </div>
    <div class="card fact" style="--f1: #bae6fd; --f2: #38bdf8;">
        <div class="icon">${vaporIcon}</div>
        <p>גולה בהירה + גולת אוויר =</p>
        <h3>אדי מים</h3>
    </div>
    <div class="card fact" style="--f1: #d6d3d1; --f2: #78716c;">
        <div class="icon">${ashIcon}</div>
        <p>גולות שלא מצאו זוג =</p>
        <h3>אפר</h3>
    </div>
</div>
<p id="reaction-explain" class="insight">לא איבדנו אף גולה! פירקנו צורונים ישנים ובנינו מהם צורונים חדשים. <b>ספרו אותן: כמה שהיו, כך נשארו.</b> זה הקסם שמאחורי אש, חלודה ואפייה.</p>
<details class="deep">
    <summary>למבוגרים סקרנים</summary>
    <p>זה חוק שימור המסה של לבואזיה: בתגובה כימית אטומים לא נוצרים ולא נעלמים, הם רק מסתדרים מחדש. בשריפה האנרגיה שנצברה בקשרים הישנים משתחררת כחום ואור, ולכן האש מחממת ומאירה.</p>
</details>
`;

const WOOD_COUNT = 8;
const AIR_ATOMS = 6;

export function init(page) {
    const canvas = page.root.querySelector('#reaction-canvas');
    const btn = page.root.querySelector('#ignite-btn');
    const legend = page.root.querySelector('#reaction-legend');
    const explain = page.root.querySelector('#reaction-explain');
    const { ctx, W, H, dpr } = fitCanvas(canvas);

    const d = Math.max(22, Math.min(36, W / 17));
    const r = d / 2;
    const sprites = {
        dark: marbleSprite(222, 14, 30, r, dpr),
        light: marbleSprite(220, 10, 80, r, dpr),
        air: marbleSprite(205, 88, 56, r * 0.85, dpr),
        ash: marbleSprite(25, 6, 24, r, dpr)
    };

    let atoms, fire, puffs, phase, t0, flash, match;
    const chainY = H * 0.68;
    const chainX = W * 0.1;
    const spacing = d * 0.82;

    function layout() {
        atoms = [];
        for (let i = 0; i < WOOD_COUNT; i++) {
            atoms.push({ kind: i % 2 === 0 ? 'dark' : 'light', wood: true, i, hx: chainX + i * spacing, hy: chainY, x: chainX + i * spacing, y: chainY, vx: 0, vy: 0, tx: 0, ty: 0, partner: null, group: null, rr: r });
        }
        for (let i = 0; i < AIR_ATOMS; i++) {
            const pair = Math.floor(i / 2);
            const hx = W * 0.74 + (i % 2) * d * 0.72;
            const hy = H * (0.24 + pair * 0.24);
            atoms.push({ kind: 'air', wood: false, i, hx, hy, x: hx, y: hy, vx: 0, vy: 0, tx: 0, ty: 0, partner: null, group: null, rr: r * 0.85 });
        }
        fire = []; puffs = [];
        flash = 0;
        phase = 'idle';
        match = null;
    }
    layout();

    // legend and explanation are hidden until the reaction is over
    legend.classList.add('hidden');
    explain.classList.remove('show');
    btn.classList.add('btn-pulse');
    btn.textContent = 'הציתו את האש';
    let state = 'idle';

    function emitFire(x, y, n, spread = 8, power = 1) {
        for (let i = 0; i < n; i++) {
            fire.push({ x: x + rand(-spread, spread), y: y + rand(-4, 4), vx: rand(-0.5, 0.5), vy: -rand(0.8, 2.6) * power, life: 1, size: rand(8, 18) * power });
        }
    }

    function assignTargets() {
        const woods = atoms.filter(a => a.wood);
        const airs = atoms.filter(a => !a.wood);
        let smoke = 0, vapor = 0, ash = 0;
        woods.forEach((w, idx) => {
            if (idx < airs.length) {
                const air = airs[idx];
                w.partner = air; air.partner = w;
                if (w.kind === 'dark') {
                    w.group = air.group = 'smoke';
                    const gx = W * (0.14 + (smoke % 3) * 0.12);
                    w.tx = gx; w.ty = H * 0.2 + Math.floor(smoke / 3) * d;
                    smoke++;
                } else {
                    w.group = air.group = 'vapor';
                    const gx = W * (0.56 + (vapor % 3) * 0.12);
                    w.tx = gx; w.ty = H * 0.2 + Math.floor(vapor / 3) * d;
                    vapor++;
                }
                air.tx = w.tx + d * 0.95; air.ty = w.ty;
            } else {
                w.group = 'ash';
                w.tx = W * 0.44 + ash * d * 1.1; w.ty = H - r - 10;
                w.kind = 'ash';
                ash++;
            }
        });
    }

    btn.addEventListener('click', () => {
        if (state === 'busy') return;
        if (state === 'done') {
            state = 'idle';
            layout();
            legend.classList.add('hidden');
            explain.classList.remove('show');
            btn.classList.add('btn-pulse');
            btn.textContent = 'הציתו את האש';
            sfx.tap();
            return;
        }
        state = 'busy';
        btn.classList.remove('btn-pulse');
        btn.textContent = 'בוערים...';
        phase = 'match';
        t0 = performance.now();
        match = { x: W * 0.03, y: H * 0.2 };
        sfx.whoosh();
    }, { signal: page.signal });

    let lastFrame = performance.now();
    page.frame(now => {
        const dt = Math.min(2, (now - lastFrame) / 16.67);
        lastFrame = now;
        const el = now - t0;

        // ----- the timeline -----
        if (phase === 'match') {
            const u = Math.min(1, el / 800);
            const e = u * u * (3 - 2 * u);
            match.x = W * 0.03 + (chainX - d * 0.2 - W * 0.03) * e;
            match.y = H * 0.2 + (chainY - d * 1.1 - H * 0.2) * e;
            emitFire(match.x + 14, match.y - 10, 1, 2, 0.6);
            if (u >= 1) { phase = 'burn'; t0 = now; sfx.sizzle(); }
        } else if (phase === 'burn') {
            for (const a of atoms) if (a.wood) { a.x = a.hx + rand(-1, 1) * (el / 300); a.y = a.hy + rand(-1, 1) * (el / 300); }
            emitFire(chainX + rand(0, WOOD_COUNT * spacing), chainY - r, 3, 6, 1 + el / 900);
            if (el > 1100) {
                phase = 'scatter'; t0 = now; flash = 1;
                sfx.boom();
                if (navigator.vibrate) navigator.vibrate(40);
                for (const a of atoms) {
                    const ang = Math.random() * TAU, sp = rand(5, 10);
                    a.vx = Math.cos(ang) * sp; a.vy = Math.sin(ang) * sp;
                }
            }
        } else if (phase === 'scatter') {
            if (el > 1100) { phase = 'bond'; t0 = now; assignTargets(); sfx.snap(); }
        } else if (phase === 'bond') {
            if (el > 2600) {
                phase = 'done';
                state = 'done';
                legend.classList.remove('hidden');
                legend.querySelectorAll('.fact').forEach((c, i) => { c.style.animationDelay = `${i * 120}ms`; c.classList.add('reveal-in'); });
                explain.classList.add('show');
                btn.textContent = 'שוב!';
                btn.classList.add('btn-pulse');
                discover('fire');
                sfx.success();
                page.ready();
            }
        }

        // ----- atom physics -----
        for (const a of atoms) {
            if (phase === 'scatter') {
                a.x += a.vx * dt; a.y += a.vy * dt;
                a.vx *= 0.985; a.vy *= 0.985;
                if (a.x < a.rr) { a.x = a.rr; a.vx = Math.abs(a.vx); sfx.click(a.i); }
                if (a.x > W - a.rr) { a.x = W - a.rr; a.vx = -Math.abs(a.vx); sfx.click(a.i + 2); }
                if (a.y < a.rr) { a.y = a.rr; a.vy = Math.abs(a.vy); }
                if (a.y > H - a.rr) { a.y = H - a.rr; a.vy = -Math.abs(a.vy); }
            } else if (phase === 'bond' || phase === 'done') {
                const wobble = a.group === 'ash' ? 0 : Math.sin(now / 500 + a.i * 1.7) * 1.2;
                a.vx += (a.tx - a.x) * 0.03 * dt;
                a.vy += (a.ty + wobble - a.y) * 0.03 * dt;
                a.vx *= 0.86; a.vy *= 0.86;
                a.x += a.vx * dt; a.y += a.vy * dt;
            }
        }

        // smoke and vapour puffs rise from the new molecules
        if ((phase === 'bond' || phase === 'done') && Math.random() < 0.35) {
            const w = atoms.filter(a => a.wood && (a.group === 'smoke' || a.group === 'vapor'));
            const a = w[(Math.random() * w.length) | 0];
            if (a) puffs.push({ x: a.x + d * 0.5, y: a.y - r, vx: rand(-0.2, 0.2), vy: -rand(0.3, 0.8), life: 1, size: rand(14, 24), group: a.group });
        }
        for (const f of fire) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy -= 0.01; f.life -= 0.03 * dt; f.size *= 0.985; }
        fire = fire.filter(f => f.life > 0);
        for (const p of puffs) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= 0.012 * dt; p.size += 0.15 * dt; }
        puffs = puffs.filter(p => p.life > 0);
        flash *= Math.pow(0.9, dt);

        // ----- drawing -----
        ctx.clearRect(0, 0, W, H);

        // the ground
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(0, H - 8, W, 8);

        // a warm light from the fire
        const heatGlow = fire.length / 40;
        if (heatGlow > 0) {
            const g = ctx.createRadialGradient(chainX + 2 * spacing, chainY, 0, chainX + 2 * spacing, chainY, W * 0.5);
            g.addColorStop(0, `rgba(255,140,40,${Math.min(0.4, heatGlow * 0.3)})`);
            g.addColorStop(1, 'rgba(255,140,40,0)');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
        }

        // puffs (behind the marbles)
        for (const p of puffs) {
            ctx.globalAlpha = Math.max(0, p.life) * 0.4;
            ctx.fillStyle = p.group === 'smoke' ? '#9ca3af' : '#e0f2fe';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, TAU);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // bonds inside the wood chain, and in the new molecules
        ctx.lineCap = 'round';
        ctx.lineWidth = d * 0.32;
        ctx.strokeStyle = 'rgba(255,255,255,0.28)';
        ctx.beginPath();
        if (phase === 'idle' || phase === 'match' || phase === 'burn') {
            for (let i = 0; i < WOOD_COUNT - 1; i++) { ctx.moveTo(atoms[i].x, atoms[i].y); ctx.lineTo(atoms[i + 1].x, atoms[i + 1].y); }
            for (const k of [0, 2, 4]) { const a = atoms[WOOD_COUNT + k], b = atoms[WOOD_COUNT + k + 1]; ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
        } else if (phase === 'bond' || phase === 'done') {
            for (const a of atoms) if (a.wood && a.partner) { ctx.moveTo(a.x, a.y); ctx.lineTo(a.partner.x, a.partner.y); }
        }
        ctx.stroke();

        for (const a of atoms) drawMarble(ctx, sprites[a.kind], a.x, a.y, a.rr);

        // labels once the new molecules have formed
        if (phase === 'done') {
            ctx.font = `800 ${Math.max(14, W / 34)}px Rubik, sans-serif`;
            ctx.textAlign = 'center';
            ctx.direction = 'rtl';
            const label = (text, x, y, color) => {
                const w = ctx.measureText(text).width + 22;
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.beginPath(); ctx.roundRect(x - w / 2, y - 15, w, 28, 14); ctx.fill();
                ctx.fillStyle = color; ctx.fillText(text, x, y + 5);
            };
            label('עשן', W * 0.27, H * 0.46, '#e5e7eb');
            label('אדי מים', W * 0.74, H * 0.46, '#bae6fd');
            label('אפר', W * 0.5, H - 36, '#d6d3d1');
        }

        // fire and the match (additive light)
        for (const f of fire) {
            const hue = 55 - (1 - f.life) * 50;
            drawGlow(ctx, f.x, f.y, Math.max(3, f.size * 0.75), hue, Math.min(1, f.life * 1.1));
        }
        if (match && phase === 'match') {
            ctx.save();
            ctx.translate(match.x, match.y);
            ctx.rotate(0.6);
            ctx.fillStyle = '#d6a96a';
            ctx.beginPath(); ctx.roundRect(-3, -2, 6, 52, 3); ctx.fill();
            ctx.fillStyle = '#d32f2f';
            ctx.beginPath(); ctx.arc(0, -2, 6, 0, TAU); ctx.fill();
            ctx.restore();
        }

        if (flash > 0.02) {
            ctx.fillStyle = `rgba(255, 245, 210, ${flash * 0.8})`;
            ctx.fillRect(0, 0, W, H);
        }
    });
}
