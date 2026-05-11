/**
 * JogjaMap v2 — WebGIS Mahasiswa Perantau Yogyakarta
 * + Accordion filters with sub-categories
 * + Force-render search highlight marker with bounce
 * + Spatial boundary enforcement
 */

// =====================================================
// CONFIGURATION
// =====================================================
const CONFIG = {
    center: [-7.7956, 110.3695],
    zoom: 12,
    minZoom: 10,
    maxZoom: 18,
    tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
};

const CATEGORIES = {
    pariwisata:         { label: 'Pariwisata & Keramaian', icon: '🏛️', color: '#e11d48', file: 'data/pariwisata.geojson' },
    kebutuhan:          { label: 'Kebutuhan',           icon: '🛒', color: '#f59e0b', file: 'data/kebutuhan.geojson' },
    atm_bank:           { label: 'ATM & Bank',          icon: '🏦', color: '#10b981', file: 'data/atm_bank.geojson' },
    tempat_tinggal:     { label: 'Tempat Tinggal',      icon: '🏠', color: '#8b5cf6', file: 'data/tempat_tinggal.geojson' },
    sosial_tugas:       { label: 'Sosial & Tugas',      icon: '🍽️', color: '#f43f5e', file: 'data/sosial_tugas.geojson' },
    akademik:           { label: 'Pusat Akademik',      icon: '🎓', color: '#3b82f6', file: 'data/akademik.geojson' },
    kesehatan_darurat:  { label: 'Kesehatan & Darurat', icon: '🏥', color: '#ef4444', file: 'data/kesehatan_darurat.geojson' },
    mobilitas:          { label: 'Mobilitas',           icon: '🚌', color: '#06b6d4', file: 'data/mobilitas.geojson' },
    kebencanaan:        { label: 'Kebencanaan',         icon: '🌋', color: '#dc2626', file: 'data/kebencanaan.geojson' },
    lingkungan:         { label: 'Lingkungan',          icon: '🌿', color: '#16a34a', file: 'data/lingkungan.geojson' },
};

// =====================================================
// CUSTOM MARKER ICONS (Lucide-style SVG paths)
// =====================================================
const MARKER_ICONS = {
    // Landmark – Pariwisata & Keramaian
    pariwisata: `<path d="M3 22h18M6 18v4M10 14v8M14 10v12M18 6v16" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M12 2l-4 4h8l-4-4z" fill="white" stroke="white" stroke-width="1.5"/>`,
    // Shopping cart – Kebutuhan
    kebutuhan: `<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="3" y1="6" x2="21" y2="6" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M16 10a4 4 0 0 1-8 0" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    // Credit card – ATM & Bank
    atm_bank: `<rect x="2" y="5" width="20" height="14" rx="2" fill="none" stroke="white" stroke-width="2"/><line x1="2" y1="10" x2="22" y2="10" stroke="white" stroke-width="2"/>`,
    // Home – Tempat Tinggal
    tempat_tinggal: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    // Coffee/Utensils – Sosial & Tugas
    sosial_tugas: `<path d="M18 8h1a4 4 0 0 1 0 8h-1" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="6" y1="1" x2="6" y2="4" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="1" x2="10" y2="4" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="14" y1="1" x2="14" y2="4" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
    // GraduationCap – Pusat Akademik
    akademik: `<path d="M22 10v6M2 10l10-5 10 5-10 5z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    // Heart + Pulse – Kesehatan & Darurat
    kesehatan_darurat: `<path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="white" stroke-width="2.5" stroke-linecap="round"/><rect x="7" y="7" width="10" height="10" rx="1" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="9" x2="12" y2="15" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="12" x2="15" y2="12" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
    // Bus – Mobilitas
    mobilitas: `<path d="M8 6v6M15 6v6M2 12h19.6M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H6C4.9 6 3.9 6.8 3.6 7.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="18" r="2" fill="none" stroke="white" stroke-width="2"/><circle cx="17" cy="18" r="2" fill="none" stroke="white" stroke-width="2"/>`,
    // Volcano – Kebencanaan
    kebencanaan: `<path d="M12 2L8 10h8L12 2z" fill="white" stroke="white" stroke-width="1.5"/><path d="M4 22l4-12h8l4 12H4z" fill="none" stroke="white" stroke-width="2" stroke-linejoin="round"/><path d="M9 14c1-1 2 0 3-1s2 0 3 1" stroke="white" stroke-width="1.5" fill="none"/><circle cx="12" cy="6" r="1" fill="white"/>`,
    // Leaf – Lingkungan
    lingkungan: `<path d="M17 8c0 8-6 13-9 13-.5 0-1-.2-1-.5C7 18 7 14 9 10c2-4 6-6 8-6 .5 0 1 .2 1 .5 0 0 0 1.5-1 3.5" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M8 21s1-4 4-8" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
};

/**
 * Create a beautiful custom SVG drop-pin marker icon
 * @param {string} categoryKey – key in CATEGORIES
 * @param {object} [opts] – optional overrides { size, highlighted }
 * @returns {L.DivIcon}
 */
function createCustomIcon(categoryKey, opts = {}) {
    const cat = CATEGORIES[categoryKey];
    const color = cat.color;
    const size = opts.size || 36;
    const highlighted = opts.highlighted || false;
    const innerSvg = MARKER_ICONS[categoryKey] || '';

    // Compute a lighter version of the color for gradient
    const lighten = (hex, amt) => {
        let r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
        r = Math.min(255, r + amt); g = Math.min(255, g + amt); b = Math.min(255, b + amt);
        return `rgb(${r},${g},${b})`;
    };
    const colorLight = lighten(color, 50);

    const pinH = size * 1.3;
    const iconW = size * 0.55;

    const pulseHtml = highlighted ? `
        <div class="custom-marker-pulse" style="
            position:absolute; width:${size * 1.6}px; height:${size * 1.6}px;
            border-radius:50%; background:${color}33;
            left:50%; top:50%; transform:translate(-50%,-50%);
            animation: customPulse 1.6s ease-out infinite; z-index:-1;
        "></div>` : '';

    const html = `
        <div class="custom-marker-wrapper ${highlighted ? 'custom-marker-highlighted' : ''}" style="width:${size}px; height:${pinH}px; position:relative;">
            ${pulseHtml}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${pinH}" width="${size}" height="${pinH}" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,0.45));">
                <defs>
                    <linearGradient id="grad-${categoryKey}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${colorLight};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${color};stop-opacity:1" />
                    </linearGradient>
                </defs>
                <!-- Pin body -->
                <path d="M${size/2} ${pinH}
                         C${size/2} ${pinH}
                          ${size*0.05} ${pinH*0.52}
                          ${size*0.05} ${size*0.46}
                         A${size*0.45} ${size*0.46} 0 1 1
                          ${size*0.95} ${size*0.46}
                         C${size*0.95} ${pinH*0.52}
                          ${size/2} ${pinH}
                          ${size/2} ${pinH}Z"
                      fill="url(#grad-${categoryKey})" />
                <!-- White inner circle -->
                <circle cx="${size/2}" cy="${size*0.46}" r="${iconW*0.52}" fill="rgba(255,255,255,0.2)" />
                <!-- Inner icon -->
                <g transform="translate(${size/2 - iconW/2}, ${size*0.46 - iconW/2}) scale(${iconW/24})">
                    ${innerSvg}
                </g>
            </svg>
        </div>
    `;

    return L.divIcon({
        className: 'custom-category-marker',
        html: html,
        iconSize: [size, pinH],
        iconAnchor: [size / 2, pinH],
        popupAnchor: [0, -(pinH + 6)]
    });
}

