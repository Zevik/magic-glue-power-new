import { createPageContext } from './lib/page-context.js';
import pages from './pages/index.js';

const TITLE_SUFFIX = 'הכוח הנעלם: מסע לעולם הגולות';
const FADE_MS = 250;

const container = document.getElementById('app-container');
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
    container.appendChild(root);
    window.scrollTo(0, 0);
    document.title = `${page.title} | ${TITLE_SUFFIX}`;

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
