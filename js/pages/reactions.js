export const slug = 'reactions';
export const title = 'מהפכת הלגו (תגובות כימיות)';
export const reinitOnResize = true;

export const sectionClass = 'theme-reactions';

export const html = `
<span class="kicker">🔥 שלב 12</span>
<h2 class="title">מהפכת הלגו</h2>
<p class="lead">עד עכשיו רק הפרדנו צורונים שלמים זה מזה. מה קורה אם שוברים את ה"קליק" החזק שבונה את הצורון עצמו, ובונים ממנו צורון חדש לגמרי? זאת תגובה כימית. בואו נדליק גפרור ונשרוף קצת עץ!</p>
<div id="reaction-stage" class="reaction-stage"></div>
<button id="ignite-btn" type="button" class="btn btn-big btn-pulse">🔥 הציתו את האש!</button>
<div id="reaction-legend" class="facts hidden">
    <div class="card fact" style="--f1: #94a3b8; --f2: #475569;">
        <div class="icon">💨</div>
        <p>גולה כהה + גולת אוויר =</p>
        <h3>עשן</h3>
    </div>
    <div class="card fact" style="--f1: #7dd3fc; --f2: #38bdf8;">
        <div class="icon">☁️</div>
        <p>גולה בהירה + גולת אוויר =</p>
        <h3>אדי מים</h3>
    </div>
    <div class="card fact" style="--f1: #78716c; --f2: #44403c;">
        <div class="icon">⬛</div>
        <p>גולות שלא מצאו זוג =</p>
        <h3>אפר</h3>
    </div>
</div>
<p id="reaction-explain" class="callout callout-soft hidden">לא איבדנו אף גולה! פשוט פירקנו צורונים ישנים ובנינו מהם צורונים חדשים. זה הקסם שמאחורי אש, חלודה ואפייה.</p>
<div class="actions">
    <a href="#/mysteries" class="btn btn-ghost">חזרה</a>
    <a href="#/smell" class="btn">עוד קסם! איך זה שמריחים?</a>
</div>
`;

const WOOD_COUNT = 8; // alternating dark/light atoms in the chain
const AIR_PAIRS = 3;

export function init(page) {
    const stage = page.root.querySelector('#reaction-stage');
    const igniteBtn = page.root.querySelector('#ignite-btn');
    const legend = page.root.querySelector('#reaction-legend');
    const explain = page.root.querySelector('#reaction-explain');

    // in case init() runs again after a resize mid-animation, put everything back to idle
    legend.classList.add('hidden');
    explain.classList.add('hidden');
    igniteBtn.classList.add('btn-pulse');
    igniteBtn.textContent = '🔥 הציתו את האש!';

    let atoms = [];
    let state = 'idle'; // 'idle' | 'busy' | 'done'

    function makeAtom(type, x, y, size) {
        const el = document.createElement('div');
        el.className = `marble ${type === 'dark' ? 'm-dark' : type === 'light' ? 'm-light' : 'm-blue'}`;
        el.style.width = el.style.height = `${size}px`;
        el.style.transition = 'left 0.9s cubic-bezier(.3,.7,.2,1), top 0.9s cubic-bezier(.3,.7,.2,1), filter 0.6s';
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        stage.appendChild(el);
        return { el, type };
    }

    function setPos(atom, x, y) {
        atom.el.style.left = `${x}px`;
        atom.el.style.top = `${y}px`;
    }

    function layout() {
        stage.innerHTML = '';
        atoms = [];
        const w = stage.clientWidth, h = stage.clientHeight;
        const size = Math.max(20, Math.min(34, w / 18));

        const chainStartX = w * 0.06, chainY = h * 0.5, spacing = size * 0.85;
        for (let i = 0; i < WOOD_COUNT; i++) {
            atoms.push(makeAtom(i % 2 === 0 ? 'dark' : 'light', chainStartX + i * spacing, chainY, size));
        }

        const airBaseX = w * 0.74, airSize = size * 0.75;
        for (let i = 0; i < AIR_PAIRS; i++) {
            const y = h * (0.16 + i * 0.32);
            atoms.push(makeAtom('air', airBaseX, y, airSize));
            atoms.push(makeAtom('air', airBaseX + airSize * 0.85, y, airSize));
        }
    }

    layout();

    igniteBtn.addEventListener('click', () => {
        if (state === 'busy') return;
        if (state === 'done') {
            state = 'idle';
            legend.classList.add('hidden');
            explain.classList.add('hidden');
            igniteBtn.classList.add('btn-pulse');
            igniteBtn.textContent = '🔥 הציתו את האש!';
            layout();
            return;
        }

        state = 'busy';
        igniteBtn.classList.remove('btn-pulse');
        igniteBtn.textContent = '🔥 בוערים...';

        const w = stage.clientWidth, h = stage.clientHeight;

        // the bonds break: everyone scatters
        atoms.forEach(a => setPos(a, 15 + Math.random() * (w - 30), 15 + Math.random() * (h - 30)));

        page.timeout(() => {
            // new bonds form: dark+air -> smoke, light+air -> water vapour, leftovers -> ash
            const wood = atoms.filter(a => a.type !== 'air'); // chain order: dark, light, dark, light, ...
            const air = atoms.filter(a => a.type === 'air');
            const paired = wood.slice(0, air.length).map((w, i) => [w, air[i]]);
            const leftovers = wood.slice(air.length);
            const smokePairs = paired.filter(([w]) => w.type === 'dark');
            const vaporPairs = paired.filter(([w]) => w.type === 'light');

            smokePairs.forEach((pair, i) => {
                const x = w * (0.14 + (i % 3) * 0.1), y = h * 0.1;
                pair.forEach((a, k) => { setPos(a, x + k * 14, y); a.el.style.filter = 'saturate(0.4) brightness(0.85)'; });
            });
            vaporPairs.forEach((pair, i) => {
                const x = w * (0.58 + (i % 3) * 0.1), y = h * 0.1;
                pair.forEach((a, k) => setPos(a, x + k * 14, y));
            });
            leftovers.forEach((a, i) => {
                setPos(a, w * 0.42 + i * 26, h * 0.88);
                a.el.style.filter = 'grayscale(1) brightness(0.55)';
            });

            page.timeout(() => {
                legend.classList.remove('hidden');
                explain.classList.remove('hidden');
                igniteBtn.textContent = '🔥 שוב!';
                state = 'done';
            }, 1300);
        }, 900);
    }, { signal: page.signal });
}
