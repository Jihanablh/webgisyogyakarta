import { initMap } from './map.js';
import { loadLayer, showOnlyKebencanaan } from './layers.js';
import { initSidebar } from './sidebar.js';
import { initDetailPanel } from './detail-panel.js';
import { Router } from './utils/router.js';
import { LoadingManager } from './utils/loader.js';
import { initReportPage }     from './pages/report.js';
import { initStatisticsPage } from './pages/statistics.js';
import { initAboutPage }      from './pages/about.js';
import { initTataKotaPage }   from './pages/tatakota.js';
import { State, CATEGORIES, CONFIG }  from './state.js';
import { CHATBOT_DB, ChatbotEngine } from './chatbot-db.js';
import { buildGeoKnowledgeIndex } from './geo-index.js';
import { initBgm, tryResumeBgmFromWelcomeGesture } from './bgm.js';
import { initWelcomeCinematic } from './welcome-cinematic.js';

window.State = State;
window.CATEGORIES = CATEGORIES;

async function init() {
    const sp = new URLSearchParams(window.location.search);
    const legacyId = sp.get('tatakotaId');
    if (sp.get('view') === 'detail' && legacyId) {
        const h = `${location.pathname}#tatakota/detail/${encodeURIComponent(legacyId)}`;
        history.replaceState(null, '', h);
    }

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

            // Route using the generic router
            router.navigate(page);

            if (page === 'map') {
                document.getElementById('map-top-left-chrome')?.classList.remove('hidden');
                showOnlyKebencanaan();
                if (State.map) setTimeout(() => State.map.invalidateSize(), 50);
            } else {
                document.getElementById('map-top-left-chrome')?.classList.add('hidden');
            }
        });
    });

    initSidebar({ map, router, onCategoryToggle: (cat) => loadLayer(cat) });
    initDetailPanel();
    initBgm();
    initWelcomeCinematic();
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
            document.getElementById('map-top-left-chrome')?.classList.remove('hidden');
            showOnlyKebencanaan();
            document.getElementById('risk-legend')?.classList.remove('hidden');
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

    // ── Basemap + zoom (single stack, top-right) ─────────────────────────────
    const basemaps = {
        dark: L.tileLayer(CONFIG.tileUrl, {
            attribution: CONFIG.tileAttribution,
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
    function switchBasemap(key) {
        const layer = basemaps[key];
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

    document.getElementById('map-zoom-in')?.addEventListener('click', () => {
        State.map?.zoomIn(0.5);
    });
    document.getElementById('map-zoom-out')?.addEventListener('click', () => {
        State.map?.zoomOut(0.5);
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
    const chatBack = document.getElementById('chatbot-back');
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
