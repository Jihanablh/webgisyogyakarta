import { openDetailPanel } from '../detail-panel.js';
import { State, CATEGORIES } from '../state.js';

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

function cardImageUrl(catKey, name) {
    const bank = PHOTO_BANK[catKey] || PHOTO_BANK.pariwisata;
    const id = bank[hashPick(`${catKey}|${name}`, bank.length)];
    return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=520&h=320&q=82`;
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

export function initTataKotaPage() {
    const root = document.getElementById('tatakota-content');
    if (!root) return;

    root.innerHTML = `
        <div class="tatakota-rail">
            <header class="tatakota-rail-head">
                <h1 class="tatakota-rail-title">Tata Kelola</h1>
                <p class="tatakota-rail-lead">Semua fitur dari GeoJSON per kategori. Pilih filter atau muat lebih banyak kartu.</p>
            </header>
            <div class="tatakota-spa-pills" id="tatakota-pills"></div>
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
        _visibleCount += 48;
        renderGrid(host);
    });

    renderGrid(host);
}

function renderGrid(host) {
    const all = collectFeatures(_activeCat);
    const slice = all.slice(0, _visibleCount);
    const grid = document.createElement('div');
    grid.className = 'tatakota-grid';

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
        const img = cardImageUrl(cat, name);

        const card = document.createElement('article');
        card.className = 'tatakota-card tw-opacity-0 tw-translate-y-5 tw-transition-all tw-duration-500';
        card.innerHTML = `
            <div class="tatakota-card-photo" style="background-image:url('${img}')"></div>
            <div class="tatakota-card-body">
                <h3 class="tatakota-card-title">${esc(name)}</h3>
                <span class="tatakota-card-sub">${esc(sub)}</span>
                <p class="tatakota-card-addr">${esc(addr)}</p>
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

        card.querySelector('.js-detail').addEventListener('click', (e) => {
            e.stopPropagation();
            openDetailPanel(feat, cat);
        });
        card.querySelector('.js-map').addEventListener('click', (e) => {
            e.stopPropagation();
            if (State.map) State.map.flyTo([lat, lng], 16, { duration: 1.2 });
        });
        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            openDetailPanel(feat, cat);
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
