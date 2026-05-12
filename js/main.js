import { initMap } from './map.js';
import { loadLayer, hideLayer, showOnlyKebencanaan, showOnlyCategory, fitMapToCategory } from './layers.js';
import { initSidebar, setSidebarMode, hideTataKotaLayers } from './sidebar.js';
import { initDetailPanel } from './detail-panel.js';
import { Router } from './utils/router.js';
import { LoadingManager } from './utils/loader.js';
import { initReportPage }     from './pages/report.js';
import { initStatisticsPage } from './pages/statistics.js';
import { initAboutPage }      from './pages/about.js';
import { initTataKotaPage }   from './pages/tatakota.js';
import { State, CATEGORIES }  from './state.js';
import { CHATBOT_DB, ChatbotEngine } from './chatbot-db.js';
import { initBgm, tryResumeBgmFromWelcomeGesture } from './bgm.js';

window.State = State;
window.CATEGORIES = CATEGORIES;

let _isTataKotaActive = false;

async function init() {
    const map    = initMap();
    const router = new Router();
    const loader = new LoadingManager(10);

    // Register SPA routes
    router.register('map',       {});
    router.register('laporan',   { onEnter: () => initReportPage() });
    router.register('statistik', { onEnter: () => initStatisticsPage() });
    router.register('tentang',   { onEnter: () => initAboutPage() });
    router.register('tatakota',  { onEnter: () => initTataKotaPage() });

    // Nav tab click handling
    document.querySelectorAll('.top-nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.page;

            // ── Any tab navigation ─────────────────────────────────────────────
            if (_isTataKotaActive && page !== 'tatakota') {
                // Coming FROM Tata Kota sidebar mode: reset sidebar
                hideTataKotaLayers();
                setSidebarMode('kebencanaan');
                _isTataKotaActive = false;
            }

            // Route using the generic router
            router.navigate(page);

            if (page === 'map') {
                document.getElementById('disaster-filters')?.classList.remove('hidden');
                document.getElementById('category-tabs')?.classList.add('hidden');
                document.getElementById('subcategory-chips')?.classList.add('hidden');
                showOnlyKebencanaan();
                if (State.map) setTimeout(() => State.map.invalidateSize(), 50);
            } else if (page === 'tatakota') {
                document.getElementById('disaster-filters')?.classList.add('hidden');
                document.getElementById('category-tabs')?.classList.remove('hidden');
                
                // Set first category active if none
                const tabs = document.getElementById('category-tabs');
                if (tabs && !tabs.querySelector('.active')) {
                    tabs.querySelector('.cat-btn[data-category="pariwisata"]')?.click();
                }
                if (State.map) setTimeout(() => State.map.invalidateSize(), 50);
            } else {
                // Other pages don't need map overlay UI
                document.getElementById('disaster-filters')?.classList.add('hidden');
                document.getElementById('category-tabs')?.classList.add('hidden');
                document.getElementById('subcategory-chips')?.classList.add('hidden');
            }
        });
    });

    initSidebar({ map, router, onCategoryToggle: (cat) => loadLayer(cat) });
    initDetailPanel();
    initBgm();
    initCategoryTabs();
    initDisasterFilters();

    // ── Default state: only kebencanaan on startup ────────────────────────────
    showOnlyKebencanaan();

    // Load kebencanaan first (priority)
    await loadLayer('kebencanaan');
    loader.tick('Kebencanaan');

    // ── Welcome button ────────────────────────────────────────────────────────
    const welcomeBtn = document.getElementById('welcome-btn');
    if (welcomeBtn) {
        welcomeBtn.addEventListener('click', () => {
            const overlay = document.getElementById('welcome-overlay');
            overlay.classList.add('fade-out');
            setTimeout(() => { overlay.style.display = 'none'; }, 750);
            document.body.classList.add('app-started');
            document.getElementById('top-nav')?.classList.add('is-visible');
            document.getElementById('disaster-filters').classList.remove('hidden');
            document.getElementById('category-tabs').classList.add('hidden');
            document.getElementById('risk-legend').classList.remove('hidden');
            showOnlyKebencanaan();
            tryResumeBgmFromWelcomeGesture();
            if (State.map) setTimeout(() => State.map.invalidateSize(), 100);
        });
    }

    // ── Sidebar toggle ────────────────────────────────────────────────────────
    const sidebarOpenBtn = document.getElementById('sidebar-open-btn');
    const sidebarCloseBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    if (sidebarOpenBtn) {
        sidebarOpenBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
            sidebarOpenBtn.style.display = 'none';
            if (State.map) setTimeout(() => State.map.invalidateSize(), 350);
        });
    }
    if (sidebarCloseBtn) {
        sidebarCloseBtn.addEventListener('click', () => {
            sidebar.classList.remove('open');
            sidebarOpenBtn.style.display = 'flex';
            if (State.map) setTimeout(() => State.map.invalidateSize(), 350);
        });
    }

    // ── Basemap toggle ────────────────────────────────────────────────────────
    const basemaps = {
        osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '\u00a9 OpenStreetMap contributors', maxZoom: 19 }),
        satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '\u00a9 Esri', maxZoom: 19 }),
        terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: '\u00a9 OpenTopoMap', maxZoom: 17 })
    };
    let activeBasemap = null;
    function switchBasemap(key) {
        if (activeBasemap) State.map.removeLayer(activeBasemap);
        activeBasemap = basemaps[key];
        State.map.addLayer(activeBasemap);
        activeBasemap.bringToBack();
    }
    document.querySelectorAll('.bm-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.bm-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            switchBasemap(btn.dataset.bm);
        });
    });

    // ── Detail panel tabs ─────────────────────────────────────────────────────
    document.querySelectorAll('.dtab').forEach(tab => {
        tab.addEventListener('click', () => {
            const key = tab.dataset.dtab;
            document.querySelectorAll('.dtab').forEach(t => t.classList.toggle('active', t === tab));
            document.querySelectorAll('.dtab-pane').forEach(p => {
                p.id === 'dtab-' + key ? p.classList.remove('hidden') : p.classList.add('hidden');
            });
        });
    });
    const detailClose = document.getElementById('detail-panel-close');
    if (detailClose) {
        detailClose.addEventListener('click', () => {
            document.getElementById('detail-panel').classList.remove('open');
        });
    }
    const detailBtnFly = document.getElementById('detail-btn-fly');
    const detailBtnGmaps = document.getElementById('detail-btn-gmaps');
    if (detailBtnFly) detailBtnFly.addEventListener('click', () => {
        if (window._detailLatLng && State.map) State.map.flyTo(window._detailLatLng, 16, { duration: 1.2 });
    });
    if (detailBtnGmaps) detailBtnGmaps.addEventListener('click', () => {
        if (window._detailLatLng) window.open(`https://maps.google.com?q=${window._detailLatLng[0]},${window._detailLatLng[1]}`);
    });

    // ── Chatbot SIGAJOG (local engine, no API) ─────────────────────────────
    const chatEngine = new ChatbotEngine(CHATBOT_DB);
    const chatToggle  = document.getElementById('chatbot-toggle');
    const chatPanel   = document.getElementById('chatbot-panel');
    const chatCloseEl = document.getElementById('chatbot-close');
    const chatInput   = document.getElementById('chatbot-input');
    const chatSend    = document.getElementById('chatbot-send');
    const chatMsgs    = document.getElementById('chatbot-messages');
    const suggestEl   = document.getElementById('chatbot-suggestions');

    // Render suggestion chips
    if (suggestEl) {
        chatEngine.getSuggestions().forEach(q => {
            const chip = document.createElement('button');
            chip.className = 'chat-suggest-chip';
            chip.textContent = q;
            chip.addEventListener('click', () => {
                handleChatSend(q);
                suggestEl.style.display = 'none';
            });
            suggestEl.appendChild(chip);
        });
    }

    if (chatToggle) chatToggle.addEventListener('click', () => chatPanel.classList.toggle('hidden'));
    if (chatCloseEl) chatCloseEl.addEventListener('click', () => chatPanel.classList.add('hidden'));

    function appendChatMsg(role, text, isLoading = false) {
        const id = 'msg-' + Date.now() + Math.floor(Math.random()*1000);
        const div = document.createElement('div');
        div.className = `chat-msg ${role}`;
        div.id = id;
        if (isLoading) {
            div.innerHTML = `<div class="msg-bubble loading"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
        } else {
            const html = String(text)
                .replace(/&/g,'&amp;').replace(/</g,'&lt;')
                .replace(/\n/g,'<br>')
                .replace(/•/g,'<span class="bullet">•</span>');
            div.innerHTML = `<div class="msg-bubble">${html}</div>`;
        }
        chatMsgs?.appendChild(div);
        chatMsgs?.scrollTo({ top: chatMsgs.scrollHeight, behavior:'smooth' });
        return id;
    }

    function updateChatMsg(id, text) {
        const el = document.getElementById(id);
        if (!el) return;
        const html = String(text)
            .replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/\n/g,'<br>')
            .replace(/•/g,'<span class="bullet">•</span>');
        el.innerHTML = `<div class="msg-bubble">${html}</div>`;
        chatMsgs?.scrollTo({ top: chatMsgs.scrollHeight, behavior:'smooth' });
    }

    function handleChatSend(forcedText = null) {
        const text = forcedText || chatInput?.value?.trim();
        if (!text) return;
        if (chatInput && !forcedText) chatInput.value = '';
        if (chatSend) chatSend.disabled = true;
        appendChatMsg('user', text);
        const loadId = appendChatMsg('bot', null, true);
        const delay = 400 + Math.random() * 500;
        setTimeout(() => {
            const answer = chatEngine.search(text);
            updateChatMsg(loadId, answer);
            if (chatSend) chatSend.disabled = false;
            chatInput?.focus();
        }, delay);
    }

    if (chatSend) chatSend.addEventListener('click', () => handleChatSend());
    if (chatInput) chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleChatSend(); });

    // Load all other categories in background (hidden until toggled ON)
    const others = [
        'pariwisata', 'kebutuhan', 'atm_bank', 'tempat_tinggal',
        'sosial_tugas', 'akademik', 'kesehatan_darurat',
        'lingkungan', 'mobilitas'
    ];
    await Promise.all(others.map(async (cat) => {
        await loadLayer(cat);
        if (CATEGORIES[cat]) loader.tick(CATEGORIES[cat].label);
    }));
}


function initCategoryTabs() {
    const tabsContainer = document.getElementById('category-tabs');
    const chipsContainer = document.getElementById('subcategory-chips');
    if (!tabsContainer || !chipsContainer) return;

    // Filter categories to show as tabs (e.g., exclude some if needed, but here we show all main ones)
    const mainCats = [
        { id: 'pariwisata', label: 'Pariwisata' },
        { id: 'mobilitas', label: 'Mobilitas' },
        { id: 'kesehatan_darurat', label: 'Kesehatan' },
        { id: 'kebutuhan', label: 'Kebutuhan' },
        { id: 'tempat_tinggal', label: 'Penginapan' },
        { id: 'atm_bank', label: 'Keuangan' },
        { id: 'sosial_tugas', label: 'Sosial' },
        { id: 'akademik', label: 'Pendidikan' },
        { id: 'lingkungan', label: 'Lingkungan' }
    ];

    tabsContainer.innerHTML = mainCats.map(cat => 
        `<button class="cat-btn" data-category="${cat.id}">${cat.label}</button>`
    ).join('');

    const buttons = tabsContainer.querySelectorAll('.cat-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Exclusive active state
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const catId = btn.dataset.category;
            
            // 1. Show only this category
            showOnlyCategory(catId);
            
            // 2. Fit map bounds to this category
            fitMapToCategory(catId);
            
            // 3. Render subcategory chips
            renderSubcategoryChips(catId, chipsContainer);
        });
    });

    // Initialize with pariwisata active
    const defaultBtn = tabsContainer.querySelector('[data-category="pariwisata"]');
    if (defaultBtn) {
        defaultBtn.click();
    }
}

function renderSubcategoryChips(categoryId, container) {
    const meta = State.categoryMeta[categoryId];
    if (!meta || !meta.subcategories) {
        container.innerHTML = '';
        container.classList.add('hidden');
        return;
    }

    const subcats = Object.keys(meta.subcategories).sort();
    if (subcats.length === 0) {
        container.innerHTML = '';
        container.classList.add('hidden');
        return;
    }

    container.innerHTML = subcats.map(sc => 
        `<button class="sub-chip active" data-sub="${sc}">${sc}</button>`
    ).join('');
    
    container.classList.remove('hidden');

    // Handle subcategory toggle
    container.querySelectorAll('.sub-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('active');
            const isActive = chip.classList.contains('active');
            const subName = chip.dataset.sub;
            
            if (!State.activeSubcats[categoryId]) {
                State.activeSubcats[categoryId] = new Set();
            }
            
            if (isActive) {
                State.activeSubcats[categoryId].add(subName);
            } else {
                State.activeSubcats[categoryId].delete(subName);
            }
            
            
            // Rebuild layer after changing subcategory filter
            import('./layers.js').then(m => m.rebuildCategoryLayer(categoryId));
        });
    });
}

function initDisasterFilters() {
    const filters = document.querySelectorAll('.d-filter-btn');
    if (!filters.length) return;
    filters.forEach(btn => {
        btn.addEventListener('click', async () => {
            filters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterType = btn.dataset.filter;
            
            if (!State.activeSubcats['kebencanaan']) State.activeSubcats['kebencanaan'] = new Set();
            State.activeSubcats['kebencanaan'].clear();
            
            if (filterType === 'Zona Bencana') {
                ['Rawan Erupsi', 'Risiko Erupsi', 'KRB III', 'KRB II', 'KRB I', 'Rawan Banjir', 'Risiko Banjir', 'Daerah Banjir', 'Rawan Gempa', 'Risiko Gempa', 'Zona Gempa', 'Rawan Longsor', 'Risiko Longsor', 'Zona Longsor', 'Rawan Kekeringan', 'Kekeringan'].forEach(s => State.activeSubcats['kebencanaan'].add(s));
            } else {
                ['Titik Kumpul', 'Pengungsian'].forEach(s => State.activeSubcats['kebencanaan'].add(s));
            }
            
            const { rebuildCategoryLayer } = await import('./layers.js');
            rebuildCategoryLayer('kebencanaan');
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
