import { State, CATEGORIES, SUBCAT_COLORS } from './state.js';
import { loadLargeGeoJSON } from './utils/loader.js';

export const MARKER_ICONS = {
    pariwisata:        `<path d="M3 22h18M6 18v4M10 14v8M14 10v12M18 6v16" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M12 2l-4 4h8l-4-4z" fill="white"/>`,
    kebutuhan:         `<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" fill="none" stroke="white" stroke-width="2"/><line x1="3" y1="6" x2="21" y2="6" stroke="white" stroke-width="2"/><path d="M16 10a4 4 0 0 1-8 0" fill="none" stroke="white" stroke-width="2"/>`,
    atm_bank:          `<rect x="2" y="5" width="20" height="14" rx="2" fill="none" stroke="white" stroke-width="2"/><line x1="2" y1="10" x2="22" y2="10" stroke="white" stroke-width="2"/><line x1="6" y1="15" x2="10" y2="15" stroke="white" stroke-width="2.5" stroke-linecap="round"/>`,
    tempat_tinggal:    `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="white" stroke-width="2"/><polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="white" stroke-width="2"/>`,
    sosial_tugas:      `<path d="M18 8h1a4 4 0 0 1 0 8h-1" fill="none" stroke="white" stroke-width="2"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" fill="none" stroke="white" stroke-width="2"/><line x1="6" y1="1" x2="6" y2="4" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="1" x2="10" y2="4" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
    akademik:          `<path d="M22 10v6M2 10l10-5 10 5-10 5z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
    kesehatan_darurat: `<line x1="12" y1="5" x2="12" y2="19" stroke="white" stroke-width="2.5" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="white" stroke-width="2.5" stroke-linecap="round"/>`,
    mobilitas:         `<rect x="1" y="3" width="15" height="13" rx="2" fill="none" stroke="white" stroke-width="2"/><path d="M16 8h4l3 3v5h-7V8z" fill="none" stroke="white" stroke-width="2"/><circle cx="5.5" cy="18.5" r="2.5" fill="none" stroke="white" stroke-width="2"/><circle cx="18.5" cy="18.5" r="2.5" fill="none" stroke="white" stroke-width="2"/>`,
    kebencanaan:       `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="none" stroke="white" stroke-width="2"/><line x1="12" y1="9" x2="12" y2="13" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="white" stroke-width="2.5" stroke-linecap="round"/>`,
    lingkungan:        `<path d="M17 8c0 8-6 13-9 13-.5 0-1-.2-1-.5C7 18 7 14 9 10c2-4 6-6 8-6 .5 0 1 .2 1 .5 0 0 0 1.5-1 3.5" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M8 21s1-4 4-8" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
};

function lightenHex(hex, amt) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.slice(0,2), 16);
    let g = parseInt(hex.slice(2,4), 16);
    let b = parseInt(hex.slice(4,6), 16);
    r = Math.min(255, r + amt);
    g = Math.min(255, g + amt);
    b = Math.min(255, b + amt);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function getSubcatColor(baseColor, subcatName) {
    // Check explicit override first
    if (SUBCAT_COLORS[subcatName]) return SUBCAT_COLORS[subcatName];
    // Otherwise derive a shade from the base color using hash
    let hash = 0;
    for (let i = 0; i < subcatName.length; i++) hash = (hash * 31 + subcatName.charCodeAt(i)) & 0xffff;
    const offset = (hash % 50) - 10; // -10 to +40 lighten offset
    return lightenHex(baseColor, offset);
}

export function createMarker(feature, latlng, categoryKey) {
    const cat = categoryKey || feature.properties.category || 'kebencanaan';
    const baseCat = CATEGORIES[cat] ? cat : 'kebencanaan';
    const subcat = feature.properties.subcategory || feature.properties.type || '';
    const baseColor = CATEGORIES[baseCat].color;
    const color = subcat ? getSubcatColor(baseColor, subcat) : baseColor;
    const colorLight = lightenHex(color, 55);

    const size = 32;
    const pinH = 44;
    const r = size / 2;     // 16
    const cx = size / 2;    // 16
    const cy = r;           // 16  (center of circle)

    // Clean teardrop pin: tip at bottom center, circle on top
    const pinPath = `M ${cx} ${pinH} L ${size} ${cy} A ${r} ${r} 0 1 0 0 ${cy} Z`;

    const iconHtml = MARKER_ICONS[baseCat] || '';
    // Icon is 24x24 SVG content; scale to ~15px inside the 32px circle
    const iconScale = 0.58;
    const iconOffset = (size - 24 * iconScale) / 2;

    const html = `
        <div style="width:${size}px; height:${pinH}px; position:relative; filter:drop-shadow(0 3px 8px rgba(0,0,0,0.5));">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${pinH}" width="${size}" height="${pinH}">
                <defs>
                    <linearGradient id="mg-${baseCat}-${subcat.slice(0,4)}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${colorLight};stop-opacity:1"/>
                        <stop offset="100%" style="stop-color:${color};stop-opacity:1"/>
                    </linearGradient>
                </defs>
                <path d="${pinPath}" fill="url(#mg-${baseCat}-${subcat.slice(0,4)})"/>
                <g transform="translate(${iconOffset}, ${iconOffset}) scale(${iconScale})">
                    ${iconHtml}
                </g>
            </svg>
        </div>`;

    return L.marker(latlng, {
        icon: L.divIcon({
            className: '',
            html,
            iconSize:   [size, pinH],
            iconAnchor: [cx, pinH],
            popupAnchor:[0, -pinH]
        })
    });
}
