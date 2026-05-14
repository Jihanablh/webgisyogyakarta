import { State, CATEGORIES } from '../state.js';
import { renderTataKotaDetailInto } from './tatakota-detail.js';
import { showCategoryMap } from './spa-map.js';

const TATA_KEYS = ['pariwisata', 'mobilitas', 'kesehatan_darurat', 'akademik', 'atm_bank', 'sosial_tugas'];

const CATEGORY_CARDS = [
    { key: 'pariwisata',        title: 'Pariwisata',    desc: 'Destinasi, budaya, dan rekreasi kota',         icon: '🏛️', gradient: 'from-amber-900/60 to-amber-700/30' },
    { key: 'mobilitas',         title: 'Mobilitas',     desc: 'Terminal, stasiun, akses transportasi',         icon: '🚌', gradient: 'from-cyan-900/60 to-cyan-700/30' },
    { key: 'kesehatan_darurat', title: 'Kesehatan',     desc: 'Rumah sakit, klinik, layanan darurat',          icon: '🏥', gradient: 'from-rose-900/60 to-rose-700/30' },
    { key: 'akademik',          title: 'Pendidikan',    desc: 'Kampus, sekolah, pusat pembelajaran',           icon: '🎓', gradient: 'from-violet-900/60 to-violet-700/30' },
    { key: 'atm_bank',          title: 'Keuangan',      desc: 'ATM, bank, layanan transaksi',                  icon: '🏦', gradient: 'from-emerald-900/60 to-emerald-700/30' },
    { key: 'sosial_tugas',      title: 'Pemerintahan',  desc: 'Layanan publik dan fasilitas sosial',           icon: '🏢', gradient: 'from-blue-900/60 to-blue-700/30' }
];

// Mapping spesifik nama → Picsum seed (konsisten setiap refresh)
const LOCATION_IMAGE_MAP = new Map([
    ['candi prambanan',          '1029'],
    ['malioboro',                '1015'],
    ['kraton yogyakarta',        '1018'],
    ['tugu yogyakarta',          '1025'],
    ['stasiun tugu',             '1043'],
    ['stasiun lempuyangan',      '1056'],
    ['rsup dr sardjito',         '1072'],
    ['pku muhammadiyah',         '1081'],
    ['ugm',                      '1091'],
    ['universitas gadjah mada',  '1091'],
    ['uny',                      '1098'],
    ['universitas negeri yogyakarta', '1098'],
    ['uii',                      '1103'],
    ['pantai parangtritis',      '1040'],
    ['pantai baron',             '1044'],
    ['goa pindul',               '1050'],
    ['gunung merapi',            '1060'],
    ['candi borobudur',          '1065'],
    ['keraton',                  '1018'],
    ['alun-alun',                '1022'],
]);

// Seed per kategori (fallback)
const CATEGORY_SEEDS = {
    pariwisata:        [1015, 1018, 1025, 1029, 1040, 1044],
    mobilitas:         [1043, 1056, 1070, 1075, 1080, 1085],
    kesehatan_darurat: [1072, 1081, 1090, 1095, 1100, 1105],
    akademik:          [1091, 1098, 1103, 1110, 1115, 1120],
    atm_bank:          [1130, 1135, 1140, 1145, 1150, 1155],
    sosial_tugas:      [1160, 1165, 1170, 1175, 1180, 1185],
};

function hashPick(str, mod) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h % mod;
}

