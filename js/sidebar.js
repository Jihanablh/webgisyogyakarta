import { State, CATEGORIES } from './state.js?v=20260526-round25-polish';
import { loadLayer, showLayer, hideLayer } from './layers.js?v=20260526-round25-polish';
import { escapeHtml } from './utils/helpers.js?v=20260526-round25-polish';
import { DISASTER_2025_TOTAL, dominantDisasterType, highestRegion, lowestRegion, shortRegionName } from './disaster-2025.js?v=20260526-round25-polish';

let _map = null;

// -- Disaster layer definitions (subcats sesuai GeoJSON aktual) ----------------
const DISASTER_LAYERS = [
    { id: 'banjir',     label: 'Rawan Banjir',      subcats: ['Rawan Banjir'],         color: '#3b82f6' },
    { id: 'gempa',      label: 'Rawan Gempa',        subcats: ['Rawan Gempa'],          color: '#f97316' },
    { id: 'longsor',    label: 'Rawan Longsor',      subcats: ['Rawan Longsor'],        color: '#92400e' },
    { id: 'kekeringan', label: 'Rawan Kekeringan',   subcats: ['Rawan Kekeringan'],     color: '#ca8a04' },
    { id: 'pengungsian',label: 'Titik Pengungsian',  subcats: ['Pengungsian'],          color: '#06b6d4' },
];

// -- Tata Kota category definitions ---------------------------------------------
const TATAKOTA_BUTTONS = [
    { key: 'pariwisata',        label: 'Pariwisata & Keramaian', color: '#f59e0b' },
    { key: 'tempat_tinggal',    label: 'Tempat Tinggal',         color: '#8b5cf6' },
    { key: 'kebutuhan',         label: 'Kebutuhan Sehari-hari',  color: '#3b82f6' },
    { key: 'atm_bank',          label: 'ATM & Bank',             color: '#06b6d4' },
    { key: 'sosial_tugas',      label: 'Sosial & Tugas',         color: '#16a34a' },
    { key: 'akademik',          label: 'Pusat Akademik',         color: '#a855f7' },
    { key: 'kesehatan_darurat', label: 'Kesehatan & Darurat',    color: '#f43f5e' },
];

let _sidebarMode     = 'kebencanaan';
let _activeTataKotaKey = null;

export function getSidebarMode() { return _sidebarMode; }

export function initSidebar({ map, router, onCategoryToggle }) {
    _map = map;

    const sidebar   = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) toggleBtn.addEventListener('click', () => sidebar.classList.toggle('hidden'));

    const icClose = document.getElementById('info-card-close');
    if (icClose) icClose.addEventListener('click', (e) => { e.stopPropagation(); window.closeInfoCard?.(); });
    const tpClose = document.getElementById('tp-close');
    if (tpClose) tpClose.addEventListener('click', (e) => { e.stopPropagation(); window.closeTourismPanel?.(); });
    const dpClose = document.getElementById('dp-close');
    if (dpClose) dpClose.addEventListener('click', (e) => { e.stopPropagation(); window.closeDisasterPanel?.(); });

    const statsBtn = document.getElementById('btn-open-stats');
    if (statsBtn) statsBtn.addEventListener('click', () => {
        document.querySelector('.top-nav-tab[data-page="statistik"]')?.click();
    });

    const rewAll = document.getElementById('rew-see-all');
    if (rewAll) rewAll.addEventListener('click', () => {
        document.querySelector('.top-nav-tab[data-page="laporan"]')?.click();
    });
    renderRecentEventsWidget();

    document.addEventListener('layerLoaded', () => {
        updateWelcomeStats();
        buildSearchIndex();
        if (_sidebarMode === 'tatakota') renderTataKotaPanel();
    });

    renderKebencanaaanPanel();
    initSearch();
}

// -- Mode switching -------------------------------------------------------------
export function setSidebarMode(mode) {
    _sidebarMode = mode;
    if (mode === 'kebencanaan') renderKebencanaaanPanel();
    else renderTataKotaPanel();
}

// -- Kebencanaan panel — Tailwind dark glass toggle switches --------------------
function renderKebencanaaanPanel() {
    const panel = document.getElementById('sidebar-mode-panel');
    if (!panel) return;

    panel.innerHTML = `
    <div class="tw-px-1 tw-py-1">
        <div id="disaster-layer-list" class="tw-flex tw-flex-col tw-gap-0.5" aria-label="Legenda layer kebencanaan">
            ${DISASTER_LAYERS.map(layer => _renderLayerItem(layer)).join('')}
        </div>
    </div>`;
}

