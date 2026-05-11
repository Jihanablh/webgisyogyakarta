import { State, CATEGORIES } from './state.js';
import { getFeatureCenter } from './utils/helpers.js';

export function initSidebar({ map, router, onCategoryToggle }) {
    // Add logic from app.js
function renderCategoryTabs() {
    const c = document.getElementById('category-tabs');
    c.innerHTML = Object.entries(CATEGORIES).map(([k, cat]) => {
        const n = categoryData[k] ? categoryData[k].features.length : 0;
        return `<button class="cat-tab" data-category="${k}" style="--tab-color:${cat.color}">
            <span class="cat-tab-icon">${cat.icon}</span>
            <span class="cat-tab-label">${cat.label}</span>
            <span class="cat-tab-count">${n}</span>
        </button>`;
    }).join('');
    c.querySelectorAll('.cat-tab').forEach(t => {
        t.addEventListener('click', () => activateCategory(t.dataset.category));
    });
}

function activateCategory(key) {
    activeCategory = key;
    activeDisasterSubTab = 'all';
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.toggle('active', t.dataset.category === key));
    for (const [k, li] of Object.entries(categoryLayers)) {
        if (li && li.cluster && map.hasLayer(li.cluster)) map.removeLayer(li.cluster);
    }
    if (!categoryLayers[key] && categoryData[key]) addCategoryLayer(key, categoryData[key]);
    if (categoryLayers[key]) categoryLayers[key].cluster.addTo(map);
    renderSubcatDetail(key);
    // Show/hide disaster sub-tabs
    const dstEl = document.getElementById('disaster-sub-tabs');
    if (key === 'kebencanaan') {
        renderDisasterSubTabs();
        dstEl.classList.remove('hidden');
    } else {
        dstEl.classList.add('hidden');
    }
    // Show/hide recent events
    const rewEl = document.getElementById('recent-events-widget');
    if (DISASTER_CATEGORIES.includes(key)) {
        rewEl.style.display = 'block';
    } else {
        rewEl.style.display = 'none';
    }
}

// =====================================================
// SUBCATEGORY DETAIL (sidebar)
// =====================================================
function renderSubcatDetail(key) {
    const container = document.getElementById('category-detail');
    if (!container) return;
    const cat = CATEGORIES[key];
    const meta = categoryMeta[key];
    const subcats = meta ? meta.subcategories : {};
    const count = categoryData[key] ? categoryData[key].features.length : 0;

    container.innerHTML = `
        <div class="cd-header" style="--cat-color:${cat.color}">
            <div class="cd-icon">${cat.icon}</div>
            <div class="cd-info">
                <div class="cd-label">${cat.label}</div>
                <div class="cd-count">${count.toLocaleString()} tempat</div>
            </div>
        </div>
        <div class="cd-subcats">
            <h3 class="section-title">Sub-Kategori</h3>
            <div class="cd-subcat-list">
                ${Object.entries(subcats).map(([scName, scCount]) => `
                    <div class="cd-subcat-item" data-category="${key}" data-subcat="${scName}">
                        <div class="cd-subcat-check checked" style="--check-color:${cat.color}"></div>
                        <span class="cd-subcat-name">${scName}</span>
                        <span class="cd-subcat-badge">${scCount}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    container.querySelectorAll('.cd-subcat-item').forEach(item => {
        item.addEventListener('click', () => {
            const ck = item.dataset.category, sc = item.dataset.subcat;
            const ch = item.querySelector('.cd-subcat-check');
            if (ch.classList.contains('checked')) {
                ch.classList.remove('checked'); activeSubcats[ck].delete(sc);
            } else {
                ch.classList.add('checked'); activeSubcats[ck].add(sc);
            }
            rebuildCategoryLayer(ck);
        });
    });
}