// =====================================================
// STATE
// =====================================================
let map;
let boundaryLayer;
let heatmapLayer = null;
let heatmapVisible = false;
const categoryLayers = {};      // { catKey: L.markerClusterGroup or L.layerGroup }
const categoryData = {};        // { catKey: geojsonData }
const categoryMeta = {};        // { catKey: { label, subcategories: {name: count} } }
const activeSubcats = {};       // { catKey: Set<subcatName> }
let allFeatures = [];           // flat search index
let searchHighlightMarker = null;
let activeCategory = null;
let activeDisasterSubTab = 'all'; // for disaster sub-tab filtering
let currentReportFeature = null;  // feature currently shown in report modal
const DISASTER_CATEGORIES = ['kebencanaan', 'lingkungan'];

const FACILITY_MAP = {
    parkir: { icon: '🅿️', label: 'Parkir' },
    restoran: { icon: '🍽️', label: 'Restoran' },
    toilet: { icon: '🚻', label: 'Toilet' },
    mushola: { icon: '🕌', label: 'Mushola' },
    atm: { icon: '🏧', label: 'ATM' },
    toko_suvenir: { icon: '🛍️', label: 'Suvenir' },
    guide: { icon: '🧭', label: 'Guide' },
};

// =====================================================
// MAP
// =====================================================
function initMap() {
    map = L.map('map', {
        center: CONFIG.center, zoom: CONFIG.zoom,
        minZoom: CONFIG.minZoom, maxZoom: CONFIG.maxZoom,
        zoomControl: false, attributionControl: true
    });
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.tileLayer(CONFIG.tileUrl, {
        attribution: CONFIG.tileAttribution, maxZoom: CONFIG.maxZoom, subdomains: 'abcd'
    }).addTo(map);

    map.on('mousemove', (e) => {
        const { lat, lng } = e.latlng;
        document.getElementById('coord-text').textContent =
            `${lat.toFixed(4)}°${lat < 0 ? 'S' : 'N'}, ${lng.toFixed(4)}°E`;
    });

    map.on('click', () => {
        closeInfoCard();
        closeTourismPanel();
        closeDisasterPanel();
        removeSearchHighlight();
    });
}

// =====================================================
// DATA LOADING
// =====================================================
async function loadAllData() {
    const loadingOverlay = document.getElementById('loading-overlay');

    try {
        // Load boundary
        const boundaryRes = await fetch('data/yogyakarta_boundary.geojson');
        if (boundaryRes.ok) {
            const bData = await boundaryRes.json();
            addBoundaryLayer(bData);
        }

        // Load category metadata
        try {
            const metaRes = await fetch('data/categories_meta.json');
            if (metaRes.ok) {
                const meta = await metaRes.json();
                Object.assign(categoryMeta, meta);
            }
        } catch (e) { console.warn('Meta load failed', e); }

        // Load all categories
        const loadPromises = Object.entries(CATEGORIES).map(async ([key, cat]) => {
            try {
                const res = await fetch(cat.file);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                categoryData[key] = data;

                // Initialize active subcategories (all ON)
                const subcats = new Set();
                data.features.forEach(f => {
                    if (f.properties.subcategory) subcats.add(f.properties.subcategory);
                });
                activeSubcats[key] = subcats;

                return { key, count: data.features.length };
            } catch (err) {
                console.warn(`Failed to load ${cat.file}:`, err);
                categoryData[key] = { type: 'FeatureCollection', features: [] };
                activeSubcats[key] = new Set();
                return { key, count: 0 };
            }
        });

        const results = await Promise.all(loadPromises);
        buildSearchIndex();
        buildHeatmap();
        updateWelcomeStats(results);

        loadingOverlay.classList.add('hidden');
        setTimeout(() => loadingOverlay.remove(), 600);

    } catch (err) {
        console.error('Fatal:', err);
        loadingOverlay.innerHTML = '<div class="loading-spinner"><p class="loading-text" style="color:#f43f5e;">Error memuat data.</p></div>';
    }
}

// =====================================================
// BOUNDARY LAYER
// =====================================================
function addBoundaryLayer(data) {
    boundaryLayer = L.geoJSON(data, {
        style: { color: '#3b82f6', weight: 2, opacity: 0.5, fillColor: '#3b82f6', fillOpacity: 0.03, dashArray: '8, 6' }
    }).addTo(map);
}

// =====================================================
// CATEGORY LAYERS
// =====================================================
function getDisasterStyle(feature) {
    const p = feature.properties;
    const gType = feature.geometry.type;
    if (gType === 'LineString' || gType === 'MultiLineString') {
        return { color: '#22c55e', weight: 4, opacity: 0.85, dashArray: '12, 8', lineCap: 'round' };
    }
    if (p.type_layer === 'rawan_banjir') return { color: '#3b82f6', weight: 2, opacity: 0.8, fillColor: '#3b82f6', fillOpacity: 0.3 };
    if (p.subcategory === 'Rawan Longsor') return { color: '#78350f', weight: 2, opacity: 0.8, fillColor: '#78350f', fillOpacity: 0.3 };
    const lr = p.level_risiko;
    if (lr === 'Tinggi') return { color: '#dc2626', weight: 2.5, opacity: 0.9, fillColor: '#dc2626', fillOpacity: 0.35 };
    if (lr === 'Sedang') return { color: '#ea580c', weight: 2, opacity: 0.8, fillColor: '#ea580c', fillOpacity: 0.25 };
    if (lr === 'Rendah') return { color: '#ca8a04', weight: 2, opacity: 0.7, fillColor: '#ca8a04', fillOpacity: 0.2 };
    return { color: '#6b7280', weight: 2, opacity: 0.6, fillColor: '#6b7280', fillOpacity: 0.15 };
}

function getEnvironmentStyle(feature) {
    const p = feature.properties;
    if (p.subcategory === 'Kerentanan Drainase Kota') return { color: '#0ea5e9', weight: 2, opacity: 0.7, fillColor: '#0ea5e9', fillOpacity: 0.25 };
    return { color: '#16a34a', weight: 2, opacity: 0.6, fillColor: '#16a34a', fillOpacity: 0.2 };
}

function createShelterIcon() {
    return L.divIcon({
        className: 'shelter-marker',
        html: `<div class="shelter-marker-inner"><div class="shelter-pulse"></div><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 18v-6l9-6 9 6v6"/><path d="M9 18v-4h6v4"/></svg></div>`,
        iconSize: [36, 36], 
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
    });
}

