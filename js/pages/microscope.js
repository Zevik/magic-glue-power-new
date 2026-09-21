import { smoothstep } from '../lib/util.js';
import { marbleSprite, drawMarble } from '../lib/marble-sprite.js';

export const slug = 'microscope';
export const title = 'המיקרוסקופ המטורף!';

export const sectionClass = 'theme-microscope';

export const html = `
<span class="kicker">🔬 שלב 3</span>
<h2 class="title">המיקרוסקופ המטורף!</h2>
<p class="lead">גררו אחד החפצים אל המיקרוסקופ כדי לראות איך הוא נראה בהגדלה של פי מאה מיליון!</p>
<div class="lab">
    <div id="step-3-objects" class="tray">
        <div id="obj-apple" data-state="solid" class="interactive-object">
            <svg viewBox="0 0 200 200"><path fill="#d9534f" d="M158.6,64.2C158.6,64.2,158.6,64.2,158.6,64.2c-4-19.8-15.5-35.1-30.8-44.5c-15-9.2-32.2-11.7-48.4-7.5 c-17.1,4.4-31.5,15.6-41,31.1C29.2,60.8,25.7,79.9,32.4,98c3.2,8.6,8.2,16.2,14.6,22.3c6.3,6,13.8,10.3,22.1,12.8 c-16.1,11.3-22.3,31.7-16.6,50.1c0.1,0.2,0.1,0.5,0.2,0.7c1,4.2,3.3,8.2,6.5,11.3c3.7,3.5,8.4,5.9,13.6,6.7c0.2,0,0.3,0,0.5,0 c4.6,0,9-1.4,12.8-4c3.6-2.4,6.5-5.9,8.4-9.9c2.3-4.8,3.2-10.1,2.5-15.3c-2-15.1,6.4-29.6,19.3-37.4c12.3-7.5,28-7.1,39.9,1 c4.9,3.3,10.3,5.6,15.9,6.7c11.5,2.3,23-2.3,31.5-11.3C155.6,104.5,163.5,85.1,158.6,64.2z M129.2,25.3 c8.9,3.2,16.2,8.8,21.5,16.4c-6.1,2.3-12.4,3.6-18.9,3.8C127,33.1,126.1,28.2,129.2,25.3z"/></svg>
            <span>תפוח</span>
        </div>
        <div id="obj-water" data-state="liquid" class="interactive-object">
            <svg viewBox="0 0 100 100"><path fill="#5bc0de" d="M83.3,86.5H16.7c-2.3,0-4.1-1.8-4.1-4.1V36.9h75v45.5C87.4,84.7,85.6,86.5,83.3,86.5z"/><path fill="#a0e0f0" d="M12.6,36.9V30c0-2.3,1.8-4.1,4.1-4.1h66.7c2.3,0,4.1,1.8,4.1,4.1v6.9H12.6z"/><path fill="#5bc0de" d="M66.6,55.3c-2.1-5.2-7.7-8.6-13.6-8.6c-5.8,0-11.2,3.2-13.6,8.2c-3.1,6.5-1.5,14.3,3.9,19.1 c5.5,4.9,13.6,4.9,19.1,0C68.3,69.5,69.8,61.7,66.6,55.3z"/></svg>
            <span>כוס מים</span>
        </div>
        <div id="obj-balloon" data-state="gas" class="interactive-object">
            <svg viewBox="0 0 24 24"><path fill="#f0ad4e" d="M13 3.03C8.44 3.54 5 7.42 5 12c0 1.2.27 2.34.76 3.36L4.22 17S3 15.5 3 15c0-4.23 3.08-7.92 7.21-8.72l.34-4.32L13 3.03M15.78 7l-1.34 2.33C14.8 9.2 15 9.08 15 9c0-.34-.04-.68-.1-1.02l.88-.98M18.8 17.36C18.91 16.92 19 16.46 19 16c0-2.09-.81-3.99-2.13-5.4l-1.43 1.43c.89.9 1.43 2.14 1.43 3.49c0 .41-.05.81-.13 1.2L18.8 17.36M11 21c-4.43 0-8-3.57-8-8s3.57-8 8-8c.55 0 1.08.06 1.6.16l-1.12.32c-3.23.91-5.48 3.93-5.48 7.51c0 3.32 2.03 6.18 4.93 7.31L11 21m1-18.05L9.5 2.97C5.07 4.19 2 8.21 2 13c0 1.38.33 2.68.91 3.83l1.52-1.52C4.16 14.63 4 13.84 4 13c0-3.86 3.14-7 7-7c.9 0 1.76.17 2.54.48L12.78 4.2C12.21 4.07 11.62 4 11 4c-4.96 0-9 4.04-9 9c0 4.23 2.92 7.82 6.79 8.79l-1.14.35C5.09 21.27 4 19.33 4 17c0-1.06.22-2.07.62-3H6v-2h1.18C7.06 11.45 7 10.73 7 10c0-2.21 1.79-4 4-4c.73 0 1.45.2 2.08.55L14.41 5c-1.07-.64-2.34-1-3.7-1C6.48 4 3 7.13 3 11c0 .34.03.67.08 1H2v2h1.59c-.38.9-.59 1.88-.59 2.91c0 2.5 1.28 4.7 3.21 6.02L6.5 22.21c-2.48-1.7-4.21-4.5-4.21-7.71C2.29 10.53 5.47 7.2 9.5 6.18L12 3.96l-.99.03z"/></svg>
            <span>בלון</span>
        </div>
    </div>
    <div class="scope">
        <!-- The eyepiece: everything we "see through the microscope" lives inside this circle -->
        <div id="microscope-lens">
            <canvas id="fog-canvas"></canvas>
            <div id="zoom-container" class="hidden"></div>
            <canvas id="particle-canvas-3" class="hidden"></canvas>
            <div id="lens-overlay">
                <svg viewBox="0 0 100 100" fill="none" stroke="rgba(0,0,0,0.4)" stroke-width="0.3">
                    <line x1="8" y1="50" x2="92" y2="50" stroke-width="2.4" stroke-dasharray="0.25 4.75" />
                    <line x1="50" y1="8" x2="50" y2="92" stroke-width="2.4" stroke-dasharray="0.25 4.75" />
                    <line x1="6" y1="50" x2="43" y2="50" /><line x1="57" y1="50" x2="94" y2="50" />
                    <line x1="50" y1="6" x2="50" y2="43" /><line x1="50" y1="57" x2="50" y2="94" />
                    <circle cx="50" cy="50" r="7" />
                </svg>
            </div>
            <div id="lens-hint">גררו חפץ לכאן</div>
            <div id="mag-readout" dir="ltr">×1</div>
        </div>
        <p id="particle-explanation" class="callout callout-soft hidden"></p>
    </div>
</div>
<div class="actions">
    <a href="#/invisible-force" class="btn btn-ghost">חזרה</a>
    <a href="#/dabkesem" class="btn">הבנתי! מה הלאה?</a>
</div>
`;

