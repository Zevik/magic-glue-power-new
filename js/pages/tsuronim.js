import {
    createWaterMolecule,
    createOilMolecule,
    createAlcoholMolecule,
    createSoapMolecule
} from '../lib/molecules.js';

export const slug = 'tsuronim';
export const title = 'הכירו את הצורונים';
export const reinitOnResize = true;

export const sectionClass = 'theme-tsuronim';

export const html = `
<span class="kicker">🧬 שלב 9</span>
<h2 class="title">הכירו את ה"צוּרוֹנִים"</h2>
<p class="lead">עד עכשיו דיברנו על גולות, אבל יש עוד סוד קטן... לפעמים, כמה גולות נדבקות אחת לשנייה כל כך חזק, שהן יוצרות "גולת-על" משותפת! אנחנו נקרא לה "צוּרוֹן". לכל חומר יש צורון משלו, הנה כמה דוגמאות:</p>
<div class="mol-grid">
    <div class="card mol-card">
        <h3>צורון של מים</h3>
        <div id="display-water" class="mol-display"></div>
    </div>
    <div class="card mol-card">
        <h3>צורון של שמן</h3>
        <div id="display-oil" class="mol-display"></div>
    </div>
    <div class="card mol-card">
        <h3>צורון של אלכוהול</h3>
        <div id="display-alcohol" class="mol-display"></div>
    </div>
    <div class="card mol-card">
        <h3>צורון של סבון</h3>
        <div id="display-soap" class="mol-display"></div>
    </div>
</div>
<p class="callout callout-soft">אבל מה מחזיק את הצורונים האלה יחד?</p>
<div class="actions">
    <a href="#/puddle" class="btn btn-ghost">חזרה</a>
    <a href="#/attraction" class="btn">בואו נגלה!</a>
</div>
`;

export function init(page) {
    // width of each molecule at scale 1, so it can be sized to fill about 85% of its box
    displayMolecule(page, 'display-water', createWaterMolecule, 60);
    displayMolecule(page, 'display-oil', createOilMolecule, 101);
    displayMolecule(page, 'display-alcohol', createAlcoholMolecule, 50);
    displayMolecule(page, 'display-soap', createSoapMolecule, 62);
}

function displayMolecule(page, containerId, createFn, naturalWidth) {
    const container = page.root.querySelector(`#${containerId}`);
    container.innerHTML = '';
    const scale = container.clientWidth * 0.85 / naturalWidth;
    const molecule = createFn(`${containerId}-mol`, container.clientWidth / 2, container.clientHeight / 2, container.clientWidth, scale);
    container.appendChild(molecule);

    let angle = 0;
    page.frame(() => {
        angle += 0.2;
        molecule.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    });
}