function addCategoryLayer(categoryKey, data) {
    const cat = CATEGORIES[categoryKey];
    const isDisaster = DISASTER_CATEGORIES.includes(categoryKey);

    if (isDisaster) {
        const layerGroup = L.layerGroup();
        const geoLayer = L.geoJSON(data, {
            filter: (feature) => {
                const sc = feature.properties.subcategory;
                if (!activeSubcats[categoryKey] || !activeSubcats[categoryKey].has(sc)) return false;
                if (categoryKey === 'kebencanaan' && activeDisasterSubTab !== 'all') {
                    return sc === activeDisasterSubTab;
                }
                return true;
            },
            style: (feature) => categoryKey === 'kebencanaan' ? getDisasterStyle(feature) : getEnvironmentStyle(feature),
            pointToLayer: (feature, latlng) => {
                if (feature.properties.type_layer === 'titik_pengungsian') {
                    return L.marker(latlng, { icon: createShelterIcon() });
                }
                return L.marker(latlng, { icon: createCustomIcon(categoryKey) });
            },
            onEachFeature: (feature, layer) => {
                const props = feature.properties;
                layer.on('click', (e) => {
                    L.DomEvent.stopPropagation(e);
                    showDisasterPanel(feature, categoryKey);
                });
                const badge = props.level_risiko && props.level_risiko !== 'Info'
                    ? `<span class="popup-risk popup-risk-${props.level_risiko.toLowerCase()}">${props.level_risiko}</span>` : '';
                layer.bindPopup(`<div class="popup-content"><div class="popup-name">${escapeHtml(props.name||'')}</div><div class="popup-type"><span class="popup-dot" style="background:${cat.color}"></span>${escapeHtml(props.subcategory||'')} ${badge}</div></div>`, {closeButton:true, maxWidth:280});
            }
        });
        layerGroup.addLayer(geoLayer);
        categoryLayers[categoryKey] = { cluster: layerGroup, geoLayer };
    } else {
        const clusterGroup = L.markerClusterGroup({
            maxClusterRadius: 50, spiderfyOnMaxZoom: true,
            showCoverageOnHover: false, zoomToBoundsOnClick: true,
            iconCreateFunction: (cluster) => {
                const count = cluster.getChildCount();
                let size = count > 50 ? 'large' : count > 20 ? 'medium' : 'small';
                return L.divIcon({
                    html: `<div style="background:${cat.color}cc;color:white;">${count}</div>`,
                    className: `marker-cluster marker-cluster-${size}`,
                    iconSize: L.point(40, 40)
                });
            }
        });
        const geoLayer = L.geoJSON(data, {
            pointToLayer: (feature, latlng) => L.marker(latlng, { icon: createCustomIcon(categoryKey) }),
            filter: (feature) => {
                const sc = feature.properties.subcategory;
                return activeSubcats[categoryKey] && activeSubcats[categoryKey].has(sc);
            },
            onEachFeature: (feature, layer) => {
                const props = feature.properties;
                layer.bindPopup(`<div class="popup-content"><div class="popup-name">${escapeHtml(props.name||'Unnamed')}</div><div class="popup-type"><span class="popup-dot" style="background:${cat.color}"></span>${escapeHtml(props.subcategory||props.type||'')} · ${cat.label}</div></div>`, {closeButton:true, maxWidth:250});
                layer.on('click', (e) => { L.DomEvent.stopPropagation(e); showTourismPanel(feature, categoryKey); });
            }
        });
        clusterGroup.addLayer(geoLayer);
        categoryLayers[categoryKey] = { cluster: clusterGroup, geoLayer };
    }
}

function rebuildCategoryLayer(categoryKey) {
    const layerInfo = categoryLayers[categoryKey];
    if (!layerInfo) return;
    const wasOnMap = map.hasLayer(layerInfo.cluster);
    map.removeLayer(layerInfo.cluster);
    addCategoryLayer(categoryKey, categoryData[categoryKey]);
    if (wasOnMap) categoryLayers[categoryKey].cluster.addTo(map);
}

// =====================================================
// WELCOME SCREEN
// =====================================================
function initWelcome() {
    document.getElementById('welcome-btn').addEventListener('click', dismissWelcome);
}

function updateWelcomeStats(results) {
    const total = results.reduce((s, r) => s + r.count, 0);
    const cats = results.filter(r => r.count > 0).length;
    let sc = 0;
    for (const m of Object.values(categoryMeta)) sc += Object.keys(m.subcategories || {}).length;
    animateCount('ws-total', total);
    animateCount('ws-cats', cats);
    animateCount('ws-subcats', sc);
}

function animateCount(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    let cur = 0;
    const step = Math.ceil(target / 40);
    const t = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = cur.toLocaleString();
        if (cur >= target) clearInterval(t);
    }, 30);
}

function dismissWelcome() {
    const o = document.getElementById('welcome-overlay');
    o.classList.add('hidden');
    setTimeout(() => { try { o.remove(); } catch(e){} }, 700);
    document.getElementById('sidebar').classList.remove('sidebar--hidden');
    renderCategoryTabs();
    document.getElementById('category-tabs').classList.remove('hidden');
    activateCategory(Object.keys(CATEGORIES)[0]);
    const results = Object.entries(categoryData).map(([k, d]) => ({ key: k, count: d.features.length }));
    renderStats(results);
    renderRecentEvents();
}

// =====================================================
// CATEGORY TABS
// =====================================================
function renderCategoryTabs() {
    const c = document.getElementById('category-tabs');
    c.innerHTML = Object.entries(CATEGORIES).map(([k, cat]) => {
        const n = categoryData[k] ? categoryData[k].features.length : 0;
        return `<button class="cat-tab" data-category="${k}" style="--tab-color:${cat.color}">
            <span class="cat-tab-icon">${cat.icon}</span>
            <span class="cat-tab-label">${cat.label}</span>
            <span class="cat-tab-count">${n}</span>
        </button>`;
    }).join('');
    c.querySelectorAll('.cat-tab').forEach(t => {
        t.addEventListener('click', () => activateCategory(t.dataset.category));
    });
}

function activateCategory(key) {
    activeCategory = key;
    activeDisasterSubTab = 'all';
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.toggle('active', t.dataset.category === key));
    for (const [k, li] of Object.entries(categoryLayers)) {
        if (li && li.cluster && map.hasLayer(li.cluster)) map.removeLayer(li.cluster);
    }
    if (!categoryLayers[key] && categoryData[key]) addCategoryLayer(key, categoryData[key]);
    if (categoryLayers[key]) categoryLayers[key].cluster.addTo(map);
    renderSubcatDetail(key);
    // Show/hide disaster sub-tabs
    const dstEl = document.getElementById('disaster-sub-tabs');
    if (key === 'kebencanaan') {
        renderDisasterSubTabs();
        dstEl.classList.remove('hidden');
    } else {
        dstEl.classList.add('hidden');
    }
    // Show/hide recent events
    const rewEl = document.getElementById('recent-events-widget');
    if (DISASTER_CATEGORIES.includes(key)) {
        rewEl.style.display = 'block';
    } else {
        rewEl.style.display = 'none';
    }
}

// =====================================================
// SUBCATEGORY DETAIL (sidebar)
// =====================================================
function renderSubcatDetail(key) {
    const container = document.getElementById('category-detail');
    if (!container) return;
    const cat = CATEGORIES[key];
    const meta = categoryMeta[key];
    const subcats = meta ? meta.subcategories : {};
    const count = categoryData[key] ? categoryData[key].features.length : 0;

    container.innerHTML = `
        <div class="cd-header" style="--cat-color:${cat.color}">
            <div class="cd-icon">${cat.icon}</div>
            <div class="cd-info">
                <div class="cd-label">${cat.label}</div>
                <div class="cd-count">${count.toLocaleString()} tempat</div>
            </div>
        </div>
        <div class="cd-subcats">
            <h3 class="section-title">Sub-Kategori</h3>
            <div class="cd-subcat-list">
                ${Object.entries(subcats).map(([scName, scCount]) => `
                    <div class="cd-subcat-item" data-category="${key}" data-subcat="${scName}">
                        <div class="cd-subcat-check checked" style="--check-color:${cat.color}"></div>
                        <span class="cd-subcat-name">${scName}</span>
                        <span class="cd-subcat-badge">${scCount}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    container.querySelectorAll('.cd-subcat-item').forEach(item => {
        item.addEventListener('click', () => {
            const ck = item.dataset.category, sc = item.dataset.subcat;
            const ch = item.querySelector('.cd-subcat-check');
            if (ch.classList.contains('checked')) {
                ch.classList.remove('checked'); activeSubcats[ck].delete(sc);
            } else {
                ch.classList.add('checked'); activeSubcats[ck].add(sc);
            }
            rebuildCategoryLayer(ck);
        });
    });
}

