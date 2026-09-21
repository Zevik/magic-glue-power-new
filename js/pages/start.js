export const slug = 'start';
export const title = 'הכוח הנעלם';
export const reinitOnResize = true;

export const sectionClass = 'theme-start';

export const html = `
<div class="orb-wrap"><canvas id="orb-canvas"></canvas></div>
<h1 class="title title-hero">הכוח הנעלם</h1>
<p class="lead">מסע מדהים לעולם הגולות</p>
<div class="actions">
    <a href="#/gravity" class="btn btn-big btn-pulse">התחילו את המסע</a>
</div>
`;

export function init(page) {
    const canvas = page.root.querySelector('#orb-canvas');
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const particles = [];
    let time = 0;

    for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2;
        const maxRadius = Math.min(canvas.width, canvas.height) / 4;
        const radius = Math.random() * (maxRadius * 0.6) + (maxRadius * 0.2);
        particles.push({
            x: canvas.width / 2 + Math.cos(angle) * radius,
            y: canvas.height / 2 + Math.sin(angle) * radius,
            initialRadius: radius,
            angle: angle,
            speed: Math.random() * 0.01 + 0.005,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.2
        });
    }

    page.frame(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        time++;

        particles.forEach(p => {
            p.angle += p.speed;
            const pulse = Math.sin(time * 0.02 + p.angle) * 10;
            const currentRadius = p.initialRadius + pulse;

            p.x = canvas.width / 2 + Math.cos(p.angle) * currentRadius;
            p.y = canvas.height / 2 + Math.sin(p.angle) * currentRadius;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(233, 213, 255, ${p.opacity})`;
            ctx.fill();
        });
    });
}
