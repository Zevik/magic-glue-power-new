export const slug = 'gravity';
export const title = 'הכוח המוכר';

export const sectionClass = 'theme-gravity';

export const html = `
<span class="kicker">🍎 שלב 1</span>
<h2 class="title">הכוח המוכר</h2>
<p class="lead">למה התפוח נופל מהעץ אתם יודעים? ברור! כולם מכירים את כוח הכבידה.</p>
<div id="gravity-animation-small" class="apple-drop"></div>
<p class="lead">אבל... האם ידעתם שיש כוח אחר, סודי וחזק, שפועל סביבנו כל הזמן ומשפיע על כל דבר בחיים שלנו?</p>
<div class="actions">
    <a href="#/start" class="btn btn-ghost">חזרה</a>
    <a href="#/invisible-force" class="btn btn-big">מהו הכוח האחר?</a>
</div>
`;

export function init(page) {
    const container = page.root.querySelector('#gravity-animation-small');
    container.innerHTML = '';

    const apple = document.createElement('div');
    apple.className = 'falling-apple';
    apple.textContent = '🍎';

    apple.addEventListener('animationend', () => {
        apple.style.display = 'none'; // Hide the apple after it falls
        const canvas = document.createElement('canvas');
        canvas.className = 'fade-in';
        container.appendChild(canvas);
        animatePurpleOrb(page, canvas);
    }, { once: true, signal: page.signal });

    container.appendChild(apple);
}

function animatePurpleOrb(page, canvas) {
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { signal: page.signal });

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
            size: Math.random() * 2 + 1.5,
            opacity: Math.random() * 0.5 + 0.3
        });
    }

    page.frame(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        time++;

        particles.forEach(p => {
            p.angle += p.speed;
            const pulse = Math.sin(time * 0.02 + p.angle) * 5;
            const currentRadius = p.initialRadius + pulse;

            p.x = canvas.width / 2 + Math.cos(p.angle) * currentRadius;
            p.y = canvas.height / 2 + Math.sin(p.angle) * currentRadius;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(250, 232, 255, ${p.opacity + 0.25})`;
            ctx.fill();
        });
    });
}
