export const CONFIG = {
    center: [-7.7956, 110.3695],
    zoom: 12,
    minZoom: 8,
    maxZoom: 18,
    maxBounds: [[-8.6, 109.2], [-7.1, 111.8]],
    maxBoundsViscosity: 0.5,
    tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    lightTileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    /** Isi dengan 11 karakter ID video YouTube (embed). Kosong = hanya audio lokal + fallback sintesis. */
    bgmYoutubeVideoId: 'l2mI4vL95kU',
};

export const CATEGORIES = {
    kebencanaan:        { label: 'Kebencanaan',            icon: '!', color: '#dc2626', file: 'data/kebencanaan.geojson' },
    lingkungan:         { label: 'Lingkungan',             icon: 'L', color: '#16a34a', file: 'data/lingkungan.geojson' },
    pariwisata:         { label: 'Pariwisata & Keramaian', icon: '*', color: '#e11d48', file: 'data/pariwisata.geojson' },
    tempat_tinggal:     { label: 'Tempat Tinggal',         icon: 'H', color: '#8b5cf6', file: 'data/tempat_tinggal.geojson' },
    kebutuhan:          { label: 'Kebutuhan',              icon: 'K', color: '#f59e0b', file: 'data/kebutuhan.geojson' },
    atm_bank:           { label: 'ATM & Bank',             icon: '$', color: '#10b981', file: 'data/atm_bank.geojson' },
    sosial_tugas:       { label: 'Sosial & Tugas',         icon: 'S', color: '#f43f5e', file: 'data/sosial_tugas.geojson' },
    akademik:           { label: 'Pusat Akademik',         icon: 'A', color: '#3b82f6', file: 'data/akademik.geojson' },
    kesehatan_darurat:  { label: 'Kesehatan & Darurat',    icon: '+', color: '#ef4444', file: 'data/kesehatan_darurat.geojson' },
    mobilitas:          { label: 'Mobilitas',              icon: 'M', color: '#06b6d4', file: 'data/mobilitas.geojson' },
};

export const FACILITY_MAP = {
    parkir:         { icon: 'P', label: 'Parkir' },
    toilet:         { icon: 'WC', label: 'Toilet' },
    mushola:        { icon: 'M', label: 'Mushola' },
    wifi:           { icon: 'WiFi', label: 'WiFi' },
    atm:            { icon: '$', label: 'ATM' },
    warung:         { icon: 'W', label: 'Warung' },
    loker:          { icon: 'L', label: 'Loker' },
    souvenir:       { icon: 'S', label: 'Souvenir' },
    playground:     { icon: 'P', label: 'Playground' },
    restoran:       { icon: 'R', label: 'Restoran' },
    penginapan:     { icon: 'H', label: 'Penginapan' },
    akses_difabel:  { icon: 'AD', label: 'Akses Difabel' },
    perahu:         { icon: 'P', label: 'Perahu' },
    tenda_darurat:  { icon: 'T', label: 'Tenda Darurat' },
    dapur_umum:     { icon: 'D', label: 'Dapur Umum' },
    pos_medis:      { icon: '+', label: 'Pos Medis' },
    air_bersih:     { icon: '~', label: 'Air Bersih' },
    listrik:        { icon: 'E', label: 'Listrik' },
};

// Subcat-specific color overrides for disaster category
export const SUBCAT_COLORS = {
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
    // Tracks which categories the user has toggled ON
    enabledCategories: new Set(['kebencanaan']),
};
