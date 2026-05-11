export class Router {
  constructor() {
    this.routes = {};
    this.current = 'map';
  }

  register(name, { onEnter, onLeave }) {
    this.routes[name] = { onEnter, onLeave };
  }

  navigate(to) {
    const from = this.current;
    if (from === to) return;

    document.querySelectorAll('.spa-page, #map').forEach(el => {
      if(el) el.classList.add('hidden');
    });

    if(this.routes[from]?.onLeave) this.routes[from].onLeave();
    if(this.routes[to]?.onEnter) this.routes[to].onEnter();

    const target = document.getElementById(to === 'map' ? 'map' : `${to}-page`);
    if(target) {
        target.classList.remove('hidden');
        target.classList.add('page-enter');
        setTimeout(() => target.classList.remove('page-enter'), 300);
    }

    document.querySelectorAll('.top-nav-tab').forEach(btn => {
      if(btn.dataset.page === to) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    this.current = to;
  }
}
