export const slug = 'heat';
export const title = 'ריקוד הגולות';
export const reinitOnResize = true;

export const sectionClass = 'flex-col justify-center items-center text-center bg-orange-200';

export const html = `
<h2 class="responsive-subtitle font-bold mb-4">ריקוד הגולות</h2>
 <p class="max-w-3xl mx-auto responsive-text mb-4 sm:mb-6 px-4">כל הגולות רוקדות, רועדות ומתנגשות. למה? התשובה היא חום! כשאנחנו מחממים משהו, אנחנו גורמים לגולות שלו לזוז מהר יותר. שחקו עם מד הטמפרטורה וראו מה קורה לגולות!</p>
<canvas id="particle-canvas-6-heat" class="particle-canvas w-full max-w-lg mx-auto bg-white"></canvas>
<div class="flex items-center justify-center w-full max-w-lg mt-4 px-4">
    <span class="text-2xl sm:text-3xl">❄️</span>
    <input id="temp-slider-6" type="range" min="0" max="100" value="10" class="w-full mx-2 sm:mx-4 accent-red-500">
    <span class="text-2xl sm:text-3xl">☀️</span>
</div>
 <p class="max-w-3xl mx-auto responsive-text mt-4 sm:mt-6 px-4">זה כלל ממש חשוב: <b>חום = תנועה של גולות!</b> עכשיו אנחנו מוכנים לחבר את כל החלקים ולפתור את התעלומה הגדולה!</p>
<div class="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 sm:mt-8 px-4">
    <a href="#/air" class="w-full sm:w-auto px-6 py-3 bg-gray-400 text-black font-bold text-lg sm:text-xl rounded-full shadow-md hover:bg-gray-500 transition-colors">חזרה</a>
    <a href="#/states" class="w-full sm:w-auto px-6 py-3 bg-orange-500 text-white font-bold text-lg sm:text-xl rounded-full shadow-md hover:bg-orange-600 transition-colors">אני מוכן!</a>
</div>
`;

export function init(page) {
    const canvas = page.root.querySelector('#particle-canvas-6-heat');
    const ctx = canvas.getContext('2d');
    const slider = page.root.querySelector('#temp-slider-6');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const numParticles = Math.min(50, Math.floor(canvas.width * canvas.height / 3000));
    const particles = [];
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius: Math.max(3, Math.min(7, canvas.width / 80))
        });
    }

    page.frame(() => {
        const speed = parseFloat(slider.value) / 100;
        const hue = 240 - (speed * 240);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.x += p.vx * speed * 4;
            p.y += p.vy * speed * 4;

            if (p.x < p.radius || p.x > canvas.width - p.radius) p.vx *= -1;
            if (p.y < p.radius || p.y > canvas.height - p.radius) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${hue}, 90%, 55%)`;
            ctx.fill();
        });
    });
}
