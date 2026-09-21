import {
    createWaterMolecule,
    createOilMolecule,
    createAlcoholMolecule,
    createSoapMolecule
} from '../lib/molecules.js';

export const slug = 'tsuronim';
export const title = 'הכירו את הצורונים';
export const reinitOnResize = true;

export const sectionClass = 'flex-col justify-center items-center text-center bg-purple-200';

export const html = `
<h2 class="responsive-subtitle font-bold mb-4">הכירו את ה"צוּרוֹנִים"</h2>
<p class="max-w-3xl mx-auto responsive-text mb-4 sm:mb-6 px-4">עד עכשיו דיברנו על גולות, אבל יש עוד סוד קטן... לפעמים, כמה גולות נדבקות אחת לשנייה כל כך חזק, שהן יוצרות "גולת-על" משותפת! אנחנו נקרא לה "צוּרוֹן". לכל חומר יש צורון משלו, הנה כמה דוגמאות:</p>
<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8 w-full max-w-5xl px-4">
    <!-- Water -->
    <div class="flex flex-col items-center bg-white/50 p-3 sm:p-4 rounded-xl">
        <h3 class="text-base sm:text-lg lg:text-xl font-bold mb-2 text-center">צורון של מים</h3>
        <div id="display-water" class="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24"></div>
    </div>
    <!-- Oil -->
    <div class="flex flex-col items-center bg-white/50 p-3 sm:p-4 rounded-xl">
        <h3 class="text-base sm:text-lg lg:text-xl font-bold mb-2 text-center">צורון של שמן</h3>
         <div id="display-oil" class="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center"></div>
    </div>
    <!-- Alcohol -->
    <div class="flex flex-col items-center bg-white/50 p-3 sm:p-4 rounded-xl">
        <h3 class="text-base sm:text-lg lg:text-xl font-bold mb-2 text-center">צורון של אלכוהול</h3>
         <div id="display-alcohol" class="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24"></div>
    </div>
    <!-- Soap -->
    <div class="flex flex-col items-center bg-white/50 p-3 sm:p-4 rounded-xl">
        <h3 class="text-base sm:text-lg lg:text-xl font-bold mb-2 text-center">צורון של סבון</h3>
         <div id="display-soap" class="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center"></div>
    </div>
</div>
<p class="max-w-3xl mx-auto responsive-text mt-4 sm:mt-6 px-4">אבל מה מחזיק את הצורונים האלה יחד?</p>
<div class="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 sm:mt-8 px-4">
    <a href="#/states" class="w-full sm:w-auto px-6 py-3 bg-gray-400 text-black font-bold text-lg sm:text-xl rounded-full shadow-md hover:bg-gray-500 transition-colors">חזרה</a>
    <a href="#/attraction" class="w-full sm:w-auto px-6 py-3 bg-purple-500 text-white font-bold text-lg sm:text-xl rounded-full shadow-md hover:bg-purple-600 transition-colors">בואו נגלה!</a>
</div>
`;

export function init(page) {
    displayMolecule(page, 'display-water', createWaterMolecule);
    displayMolecule(page, 'display-oil', createOilMolecule);
    displayMolecule(page, 'display-alcohol', createAlcoholMolecule);
    displayMolecule(page, 'display-soap', createSoapMolecule);
}

function displayMolecule(page, containerId, createFn) {
    const container = page.root.querySelector(`#${containerId}`);
    container.innerHTML = '';
    const molecule = createFn(`${containerId}-mol`, container.clientWidth / 2, container.clientHeight / 2, container.clientWidth);
    container.appendChild(molecule);

    let angle = 0;
    page.frame(() => {
        angle += 0.2;
        molecule.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    });
}
