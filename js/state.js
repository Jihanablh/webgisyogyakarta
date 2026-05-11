export const CONFIG = {
    center: [-7.7956, 110.3695],
    zoom: 12,
    minZoom: 10,
    maxZoom: 18,
    tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
};

export const CATEGORIES = {
    kebencanaan:        { label: 'Kebencanaan',         icon: '🌋', color: '#dc2626', file: 'data/kebencanaan.geojson' },
    lingkungan:         { label: 'Lingkungan',          icon: '🌿', color: '#16a34a', file: 'data/lingkungan.geojson' },
    pariwisata:         { label: 'Pariwisata & Keramaian', icon: '🏛️', color: '#e11d48', file: 'data/pariwisata.geojson' },
    tempat_tinggal:     { label: 'Tempat Tinggal',      icon: '🏠', color: '#8b5cf6', file: 'data/tempat_tinggal.geojson' },
    kebutuhan:          { label: 'Kebutuhan',           icon: '🛒', color: '#f59e0b', file: 'data/kebutuhan.geojson' },
    atm_bank:           { label: 'ATM & Bank',          icon: '🏦', color: '#10b981', file: 'data/atm_bank.geojson' },
    sosial_tugas:       { label: 'Sosial & Tugas',      icon: '🍽️', color: '#f43f5e', file: 'data/sosial_tugas.geojson' },
    akademik:           { label: 'Pusat Akademik',      icon: '🎓', color: '#3b82f6', file: 'data/akademik.geojson' },
    kesehatan_darurat:  { label: 'Kesehatan & Darurat', icon: '🏥', color: '#ef4444', file: 'data/kesehatan_darurat.geojson' },
    mobilitas:          { label: 'Mobilitas',           icon: '🚌', color: '#06b6d4', file: 'data/mobilitas.geojson' },
};

export const State = {
    map: null,
    activeCategory: 'kebencanaan',
    layerCache: {},
    rawGeojsonCache: {},
    searchIndex: [],
    searchMarker: null,
    markerClusterGroup: null
};
