import { State, CATEGORIES, CONFIG } from '../state.js';
import { renderTataKotaDetailInto } from './tatakota-detail.js';

const TATA_KEYS = [
    'pariwisata', 'mobilitas', 'kesehatan_darurat', 'akademik', 'atm_bank',
    'kebutuhan', 'tempat_tinggal', 'sosial_tugas', 'lingkungan'
];

const PHOTO_BANK = {
    pariwisata: ['photo-1584810359583-96fc3448beaa', 'photo-1548013146-72479768bada', 'photo-1566073771259-6a8506099945'],
    mobilitas: ['photo-1570125909232-e0963dc1758e', 'photo-1558618666-fcd25c85cd64', 'photo-1449824913935-59a10b8d2000'],
    kesehatan_darurat: ['photo-1519494026892-80bbd2d6fd0d', 'photo-1576091160399-112ba8d25d1d', 'photo-1586773860416-d37aa17d6e2d'],
    akademik: ['photo-1523050854058-8df90110c9f1', 'photo-1523240795612-9a054b055db6', 'photo-1509062522246-94559798e544'],
    atm_bank: ['photo-1563013544-824ae1b704d3', 'photo-1554224155-6726b3ff858f', 'photo-1579621970563-ebec7560ff3e'],
    kebutuhan: ['photo-1555529669-e69e7aa0ba9a', 'photo-1533777857889-4d38cbfc3113', 'photo-1542838132-92c53300491e'],
    tempat_tinggal: ['photo-1566073771259-6a8506099945', 'photo-1520250497591-112f2f40a3f4', 'photo-1566665797739-1674de7a421a'],
    sosial_tugas: ['photo-1450101499163-a353f31ffcc4', 'photo-1544027993-37dbfe43562a', 'photo-1517248135467-4c7edcad34c4'],
    lingkungan: ['photo-1448375240586-882707db888b', 'photo-1470071459604-3b5ec3a0fe12', 'photo-1500530855697-b586d89ba3ee']
};

function hashPick(str, mod) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h % mod;
}

export function stableTataKotaId(cat, name, lng, lat) {
    const s = `${cat}|${name}|${lng}|${lat}`;
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return `tk${h.toString(36)}`;
}

