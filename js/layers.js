import { State, CATEGORIES } from './state.js';
import { createMarker } from './markers.js';
import { loadLargeGeoJSON } from './utils/loader.js';

// ── Internal kebencanaan layers ────────────────────────────────────────────────
let _kebHeatLayer    = null;  // L.heatLayer for zona bencana
let _kebLineLayer    = null;  // L.featureGroup for jalur evakuasi lines
let _kebMarkerLayer  = null;  // L.featureGroup for titik pengungsian / titik kumpul
let _boundaryLayer   = null;  // DIY boundary GeoJSON

/** Helper: centroid dari feature geometry */
function getCentroid(feature) {
    const g = feature.geometry;
    if (!g) return null;
    if (g.type === 'Point') {
        return [g.coordinates[1], g.coordinates[0]];
    }
    if ((g.type === 'Polygon' || g.type === 'MultiPolygon') && g.coordinates?.[0]?.length) {
        const ring = g.type === 'Polygon' ? g.coordinates[0] : g.coordinates[0][0];
        let sx = 0, sy = 0;
        ring.forEach(([x, y]) => { sx += x; sy += y; });
        return [sy / ring.length, sx / ring.length];
    }
    if (g.type === 'LineString' && g.coordinates?.length) {
        const mid = Math.floor(g.coordinates.length / 2);
        return [g.coordinates[mid][1], g.coordinates[mid][0]];
    }
    return null;
}

/** Intensity per tingkat risiko */
function risikoIntensity(levelRisiko) {
    const l = (levelRisiko || '').toLowerCase();
    if (l.includes('sangat tinggi')) return 1.0;
    if (l === 'tinggi') return 0.8;
    if (l === 'sedang') return 0.5;
    if (l === 'rendah') return 0.3;
    return 0.2;
}

/** Build heatmap layer dari polygon/linestring zona bencana */
function buildKebHeatLayer(features) {
    const heatPoints = [];
    features.forEach(f => {
        const tl = f.properties?.type_layer || '';
        if (tl === 'titik_pengungsian' || tl === 'titik_kumpul') return;
        if (f.geometry?.type === 'Point') return;
        const centroid = getCentroid(f);
        if (!centroid) return;
        const intensity = risikoIntensity(f.properties?.level_risiko);
        heatPoints.push([centroid[0], centroid[1], intensity]);
    });
    if (!heatPoints.length) return null;
    return L.heatLayer(heatPoints, {
        radius: 80,
        blur: 55,
        maxZoom: 15,
        minOpacity: 0.45,
        gradient: {
            0.0: '#1d4ed8',
            0.25: '#06b6d4',
            0.5:  '#fde047',
            0.75: '#fb923c',
            1.0:  '#ef4444'
        }
    });
}

/** Build line layer untuk jalur evakuasi */
function buildKebLineLayer(features) {
    const evakuasiFeatures = features.filter(f =>
        f.properties?.type_layer === 'jalur_evakuasi' ||
        (f.geometry?.type === 'LineString' || f.geometry?.type === 'MultiLineString')
    );
    if (!evakuasiFeatures.length) return null;
    return L.geoJSON({ type: 'FeatureCollection', features: evakuasiFeatures }, {
        style: () => ({
            color: '#22c55e',
            weight: 3,
            opacity: 0.85,
            dashArray: '8 6'
        }),
        onEachFeature: (feature, layer) => {
            layer.on('click', () => {
                document.dispatchEvent(new CustomEvent('markerClicked', {
                    detail: { feature, category: 'kebencanaan', layer }
                }));
            });
        }
    });
}

/** Build marker layer untuk titik pengungsian & titik kumpul */
function buildKebMarkerLayer(features) {
    const pointFeatures = features.filter(f => {
        const tl = f.properties?.type_layer || '';
        return f.geometry?.type === 'Point' &&
            (tl === 'titik_pengungsian' || tl === 'titik_kumpul');
    });
    if (!pointFeatures.length) return null;
    return L.geoJSON({ type: 'FeatureCollection', features: pointFeatures }, {
        pointToLayer: (feature, latlng) => createMarker(feature, latlng, 'kebencanaan'),
        onEachFeature: (feature, layer) => {
            layer.on('click', () => {
                document.dispatchEvent(new CustomEvent('markerClicked', {
                    detail: { feature, category: 'kebencanaan', layer }
                }));
            });
        }
    });
}

