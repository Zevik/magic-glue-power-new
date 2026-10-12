import { sfx } from '../lib/audio.js';
import { burstAt } from '../lib/fx.js';

export const slug = 'invisible-force';
export const title = 'הכוח הנעלם';
export const chapter = 'כוח נוסף';
export const icon = 'sparkle';
export const nextLabel = 'יוצאים לחקור';

export const sectionClass = 'theme-invisible-force';

export const html = `
<h2 class="title">יש עוד כוח. והוא <em>נעלם</em>.</h2>
<p class="lead">לא רואים אותו, לא שומעים אותו, ובכל זאת הוא עובד כל רגע. נסו לגעת בשלוש תעלומות, ותראו איפה הוא מסתתר:</p>
<div class="icon-row">
    <button type="button" class="mystery-tile" data-q="למה קשה לקרוע נייר?">
        <span class="tile-tag">התעלומה נרשמה</span>
        <svg viewBox="0 0 120 120" aria-hidden="true">
            <path d="M14 14h46l6 10-5 9 6 10-6 9 5 10-6 9 5 9-6 10H14Z" fill="#fffdf6" stroke="#d8cda0" stroke-width="2.5" transform="rotate(-7 40 60)"/>
            <path d="M60 16h46v94H60l5-9-6-10 6-9-6-10 5-9-6-10 6-9Z" fill="#fffdf6" stroke="#d8cda0" stroke-width="2.5" transform="rotate(6 90 60) translate(10,-2)"/>
            <line x1="24" y1="34" x2="46" y2="34" stroke="#cbbd85" stroke-width="4" stroke-linecap="round" transform="rotate(-7 40 60)"/>
            <line x1="24" y1="46" x2="42" y2="46" stroke="#cbbd85" stroke-width="4" stroke-linecap="round" transform="rotate(-7 40 60)"/>
            <line x1="78" y1="34" x2="98" y2="34" stroke="#cbbd85" stroke-width="4" stroke-linecap="round" transform="rotate(6 90 60) translate(10,-2)"/>
        </svg>
        <span class="tile-q">נייר</span>
    </button>
    <button type="button" class="mystery-tile" data-q="למה מים נאספים לטיפה?">
        <span class="tile-tag">התעלומה נרשמה</span>
        <svg viewBox="0 0 120 120" aria-hidden="true">
            <defs>
                <radialGradient id="if-drop" cx="35%" cy="28%" r="75%">
                    <stop offset="0%" stop-color="#e0f7ff"/>
                    <stop offset="55%" stop-color="#38bdf8"/>
                    <stop offset="100%" stop-color="#0369a1"/>
                </radialGradient>
            </defs>
            <path d="M60 14C60 14 92 58 92 82a32 32 0 0 1-64 0C28 58 60 14 60 14Z" fill="url(#if-drop)"/>
            <ellipse cx="46" cy="66" rx="9" ry="13" fill="#ffffff" opacity="0.55"/>
            <path d="M78 20c4 6 8 10 8 16M90 8c3 5 6 8 6 13" stroke="#bae6fd" stroke-width="4" stroke-linecap="round" opacity="0.8" fill="none"/>
        </svg>
        <span class="tile-q">טיפת מים</span>
    </button>
    <button type="button" class="mystery-tile" data-q="איך דבק מצליח להדביק?">
        <span class="tile-tag">התעלומה נרשמה</span>
        <svg viewBox="0 0 120 120" aria-hidden="true">
            <path d="M46 18h28v14l8 8v58a10 10 0 0 1-10 10H48a10 10 0 0 1-10-10V40l8-8Z" fill="#fffdf6" stroke="#d8cda0" stroke-width="2.5"/>
            <rect x="42" y="10" width="36" height="12" rx="4" fill="#f97316"/>
            <rect x="40" y="52" width="40" height="26" rx="4" fill="#38bdf8" opacity="0.85"/>
            <path d="M60 78c6 8 6 14 0 18-6-4-6-10 0-18Z" fill="#38bdf8"/>
        </svg>
        <span class="tile-q">דבק</span>
    </button>
</div>
<p class="callout" id="force-question" aria-live="polite">מה עושה כל אחד מהם? <b>שלוש תעלומות, כוח סודי אחד.</b></p>
<p class="insight" id="force-insight">הוא הסיבה שקשה לקרוע נייר, שטיפות מים נאספות לכדור ושדבק... נדבק. כולם עובדים באותו כוח נעלם, והוא נמצא בכל מקום. <b>בואו נלך לראות אותו מקרוב.</b></p>
`;

export function init(page) {
    const tiles = [...page.root.querySelectorAll('.mystery-tile')];
    const question = page.root.querySelector('#force-question');
    const insight = page.root.querySelector('#force-insight');
    const seen = new Set();

    tiles.forEach((tile, i) => tile.addEventListener('click', () => {
        const first = !tile.classList.contains('seen');
        tile.classList.add('seen');
        seen.add(i);
        question.innerHTML = `<b>${tile.dataset.q}</b>`;
        sfx.reveal();
        burstAt(tile, { count: 14 });
        if (first && seen.size === tiles.length) {
            insight.classList.add('show');
            sfx.success();
            page.ready();
        }
    }, { signal: page.signal }));
}
