import { initMap } from './map.js';
import { loadLayer, showOnlyKebencanaan } from './layers.js';
import { initSidebar } from './sidebar.js';
import { initDetailPanel } from './detail-panel.js';
import { Router } from './utils/router.js';
import { LoadingManager } from './utils/loader.js';
import { initReportPage } from './pages/report.js';
import { initStatisticsPage } from './pages/statistics.js';
import { initAboutPage } from './pages/about.js';
import { State, CATEGORIES } from './state.js';

window.State = State;
window.CATEGORIES = CATEGORIES;

async function init() {
    const map    = initMap();
    const router = new Router();
    const loader = new LoadingManager(6);

    // Register SPA routes
    router.register('map',       {});
    router.register('laporan',   { onEnter: () => initReportPage() });
    router.register('statistik', { onEnter: () => initStatisticsPage() });
    router.register('tentang',   { onEnter: () => initAboutPage() });

    // Nav tab click handling (Bug 5 fix)
    document.querySelectorAll('.top-nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.page;
            router.navigate(page);
            // Invalidate map size if switching back to map
            if (page === 'map' && State.map) {
                setTimeout(() => State.map.invalidateSize(), 50);
            }
        });
    });

    initSidebar({ map, router, onCategoryToggle: (cat) => loadLayer(cat) });
    initDetailPanel();

    // Load kebencanaan first (Bug 2 — start with disaster only)
    showOnlyKebencanaan();
    await loadLayer('kebencanaan');
    loader.tick('Kebencanaan');

    // Load others in parallel (hidden until user clicks "Tampilkan Semua")
    const others = ['pariwisata', 'kebutuhan', 'atm_bank', 'tempat_tinggal', 'lingkungan'];
    await Promise.all(others.map(async (cat) => {
        await loadLayer(cat);
        if (CATEGORIES[cat]) loader.tick(CATEGORIES[cat].label);
    }));

    // Welcome button handler (Bug 2)
    const welcomeBtn = document.getElementById('welcome-btn');
    if (welcomeBtn) {
        welcomeBtn.addEventListener('click', () => {
            document.getElementById('welcome-overlay').classList.add('hidden');
            document.getElementById('top-nav').style.display = 'flex';
            document.getElementById('sidebar').classList.remove('sidebar--hidden');
            // Only show kebencanaan on start
            showOnlyKebencanaan();
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
