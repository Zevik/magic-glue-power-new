import { sfx } from '../lib/audio.js';
import { confetti } from '../lib/fx.js';
import { discoveryCount, discoveryTotal } from '../lib/progress.js';
import { icon as svg } from '../lib/icons.js';

export const slug = 'summary';
export const title = 'השמות האמיתיים';
export const chapter = 'השמות האמיתיים';
export const icon = 'trophy';
export const nav = false;

export const sectionClass = 'theme-summary';

const NAME_KEY = 'dabkesem.name';

const CARDS = [
    {
        q: '"כוח הדבקסם" הוא בעצם...', name: 'הכוח האלקטרו־מגנטי', sub: 'המשיכה והדחייה בין חלקיקים טעונים בחשמל',
        f1: '#fde047', f2: '#fb923c',
        art: '<svg class="flip-art" viewBox="0 0 64 64" aria-hidden="true"><path d="M36 6 18 36h12l-4 22 20-32H34Z" fill="#fde047" stroke="#f59e0b" stroke-width="3" stroke-linejoin="round"/></svg>'
    },
    {
        q: 'ה"גולות" שלנו הן בעצם...', name: 'אטומים', sub: 'אבני הבניין הקטנות של כל חומר בעולם',
        f1: '#fca5a5', f2: '#f472b6',
        art: '<svg class="flip-art" viewBox="0 0 64 64" aria-hidden="true"><defs><radialGradient id="sm-g" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fecaca"/><stop offset="0.5" stop-color="#ef4444"/><stop offset="1" stop-color="#7f1d1d"/></radialGradient></defs><circle cx="32" cy="32" r="22" fill="url(#sm-g)"/><ellipse cx="24" cy="22" rx="7" ry="4" transform="rotate(-35 24 22)" fill="rgba(255,255,255,0.75)"/></svg>'
    },
    {
        q: 'ה"צורונים" שלנו הם בעצם...', name: 'מולקולות', sub: 'אטומים שחוברו יחד לחלקיק אחד שלם',
        f1: '#93c5fd', f2: '#67e8f9',
        art: '<svg class="flip-art" viewBox="0 0 64 64" aria-hidden="true"><defs><radialGradient id="sm-m" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#bfdbfe"/><stop offset="0.5" stop-color="#3b82f6"/><stop offset="1" stop-color="#1e3a8a"/></radialGradient></defs><path d="M18 40 32 20 46 40" stroke="rgba(255,255,255,0.5)" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="32" cy="20" r="11" fill="url(#sm-m)"/><circle cx="17" cy="42" r="9" fill="url(#sm-m)"/><circle cx="47" cy="42" r="9" fill="url(#sm-m)"/></svg>'
    }
];

export const html = `
<h2 class="title">השמות <em>האמיתיים</em></h2>
<p class="lead">עברתם מסע ארוך וגיליתם את הסודות הגדולים של העולם. נשאר דבר אחד: המדענים קוראים לכל זה בשמות אחרים. לחצו על כל קלף וגלו אותם.</p>
<div class="flip-grid">
${CARDS.map((c, i) => `    <button type="button" class="flip" data-flip="${i}" style="--f1: ${c.f1}; --f2: ${c.f2};" aria-label="${c.q} לחצו כדי לגלות">
        <span class="flip-face card flip-front">${c.art}<span class="flip-q">${c.q}</span><span class="flip-name" style="--f1: #fff; --f2: #fff;">?</span><span class="flip-tap">לחצו כדי לגלות</span></span>
        <span class="flip-face card flip-back"><span class="flip-q">${c.q.replace('...', '')}</span><span class="flip-name">${c.name}</span><span class="flip-sub">${c.sub}</span></span>
    </button>`).join('\n')}
</div>
<div id="finale" class="hidden print-me">
    <p class="lead">עכשיו אתם לא רק יודעים איך העולם עובד, אתם גם יודעים לדבר כמו מדענים. כתבו את השם שלכם וקבלו תעודה.</p>
    <input id="cert-input" class="name-input" type="text" maxlength="24" placeholder="השם שלכם" aria-label="השם שלכם לתעודה" autocomplete="off">
    <div class="certificate" id="certificate">
        <div class="cert-small">תעודת הוקרה</div>
        <div class="cert-title">מגלי הכוח הנעלם</div>
        <div class="cert-line">מוענקת בגאווה ל</div>
        <div class="cert-name" id="cert-name">&nbsp;</div>
        <div class="cert-line">על שהצליחו לראות את מה שאי אפשר לראות, ולהבין איך גולות, צורונים וכוח דבקסם מחזיקים את העולם.</div>
        <div class="cert-score" id="cert-score"></div>
    </div>
</div>
<div class="actions" id="summary-actions">
    <a href="#/smell" class="btn btn-ghost btn-back">${svg('arrow', { size: 20, stroke: 2.4 })}<span>חזרה</span></a>
    <button type="button" id="print-btn" class="btn btn-ghost hidden">הדפסת התעודה</button>
    <a href="#/start" class="btn btn-big btn-pulse">להתחיל מחדש</a>
</div>
`;

export function init(page) {
    const flips = [...page.root.querySelectorAll('.flip')];
    const finale = page.root.querySelector('#finale');
    const input = page.root.querySelector('#cert-input');
    const certName = page.root.querySelector('#cert-name');
    const score = page.root.querySelector('#cert-score');
    const printBtn = page.root.querySelector('#print-btn');
    let revealed = 0;

    score.textContent = `גילויים שנאספו במסע: ${discoveryCount()} מתוך ${discoveryTotal()}`;

    try { input.value = localStorage.getItem(NAME_KEY) || ''; } catch { /* storage blocked */ }
    certName.textContent = input.value || ' ';
    input.addEventListener('input', () => {
        certName.textContent = input.value.trim() || ' ';
        try { localStorage.setItem(NAME_KEY, input.value.trim()); } catch { /* storage blocked */ }
    }, { signal: page.signal });

    printBtn.addEventListener('click', () => window.print(), { signal: page.signal });

    flips.forEach(card => card.addEventListener('click', () => {
        if (card.classList.contains('flipped')) return;
        card.classList.add('flipped');
        sfx.reveal();
        revealed++;
        if (revealed === flips.length) {
            page.timeout(() => {
                confetti({ count: 160 });
                sfx.success();
                finale.classList.remove('hidden');
                finale.classList.add('reveal-in');
                printBtn.classList.remove('hidden');
                finale.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 700);
        }
    }, { signal: page.signal }));
}