function cardImageUrl(catKey, name, props) {
    const foto = props.foto || props.photo || props.image;
    if (typeof foto === 'string' && /^https?:\/\//i.test(foto)) {
        return foto;
    }
    const bank = PHOTO_BANK[catKey] || PHOTO_BANK.pariwisata;
    const id = bank[hashPick(`${catKey}|${name}`, bank.length)];
    return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=520&h=320&q=82`;
}

function propsSummaryHtml(props) {
    const rows = Object.entries(props).filter(
        ([k, v]) => typeof v === 'string' || typeof v === 'number'
    );
    return rows
        .slice(0, 6)
        .map(([k, v]) => `<div><strong>${esc(k)}:</strong> ${esc(String(v).slice(0, 80))}</div>`)
        .join('');
}

function parseDetailIdFromHash() {
    const m = /^#tatakota\/detail\/(.+)$/.exec(location.hash);
    return m ? decodeURIComponent(m[1]) : null;
}

function showEmbedMapModal(name, lat, lng) {
    const existing = document.getElementById('tatakota-embed-modal');
    if (existing) existing.remove();
    const wrap = document.createElement('div');
    wrap.id = 'tatakota-embed-modal';
    wrap.className = 'tatakota-embed-modal';
    wrap.innerHTML = `
        <div class="tatakota-embed-modal__backdrop" data-close="1"></div>
        <div class="tatakota-embed-modal__card" role="dialog" aria-modal="true" aria-label="Peta lokasi">
            <div class="tatakota-embed-modal__head">
                <strong class="tatakota-embed-modal__title">${esc(name)}</strong>
                <button type="button" class="tatakota-embed-modal__x" data-close="1" aria-label="Tutup">×</button>
            </div>
            <div id="tatakota-embed-modal-map" class="tatakota-embed-modal__map"></div>
        </div>`;
    document.body.appendChild(wrap);

    const close = () => wrap.remove();
    wrap.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', close));

    const mapDiv = wrap.querySelector('#tatakota-embed-modal-map');
    if (mapDiv && typeof L !== 'undefined') {
        const tile = L.tileLayer(CONFIG.tileUrl, {
            attribution: CONFIG.tileAttribution,
            maxZoom: 19
        });
        const map = L.map(mapDiv, { zoomControl: true, scrollWheelZoom: true }).setView([lat, lng], 15);
        tile.addTo(map);
        L.marker([lat, lng]).bindPopup(esc(name)).addTo(map);
        setTimeout(() => map.invalidateSize(), 80);
    }
}

function openTataKotaDetail(feat, cat) {
    const featCopy = JSON.parse(JSON.stringify(feat));
    const props = featCopy.properties || {};
    const name = props.name || props.nama || 'Lokasi';
    let lat = -7.7956;
    let lng = 110.3695;
    if (featCopy.geometry?.type === 'Point') {
        lng = featCopy.geometry.coordinates[0];
        lat = featCopy.geometry.coordinates[1];
    } else if (featCopy.geometry?.type === 'Polygon' && featCopy.geometry.coordinates?.[0]?.length) {
        const ring = featCopy.geometry.coordinates[0];
        let sx = 0;
        let sy = 0;
        ring.forEach(([x, y]) => {
            sx += x;
            sy += y;
        });
        lng = sx / ring.length;
        lat = sy / ring.length;
    }
    const id = stableTataKotaId(cat, name, lng, lat);
    try {
        sessionStorage.setItem(`tatakotaDetail:${id}`, JSON.stringify({ cat, feature: featCopy }));
    } catch (e) {
        console.warn('sessionStorage penuh atau ditolak', e);
    }
    const h = `#tatakota/detail/${encodeURIComponent(id)}`;
    if (location.hash !== h) {
        history.pushState(null, '', h);
    }
    initTataKotaPage();
}

function collectFeatures(activeCat) {
    const out = [];
    const keys = activeCat === 'all' ? TATA_KEYS : [activeCat];
    keys.forEach((k) => {
        const raw = State.rawGeojsonCache[k];
        if (!raw) return;
        raw.forEach((f) => {
            out.push({ feature: f, cat: k });
        });
    });
    return out;
}

let _activeCat = 'all';
let _visibleCount = 24;
let _hashListenerBound = false;

function bindHashOnce() {
    if (_hashListenerBound) return;
    _hashListenerBound = true;
    window.addEventListener('hashchange', () => {
        const page = document.getElementById('tatakota-page');
        if (!page || page.classList.contains('hidden')) return;
        initTataKotaPage();
    });
}

export function initTataKotaPage() {
    const root = document.getElementById('tatakota-content');
    if (!root) return;
    bindHashOnce();

    const detailId = parseDetailIdFromHash();
    if (detailId) {
        renderTataKotaDetailInto(root, detailId, {
            onBack: () => {
                history.pushState(null, '', '#tatakota');
                initTataKotaPage();
            }
        });
        return;
    }

    root.innerHTML = `
        <div class="tatakota-rail">
            <header class="tatakota-rail-head">
                <h1 class="tatakota-rail-title">Tata Kelola</h1>
                <p class="tatakota-rail-lead">Data GeoJSON per kategori. Detail dibuka di halaman ini; peta utama tidak digunakan.</p>
            </header>
            <div class="tatakota-spa-pills" id="tatakota-pills"></div>
            <div id="tatakota-counter" class="tatakota-counter" aria-live="polite"></div>
            <div id="tatakota-grid-host"></div>
            <button type="button" class="tatakota-loadmore" id="tatakota-loadmore">Tampilkan semua data</button>
        </div>`;

    const pills = root.querySelector('#tatakota-pills');
    const host = root.querySelector('#tatakota-grid-host');
    const loadMore = root.querySelector('#tatakota-loadmore');

    const pillDefs = [{ key: 'all', label: 'Semua' }, ...TATA_KEYS.map((k) => ({ key: k, label: CATEGORIES[k]?.label || k }))];

    pillDefs.forEach((c, idx) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'tatakota-spa-pill' + (c.key === _activeCat ? ' is-active' : '');
        b.textContent = c.label;
        b.dataset.cat = c.key;
        b.style.transitionDelay = `${idx * 25}ms`;
        b.addEventListener('click', () => {
            _activeCat = c.key;
            _visibleCount = 24;
            pills.querySelectorAll('.tatakota-spa-pill').forEach((p) => p.classList.toggle('is-active', p.dataset.cat === c.key));
            renderGrid(host);
        });
        pills.appendChild(b);
    });

    loadMore.addEventListener('click', () => {
        _visibleCount = 50_000;
        renderGrid(host);
    });

    renderGrid(host);
}

