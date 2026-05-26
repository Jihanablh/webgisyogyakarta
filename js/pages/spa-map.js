import { CONFIG } from '../state.js?v=20260526-round26-welcome-encoding';
import { createMarker } from '../markers.js?v=20260526-round26-welcome-encoding';

let _spaMap = null;
let _prevPageId = null;
let _activeBasemap = null;
let _activeMapContext = null;

const TILESETS = {
    dark: {
        url: CONFIG.tileUrl,
        options: { attribution: CONFIG.tileAttribution, maxZoom: 19 }
    },
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        options: { attribution: '\u00a9 Esri', maxZoom: 19 }
    },
    terrain: {
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        options: { attribution: '\u00a9 OpenTopoMap', maxZoom: 17 }
    }
};

export function showSingleMarkerMap(name, lat, lng, fromPageId = null) {
    _prevPageId = fromPageId;
    _setupSpaMapPage(name);
    _initSpaMap((map) => {
        clearSpaMapLayers();
        _activeMapContext = 'single-marker';
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
        _addDiyBoundary(map);
        map.setView([lat, lng], 16, { animate: true });
    });
}

export function showCategoryMap(catLabel, features, catColor = '#d4a017', fromPageId = null) {
    _prevPageId = fromPageId;
    const validFeatures = (features || []).filter(f => f.geometry?.type === 'Point');
    _setupSpaMapPage(`Peta â€” ${catLabel}`);
    _initSpaMap((map) => {
        clearSpaMapLayers();
        _activeMapContext = 'category-map';
        _renderCategoryInfoPanel(catLabel, validFeatures.length, catColor);
        const group = L.featureGroup();

        validFeatures.forEach((f, idx) => {
            const [lng, lat] = f.geometry.coordinates;
            const props = f.properties || {};
            const name = props.name || props.nama || 'Lokasi';
            const catKey = props.category || _categoryKeyFromLabel(catLabel);
            const marker = createMarker(f, [lat, lng], catKey);

            marker.bindTooltip(`<strong>${_esc(name)}</strong><br><span>${_esc(props.subcategory || props.type || catLabel)}</span>`, {
                direction: 'top',
                offset: [0, -18],
                opacity: 1,
                className: 'map-marker-tooltip'
            });

            const popupId = `map-detail-${Date.now()}-${idx}`;
            marker.bindPopup(_richPopupHtml(f, catKey, catLabel, catColor, popupId), {
                className: 'rich-map-popup',
                closeButton: false,
                minWidth: 240,
                maxWidth: 280,
                offset: [0, -24]
            });
            marker.on('popupopen', () => {
                document.getElementById(popupId)?.addEventListener('click', () => {
                    _openDetailFromMap(f, catKey);
                }, { once: true });
            });
            group.addLayer(marker);
        });

        group.addTo(map);
        _addDiyBoundary(map).then((bounds) => {
            if (bounds?.isValid?.()) {
                map.fitBounds(bounds, { padding: [28, 28] });
                if (map.getZoom() > 11) map.setZoom(11);
                return;
            }
            try {
                const markerBounds = group.getBounds();
                if (markerBounds.isValid()) map.fitBounds(markerBounds, { padding: [42, 42], maxZoom: 12 });
            } catch (_) {}
        });
    });
}

export function hideSpaMap() {
    const page = document.getElementById('spa-map-page');
    if (page) page.classList.add('hidden');

    if (_spaMap) {
        try { _spaMap.remove(); } catch (_) {}
        _spaMap = null;
        _activeBasemap = null;
        _activeMapContext = null;
    }
    const container = document.getElementById('spa-map-container');
    if (container) container.innerHTML = '';

    if (_prevPageId) {
        const prev = document.getElementById(_prevPageId);
        if (prev) prev.classList.remove('hidden');
        _prevPageId = null;
    }
}

function _setupSpaMapPage(title) {
    document.querySelectorAll('.spa-page:not(#spa-map-page)').forEach(p => {
        if (!p.classList.contains('hidden')) {
            _prevPageId = _prevPageId || p.id;
            p.classList.add('hidden');
        }
    });
    document.getElementById('sidebar')?.classList.add('hidden');
    document.getElementById('map-top-left-chrome')?.classList.add('hidden');
    document.getElementById('map-right-stack')?.classList.add('hidden');
    document.getElementById('kab-risk-info-panel')?.classList.add('hidden');
    document.getElementById('risk-legend')?.classList.add('hidden');

    const titleEl = document.getElementById('spa-map-title');
    if (titleEl) titleEl.textContent = title;

    document.getElementById('spa-map-page')?.classList.remove('hidden');

    const backBtn = document.getElementById('spa-map-back');
    if (backBtn) {
        const newBtn = backBtn.cloneNode(true);
        backBtn.parentNode.replaceChild(newBtn, backBtn);
        newBtn.addEventListener('click', () => {
            const restoreMapChrome = !_prevPageId || _prevPageId === 'map';
            hideSpaMap();
            if (restoreMapChrome) {
                document.getElementById('sidebar')?.classList.remove('hidden');
                document.getElementById('map-top-left-chrome')?.classList.remove('hidden');
                document.getElementById('map-right-stack')?.classList.remove('hidden');
                document.getElementById('kab-risk-info-panel')?.classList.remove('hidden');
                document.getElementById('risk-legend')?.classList.remove('hidden');
            }
        });
    }
}