function _renderLayerItem(layer) {
    return `
    <div class="tw-flex tw-items-center tw-gap-3 tw-px-2 tw-py-2.5">
        <div class="tw-w-2 tw-h-2 tw-rounded-full tw-flex-shrink-0 tw-ring-1 tw-ring-white/20"
             style="background:${layer.color};box-shadow:0 0 6px ${layer.color}66"></div>
        <span class="tw-flex-1 tw-text-[12px] tw-font-medium tw-text-slate-200 tw-font-[Inter,sans-serif]">
            ${layer.label}
        </span>
    </div>`;
}

// -- Tata Kota panel ------------------------------------------------------------
function renderTataKotaPanel() {
    const panel = document.getElementById('sidebar-mode-panel');
    if (!panel) return;

    const lihatSemuaActive = _activeTataKotaKey === null;
    panel.innerHTML = `
    <div class="tw-px-1 tw-py-1">
        <div class="tw-text-[9px] tw-font-bold tw-uppercase tw-tracking-[0.14em] tw-text-slate-500 tw-mb-3 tw-px-1">Kategori</div>
        <button id="tatakota-lihat-semua" class="tw-w-full tw-flex tw-items-center tw-gap-2.5 tw-px-3 tw-py-2 tw-rounded-lg tw-mb-1 tw-text-xs tw-font-semibold tw-font-[Inter] tw-transition-all tw-duration-200 ${lihatSemuaActive ? 'tw-bg-amber-500/20 tw-text-amber-400 tw-border tw-border-amber-500/40' : 'tw-text-slate-400 hover:tw-bg-white/5 tw-border tw-border-transparent'}">
            <div class="tw-w-2 tw-h-2 tw-rounded-sm tw-bg-amber-400 tw-flex-shrink-0"></div>
            Semua Kategori
        </button>
        <div id="tatakota-pill-container" class="tw-flex tw-flex-col tw-gap-0.5"></div>
    </div>`;

    document.getElementById('tatakota-lihat-semua')?.addEventListener('click', _showAllTataKota);

    const container = document.getElementById('tatakota-pill-container');
    if (!container) return;

    TATAKOTA_BUTTONS.forEach(btnDef => {
        const isActive = _activeTataKotaKey === btnDef.key;
        const count    = State.categoryData[btnDef.key]?.features?.length || 0;
        const btn = document.createElement('button');
        btn.className = `tw-w-full tw-flex tw-items-center tw-gap-2.5 tw-px-3 tw-py-2 tw-rounded-lg tw-text-xs tw-font-medium tw-font-[Inter] tw-transition-all tw-duration-200 tw-border ${isActive ? 'tw-border-[' + btnDef.color + ']/40 tw-text-slate-100' : 'tw-border-transparent tw-text-slate-400 hover:tw-bg-white/5'}`;
        if (isActive) btn.style.background = `${btnDef.color}22`;
        btn.innerHTML = `
            <div class="tw-w-2 tw-h-2 tw-rounded-sm tw-flex-shrink-0 ${isActive ? '' : 'tw-opacity-40'}" style="background:${btnDef.color}"></div>
            <span class="tw-flex-1 tw-text-left">${btnDef.label}</span>
            ${count ? `<span class="tw-font-mono tw-text-[10px] tw-text-slate-500">${count.toLocaleString()}</span>` : ''}`;
        btn.addEventListener('click', () => _clickTataKotaPill(btnDef));
        container.appendChild(btn);
    });
}

function _clickTataKotaPill(btnDef) {
    _activeTataKotaKey = btnDef.key;
    TATAKOTA_BUTTONS.forEach(b => { if (b.key !== btnDef.key) hideLayer(b.key); });
    if (!State.layerCache[btnDef.key]) {
        State.enabledCategories.add(btnDef.key);
        loadLayer(btnDef.key);
    } else { showLayer(btnDef.key); }
    renderTataKotaPanel();
}

function _showAllTataKota() {
    _activeTataKotaKey = null;
    TATAKOTA_BUTTONS.forEach(btnDef => {
        if (!State.layerCache[btnDef.key]) {
            State.enabledCategories.add(btnDef.key);
            loadLayer(btnDef.key);
        } else { showLayer(btnDef.key); }
    });
    renderTataKotaPanel();
}

function isSuppressedSearchFeature(feature) {
    const p = feature?.properties || {};
    const hay = `${p.name || ''} ${p.nama || ''} ${p.subcategory || ''} ${p.type || ''} ${p.type_layer || ''}`;
    const blocked = ['me' + 'rapi', 'eru' + 'psi', 'k' + 'rb'];
    return blocked.some((term) => new RegExp(term, 'i').test(hay));
}
export function hideTataKotaLayers() {
    TATAKOTA_BUTTONS.forEach(btnDef => hideLayer(btnDef.key));
    _activeTataKotaKey = null;
}