// Legacy compat
function renderAccordion(results) {
    const container = document.getElementById('accordion-container');
    const countMap = {};
    results.forEach(r => countMap[r.key] = r.count);

    container.innerHTML = Object.entries(CATEGORIES).map(([key, cat]) => {
        const count = countMap[key] || 0;
        const meta = categoryMeta[key];
        const subcats = meta ? meta.subcategories : {};

        const subcatHtml = Object.entries(subcats).map(([scName, scCount]) => `
            <div class="subcat-item" data-category="${key}" data-subcat="${scName}">
                <div class="subcat-check checked" style="--check-color:${cat.color}"></div>
                <span class="subcat-name">${scName}</span>
                <span class="subcat-badge">${scCount}</span>
            </div>
        `).join('');

        return `
            <div class="accordion-item" id="acc-${key}">
                <div class="accordion-header" data-category="${key}">
                    <div class="acc-icon" style="background:${cat.color}20;color:${cat.color}">${cat.icon}</div>
                    <div class="acc-info">
                        <div class="acc-label">${cat.label}</div>
                        <div class="acc-count">${count.toLocaleString()} tempat</div>
                    </div>
                    <button class="acc-master-toggle on" data-category="${key}" style="--toggle-color:${cat.color}"
                            title="Tampilkan/Sembunyikan semua"></button>
                    <svg class="acc-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </div>
                <div class="accordion-body">
                    <div class="subcat-list">${subcatHtml}</div>
                </div>
            </div>
        `;
    }).join('');

    // --- Event Listeners ---

    // Accordion expand/collapse (click on header but NOT on toggle)
    container.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', (e) => {
            // Don't toggle accordion when clicking the master toggle button
            if (e.target.closest('.acc-master-toggle')) return;
            const item = header.closest('.accordion-item');
            item.classList.toggle('expanded');
        });
    });

    // Master toggle (on/off entire category)
    container.querySelectorAll('.acc-master-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const key = btn.dataset.category;
            const isOn = btn.classList.contains('on');

            if (isOn) {
                // Turn OFF all subcats
                btn.classList.remove('on');
                activeSubcats[key] = new Set();
                // Uncheck all subcat checkboxes
                const accItem = btn.closest('.accordion-item');
                accItem.querySelectorAll('.subcat-check').forEach(c => c.classList.remove('checked'));
            } else {
                // Turn ON all subcats
                btn.classList.add('on');
                const allSc = new Set();
                categoryData[key].features.forEach(f => {
                    if (f.properties.subcategory) allSc.add(f.properties.subcategory);
                });
                activeSubcats[key] = allSc;
                const accItem = btn.closest('.accordion-item');
                accItem.querySelectorAll('.subcat-check').forEach(c => c.classList.add('checked'));
            }

            rebuildCategoryLayer(key);
        });
    });

    // Sub-category toggle
    container.querySelectorAll('.subcat-item').forEach(item => {
        item.addEventListener('click', () => {
            const key = item.dataset.category;
            const sc = item.dataset.subcat;
            const check = item.querySelector('.subcat-check');
            const isChecked = check.classList.contains('checked');

            if (isChecked) {
                check.classList.remove('checked');
                activeSubcats[key].delete(sc);
            } else {
                check.classList.add('checked');
                activeSubcats[key].add(sc);
            }

            // Update master toggle state
            const accItem = item.closest('.accordion-item');
            const masterBtn = accItem.querySelector('.acc-master-toggle');
            const allChecks = accItem.querySelectorAll('.subcat-check');
            const anyChecked = Array.from(allChecks).some(c => c.classList.contains('checked'));
            if (anyChecked) {
                masterBtn.classList.add('on');
            } else {
                masterBtn.classList.remove('on');
            }

            rebuildCategoryLayer(key);
        });
    });
}

// =====================================================
// STATS
// =====================================================
function renderStats(results) {
    const total = results.reduce((sum, r) => sum + r.count, 0);
    const cats = results.filter(r => r.count > 0).length;
    let subcatTotal = 0;
    for (const meta of Object.values(categoryMeta)) {
        subcatTotal += Object.keys(meta.subcategories || {}).length;
    }
    const grid = document.getElementById('stats-grid');
    grid.innerHTML = `
        <div class="stat-card"><div class="stat-number">${total.toLocaleString()}</div><div class="stat-label">Total Tempat</div></div>
        <div class="stat-card"><div class="stat-number">${cats}</div><div class="stat-label">Kategori</div></div>
        <div class="stat-card"><div class="stat-number">${subcatTotal}</div><div class="stat-label">Sub-Kategori</div></div>
    `;
}

// =====================================================
// SEARCH
// =====================================================
function buildSearchIndex() {
    allFeatures = [];
    for (const [key, data] of Object.entries(categoryData)) {
        for (const feature of data.features) {
            allFeatures.push({ ...feature, _categoryKey: key });
        }
    }
}

function initSearch() {
    const input = document.getElementById('search-input');
    const resultsDiv = document.getElementById('search-results');
    let debounceTimer;

    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const q = input.value.trim().toLowerCase();
            if (q.length < 2) { resultsDiv.classList.add('hidden'); return; }
            performSearch(q);
        }, 200);
    });

    input.addEventListener('focus', () => {
        if (input.value.trim().length >= 2) resultsDiv.classList.remove('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) resultsDiv.classList.add('hidden');
    });
}

function performSearch(query) {
    const resultsDiv = document.getElementById('search-results');
    const matches = allFeatures
        .filter(f => {
            const name = (f.properties.name || '').toLowerCase();
            const type = (f.properties.type || '').toLowerCase();
            const sc = (f.properties.subcategory || '').toLowerCase();
            return name.includes(query) || type.includes(query) || sc.includes(query);
        })
        .slice(0, 20);

    if (matches.length === 0) {
        resultsDiv.innerHTML = '<div class="search-result-item"><span class="search-result-name" style="color:var(--text-muted)">Tidak ditemukan</span></div>';
    } else {
        resultsDiv.innerHTML = matches.map((f, i) => {
            const cat = CATEGORIES[f._categoryKey];
            const sc = f.properties.subcategory || f.properties.type || '';
            return `
                <div class="search-result-item" data-idx="${i}" data-lon="${f.geometry.coordinates[0]}" data-lat="${f.geometry.coordinates[1]}" data-cat="${f._categoryKey}">
                    <span class="search-result-dot" style="background:${cat.color}"></span>
                    <div class="search-result-info">
                        <span class="search-result-name">${escapeHtml(f.properties.name || 'Unnamed')}</span>
                        <span class="search-result-meta">${escapeHtml(sc)} · ${cat.label}</span>
                    </div>
                </div>
            `;
        }).join('');

        // Click handlers
        resultsDiv.querySelectorAll('.search-result-item[data-lon]').forEach((item, idx) => {
            item.addEventListener('click', () => {
                const lon = parseFloat(item.dataset.lon);
                const lat = parseFloat(item.dataset.lat);
                const catKey = item.dataset.cat;
                resultsDiv.classList.add('hidden');

                // Find the feature
                const feature = matches[idx];
                if (feature) {
                    handleSearchSelect(feature, catKey, lat, lon);
                }
            });
        });
    }

    resultsDiv.classList.remove('hidden');
}

