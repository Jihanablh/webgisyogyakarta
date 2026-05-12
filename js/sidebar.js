import { State, CATEGORIES } from './state.js';
import { loadLayer, showLayer, hideLayer, rebuildCategoryLayer } from './layers.js';
import { escapeHtml } from './utils/helpers.js';

let _map = null;

// ── Disaster subcategory definitions ───────────────────────────────────────────
const DISASTER_BUTTONS = [
    { label: 'Erupsi Merapi', subcats: ['Rawan Erupsi', 'Risiko Erupsi', 'KRB III', 'KRB II', 'KRB I'], color: '#ef4444' },
    { label: 'Rawan Banjir',  subcats: ['Rawan Banjir', 'Risiko Banjir', 'Daerah Banjir'],              color: '#3b82f6' },
    { label: 'Rawan Gempa',   subcats: ['Rawan Gempa', 'Risiko Gempa', 'Zona Gempa'],                   color: '#f97316' },
    { label: 'Rawan Longsor', subcats: ['Rawan Longsor', 'Risiko Longsor', 'Zona Longsor'],              color: '#92400e' },
    { label: 'Rawan Kekeringan', subcats: ['Rawan Kekeringan', 'Kekeringan'],                           color: '#ca8a04' },
    { label: 'Jalur Evakuasi', subcats: ['Jalur Evakuasi'],                                             color: '#22c55e' },
    { label: 'Titik Kumpul',  subcats: ['Titik Kumpul', 'Pengungsian'],                                 color: '#06b6d4' },
];

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

let _sidebarMode = 'kebencanaan'; // 'kebencanaan' | 'tatakota'

// Exclusive active state: null = "Lihat Semua" (all shown)
let _activeDisasterLabel = null; // null → all disaster layers shown
let _activeTataKotaKey   = null; // null → all tatakota layers shown

export function getSidebarMode() { return _sidebarMode; }

export function initSidebar({ map, router, onCategoryToggle }) {
    _map = map;

    const sidebar   = document.getElementById('sidebar');
    const closeBtn  = document.getElementById('sidebar-toggle-close');
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) toggleBtn.addEventListener('click', () => sidebar.classList.remove('open'));
    if (closeBtn)  closeBtn.addEventListener('click',  () => sidebar.classList.remove('open'));

    // Panel close buttons
    const icClose = document.getElementById('info-card-close');
    if (icClose) icClose.addEventListener('click', (e) => { e.stopPropagation(); window.closeInfoCard?.(); });
    const tpClose = document.getElementById('tp-close');
    if (tpClose) tpClose.addEventListener('click', (e) => { e.stopPropagation(); window.closeTourismPanel?.(); });
    const dpClose = document.getElementById('dp-close');
    if (dpClose) dpClose.addEventListener('click', (e) => { e.stopPropagation(); window.closeDisasterPanel?.(); });

    // Stats page link
    const statsBtn = document.getElementById('btn-open-stats');
    if (statsBtn) statsBtn.addEventListener('click', () => {
        document.querySelector('.top-nav-tab[data-page="statistik"]')?.click();
    });

    // Recent events
    const rewAll = document.getElementById('rew-see-all');
    if (rewAll) rewAll.addEventListener('click', () => {
        document.querySelector('.top-nav-tab[data-page="laporan"]')?.click();
    });
    renderRecentEventsWidget();

    // Update counts when layers load
    document.addEventListener('layerLoaded', () => {
        updateWelcomeStats();
        buildSearchIndex();
        if (_sidebarMode === 'tatakota') renderTataKotaPanel();
    });

    // Initial render
    renderKebencanaaanPanel();
    initSearch();
}

// ── Mode switching ─────────────────────────────────────────────────────────────
export function setSidebarMode(mode) {
    _sidebarMode = mode;
    if (mode === 'kebencanaan') {
        renderKebencanaaanPanel();
    } else {
        renderTataKotaPanel();
    }
}

// ── Kebencanaan panel ──────────────────────────────────────────────────────────
function renderKebencanaaanPanel() {
    const panel = document.getElementById('sidebar-mode-panel');
    if (!panel) return;

    const lihatSemuaActive = _activeDisasterLabel === null;

    panel.innerHTML = `
    <div style="padding:16px 20px 8px;">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:#4b5568;margin-bottom:10px;">
            Kebencanaan
        </div>
        <button id="disaster-lihat-semua"
            style="${_lihatSemuaStyle(lihatSemuaActive, '#dc2626')}">
            🗺️ Lihat Semua
        </button>
        <div id="disaster-pill-container" style="display:flex;flex-direction:column;gap:6px;margin-top:6px;"></div>
    </div>`;

    document.getElementById('disaster-lihat-semua').addEventListener('click', _showAllDisaster);

    const container = document.getElementById('disaster-pill-container');
    if (!container) return;

    DISASTER_BUTTONS.forEach(btn => {
        const isActive = _activeDisasterLabel === btn.label;
        const pill = document.createElement('button');
        pill.className = 'disaster-pill';
        pill.dataset.label = btn.label;
        _applyExclusivePillStyle(pill, btn.color, isActive);
        pill.innerHTML = `
            <span style="width:8px;height:8px;border-radius:50%;background:${btn.color};flex-shrink:0;
                ${isActive ? `box-shadow:0 0 8px ${btn.color};` : 'opacity:0.45;'}"></span>
            <span style="flex:1;text-align:left;font-size:13px;font-weight:600;">${btn.label}</span>
            ${isActive ? `<span style="font-size:10px;background:${btn.color}33;color:${btn.color};padding:2px 7px;border-radius:10px;font-weight:700;">Aktif</span>` : ''}
        `;
        pill.addEventListener('click', () => _clickDisasterPill(btn));
        container.appendChild(pill);
    });
}

