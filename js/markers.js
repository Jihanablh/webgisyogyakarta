import { State, CATEGORIES } from './state.js';

function categoryMarkerColor(category, typeLayer = '') {
    if (category === 'kebencanaan') {
        if (typeLayer === 'titik_pengungsian' || typeLayer === 'titik_kumpul') return '#1a4a7a';
        return '#ef4444';
    }
    const colors = {
        pariwisata: '#d4a017',
        kesehatan_darurat: '#e91e63',
        akademik: '#3498db',
        mobilitas: '#95a5a6',
        atm_bank: '#2ecc71',
        sosial_tugas: '#8e44ad',
        kebutuhan: '#f59e0b',
        tempat_tinggal: '#8b5cf6',
        lingkungan: '#27ae60'
    };
    return colors[category] || CATEGORIES[category]?.color || '#d4a017';
}

function markerSvg(category, typeLayer = '') {
    if (category === 'kebencanaan' && (typeLayer === 'titik_pengungsian' || typeLayer === 'titik_kumpul')) {
        return '<path d="M5 17h14M7 17V9l5-4 5 4v8M10 17v-5h4v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    }

    const icons = {
        pariwisata: '<circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 9h3l1.5-2h7L17 9h3v9H4V9z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
        kesehatan_darurat: '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
        akademik: '<path d="M4 8l8-4 8 4-8 4-8-4zM7 11v4c0 1.5 2.5 3 5 3s5-1.5 5-3v-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
        mobilitas: '<path d="M5 16h14M7 16l2-6h6l2 6M8 18h.01M16 18h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
        atm_bank: '<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8v8M9.5 10h3.5a2 2 0 0 1 0 4H10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
        sosial_tugas: '<path d="M5 19h14M7 17V8l5-3 5 3v9M10 17v-5h4v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
        kebutuhan: '<path d="M7 8h12l-2 7H9L7 5H4M9 19h.01M16 19h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
        tempat_tinggal: '<path d="M4 11l8-7 8 7v8H6v-8M10 19v-5h4v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
        lingkungan: '<path d="M18 5c-7 1-11 5-11 12 6 0 11-4 11-12zM7 17c2-4 5-6 9-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    };
    return icons[category] || '<circle cx="12" cy="12" r="5" fill="currentColor"/>';
}

function createGmapDivIcon({ color, icon, active = false }) {
    const safeColor = String(color || '#d4a017').replace(/"/g, '');
    return L.divIcon({
        className: 'gmap-div-marker',
        html: `
            <div class="gmap-marker ${active ? 'is-active' : ''}" style="--marker-color:${safeColor}">
                <div class="gmap-marker-pin">
                    <div class="gmap-marker-icon">
                        <svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg>
                    </div>
                </div>
            </div>`,
        iconSize: [36, 44],
        iconAnchor: [18, 42],
        popupAnchor: [0, -42]
    });
}

export function createMarker(feature, latlng, categoryKey) {
    const cat = categoryKey || feature.properties?.category || 'kebencanaan';
    const baseCat = CATEGORIES[cat] ? cat : 'kebencanaan';
    const typeLayer = feature.properties?.type_layer || '';
    const color = categoryMarkerColor(baseCat, typeLayer);
    const active = baseCat === 'kebencanaan' || typeLayer === 'titik_pengungsian' || State.activeCategory === baseCat;

    return L.marker(latlng, {
        icon: createGmapDivIcon({
            color,
            icon: markerSvg(baseCat, typeLayer),
            active
        })
    });
}