// Legacy compat
function renderAccordion(results) {
    const container = document.getElementById('accordion-container');
    const countMap = {};
    results.forEach(r => countMap[r.key] = r.count);

    container.innerHTML = Object.entries(CATEGORIES).map(([key, cat]) => {
        const count = countMap[key] || 0;
        const meta = categoryMeta[key];
        const subcats = meta ? meta.subcategories : {};

        const subcatHtml = Object.entries(subcats).map(([scName, scCount]) => `
            <div class="subcat-item" data-category="${key}" data-subcat="${scName}">
                <div class="subcat-check checked" style="--check-color:${cat.color}"></div>
                <span class="subcat-name">${scName}</span>
                <span class="subcat-badge">${scCount}</span>
            </div>
        `).join('');

        return `
            <div class="accordion-item" id="acc-${key}">
                <div class="accordion-header" data-category="${key}">
                    <div class="acc-icon" style="background:${cat.color}20;color:${cat.color}">${cat.icon}</div>
                    <div class="acc-info">
                        <div class="acc-label">${cat.label}</div>
                        <div class="acc-count">${count.toLocaleString()} tempat</div>
                    </div>
                    <button class="acc-master-toggle on" data-category="${key}" style="--toggle-color:${cat.color}"
                            title="Tampilkan/Sembunyikan semua"></button>
                    <svg class="acc-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </div>
                <div class="accordion-body">
                    <div class="subcat-list">${subcatHtml}</div>
                </div>
            </div>
        `;
    }).join('');

    // --- Event Listeners ---

    // Accordion expand/collapse (click on header but NOT on toggle)
    container.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', (e) => {
            // Don't toggle accordion when clicking the master toggle button
            if (e.target.closest('.acc-master-toggle')) return;
            const item = header.closest('.accordion-item');
            item.classList.toggle('expanded');
        });
    });

    // Master toggle (on/off entire category)
    container.querySelectorAll('.acc-master-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const key = btn.dataset.category;
            const isOn = btn.classList.contains('on');

            if (isOn) {
                // Turn OFF all subcats
                btn.classList.remove('on');
                activeSubcats[key] = new Set();
                // Uncheck all subcat checkboxes
                const accItem = btn.closest('.accordion-item');
                accItem.querySelectorAll('.subcat-check').forEach(c => c.classList.remove('checked'));
            } else {
                // Turn ON all subcats
                btn.classList.add('on');
                const allSc = new Set();
                categoryData[key].features.forEach(f => {
                    if (f.properties.subcategory) allSc.add(f.properties.subcategory);
                });
                activeSubcats[key] = allSc;
                const accItem = btn.closest('.accordion-item');
                accItem.querySelectorAll('.subcat-check').forEach(c => c.classList.add('checked'));
            }

            rebuildCategoryLayer(key);
        });
    });

    // Sub-category toggle
    container.querySelectorAll('.subcat-item').forEach(item => {
        item.addEventListener('click', () => {
            const key = item.dataset.category;
            const sc = item.dataset.subcat;
            const check = item.querySelector('.subcat-check');
            const isChecked = check.classList.contains('checked');

            if (isChecked) {
                check.classList.remove('checked');
                activeSubcats[key].delete(sc);
            } else {
                check.classList.add('checked');
                activeSubcats[key].add(sc);
            }

            // Update master toggle state
            const accItem = item.closest('.accordion-item');
            const masterBtn = accItem.querySelector('.acc-master-toggle');
            const allChecks = accItem.querySelectorAll('.subcat-check');
            const anyChecked = Array.from(allChecks).some(c => c.classList.contains('checked'));
            if (anyChecked) {
                masterBtn.classList.add('on');
            } else {
                masterBtn.classList.remove('on');
            }

            rebuildCategoryLayer(key);
        });
    });
}

// =====================================================
// STATS
function buildSearchIndex() {
    allFeatures = [];
    for (const [key, data] of Object.entries(categoryData)) {
        for (const feature of data.features) {
            allFeatures.push({ ...feature, _categoryKey: key });
        }
    }
}

function initSearch() {
    const input = document.getElementById('search-input');
    const resultsDiv = document.getElementById('search-results');
    let debounceTimer;

    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const q = input.value.trim().toLowerCase();
            if (q.length < 2) { resultsDiv.classList.add('hidden'); return; }
            performSearch(q);
        }, 200);
    });

    input.addEventListener('focus', () => {
        if (input.value.trim().length >= 2) resultsDiv.classList.remove('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) resultsDiv.classList.add('hidden');
    });
}

