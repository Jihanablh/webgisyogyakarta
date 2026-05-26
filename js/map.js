import { CONFIG, State } from './state.js?v=20260526-round26-welcome-encoding';

export function initMap() {
    State.map = L.map('map', {
        center: CONFIG.center,
        zoom: CONFIG.zoom,
        minZoom: CONFIG.minZoom,
        maxZoom: CONFIG.maxZoom,
        maxBounds: CONFIG.maxBounds,
        maxBoundsViscosity: CONFIG.maxBoundsViscosity,
        zoomControl: false,
        preferCanvas: true,
        renderer: L.canvas()
    });

    (async () => {
        try {
            const response = await fetch('data/yogyakarta_boundary.geojson');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            L.geoJSON(data, {
                style: {
                    color: '#2980b9',
                    weight: 1.5,
                    opacity: 0.7,
                    fillOpacity: 0
                },
                className: 'diy-boundary'
            })
                .bindTooltip('Batas Wilayah DIY', {
                    permanent: false,
                    direction: 'center',
                    className: 'boundary-tooltip'
                })
                .addTo(State.map);
        } catch (err) {
            console.warn('GeoJSON batas wilayah gagal dimuat:', err?.message || err);
        }
    })();

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

    State.map.on('mousemove', (e) => {
        const coordEl = document.getElementById('coord-text');
        if (coordEl) {
            coordEl.textContent = `${Math.abs(e.latlng.lat).toFixed(4)}°${e.latlng.lat < 0 ? 'S' : 'N'}, ${Math.abs(e.latlng.lng).toFixed(4)}°${e.latlng.lng > 0 ? 'E' : 'W'}`;
        }
    });

    setTimeout(() => {
        try {
            State.map.invalidateSize();
        } catch (_) { /* ignore */ }
    }, 300);

    window.addEventListener('resize', () => {
        try {
            if (State.map) State.map.invalidateSize();
        } catch (_) { /* ignore */ }
    });

    return State.map;
}
