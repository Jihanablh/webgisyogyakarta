import { State, CATEGORIES } from './state.js';
import { loadLayer, showLayer, hideLayer } from './layers.js';
import { escapeHtml } from './utils/helpers.js';

let _map = null;

// ── Disaster layer definitions (subcats sesuai GeoJSON aktual) ────────────────
const DISASTER_LAYERS = [
    { id: 'erupsi',     label: 'Erupsi Merapi',    subcats: ['Risiko Erupsi Merapi'], color: '#ef4444' },
    { id: 'banjir',     label: 'Rawan Banjir',      subcats: ['Rawan Banjir'],         color: '#3b82f6' },
    { id: 'gempa',      label: 'Rawan Gempa',        subcats: ['Rawan Gempa'],          color: '#f97316' },
    { id: 'longsor',    label: 'Rawan Longsor',      subcats: ['Rawan Longsor'],        color: '#92400e' },
    { id: 'kekeringan', label: 'Rawan Kekeringan',   subcats: ['Rawan Kekeringan'],     color: '#ca8a04' },
    { id: 'evakuasi',   label: 'Jalur Evakuasi',     subcats: ['Risiko Erupsi Merapi'], color: '#22c55e' },
    { id: 'pengungsian',label: 'Titik Pengungsian',  subcats: ['Risiko Erupsi Merapi'], color: '#06b6d4' },
];

// Toggle state per layer id — semua aktif by default
const _layerToggles = Object.fromEntries(DISASTER_LAYERS.map(l => [l.id, true]));

// ── Tata Kota category definitions ─────────────────────────────────────────────
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

// ── Mode switching ─────────────────────────────────────────────────────────────
export function setSidebarMode(mode) {
    _sidebarMode = mode;
    if (mode === 'kebencanaan') renderKebencanaaanPanel();
    else renderTataKotaPanel();
}

// ── Kebencanaan panel — Tailwind dark glass toggle switches ────────────────────
function renderKebencanaaanPanel() {
    const panel = document.getElementById('sidebar-mode-panel');
    if (!panel) return;

    panel.innerHTML = `
    <div class="tw-px-1 tw-py-1">
        <div class="tw-text-[9px] tw-font-bold tw-uppercase tw-tracking-[0.14em] tw-text-slate-500 tw-mb-3 tw-px-1">Layer Aktif</div>
        <div id="disaster-layer-list" class="tw-flex tw-flex-col tw-gap-0.5">
            ${DISASTER_LAYERS.map(layer => _renderLayerItem(layer)).join('')}
        </div>
    </div>`;

    // Wire toggle switches
    panel.querySelectorAll('.disaster-toggle-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const id = e.target.dataset.layerId;
            _layerToggles[id] = e.target.checked;
            _applyLayerToggles();
        });
    });
}

function _renderLayerItem(layer) {
    const on = _layerToggles[layer.id];
    return `
    <div class="tw-flex tw-items-center tw-gap-3 tw-px-2 tw-py-2.5 tw-rounded-lg tw-transition-all tw-duration-200 hover:tw-bg-white/5">
        <div class="tw-w-2 tw-h-2 tw-rounded-full tw-flex-shrink-0 tw-ring-1 tw-ring-white/20"
             style="background:${layer.color};${on ? `box-shadow:0 0 6px ${layer.color}88` : 'opacity:0.4'}"></div>
        <span class="tw-flex-1 tw-text-[12px] tw-font-medium ${on ? 'tw-text-slate-200' : 'tw-text-slate-500'} tw-font-[Inter,sans-serif] tw-transition-colors">
            ${layer.label}
        </span>
        <label class="layer-toggle tw-cursor-pointer">
            <input type="checkbox" class="disaster-toggle-input" data-layer-id="${layer.id}" ${on ? 'checked' : ''}>
            <span class="layer-toggle-track"></span>
        </label>
    </div>`;
}

function _applyLayerToggles() {
    import('./layers.js').then(({ showKebencanaanZona, showKebencanaanPengungsian }) => {
        // Re-render to update visual states
        renderKebencanaaanPanel();
        // Check if pengungsian toggle is on
        const pengungsianOn = _layerToggles['pengungsian'];
        const zonaOn = DISASTER_LAYERS.some(l => l.id !== 'pengungsian' && _layerToggles[l.id]);
        if (pengungsianOn) showKebencanaanPengungsian();
        else if (zonaOn) showKebencanaanZona();
    });
}

// ── Tata Kota panel ────────────────────────────────────────────────────────────
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

export function hideTataKotaLayers() {
    TATAKOTA_BUTTONS.forEach(btnDef => hideLayer(btnDef.key));
    _activeTataKotaKey = null;
}

// ── Stats ──────────────────────────────────────────────────────────────────────
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
    if (grid && total > 0) {
        grid.innerHTML = `
            <div class="stat-card"><div class="stat-number">${total.toLocaleString()}</div><div class="stat-label">Lokasi</div></div>
            <div class="stat-card"><div class="stat-number">${cats}</div><div class="stat-label">Kategori</div></div>
            <div class="stat-card"><div class="stat-number">${subcats}</div><div class="stat-label">Sub-Kat</div></div>`;
    }
}

// ── Search ─────────────────────────────────────────────────────────────────────
function buildSearchIndex() {
    State.searchIndex = [];
    for (const [key, data] of Object.entries(State.categoryData)) {
        if (!data?.features) continue;
        data.features.forEach(f => State.searchIndex.push({ ...f, _categoryKey: key }));
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

// ── Recent Events Widget ───────────────────────────────────────────────────────
function renderRecentEventsWidget() {
    const list   = document.getElementById('rew-list');
    const widget = document.getElementById('recent-events-widget');
    if (!list) return;
    const events = [
        { title: 'Aktivitas Merapi',    status: 'Siaga (Level III)', statusClass: 'status-danger',   time: '3 jam lalu' },
        { title: 'Banjir Bantul',       status: 'Waspada',           statusClass: 'status-warning',  time: '2 hari lalu' },
        { title: 'Kualitas Udara Kota', status: 'Sedang (AQI 65)',   statusClass: 'status-moderate', time: '1 jam lalu' },
    ];
    list.innerHTML = events.map(e => `
        <div class="rew-item">
            <div class="rew-info">
                <div class="rew-event-title">${e.title}</div>
                <span class="rew-badge ${e.statusClass}">${e.status}</span>
                <div class="rew-time">Terakhir: ${e.time}</div>
            </div>
        </div>`).join('');
    if (widget) widget.style.display = 'block';
}