function normalizeName(v) {
    return String(v || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function stableTataKotaId(cat, name, lng, lat) {
    const s = `${cat}|${name}|${lng}|${lat}`;
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return `tk${h.toString(36)}`;
}

function cardImageUrl(catKey, name) {
    const n = normalizeName(name);
    // Check exact match
    const mapped = LOCATION_IMAGE_MAP.get(n);
    if (mapped) return `https://picsum.photos/seed/${mapped}/800/500`;
    // Check partial match
    for (const [key, seed] of LOCATION_IMAGE_MAP) {
        if (n.includes(key) || key.includes(n.split(' ')[0])) {
            return `https://picsum.photos/seed/${seed}/800/500`;
        }
    }
    // Fallback: category seed
    const seeds = CATEGORY_SEEDS[catKey] || CATEGORY_SEEDS.pariwisata;
    const seed = seeds[hashPick(`${catKey}|${name}`, seeds.length)];
    return `https://picsum.photos/seed/${seed}/800/500`;
}

function parseDetailIdFromHash() {
    const m = /^#tatakota\/detail\/(.+)$/.exec(location.hash);
    return m ? decodeURIComponent(m[1]) : null;
}

function getCoords(feature) {
    let lat = -7.7956, lng = 110.3695;
    if (feature.geometry?.type === 'Point') {
        lng = feature.geometry.coordinates[0];
        lat = feature.geometry.coordinates[1];
    } else if (feature.geometry?.type === 'Polygon' && feature.geometry.coordinates?.[0]?.length) {
        const ring = feature.geometry.coordinates[0];
        let sx = 0, sy = 0;
        ring.forEach(([x, y]) => { sx += x; sy += y; });
        lng = sx / ring.length;
        lat = sy / ring.length;
    }
    return { lat, lng };
}

function openTataKotaDetail(feat, cat) {
    const featCopy = JSON.parse(JSON.stringify(feat));
    const props = featCopy.properties || {};
    const name = props.name || props.nama || 'Lokasi';
    const { lat, lng } = getCoords(featCopy);
    const id = stableTataKotaId(cat, name, lng, lat);
    try {
        sessionStorage.setItem(`tatakotaDetail:${id}`, JSON.stringify({ cat, feature: featCopy }));
    } catch (e) {
        console.warn('sessionStorage penuh:', e);
    }
    const h = `#tatakota/detail/${encodeURIComponent(id)}`;
    if (location.hash !== h) history.pushState(null, '', h);
    initTataKotaPage();
}

function collectFeatures(activeCat) {
    const out = [];
    const keys = activeCat === 'all' ? TATA_KEYS : [activeCat];
    keys.forEach(k => {
        const raw = State.rawGeojsonCache[k];
        if (!raw) return;
        raw.forEach(f => out.push({ feature: f, cat: k }));
    });
    return out;
}

let _activeCat        = null;
let _visibleCount     = 24;
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
        _renderCategoryGrid(root);
        return;
    }

    _renderCardList(root);
}

// ── Category selection grid ────────────────────────────────────────────────────
function _renderCategoryGrid(root) {
    root.innerHTML = `
    <div class="tw-max-w-[1120px] tw-mx-auto tw-px-4 tw-py-6">
        <div class="tw-mb-8 tw-pb-6 tw-border-b tw-border-white/10">
            <h1 class="tw-font-display tw-text-[clamp(24px,3.5vw,38px)] tw-font-extrabold tw-text-slate-100 tw-tracking-tight tw-mb-2">Tata Kelola</h1>
            <p class="tw-font-ui tw-text-sm tw-text-slate-400">Pilih kategori untuk melihat daftar lokasi secara terfokus.</p>
        </div>
        <div id="tatakota-category-grid" class="tw-grid tw-grid-cols-2 md:tw-grid-cols-3 tw-gap-4"></div>
    </div>`;

    const catGrid = root.querySelector('#tatakota-category-grid');
    CATEGORY_CARDS.forEach((c, idx) => {
        const count = State.rawGeojsonCache[c.key]?.length || 0;
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'tatakota-category-card tw-group tw-relative tw-overflow-hidden tw-text-left tw-p-5 tw-rounded-2xl tw-border tw-border-white/8 tw-bg-slate-900/80 tw-backdrop-blur-sm tw-transition-all tw-duration-300 hover:tw-scale-105 hover:tw-shadow-xl hover:tw-border-amber-500/30 tw-opacity-0 tw-translate-y-4';
        card.style.transitionDelay = `${idx * 60}ms`;
        card.innerHTML = `
            <div class="tw-absolute tw-inset-0 tw-bg-gradient-to-br ${c.gradient} tw-opacity-0 tw-transition-opacity tw-duration-300 group-hover:tw-opacity-100"></div>
            <div class="tw-relative tw-z-10">
                <div class="tw-mb-3 tw-text-2xl">${c.icon}</div>
                <h3 class="tw-font-display tw-text-base tw-font-bold tw-text-slate-100 tw-mb-1">${esc(c.title)}</h3>
                <p class="tw-font-ui tw-text-xs tw-text-slate-400 tw-leading-relaxed tw-mb-3">${esc(c.desc)}</p>
                ${count ? `<span class="tw-inline-flex tw-items-center tw-px-2 tw-py-0.5 tw-rounded-full tw-bg-amber-500/15 tw-text-amber-400 tw-text-[10px] tw-font-mono tw-font-semibold">${count.toLocaleString()} lokasi</span>` : ''}
            </div>`;
        card.addEventListener('click', () => {
            _activeCat = c.key;
            _visibleCount = 24;
            initTataKotaPage();
        });
        catGrid.appendChild(card);
        // Stagger entrance
        requestAnimationFrame(() => {
            setTimeout(() => {
                card.classList.remove('tw-opacity-0', 'tw-translate-y-4');
                card.classList.add('tw-opacity-100', 'tw-translate-y-0');
            }, idx * 60 + 50);
        });
    });
}

