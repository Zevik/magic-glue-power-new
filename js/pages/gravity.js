import { fitCanvas, TAU, rand } from '../lib/canvas.js';
import { drawShadow } from '../lib/marble-sprite.js';
import { sfx } from '../lib/audio.js';
import { discover } from '../lib/progress.js';
import { burst } from '../lib/fx.js';

export const slug = 'gravity';
export const title = 'הכוח המוכר';
export const chapter = 'הכוח המוכר';
export const icon = 'apple';
export const nextLabel = 'מהו הכוח האחר?';
export const reinitOnResize = true;

export const sectionClass = 'theme-gravity';

export const html = `
<h2 class="title">התפוח תמיד <em>נופל למטה</em></h2>
<p class="lead">את זה כולם יודעים: משהו מושך כל דבר אל האדמה. קוראים לו כוח הכבידה.</p>
<div class="stage apple-stage"><canvas id="apple-canvas" aria-label="תפוח על ענף. לחצו כדי לשחרר אותו"></canvas></div>
<p class="hint" id="apple-hint">לחצו על התפוח כדי לשחרר אותו</p>
<p class="callout callout-soft">אבל הנה הפתעה: <b>כבידה היא כוח חלש מאוד.</b> מגנט קטן מהמקרר מרים סיכה מהשולחן, וכל כדור הארץ מושך אותה למטה ולא מצליח לנצח אותו. אז מי מחזיק את המגנט, את הסיכה ואת התפוח עצמו שלא יתפורר?</p>
<details class="deep">
    <summary>למבוגרים סקרנים</summary>
    <p>הכוח החשמלי בין שני פרוטונים חזק מהכבידה ביניהם בכ-10<sup>36</sup> פעמים, מספר עם שלושים ושש אפסים. הכבידה מנצחת בקנה מידה של כוכבי לכת רק מפני שהיא תמיד מושכת, בעוד שכוחות חשמליים מתקזזים כמעט לגמרי בין מטענים חיוביים ושליליים.</p>
</details>
`;

