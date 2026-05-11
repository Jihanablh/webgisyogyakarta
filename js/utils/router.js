export class Router {
    constructor() {
        this.routes  = {};
        this.current = null; // start null so first navigate always fires
    }

    register(name, options = {}) {
        this.routes[name] = options;
    }

    navigate(to) {
        const from = this.current;

        // Hide all pages and map
        document.querySelectorAll('.spa-page').forEach(el => el.classList.add('hidden'));
        const mapEl = document.getElementById('map');
        if (mapEl) mapEl.classList.add('hidden');

        // Sidebar visibility
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            if (to === 'map') {
                sidebar.style.display = '';
            } else {
                sidebar.style.display = 'none';
            }
        }

        if (from && this.routes[from]?.onLeave) this.routes[from].onLeave();
        if (this.routes[to]?.onEnter) this.routes[to].onEnter();

        const target = document.getElementById(to === 'map' ? 'map' : `${to}-page`);
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('page-enter');
            setTimeout(() => target.classList.remove('page-enter'), 350);
        }

        // Update active tab
        document.querySelectorAll('.top-nav-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === to);
        });

        this.current = to;
    }
}
