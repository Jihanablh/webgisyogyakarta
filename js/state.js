export const CONFIG = {
    center: [-7.7956, 110.3695],
    zoom: 12,
    minZoom: 10,
    maxZoom: 18,
    tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
};

export const CATEGORIES = {
    kebencanaan:        { label: 'Kebencanaan',            icon: '🌋', color: '#dc2626', file: 'data/kebencanaan.geojson' },
    lingkungan:         { label: 'Lingkungan',             icon: '🌿', color: '#16a34a', file: 'data/lingkungan.geojson' },
    pariwisata:         { label: 'Pariwisata & Keramaian', icon: '🏛️', color: '#e11d48', file: 'data/pariwisata.geojson' },
    tempat_tinggal:     { label: 'Tempat Tinggal',         icon: '🏠', color: '#8b5cf6', file: 'data/tempat_tinggal.geojson' },
    kebutuhan:          { label: 'Kebutuhan',              icon: '🛒', color: '#f59e0b', file: 'data/kebutuhan.geojson' },
    atm_bank:           { label: 'ATM & Bank',             icon: '🏦', color: '#10b981', file: 'data/atm_bank.geojson' },
    sosial_tugas:       { label: 'Sosial & Tugas',         icon: '🍽️', color: '#f43f5e', file: 'data/sosial_tugas.geojson' },
    akademik:           { label: 'Pusat Akademik',         icon: '🎓', color: '#3b82f6', file: 'data/akademik.geojson' },
    kesehatan_darurat:  { label: 'Kesehatan & Darurat',    icon: '🏥', color: '#ef4444', file: 'data/kesehatan_darurat.geojson' },
    mobilitas:          { label: 'Mobilitas',              icon: '🚌', color: '#06b6d4', file: 'data/mobilitas.geojson' },
};

export const FACILITY_MAP = {
    parkir:         { icon: '🅿️', label: 'Parkir' },
    toilet:         { icon: '🚻', label: 'Toilet' },
    mushola:        { icon: '🕌', label: 'Mushola' },
    wifi:           { icon: '📶', label: 'WiFi' },
    atm:            { icon: '🏧', label: 'ATM' },
    warung:         { icon: '🍜', label: 'Warung' },
    loker:          { icon: '🔒', label: 'Loker' },
    souvenir:       { icon: '🛍️', label: 'Souvenir' },
    playground:     { icon: '🎪', label: 'Playground' },
    restoran:       { icon: '🍴', label: 'Restoran' },
    penginapan:     { icon: '🏨', label: 'Penginapan' },
    akses_difabel:  { icon: '♿', label: 'Akses Difabel' },
    perahu:         { icon: '⛵', label: 'Perahu' },
    tenda_darurat:  { icon: '⛺', label: 'Tenda Darurat' },
    dapur_umum:     { icon: '🥘', label: 'Dapur Umum' },
    pos_medis:      { icon: '🏥', label: 'Pos Medis' },
    air_bersih:     { icon: '💧', label: 'Air Bersih' },
    listrik:        { icon: '⚡', label: 'Listrik' },
};

// Subcat-specific color overrides for disaster category
export const SUBCAT_COLORS = {
    'Risiko Erupsi':         '#ef4444',
    'Rawan Erupsi':          '#ef4444',
    'Risiko Banjir':         '#f97316',
    'Rawan Banjir':          '#f97316',
    'Risiko Gempa':          '#f59e0b',
    'Rawan Gempa':           '#f59e0b',
    'Risiko Longsor':        '#84cc16',
    'Rawan Longsor':         '#84cc16',
    'Jalur Evakuasi':        '#22c55e',
    'Titik Kumpul':          '#06b6d4',
    'Pengungsian':           '#6366f1',
    'Pos Damkar':            '#f97316',
    'Taman Kota':            '#4ade80',
    'Ruang Terbuka Hijau':   '#22c55e',
    'Sungai':                '#38bdf8',
    'Hutan':                 '#16a34a',
};

export const State = {
    map: null,
    activeCategory: 'kebencanaan',
    layerCache: {},
    rawGeojsonCache: {},
    searchIndex: [],
    searchMarker: null,
    markerClusterGroup: null,
    // Extended state for modules
    categoryData: {},
    categoryMeta: {},
    activeSubcats: {},
    activeDisasterSubTab: 'all',
    searchHighlightMarker: null,
    currentReportFeature: null,
    onlyKebencanaan: true,
};
