import { marbleSprite, drawMarble } from '../lib/marble-sprite.js';

export const slug = 'air';
export const title = 'תעלומת האוויר';
export const reinitOnResize = true;

export const sectionClass = 'theme-air';

export const html = `
<span class="kicker">💨 שלב 5</span>
<h2 class="title">תעלומת האוויר</h2>
<p class="callout">אם יש כוח כזה, למה הגולות של האוויר לא נדבקות?</p>
<canvas id="particle-canvas-5-gas" class="glass-canvas"></canvas>
<p class="lead">כדי להבין את זה, אנחנו צריכים לגלות את הסוד הבא...</p>
<div class="actions">
    <a href="#/dabkesem" class="btn btn-ghost">חזרה</a>
    <a href="#/heat" class="btn">מה הסוד הבא?</a>
</div>
`;

export function init(page) {
    const canvas = page.root.querySelector('#particle-canvas-5-gas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const radius = Math.max(7, Math.min(11, canvas.width / 38));
    const numParticles = Math.min(60, Math.floor(canvas.width * canvas.height / 3600));
    const sprite = marbleSprite(38, 95, 55, radius);
    const particles = [];
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            radius
        });
    }

    page.frame(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < p.radius || p.x > canvas.width - p.radius) p.vx *= -1;
            if (p.y < p.radius || p.y > canvas.height - p.radius) p.vy *= -1;

            drawMarble(ctx, sprite, p.x, p.y, p.radius);
        });
    });
}