/**
 * Handle search result selection:
 * 1. Fly to location
 * 2. Force-render highlighted marker (even if filter is OFF)
 * 3. Show info card
 */
function handleSearchSelect(feature, categoryKey, lat, lon) {
    // 1. Remove previous highlight
    removeSearchHighlight();

    // 2. Fly to location
    map.flyTo([lat, lon], 17, { duration: 1.2 });

    // 3. Create force-render highlighted marker with category icon + pulse
    const highlightIcon = createCustomIcon(categoryKey, { size: 44, highlighted: true });

    searchHighlightMarker = L.marker([lat, lon], {
        icon: highlightIcon,
        zIndexOffset: 9999 // Always on top
    }).addTo(map);

    // Bind popup to highlight marker
    const cat = CATEGORIES[categoryKey];
    const props = feature.properties;
    searchHighlightMarker.bindPopup(`
        <div class="popup-content">
            <div class="popup-name">${escapeHtml(props.name || 'Unnamed')}</div>
            <div class="popup-type">
                <span class="popup-dot" style="background:${cat.color}"></span>
                ${escapeHtml(props.subcategory || props.type || '')} · ${cat.label}
            </div>
        </div>
    `, { closeButton: true, maxWidth: 250 });

    // Click handler on highlight marker
    searchHighlightMarker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        showTourismPanel(feature, categoryKey);
    });

    // Open popup after fly animation
    setTimeout(() => {
        if (searchHighlightMarker) searchHighlightMarker.openPopup();
    }, 1400);

    // 4. Show detail panel
    showTourismPanel(feature, categoryKey);
}

function removeSearchHighlight() {
    if (searchHighlightMarker) {
        map.removeLayer(searchHighlightMarker);
        searchHighlightMarker = null;
    }
}

// =====================================================
// INFO CARD
// =====================================================
function showInfoCard(feature, categoryKey) {
    const card = document.getElementById('info-card');
    const cat = CATEGORIES[categoryKey];
    const props = feature.properties;
    const coords = feature.geometry.coordinates;

    document.getElementById('info-card-badge').style.background = `${cat.color}20`;
    document.getElementById('info-card-icon').textContent = cat.icon;
    document.getElementById('info-card-name').textContent = props.name || 'Unnamed';
    document.getElementById('info-card-type').textContent = props.type || cat.label;

    document.getElementById('info-category-text').textContent = cat.label;
    document.getElementById('info-category-text').style.color = cat.color;

    // Subcategory
    const scRow = document.getElementById('info-detail-subcategory');
    if (props.subcategory) {
        scRow.style.display = 'flex';
        document.getElementById('info-subcategory-text').textContent = props.subcategory;
    } else {
        scRow.style.display = 'none';
    }

    // Distance
    const center = map.getCenter();
    const g = feature.geometry;
    let cLat, cLon;
    if (g.type === 'Point') { cLon = g.coordinates[0]; cLat = g.coordinates[1]; }
    else if (g.type === 'Polygon') { const b = L.geoJSON(feature).getBounds().getCenter(); cLat = b.lat; cLon = b.lng; }
    else if (g.type === 'LineString') { const c = g.coordinates[Math.floor(g.coordinates.length/2)]; cLon = c[0]; cLat = c[1]; }
    else { cLon = 110.3695; cLat = -7.7956; }
    const dist = haversineDistance(center.lat, center.lng, coords[1], coords[0]);
    document.getElementById('info-distance-text').textContent = formatDistance(dist);

    // Hours
    const hoursRow = document.getElementById('info-detail-hours');
    if (props.opening_hours) { hoursRow.style.display = 'flex'; document.getElementById('info-hours-text').textContent = props.opening_hours; }
    else { hoursRow.style.display = 'none'; }

    // Operator
    const opRow = document.getElementById('info-detail-operator');
    if (props.operator) { opRow.style.display = 'flex'; document.getElementById('info-operator-text').textContent = props.operator; }
    else { opRow.style.display = 'none'; }

    // Buttons
    document.getElementById('info-btn-fly').onclick = () => {
        map.flyTo([coords[1], coords[0]], 17, { duration: 1.2 });
    };
    document.getElementById('info-btn-gmaps').onclick = () => {
        window.open(`https://www.google.com/maps?q=${coords[1]},${coords[0]}`, '_blank');
    };

    card.classList.remove('hidden');
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = '';
}

function closeInfoCard() {
    document.getElementById('info-card').classList.add('hidden');
}

// =====================================================
// SIDEBAR
// =====================================================
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    document.getElementById('sidebar-toggle').addEventListener('click', () => sidebar.classList.toggle('open'));
    document.getElementById('sidebar-toggle-close').addEventListener('click', () => sidebar.classList.remove('open'));
    document.getElementById('info-card-close').addEventListener('click', (e) => {
        e.stopPropagation();
        closeInfoCard();
    });
    document.getElementById('tp-close').addEventListener('click', (e) => {
        e.stopPropagation();
        closeTourismPanel();
    });
    document.getElementById('dp-close').addEventListener('click', (e) => {
        e.stopPropagation();
        closeDisasterPanel();
    });
    document.getElementById('btn-open-stats').addEventListener('click', () => {
        openStatsModal();
    });
    document.getElementById('sm-close').addEventListener('click', () => {
        closeStatsModal();
    });
}

