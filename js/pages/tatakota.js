import { State, CATEGORIES } from '../state.js';
import { renderTataKotaDetailInto } from './tatakota-detail.js';

const TATA_KEYS = ['pariwisata', 'mobilitas', 'kesehatan_darurat', 'akademik', 'atm_bank', 'sosial_tugas'];
const CATEGORY_CARDS = [
    { key: 'pariwisata', title: 'Pariwisata', desc: 'Destinasi, budaya, dan rekreasi kota' },
    { key: 'mobilitas', title: 'Mobilitas', desc: 'Terminal, stasiun, akses transportasi' },
    { key: 'kesehatan_darurat', title: 'Kesehatan', desc: 'Rumah sakit, klinik, layanan darurat' },
    { key: 'akademik', title: 'Pendidikan', desc: 'Kampus, sekolah, pusat pembelajaran' },
    { key: 'atm_bank', title: 'Keuangan', desc: 'ATM, bank, layanan transaksi' },
    { key: 'sosial_tugas', title: 'Pemerintahan', desc: 'Layanan publik dan fasilitas sosial' }
];

const PHOTO_BANK = {
    pariwisata: ['landmark-yogyakarta', 'candi-prambanan,yogyakarta', 'malioboro,jogja'],
    mobilitas: ['transport-hub-jogja', 'train-station-yogyakarta', 'terminal-jogja'],
    kesehatan_darurat: ['hospital-yogyakarta', 'emergency-clinic-jogja', 'medical-center-indonesia'],
    akademik: ['university-yogyakarta', 'campus-jogja', 'education-institute-indonesia'],
    atm_bank: ['bank-branch-yogyakarta', 'atm-machine-indonesia', 'finance-office-jogja'],
    sosial_tugas: ['government-office-yogyakarta', 'public-service-office-jogja', 'city-hall-yogyakarta']
};
const LOCATION_IMAGE_MAP = new Map([
    ['candi prambanan', 'candi-prambanan,yogyakarta'],
    ['malioboro', 'malioboro,jogja'],
    ['kraton yogyakarta', 'kraton-yogyakarta-palace'],
    ['tugu yogyakarta', 'tugu-jogja-monument'],
    ['stasiun tugu', 'stasiun-tugu-yogyakarta'],
    ['rsup dr sardjito', 'hospital-yogyakarta-sardjito']
]);

function hashPick(str, mod) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h % mod;
}

function normalizeName(v) {
    return String(v || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
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
    const n = normalizeName(name);
    const mapped = LOCATION_IMAGE_MAP.get(n);
    const bank = PHOTO_BANK[catKey] || PHOTO_BANK.pariwisata;
    const query = mapped || bank[hashPick(`${catKey}|${name}`, bank.length)];
    return `https://source.unsplash.com/featured/800x500?${encodeURIComponent(query)}`;
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

function openSingleMapPage(name, lat, lng) {
    const id = `single-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
    sessionStorage.setItem(`singleMap:${id}`, JSON.stringify({ name, lat, lng }));
    window.open(`${location.pathname}#map/single/${encodeURIComponent(id)}`, '_blank', 'noopener,noreferrer');
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

let _activeCat = null;
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

    if (!_activeCat) {
        root.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Tata Kelola</h1>
            <p class="page-subtitle">Pilih kategori utama untuk melihat daftar lokasi secara terfokus.</p>
        </div>
        <div id="tatakota-category-grid" class="tatakota-category-grid"></div>`;
        const catGrid = root.querySelector('#tatakota-category-grid');
        CATEGORY_CARDS.forEach((c) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'tatakota-category-card';
            card.innerHTML = `<h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p>`;
            card.addEventListener('click', () => {
                _activeCat = c.key;
                _visibleCount = 24;
                initTataKotaPage();
            });
            catGrid.appendChild(card);
        });
        return;
    }

    root.innerHTML = `
        <div class="tatakota-rail">
            <header class="page-header tatakota-rail-head">
                <h1 class="page-title">Tata Kelola</h1>
                <p class="page-subtitle">Kategori aktif: ${esc(CATEGORIES[_activeCat]?.label || _activeCat)}</p>
            </header>
            <div class="tatakota-spa-pills">
                <button type="button" class="tatakota-btn tatakota-btn--ghost" id="tatakota-back-cats">← Kembali ke kategori</button>
            </div>
            <div id="tatakota-counter" class="tatakota-counter" aria-live="polite"></div>
            <div id="tatakota-grid-host"></div>
            <button type="button" class="tatakota-loadmore" id="tatakota-loadmore">Tampilkan semua data</button>
        </div>`;

    const host = root.querySelector('#tatakota-grid-host');
    const loadMore = root.querySelector('#tatakota-loadmore');
    root.querySelector('#tatakota-back-cats')?.addEventListener('click', () => {
        _activeCat = null;
        history.pushState(null, '', '#tatakota');
        initTataKotaPage();
    });

    loadMore.addEventListener('click', () => {
        _visibleCount = 50_000;
        renderGrid(host);
    });

    renderGrid(host);
}

function renderGrid(host) {
    const all = collectFeatures(_activeCat || 'all');
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
            openSingleMapPage(name, lat, lng);
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
