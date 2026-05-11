import os

def slice_file(lines, start, end):
    return "".join(lines[start-1:end])

def main():
    os.makedirs('js/utils', exist_ok=True)
    os.makedirs('js/pages', exist_ok=True)
    
    with open('app.js', 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    # 1. State / Config (lines 11-31, plus State object)
    state_js = """export const CONFIG = {
    center: [-7.7956, 110.3695],
    zoom: 12,
    minZoom: 10,
    maxZoom: 18,
    tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
};

export const CATEGORIES = {
    kebencanaan:        { label: 'Kebencanaan',         icon: '🌋', color: '#dc2626', file: 'data/kebencanaan.geojson' },
    lingkungan:         { label: 'Lingkungan',          icon: '🌿', color: '#16a34a', file: 'data/lingkungan.geojson' },
    pariwisata:         { label: 'Pariwisata & Keramaian', icon: '🏛️', color: '#e11d48', file: 'data/pariwisata.geojson' },
    tempat_tinggal:     { label: 'Tempat Tinggal',      icon: '🏠', color: '#8b5cf6', file: 'data/tempat_tinggal.geojson' },
    kebutuhan:          { label: 'Kebutuhan',           icon: '🛒', color: '#f59e0b', file: 'data/kebutuhan.geojson' },
    atm_bank:           { label: 'ATM & Bank',          icon: '🏦', color: '#10b981', file: 'data/atm_bank.geojson' },
    sosial_tugas:       { label: 'Sosial & Tugas',      icon: '🍽️', color: '#f43f5e', file: 'data/sosial_tugas.geojson' },
    akademik:           { label: 'Pusat Akademik',      icon: '🎓', color: '#3b82f6', file: 'data/akademik.geojson' },
    kesehatan_darurat:  { label: 'Kesehatan & Darurat', icon: '🏥', color: '#ef4444', file: 'data/kesehatan_darurat.geojson' },
    mobilitas:          { label: 'Mobilitas',           icon: '🚌', color: '#06b6d4', file: 'data/mobilitas.geojson' },
};

export const State = {
    map: null,
    activeCategory: 'kebencanaan',
    layerCache: {},
    rawGeojsonCache: {},
    searchIndex: [],
    searchMarker: null,
    markerClusterGroup: null
};
"""
    with open('js/state.js', 'w', encoding='utf-8') as f:
        f.write(state_js)

    # 2. utils/helpers.js
    helpers_js = """export function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

export function toRad(d) { return d * Math.PI / 180; }

export function formatDistance(km) {
    if (km < 1) return (km * 1000).toFixed(0) + ' m';
    return km.toFixed(1) + ' km';
}

export function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
}

export function getFeatureCenter(feature) {
    if (feature.geometry.type === 'Point') {
        return [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
    }
    if (feature.geometry.type === 'Polygon') {
        let lats = 0, lngs = 0, count = 0;
        feature.geometry.coordinates[0].forEach(coord => {
            lngs += coord[0]; lats += coord[1]; count++;
        });
        return [lats/count, lngs/count];
    }
    if (feature.geometry.type === 'MultiPolygon') {
        return [feature.geometry.coordinates[0][0][0][1], feature.geometry.coordinates[0][0][0][0]];
    }
    return [-7.7956, 110.3695];
}
"""
    with open('js/utils/helpers.js', 'w', encoding='utf-8') as f:
        f.write(helpers_js)
        
    # 3. utils/worker.js
    worker_js = """self.onmessage = function(e) {
  const { url } = e.data;
  fetch(url)
    .then(r => r.json())
    .then(data => self.postMessage({ data }))
    .catch(err => self.postMessage({ error: err.message }));
};
"""
    with open('js/utils/worker.js', 'w', encoding='utf-8') as f:
        f.write(worker_js)
        
    # 4. utils/loader.js
    loader_js = """export class LoadingManager {
  constructor(total) {
    this.total = total;
    this.loaded = 0;
    this.bar = document.getElementById('loading-bar');
    this.label = document.getElementById('loading-label');
  }

  tick(labelStr) {
    this.loaded++;
    const pct = (this.loaded / this.total) * 100;
    if(this.bar) this.bar.style.width = pct + '%';
    if(this.label) this.label.textContent = `Memuat ${labelStr}...`;
    if (this.loaded === this.total) this.complete();
  }

  complete() {
    setTimeout(() => {
      const el = document.getElementById('loading-overlay');
      if(el) el.classList.add('hidden');
    }, 300);
  }
}

export async function loadLargeGeoJSON(url, onChunk) {
  const response = await fetch(url);
  const data = await response.json();
  const features = data.features;
  const CHUNK_SIZE = 200;

  for (let i = 0; i < features.length; i += CHUNK_SIZE) {
    const chunk = features.slice(i, i + CHUNK_SIZE);
    onChunk(chunk);
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}
"""
    with open('js/utils/loader.js', 'w', encoding='utf-8') as f:
        f.write(loader_js)
        
    # 5. utils/router.js
    router_js = """export class Router {
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
"""
    with open('js/utils/router.js', 'w', encoding='utf-8') as f:
        f.write(router_js)
        
    print("Core utils written.")

if __name__ == '__main__':
    main()