const OBJECTS = { solid: 'obj-apple', liquid: 'obj-water', gas: 'obj-balloon' };

const PARTICLE_CONFIG = {
    solid: { look: [3, 75, 52], text: 'וואו! רואים? התפוח עשוי ממיליוני גולות קטנטנות, צפופות ורועדות!' },
    liquid: { look: [195, 80, 48], text: 'גם המים עשויים מגולות! אבל הגולות שלהם חופשיות ומתגלגלות זו על זו.' },
    gas: { look: [36, 92, 54], text: 'הגולות של האוויר בכלל משוגעות! הן עפות במהירות לכל הכיוונים.' }
};

function formatMagnification(m) {
    return '×' + Math.round(m).toLocaleString('en-US');
}

export function init(page) {
    const root = page.root;
    const fogCanvas = root.querySelector('#fog-canvas');
    const zoomContainer = root.querySelector('#zoom-container');
    const particleCanvas = root.querySelector('#particle-canvas-3');
    const explanation = root.querySelector('#particle-explanation');
    const readout = root.querySelector('#mag-readout');

    // Bumped on every new zoom so a stale one (from an earlier click) stops itself.
    let token = 0;
    let stopFog = null;
    let stopParticles = null;
    let stopZoom = null;

    readout.textContent = formatMagnification(1);
    startFog();

    setupDragging();

    // Drag a specimen onto the microscope. A plain tap works too: the specimen flies there by itself.
    function setupDragging() {
        const lens = root.querySelector('#microscope-lens');
        const items = root.querySelectorAll('[data-state]');

        page.signal.addEventListener('abort', () => {
            document.querySelectorAll('.drag-ghost').forEach(ghost => ghost.remove());
        });

        const overLens = (x, y) => {
            const box = lens.getBoundingClientRect();
            return Math.hypot(x - (box.left + box.width / 2), y - (box.top + box.height / 2)) <= box.width / 2 * 1.05;
        };

        items.forEach(item => item.addEventListener('pointerdown', e => {
            if (e.button > 0) return; // left mouse button, touch or pen only
            e.preventDefault();

            const svg = item.querySelector('svg');
            const box = svg.getBoundingClientRect();
            const grab = { x: e.clientX - box.left, y: e.clientY - box.top };
            const origin = { x: e.clientX, y: e.clientY };
            let moved = false;

            const ghost = svg.cloneNode(true);
            ghost.removeAttribute('class');
            ghost.classList.add('drag-ghost');
            ghost.style.width = `${box.width}px`;
            ghost.style.height = `${box.height}px`;
            document.body.appendChild(ghost);
            item.classList.add('dragging');
            try { item.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }

            // The point you grabbed stays under the pointer, whatever the scale
            const place = (x, y, scale) => {
                ghost.style.transform = `translate(${x - grab.x * scale}px, ${y - grab.y * scale}px) scale(${scale})`;
            };
            place(e.clientX, e.clientY, 1.15);

            const onMove = move => {
                if (Math.hypot(move.clientX - origin.x, move.clientY - origin.y) > 6) moved = true;
                place(move.clientX, move.clientY, 1.15);
                lens.classList.toggle('drop-ready', overLens(move.clientX, move.clientY));
            };

            const finish = end => {
                item.removeEventListener('pointermove', onMove);
                item.removeEventListener('pointerup', finish);
                item.removeEventListener('pointercancel', finish);
                lens.classList.remove('drop-ready');
                item.classList.remove('dragging');
                ghost.style.transition = 'transform 0.35s cubic-bezier(0.3, 0.7, 0.3, 1), opacity 0.35s';

                const dropped = end.type === 'pointerup' && (!moved || overLens(end.clientX, end.clientY));
                if (dropped) {
                    // Slide into the middle of the eyepiece, then start looking
                    const lensBox = lens.getBoundingClientRect();
                    const scale = 0.6;
                    ghost.style.transform = `translate(${lensBox.left + lensBox.width / 2 - box.width * scale / 2}px, ${lensBox.top + lensBox.height / 2 - box.height * scale / 2}px) scale(${scale})`;
                    ghost.style.opacity = '0';
                    page.timeout(() => {
                        ghost.remove();
                        showParticles(item.dataset.state);
                    }, 300);
                } else {
                    // Missed: it returns to where it came from
                    const home = svg.getBoundingClientRect();
                    place(home.left, home.top, 1);
                    page.timeout(() => ghost.remove(), 350);
                }
            };

            item.addEventListener('pointermove', onMove);
            item.addEventListener('pointerup', finish);
            item.addEventListener('pointercancel', finish);
        }, { signal: page.signal }));
    }

    // The slow fog you see before choosing something to look at
    function startFog() {
        const ctx = fogCanvas.getContext('2d');
        fogCanvas.width = fogCanvas.parentElement.clientWidth;
        fogCanvas.height = fogCanvas.parentElement.clientHeight;

        const particles = [];
        for (let i = 0; i < 20; i++) {
            particles.push({
                x: Math.random() * fogCanvas.width,
                y: Math.random() * fogCanvas.height,
                radius: Math.random() * 50 + 40,
                opacity: Math.random() * 0.1 + 0.05,
                speed: Math.random() * 0.2 + 0.1
            });
        }

        stopFog = page.frame(() => {
            ctx.clearRect(0, 0, fogCanvas.width, fogCanvas.height);
            particles.forEach(p => {
                p.x += p.speed;
                if (p.x > fogCanvas.width + p.radius) p.x = -p.radius;

                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
                gradient.addColorStop(0, `rgba(140, 150, 130, ${p.opacity})`);
                gradient.addColorStop(1, 'rgba(140, 150, 130, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });
        });
    }

    function showParticles(state) {
        const myToken = ++token;
        [stopFog, stopParticles, stopZoom].forEach(stop => stop && stop());

        fogCanvas.classList.add('hidden');
        particleCanvas.classList.add('hidden');
        particleCanvas.style.opacity = '0';
        explanation.classList.add('hidden');

        const objectElement = root.querySelector(`#${OBJECTS[state]}`);
        zoomContainer.innerHTML = objectElement.querySelector('svg').outerHTML;
        const svg = zoomContainer.querySelector('svg');
        zoomContainer.classList.remove('hidden');
        readout.textContent = formatMagnification(1);
        root.querySelector('#lens-hint').classList.add('hidden');

        root.querySelectorAll('#step-3-objects .interactive-object').forEach(el => el.classList.remove('active'));
        objectElement.classList.add('active');

        // The dive: the specimen sits on the slide for a moment, then the magnification
        // climbs from x1 to x100,000,000 while the "focus knob" wobbles the blur.
        // Near the end the specimen dissolves and the marbles come into sharp focus.
        const duration = 3400;
        const holdUntil = 0.1;
        const dissolveFrom = 0.6;
        const particlesFrom = 0.68;
        const start = performance.now();
        let particlesStarted = false;

        stopZoom = page.frame(now => {
            if (myToken !== token) return;
            const u = Math.min(1, (now - start) / duration);
            const dive = Math.pow(Math.max(0, (u - holdUntil) / (1 - holdUntil)), 2.1);

            const scale = Math.exp(Math.log(45) * dive);
            readout.textContent = formatMagnification(Math.pow(10, 8 * dive));

            // Blur is applied before the transform, so divide by scale to get pixels on screen.
            const screenBlur = 3 * Math.abs(Math.sin(u * 10)) * dive + 14 * smoothstep((u - 0.5) / 0.25);
            const shake = 3 * dive;
            svg.style.transform = `translate(${(Math.random() - 0.5) * shake}px, ${(Math.random() - 0.5) * shake}px) scale(${scale})`;
            svg.style.filter = `blur(${screenBlur / scale}px)`;
            svg.style.opacity = String(1 - smoothstep((u - dissolveFrom) / 0.25));

            if (u >= particlesFrom) {
                if (!particlesStarted) {
                    particlesStarted = true;
                    startParticles(state);
                }
                const focus = smoothstep((u - particlesFrom) / (1 - particlesFrom));
                particleCanvas.style.opacity = String(focus);
                particleCanvas.style.filter = `blur(${(1 - focus) * 10}px)`;
            }

            if (u >= 1) {
                stopZoom();
                zoomContainer.classList.add('hidden');
                particleCanvas.style.opacity = '';
                particleCanvas.style.filter = '';
                explanation.classList.remove('hidden');
            }
        });
    }

    function startParticles(state) {
        particleCanvas.classList.remove('hidden');

        const ctx = particleCanvas.getContext('2d');
        particleCanvas.width = particleCanvas.parentElement.clientWidth;
        particleCanvas.height = particleCanvas.parentElement.clientHeight;
        explanation.textContent = PARTICLE_CONFIG[state].text;

        const radius = 7;
        const sprite = marbleSprite(...PARTICLE_CONFIG[state].look, radius);
        const particles = [];
        for (let i = 0; i < 130; i++) {
            particles.push({
                x: Math.random() * particleCanvas.width,
                y: Math.random() * particleCanvas.height,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                radius
            });
        }

        stopParticles = page.frame(() => {
            ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
            particles.forEach(p => {
                switch (state) {
                    case 'solid':
                        p.x += (Math.random() - 0.5) * 0.5;
                        p.y += (Math.random() - 0.5) * 0.5;
                        break;
                    case 'liquid':
                        p.x += p.vx * 0.2;
                        p.y += p.vy * 0.2;
                        if (p.x < p.radius || p.x > particleCanvas.width - p.radius) p.vx *= -1;
                        if (p.y < p.radius || p.y > particleCanvas.height - p.radius) p.vy *= -1;
                        break;
                    case 'gas':
                        p.x += p.vx;
                        p.y += p.vy;
                        if (p.x < p.radius || p.x > particleCanvas.width - p.radius) p.vx *= -1;
                        if (p.y < p.radius || p.y > particleCanvas.height - p.radius) p.vy *= -1;
                        break;
                }
                p.x = Math.min(particleCanvas.width - p.radius, Math.max(p.radius, p.x));
                p.y = Math.min(particleCanvas.height - p.radius, Math.max(p.radius, p.y));

                drawMarble(ctx, sprite, p.x, p.y, p.radius);
            });
        });
    }
}