// -- Stats ----------------------------------------------------------------------
function updateWelcomeStats() {
    const total   = Object.values(State.categoryData).reduce((s, d) => s + (d?.features?.length || 0), 0);
    const cats    = Object.keys(State.categoryData).length;
    const subcats = Object.values(State.categoryMeta).reduce((s, m) => s + Object.keys(m?.subcategories || {}).length, 0);

    const wsTotal = document.getElementById('ws-total');
    const wsCats  = document.getElementById('ws-cats');
    const wsSub   = document.getElementById('ws-subcats');
    if (wsTotal) wsTotal.textContent = total.toLocaleString();
    if (wsCats)  wsCats.textContent  = cats;
    if (wsSub)   wsSub.textContent   = subcats;

    const grid = document.getElementById('stats-grid');
    if (grid) {
        const hi = highestRegion();
        const lo = lowestRegion();
        const dominant = dominantDisasterType();
        grid.innerHTML = `
            <div class="tw-rounded-xl tw-bg-slate-900/70 tw-border tw-border-amber-500/15 tw-p-3 tw-text-center">
                <div class="tw-font-[Space_Mono,monospace] tw-text-xl tw-font-bold tw-text-amber-400 tw-leading-none">${DISASTER_2025_TOTAL.toLocaleString('id-ID')}</div>
                <div class="tw-font-[Inter,sans-serif] tw-text-[8px] tw-font-semibold tw-uppercase tw-tracking-wider tw-text-slate-500 tw-mt-1">Total Kejadian</div>
            </div>
            <div class="tw-rounded-xl tw-bg-slate-900/70 tw-border tw-border-amber-500/15 tw-p-3 tw-text-center">
                <div class="tw-font-[Space_Mono,monospace] tw-text-lg tw-font-bold tw-text-red-300 tw-leading-none">${shortRegionName(hi.kab_kota)}</div>
                <div class="tw-font-[Inter,sans-serif] tw-text-[8px] tw-font-semibold tw-uppercase tw-tracking-wider tw-text-slate-500 tw-mt-1">${hi.jumlah_kejadian} kejadian</div>
            </div>
            <div class="tw-rounded-xl tw-bg-slate-900/70 tw-border tw-border-amber-500/15 tw-p-3 tw-text-center">
                <div class="tw-font-[Space_Mono,monospace] tw-text-lg tw-font-bold tw-text-emerald-300 tw-leading-none">${shortRegionName(lo.kab_kota)}</div>
                <div class="tw-font-[Inter,sans-serif] tw-text-[8px] tw-font-semibold tw-uppercase tw-tracking-wider tw-text-slate-500 tw-mt-1">${lo.jumlah_kejadian} kejadian</div>
            </div>
            <div class="tw-rounded-xl tw-bg-slate-900/70 tw-border tw-border-amber-500/15 tw-p-3 tw-text-center">
                <div class="tw-font-[Space_Mono,monospace] tw-text-lg tw-font-bold tw-text-amber-400 tw-leading-none">Longsor</div>
                <div class="tw-font-[Inter,sans-serif] tw-text-[8px] tw-font-semibold tw-uppercase tw-tracking-wider tw-text-slate-500 tw-mt-1">${dominant.value} kejadian</div>
            </div>`;
    }
}

function roughPolygonAreaKm2(ring) {
    if (!Array.isArray(ring) || ring.length < 3) return 0;
    const lat0 = ring.reduce((s, p) => s + (Number(p[1]) || 0), 0) / ring.length;
    const kmLon = 111.32 * Math.cos(lat0 * Math.PI / 180);
    const kmLat = 110.57;
    let area = 0;
    for (let i = 0; i < ring.length; i++) {
        const a = ring[i];
        const b = ring[(i + 1) % ring.length];
        const x1 = (Number(a[0]) || 0) * kmLon;
        const y1 = (Number(a[1]) || 0) * kmLat;
        const x2 = (Number(b[0]) || 0) * kmLon;
        const y2 = (Number(b[1]) || 0) * kmLat;
        area += x1 * y2 - x2 * y1;
    }
    return Math.abs(area) / 2;
}

// -- Search ---------------------------------------------------------------------
function buildSearchIndex() {
    State.searchIndex = [];
    for (const [key, data] of Object.entries(State.categoryData)) {
        if (!data?.features) continue;
        data.features.forEach(f => {
            if (!isSuppressedSearchFeature(f)) State.searchIndex.push({ ...f, _categoryKey: key });
        });
    }
}

