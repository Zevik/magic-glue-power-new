// Custom line icons for the chapter badges and buttons. Drawn on a 24x24 grid, stroke only,
// so they take the text colour of whatever they sit in.

const paths = {
    apple: '<path d="M12 7c-1.5-1.2-5-1.4-6.4 1.5-1.6 3.3.3 9.2 3 11.2 1.2.9 2.3.5 3.4.5s2.200.4 3.400-.5c2.700-2 4.600-7.900 3-11.200C17 5.600 13.500 5.800 12 7Z"/><path d="M12 7c0-2 .8-3.500 2.500-4.500"/>',
    sparkle: '<path d="M12 3l1.800 5.200L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800L12 3Z"/><path d="M19 16l.7 1.800L21.500 18.500l-1.800.7L19 21l-.7-1.800-1.800-.7 1.800-.7L19 16Z"/>',
    microscope: '<path d="M8 3h4v8H8z"/><path d="M6 21h12"/><path d="M10 11v3"/><path d="M16 21a6 6 0 0 0 0-12"/><path d="M9 21v-3h6v3"/>',
    magnet: '<path d="M5 3v8a7 7 0 0 0 14 0V3h-4v8a3 3 0 0 1-6 0V3H5Z"/><path d="M5 7h4M15 7h4"/>',
    wind: '<path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 12h16a3 3 0 1 1-3 3"/><path d="M3 16h7a2.500 2.500 0 1 1-2.500 2.500"/>',
    flame: '<path d="M12 3c1 3.500 5 5.500 5 10a5 5 0 0 1-10 0c0-2 1-3.200 2-4.200.3 1.200 1 2 2 2.200C10.500 8.500 11 5.500 12 3Z"/>',
    snow: '<path d="M12 3v18M4.200 7.500l15.600 9M4.200 16.500l15.600-9"/><path d="M9.500 4.500 12 6.500l2.500-2M9.500 19.500l2.500-2 2.500 2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.500M12 19.500V22M2 12h2.500M19.500 12H22M4.900 4.900l1.800 1.800M17.300 17.300l1.800 1.800M4.900 19.100l1.800-1.800M17.300 6.700l1.800-1.800"/>',
    atoms: '<circle cx="12" cy="12" r="2.200"/><ellipse cx="12" cy="12" rx="9" ry="3.800"/><ellipse cx="12" cy="12" rx="9" ry="3.800" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.800" transform="rotate(120 12 12)"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1"/><path d="M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1"/>',
    search: '<circle cx="10.500" cy="10.500" r="6.500"/><path d="M15.500 15.500 21 21"/>',
    flask: '<path d="M9 3h6M10 3v6L4.500 18.500A2 2 0 0 0 6.300 21.500h11.400a2 2 0 0 0 1.800-3L14 9V3"/><path d="M7.500 15h9"/>',
    drop: '<path d="M12 3s6 6.500 6 11a6 6 0 0 1-12 0c0-4.500 6-11 6-11Z"/>',
    nose: '<path d="M12 4c0 4-2 6-3 8.500-.8 2 .5 3.500 2 3.500m1-12c0 4 2 6 3 8.500.8 2-.5 3.500-2 3.500"/><path d="M8.500 18.500c1 1 2 1.500 3.500 1.500s2.500-.5 3.500-1.500"/>',
    trophy: '<path d="M8 4h8v6a4 4 0 0 1-8 0V4Z"/><path d="M8 6H4v1.500A3.500 3.500 0 0 0 8 11M16 6h4v1.500A3.500 3.500 0 0 1 16 11"/><path d="M12 14v4M8 21h8M9 18h6"/>',
    volumeOn: '<path d="M4 9.500v5h3.500L12 18.500v-13L7.500 9.500H4Z"/><path d="M15.500 9a4 4 0 0 1 0 6M18 6.500a8 8 0 0 1 0 11"/>',
    volumeOff: '<path d="M4 9.500v5h3.500L12 18.500v-13L7.500 9.500H4Z"/><path d="m16 9.500 5 5m0-5-5 5"/>',
    star: '<path d="m12 3 2.700 5.600 6.100.9-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.9L12 3Z"/>',
    arrow: '<path d="M19 12H5m6-6-6 6 6 6"/>',
    check: '<path d="m5 12.500 4.500 4.500L19 7.500"/>',
    dna: '<path d="M7 3c0 6 10 6 10 12s-10 6-10 6M17 3c0 6-10 6-10 12s10 6 10 6"/><path d="M8 7h8M8 17h8"/>'
};

export function icon(name, { size = 20, stroke = 2 } = {}) {
    const body = paths[name] || paths.sparkle;
    return `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}
