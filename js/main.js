import { createPageContext } from './lib/page-context.js';
import { startAmbient } from './lib/ambient.js';
import { sfx, isSoundOn, setSound } from './lib/audio.js';
import { icon } from './lib/icons.js';
import pages from './pages/index.js';

const TITLE_SUFFIX = 'הכוח הנעלם: מסע לעולם הגולות';
const LEAVE_MS = 320;

const container = document.getElementById('app-container');
const progress = document.getElementById('progress');
const soundBtn = document.getElementById('sound-btn');
const ambient = startAmbient(document.getElementById('ambient'));

// One dot per page, each a link to that page
progress.innerHTML = pages.map(page => `<a href="#/${page.slug}" title="${page.title}" aria-label="${page.title}"></a>`).join('');

function updateProgress(page) {
    const index = pages.indexOf(page);
    progress.classList.toggle('off', index === 0);
    [...progress.children].forEach((dot, i) => {
        dot.classList.toggle('current', i === index);
        dot.classList.toggle('done', i < index);
        if (i === index) dot.setAttribute('aria-current', 'page'); else dot.removeAttribute('aria-current');
    });
}

// ----- sound switch -----
function paintSoundButton() {
    const on = isSoundOn();
    soundBtn.innerHTML = icon(on ? 'volumeOn' : 'volumeOff', { size: 22 });
    soundBtn.setAttribute('aria-pressed', String(on));
    soundBtn.title = on ? 'כיבוי צליל' : 'הפעלת צליל';
}
paintSoundButton();
soundBtn.addEventListener('click', () => { setSound(!isSoundOn()); paintSoundButton(); });

// ----- building a page -----
const bySlug = new Map(pages.map(page => [page.slug, page]));
let current = null; // { page, root, context }
let navigation = 0;

function pageFromHash() {
    const slug = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    // Links by number (#/7) work too
    return bySlug.get(slug) || pages[Number(slug)] || pages[0];
}

// Back / next buttons and the chapter badge come from the order in pages/index.js, so a page
// never has a stale link and moving a page needs no other edits.
function chrome(page) {
    const index = pages.indexOf(page);
    const prev = pages[index - 1];
    const next = pages[index + 1];

    const badge = page.chapter
        ? `<span class="kicker">${icon(page.icon || 'sparkle', { size: 18 })}<span>פרק ${index} · ${page.chapter}</span></span>`
        : '';

    let actions = '';
    if (page.nav !== false) {
        actions = `<div class="actions">
            ${prev ? `<a href="#/${prev.slug}" class="btn btn-ghost btn-back">${icon('arrow', { size: 20, stroke: 2.4 })}<span>חזרה</span></a>` : ''}
            ${next ? `<a href="#/${next.slug}" class="btn btn-big btn-next">${page.nextLabel || 'ממשיכים'}</a>` : ''}
        </div>`;
    }
    return { badge, actions };
}

function mount(page, direction) {
    const root = document.createElement('section');
    root.id = `page-${page.slug}`;
    root.className = `step ${page.sectionClass}`;
    root.style.setProperty('--dx', `${direction * -46}px`);
    const { badge, actions } = chrome(page);
    root.innerHTML = badge + page.html + actions;
    container.appendChild(root);

    // Everything on the page rises into place, one piece after the other
    [...root.children].forEach((el, i) => el.style.setProperty('--i', String(i)));

    // The background blends into this page's colour world while the page appears
    const cs = getComputedStyle(root);
    ambient.setTheme({ c1: cs.getPropertyValue('--c1'), c2: cs.getPropertyValue('--c2'), glow: cs.getPropertyValue('--glow') });

    window.scrollTo(0, 0);
    document.title = `${page.title} | ${TITLE_SUFFIX}`;
    updateProgress(page);

    const context = createPageContext(root);
    current = { page, root, context };
    if (page.init) page.init(context);
    requestAnimationFrame(() => root.classList.add('active'));
}

function show(page) {
    const id = ++navigation;
    if (!current) return mount(page, 0);

    const direction = Math.sign(pages.indexOf(page) - pages.indexOf(current.page)) || 1;
    const leaving = current;
    current = null;
    leaving.context.dispose(); // stop its animations right away
    leaving.root.classList.remove('active');
    leaving.root.classList.add('leaving');
    sfx.nav();
    setTimeout(() => {
        leaving.root.remove();
        if (id === navigation) mount(page, direction);
    }, LEAVE_MS);
}

function route() {
    const page = pageFromHash();
    if (current && current.page === page) return;
    show(page);
}

// Some pages lay themselves out from the screen size, so they are set up again after a resize.
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (!current || !current.page.init) return;
        const { reinitOnResize } = current.page;
        const needed = typeof reinitOnResize === 'function' ? reinitOnResize() : reinitOnResize;
        if (!needed) return;
        current.context.dispose();
        current.context = createPageContext(current.root);
        current.page.init(current.context);
    }, 250);
});

// Arrow keys move through the journey (in a right-to-left page, left is forward)
window.addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    const index = pages.indexOf((current && current.page) || pageFromHash());
    if (e.key === 'ArrowLeft' && pages[index + 1]) location.hash = `#/${pages[index + 1].slug}`;
    if (e.key === 'ArrowRight' && pages[index - 1]) location.hash = `#/${pages[index - 1].slug}`;
});

window.addEventListener('hashchange', route);
route();
