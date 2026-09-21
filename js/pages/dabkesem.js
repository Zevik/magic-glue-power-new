import { bindDrag } from '../lib/interaction.js';

export const slug = 'dabkesem';
export const title = 'כוח הדבקסם!';
export const reinitOnResize = true;

export const sectionClass = 'flex-col justify-center items-center text-center bg-green-200';

export const html = `
<h2 class="responsive-subtitle font-bold mb-4">כוח הדבקסם!</h2>
<p class="max-w-3xl mx-auto responsive-large-text mb-4 sm:mb-6 p-4 bg-black/10 rounded-xl">אבל למה הן נשארות יחד?</p>
<p class="max-w-3xl mx-auto responsive-text mb-4 sm:mb-6 px-4">זה הזמן להכיר את "כוח הדבקסם". הוא מושך את כל הגולות אחת אל השנייה. נסו להפריד בין שתי הגולות!</p>
<div id="dabkesem-container" class="relative bg-white rounded-2xl shadow-inner flex justify-center items-center cursor-grab mx-auto" style="background-image: radial-gradient(circle, #e0f2f1, #b2dfdb);">
    <div id="dabkesem-line" class="absolute h-1 bg-teal-400 opacity-70" style="transform-origin: 0 50%;"></div>
    <div id="gula1" class="absolute w-8 h-8 sm:w-12 sm:h-12 bg-red-500 rounded-full shadow-lg border-2 border-white"></div>
    <div id="gula2" class="absolute w-8 h-8 sm:w-12 sm:h-12 bg-blue-500 rounded-full shadow-lg border-2 border-white"></div>
    <p id="dabkesem-text" class="absolute bottom-2 sm:bottom-4 text-sm sm:text-lg font-semibold text-teal-800 opacity-0 transition-opacity px-2">מרגישים את המשיכה?</p>
</div>
<div class="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 sm:mt-8 px-4">
    <a href="#/microscope" class="w-full sm:w-auto px-6 py-3 bg-gray-400 text-black font-bold text-lg sm:text-xl rounded-full shadow-md hover:bg-gray-500 transition-colors">חזרה</a>
    <a href="#/air" class="w-full sm:w-auto px-6 py-3 bg-green-500 text-white font-bold text-lg sm:text-xl rounded-full shadow-md hover:bg-green-600 transition-colors">הבנתי, אבל...</a>
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