function _clickDisasterPill(btnDef) {
    // Exclusive: activate only this layer, hide all others
    _activeDisasterLabel = btnDef.label;

    // Set subcats to ONLY this button's subcats
    State.activeSubcats['kebencanaan'] = new Set(btnDef.subcats);
    State.enabledCategories.add('kebencanaan');

    rebuildCategoryLayer('kebencanaan');
    renderKebencanaaanPanel();
}

function _showAllDisaster() {
    _activeDisasterLabel = null; // "Lihat Semua"

    // Collect ALL subcats from all disaster buttons
    const allSubcats = new Set();
    DISASTER_BUTTONS.forEach(b => b.subcats.forEach(sc => allSubcats.add(sc)));
    State.activeSubcats['kebencanaan'] = allSubcats;
    State.enabledCategories.add('kebencanaan');

    rebuildCategoryLayer('kebencanaan');
    renderKebencanaaanPanel();
}

// ── Tata Kota panel ────────────────────────────────────────────────────────────
function renderTataKotaPanel() {
    const panel = document.getElementById('sidebar-mode-panel');
    if (!panel) return;

    const lihatSemuaActive = _activeTataKotaKey === null;

    panel.innerHTML = `
    <div style="padding:16px 20px 8px;">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:#4b5568;margin-bottom:10px;">
            Tata Kota
        </div>
        <button id="tatakota-lihat-semua"
            style="${_lihatSemuaStyle(lihatSemuaActive, '#f59e0b')}">
            🗺️ Lihat Semua
        </button>
        <div id="tatakota-pill-container" style="display:flex;flex-direction:column;gap:6px;margin-top:6px;"></div>
    </div>`;

    document.getElementById('tatakota-lihat-semua').addEventListener('click', _showAllTataKota);

    const container = document.getElementById('tatakota-pill-container');
    if (!container) return;

    TATAKOTA_BUTTONS.forEach(btnDef => {
        const isActive = _activeTataKotaKey === btnDef.key;
        const count    = State.categoryData[btnDef.key]?.features?.length || 0;
        const pill = document.createElement('button');
        pill.className = 'tatakota-pill';
        pill.dataset.key = btnDef.key;
        _applyExclusivePillStyle(pill, btnDef.color, isActive);
        pill.innerHTML = `
            <span style="width:8px;height:8px;border-radius:50%;background:${btnDef.color};flex-shrink:0;
                ${isActive ? `box-shadow:0 0 8px ${btnDef.color};` : 'opacity:0.45;'}"></span>
            <span style="flex:1;text-align:left;font-size:13px;font-weight:600;">${btnDef.label}</span>
            ${count ? `<span style="font-size:10px;color:#4b5568;font-weight:600;">${count.toLocaleString()}</span>` : ''}
        `;
        pill.addEventListener('click', () => _clickTataKotaPill(btnDef));
        container.appendChild(pill);
    });
}

function _clickTataKotaPill(btnDef) {
    // Exclusive: hide all other tatakota layers, show only this one
    _activeTataKotaKey = btnDef.key;

    TATAKOTA_BUTTONS.forEach(b => {
        if (b.key !== btnDef.key) {
            hideLayer(b.key);
        }
    });

    // Load or show this layer
    if (!State.layerCache[btnDef.key]) {
        State.enabledCategories.add(btnDef.key);
        loadLayer(btnDef.key);
    } else {
        showLayer(btnDef.key);
    }

    renderTataKotaPanel();
}

function _showAllTataKota() {
    _activeTataKotaKey = null;

    TATAKOTA_BUTTONS.forEach(btnDef => {
        if (!State.layerCache[btnDef.key]) {
            State.enabledCategories.add(btnDef.key);
            loadLayer(btnDef.key);
        } else {
            showLayer(btnDef.key);
        }
    });

    renderTataKotaPanel();
}

// ── Hide all Tata Kota layers (called when leaving tatakota mode) ──────────────
export function hideTataKotaLayers() {
    TATAKOTA_BUTTONS.forEach(btnDef => {
        hideLayer(btnDef.key);
    });
    _activeTataKotaKey = null;
}

// ── Style helpers ──────────────────────────────────────────────────────────────
function _applyExclusivePillStyle(el, color, isActive) {
    el.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 10px 14px;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: var(--font-ui);
        background: ${isActive ? color : 'transparent'};
        border: 1px solid ${isActive ? color : color + '55'};
        color: ${isActive ? '#fff' : '#64748b'};
        ${isActive ? `box-shadow: 0 2px 12px ${color}55;` : ''}
    `;
}

function _lihatSemuaStyle(isActive, color) {
    return `
        display:flex;align-items:center;gap:8px;
        width:100%;padding:9px 14px;border-radius:10px;
        cursor:pointer;transition:all 0.2s ease;
        font-family:var(--font-ui);font-size:12px;font-weight:700;
        background:${isActive ? color + 'cc' : 'rgba(255,255,255,0.04)'};
        border:1px solid ${isActive ? color : 'rgba(255,255,255,0.1)'};
        color:${isActive ? '#fff' : '#94a3b8'};
        ${isActive ? `box-shadow:0 2px 12px ${color}44;` : ''}
        margin-bottom:2px;
    `;
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
        if (!e.target.closest('.search-container')) resultsDiv.classList.add('hidden');
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
