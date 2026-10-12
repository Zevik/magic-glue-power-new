import { sfx } from '../lib/audio.js';
import { discover } from '../lib/progress.js';
import { confetti } from '../lib/fx.js';

export const slug = 'mysteries';
export const title = 'פותרים את התעלומות';
export const chapter = 'פותרים תעלומות';
export const icon = 'search';
export const nextLabel = 'נשאר סוד ענק אחד...';

export const sectionClass = 'theme-mysteries';

const MYSTERIES = [
    { q: 'למה קשה לקרוע נייר?', m1: '#f59e0b', m2: '#f97316',
      short: 'כי צריך לפרק שרשראות סבוכות.',
      long: 'נייר עשוי מצורונים ארוכים מאוד, כמו ספגטי, שמסתבכים זה בזה. כוח הדבקסם ביניהם חזק. כדי לקרוע, צריך להשקיע כוח ולהפריד את כל השרשראות האלה, אחת אחת.' },
    { q: 'לאן הסוכר "נעלם" במים?', m1: '#06b6d4', m2: '#3b82f6',
      short: 'הוא לא נעלם. הוא התפזר.',
      long: 'צורוני המים הקטנים והזריזים מקיפים את צורוני הסוכר הגדולים, נדבקים אליהם מכל הכיוונים ומושכים אותם אחד־אחד, עד שהם מפוזרים בכל הכוס. אפשר לטעום: הסוכר עדיין שם.' },
    { q: 'מה זה בעצם דבק?', m1: '#84cc16', m2: '#16a34a',
      short: 'גשר של צורונים דביקים בין שני משטחים.',
      long: 'דבק עשוי מצורונים ארוכים ודביקים במיוחד. כשהוא רטוב הם זורמים לתוך החריצים הקטנים של שני הדפים. כשהוא מתייבש הם נאחזים בדף אחד, בדף השני, וזה בזה, והדבקסם בונה גשר חזק.' },
    { q: 'למה טיפות מים נהיות כדוריות על מחבת שומנית?', m1: '#ec4899', m2: '#a855f7',
      short: 'כי המים מעדיפים להיצמד זה לזה.',
      long: 'צורוני המים נמשכים חזק מאוד זה לזה, וכמעט לא נמשכים לצורוני השמן. אז במקום להימרח על המחבת הם מתאספים הכי צפוף שאפשר, והצורה הכי צפופה היא... כדור.' },
    { q: 'למה גומייה קופצת חזרה כשמותחים אותה?', m1: '#22c55e', m2: '#0ea5e9',
      short: 'הדבקסם מחזיר את הצורונים הביתה.',
      long: 'כשמותחים גומייה מרחיקים את הצורונים הארוכים שלה זה מזה, נגד הדבקסם שרוצה לאסוף אותם. ברגע שמשחררים, הכוח מנצח ומחזיר את כולם למקום. מה שאתם מרגישים כקפיצה הוא ההחזרה הזאת.' },
    { q: 'למה קשה לכופף מזלג מתכת?', m1: '#f97316', m2: '#dc2626',
      short: 'כי הגולות שלו נעולות בשורות צפופות.',
      long: 'צורוני המתכת מסודרים בשורות צפופות, נעולות זו בזו בדבקסם חזק מאוד. כדי לכופף צריך לדחוף את כל השורות למקום חדש בבת אחת, וגם אז חלק מהצורונים "מתגעגעים" למקום הישן.' },
    { q: 'למה שומעים "קראק" כשמקל נשבר?', m1: '#a78bfa', m2: '#4338ca',
      short: 'כי הרבה קשרים משתחררים ברגע אחד.',
      long: 'כשמכופפים מקל, מותחים יותר ויותר את הדבקסם בין הצורונים בצד החיצוני שלו, עד שהוא נכנע ומשתחרר בבת אחת. כל השחרורים האלה יחד הם הרעש שאתם שומעים.' }
];

export const html = `
<h2 class="title">עכשיו אתם <em>מומחים</em></h2>
<p class="lead">בואו נחזור לשאלות שהתחלנו איתן. לחצו על כל שאלה, ונראה אם אתם כבר יודעים את התשובה.</p>
<div class="quest-bar"><span class="chip" id="quest-count">0 מתוך ${MYSTERIES.length}</span><div class="quest-dots" aria-hidden="true">${MYSTERIES.map(() => '<i></i>').join('')}</div></div>
<div class="mystery-list">
${MYSTERIES.map((m, i) => `    <div class="mystery-container">
        <button type="button" class="mystery-note" data-mystery="${i}" aria-expanded="false" style="--m1: ${m.m1}; --m2: ${m.m2};">${m.q}</button>
        <div class="answer"><div><p class="short">${m.short}</p><p class="long">${m.long}</p></div></div>
    </div>`).join('\n')}
</div>
`;

export function init(page) {
    const count = page.root.querySelector('#quest-count');
    const dots = [...page.root.querySelectorAll('.quest-dots i')];
    const opened = new Set();

    page.root.querySelectorAll('[data-mystery]').forEach(note => {
        note.addEventListener('click', () => {
            const i = Number(note.dataset.mystery);
            const container = note.parentElement;
            const answer = container.querySelector('.answer');
            const open = answer.classList.toggle('visible');
            container.classList.toggle('open', open);
            note.setAttribute('aria-expanded', String(open));
            if (!open) { sfx.tap(); return; }
            sfx.reveal();
            if (opened.has(i)) return;
            opened.add(i);
            dots[opened.size - 1].classList.add('on');
            count.textContent = `${opened.size} מתוך ${MYSTERIES.length}`;
            if (opened.size === MYSTERIES.length) {
                discover('mysteries');
                confetti({ count: 90 });
                sfx.success();
                page.ready();
            }
        }, { signal: page.signal });
    });
}
