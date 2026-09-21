export const slug = 'air';
export const title = 'תעלומת האוויר';
export const reinitOnResize = true;

export const sectionClass = 'flex-col justify-center items-center text-center bg-slate-200';

export const html = `
<h2 class="responsive-subtitle font-bold mb-4">תעלומת האוויר</h2>
<p class="max-w-4xl mx-auto responsive-large-text mb-4 sm:mb-6 p-4 bg-black/10 rounded-xl">אם יש כוח כזה, למה הגולות של האוויר לא נדבקות?</p>
<canvas id="particle-canvas-5-gas" class="particle-canvas w-full max-w-lg mx-auto bg-white"></canvas>
<p class="max-w-3xl mx-auto responsive-text mt-4 sm:mt-6 px-4">כדי להבין את זה, אנחנו צריכים לגלות את הסוד הבא...</p>
<div class="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 sm:mt-8 px-4">
    <a href="#/dabkesem" class="w-full sm:w-auto px-6 py-3 bg-gray-400 text-black font-bold text-lg sm:text-xl rounded-full shadow-md hover:bg-gray-500 transition-colors">חזרה</a>
    <a href="#/heat" class="w-full sm:w-auto px-6 py-3 bg-slate-500 text-white font-bold text-lg sm:text-xl rounded-full shadow-md hover:bg-slate-600 transition-colors">מה הסוד הבא?</a>
</div>
`;

export function init(page) {
    const canvas = page.root.querySelector('#particle-canvas-5-gas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const numParticles = Math.min(80, Math.floor(canvas.width * canvas.height / 2000));
    const particles = [];
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            radius: Math.max(3, Math.min(7, canvas.width / 80)),
            color: 'rgba(240, 173, 78, 0.8)'
        });
    }

    page.frame(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < p.radius || p.x > canvas.width - p.radius) p.vx *= -1;
            if (p.y < p.radius || p.y > canvas.height - p.radius) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });
    });
}
