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
    kebutuhan:          { label: 'Kebutuhan',           icon: '🛒', color: '#f59e0b', file: 'data/kebutuhan.geojson' },
    atm_bank:           { label: 'ATM & Bank',          icon: '🏦', color: '#10b981', file: 'data/atm_bank.geojson' },
    tempat_tinggal:     { label: 'Tempat Tinggal',      icon: '🏠', color: '#8b5cf6', file: 'data/tempat_tinggal.geojson' },
    sosial_tugas:       { label: 'Sosial & Tugas',      icon: '🍽️', color: '#f43f5e', file: 'data/sosial_tugas.geojson' },
    akademik:           { label: 'Pusat Akademik',      icon: '🎓', color: '#3b82f6', file: 'data/akademik.geojson' },
    kesehatan_darurat:  { label: 'Kesehatan & Darurat', icon: '🏥', color: '#ef4444', file: 'data/kesehatan_darurat.geojson' },
    mobilitas:          { label: 'Mobilitas',           icon: '🚌', color: '#06b6d4', file: 'data/mobilitas.geojson' },
};

// =====================================================
// STATE
// =====================================================
let map;
let boundaryLayer;
const categoryLayers = {};      // { catKey: L.markerClusterGroup }
const categoryData = {};        // { catKey: geojsonData }
const categoryMeta = {};        // { catKey: { label, subcategories: {name: count} } }
const activeSubcats = {};       // { catKey: Set<subcatName> }
let allFeatures = [];           // flat search index
let searchHighlightMarker = null;

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

                addCategoryLayer(key, data);
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
        renderAccordion(results);
        renderStats(results);

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
function addCategoryLayer(categoryKey, data) {
    const cat = CATEGORIES[categoryKey];

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
        pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
                radius: 6, fillColor: cat.color, fillOpacity: 0.85,
                color: '#ffffff', weight: 1.5, opacity: 0.9
            });
        },
        filter: (feature) => {
            // Filter by active subcategories
            const sc = feature.properties.subcategory;
            return activeSubcats[categoryKey] && activeSubcats[categoryKey].has(sc);
        },
        onEachFeature: (feature, layer) => {
            const props = feature.properties;
            const name = props.name || 'Unnamed';
            layer.bindPopup(`
                <div class="popup-content">
                    <div class="popup-name">${escapeHtml(name)}</div>
                    <div class="popup-type">
                        <span class="popup-dot" style="background:${cat.color}"></span>
                        ${escapeHtml(props.subcategory || props.type || '')} · ${cat.label}
                    </div>
                </div>
            `, { closeButton: true, maxWidth: 250 });

            layer.on('click', (e) => {
                L.DomEvent.stopPropagation(e);
                showInfoCard(feature, categoryKey);
            });
        }
    });

    clusterGroup.addLayer(geoLayer);
    clusterGroup.addTo(map);
    categoryLayers[categoryKey] = { cluster: clusterGroup, geoLayer };
}

function rebuildCategoryLayer(categoryKey) {
    const layerInfo = categoryLayers[categoryKey];
    if (!layerInfo) return;

    // Remove old
    map.removeLayer(layerInfo.cluster);

    // Rebuild with new filter
    addCategoryLayer(categoryKey, categoryData[categoryKey]);
}

// =====================================================
// ACCORDION UI
// =====================================================
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

    // 3. Create force-render highlighted marker with bounce animation
    const highlightIcon = L.divIcon({
        className: 'search-highlight-marker',
        html: `
            <div class="search-marker-pulse"></div>
            <div class="search-marker-pin"></div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });

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

    // Open popup after fly animation
    setTimeout(() => {
        if (searchHighlightMarker) searchHighlightMarker.openPopup();
    }, 1400);

    // 4. Show info card
    showInfoCard(feature, categoryKey);
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
// INIT
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initSidebar();
    initSearch();
    loadAllData();
});
