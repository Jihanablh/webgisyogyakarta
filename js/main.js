import { initMap } from './map.js';
import { loadLayer } from './layers.js';
import { initSidebar } from './sidebar.js';
import { initDetailPanel } from './detail-panel.js';
import { Router } from './utils/router.js';
import { LoadingManager } from './utils/loader.js';
import { initReportPage } from './pages/report.js';
import { initStatisticsPage } from './pages/statistics.js';
import { initAboutPage } from './pages/about.js';
import { State, CATEGORIES } from './state.js';

// Setup globals just in case legacy functions still need them
window.State = State;
window.CATEGORIES = CATEGORIES;

async function init() {
  const map = initMap();
  const router = new Router();
  const loader = new LoadingManager(6);

  router.register('map', {});
  router.register('laporan', { onEnter: () => initReportPage() });
  router.register('statistik', { onEnter: () => initStatisticsPage() });
  router.register('tentang', { onEnter: () => initAboutPage() });

  initSidebar({ map, router, onCategoryToggle: (cat) => loadLayer(cat, map) });
  initDetailPanel();

  // Load kebencanaan pertama
  await loadLayer('kebencanaan', map);
  loader.tick('Kebencanaan');

  // Load sisanya paralel
  const others = ['pariwisata', 'kebutuhan', 'atm_bank', 'tempat_tinggal', 'lingkungan'];
  await Promise.all(others.map(async (cat) => {
    await loadLayer(cat, map);
    loader.tick(CATEGORIES[cat].label);
  }));

  const appEl = document.getElementById('app');
  if (appEl) appEl.classList.remove('hidden');

  // Handle SPA routing from tabs
  document.querySelectorAll('.top-nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
          router.navigate(e.target.dataset.page);
      });
  });

  // Dismiss welcome overlay
  const welcomeBtn = document.getElementById('welcome-btn');
  if (welcomeBtn) {
      welcomeBtn.addEventListener('click', () => {
          document.getElementById('welcome-overlay').classList.add('hidden');
          document.getElementById('top-nav').style.display = 'flex';
          document.getElementById('sidebar').classList.remove('sidebar--hidden');
      });
  }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
