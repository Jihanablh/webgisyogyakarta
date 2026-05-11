import { State, CATEGORIES } from './state.js';
import { rebuildCategoryLayer, showOnlyKebencanaan, showAllLayers } from './layers.js';
import { escapeHtml } from './utils/helpers.js';

let _map = null;

export function initSidebar({ map, router, onCategoryToggle }) {
    _map = map;

    // --- Sidebar open/close ---
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const closeBtn  = document.getElementById('sidebar-toggle-close');
    if (toggleBtn) toggleBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    if (closeBtn)  closeBtn.addEventListener('click', () => sidebar.classList.remove('open'));

    // --- Panel close buttons ---
    const icClose = document.getElementById('info-card-close');
    if (icClose) icClose.addEventListener('click', (e) => { e.stopPropagation(); window.closeInfoCard?.(); });

    const tpClose = document.getElementById('tp-close');
    if (tpClose) tpClose.addEventListener('click', (e) => { e.stopPropagation(); window.closeTourismPanel?.(); });

    const dpClose = document.getElementById('dp-close');
    if (dpClose) dpClose.addEventListener('click', (e) => { e.stopPropagation(); window.closeDisasterPanel?.(); });

    // --- Stats page link ---
    const statsBtn = document.getElementById('btn-open-stats');
    if (statsBtn) statsBtn.addEventListener('click', () => {
        const tab = document.querySelector('.top-nav-tab[data-page="statistik"]');
        if (tab) tab.click();
    });

    // --- Recent events widget ---
    const rewAll = document.getElementById('rew-see-all');
    if (rewAll) rewAll.addEventListener('click', () => {
        const tab = document.querySelector('.top-nav-tab[data-page="laporan"]');
        if (tab) tab.click();
    });
    renderRecentEventsWidget();

    // --- Accordion (built after layers load) ---
    // Listen for each layer load to refresh the accordion
    document.addEventListener('layerLoaded', () => {
        renderAccordion();
        buildSearchIndex();
        updateWelcomeStats();
    });

    // --- Search ---
    initSearch();

    // --- "Show All / Hide Others" toggle button ---
    _insertToggleButton();
}

// ── Toggle All/Only Disaster ──────────────────────────────────────────────────
function _insertToggleButton() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    // Insert before sidebar-footer
    const footer = sidebar.querySelector('.sidebar-footer');
    const btn = document.createElement('button');
    btn.id = 'btn-toggle-layers';
    btn.className = 'layer-toggle-btn';
    btn.textContent = 'Tampilkan Semua Kategori';
    btn.addEventListener('click', () => {
        if (State.onlyKebencanaan) {
            showAllLayers();
            btn.textContent = 'Sembunyikan Kategori Lain';
            btn.classList.add('active');
        } else {
            showOnlyKebencanaan();
            btn.textContent = 'Tampilkan Semua Kategori';
            btn.classList.remove('active');
        }
    });
    if (footer) sidebar.insertBefore(btn, footer);
    else sidebar.appendChild(btn);
}

// ── Accordion ─────────────────────────────────────────────────────────────────
function renderAccordion() {
    let container = document.getElementById('accordion-container');
    if (!container) return;

    const html = Object.entries(CATEGORIES).map(([key, cat]) => {
        const data = State.categoryData[key];
        const count = data ? data.features.length : 0;
        const meta = State.categoryMeta[key];
        const subcats = meta ? meta.subcategories : {};

        const subcatHtml = Object.entries(subcats).map(([scName, scCount]) => {
            const isActive = State.activeSubcats[key] && State.activeSubcats[key].has(scName);
            const dotColor = (key === 'kebencanaan' || key === 'lingkungan')
                ? (State.categoryMeta[key]?.subcatColors?.[scName] || cat.color)
                : cat.color;
            return `
            <div class="subcat-item" data-category="${key}" data-subcat="${escapeHtml(scName)}">
                <div class="subcat-check ${isActive ? 'checked' : ''}" style="--check-color:${cat.color}"></div>
                <span class="subcat-name">${escapeHtml(scName)}</span>
                <span class="subcat-badge">${scCount}</span>
            </div>`;
        }).join('');

        const isOn = State.activeSubcats[key] && State.activeSubcats[key].size > 0;
        return `
        <div class="accordion-item" id="acc-${key}">
            <div class="accordion-header" data-category="${key}">
                <div class="acc-icon" style="background:${cat.color}20;color:${cat.color}">${cat.icon}</div>
                <div class="acc-info">
                    <div class="acc-label">${cat.label}</div>
                    <div class="acc-count">${count.toLocaleString()} tempat</div>
                </div>
                <button class="acc-master-toggle ${isOn ? 'on' : ''}" data-category="${key}" style="--toggle-color:${cat.color}" title="Tampilkan/Sembunyikan"></button>
                <svg class="acc-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
            </div>
            <div class="accordion-body">
                <div class="subcat-list">${subcatHtml}</div>
            </div>
        </div>`;
    }).join('');

    container.innerHTML = html;
    _attachAccordionListeners(container);
}