function renderGrid(host) {
    const all = collectFeatures(_activeCat);
    const slice = all.slice(0, _visibleCount);
    const grid = document.createElement('div');
    grid.className = 'tatakota-grid';

    const counterEl = document.getElementById('tatakota-counter');
    if (counterEl) {
        counterEl.textContent = `Menampilkan ${slice.length} dari ${all.length} lokasi`;
    }

    slice.forEach(({ feature, cat }) => {
        const props = feature.properties || {};
        const name = props.name || props.nama || 'Lokasi';
        const sub = props.subcategory || props.type || CATEGORIES[cat]?.label || '';
        const addr = props.alamat || props.address || 'DI Yogyakarta';
        let lat = -7.7956;
        let lng = 110.3695;
        if (feature.geometry?.type === 'Point') {
            lng = feature.geometry.coordinates[0];
            lat = feature.geometry.coordinates[1];
        }

        const rating = Number(props.rating) || 4.2 + hashPick(name, 8) / 10;
        const img = cardImageUrl(cat, name, props);
        const propsBlock = propsSummaryHtml(props);

        const card = document.createElement('article');
        card.className = 'tatakota-card tw-opacity-0 tw-translate-y-5 tw-transition-all tw-duration-500';
        const safeImg = String(img).replace(/"/g, '&quot;').replace(/'/g, '%27');
        card.innerHTML = `
            <div class="tatakota-card-photo" style="background-image:url('${safeImg}')"></div>
            <div class="tatakota-card-body">
                <h3 class="tatakota-card-title">${esc(name)}</h3>
                <span class="tatakota-card-sub">${esc(sub)}</span>
                <p class="tatakota-card-addr">${esc(addr)}</p>
                <div class="tatakota-card-props">${propsBlock}</div>
                <div class="tatakota-card-meta">
                    <span class="tatakota-rating-num">${rating.toFixed(1)} ★</span>
                </div>
                <div class="tatakota-card-actions">
                    <button type="button" class="tatakota-btn tatakota-btn--ghost js-detail">Detail</button>
                    <button type="button" class="tatakota-btn tatakota-btn--gold js-map">Di peta</button>
                </div>
            </div>`;

        const feat = JSON.parse(JSON.stringify(feature));
        if (!feat.properties) feat.properties = {};
        if (!feat.properties.foto) feat.properties.foto = img;

        const open = () => openTataKotaDetail(feat, cat);

        card.querySelector('.js-detail').addEventListener('click', (e) => {
            e.stopPropagation();
            open();
        });
        card.querySelector('.js-map').addEventListener('click', (e) => {
            e.stopPropagation();
            showEmbedMapModal(name, lat, lng);
        });
        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            open();
        });

        grid.appendChild(card);
        requestAnimationFrame(() => {
            card.classList.add('tw-opacity-100', 'tw-translate-y-0');
        });
    });

    const old = host.querySelector('.tatakota-grid');
    if (old) old.replaceWith(grid);
    else host.appendChild(grid);

    const loadBtn = document.getElementById('tatakota-loadmore');
    if (loadBtn) loadBtn.style.display = all.length > _visibleCount ? 'block' : 'none';
}

function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
