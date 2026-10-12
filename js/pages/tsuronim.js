import { fitCanvas } from '../lib/canvas.js';
import { createMolecule, MOLECULES } from '../lib/molecule3d.js';
import { sfx } from '../lib/audio.js';
import { discover } from '../lib/progress.js';
import { burstAt } from '../lib/fx.js';

export const slug = 'tsuronim';
export const title = 'הכירו את הצורונים';
export const chapter = 'הצורונים';
export const icon = 'atoms';
export const nextLabel = 'מה מחזיק אותם?';
export const reinitOnResize = true;

export const sectionClass = 'theme-tsuronim';

const CARDS = [
    { id: 'water', name: 'צורון של מים', note: 'שלוש גולות: אחת גדולה ושתיים קטנות, שמתחבקות בזווית.' },
    { id: 'oil', name: 'צורון של שמן', note: 'שרשרת ארוכה ומתפתלת של ארבע־עשרה גולות.' },
    { id: 'alcohol', name: 'צורון של אלכוהול', note: 'שלוש גולות בשורה קצרה וקומפקטית.' },
    { id: 'soap', name: 'צורון של סבון', note: 'ראש כחול שאוהב מים, וזנב ארוך שבורח מהם.' }
];

export const html = `
<h2 class="title">הכירו את ה<em>צוּרוֹנִים</em></h2>
<p class="lead">לפעמים כמה גולות נדבקות זו לזו כל כך חזק, שהן נהיות <b>גולת־על</b> אחת שלמה. קראנו לה <b>צורון</b>. לכל חומר יש צורון משלו. הגולות מפוזרות עכשיו, ותפקידכם להרכיב: לחצו על כל קלף.</p>
<div class="mol-grid">
${CARDS.map(c => `    <button type="button" class="card mol-card" data-mol="${c.id}">
        <h3>${c.name}</h3>
        <canvas aria-label="${c.name}"></canvas>
        <span class="mol-note">${c.note}</span>
        <span class="mol-cta">לחצו להרכבה</span>
    </button>`).join('\n')}
</div>
<p class="insight" id="tsuronim-insight">ארבעה חומרים, ארבעה צורונים. <b>הצורה של הצורון קובעת איך החומר מתנהג</b>: למה מים זורמים, שמן מחליק וסבון מנקה. אבל מה מחזיק את הגולות בתוך כל צורון ואת הצורונים זה לצד זה?</p>
<details class="deep">
    <summary>למבוגרים סקרנים</summary>
    <p>מולקולת מים היא H<sub>2</sub>O: אטום חמצן ושני אטומי מימן בזווית של כ-104.5 מעלות. מולקולת סבון היא "דו־פנים": ראש הידרופילי שנמשך למים וזנב הידרופובי שנמשך לשומן, ולכן סבון מצליח לתפוס שומן ולהתיר אותו במים.</p>
</details>
`;

export function init(page) {
    const cards = [...page.root.querySelectorAll('.mol-card')];
    const insight = page.root.querySelector('#tsuronim-insight');

    const mols = cards.map(card => {
        const canvas = card.querySelector('canvas');
        const view = fitCanvas(canvas);
        const mol = createMolecule(canvas, MOLECULES[card.dataset.mol], view);
        card.addEventListener('click', () => {
            if (mol.built) return;
            mol.build(performance.now());
            sfx.whoosh();
            page.timeout(() => {
                sfx.snap();
                card.classList.add('built');
                card.querySelector('.mol-cta').textContent = 'הורכב!';
                burstAt(card, { count: 16 });
                if (mols.every(m => m.mol.built)) {
                    discover('build');
                    insight.classList.add('show');
                    page.ready();
                }
            }, 520);
        }, { signal: page.signal });
        return { mol, view };
    });

    page.frame(now => {
        for (const { mol, view } of mols) {
            view.ctx.clearRect(0, 0, view.W, view.H);
            mol.draw(now);
        }
    });
}
