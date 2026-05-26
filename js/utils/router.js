export class Router {
    constructor() {
        this.routes = {};
        this.current = null;
    }

    register(name, options = {}) {
        this.routes[name] = options;
    }

    navigate(to) {
        const mapOnlyIds = [
            'map-top-left-chrome',
            'map-right-stack',
            'kab-risk-info-panel',
            'coord-display',
            'disaster-sub-tabs'
        ];

        document.querySelectorAll('.spa-page').forEach((el) => {
            el.classList.add('hidden');
        });
        const mapEl = document.getElementById('map');

        const isMapView = to === 'map';

        if (!isMapView) {
            if (mapEl) mapEl.classList.add('hidden');
        } else {
            if (mapEl) mapEl.classList.remove('hidden');
        }

        if (isMapView) {
            mapOnlyIds.forEach((id) => {
                const el = document.getElementById(id);
                if (el) el.style.display = '';
            });
            document.getElementById('map-top-left-chrome')?.classList.remove('hidden');
            document.getElementById('map-right-stack')?.classList.remove('hidden');
            document.getElementById('risk-legend')?.classList.remove('hidden');
            document.getElementById('kab-risk-info-panel')?.classList.remove('hidden');
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.style.display = '';
        } else {
            mapOnlyIds.forEach((id) => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
            document.getElementById('chatbot-panel')?.classList.remove('chatbot-panel--open');
            document.getElementById('chatbot-backdrop')?.classList.remove('is-on');
            document.getElementById('risk-legend')?.classList.add('hidden');
            document.getElementById('kab-risk-info-panel')?.classList.add('hidden');
            const dp = document.getElementById('detail-panel');
            if (dp) dp.classList.remove('open');
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.style.display = 'none';
        }

        const target =
            to === 'map'
                ? document.getElementById('map')
                : document.getElementById(`${to}-page`);
        if (target) {
            target.classList.remove('page-enter');
            target.classList.remove('hidden');
            void target.offsetHeight;
            target.classList.add('page-enter');
            setTimeout(() => target.classList.remove('page-enter'), 350);
        }

        if (this.routes[to]?.onEnter) this.routes[to].onEnter();

        document.querySelectorAll('.top-nav-tab').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.page === to);
        });

        this.current = to;

        if (to === 'map' && typeof window !== 'undefined' && window.State?.map) {
            setTimeout(() => {
                try {
                    window.State.map.invalidateSize();
                } catch (_) {
                    /* ignore */
                }
            }, 200);
        }
    }
}
