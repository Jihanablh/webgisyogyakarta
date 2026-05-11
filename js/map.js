import { CONFIG, State } from './state.js';

// Will fetch actual boundary from geojson

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

    // --- DIY Boundary GeoJSON ---
    fetch('data/yogyakarta_boundary.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                style: {
                    color: '#4ade80',  // Softer green to fit aesthetic
                    weight: 1.5,
                    opacity: 0.8,
                    fill: true,
                    fillColor: '#4ade80',
                    fillOpacity: 0.05,
                    dashArray: '5 5',
                    className: 'diy-boundary'
                }
            }).bindTooltip('Batas Wilayah DIY', {
                permanent: false,
                direction: 'center',
                className: 'boundary-tooltip'
            }).addTo(State.map);
        })
        .catch(err => console.error('Error loading boundary:', err));

    // --- Marker Cluster Group ---
    State.markerClusterGroup = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: function (cluster) {
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

    // Update coordinate display on mouse move
    State.map.on('mousemove', (e) => {
        const coordEl = document.getElementById('coord-text');
        if (coordEl) {
            coordEl.textContent = `${Math.abs(e.latlng.lat).toFixed(4)}°${e.latlng.lat < 0 ? 'S' : 'N'}, ${Math.abs(e.latlng.lng).toFixed(4)}°${e.latlng.lng > 0 ? 'E' : 'W'}`;
        }
    });

    return State.map;
}