/** Remove all kebencanaan sublayers from map */
function _clearKebLayers() {
    if (_kebHeatLayer   && State.map) { try { State.map.removeLayer(_kebHeatLayer); }   catch(_) {} }
    if (_kebLineLayer   && State.map) { try { State.map.removeLayer(_kebLineLayer); }   catch(_) {} }
    if (_kebMarkerLayer && State.map) { try { State.map.removeLayer(_kebMarkerLayer); } catch(_) {} }
}

/** Tampilkan zona bencana: heatmap + jalur evakuasi */
export function showKebencanaanZona() {
    _clearKebLayers();
    if (!State.map) return;
    if (_kebHeatLayer)  State.map.addLayer(_kebHeatLayer);
    if (_kebLineLayer)  State.map.addLayer(_kebLineLayer);
}

/** Tampilkan tempat pengungsian: hanya marker titik */
export function showKebencanaanPengungsian() {
    _clearKebLayers();
    if (!State.map) return;
    if (_kebMarkerLayer) State.map.addLayer(_kebMarkerLayer);
}

/** Load dan render batas wilayah DIY di atas heatmap */
export async function loadDIYBoundary() {
    if (_boundaryLayer) return;
    try {
        const res = await fetch('data/yogyakarta_boundary.geojson');
        const geojson = await res.json();
        _boundaryLayer = L.geoJSON(geojson, {
            style: {
                color: '#2980b9',
                weight: 1.5,
                opacity: 0.7,
                fillColor: 'transparent',
                fillOpacity: 0
            }
        });
        if (State.map) _boundaryLayer.addTo(State.map);
    } catch (e) {
        console.warn('Gagal load batas DIY:', e);
    }
}

/** Stroke / fill untuk non-kebencanaan layers */
function nonDisasterStyle(category, feature) {
    const cat = CATEGORIES[category];
    const color = cat ? cat.color : '#3b82f6';
    const type = feature.geometry?.type;
    if (type === 'LineString' || type === 'MultiLineString') {
        return { color, weight: 3, opacity: 0.8, dashArray: '6 4' };
    }
    if (type === 'Polygon' || type === 'MultiPolygon') {
        return { color, weight: 2, opacity: 0.7, fillColor: color, fillOpacity: 0.12 };
    }
    return {};
}

function buildLayerGroup(category, features) {
    const layerGroup = L.featureGroup();
    if (!features || features.length === 0) return layerGroup;

    if (category === 'kebencanaan') {
        // Build sublayers
        _kebHeatLayer   = buildKebHeatLayer(features);
        _kebLineLayer   = buildKebLineLayer(features);
        _kebMarkerLayer = buildKebMarkerLayer(features);
        // Return empty placeholder — real layers are managed separately
        return layerGroup;
    }

    const geoJsonLayer = L.geoJSON({ type: 'FeatureCollection', features }, {
        pointToLayer: (feature, latlng) => createMarker(feature, latlng, category),
        onEachFeature: (feature, layer) => {
            layer.on('click', () => {
                document.dispatchEvent(new CustomEvent('markerClicked', {
                    detail: { feature, category, layer }
                }));
            });
        },
        style: (feature) => nonDisasterStyle(category, feature)
    });
    layerGroup.addLayer(geoJsonLayer);
    return layerGroup;
}

