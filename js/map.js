import { CONFIG, State } from './state.js';

export function initMap() {
    State.map = L.map('map', {
        center: CONFIG.center,
        zoom: CONFIG.zoom,
        minZoom: CONFIG.minZoom,
        maxZoom: CONFIG.maxZoom,
        zoomControl: false,
        preferCanvas: true,
        renderer: L.canvas()
    });

    L.control.zoom({ position: 'bottomright' }).addTo(State.map);

    L.tileLayer(CONFIG.tileUrl, {
        attribution: CONFIG.tileAttribution,
        maxZoom: 19,
        keepBuffer: 4,
        updateWhenIdle: false,
        updateWhenZooming: false
    }).addTo(State.map);

    // Initialize marker cluster group
    State.markerClusterGroup = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: function(cluster) {
            const count = cluster.getChildCount();
            let size = 'small';
            if (count > 20) size = 'medium';
            if (count > 50) size = 'large';
            return L.divIcon({
                html: `<div><span>${count}</span></div>`,
                className: `marker-cluster marker-cluster-${size}`,
                iconSize: L.point(40, 40)
            });
        }
    });

    State.map.addLayer(State.markerClusterGroup);

    return State.map;
}
