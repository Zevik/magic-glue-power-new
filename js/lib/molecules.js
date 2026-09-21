// The little molecule drawings used by the molecule pages.

export function createWaterMolecule(id, x, y, containerWidth = 100, scaleOverride) {
    const molecule = document.createElement('div');
    molecule.id = id;
    molecule.style.position = 'absolute';
    const scale = scaleOverride ?? Math.min(1, containerWidth / 200);
    const width = 60 * scale;
    const height = 50 * scale;
    molecule.style.width = `${width}px`;
    molecule.style.height = `${height}px`;
    molecule.style.left = `${x}px`;
    molecule.style.top = `${y}px`;
    molecule.style.transform = 'translate(-50%, -50%)';

    const oxygenSize = 8 * scale;
    const hydrogenSize = 6 * scale;

    molecule.innerHTML = `
        <div class="marble m-red" style="width: ${oxygenSize * 4}px; height: ${oxygenSize * 4}px; top: ${10 * scale}px; left: ${14 * scale}px;"></div>
        <div class="marble m-white" style="width: ${hydrogenSize * 4}px; height: ${hydrogenSize * 4}px; top: 0; left: 0;"></div>
        <div class="marble m-white" style="width: ${hydrogenSize * 4}px; height: ${hydrogenSize * 4}px; top: 0; left: ${34 * scale}px;"></div>
    `;
    return molecule;
}

export function createOilMolecule(id, x, y, containerWidth = 100, scaleOverride) {
    const molecule = document.createElement('div');
    molecule.id = id;
    molecule.style.position = 'absolute';
    const scale = scaleOverride ?? Math.min(1, containerWidth / 200);
    const numBalls = 14;
    const ballSize = 10 * scale;
    const spacing = 7 * scale;
    molecule.style.width = `${(numBalls - 1) * spacing + ballSize}px`;
    molecule.style.height = `${ballSize}px`;
    molecule.style.left = `${x}px`;
    molecule.style.top = `${y}px`;
    molecule.style.transform = 'translate(-50%, -50%)';

    let chainHTML = '';
    for (let i = 0; i < numBalls; i++) {
        const ballPixelSize = 3 * scale;
        chainHTML += `<div class="marble ${i % 2 === 0 ? 'm-dark' : 'm-light'}" style="width: ${ballPixelSize * 4}px; height: ${ballPixelSize * 4}px; left: ${i * spacing}px;"></div>`;
    }
    molecule.innerHTML = chainHTML;
    return molecule;
}

export function createAlcoholMolecule(id, x, y, containerWidth = 100, scaleOverride) {
    const molecule = document.createElement('div');
    molecule.id = id;
    molecule.style.position = 'absolute';
    const scale = scaleOverride ?? Math.min(1, containerWidth / 200);
    const width = 50 * scale;
    const height = 30 * scale;
    molecule.style.width = `${width}px`;
    molecule.style.height = `${height}px`;
    molecule.style.left = `${x}px`;
    molecule.style.top = `${y}px`;
    molecule.style.transform = 'translate(-50%, -50%)';

    const ballSize = 5 * scale;

    molecule.innerHTML = `
        <div class="marble m-dark" style="width: ${ballSize * 4}px; height: ${ballSize * 4}px; left: 0; top: ${5 * scale}px;"></div>
        <div class="marble m-dark" style="width: ${ballSize * 4}px; height: ${ballSize * 4}px; left: ${15 * scale}px; top: ${5 * scale}px;"></div>
        <div class="marble m-red" style="width: ${ballSize * 4}px; height: ${ballSize * 4}px; left: ${30 * scale}px; top: ${5 * scale}px;"></div>
    `;
    return molecule;
}

export function createSoapMolecule(id, x, y, containerWidth = 100, scaleOverride) {
    const molecule = document.createElement('div');
    molecule.id = id;
    molecule.style.position = 'absolute';
    const scale = scaleOverride ?? Math.min(1, containerWidth / 200);
    const numBalls = 7;
    const ballSize = 8 * scale;
    const spacing = 6 * scale;
    const headSize = 18 * scale;
    molecule.style.width = `${headSize + (numBalls - 1) * spacing + ballSize}px`;
    molecule.style.height = `${headSize}px`;
    molecule.style.left = `${x}px`;
    molecule.style.top = `${y}px`;
    molecule.style.transform = 'translate(-50%, -50%)';

    let chainHTML = `<div class="marble m-blue" style="width: ${4 * scale * 4}px; height: ${4 * scale * 4}px; left: 0; top: ${1 * scale}px;"></div>`;
    for (let i = 0; i < numBalls; i++) {
        const tailBallSize = 2 * scale;
        chainHTML += `<div class="marble m-green" style="width: ${tailBallSize * 4}px; height: ${tailBallSize * 4}px; left: ${headSize - 5 * scale + i * spacing}px; top: ${5 * scale}px;"></div>`;
    }
    molecule.innerHTML = chainHTML;
    return molecule;
}