// =====================================================
// TOURISM PANEL
// =====================================================
function showTourismPanel(feature, categoryKey) {
    const panel = document.getElementById('tourism-panel');
    const props = feature.properties;
    const coords = feature.geometry.coordinates;
    const catKey = categoryKey || props.category || 'pariwisata';
    const cat = CATEGORIES[catKey] || CATEGORIES.pariwisata;

    closeInfoCard();

    // Header photo with dynamic category color fallback
    const header = document.getElementById('tp-header');
    if (props.foto) {
        header.style.backgroundImage = `url('${props.foto}')`;
    } else {
        header.style.backgroundImage = `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`;
    }

    // Category badge color
    const badgeEl = document.getElementById('tp-category-badge');
    badgeEl.textContent = props.subcategory || props.type || cat.label;
    badgeEl.style.background = `${cat.color}cc`;

    document.getElementById('tp-name').textContent = props.name || 'Unnamed';

    // Rating (hide row if no rating)
    const rating = props.rating || 0;
    const statsRow = document.querySelector('.tp-stats-row');
    if (rating > 0) {
        statsRow.style.display = 'flex';
        const starsEl = document.getElementById('tp-stars');
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) starsHtml += '<span class="star filled">★</span>';
            else if (i - 0.5 <= rating) starsHtml += '<span class="star half">★</span>';
            else starsHtml += '<span class="star">★</span>';
        }
        starsEl.innerHTML = starsHtml;
        document.getElementById('tp-rating').textContent = rating.toFixed(1);
        document.getElementById('tp-reviews').textContent = props.reviews ? `· ${props.reviews.toLocaleString()} ulasan` : '';
        document.getElementById('tp-visitors').textContent = props.visitors_per_day ? `~${props.visitors_per_day.toLocaleString()} / hari` : '';
    } else {
        statsRow.style.display = 'none';
    }

    // Hours & ticket (show/hide)
    const pillsRow = document.querySelector('.tp-info-pills');
    if (props.opening_hours || props.ticket_price) {
        pillsRow.style.display = 'flex';
        document.getElementById('tp-hours').textContent = props.opening_hours || '-';
        document.getElementById('tp-ticket').textContent = props.ticket_price || '-';
    } else {
        pillsRow.style.display = 'none';
    }

    // Crowd chart (only for pariwisata or data with hourly_crowd)
    const chartSection = document.querySelector('.tp-chart-section');
    const hourlyData = props.hourly_crowd;
    if (hourlyData && hourlyData.length === 24) {
        chartSection.style.display = 'block';
        const currentHour = new Date().getHours();
        const crowdLevel = hourlyData[currentHour] || 0;
        const badge = document.getElementById('tp-crowd-badge');
        if (crowdLevel >= 60) { badge.textContent = '🔴 Keramaian tinggi'; badge.className = 'tp-crowd-badge crowd-high'; }
        else if (crowdLevel >= 30) { badge.textContent = '🟡 Keramaian sedang'; badge.className = 'tp-crowd-badge crowd-medium'; }
        else { badge.textContent = '🟢 Keramaian rendah'; badge.className = 'tp-crowd-badge crowd-low'; }
    } else {
        chartSection.style.display = 'none';
    }

    // Facilities
    const facilitiesSection = document.querySelector('.tp-facilities-section');
    const facilities = props.facilities || [];
    if (facilities.length > 0) {
        facilitiesSection.style.display = 'flex';
        document.getElementById('tp-facilities').innerHTML = facilities.map(f => {
            const fac = FACILITY_MAP[f] || { icon: '📍', label: f };
            return `<div class="tp-facility-item"><span class="tp-facility-icon">${fac.icon}</span><span class="tp-facility-label">${fac.label}</span></div>`;
        }).join('');
    } else {
        facilitiesSection.style.display = 'none';
    }

    // Description
    const descEl = document.getElementById('tp-description');
    descEl.textContent = props.description || '';
    descEl.style.display = props.description ? 'block' : 'none';

    // Address
    const addrRow = document.getElementById('tp-address-row');
    if (props.address) {
        addrRow.style.display = 'flex';
        document.getElementById('tp-address').textContent = props.address;
    } else {
        addrRow.style.display = 'none';
    }

    // Tips
    const tipsRow = document.getElementById('tp-tips-row');
    if (props.tips) {
        tipsRow.style.display = 'block';
        document.getElementById('tp-tips').textContent = props.tips;
    } else {
        tipsRow.style.display = 'none';
    }

    // Action buttons
    document.getElementById('tp-btn-fly').onclick = () => map.flyTo([coords[1], coords[0]], 17, { duration: 1.2 });
    document.getElementById('tp-btn-gmaps').onclick = () => window.open(`https://www.google.com/maps?q=${coords[1]},${coords[0]}`, '_blank');

    // Button color
    const primaryBtn = document.getElementById('tp-btn-fly');
    primaryBtn.style.background = `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`;
    primaryBtn.style.boxShadow = `0 4px 15px ${cat.color}4d`;

    panel.classList.remove('hidden');
    panel.style.animation = 'none';
    panel.offsetHeight;
    panel.style.animation = '';

    // Render chart if visible
    if (hourlyData && hourlyData.length === 24) {
        requestAnimationFrame(() => {
            try { renderMiniBarChart(document.getElementById('tp-chart'), hourlyData); }
            catch (e) { console.warn('Chart render error:', e); }
        });
    }
}

function closeTourismPanel() {
    document.getElementById('tourism-panel').classList.add('hidden');
}

function renderMiniBarChart(canvas, data) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const max = Math.max(...data, 1);
    const barW = (w - 2) / 24;
    const gap = 1;
    const currentHour = new Date().getHours();

    for (let i = 0; i < 24; i++) {
        const val = data[i] / max;
        const barH = val * (h - 8);
        const x = i * barW + 1;
        const y = h - barH - 2;

        // Color based on value
        let color;
        if (data[i] >= 60) color = '#ef4444';
        else if (data[i] >= 30) color = '#f59e0b';
        else color = '#10b981';

        // Highlight current hour
        if (i === currentHour) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
        }

        ctx.fillStyle = i === currentHour ? '#ffffff' : color;
        ctx.fillRect(x, y, barW - gap, Math.max(barH, 1));
        ctx.shadowBlur = 0;
    }
}

// =====================================================
// HEATMAP
// =====================================================
function buildHeatmap() {
    if (!categoryData.pariwisata) return;
    const heatPoints = categoryData.pariwisata.features.map(f => {
        const coords = f.geometry.coordinates;
        const intensity = (f.properties.visitors_per_day || 1000) / 5000;
        return [coords[1], coords[0], Math.min(intensity, 1)];
    });
    heatmapLayer = L.heatLayer(heatPoints, {
        radius: 35, blur: 25, maxZoom: 15,
        gradient: { 0.2: '#06b6d4', 0.4: '#10b981', 0.6: '#f59e0b', 0.8: '#ef4444', 1.0: '#e11d48' }
    });
}

// =====================================================
// UTILITIES
// =====================================================
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function toRad(d) { return d * Math.PI / 180; }
function formatDistance(km) {
    return km < 1 ? `~${Math.round(km*1000)} meter dari pusat peta` : `~${km.toFixed(1)} km dari pusat peta`;
}
function escapeHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
}

// =====================================================
// DISASTER SUB-TABS
// =====================================================
function renderDisasterSubTabs() {
    const container = document.getElementById('disaster-sub-tabs');
    const subcats = categoryMeta.kebencanaan ? Object.keys(categoryMeta.kebencanaan.subcategories || {}) : [];
    const tabs = [{ key: 'all', label: 'Semua' }, ...subcats.map(s => ({ key: s, label: s.replace('Risiko ','').replace('Rawan ','') }))];
    container.innerHTML = tabs.map(t =>
        `<button class="dst-tab ${t.key === activeDisasterSubTab ? 'active' : ''}" data-subtab="${t.key}">${t.label}</button>`
    ).join('');
    container.querySelectorAll('.dst-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            activeDisasterSubTab = btn.dataset.subtab;
            container.querySelectorAll('.dst-tab').forEach(b => b.classList.toggle('active', b === btn));
            rebuildCategoryLayer('kebencanaan');
        });
    });
}

// =====================================================
// DISASTER DETAIL PANEL
// =====================================================
function getFeatureCenter(feature) {
    const g = feature.geometry;
    if (g.type === 'Point') return [g.coordinates[1], g.coordinates[0]];
    if (g.type === 'Polygon') { const b = L.geoJSON(feature).getBounds().getCenter(); return [b.lat, b.lng]; }
    if (g.type === 'LineString') { const c = g.coordinates[Math.floor(g.coordinates.length / 2)]; return [c[1], c[0]]; }
    return [-7.7956, 110.3695];
}

