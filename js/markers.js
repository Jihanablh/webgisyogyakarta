import { CATEGORIES } from './state.js';

export const MARKER_ICONS = {
    pariwisata: `<path d="M3 22h18M6 18v4M10 14v8M14 10v12M18 6v16" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M12 2l-4 4h8l-4-4z" fill="white" stroke="white" stroke-width="1.5"/>`,
    kebutuhan: `<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="3" y1="6" x2="21" y2="6" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M16 10a4 4 0 0 1-8 0" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    atm_bank: `<rect x="2" y="5" width="20" height="14" rx="2" fill="none" stroke="white" stroke-width="2"/><line x1="2" y1="10" x2="22" y2="10" stroke="white" stroke-width="2"/>`,
    tempat_tinggal: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    sosial_tugas: `<path d="M18 8h1a4 4 0 0 1 0 8h-1" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="6" y1="1" x2="6" y2="4" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="1" x2="10" y2="4" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="14" y1="1" x2="14" y2="4" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
    akademik: `<path d="M22 10v6M2 10l10-5 10 5-10 5z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    kesehatan_darurat: `<path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="white" stroke-width="2.5" stroke-linecap="round"/><rect x="7" y="7" width="10" height="10" rx="1" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="9" x2="12" y2="15" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="12" x2="15" y2="12" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
    mobilitas: `<path d="M8 6v6M15 6v6M2 12h19.6M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H6C4.9 6 3.9 6.8 3.6 7.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="18" r="2" fill="none" stroke="white" stroke-width="2"/><circle cx="17" cy="18" r="2" fill="none" stroke="white" stroke-width="2"/>`,
    kebencanaan: `<path d="M12 2L8 10h8L12 2z" fill="white" stroke="white" stroke-width="1.5"/><path d="M4 22l4-12h8l4 12H4z" fill="none" stroke="white" stroke-width="2" stroke-linejoin="round"/><path d="M9 14c1-1 2 0 3-1s2 0 3 1" stroke="white" stroke-width="1.5" fill="none"/><circle cx="12" cy="6" r="1" fill="white"/>`,
    lingkungan: `<path d="M17 8c0 8-6 13-9 13-.5 0-1-.2-1-.5C7 18 7 14 9 10c2-4 6-6 8-6 .5 0 1 .2 1 .5 0 0 0 1.5-1 3.5" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M8 21s1-4 4-8" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
};

export const MARKER_CONFIG = {
    kebencanaan: { size: [32, 42], anchor: [16, 42], popup: [0, -44] },
    lingkungan: { size: [32, 42], anchor: [16, 42], popup: [0, -44] },
    pariwisata: { size: [32, 42], anchor: [16, 42], popup: [0, -44] },
    tempat_tinggal: { size: [32, 42], anchor: [16, 42], popup: [0, -44] },
    kebutuhan: { size: [32, 42], anchor: [16, 42], popup: [0, -44] },
    atm_bank: { size: [32, 42], anchor: [16, 42], popup: [0, -44] },
    sosial_tugas: { size: [32, 42], anchor: [16, 42], popup: [0, -44] },
    akademik: { size: [32, 42], anchor: [16, 42], popup: [0, -44] },
    kesehatan_darurat: { size: [32, 42], anchor: [16, 42], popup: [0, -44] },
    mobilitas: { size: [32, 42], anchor: [16, 42], popup: [0, -44] },
};

export function createMarker(feature, latlng) {
    const cat = feature.properties.category || feature.properties.tipe_bencana || feature.properties.status;
    
    // For specific sub-features in kebencanaan or lingkungan, we might need specific logic.
    // For simplicity, we fallback to a generic marker if category not found.
    const baseCat = CATEGORIES[cat] ? cat : 'kebencanaan';
    const color = CATEGORIES[baseCat].color;
    const cfg = MARKER_CONFIG[baseCat];
    const size = cfg.size[0];
    const pinH = cfg.size[1];

    const lighten = (hex, amt) => {
        let r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
        r = Math.min(255, r + amt); g = Math.min(255, g + amt); b = Math.min(255, b + amt);
        return `rgb(${r},${g},${b})`;
    };
    const colorLight = lighten(color, 50);

    const html = `
        <div class="custom-marker-wrapper" style="width:${size}px; height:${pinH}px; position:relative;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${pinH}" width="${size}" height="${pinH}" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,0.45));">
                <defs>
                    <linearGradient id="grad-${baseCat}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${colorLight};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${color};stop-opacity:1" />
                    </linearGradient>
                </defs>
                <path d="M${size/2} ${pinH} Q${size/2} ${pinH * 0.75} ${size} ${size/2} A${size/2} ${size/2} 0 1 0 0 ${size/2} Q${size/2} ${pinH * 0.75} ${size/2} ${pinH} Z" fill="url(#grad-${baseCat})" />
                <g transform="translate(${size*0.22}, ${size*0.15}) scale(${size*0.024})">
                    ${MARKER_ICONS[baseCat] || ''}
                </g>
            </svg>
        </div>
    `;

    return L.marker(latlng, {
        icon: L.divIcon({
            className: '',
            html: html,
            iconSize: cfg.size,
            iconAnchor: cfg.anchor,
            popupAnchor: cfg.popup
        })
    });
}
