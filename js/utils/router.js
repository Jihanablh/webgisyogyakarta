export class Router {
    constructor() {
        this.routes  = {};
        this.current = null;
    }

    register(name, options = {}) {
        this.routes[name] = options;
    }

    navigate(to) {
        const from = this.current;

        // Elements that only make sense on the map view
        const mapOnlyIds = ['category-tabs','map-controls-stack','risk-legend',
                            'coord-display','disaster-sub-tabs','sidebar-open-btn'];

        // Hide SPA full pages (tatakota is a map overlay — un-hidden below)
        document.querySelectorAll('.spa-page').forEach((el) => {
            if (to === 'tatakota' && el.id === 'tatakota-page') return;
            el.classList.add('hidden');
        });
        const mapEl = document.getElementById('map');
        
        const isHybridMap = to === 'map' || to === 'tatakota';

        if (!isHybridMap) {
            if (mapEl) mapEl.classList.add('hidden');
        } else {
            if (mapEl) mapEl.classList.remove('hidden');
        }

        if (isHybridMap) {
            // Show map-only elements
            mapOnlyIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = '';
            });
            if (to === 'map') {
                document.getElementById('risk-legend')?.classList.remove('hidden');
            } else {
                document.getElementById('risk-legend')?.classList.add('hidden');
            }
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.style.display = to === 'tatakota' ? 'none' : '';
        } else {
            // Hide map-only elements so they don't float over SPA pages
            mapOnlyIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
            document.getElementById('risk-legend')?.classList.add('hidden');
            // Also close detail panel if open
            const dp = document.getElementById('detail-panel');
            if (dp) dp.classList.remove('open');
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.style.display = 'none';
        }

        const tatakotaPage = document.getElementById('tatakota-page');
        if (tatakotaPage) {
            tatakotaPage.classList.toggle('tatakota-on-map', to === 'tatakota');
        }
        if (this.routes[to]?.onEnter) this.routes[to].onEnter();

        const target =
            to === 'map'
                ? document.getElementById('map')
                : to === 'tatakota'
                    ? document.getElementById('tatakota-page')
                    : document.getElementById(`${to}-page`);
        if (target) {
            target.classList.remove('page-enter');
            target.classList.remove('hidden');
            void target.offsetHeight; // force reflow
            target.classList.add('page-enter');
            setTimeout(() => target.classList.remove('page-enter'), 350);
        }

        // Update active nav tab
        document.querySelectorAll('.top-nav-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === to);
        });

        this.current = to;

        if ((to === 'map' || to === 'tatakota') && typeof window !== 'undefined' && window.State?.map) {
            setTimeout(() => {
                try {
                    window.State.map.invalidateSize();
                } catch (_) { /* ignore */ }
            }, 200);
        }
    }
}