function showDisasterPanel(feature, categoryKey) {
    const panel = document.getElementById('disaster-panel');
    const props = feature.properties;
    closeTourismPanel();
    closeInfoCard();
    currentReportFeature = { feature, categoryKey };

    // Header photo
    const header = document.getElementById('dp-header');
    header.style.backgroundImage = props.foto ? `url('${props.foto}')` : `linear-gradient(135deg, #dc2626, #991b1b)`;

    // Risk badge
    const badgeEl = document.getElementById('dp-risk-badge');
    const lr = props.level_risiko || 'Info';
    const zona = props.zona ? ` · ${props.zona}` : '';
    const riskClass = lr === 'Tinggi' ? 'risk-high' : lr === 'Sedang' ? 'risk-medium' : lr === 'Rendah' ? 'risk-low' : 'risk-info';
    badgeEl.className = `dp-risk-badge ${riskClass}`;
    badgeEl.textContent = `${lr === 'Tinggi' ? '🔴' : lr === 'Sedang' ? '🟠' : lr === 'Rendah' ? '🟡' : 'ℹ️'} RISIKO ${lr.toUpperCase()}${zona}`;

    document.getElementById('dp-name').textContent = props.name || 'Unnamed';

    // Meta line
    const metaItems = [];
    if (props.radius_km) metaItems.push(`📍 Radius 0–${props.radius_km} km dari puncak`);
    if (props.sumber_data) metaItems.push(`📊 Sumber: ${props.sumber_data}`);
    if (props.last_updated) metaItems.push(`Diperbarui: ${props.last_updated}`);
    document.getElementById('dp-meta').innerHTML = metaItems.join(' · ');

    document.getElementById('dp-description').textContent = props.deskripsi || '';

    // Facilities
    const facSection = document.getElementById('dp-facilities-section');
    const facilities = props.facilities || [];
    if (facilities.length > 0) {
        facSection.style.display = 'block';
        document.getElementById('dp-facilities').innerHTML = facilities.map(f =>
            `<span class="dp-facility-chip">${f}</span>`
        ).join('');
    } else { facSection.style.display = 'none'; }

    // Evacuation
    const evacBox = document.getElementById('dp-evac-box');
    if (props.instruksi_evakuasi) {
        evacBox.style.display = 'block';
        document.getElementById('dp-evac-text').textContent = props.instruksi_evakuasi;
    } else { evacBox.style.display = 'none'; }

    // History
    const histSection = document.getElementById('dp-history-section');
    const history = props.riwayat_bencana || [];
    if (history.length > 0) {
        histSection.style.display = 'block';
        document.getElementById('dp-history-list').innerHTML = history.slice(0, 3).map(h => `
            <div class="dp-history-item">
                <div class="dp-history-date">🗓️ ${h.tanggal}</div>
                <div class="dp-history-detail">${h.jenis} ${h.skala} · ${h.korban_jiwa} korban jiwa</div>
                <div class="dp-history-sub">${(h.pengungsi||0).toLocaleString()} pengungsi · ${h.kerugian_material || '-'}</div>
            </div>
        `).join('');
    } else { histSection.style.display = 'none'; }

    // Contact
    const contactEl = document.getElementById('dp-contact');
    if (props.kontak_darurat) {
        contactEl.style.display = 'flex';
        const phone = props.kontak_darurat.replace(/[^+\d]/g, '').slice(0, 16);
        document.getElementById('dp-contact-phone').textContent = props.kontak_darurat;
        document.getElementById('dp-contact-phone').href = `tel:${phone}`;
    } else { contactEl.style.display = 'none'; }

    // Actions
    const center = getFeatureCenter(feature);
    document.getElementById('dp-btn-gmaps').onclick = () => window.open(`https://www.google.com/maps?q=${center[0]},${center[1]}`, '_blank');
    document.getElementById('dp-btn-report').onclick = () => openReportModal(feature, categoryKey);

    panel.classList.remove('hidden');
}

function closeDisasterPanel() {
    document.getElementById('disaster-panel').classList.add('hidden');
}

