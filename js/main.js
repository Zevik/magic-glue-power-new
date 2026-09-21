import { createPageContext } from './lib/page-context.js';
import pages from './pages/index.js';

const TITLE_SUFFIX = 'הכוח הנעלם: מסע לעולם הגולות';
const FADE_MS = 250;

const container = document.getElementById('app-container');
const progress = document.getElementById('progress');

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

// A few glass marbles floating behind the content of every page
function makeDecoration() {
    const deco = document.createElement('div');
    deco.className = 'deco';
    deco.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 8; i++) {
        const bubble = document.createElement('span');
        bubble.className = 'bubble';
        bubble.style.setProperty('--x', `${Math.round(Math.random() * 92)}%`);
        bubble.style.setProperty('--y', `${Math.round(Math.random() * 92)}%`);
        bubble.style.setProperty('--size', `${Math.round(24 + Math.random() * 70)}px`);
        bubble.style.setProperty('--dur', `${(6 + Math.random() * 6).toFixed(1)}s`);
        bubble.style.setProperty('--delay', `${(-Math.random() * 8).toFixed(1)}s`);
        deco.appendChild(bubble);
    }
    return deco;
}
const bySlug = new Map(pages.map(page => [page.slug, page]));
let current = null; // { page, root, context }
let navigation = 0;

function pageFromHash() {
    const slug = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    // Links by number (#/7) work too
    return bySlug.get(slug) || pages[Number(slug)] || pages[0];
}

function mount(page) {
    const root = document.createElement('section');
    root.id = `page-${page.slug}`;
    root.className = `step ${page.sectionClass}`;
    root.innerHTML = page.html;
    root.prepend(makeDecoration());
    container.appendChild(root);
    window.scrollTo(0, 0);
    document.title = `${page.title} | ${TITLE_SUFFIX}`;
    updateProgress(page);

    const context = createPageContext(root);
    current = { page, root, context };
    if (page.init) page.init(context);
    setTimeout(() => root.classList.add('active'), 30);
}

function show(page) {
    const id = ++navigation;
    if (!current) return mount(page);

    const leaving = current;
    current = null;
    leaving.context.dispose(); // stop its animations right away
    leaving.root.classList.remove('active');
    setTimeout(() => {
        leaving.root.remove();
        if (id === navigation) mount(page);
    }, FADE_MS);
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

window.addEventListener('hashchange', route);
route();
