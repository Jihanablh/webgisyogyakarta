import { CONFIG } from '../state.js';
import { createMarker } from '../markers.js';

let _spaMap       = null;
let _prevPageId   = null;  // ID halaman sebelumnya untuk kembali
let _onBack       = null;

/**
 * Tampilkan SPA map page dengan satu marker tunggal.
 * @param {string} name - Nama lokasi
 * @param {number} lat
 * @param {number} lng
 * @param {string} fromPageId - ID elemen halaman asal (untuk kembali)
 */
export function showSingleMarkerMap(name, lat, lng, fromPageId = null) {
    _prevPageId = fromPageId;
    _setupSpaMapPage(name);
    _initSpaMap((map) => {
        const feature = {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [lng, lat] },
            properties: { name, category: 'pariwisata' }
        };
        const marker = createMarker(feature, [lat, lng], 'pariwisata').addTo(map);
        marker.bindTooltip(`<strong>${_esc(name)}</strong><br><span>Lokasi terpilih</span>`, {
            direction: 'top',
            offset: [0, -18],
            opacity: 1,
            className: 'map-marker-tooltip'
        });
        map.setView([lat, lng], 16, { animate: true });
    });
}

/**
 * Tampilkan SPA map page dengan semua marker dari satu kategori.
 * @param {string} catLabel - Label kategori untuk judul
 * @param {Array}  features - Array GeoJSON features
 * @param {string} catColor - Warna marker
 * @param {string} fromPageId
 */
export function showCategoryMap(catLabel, features, catColor = '#d4a017', fromPageId = null) {
    _prevPageId = fromPageId;
    _setupSpaMapPage(`Peta — ${catLabel}`);
    _initSpaMap((map) => {
        if (!features?.length) return;
        const group = L.featureGroup();
        features.forEach(f => {
            if (f.geometry?.type !== 'Point') return;
            const [lng, lat] = f.geometry.coordinates;
            const name = f.properties?.name || f.properties?.nama || 'Lokasi';
            const catKey = f.properties?.category || _categoryKeyFromLabel(catLabel);
            const marker = createMarker(f, [lat, lng], catKey);
            marker.bindTooltip(`<strong>${_esc(name)}</strong><br><span>${_esc(f.properties?.subcategory || f.properties?.type || catLabel)}</span>`, {
                direction: 'top',
                offset: [0, -18],
                opacity: 1,
                className: 'map-marker-tooltip'
            });
            group.addLayer(marker);
        });
        group.addTo(map);
        try {
            const bounds = group.getBounds();
            if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] });
        } catch (_) {}
    });
}

function _categoryKeyFromLabel(label) {
    const s = String(label || '').toLowerCase();
    if (s.includes('wisata') || s.includes('pariwisata')) return 'pariwisata';
    if (s.includes('sehat')) return 'kesehatan_darurat';
    if (s.includes('didik') || s.includes('akademik')) return 'akademik';
    if (s.includes('mobil')) return 'mobilitas';
    if (s.includes('uang') || s.includes('bank')) return 'atm_bank';
    if (s.includes('perintah') || s.includes('sosial')) return 'sosial_tugas';
    return 'pariwisata';
}

/** Sembunyikan SPA map page dan kembali ke halaman sebelumnya */
export function hideSpaMap() {
    const page = document.getElementById('spa-map-page');
    if (page) page.classList.add('hidden');

    if (_spaMap) {
        try { _spaMap.remove(); } catch (_) {}
        _spaMap = null;
    }
    const container = document.getElementById('spa-map-container');
    if (container) container.innerHTML = '';

    if (_prevPageId) {
        const prev = document.getElementById(_prevPageId);
        if (prev) prev.classList.remove('hidden');
        _prevPageId = null;
    }
}

// ── Internal helpers ───────────────────────────────────────────────────────────

function _setupSpaMapPage(title) {
    // Sembunyikan semua spa-page yang sedang visible
    document.querySelectorAll('.spa-page:not(#spa-map-page)').forEach(p => {
        if (!p.classList.contains('hidden')) {
            _prevPageId = _prevPageId || p.id;
            p.classList.add('hidden');
        }
    });
    // Sembunyikan juga sidebar dan chrome
    document.getElementById('sidebar')?.classList.add('hidden');
    document.getElementById('map-top-left-chrome')?.classList.add('hidden');
    document.getElementById('map-right-stack')?.classList.add('hidden');

    // Set judul
    const titleEl = document.getElementById('spa-map-title');
    if (titleEl) titleEl.textContent = title;

    // Tampilkan SPA map page
    const page = document.getElementById('spa-map-page');
    if (page) page.classList.remove('hidden');

    // Wire tombol kembali
    const backBtn = document.getElementById('spa-map-back');
    if (backBtn) {
        const newBtn = backBtn.cloneNode(true);
        backBtn.parentNode.replaceChild(newBtn, backBtn);
        newBtn.addEventListener('click', () => {
            hideSpaMap();
            // Restore sidebar dan chrome di map page
            if (!_prevPageId || _prevPageId === 'map') {
                document.getElementById('sidebar')?.classList.remove('hidden');
                document.getElementById('map-top-left-chrome')?.classList.remove('hidden');
                document.getElementById('map-right-stack')?.classList.remove('hidden');
            }
        });
    }
}

function _initSpaMap(callback) {
    if (_spaMap) {
        try { _spaMap.remove(); } catch (_) {}
        _spaMap = null;
    }
    const container = document.getElementById('spa-map-container');
    if (!container || typeof L === 'undefined') return;
    container.innerHTML = '';

    const mapDiv = document.createElement('div');
    mapDiv.style.cssText = 'width:100%;height:100%;';
    container.appendChild(mapDiv);

    _spaMap = L.map(mapDiv, {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true
    }).setView(CONFIG.center, CONFIG.zoom);

    L.tileLayer(CONFIG.tileUrl, {
        attribution: CONFIG.tileAttribution,
        maxZoom: 19
    }).addTo(_spaMap);

    requestAnimationFrame(() => {
        setTimeout(() => {
            try { _spaMap?.invalidateSize(); } catch (_) {}
            callback(_spaMap);
        }, 150);
    });
}

function _esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
