import { bindDrag, fixedStepLoop } from '../lib/interaction.js';
import { createWaterMolecule } from '../lib/molecules.js';

export const slug = 'attraction';
export const title = 'משיכה בין צורונים';
export const reinitOnResize = true;

export const sectionClass = 'theme-attraction';

export const html = `
<span class="kicker">🪢 שלב 9</span>
<h2 class="title">משיכה בין צורונים</h2>
<p class="lead">כמו מגנטים גדולים שנמשכים חזק יותר, כך גם צורונים גדולים ומסובכים נמשכים אחד לשני חזק יותר! זהו "כוח הדבקסם" שפועל ביניהם. נסו להפריד ביניהם!</p>
<div class="compare">
    <div class="compare-col">
        <h3>צורוני מים (קשה פחות)</h3>
        <div id="molecule-container-water" class="mol-area"></div>
    </div>
    <div class="compare-col">
        <h3>צורוני שמן (קשה יותר)</h3>
        <div id="molecule-container-oil" class="mol-area"></div>
    </div>
</div>
<div class="actions">
    <a href="#/tsuronim" class="btn btn-ghost">חזרה</a>
    <a href="#/mysteries" class="btn">וואו! בואו נפתור את התעלומות!</a>
</div>
`;

// --- Step 9: pulling two molecules apart ---
function sizeMoleculeContainer(page, container) {
    const update = () => {
        const size = Math.min(window.innerWidth * 0.85, window.innerHeight * 0.4, 320);
        container.style.width = `${size}px`;
        container.style.height = `${size}px`;
    };
    update();
    window.addEventListener('resize', update, { signal: page.signal });
}

function setupWaterInteraction(page, stiffness) {
    const container = document.getElementById('molecule-container-water');
    container.innerHTML = '';
    sizeMoleculeContainer(page, container);

    const width = container.clientWidth, height = container.clientHeight;
    const scale = Math.min(1, width / 200);
    const touching = 38 * scale; // centre-to-centre distance at which the two molecules nestle against each other
    const home = { x: width / 2, y: height / 2 + touching / 2 };

    const m1 = createWaterMolecule('water1', width / 2, height / 2 - touching / 2, width);
    const m2 = createWaterMolecule('water2', home.x, home.y, width);
    m2.classList.add('grab-handle');
    container.append(m1, m2);

    const damping = 0.9;
    const pos = { ...home };
    const vel = { x: 0, y: 0 };
    let angle = 0, angleVel = 0;
    let grab = null; // offset between the pointer and the molecule while dragging
    let lastPointerX = 0;

    bindDrag(page, container, {
        onStart(p) {
            grab = { x: pos.x - p.x, y: pos.y - p.y };
            lastPointerX = p.x;
        },
        onMove(p) {
            pos.x = Math.min(width, Math.max(0, p.x + grab.x));
            pos.y = Math.min(height, Math.max(0, p.y + grab.y));
            angle += p.x - lastPointerX;
            lastPointerX = p.x;
            vel.x = vel.y = angleVel = 0;
        },
        onEnd() { grab = null; }
    }, [m2]); // only the molecule itself can be grabbed, the rest of the area still scrolls

    fixedStepLoop(page, () => {
        if (grab) return;
        vel.x = (vel.x + (home.x - pos.x) * stiffness) * damping;
        vel.y = (vel.y + (home.y - pos.y) * stiffness) * damping;
        pos.x += vel.x;
        pos.y += vel.y;
        angleVel = (angleVel + (0 - angle) * 0.1) * 0.8;
        angle += angleVel;
    }, () => {
        m2.style.left = `${pos.x}px`;
        m2.style.top = `${pos.y}px`;
        m2.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    });
}

