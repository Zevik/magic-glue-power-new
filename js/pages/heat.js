import { fitCanvas, lerp } from '../lib/canvas.js';
import { marbleSprite, drawMarble, drawGlow } from '../lib/marble-sprite.js';
import { createGas } from '../lib/sim.js';
import { icon as svg } from '../lib/icons.js';
import { sfx } from '../lib/audio.js';
import { discover } from '../lib/progress.js';

export const slug = 'heat';
export const title = 'ריקוד הגולות';
export const chapter = 'ריקוד הגולות';
export const icon = 'flame';
export const nextLabel = 'מחברים את הכול';
export const reinitOnResize = true;

export const sectionClass = 'theme-heat';

export const html = `
<h2 class="title">חום הוא <em>ריקוד</em></h2>
<p class="lead">הגולות לא עומדות במקום. הן רוקדות, רועדות ומתנגשות כל הזמן. ומה קובע כמה מהר הן רוקדות? <b>החום.</b> שחקו עם הסליידר, וראו.</p>
<div class="heat-row">
    <canvas id="particle-canvas-6-heat" class="glass-canvas" aria-label="גולות שנעות מהר יותר ככל שחם יותר"></canvas>
    <div class="thermo" aria-hidden="true"><div class="thermo-tube"><div class="thermo-mercury" id="mercury"></div></div><div class="thermo-bulb"></div></div>
</div>
<div class="slider-row">
    <span class="cold">${svg('snow', { size: 32 })}</span>
    <input id="temp-slider-6" type="range" min="0" max="100" value="10" class="temp-slider" aria-label="טמפרטורה">
    <span class="hot">${svg('sun', { size: 32 })}</span>
</div>
<p class="chip" id="heat-label">קר מאוד</p>
<p class="insight" id="heat-insight">זה כלל חשוב מאוד: <b>חום = תנועה של גולות</b>. במדחום, הגולות המהירות מכות בנוזל שבצינורית ודוחפות אותו, והוא עולה למעלה. עכשיו אנחנו מוכנים לחבר את כל החלקים.</p>
<details class="deep">
    <summary>למבוגרים סקרנים</summary>
    <p>טמפרטורה היא מדד לאנרגיית התנועה הממוצעת של החלקיקים. באפס מוחלט (בערך 273 מעלות מתחת לאפס) כמעט כל התנועה נפסקת. שימו לב שבגז האמיתי ההתנגשויות אלסטיות, ולכן האנרגיה הכוללת נשמרת. החום הוא רק המהירות הממוצעת.</p>
</details>
`;

const LABELS = [[18, 'קר מאוד'], [38, 'קר'], [62, 'פושר'], [84, 'חם'], [101, 'לוהט!']];

export function init(page) {
    const canvas = page.root.querySelector('#particle-canvas-6-heat');
    const slider = page.root.querySelector('#temp-slider-6');
    const mercury = page.root.querySelector('#mercury');
    const thermo = page.root.querySelector('.thermo');
    const label = page.root.querySelector('#heat-label');
    const insight = page.root.querySelector('#heat-insight');
    const { ctx, W, H, dpr } = fitCanvas(canvas);

    const r = Math.max(7, Math.min(11, W / 34));
    const count = Math.min(46, Math.floor(W * H / 4200));
    const sim = createGas({ W, H, r, count, speed: 2, onCollide: (a, b, impact) => { if (impact > 2.5 && temp > 0.15) sfx.click(); } });

    let temp = parseFloat(slider.value) / 100;
    let sawHot = false, sawCold = false, revealed = false;
    const hueOf = t => Math.round((240 - t * 240) / 12) * 12; // a handful of colours, each drawn once

    page.frame(() => {
        const target = parseFloat(slider.value) / 100;
        temp = lerp(temp, target, 0.12);
        const speedScale = 0.06 + temp * 1.5;
        sim.step(speedScale);

        const hue = hueOf(temp);
        const sprite = marbleSprite(hue, 90, 55, r, dpr);
        ctx.clearRect(0, 0, W, H);
        for (const p of sim.p) {
            if (temp > 0.4) drawGlow(ctx, p.x, p.y, r, hue, (temp - 0.4) * 0.6);
            drawMarble(ctx, sprite, p.x, p.y, r);
        }

        const color = `hsl(${hue}, 90%, 58%)`;
        thermo.style.setProperty('--merc', color);
        mercury.style.transform = `scaleY(${(0.08 + temp * 0.92).toFixed(3)})`;

        const pct = target * 100;
        const text = LABELS.find(([limit]) => pct < limit)[1];
        if (label.textContent !== text) label.textContent = text;

        if (pct > 85) sawHot = true;
        if (pct < 15) sawCold = true;
        if (!revealed && sawHot && sawCold) {
            revealed = true;
            discover('heat');
            insight.classList.add('show');
            sfx.success();
            page.ready();
        }
    });
}