function performSearch(query) {
    const resultsDiv = document.getElementById('search-results');
    const matches = allFeatures
        .filter(f => {
            const name = (f.properties.name || '').toLowerCase();
            const type = (f.properties.type || '').toLowerCase();
            const sc = (f.properties.subcategory || '').toLowerCase();
            return name.includes(query) || type.includes(query) || sc.includes(query);
        })
        .slice(0, 20);

    if (matches.length === 0) {
        resultsDiv.innerHTML = '<div class="search-result-item"><span class="search-result-name" style="color:var(--text-muted)">Tidak ditemukan</span></div>';
    } else {
        resultsDiv.innerHTML = matches.map((f, i) => {
            const cat = CATEGORIES[f._categoryKey];
            const sc = f.properties.subcategory || f.properties.type || '';
            return `
                <div class="search-result-item" data-idx="${i}" data-lon="${f.geometry.coordinates[0]}" data-lat="${f.geometry.coordinates[1]}" data-cat="${f._categoryKey}">
                    <span class="search-result-dot" style="background:${cat.color}"></span>
                    <div class="search-result-info">
                        <span class="search-result-name">${escapeHtml(f.properties.name || 'Unnamed')}</span>
                        <span class="search-result-meta">${escapeHtml(sc)} · ${cat.label}</span>
                    </div>
                </div>
            `;
        }).join('');

        // Click handlers
        resultsDiv.querySelectorAll('.search-result-item[data-lon]').forEach((item, idx) => {
            item.addEventListener('click', () => {
                const lon = parseFloat(item.dataset.lon);
                const lat = parseFloat(item.dataset.lat);
                const catKey = item.dataset.cat;
                resultsDiv.classList.add('hidden');

                // Find the feature
                const feature = matches[idx];
                if (feature) {
                    handleSearchSelect(feature, catKey, lat, lon);
                }
            });
        });
    }

    resultsDiv.classList.remove('hidden');
}

/**
 * Handle search result selection:
 * 1. Fly to location
 * 2. Force-render highlighted marker (even if filter is OFF)
 * 3. Show info card
 */
function handleSearchSelect(feature, categoryKey, lat, lon) {
    // 1. Remove previous highlight
    removeSearchHighlight();

    // 2. Fly to location
    map.flyTo([lat, lon], 17, { duration: 1.2 });

    // 3. Create force-render highlighted marker with category icon + pulse
    const highlightIcon = createCustomIcon(categoryKey, { size: 44, highlighted: true });

    searchHighlightMarker = L.marker([lat, lon], {
        icon: highlightIcon,
        zIndexOffset: 9999 // Always on top
    }).addTo(map);

    // Bind popup to highlight marker
    const cat = CATEGORIES[categoryKey];
    const props = feature.properties;
    searchHighlightMarker.bindPopup(`
        <div class="popup-content">
            <div class="popup-name">${escapeHtml(props.name || 'Unnamed')}</div>
            <div class="popup-type">
                <span class="popup-dot" style="background:${cat.color}"></span>
                ${escapeHtml(props.subcategory || props.type || '')} · ${cat.label}
            </div>
        </div>
    `, { closeButton: true, maxWidth: 250 });

    // Click handler on highlight marker
    searchHighlightMarker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        showTourismPanel(feature, categoryKey);
    });

    // Open popup after fly animation
    setTimeout(() => {
        if (searchHighlightMarker) searchHighlightMarker.openPopup();
    }, 1400);

    // 4. Show detail panel
    showTourismPanel(feature, categoryKey);
}

function removeSearchHighlight() {
    if (searchHighlightMarker) {
        map.removeLayer(searchHighlightMarker);
        searchHighlightMarker = null;
    }
}

// =====================================================
// INFO CARD
function _initSidebarUI() {
    const sidebar = document.getElementById('sidebar');
    document.getElementById('sidebar-toggle').addEventListener('click', () => sidebar.classList.toggle('open'));
    document.getElementById('sidebar-toggle-close').addEventListener('click', () => sidebar.classList.remove('open'));
    document.getElementById('info-card-close').addEventListener('click', (e) => {
        e.stopPropagation();
        closeInfoCard();
    });
    document.getElementById('tp-close').addEventListener('click', (e) => {
        e.stopPropagation();
        closeTourismPanel();
    });
    document.getElementById('dp-close').addEventListener('click', (e) => {
        e.stopPropagation();
        closeDisasterPanel();
    });
    document.getElementById('btn-open-stats').addEventListener('click', () => {
        const statTab = document.querySelector('.top-nav-tab[data-page="statistik"]');
        if (statTab) statTab.click();
    });

// =====================================================
// TOURISM PANEL

    window.renderCategoryTabs = renderCategoryTabs;
    window.activateCategory = activateCategory;
    window.renderSubcatDetail = renderSubcatDetail;
    window.renderAccordion = renderAccordion;
    window.buildSearchIndex = buildSearchIndex;
    window.initSearch = initSearch;
    window.performSearch = performSearch;
    window.handleSearchSelect = handleSearchSelect;
    window.removeSearchHighlight = removeSearchHighlight;
}

    // Run UI setup
    _initSidebarUI();
}
