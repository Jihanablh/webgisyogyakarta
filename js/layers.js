import { State, CATEGORIES } from './state.js';
import { createMarker } from './markers.js';
import { loadLargeGeoJSON } from './utils/loader.js';

function buildLayerGroup(category, features) {
    const layerGroup = L.featureGroup();
    if (!features || features.length === 0) return layerGroup;

    const geoJsonLayer = L.geoJSON({ type: 'FeatureCollection', features }, {
        pointToLayer: (feature, latlng) => createMarker(feature, latlng, category),
        onEachFeature: (feature, layer) => {
            layer.on('click', () => {
                document.dispatchEvent(new CustomEvent('markerClicked', {
                    detail: { feature, category, layer }
                }));
            });
        },
        style: (feature) => {
            // For polygon/line features (disaster zones, evacuation routes)
            const subcat = feature.properties.subcategory || '';
            const cat = CATEGORIES[category];
            const color = cat ? cat.color : '#3b82f6';
            if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
                return { color, weight: 3, opacity: 0.8, dashArray: '6 4' };
            }
            if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
                return { color, weight: 2, opacity: 0.7, fillColor: color, fillOpacity: 0.12 };
            }
            return {};
        }
    });
    layerGroup.addLayer(geoJsonLayer);
    return layerGroup;
}

export async function loadLayer(category) {
    if (State.layerCache[category]) {
        if (category === 'kebencanaan' || !State.onlyKebencanaan) {
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
        await loadLargeGeoJSON(cat.file, (chunk) => {
            chunk.forEach(f => allFeatures.push(f));
        });
    } catch (e) {
        console.warn(`Could not load ${cat.file}:`, e);
        return;
    }

    // Store raw data
    State.categoryData[category] = { type: 'FeatureCollection', features: allFeatures };
    State.rawGeojsonCache[category] = allFeatures;

    // Build subcategory metadata (counts per subcat)
    const subcatCounts = {};
    allFeatures.forEach(f => {
        const sc = f.properties.subcategory || f.properties.type || 'Lainnya';
        subcatCounts[sc] = (subcatCounts[sc] || 0) + 1;
    });
    State.categoryMeta[category] = { subcategories: subcatCounts };

    // All subcats active by default
    State.activeSubcats[category] = new Set(Object.keys(subcatCounts));

    // Build and cache layer
    const layerGroup = buildLayerGroup(category, allFeatures);
    State.layerCache[category] = layerGroup;

    // Add to cluster only if appropriate
    if (category === 'kebencanaan' || !State.onlyKebencanaan) {
        State.markerClusterGroup.addLayer(layerGroup);
    }

    // Signal that a layer is ready (sidebar can rebuild accordion)
    document.dispatchEvent(new CustomEvent('layerLoaded', { detail: { category } }));
}

export function hideLayer(category) {
    if (State.layerCache[category]) {
        State.markerClusterGroup.removeLayer(State.layerCache[category]);
    }
}

export function showLayer(category) {
    if (State.layerCache[category] && !State.markerClusterGroup.hasLayer(State.layerCache[category])) {
        State.markerClusterGroup.addLayer(State.layerCache[category]);
    }
}

export function showOnlyKebencanaan() {
    State.onlyKebencanaan = true;
    Object.keys(State.layerCache).forEach(cat => {
        if (cat !== 'kebencanaan') hideLayer(cat);
    });
}

export function showAllLayers() {
    State.onlyKebencanaan = false;
    Object.keys(State.layerCache).forEach(cat => showLayer(cat));
}

export function rebuildCategoryLayer(key) {
    const rawFeatures = State.rawGeojsonCache[key];
    if (!rawFeatures) return;

    const activeSet = State.activeSubcats[key] || new Set();

    const filtered = rawFeatures.filter(f => {
        const sc = f.properties.subcategory || f.properties.type || 'Lainnya';
        return activeSet.has(sc);
    });

    // Remove old layer
    const old = State.layerCache[key];
    if (old) State.markerClusterGroup.removeLayer(old);

    // Build new filtered layer
    const layerGroup = buildLayerGroup(key, filtered);
    State.layerCache[key] = layerGroup;

    if (key === 'kebencanaan' || !State.onlyKebencanaan) {
        State.markerClusterGroup.addLayer(layerGroup);
    }
}