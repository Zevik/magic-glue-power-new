import { bindDrag } from '../lib/interaction.js';

export const slug = 'dabkesem';
export const title = 'כוח הדבקסם!';
export const reinitOnResize = true;

export const sectionClass = 'theme-dabkesem';

export const html = `
<span class="kicker">🧲 שלב 4</span>
<h2 class="title">כוח הדבקסם!</h2>
<p class="callout">אבל למה הן נשארות יחד?</p>
<p class="lead">זה הזמן להכיר את "כוח הדבקסם". הוא מושך את כל הגולות אחת אל השנייה. נסו להפריד בין שתי הגולות!</p>
<div id="dabkesem-container" class="pull-area">
    <div id="dabkesem-line"></div>
    <div id="gula1" class="gula"></div>
    <div id="gula2" class="gula"></div>
    <p id="dabkesem-text">מרגישים את המשיכה?</p>
</div>
<div class="actions">
    <a href="#/microscope" class="btn btn-ghost">חזרה</a>
    <a href="#/air" class="btn">הבנתי, אבל...</a>
</div>
`;

export function init(page) {
    const container = page.root.querySelector('#dabkesem-container');
    const gula1 = page.root.querySelector('#gula1');
    const gula2 = page.root.querySelector('#gula2');
    const line = page.root.querySelector('#dabkesem-line');
    const text = page.root.querySelector('#dabkesem-text');

    const containerSize = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.6, 384);
    container.style.width = `${containerSize}px`;
    container.style.height = `${containerSize}px`;

    const stiffness = 0.2;
    const damping = 0.9;
    const center = { x: container.clientWidth / 2, y: container.clientHeight / 2 };

    // The red marble is a fixed visual anchor. The blue one is attracted to a point just beside
    // it and can be dragged away.
    const attractionPoint = { x: center.x + 15, y: center.y };
    const pos2 = { ...attractionPoint };
    const vel2 = { x: 0, y: 0 };
    let dragging = false;

    function updatePositions() {
        gula1.style.left = `${center.x - gula1.clientWidth / 2}px`;
        gula1.style.top = `${center.y - gula1.clientHeight / 2}px`;

        gula2.style.left = `${pos2.x - gula2.clientWidth / 2}px`;
        gula2.style.top = `${pos2.y - gula2.clientHeight / 2}px`;

        const dx = pos2.x - center.x;
        const dy = pos2.y - center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        line.style.width = `${distance}px`;
        line.style.left = `${center.x}px`;
        line.style.top = `${center.y - line.clientHeight / 2}px`;
        line.style.transform = `rotate(${angle}deg)`;
    }

    bindDrag(page, container, {
        onStart(p) {
            dragging = true;
            text.style.opacity = '1';
            pos2.x = p.x;
            pos2.y = p.y;
        },
        onMove(p) {
            pos2.x = p.x;
            pos2.y = p.y;
        },
        onEnd() {
            dragging = false;
            text.style.opacity = '0';
        }
    });

    updatePositions();
    page.frame(() => {
        if (!dragging) {
            vel2.x = (vel2.x + (attractionPoint.x - pos2.x) * stiffness) * damping;
            vel2.y = (vel2.y + (attractionPoint.y - pos2.y) * stiffness) * damping;
            pos2.x += vel2.x;
            pos2.y += vel2.y;
        }
        updatePositions();
    });
}