// ── Card list per category ─────────────────────────────────────────────────────
function _renderCardList(root) {
    const catInfo = CATEGORY_CARDS.find(c => c.key === _activeCat);
    const catColor = CATEGORIES[_activeCat]?.color || '#d4a017';

    root.innerHTML = `
    <div class="tw-max-w-[1120px] tw-mx-auto tw-px-4 tw-py-6">
        <div class="tw-mb-6 tw-pb-6 tw-border-b tw-border-white/10">
            <div class="tw-flex tw-items-center tw-gap-3 tw-mb-4">
                <button type="button" id="tatakota-back-cats"
                    class="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-xl tw-border tw-border-amber-500/50 tw-text-amber-400 hover:tw-bg-amber-500/10 tw-text-xs tw-font-semibold tw-transition-all tw-duration-200 tw-font-ui">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    Kembali ke Kategori
                </button>
                <button type="button" id="tatakota-btn-lihat-peta"
                    class="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-xl tw-bg-amber-500/15 tw-text-amber-400 hover:tw-bg-amber-500/25 tw-border tw-border-amber-500/30 tw-text-xs tw-font-semibold tw-transition-all tw-duration-200 tw-font-ui">
                    Lihat Semua di Peta
                </button>
            </div>
            <h1 class="tw-font-display tw-text-[clamp(22px,3vw,32px)] tw-font-extrabold tw-text-slate-100 tw-tracking-tight tw-mb-1">Tata Kelola</h1>
            <p class="tw-font-ui tw-text-sm tw-text-slate-400">Kategori: <span class="tw-text-amber-400 tw-font-semibold">${esc(catInfo?.title || _activeCat)}</span></p>
        </div>
        <div id="tatakota-counter" class="tw-font-mono tw-text-xs tw-text-slate-500 tw-mb-4" aria-live="polite"></div>
        <div id="tatakota-grid-host" class="tatakota-grid"></div>
        <button type="button" id="tatakota-loadmore"
            class="tw-mt-6 tw-w-full tw-py-3 tw-rounded-xl tw-border tw-border-amber-500/30 tw-text-amber-400 hover:tw-bg-amber-500/10 tw-text-sm tw-font-semibold tw-transition-all tw-duration-200 tw-font-ui" style="display:none">
            Tampilkan semua data
        </button>
    </div>`;

    root.querySelector('#tatakota-back-cats')?.addEventListener('click', () => {
        _activeCat = null;
        history.pushState(null, '', '#tatakota');
        initTataKotaPage();
    });

    root.querySelector('#tatakota-btn-lihat-peta')?.addEventListener('click', () => {
        const features = collectFeatures(_activeCat).map(x => x.feature);
        const tatakoPage = document.getElementById('tatakota-page');
        if (tatakoPage) tatakoPage.classList.add('hidden');
        showCategoryMap(catInfo?.title || _activeCat, features, catColor, 'tatakota-page');
    });

    root.querySelector('#tatakota-loadmore')?.addEventListener('click', () => {
        _visibleCount = 50_000;
        _renderGrid(root);
    });

    _renderGrid(root);
}