// The oil molecule is a long flexible chain. It sticks to the molecule below it, so when
// you pull on it the part that is being held bends, and only lets go bit by bit.
function setupOilInteraction(page, stiffness) {
    const container = document.getElementById('molecule-container-oil');
    container.innerHTML = '';
    sizeMoleculeContainer(page, container);

    const width = container.clientWidth, height = container.clientHeight;
    const scale = Math.min(1, width / 260); // leave some room around the long chain
    const count = 28;                    // twice as long as the molecules in step 8
    const ballSize = 12 * scale;
    const spacing = 7 * scale;
    const rowGap = ballSize * 0.9;       // the two chains lie right against each other
    const y1 = height / 2 - rowGap / 2;
    const y2 = height / 2 + rowGap / 2;
    const x0 = width / 2 - (count - 1) * spacing / 2;
    const xEnd = x0 + (count - 1) * spacing;
    const floorY = y1 + ballSize * 0.8; // the lowest edge of the fixed chain

    const adhesion = stiffness * 0.3;    // how strongly a stuck ball is pulled back to where it sat
    const damping = 0.9;

    function makeBall(i) {
        const ball = document.createElement('div');
        ball.className = `marble ${i % 2 === 0 ? 'm-dark' : 'm-light'}`;
        ball.style.cssText = `left:0;top:0;width:${ballSize}px;height:${ballSize}px;`;
        container.appendChild(ball);
        return ball;
    }

    const nodes = [];
    for (let i = 0; i < count; i++) {
        const ax = x0 + i * spacing;
        const fixedBall = makeBall(i);
        fixedBall.style.transform = `translate(${ax - ballSize / 2}px, ${y1 - ballSize / 2}px)`;
        nodes.push({
            ax, ay: y2, x: ax, y: y2, px: ax, py: y2,
            stuck: true,
            breakAt: ballSize * (1.1 + Math.random() * 0.6), // some balls hold on longer than others
            el: makeBall(i + 1)
        });
    }
    nodes.forEach(n => n.el.classList.add('grab-handle'));

    let handle = null;   // the ball the user is holding
    let grab = null;     // where the pointer is relative to that ball
    let target = null;

    function keepInside(p) {
        return {
            x: Math.min(width - ballSize / 2, Math.max(ballSize / 2, p.x)),
            y: Math.min(height - ballSize / 2, Math.max(ballSize / 2, p.y))
        };
    }

    bindDrag(page, container, {
        onStart(p) {
            let best = Infinity;
            for (const n of nodes) {
                const d = Math.hypot(n.x - p.x, n.y - p.y);
                if (d < best) { best = d; handle = n; }
            }
            grab = { x: handle.x - p.x, y: handle.y - p.y };
            target = { x: handle.x, y: handle.y };
        },
        onMove(p) { target = keepInside({ x: p.x + grab.x, y: p.y + grab.y }); },
        onEnd() {
            handle = null;
            for (const n of nodes) n.stuck = true; // it sticks again, and the chain snaps back
        }
    }, nodes.map(n => n.el)); // only the chain itself can be grabbed, the rest of the area still scrolls

    function link(a, b, rest, strength) {
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1e-6;
        const wa = a === handle ? 0 : 1, wb = b === handle ? 0 : 1;
        if (wa + wb === 0) return;
        const k = (d - rest) / d * strength / (wa + wb);
        a.x += dx * k * wa; a.y += dy * k * wa;
        b.x -= dx * k * wb; b.y -= dy * k * wb;
    }

    function update() {
        for (const n of nodes) {
            if (n === handle) continue;
            const vx = (n.x - n.px) * damping, vy = (n.y - n.py) * damping;
            n.px = n.x; n.py = n.y;
            n.x += vx; n.y += vy;
            // While dragging only the balls that are still stuck are held back; once you let go
            // the whole chain is pulled back to where it started.
            if (n.stuck || !handle) {
                n.x += (n.ax - n.x) * adhesion;
                n.y += (n.ay - n.y) * adhesion;
            }
        }
        if (handle) {
            handle.x = handle.px = target.x;
            handle.y = handle.py = target.y;
        }

        for (let iteration = 0; iteration < 12; iteration++) {
            for (let i = 0; i < count - 1; i++) link(nodes[i], nodes[i + 1], spacing, 1);
            // resist sharp bends so it behaves like a molecule and not like a rope
            for (let i = 0; i < count - 2; i++) link(nodes[i], nodes[i + 2], spacing * 2, 0.5);
            for (let i = 0; i < count - 4; i++) link(nodes[i], nodes[i + 4], spacing * 4, 0.25);
        }

        for (const n of nodes) {
            // the other molecule is solid, this one can't pass through it
            if (n.x > x0 - ballSize && n.x < xEnd + ballSize && n.y < floorY) n.y = floorY;
            n.x = Math.min(width - ballSize / 2, Math.max(ballSize / 2, n.x));
            n.y = Math.min(height - ballSize / 2, Math.max(ballSize / 2, n.y));
        }

        // Peeling off: a ball lets go once it has been pulled too far from where it was stuck
        for (const n of nodes) {
            const drift = Math.hypot(n.x - n.ax, n.y - n.ay);
            if (handle && n.stuck && drift > n.breakAt) n.stuck = false;
            else if (!n.stuck && drift < n.breakAt * 0.3) n.stuck = true;
        }
    }

    fixedStepLoop(page, update, () => {
        for (const n of nodes) {
            n.el.style.transform = `translate(${n.x - ballSize / 2}px, ${n.y - ballSize / 2}px)`;
        }
    });
}

export function init(page) {
    setupWaterInteraction(page, 0.1);
    setupOilInteraction(page, 0.4);
}