export async function loadLayer(category) {
    if (State.layerCache[category]) {
        if (category === 'kebencanaan') {
            showKebencanaanZona();
            return;
        }
        if (State.enabledCategories.has(category)) {
            if (!State.markerClusterGroup.hasLayer(State.layerCache[category])) {
                State.markerClusterGroup.addLayer(State.layerCache[category]);
            }
        }
        return;
    }

    const cat = CATEGORIES[category];
    if (!cat) { console.warn('Unknown category:', category); return; }

    const allFeatures = [];
    try {
        await loadLargeGeoJSON(cat.file, (chunk) => chunk.forEach(f => allFeatures.push(f)));
    } catch (e) {
        console.warn(`Could not load ${cat.file}:`, e);
        return;
    }

    State.categoryData[category] = { type: 'FeatureCollection', features: allFeatures };
    State.rawGeojsonCache[category] = allFeatures;

    const subcatCounts = {};
    allFeatures.forEach(f => {
        const sc = f.properties.subcategory || f.properties.type || 'Lainnya';
        subcatCounts[sc] = (subcatCounts[sc] || 0) + 1;
    });
    State.categoryMeta[category] = { subcategories: subcatCounts };
    State.activeSubcats[category] = new Set(Object.keys(subcatCounts));

    const layerGroup = buildLayerGroup(category, allFeatures);
    State.layerCache[category] = layerGroup;

    if (category === 'kebencanaan') {
        // Show zona bencana by default
        if (State.enabledCategories.has(category)) {
            showKebencanaanZona();
        }
    } else {
        if (State.enabledCategories.has(category)) {
            State.markerClusterGroup.addLayer(layerGroup);
        }
    }

    document.dispatchEvent(new CustomEvent('layerLoaded', { detail: { category } }));
}

export function showLayer(category) {
    State.enabledCategories.add(category);
    if (category === 'kebencanaan') { showKebencanaanZona(); return; }
    const lg = State.layerCache[category];
    if (lg && !State.markerClusterGroup.hasLayer(lg)) {
        State.markerClusterGroup.addLayer(lg);
    }
}

export function hideLayer(category) {
    State.enabledCategories.delete(category);
    if (category === 'kebencanaan') { _clearKebLayers(); return; }
    const lg = State.layerCache[category];
    if (lg) State.markerClusterGroup.removeLayer(lg);
}

export function showOnlyCategory(category) {
    State.onlyKebencanaan = category === 'kebencanaan';
    State.enabledCategories.clear();
    State.enabledCategories.add(category);
    Object.keys(State.layerCache).forEach(cat => {
        if (cat === 'kebencanaan') {
            if (category === 'kebencanaan') showKebencanaanZona();
            else _clearKebLayers();
        } else {
            if (cat !== category) {
                State.markerClusterGroup.removeLayer(State.layerCache[cat]);
            } else {
                if (!State.markerClusterGroup.hasLayer(State.layerCache[cat])) {
                    State.markerClusterGroup.addLayer(State.layerCache[cat]);
                }
            }
        }
    });
}

export function showOnlyKebencanaan() {
    showOnlyCategory('kebencanaan');
}

export function fitMapToCategory(category) {
    const lg = State.layerCache[category];
    if (lg && State.map) {
        const bounds = lg.getBounds();
        if (bounds && bounds.isValid()) {
            State.map.fitBounds(bounds, { padding: [50, 50], duration: 1.2 });
        }
    }
}

export function showAllLayers() {
    State.onlyKebencanaan = false;
    Object.keys(State.layerCache).forEach(cat => {
        State.enabledCategories.add(cat);
        if (cat === 'kebencanaan') { showKebencanaanZona(); return; }
        if (!State.markerClusterGroup.hasLayer(State.layerCache[cat])) {
            State.markerClusterGroup.addLayer(State.layerCache[cat]);
        }
    });
}

export function rebuildCategoryLayer(key) {
    const rawFeatures = State.rawGeojsonCache[key];
    if (!rawFeatures) return;

    if (key === 'kebencanaan') {
        // Rebuild sublayers
        _clearKebLayers();
        _kebHeatLayer   = buildKebHeatLayer(rawFeatures);
        _kebLineLayer   = buildKebLineLayer(rawFeatures);
        _kebMarkerLayer = buildKebMarkerLayer(rawFeatures);
        if (State.enabledCategories.has(key)) showKebencanaanZona();
        return;
    }

    const activeSet = State.activeSubcats[key] || new Set();
    const filtered = rawFeatures.filter(f => {
        const sc = f.properties.subcategory || f.properties.type || 'Lainnya';
        return activeSet.has(sc);
    });

    const old = State.layerCache[key];
    if (old) State.markerClusterGroup.removeLayer(old);

    const layerGroup = buildLayerGroup(key, filtered);
    State.layerCache[key] = layerGroup;

    if (State.enabledCategories.has(key)) {
        State.markerClusterGroup.addLayer(layerGroup);
    }
}
