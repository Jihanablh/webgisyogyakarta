import { State, CATEGORIES } from './state.js';
import { createMarker } from './markers.js';
import { loadLargeGeoJSON } from './utils/loader.js';
// To avoid circular dependencies with detail-panel logic and sidebar logic, 
// we will trigger custom events when a marker is clicked, or attach the click listener from main.js.

export async function loadLayer(category) {
    if (State.layerCache[category]) {
        if (!State.map.hasLayer(State.layerCache[category])) {
            State.markerClusterGroup.addLayer(State.layerCache[category]);
        }
        return;
    }

    const fileUrl = CATEGORIES[category].file;
    const layerGroup = L.featureGroup();

    // Use chunking to avoid blocking UI
    await loadLargeGeoJSON(fileUrl, (chunk) => {
        const geoJsonLayer = L.geoJSON({ type: 'FeatureCollection', features: chunk }, {
            pointToLayer: (feature, latlng) => {
                return createMarker(feature, latlng);
            },
            onEachFeature: (feature, layer) => {
                layer.on('click', () => {
                    // Dispatch an event so detail-panel can catch it
                    document.dispatchEvent(new CustomEvent('markerClicked', {
                        detail: { feature, category, layer }
                    }));
                });
            }
        });
        layerGroup.addLayer(geoJsonLayer);
    });

    State.layerCache[category] = layerGroup;
    State.markerClusterGroup.addLayer(layerGroup);
}

export function hideLayer(category) {
    if (State.layerCache[category]) {
        State.markerClusterGroup.removeLayer(State.layerCache[category]);
    }
}
