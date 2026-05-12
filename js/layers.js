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
    });
    layerGroup.addLayer(geoJsonLayer);
    return layerGroup;
}

export async function loadLayer(category) {
    // If already cached, just ensure visibility state is correct
    if (State.layerCache[category]) {
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

    // Store raw data
    State.categoryData[category] = { type: 'FeatureCollection', features: allFeatures };
    State.rawGeojsonCache[category] = allFeatures;

    // Build subcategory metadata
    const subcatCounts = {};
    allFeatures.forEach(f => {
        const sc = f.properties.subcategory || f.properties.type || 'Lainnya';
        subcatCounts[sc] = (subcatCounts[sc] || 0) + 1;
    });
    State.categoryMeta[category] = { subcategories: subcatCounts };

    // All subcats active by default
    State.activeSubcats[category] = new Set(Object.keys(subcatCounts));

    // Build and cache layer group
    const layerGroup = buildLayerGroup(category, allFeatures);
    State.layerCache[category] = layerGroup;

    // Add to cluster ONLY if this category is enabled by the user
    if (State.enabledCategories.has(category)) {
        State.markerClusterGroup.addLayer(layerGroup);
    }

    // Signal sidebar to refresh (count update)
    document.dispatchEvent(new CustomEvent('layerLoaded', { detail: { category } }));
}

/** Show a category on the map and mark it as user-enabled */
export function showLayer(category) {
    State.enabledCategories.add(category);
    const lg = State.layerCache[category];
    if (lg && !State.markerClusterGroup.hasLayer(lg)) {
        State.markerClusterGroup.addLayer(lg);
    }
}

/** Hide a category from the map and mark it as user-disabled */
export function hideLayer(category) {
    State.enabledCategories.delete(category);
    const lg = State.layerCache[category];
    if (lg) State.markerClusterGroup.removeLayer(lg);
}

/** Show ONLY one specific category and hide all others */
export function showOnlyCategory(category) {
    State.onlyKebencanaan = category === 'kebencanaan';
    State.enabledCategories.clear();
    State.enabledCategories.add(category);
    Object.keys(State.layerCache).forEach(cat => {
        if (cat !== category) {
            State.markerClusterGroup.removeLayer(State.layerCache[cat]);
        } else {
            if (!State.markerClusterGroup.hasLayer(State.layerCache[cat])) {
                State.markerClusterGroup.addLayer(State.layerCache[cat]);
            }
        }
    });
}

/** Show ONLY kebencanaan — disables all other categories */
export function showOnlyKebencanaan() {
    showOnlyCategory('kebencanaan');
}

/** Fit map bounds to a category */
export function fitMapToCategory(category) {
    const lg = State.layerCache[category];
    if (lg && State.map) {
        const bounds = lg.getBounds();
        if (bounds.isValid()) {
            State.map.fitBounds(bounds, { padding: [50, 50], duration: 1.2 });
        }
    }
}

/** Show ALL loaded layers */
export function showAllLayers() {
    State.onlyKebencanaan = false;
    Object.keys(State.layerCache).forEach(cat => {
        State.enabledCategories.add(cat);
        if (!State.markerClusterGroup.hasLayer(State.layerCache[cat])) {
            State.markerClusterGroup.addLayer(State.layerCache[cat]);
        }
    });
}

/** Rebuild a category layer with current subcat filter, respecting enabledCategories */
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

    // Only add if this category is user-enabled
    if (State.enabledCategories.has(key)) {
        State.markerClusterGroup.addLayer(layerGroup);
    }
}