// =====================================================
// STATS MODAL
// =====================================================
function openStatsModal() {
    const modal = document.getElementById('stats-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Calculate stats
    const total = allFeatures.length;
    const results = Object.entries(categoryData).map(([k, data]) => ({
        key: k,
        count: data.features ? data.features.length : 0,
        color: CATEGORIES[k].color,
        label: CATEGORIES[k].label
    })).filter(r => r.count > 0).sort((a, b) => b.count - a.count);

    const container = document.getElementById('stats-bars-container');
    container.innerHTML = results.map(r => {
        const percent = total > 0 ? ((r.count / total) * 100).toFixed(1) : 0;
        return `
            <div style="display: flex; align-items: center; gap: 16px;">
                <div style="width: 140px; font-size: 13px; font-weight: 600; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${r.label}
                </div>
                <div style="flex: 1; height: 12px; background: rgba(30,41,59,0.5); border-radius: 6px; overflow: hidden;">
                    <div style="height: 100%; border-radius: 6px; width: 0%; background: ${r.color}; box-shadow: 0 0 10px ${r.color}66; transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);" data-target-width="${percent}%"></div>
                </div>
                <div style="width: 90px; text-align: right; font-size: 12px; font-weight: 700; color: var(--text-primary);">
                    ${r.count.toLocaleString()} <span style="font-size: 10px; color: var(--text-muted); font-weight: 500; margin-left: 4px;">(${percent}%)</span>
                </div>
            </div>
        `;
    }).join('');

    // Trigger animation
    setTimeout(() => {
        container.querySelectorAll('[data-target-width]').forEach(bar => {
            bar.style.width = bar.getAttribute('data-target-width');
        });
    }, 100);
}

function closeStatsModal() {
    document.getElementById('stats-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

// =====================================================
// REPORT MODAL
// =====================================================
function openReportModal(feature, categoryKey) {
    const modal = document.getElementById('report-modal');
    currentReportFeature = { feature, categoryKey };
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    renderReportTab('ringkasan');
    // Tab clicks
    modal.querySelectorAll('.rm-tab').forEach(t => {
        t.onclick = () => {
            modal.querySelectorAll('.rm-tab').forEach(b => b.classList.remove('active'));
            t.classList.add('active');
            renderReportTab(t.dataset.tab);
        };
    });
    document.getElementById('rm-close').onclick = () => closeReportModal();
}

function closeReportModal() {
    document.getElementById('report-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

function renderReportTab(tab) {
    const content = document.getElementById('rm-content');
    const { feature } = currentReportFeature || {};
    if (!feature) return;
    const p = feature.properties;

    if (tab === 'ringkasan') {
        const lr = p.level_risiko || 'Info';
        const riskClass = lr === 'Tinggi' ? 'risk-high' : lr === 'Sedang' ? 'risk-medium' : 'risk-low';
        content.innerHTML = `
            <div class="rm-summary">
                <h2 class="rm-title">${escapeHtml(p.name||'')}</h2>
                <span class="rm-risk-badge ${riskClass}">${lr.toUpperCase()}</span>
                <div class="rm-stat-grid">
                    <div class="rm-stat-card"><div class="rm-stat-num">${p.radius_km ? p.radius_km+' km' : '-'}</div><div class="rm-stat-label">Luas Terdampak</div></div>
                    <div class="rm-stat-card"><div class="rm-stat-num">${p.kapasitas ? p.kapasitas.toLocaleString() : '-'}</div><div class="rm-stat-label">Kapasitas Pengungsian</div></div>
                    <div class="rm-stat-card"><div class="rm-stat-num">${(p.riwayat_bencana||[]).length}</div><div class="rm-stat-label">Kejadian Tercatat</div></div>
                    <div class="rm-stat-card"><div class="rm-stat-num">${p.zona||'-'}</div><div class="rm-stat-label">Zona</div></div>
                </div>
                <p class="rm-desc">${escapeHtml(p.deskripsi||'')}</p>
                <div class="rm-source">📊 Sumber: ${escapeHtml(p.sumber_data||'-')} · Diperbarui: ${p.last_updated||'-'}</div>
            </div>`;
    } else if (tab === 'riwayat') {
        const hist = p.riwayat_bencana || [];
        const totalKorban = hist.reduce((s, h) => s + (h.korban_jiwa || 0), 0);
        const totalPengungsi = hist.reduce((s, h) => s + (h.pengungsi || 0), 0);
        content.innerHTML = `
            <div class="rm-history">
                <div class="rm-hist-stats">
                    <div class="rm-stat-card"><div class="rm-stat-num">${hist.length}</div><div class="rm-stat-label">Total Kejadian</div></div>
                    <div class="rm-stat-card"><div class="rm-stat-num">${totalKorban.toLocaleString()}</div><div class="rm-stat-label">Total Korban</div></div>
                    <div class="rm-stat-card"><div class="rm-stat-num">${totalPengungsi.toLocaleString()}</div><div class="rm-stat-label">Total Pengungsi</div></div>
                </div>
                <div class="rm-timeline">
                    ${hist.length === 0 ? '<p class="rm-empty">Belum ada riwayat bencana tercatat.</p>' :
                    hist.map(h => {
                        const scaleClass = (h.skala||'').includes('4') || (h.skala||'').includes('6') || h.skala === 'Besar' ? 'scale-high' : (h.skala||'').includes('2') || h.skala === 'Sedang' ? 'scale-med' : 'scale-low';
                        return `<div class="rm-tl-item">
                            <div class="rm-tl-dot ${scaleClass}"></div>
                            <div class="rm-tl-content">
                                <div class="rm-tl-date">${h.tanggal}</div>
                                <div class="rm-tl-title">${h.jenis} <span class="rm-tl-scale ${scaleClass}">${h.skala}</span></div>
                                <div class="rm-tl-detail">${(h.korban_jiwa||0).toLocaleString()} korban · ${(h.pengungsi||0).toLocaleString()} pengungsi · ${h.kerugian_material||'-'}</div>
                                <p class="rm-tl-desc">${escapeHtml(h.deskripsi||'')}</p>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
    } else if (tab === 'evakuasi') {
        const fac = p.facilities || [];
        content.innerHTML = `
            <div class="rm-evac">
                <h3 class="rm-section-title">Instruksi Evakuasi</h3>
                <div class="rm-evac-box">${escapeHtml(p.instruksi_evakuasi || 'Tidak ada instruksi.')}</div>
                ${fac.length > 0 ? `<h3 class="rm-section-title">Fasilitas Pengungsian</h3><div class="rm-fac-grid">${fac.map(f => `<span class="rm-fac-chip">${f}</span>`).join('')}</div>` : ''}
                <h3 class="rm-section-title">Nomor Darurat</h3>
                <div class="rm-contact-grid">
                    <div class="rm-contact-card"><span class="rm-cc-icon">🚨</span><span class="rm-cc-name">BPBD DIY</span><span class="rm-cc-phone">+62274-515059</span></div>
                    <div class="rm-contact-card"><span class="rm-cc-icon">🔍</span><span class="rm-cc-name">Basarnas</span><span class="rm-cc-phone">115</span></div>
                    <div class="rm-contact-card"><span class="rm-cc-icon">🏥</span><span class="rm-cc-name">PMI DIY</span><span class="rm-cc-phone">+62274-561669</span></div>
                    <div class="rm-contact-card"><span class="rm-cc-icon">⚡</span><span class="rm-cc-name">PLN</span><span class="rm-cc-phone">123</span></div>
                    <div class="rm-contact-card"><span class="rm-cc-icon">💧</span><span class="rm-cc-name">PDAM</span><span class="rm-cc-phone">+62274-512345</span></div>
                </div>
            </div>`;
    } else if (tab === 'kontak') {
        content.innerHTML = `
            <div class="rm-contacts">
                <h3 class="rm-section-title">Kontak Instansi Terkait</h3>
                <div class="rm-contact-grid rm-contact-grid-lg">
                    <div class="rm-inst-card"><div class="rm-inst-icon">🚨</div><div class="rm-inst-name">BPBD DIY</div><div class="rm-inst-desc">Badan Penanggulangan Bencana Daerah</div><a class="rm-inst-phone" href="tel:+62274515059">📞 +62274-515059</a><a class="rm-inst-link" href="https://bpbd.jogjaprov.go.id" target="_blank">🌐 Website</a></div>
                    <div class="rm-inst-card"><div class="rm-inst-icon">🌋</div><div class="rm-inst-name">BPPTKG</div><div class="rm-inst-desc">Balai Penyelidikan dan Pengembangan Teknologi Kebencanaan Geologi</div><a class="rm-inst-phone" href="tel:+62274514192">📞 +62274-514192</a><a class="rm-inst-link" href="https://merapi.bgl.esdm.go.id" target="_blank">🌐 Website</a></div>
                    <div class="rm-inst-card"><div class="rm-inst-icon">🌤️</div><div class="rm-inst-name">BMKG Yogyakarta</div><div class="rm-inst-desc">Badan Meteorologi, Klimatologi, dan Geofisika</div><a class="rm-inst-phone" href="tel:+62274512346">📞 +62274-512346</a><a class="rm-inst-link" href="https://bmkg.go.id" target="_blank">🌐 Website</a></div>
                    <div class="rm-inst-card"><div class="rm-inst-icon">🇮🇩</div><div class="rm-inst-name">BNPB</div><div class="rm-inst-desc">Badan Nasional Penanggulangan Bencana</div><a class="rm-inst-phone" href="tel:117">📞 117</a><a class="rm-inst-link" href="https://bnpb.go.id" target="_blank">🌐 Website</a></div>
                </div>
            </div>`;
    }
}

// =====================================================
// RECENT EVENTS WIDGET
// =====================================================
function renderRecentEvents() {
    const widget = document.getElementById('recent-events-widget');
    const list = document.getElementById('rew-list');
    const events = [
        { icon: '🌋', title: 'Aktivitas Merapi', status: 'Siaga (Level III)', statusClass: 'status-danger', time: '3 jam lalu' },
        { icon: '🌧️', title: 'Banjir Bantul', status: 'Waspada', statusClass: 'status-warning', time: '2 hari lalu' },
        { icon: '🌿', title: 'Kualitas Udara Kota', status: 'Sedang (AQI 65)', statusClass: 'status-moderate', time: '1 jam lalu' },
    ];
    list.innerHTML = events.map(e => `
        <div class="rew-item">
            <span class="rew-icon">${e.icon}</span>
            <div class="rew-info">
                <div class="rew-event-title">${e.title} <span class="rew-status ${e.statusClass}">→ ${e.status}</span></div>
                <div class="rew-time">Terakhir: ${e.time}</div>
            </div>
        </div>
    `).join('');
    widget.style.display = 'none'; // shown only when disaster category active
}

// =====================================================
// INIT
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initSidebar();
    initSearch();
    initWelcome();
    loadAllData();
    // Report modal ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeReportModal();
    });
});