export function init(page) {
    const canvas = page.root.querySelector('#apple-canvas');
    const hint = page.root.querySelector('#apple-hint');
    const { ctx, W, H } = fitCanvas(canvas);

    const groundY = H - 38;
    const R = Math.min(34, W / 9);
    const hang = { x: W * 0.5, y: H * 0.2 + R };
    const apple = { x: hang.x, y: hang.y, vy: 0, vx: 0, rot: 0, vrot: 0, squash: 0, state: 'hanging' };
    let dust = [];
    let landed = false;
    let shake = 0;

    function drop() {
        if (apple.state !== 'hanging') return;
        apple.state = 'falling';
        apple.vx = rand(-0.4, 0.4);
        apple.vrot = rand(-0.05, 0.05);
        sfx.whoosh();
        hint.textContent = 'כבידה בפעולה...';
    }

    function reset() {
        apple.state = 'hanging';
        apple.x = hang.x; apple.y = hang.y; apple.vy = 0; apple.vx = 0; apple.rot = 0; apple.vrot = 0; apple.squash = 0;
        hint.textContent = 'לחצו על התפוח כדי לשחרר אותו';
    }

    canvas.addEventListener('pointerdown', () => {
        if (apple.state === 'hanging') drop();
        else if (apple.state === 'rest') { reset(); sfx.tap(); }
    }, { signal: page.signal });

    // Apple tree branch drawn once per frame; it's cheap
    function drawBranch() {
        ctx.strokeStyle = '#6b4423';
        ctx.lineCap = 'round';
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.moveTo(W * 1.05, H * 0.04);
        ctx.quadraticCurveTo(W * 0.78, H * 0.02, W * 0.52, H * 0.07);
        ctx.stroke();
        ctx.lineWidth = 7;
        ctx.strokeStyle = '#835430';
        ctx.beginPath();
        ctx.moveTo(W * 0.52, H * 0.07);
        ctx.lineTo(hang.x + 2, hang.y - R * 1.15);
        ctx.stroke();
        // leaves
        ctx.fillStyle = '#3f9a3c';
        for (const [lx, ly, rot] of [[0.62, 0.075, -0.6], [0.7, 0.05, 0.5], [0.56, 0.1, 0.9]]) {
            ctx.save();
            ctx.translate(W * lx, H * ly);
            ctx.rotate(rot);
            ctx.beginPath();
            ctx.ellipse(0, 0, 22, 9, 0, 0, TAU);
            ctx.fill();
            ctx.restore();
        }
    }

    function drawApple() {
        ctx.save();
        ctx.translate(apple.x, apple.y);
        ctx.rotate(apple.rot);
        ctx.scale(1 + apple.squash * 0.35, 1 - apple.squash * 0.35);
        const body = ctx.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.1, 0, 0, R * 1.1);
        body.addColorStop(0, '#ff8a80');
        body.addColorStop(0.45, '#e53935');
        body.addColorStop(1, '#7f1010');
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.moveTo(0, -R * 0.78);
        ctx.bezierCurveTo(R * 0.35, -R * 1.12, R * 1.1, -R * 0.75, R * 1.02, R * 0.05);
        ctx.bezierCurveTo(R * 0.95, R * 0.9, R * 0.35, R * 1.12, 0, R * 0.92);
        ctx.bezierCurveTo(-R * 0.35, R * 1.12, -R * 0.95, R * 0.9, -R * 1.02, R * 0.05);
        ctx.bezierCurveTo(-R * 1.1, -R * 0.75, -R * 0.35, -R * 1.12, 0, -R * 0.78);
        ctx.fill();
        // shine
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.beginPath();
        ctx.ellipse(-R * 0.45, -R * 0.38, R * 0.17, R * 0.3, 0.6, 0, TAU);
        ctx.fill();
        // stem and leaf
        ctx.strokeStyle = '#5a3a1a';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -R * 0.78);
        ctx.quadraticCurveTo(R * 0.06, -R * 1.1, R * 0.2, -R * 1.28);
        ctx.stroke();
        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.ellipse(R * 0.42, -R * 1.02, R * 0.3, R * 0.13, -0.5, 0, TAU);
        ctx.fill();
        ctx.restore();
    }

    page.frame(() => {
        // physics
        if (apple.state === 'falling') {
            apple.vy += 0.55;
            apple.y += apple.vy;
            apple.x += apple.vx;
            apple.rot += apple.vrot;
            if (apple.y + R * 0.95 >= groundY) {
                apple.y = groundY - R * 0.95;
                const impact = apple.vy;
                if (impact > 2) {
                    sfx.thud();
                    apple.squash = Math.min(1, impact / 16);
                    shake = Math.min(8, impact * 0.5);
                    for (let i = 0; i < 14; i++) dust.push({ x: apple.x + rand(-R, R), y: groundY, vx: rand(-2.2, 2.2), vy: rand(-2.2, -0.4), life: 1, r: rand(3, 8) });
                }
                apple.vy = -impact * 0.38;
                apple.vx *= 0.7;
                apple.vrot *= 0.5;
                if (Math.abs(apple.vy) < 1.6) {
                    apple.vy = 0; apple.state = 'rest';
                    hint.textContent = 'שוב? לחצו על התפוח כדי להחזיר אותו לענף';
                    if (!landed) {
                        landed = true;
                        discover('apple');
                        page.ready();
                        const b = canvas.getBoundingClientRect();
                        burst(b.left + apple.x, b.top + groundY - 30, { count: 20, speed: 4 });
                    }
                }
            }
        }
        apple.squash *= 0.86;
        shake *= 0.85;
        dust.forEach(d => { d.x += d.vx; d.y += d.vy; d.vy += 0.05; d.life -= 0.03; });
        dust = dust.filter(d => d.life > 0);

        // drawing
        ctx.clearRect(0, 0, W, H);
        ctx.save();
        ctx.translate(rand(-shake, shake) * 0.4, rand(-shake, shake) * 0.4);

        // ground
        const grass = ctx.createLinearGradient(0, groundY, 0, H);
        grass.addColorStop(0, '#5cb85c');
        grass.addColorStop(1, '#2f7a3a');
        ctx.fillStyle = grass;
        ctx.beginPath();
        ctx.roundRect(0, groundY, W, H - groundY, [0, 0, 22, 22]);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.fillRect(0, groundY, W, 3);

        drawBranch();

        const height = Math.max(0, groundY - apple.y);
        drawShadow(ctx, apple.x, groundY + 4, R * (1 - Math.min(0.5, height / 400)), 0.45 - Math.min(0.3, height / 600));

        // gentle sway while it hangs
        if (apple.state === 'hanging') {
            const sway = Math.sin(performance.now() / 700) * 0.06;
            apple.rot = sway;
            apple.x = hang.x + Math.sin(performance.now() / 700) * 2;
        }
        drawApple();

        ctx.fillStyle = 'rgba(220, 200, 160, 0.9)';
        dust.forEach(d => {
            ctx.globalAlpha = Math.max(0, d.life) * 0.6;
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r * (2 - d.life), 0, TAU);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // falling arrow: a visual "pull" so the force can be seen
        if (apple.state === 'falling') {
            ctx.strokeStyle = 'rgba(255, 238, 120, 0.85)';
            ctx.lineWidth = 4;
            ctx.setLineDash([2, 10]);
            ctx.beginPath();
            ctx.moveTo(apple.x, apple.y - R - 30);
            ctx.lineTo(apple.x, apple.y - R * 1.3);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        ctx.restore();
    });
}
