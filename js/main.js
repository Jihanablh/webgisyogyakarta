import { initMap } from './map.js?v=20260526-round26-welcome-encoding';
import { loadLayer, showOnlyKebencanaan, loadDIYBoundary, toggleKebencanaanZona, toggleKebencanaanJalur, toggleKebencanaanPengungsian } from './layers.js?v=20260526-round26-welcome-encoding';
import { initSidebar } from './sidebar.js?v=20260526-round26-welcome-encoding';
import { initDetailPanel } from './detail-panel.js?v=20260526-round26-welcome-encoding';
import { Router } from './utils/router.js?v=20260526-round26-welcome-encoding';
import { LoadingManager } from './utils/loader.js?v=20260526-round26-welcome-encoding';
import { initReportPage }     from './pages/report.js?v=20260526-round26-welcome-encoding';
import { initStatisticsPage } from './pages/statistics.js?v=20260526-round26-welcome-encoding';
import { initAboutPage }      from './pages/about.js?v=20260526-round26-welcome-encoding';
import { initTataKotaPage }   from './pages/tatakota.js?v=20260526-round26-welcome-encoding';
import { initDashboardPage }  from './pages/dashboard.js?v=20260526-round26-welcome-encoding';
import { State, CATEGORIES, CONFIG }  from './state.js?v=20260526-round26-welcome-encoding';
import { CHATBOT_DB, ChatbotEngine } from './chatbot-db.js?v=20260526-round26-welcome-encoding';
import { buildGeoKnowledgeIndex } from './geo-index.js?v=20260526-round26-welcome-encoding';
import { initBgm, tryResumeBgmFromWelcomeGesture } from './bgm.js?v=20260526-round26-welcome-encoding';
import { initWelcomeCinematic } from './welcome-cinematic.js?v=20260526-round26-welcome-encoding';
import { createMarker } from './markers.js?v=20260526-round26-welcome-encoding';

window.State = State;
window.CATEGORIES = CATEGORIES;

function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-toggle-icon');
    const saved = localStorage.getItem('jogja-siaga-theme') || 'dark';
    const apply = (mode) => {
        const isLight = mode === 'light';
        document.documentElement.classList.toggle('light', isLight);
        document.documentElement.classList.toggle('dark', !isLight);
        document.body?.classList.toggle('theme-light', isLight);
        localStorage.setItem('jogja-siaga-theme', mode);
        if (btn) btn.setAttribute('aria-pressed', String(isLight));
        if (icon) icon.innerHTML = isLight ? '&#9728;' : '&#9790;';
        window.dispatchEvent(new CustomEvent('jogja-theme-change', { detail: { mode } }));
    };
    apply(saved);
    btn?.addEventListener('click', () => {
        apply(document.documentElement.classList.contains('light') ? 'dark' : 'light');
        if (!document.getElementById('statistik-page')?.classList.contains('hidden')) initStatisticsPage();
        if (!document.getElementById('laporan-page')?.classList.contains('hidden')) initReportPage();
        if (State.map) setTimeout(() => State.map.invalidateSize(), 80);
    });
}

const DIY_BOUNDS = [[-8.15, 109.9], [-7.45, 110.85]];

function fitDisasterMapToDIY() {
    if (!State.map || typeof L === 'undefined') return;
    setTimeout(() => {
        try {
            State.map.invalidateSize();
            State.map.fitBounds(L.latLngBounds(DIY_BOUNDS), {
                paddingTopLeft: [490, 20],
                paddingBottomRight: [320, 20],
                animate: false
            });
        } catch (_) {}
    }, 80);
}

function parseSingleMapHash() {
    const m = /^#map\/single\/(.+)$/.exec(location.hash || '');
    return m ? decodeURIComponent(m[1]) : null;
}

function openSingleMapMode(map, id) {
    const raw = sessionStorage.getItem(`singleMap:${id}`);
    if (!raw) return false;
    let data = null;
    try {
        data = JSON.parse(raw);
    } catch (_) {
        return false;
    }
    const { name, lat, lng } = data || {};
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;

    document.getElementById('top-nav')?.classList.add('is-visible');
    document.getElementById('map-top-left-chrome')?.classList.add('hidden');
    document.getElementById('map-right-stack')?.classList.add('hidden');
    document.getElementById('sidebar')?.classList.add('hidden');
    document.getElementById('detail-panel')?.classList.remove('open');
    document.querySelectorAll('.spa-page').forEach((el) => el.classList.add('hidden'));
    document.body.classList.add('app-started');

    if (State.map) {
        Object.values(State.layerCache || {}).forEach((layer) => {
            try {
                State.map.removeLayer(layer);
            } catch (_) {}
        });
    }
    const feature = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: { name: name || 'Lokasi', category: 'pariwisata' }
    };
    const marker = createMarker(feature, [lat, lng], 'pariwisata').addTo(map);
    marker.bindTooltip(`<strong>${String(name || 'Lokasi')}</strong><br><span>Lokasi terpilih</span>`, {
        direction: 'top',
        offset: [0, -18],
        opacity: 1,
        className: 'map-marker-tooltip'
    });
    map.setView([lat, lng], 16, { animate: true });
    return true;
}

