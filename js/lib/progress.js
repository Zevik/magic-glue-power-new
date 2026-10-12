// The discoveries the visitor has made along the way. Saved in the browser, so coming back
// later does not start from zero.

import { sfx } from './audio.js';

const KEY = 'dabkesem.discoveries.v1';

export const DISCOVERIES = {
    apple: 'הכבידה: התפוח נופל תמיד למטה',
    'scope-solid': 'המוצק: גולות רועדות במקומן',
    'scope-liquid': 'הנוזל: גולות שמחליקות זו על זו',
    'scope-gas': 'הגז: גולות שעפות לכל כיוון',
    pull: 'כוח הדבקסם מושך חזרה',
    'air-cool': 'אוויר קר מתחיל להידבק',
    heat: 'חום הוא תנועה של גולות',
    melt: 'הקרח נמס',
    boil: 'המים רותחים והופכים לגז',
    build: 'בניתם ארבעה צורונים',
    'water-pull': 'הפרדתם צורוני מים',
    'oil-pull': 'הפרדתם צורוני שמן',
    mysteries: 'פתרתם את שבע התעלומות',
    fire: 'הצתתם תגובה כימית',
    puddle: 'השלולית התייבשה',
    smell: 'הריח הגיע עד האף'
};

let found = new Set();
try { found = new Set(JSON.parse(localStorage.getItem(KEY) || '[]').filter(id => id in DISCOVERIES)); } catch { /* storage blocked */ }

export const discoveryCount = () => found.size;
export const discoveryTotal = () => Object.keys(DISCOVERIES).length;
export const hasDiscovered = id => found.has(id);

let toastTimer = 0;
function toast(text) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.innerHTML = '<span class="toast-star" aria-hidden="true"></span><span></span>';
    el.lastChild.textContent = text;
    el.classList.remove('show');
    void el.offsetWidth; // restart the animation if one toast follows another
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

// Returns true the first time this discovery is made
export function discover(id) {
    if (!(id in DISCOVERIES) || found.has(id)) return false;
    found.add(id);
    try { localStorage.setItem(KEY, JSON.stringify([...found])); } catch { /* storage blocked */ }
    sfx.chime();
    toast(`גילוי חדש: ${DISCOVERIES[id]}`);
    return true;
}

export function resetDiscoveries() {
    found = new Set();
    try { localStorage.removeItem(KEY); } catch { /* storage blocked */ }
}