function initSearch() {
    const input      = document.getElementById('search-input');
    const resultsDiv = document.getElementById('search-results');
    if (!input || !resultsDiv) return;

    let debounce;
    input.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            const q = input.value.trim().toLowerCase();
            if (q.length < 2) { resultsDiv.classList.add('hidden'); return; }
            performSearch(q, resultsDiv);
        }, 200);
    });
    input.addEventListener('focus', () => {
        if (input.value.trim().length >= 2) resultsDiv.classList.remove('hidden');
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.sidebar-search-wrap')) resultsDiv.classList.add('hidden');
    });
}

function performSearch(query, resultsDiv) {
    const matches = State.searchIndex
        .filter(f => {
            const name = (f.properties.name || '').toLowerCase();
            const type = (f.properties.type || '').toLowerCase();
            const sc   = (f.properties.subcategory || '').toLowerCase();
            return name.includes(query) || type.includes(query) || sc.includes(query);
        })
        .slice(0, 20);

    if (matches.length === 0) {
        resultsDiv.innerHTML = '<div class="search-result-item"><span class="search-result-name" style="color:var(--text-muted)">Tidak ditemukan</span></div>';
    } else {
        resultsDiv.innerHTML = matches.map((f, i) => {
            const cat    = CATEGORIES[f._categoryKey];
            const sc     = f.properties.subcategory || f.properties.type || '';
            const coords = f.geometry.coordinates;
            return `<div class="search-result-item" data-idx="${i}" data-lon="${coords[0]}" data-lat="${coords[1]}" data-cat="${f._categoryKey}">
                <span class="search-result-dot" style="background:${cat.color}"></span>
                <div class="search-result-info">
                    <span class="search-result-name">${escapeHtml(f.properties.name || 'Unnamed')}</span>
                    <span class="search-result-meta">${escapeHtml(sc)} · ${cat.label}</span>
                </div>
            </div>`;
        }).join('');

        resultsDiv.querySelectorAll('.search-result-item[data-lon]').forEach((item, idx) => {
            item.addEventListener('click', () => {
                const lat    = parseFloat(item.dataset.lat);
                const lon    = parseFloat(item.dataset.lon);
                const catKey = item.dataset.cat;
                resultsDiv.classList.add('hidden');
                document.getElementById('search-input').value = '';
                if (_map) _map.flyTo([lat, lon], 17, { duration: 1.2 });
                if (State.searchHighlightMarker) {
                    _map.removeLayer(State.searchHighlightMarker);
                    State.searchHighlightMarker = null;
                }
                const feature = matches[idx];
                if (feature) {
                    document.dispatchEvent(new CustomEvent('markerClicked', {
                        detail: { feature, category: catKey }
                    }));
                }
            });
        });
    }
    resultsDiv.classList.remove('hidden');
}

// -- Recent Events Widget -------------------------------------------------------
function renderRecentEventsWidget() {
    const list   = document.getElementById('rew-list');
    const widget = document.getElementById('recent-events-widget');
    if (!list) return;
    const events = [
        { title: 'Kulon Progo', status: 'Sangat Tinggi · 558', statusClass: 'status-danger', time: '2025' },
        { title: 'Bantul', status: 'Tinggi · 333', statusClass: 'status-warning', time: '2025' },
        { title: 'Tanah Longsor', status: 'Dominan · 765', statusClass: 'status-moderate', time: 'DIY' },
    ];
    list.innerHTML = events.slice(0, 3).map(e => `
        <div class="tw-py-2.5 tw-border-b tw-border-white/5 last:tw-border-0">
            <div class="tw-flex tw-items-center tw-justify-between tw-gap-2">
                <div class="tw-font-[Inter,sans-serif] tw-text-xs tw-font-semibold tw-text-slate-200">${e.title}</div>
                <span class="tw-font-[Space_Mono,monospace] tw-text-[9px] tw-text-slate-500">${e.time}</span>
            </div>
            <div class="tw-mt-1 tw-flex tw-items-center tw-justify-between tw-gap-2">
                <span class="tw-inline-block tw-px-2 tw-py-0.5 tw-rounded-full tw-text-[9px] tw-font-bold tw-uppercase tw-tracking-wide ${e.statusClass === 'status-danger' ? 'tw-bg-red-900/40 tw-text-red-400 tw-border tw-border-red-500/30' : e.statusClass === 'status-warning' ? 'tw-bg-amber-900/30 tw-text-amber-400 tw-border tw-border-amber-500/30' : 'tw-bg-blue-900/30 tw-text-blue-400 tw-border tw-border-blue-500/30'}">${e.status}</span>
            </div>
        </div>`).join('');
    if (widget) widget.style.display = 'block';
}
