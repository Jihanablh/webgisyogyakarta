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
        const mapOnlyIds = ['category-tabs','basemap-toggle','risk-legend',
                            'coord-display','disaster-sub-tabs','sidebar-open-btn'];

        // Hide all spa-pages
        document.querySelectorAll('.spa-page').forEach(el => el.classList.add('hidden'));
        const mapEl = document.getElementById('map');
        
        const isMapView = (to === 'map' || to === 'tatakota');

        if (!isMapView) {
            if (mapEl) mapEl.classList.add('hidden');
        } else {
            if (mapEl) mapEl.classList.remove('hidden');
        }

        if (isMapView) {
            // Show map-only elements
            mapOnlyIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = '';
            });
            // Except sidebar which is only for map (Kebencanaan)
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.style.display = (to === 'map') ? '' : 'none';
        } else {
            // Hide map-only elements so they don't float over SPA pages
            mapOnlyIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
            // Also close detail panel if open
            const dp = document.getElementById('detail-panel');
            if (dp) dp.classList.remove('open');
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.style.display = 'none';
        }

        if (from && this.routes[from]?.onLeave) this.routes[from].onLeave();
        if (this.routes[to]?.onEnter) this.routes[to].onEnter();

        const target = isMapView ? document.getElementById('map') : document.getElementById(`${to}-page`);
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
    }
}
