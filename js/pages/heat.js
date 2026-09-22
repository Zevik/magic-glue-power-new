import { marbleSprite, drawMarble } from '../lib/marble-sprite.js';

export const slug = 'heat';
export const title = 'ריקוד הגולות';
export const reinitOnResize = true;

export const sectionClass = 'theme-heat';

export const html = `
<span class="kicker">🔥 שלב 6</span>
<h2 class="title">ריקוד הגולות</h2>
<p class="lead">כל הגולות רוקדות, רועדות ומתנגשות. למה? התשובה היא חום! כשאנחנו מחממים משהו, אנחנו גורמים לגולות שלו לזוז מהר יותר. שחקו עם מד הטמפרטורה וראו מה קורה לגולות!</p>
<canvas id="particle-canvas-6-heat" class="glass-canvas"></canvas>
<div class="slider-row">
    <span class="emoji">❄️</span>
    <input id="temp-slider-6" type="range" min="0" max="100" value="10" class="temp-slider" aria-label="טמפרטורה">
    <span class="emoji">☀️</span>
</div>
<p class="lead">וכך בדיוק עובד מדחום: הגולות המהירות שבחוץ "מכות" בו כל הזמן. ככל שהן מהירות יותר, הן דוחפות חזק יותר את הגולות שבתוך הצינורית הדקה שלו - וכשהגולות בפנים זזות יותר, הן תופסות יותר מקום ומטפסות למעלה!</p>
<p class="callout callout-soft">זה כלל ממש חשוב: <b>חום = תנועה של גולות!</b> עכשיו אנחנו מוכנים לחבר את כל החלקים ולפתור את התעלומה הגדולה!</p>
<div class="actions">
    <a href="#/air" class="btn btn-ghost">חזרה</a>
    <a href="#/states" class="btn">אני רוצה לגלות!</a>
</div>
`;

export function init(page) {
    const canvas = page.root.querySelector('#particle-canvas-6-heat');
    const ctx = canvas.getContext('2d');
    const slider = page.root.querySelector('#temp-slider-6');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const radius = Math.max(7, Math.min(11, canvas.width / 38));
    const numParticles = Math.min(45, Math.floor(canvas.width * canvas.height / 4200));
    const particles = [];
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius
        });
    }

    page.frame(() => {
        const speed = parseFloat(slider.value) / 100;
        const hue = Math.round((240 - speed * 240) / 12) * 12; // a handful of colours, each drawn once
        const sprite = marbleSprite(hue, 90, 55, radius);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.x += p.vx * speed * 4;
            p.y += p.vy * speed * 4;

            if (p.x < p.radius || p.x > canvas.width - p.radius) p.vx *= -1;
            if (p.y < p.radius || p.y > canvas.height - p.radius) p.vy *= -1;

            drawMarble(ctx, sprite, p.x, p.y, p.radius);
        });
    });
}