function _initSpaMap(callback) {
    if (_spaMap) {
        try { _spaMap.remove(); } catch (_) {}
        _spaMap = null;
        _activeBasemap = null;
    }
    const container = document.getElementById('spa-map-container');
    if (!container || typeof L === 'undefined') return;
    container.innerHTML = '';

    const mapDiv = document.createElement('div');
    mapDiv.style.cssText = 'width:100%;height:100%;';
    container.appendChild(mapDiv);
    _renderBasemapControl(container);

    _spaMap = L.map(mapDiv, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: true,
        minZoom: 8
    }).setView(CONFIG.center, CONFIG.zoom);

    _switchSpaBasemap('dark');
    clearSpaMapLayers();

    requestAnimationFrame(() => {
        setTimeout(() => {
            try { _spaMap?.invalidateSize(); } catch (_) {}
            callback(_spaMap);
        }, 150);
    });
}

function clearSpaMapLayers() {
    if (!_spaMap) return;
    _spaMap.eachLayer((layer) => {
        if (layer !== _activeBasemap) {
            try { _spaMap.removeLayer(layer); } catch (_) {}
        }
    });
}

function _renderBasemapControl(container) {
    const controls = document.createElement('div');
    controls.id = 'spa-map-controls';
    controls.className = 'tw-absolute tw-right-5 tw-top-5 tw-z-[650] tw-flex tw-items-center tw-gap-1.5 tw-rounded-[14px] tw-border tw-border-amber-500/45 tw-bg-slate-900/95 tw-p-[3px] tw-shadow-xl tw-shadow-black/35 tw-backdrop-blur-md';
    controls.innerHTML = `
        <button type="button" class="spa-bm-btn active" data-bm="dark">Peta</button>
        <button type="button" class="spa-bm-btn" data-bm="satellite">Satelit</button>
        <button type="button" class="spa-bm-btn" data-bm="terrain">Terrain</button>
        <span class="tw-h-5 tw-w-px tw-bg-amber-500/25 tw-mx-0.5" aria-hidden="true"></span>
        <button type="button" class="spa-zoom-btn" data-zoom="in" title="Perbesar">+</button>
        <button type="button" class="spa-zoom-btn" data-zoom="out" title="Perkecil">-</button>
    `;
    controls.querySelectorAll('[data-bm]').forEach(btn => {
        btn.addEventListener('click', () => {
            controls.querySelectorAll('[data-bm]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            _switchSpaBasemap(btn.dataset.bm);
        });
    });
    controls.querySelector('[data-zoom="in"]')?.addEventListener('click', () => _spaMap?.zoomIn());
    controls.querySelector('[data-zoom="out"]')?.addEventListener('click', () => _spaMap?.zoomOut());
    container.appendChild(controls);
}

function _renderCategoryInfoPanel(catLabel, count, catColor) {
    const container = document.getElementById('spa-map-container');
    if (!container) return;
    container.querySelector('#spa-map-info-panel')?.remove();
    const panel = document.createElement('div');
    panel.id = 'spa-map-info-panel';
    panel.className = 'tw-absolute tw-left-5 tw-bottom-5 tw-z-[650] tw-w-[240px] tw-rounded-2xl tw-border tw-border-amber-500/25 tw-bg-slate-950/85 tw-p-4 tw-shadow-xl tw-shadow-black/35 tw-backdrop-blur-md';
    panel.innerHTML = `
        <div class="tw-text-[10px] tw-font-semibold tw-uppercase tw-tracking-[0.18em] tw-text-slate-500">Kategori Peta</div>
        <div class="tw-mt-1 tw-font-display tw-text-xl tw-font-extrabold tw-text-slate-100">${_esc(catLabel)}</div>
        <div class="tw-mt-3 tw-grid tw-grid-cols-2 tw-gap-2">
            <div class="tw-rounded-xl tw-bg-slate-800/70 tw-p-3">
                <div class="tw-font-mono tw-text-2xl tw-font-bold tw-text-amber-400">${count}</div>
                <div class="tw-text-[10px] tw-uppercase tw-tracking-wider tw-text-slate-500">Marker</div>
            </div>
            <div class="tw-rounded-xl tw-bg-slate-800/70 tw-p-3">
                <div class="tw-flex tw-h-7 tw-items-center tw-gap-2">
                    <span class="tw-h-3 tw-w-3 tw-rounded-full tw-border tw-border-white/70" style="background:${catColor}"></span>
                    <span class="tw-text-xs tw-font-semibold tw-text-slate-200">Legenda</span>
                </div>
                <div class="tw-text-[10px] tw-text-slate-500">Warna marker</div>
            </div>
        </div>
    `;
    container.appendChild(panel);
}

function _switchSpaBasemap(key) {
    if (!_spaMap || !TILESETS[key]) return;
    if (_activeBasemap) _spaMap.removeLayer(_activeBasemap);
    _activeBasemap = L.tileLayer(TILESETS[key].url, TILESETS[key].options);
    _activeBasemap.addTo(_spaMap);
    _activeBasemap.bringToBack();
}

async function _addDiyBoundary(map) {
    try {
        const res = await fetch('data/yogyakarta_boundary.geojson');
        if (!res.ok) return null;
        const geojson = await res.json();
        const layer = L.geoJSON(geojson, {
            style: {
                color: '#d4a017',
                weight: 1.5,
                opacity: 0.6,
                fillOpacity: 0,
                fill: false,
                interactive: false
            }
        }).addTo(map);
        layer.bringToFront();
        return layer.getBounds();
    } catch (err) {
        console.warn('Batas DIY gagal dimuat:', err);
        return null;
    }
}

function _richPopupHtml(feature, catKey, catLabel, catColor, popupId) {
    const props = feature.properties || {};
    const name = props.name || props.nama || 'Lokasi';
    const sub = props.subcategory || props.type || catLabel;
    const rating = _ratingFor(name);
    const imgSeed = encodeURIComponent(`${name}-yogyakarta-indonesia`.toLowerCase().replace(/\s+/g, '-'));
    const img = props.foto || props.image || `https://picsum.photos/seed/${imgSeed}/360/220`;
    return `
        <div class="tw-w-[250px] tw-overflow-hidden tw-rounded-2xl tw-border tw-border-amber-500/25 tw-bg-slate-950 tw-text-slate-100 tw-shadow-2xl tw-shadow-black/40">
            <img src="${_escAttr(img)}" alt="${_escAttr(name)}" class="tw-h-28 tw-w-full tw-object-cover" loading="lazy" onerror="this.src='https://picsum.photos/seed/yogyakarta/360/220';">
            <div class="tw-p-3">
                <span class="tw-inline-flex tw-rounded-full tw-border tw-border-amber-400/30 tw-bg-amber-400/10 tw-px-2 tw-py-0.5 tw-text-[10px] tw-font-bold tw-text-amber-300">${_esc(sub)}</span>
                <div class="tw-mt-2 tw-font-display tw-text-lg tw-font-extrabold tw-leading-tight">${_esc(name)}</div>
                <div class="tw-mt-2 tw-flex tw-items-center tw-gap-2">
                    <span class="tw-text-xs tw-tracking-[0.12em] tw-text-amber-400">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                    <span class="tw-font-mono tw-text-[11px] tw-text-slate-500">${rating}</span>
                </div>
                <button type="button" id="${popupId}" class="tw-mt-3 tw-w-full tw-rounded-xl tw-border tw-px-3 tw-py-2 tw-text-xs tw-font-bold tw-transition-colors hover:tw-bg-amber-500/10" style="border-color:${catColor}66;color:${catColor}">
                    Lihat Detail
                </button>
            </div>
        </div>
    `;
}

function _openDetailFromMap(feature, catKey) {
    const [lng, lat] = feature.geometry?.coordinates || [110.3695, -7.7956];
    const props = feature.properties || {};
    const name = props.name || props.nama || 'Lokasi';
    const id = _stableTataKotaId(catKey, name, lng, lat);
    try {
        sessionStorage.setItem(`tatakotaDetail:${id}`, JSON.stringify({
            cat: catKey,
            feature: JSON.parse(JSON.stringify(feature))
        }));
    } catch (err) {
        console.warn('Gagal menyimpan detail lokasi:', err);
    }
    hideSpaMap();
    const page = document.getElementById('tatakota-page');
    if (page) page.classList.remove('hidden');
    const hash = `#tatakota/detail/${encodeURIComponent(id)}`;
    if (location.hash !== hash) history.pushState(null, '', hash);
    import('./tatakota.js').then(({ initTataKotaPage }) => initTataKotaPage());
}

function _stableTataKotaId(cat, name, lng, lat) {
    const s = `${cat}|${name}|${lng}|${lat}`;
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return `tk${h.toString(36)}`;
}

function _ratingFor(name) {
    let h = 0;
    for (let i = 0; i < String(name).length; i++) h = (h * 31 + String(name).charCodeAt(i)) >>> 0;
    return (4.1 + ((h % 8) / 10)).toFixed(1);
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

function _esc(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function _escAttr(s) {
    return _esc(s).replace(/'/g, '&#39;');
}