function _renderGrid(root) {
    const host = root.querySelector('#tatakota-grid-host');
    if (!host) return;

    const all   = collectFeatures(_activeCat || 'all');
    const slice = all.slice(0, _visibleCount);

    const counterEl = root.querySelector('#tatakota-counter');
    if (counterEl) counterEl.textContent = `Menampilkan ${slice.length} dari ${all.length} lokasi`;

    const grid = document.createElement('div');
    grid.className = 'tatakota-grid';

    slice.forEach(({ feature, cat }, cardIdx) => {
        const props = feature.properties || {};
        const name  = props.name || props.nama || 'Lokasi';
        const sub   = props.subcategory || props.type || CATEGORIES[cat]?.label || '';
        const addr  = props.alamat || props.address || 'DI Yogyakarta';
        const { lat, lng } = getCoords(feature);
        const img   = cardImageUrl(cat, name);
        const catColor = CATEGORIES[cat]?.color || '#d4a017';

        const card = document.createElement('article');
        card.className = 'tatakota-card tw-opacity-0 tw-translate-y-5 tw-transition-all tw-duration-500';
        const safeImg = String(img).replace(/"/g, '&quot;').replace(/'/g, '%27');
        card.innerHTML = `
            <div class="tatakota-card-photo" style="background-image:url('${safeImg}')"></div>
            <div class="tatakota-card-body">
                <h3 class="tatakota-card-title">${esc(name)}</h3>
                <span class="tatakota-card-sub">${esc(sub)}</span>
                <p class="tatakota-card-addr">${esc(addr)}</p>
                <div class="tatakota-card-actions">
                    <button type="button" class="tatakota-btn tatakota-btn--ghost js-detail">Detail</button>
                    <button type="button" class="tatakota-btn tatakota-btn--ghost js-map" style="color:${catColor};border-color:${catColor}44">Lihat di Peta</button>
                </div>
            </div>`;

        const feat = JSON.parse(JSON.stringify(feature));
        if (!feat.properties) feat.properties = {};
        if (!feat.properties.foto) feat.properties.foto = img;

        card.querySelector('.js-detail')?.addEventListener('click', (e) => {
            e.stopPropagation();
            openTataKotaDetail(feat, cat);
        });
        card.querySelector('.js-map')?.addEventListener('click', (e) => {
            e.stopPropagation();
            // SPA page swap — bukan window.open
            const tatakoPage = document.getElementById('tatakota-page');
            if (tatakoPage) tatakoPage.classList.add('hidden');
            import('./spa-map.js').then(({ showSingleMarkerMap }) => {
                showSingleMarkerMap(name, lat, lng, 'tatakota-page');
            });
        });
        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            openTataKotaDetail(feat, cat);
        });

        grid.appendChild(card);
        // Stagger entrance animation
        requestAnimationFrame(() => {
            setTimeout(() => {
                card.classList.remove('tw-opacity-0', 'tw-translate-y-5');
                card.classList.add('tw-opacity-100', 'tw-translate-y-0');
            }, Math.min(cardIdx * 30, 600));
        });
    });

    const old = host.querySelector('.tatakota-grid');
    if (old) old.replaceWith(grid);
    else host.appendChild(grid);

    const loadBtn = root.querySelector('#tatakota-loadmore');
    if (loadBtn) loadBtn.style.display = all.length > _visibleCount ? 'block' : 'none';
}

function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
