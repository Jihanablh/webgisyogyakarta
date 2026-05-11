import { CONFIG, State } from './state.js';

// Approximate DIY (Daerah Istimewa Yogyakarta) boundary coordinates
const DIY_BOUNDARY = [
    [-7.4836, 110.1263],[-7.4950, 110.1650],[-7.4820, 110.2150],
    [-7.4780, 110.2680],[-7.4850, 110.3150],[-7.4920, 110.3800],
    [-7.5050, 110.4400],[-7.5200, 110.5000],[-7.5500, 110.5600],
    [-7.5800, 110.6000],[-7.6200, 110.6400],[-7.6600, 110.6750],
    [-7.7000, 110.7000],[-7.7500, 110.7200],[-7.8000, 110.7350],
    [-7.8500, 110.7400],[-7.9000, 110.7300],[-7.9500, 110.7100],
    [-8.0000, 110.6800],[-8.0500, 110.6400],[-8.0900, 110.6000],
    [-8.1200, 110.5500],[-8.1500, 110.5000],[-8.1700, 110.4400],
    [-8.1800, 110.3800],[-8.1750, 110.3200],[-8.1600, 110.2600],
    [-8.1400, 110.2000],[-8.1100, 110.1400],[-8.0800, 110.0800],
    [-8.0400, 110.0200],[-7.9900, 109.9700],[-7.9400, 109.9350],
    [-7.8900, 109.9100],[-7.8400, 109.9000],[-7.7900, 109.9050],
    [-7.7400, 109.9200],[-7.6900, 109.9450],[-7.6400, 109.9800],
    [-7.5900, 110.0200],[-7.5500, 110.0600],[-7.5200, 110.0950],
    [-7.4836, 110.1263]
];

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

    // --- DIY Boundary polygon ---
    L.polygon(DIY_BOUNDARY, {
        color: '#f59e0b',
        weight: 2,
        opacity: 0.7,
        fill: false,
        dashArray: '8 5',
        className: 'diy-boundary'
    }).addTo(State.map).bindTooltip('Batas Wilayah DIY', {
        permanent: false,
        direction: 'center',
        className: 'boundary-tooltip'
    });

    // --- Marker Cluster Group ---
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

    // Update coordinate display on mouse move
    State.map.on('mousemove', (e) => {
        const coordEl = document.getElementById('coord-text');
        if (coordEl) {
            coordEl.textContent = `${Math.abs(e.latlng.lat).toFixed(4)}°${e.latlng.lat < 0 ? 'S' : 'N'}, ${Math.abs(e.latlng.lng).toFixed(4)}°${e.latlng.lng > 0 ? 'E' : 'W'}`;
        }
    });

    return State.map;
}