function _attachAccordionListeners(container) {
    // Expand/collapse
    container.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', (e) => {
            if (e.target.closest('.acc-master-toggle')) return;
            header.closest('.accordion-item').classList.toggle('expanded');
        });
    });

    // Master toggle
    container.querySelectorAll('.acc-master-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const key = btn.dataset.category;
            const isOn = btn.classList.contains('on');
            if (isOn) {
                btn.classList.remove('on');
                State.activeSubcats[key] = new Set();
                btn.closest('.accordion-item').querySelectorAll('.subcat-check').forEach(c => c.classList.remove('checked'));
            } else {
                btn.classList.add('on');
                const raw = State.rawGeojsonCache[key] || [];
                const all = new Set(raw.map(f => f.properties.subcategory || f.properties.type || 'Lainnya'));
                State.activeSubcats[key] = all;
                btn.closest('.accordion-item').querySelectorAll('.subcat-check').forEach(c => c.classList.add('checked'));
            }
            rebuildCategoryLayer(key);
        });
    });

    // Subcat toggle
    container.querySelectorAll('.subcat-item').forEach(item => {
        item.addEventListener('click', () => {
            const key = item.dataset.category;
            const sc  = item.dataset.subcat;
            const check = item.querySelector('.subcat-check');
            if (check.classList.contains('checked')) {
                check.classList.remove('checked');
                State.activeSubcats[key]?.delete(sc);
            } else {
                check.classList.add('checked');
                State.activeSubcats[key] = State.activeSubcats[key] || new Set();
                State.activeSubcats[key].add(sc);
            }
            // Update master toggle state
            const accItem = item.closest('.accordion-item');
            const anyChecked = [...accItem.querySelectorAll('.subcat-check')].some(c => c.classList.contains('checked'));
            const masterBtn = accItem.querySelector('.acc-master-toggle');
            if (masterBtn) anyChecked ? masterBtn.classList.add('on') : masterBtn.classList.remove('on');
            rebuildCategoryLayer(key);
        });
    });
}

// ── Stats ────────────────────────────────────────────────────────────────────
function updateWelcomeStats() {
    const total  = Object.values(State.categoryData).reduce((s, d) => s + (d?.features?.length || 0), 0);
    const cats   = Object.keys(State.categoryData).length;
    const subcats= Object.values(State.categoryMeta).reduce((s, m) => s + Object.keys(m?.subcategories || {}).length, 0);

    const wsTotal = document.getElementById('ws-total');
    const wsCats  = document.getElementById('ws-cats');
    const wsSub   = document.getElementById('ws-subcats');
    if (wsTotal) wsTotal.textContent = total.toLocaleString();
    if (wsCats)  wsCats.textContent  = cats;
    if (wsSub)   wsSub.textContent   = subcats;

    // Also update sidebar stats grid
    const grid = document.getElementById('stats-grid');
    if (grid && total > 0) {
        grid.innerHTML = `
            <div class="stat-card"><div class="stat-number">${total.toLocaleString()}</div><div class="stat-label">Lokasi</div></div>
            <div class="stat-card"><div class="stat-number">${cats}</div><div class="stat-label">Kategori</div></div>
            <div class="stat-card"><div class="stat-number">${subcats}</div><div class="stat-label">Sub-Kat</div></div>`;
    }
}

// ── Search ────────────────────────────────────────────────────────────────────
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
            const cat = CATEGORIES[f._categoryKey];
            const sc  = f.properties.subcategory || f.properties.type || '';
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
                const lat = parseFloat(item.dataset.lat);
                const lon = parseFloat(item.dataset.lon);
                const catKey = item.dataset.cat;
                resultsDiv.classList.add('hidden');
                document.getElementById('search-input').value = '';

                if (_map) _map.flyTo([lat, lon], 17, { duration: 1.2 });

                // Remove previous highlight
                if (State.searchHighlightMarker) {
                    _map.removeLayer(State.searchHighlightMarker);
                    State.searchHighlightMarker = null;
                }

                const feature = matches[idx];
                if (feature) {
                    // Show detail panel via custom event
                    document.dispatchEvent(new CustomEvent('markerClicked', {
                        detail: { feature, category: catKey }
                    }));
                }
            });
        });
    }
    resultsDiv.classList.remove('hidden');
}

// ── Recent Events Widget ──────────────────────────────────────────────────────
function renderRecentEventsWidget() {
    const list = document.getElementById('rew-list');
    const widget = document.getElementById('recent-events-widget');
    if (!list) return;
    const events = [
        { icon: '🌋', title: 'Aktivitas Merapi', status: 'Siaga (Level III)', statusClass: 'status-danger', time: '3 jam lalu' },
        { icon: '🌧️', title: 'Banjir Bantul', status: 'Waspada', statusClass: 'status-warning', time: '2 hari lalu' },
        { icon: '🌿', title: 'Kualitas Udara Kota', status: 'Sedang (AQI 65)', statusClass: 'status-moderate', time: '1 jam lalu' },
    ];
    list.innerHTML = events.map(e => `
        <div class="rew-item">
            <span class="rew-icon">${e.icon}</span>
            <div class="rew-info">
                <div class="rew-event-title">${e.title} <span class="rew-status ${e.statusClass}">→ ${e.status}</span></div>
                <div class="rew-time">Terakhir: ${e.time}</div>
            </div>
        </div>`).join('');
    if (widget) widget.style.display = 'block';
}