async function init() {
    initThemeToggle();
    const sp = new URLSearchParams(window.location.search);
    const legacyId = sp.get('tatakotaId');
    if (sp.get('view') === 'detail' && legacyId) {
        const h = `${location.pathname}#tatakota/detail/${encodeURIComponent(legacyId)}`;
        history.replaceState(null, '', h);
    }

    const map    = initMap();
    const router = new Router();
    window.appRouter = router;
    const loader = new LoadingManager(10);

    const singleId = parseSingleMapHash();
    if (singleId) {
        openSingleMapMode(map, singleId);
        return;
    }

    // Register SPA routes
    router.register('dashboard', { onEnter: () => initDashboardPage() });
    router.register('map',       { onEnter: () => {
        showOnlyKebencanaan();
        fitDisasterMapToDIY();
    }});
    router.register('laporan',   { onEnter: () => initReportPage() });
    router.register('statistik', { onEnter: () => initStatisticsPage() });
    router.register('tentang',   { onEnter: () => initAboutPage() });
    router.register('tatakota',  { onEnter: () => initTataKotaPage() });

    // Nav tab click handling
    document.querySelectorAll('.top-nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.page;

            // Route using the generic router
            router.navigate(page);

            if (page === 'map') {
                document.getElementById('map-top-left-chrome')?.classList.remove('hidden');
                document.getElementById('map-right-stack')?.classList.remove('hidden');
                document.getElementById('kab-risk-info-panel')?.classList.remove('hidden');
                document.getElementById('risk-legend')?.classList.remove('hidden');
                showOnlyKebencanaan();
                fitDisasterMapToDIY();
            } else {
                document.getElementById('map-top-left-chrome')?.classList.add('hidden');
                document.getElementById('map-right-stack')?.classList.add('hidden');
                document.getElementById('kab-risk-info-panel')?.classList.add('hidden');
            }
        });
    });

    initSidebar({ map, router, onCategoryToggle: (cat) => loadLayer(cat) });
    initDetailPanel();
    initBgm();
    initWelcomeCinematic();
    initDisasterFilters();

    // -- Default state: only kebencanaan on startup ----------------------------
    showOnlyKebencanaan();
    fitDisasterMapToDIY();

    // Load kebencanaan first (priority)
    await loadLayer('kebencanaan');
    loader.tick('Kebencanaan');
    fitDisasterMapToDIY();

    // -- Welcome button --------------------------------------------------------
    const welcomeBtn = document.getElementById('welcome-btn');
    if (welcomeBtn) {
        welcomeBtn.addEventListener('click', () => {
            const overlay = document.getElementById('welcome-overlay');
            document.body.classList.add('app-started');
            document.getElementById('top-nav')?.classList.add('is-visible');
            router.navigate('dashboard');
            overlay.classList.add('welcome-to-dashboard');
            setTimeout(() => {
                overlay.classList.add('fade-out');
                setTimeout(() => { overlay.style.display = 'none'; }, 220);
            }, 620);
            tryResumeBgmFromWelcomeGesture();
            loadDIYBoundary();
            if (State.map) setTimeout(() => State.map.invalidateSize(), 100);
        });
    }

    // -- Sidebar toggle --------------------------------------------------------
    const sidebarCloseBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    sidebar?.classList.add('open');
    if (sidebarCloseBtn) {
        sidebarCloseBtn.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            if (State.map) setTimeout(() => State.map.invalidateSize(), 350);
        });
    }

    // -- Basemap + zoom (single stack, top-right) -----------------------------
    const basemaps = {
        dark: L.tileLayer(CONFIG.tileUrl, {
            attribution: CONFIG.tileAttribution,
            maxZoom: 19,
            keepBuffer: 4,
            updateWhenIdle: false,
            updateWhenZooming: false
        }),
        light: L.tileLayer(CONFIG.lightTileUrl, {
            attribution: '\u00a9 OpenStreetMap contributors',
            maxZoom: 19,
            keepBuffer: 4,
            updateWhenIdle: false,
            updateWhenZooming: false
        }),
        osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '\u00a9 OpenStreetMap contributors',
            maxZoom: 19
        }),
        satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '\u00a9 Esri',
            maxZoom: 19
        }),
        terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: '\u00a9 OpenTopoMap',
            maxZoom: 17
        })
    };
    let activeBasemap = null;
    let activeBasemapKey = null;
    function switchBasemap(key) {
        activeBasemapKey = key;
        const resolvedKey = key === 'dark' && document.documentElement.classList.contains('light') ? 'light' : key;
        const layer = basemaps[resolvedKey];
        if (!layer || !State.map) return;
        if (activeBasemap) State.map.removeLayer(activeBasemap);
        activeBasemap = layer;
        State.map.addLayer(activeBasemap);
        activeBasemap.bringToBack();
    }
    document.querySelectorAll('#map-controls-stack .bm-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#map-controls-stack .bm-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            switchBasemap(btn.dataset.bm);
        });
    });
    const firstBm = document.querySelector('#map-controls-stack .bm-btn.active')?.dataset.bm || 'dark';
    switchBasemap(firstBm);
    window.addEventListener('jogja-theme-change', () => {
        if (activeBasemapKey === 'dark') switchBasemap('dark');
    });

    const zoomInBtn = document.getElementById('map-zoom-in');
    const zoomOutBtn = document.getElementById('map-zoom-out');
    const updateZoomState = () => {
        const z = State.map?.getZoom?.() ?? 0;
        const min = State.map?.getMinZoom?.() ?? 0;
        const max = State.map?.getMaxZoom?.() ?? 18;
        if (zoomOutBtn) {
            zoomOutBtn.disabled = z <= min;
            zoomOutBtn.title = z <= min ? 'Sudah di zoom minimum' : 'Perkecil';
        }
        if (zoomInBtn) {
            zoomInBtn.disabled = z >= max;
            zoomInBtn.title = z >= max ? 'Sudah di zoom maksimum' : 'Perbesar';
        }
    };
    zoomInBtn?.addEventListener('click', (event) => {
        event.stopPropagation();
        State.map?.zoomIn(1);
        setTimeout(updateZoomState, 60);
    });
    zoomOutBtn?.addEventListener('click', (event) => {
        event.stopPropagation();
        State.map?.zoomOut(1);
        setTimeout(updateZoomState, 60);
    });
    document.addEventListener('click', (event) => {
        const target = event.target?.closest?.('#map-zoom-in, #map-zoom-out');
        if (!target || !State.map) return;
        event.preventDefault();
        if (target.id === 'map-zoom-in') State.map.zoomIn(1);
        if (target.id === 'map-zoom-out') State.map.zoomOut(1);
        setTimeout(updateZoomState, 60);
    });
    State.map?.on('zoomend', updateZoomState);
    updateZoomState();

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

    // -- Chatbot SIGAJOG (local engine, no API) -----------------------------
    const chatEngine = new ChatbotEngine(CHATBOT_DB);
    const chatToggle  = document.getElementById('chatbot-toggle');
    const chatPanel   = document.getElementById('chatbot-panel');
    const chatBack = document.getElementById('chatbot-close');
    const chatBackdrop = document.getElementById('chatbot-backdrop');

    function setChatOpen(open) {
        chatPanel?.classList.toggle('chatbot-panel--open', open);
        chatBackdrop?.classList.toggle('is-on', open);
        chatPanel?.setAttribute('aria-hidden', open ? 'false' : 'true');
        if (chatBackdrop) chatBackdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
    }

    // Render suggestion chips
    const chatSend    = document.getElementById('chatbot-send');
    const chatMsgs    = document.getElementById('chatbot-messages');
    const suggestEl   = document.getElementById('chatbot-suggestions');

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

    if (chatToggle) {
        chatToggle.addEventListener('click', () => {
            const open = !chatPanel?.classList.contains('chatbot-panel--open');
            setChatOpen(open);
        });
    }
    if (chatBack) chatBack.addEventListener('click', () => setChatOpen(false));
    if (chatBackdrop) chatBackdrop.addEventListener('click', () => setChatOpen(false));

    const chatInput   = document.getElementById('chatbot-input');

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
                .replace(/â€¢/g,'<span class="bullet">â€¢</span>');
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
            .replace(/â€¢/g,'<span class="bullet">â€¢</span>');
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

    const geoIdx = buildGeoKnowledgeIndex(State);
    chatEngine.setGeoIndex(geoIdx);

    if (/^#tatakota\/detail\//.test(location.hash)) {
        router.navigate('tatakota');
    }
}

function initDisasterFilters() {
    const filters = document.querySelectorAll('.d-filter-btn');
    if (!filters.length) return;
    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterType = btn.dataset.filter;

            let isOn = false;
            if (filterType === 'Zona Bencana') isOn = toggleKebencanaanZona();
            else if (filterType === 'Jalur Evakuasi') isOn = toggleKebencanaanJalur();
            else isOn = toggleKebencanaanPengungsian();
            btn.classList.toggle('active', isOn);
        });
    });

    // After kebencanaan loads, apply the currently active filter
    document.addEventListener('layerLoaded', (e) => {
        if (e.detail?.category === 'kebencanaan') {
            filters.forEach(btn => {
                if (btn.dataset.filter === 'Zona Bencana') btn.classList.add('active');
                else if (btn.dataset.filter === 'Tempat Pengungsian') btn.classList.add('active');
                else btn.classList.remove('active');
            });
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
