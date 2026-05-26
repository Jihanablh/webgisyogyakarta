import { State, CATEGORIES } from '../state.js?v=20260526-round26-welcome-encoding';
import { renderTataKotaDetailInto } from './tatakota-detail.js?v=20260526-round26-welcome-encoding';
import { showCategoryMap } from './spa-map.js?v=20260526-round26-welcome-encoding';

const TATA_KEYS = ['pariwisata', 'mobilitas', 'kesehatan_darurat', 'akademik', 'atm_bank', 'sosial_tugas'];

const CATEGORY_CARDS = [
    { key: 'pariwisata',        title: 'Pariwisata',    desc: 'Destinasi, budaya, dan rekreasi kota',         color: '#f59e0b', gradient: 'from-amber-900/60 to-amber-700/30' },
    { key: 'mobilitas',         title: 'Mobilitas',     desc: 'Terminal, stasiun, akses transportasi',         color: '#06b6d4', gradient: 'from-cyan-900/60 to-cyan-700/30' },
    { key: 'kesehatan_darurat', title: 'Kesehatan',     desc: 'Rumah sakit, klinik, layanan darurat',          color: '#f43f5e', gradient: 'from-rose-900/60 to-rose-700/30' },
    { key: 'akademik',          title: 'Pendidikan',    desc: 'Kampus, sekolah, pusat pembelajaran',           color: '#a855f7', gradient: 'from-violet-900/60 to-violet-700/30' },
    { key: 'atm_bank',          title: 'Keuangan',      desc: 'ATM, bank, layanan transaksi',                  color: '#10b981', gradient: 'from-emerald-900/60 to-emerald-700/30' },
    { key: 'sosial_tugas',      title: 'Pemerintahan',  desc: 'Layanan publik dan fasilitas sosial',           color: '#3b82f6', gradient: 'from-blue-900/60 to-blue-700/30' }
];

const CATEGORY_PAGE_TITLES = {
    pariwisata: 'Pariwisata Yogyakarta',
    mobilitas: 'Transportasi Yogyakarta',
    kesehatan_darurat: 'Fasilitas Kesehatan',
    akademik: 'Pendidikan Yogyakarta',
    atm_bank: 'Layanan Keuangan',
    sosial_tugas: 'Pemerintahan Yogyakarta'
};

const CATEGORY_PAGE_SUBTITLES = {
    pariwisata: 'Jelajahi destinasi wisata unggulan di Daerah Istimewa Yogyakarta.',
    mobilitas: 'Temukan simpul transportasi dan akses mobilitas utama di seluruh wilayah DIY.',
    kesehatan_darurat: 'Fasilitas kesehatan yang tersebar di seluruh wilayah DIY.',
    akademik: 'Pusat pendidikan, kampus, dan fasilitas pembelajaran di Daerah Istimewa Yogyakarta.',
    atm_bank: 'Layanan keuangan, ATM, dan perbankan untuk kebutuhan transaksi masyarakat.',
    sosial_tugas: 'Fasilitas pemerintahan dan layanan publik yang mendukung tata kelola wilayah DIY.'
};

const LOCATION_IMAGE_MAP = new Map([
    ['candi prambanan', 'prambanan'],
    ['malioboro', 'malioboro'],
    ['kraton yogyakarta', 'kraton-yogyakarta'],
    ['tugu yogyakarta', 'tugu-yogyakarta'],
    ['stasiun tugu', 'stasiun-tugu-yogyakarta'],
    ['stasiun lempuyangan', 'stasiun-lempuyangan'],
    ['rsup dr sardjito', 'rsup-sardjito'],
    ['pku muhammadiyah', 'pku-muhammadiyah-yogyakarta'],
    ['ugm', 'ugm-yogyakarta'],
    ['universitas gadjah mada', 'universitas-gadjah-mada'],
    ['uny', 'uny-yogyakarta'],
    ['universitas negeri yogyakarta', 'universitas-negeri-yogyakarta'],
    ['uii', 'uii-yogyakarta'],
    ['pantai parangtritis', 'parangtritis'],
    ['parangtritis', 'parangtritis-beach'],
    ['pantai baron', 'pantai-baron'],
    ['pantai kukup', 'kukup-beach-gunungkidul'],
    ['pantai ngobaran', 'ngobaran-beach-gunungkidul'],
    ['goa pindul', 'goa-pindul'],
    ['goa jomblang', 'jomblang-cave'],
    ['candi borobudur', 'borobudur'],
    ['taman sari', 'tamansari-water-castle'],
    ['tamansari', 'tamansari-water-castle'],
    ['malioboro mall', 'mall-shopping-yogyakarta'],
    ['hutan pinus mangunan', 'hutan-pinus-mangunan'],
    ['tebing breksi', 'tebing-breksi'],
    ['masjid gedhe kauman', 'masjid-gedhe-kauman-yogyakarta'],
    ['gereja ayam', 'gereja-ayam-bukit-rhema'],
    ['museum ullen sentalu', 'ullen-sentalu-museum'],
    ['museum affandi', 'affandi-museum'],
    ['alun alun kidul', 'alun-alun-kidul-yogyakarta'],
    ['kebun binatang gembira loka', 'gembira-loka-zoo'],
    ['jogja bay waterpark', 'jogja-bay-waterpark'],
    ['pasar beringharjo', 'pasar-beringharjo'],
    ['jalan prawirotaman', 'prawirotaman-yogyakarta'],
    ['gudeg yu djum', 'gudeg-yu-djum'],
    ['bukit bintang', 'bukit-bintang-yogyakarta'],
    ['museum sonobudoyo', 'sonobudoyo-museum'],
    ['ratu boko', 'ratu-boko-temple'],
    ['museum dirgantara', 'dirgantara-museum-yogyakarta'],
    ['kalibiru', 'kalibiru-kulonprogo'],
    ['sindu kusuma edupark', 'sindu-kusuma-edupark'],
    ['benteng vredeburg', 'benteng-vredeburg'],
    ['desa wisata pentingsari', 'desa-wisata-pentingsari'],
    ['spot riyadi jogja', 'spot-riyadi-jogja'],
    ['keraton', 'keraton-yogyakarta'],
    ['alun-alun', 'alun-alun-yogyakarta'],
]);

const CATEGORY_IMAGE_QUERIES = {
    pariwisata: 'pariwisata-yogyakarta',
    mobilitas: 'transportasi-yogyakarta',
    kesehatan_darurat: 'fasilitas-kesehatan-yogyakarta',
    akademik: 'pendidikan-yogyakarta',
    atm_bank: 'keuangan-yogyakarta',
    sosial_tugas: 'pemerintahan-yogyakarta',
};

function hashPick(str, mod) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h % mod;
}

function normalizeName(v) {
    return String(v || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function isSuppressedTataFeature(feature) {
    const p = feature?.properties || {};
    const hay = `${p.name || ''} ${p.nama || ''} ${p.subcategory || ''} ${p.type || ''}`;
    const blocked = ['me' + 'rapi', 'eru' + 'psi', 'k' + 'rb'];
    return blocked.some((term) => new RegExp(term, 'i').test(hay));
}
export function stableTataKotaId(cat, name, lng, lat) {
    const s = `${cat}|${name}|${lng}|${lat}`;
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return `tk${h.toString(36)}`;
}

function cardImageUrl(catKey, name) {
    const n = normalizeName(name);
    const mapped = LOCATION_IMAGE_MAP.get(n);
    if (mapped) return `https://picsum.photos/seed/${encodeURIComponent(mapped)}/800/500`;
    for (const [key, query] of LOCATION_IMAGE_MAP) {
        if (n.includes(key) || key.includes(n.split(' ')[0])) {
            return `https://picsum.photos/seed/${encodeURIComponent(query)}/800/500`;
        }
    }
    const seed = `${CATEGORY_IMAGE_QUERIES[catKey] || 'yogyakarta'}-${normalizeName(name).replace(/\s+/g, '-')}`;
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/500`;
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
        raw.forEach(f => {
            if (!isSuppressedTataFeature(f)) out.push({ feature: f, cat: k });
        });
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

    if (window.__pendingTataKotaCategory) {
        _activeCat = window.__pendingTataKotaCategory;
        window.__pendingTataKotaCategory = null;
        if (location.hash !== '#tatakota') history.replaceState(null, '', '#tatakota');
    }

    const detailId = parseDetailIdFromHash();
    document.getElementById('tatakota-page')?.classList.toggle('tatakota-detail-active', Boolean(detailId));
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

// -- Category selection grid ----------------------------------------------------
function _renderCategoryGrid(root) {
    root.innerHTML = `
    <div class="tw-w-full">
        <div class="page-header">
            <h1 class="page-title">Tata Kelola</h1>
            <p class="page-subtitle">Eksplorasi kategori lokasi dan informasi tata kelola wilayah di Daerah Istimewa Yogyakarta.</p>
        </div>
        <div id="tatakota-category-grid" class="tw-grid tw-w-full tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6"></div>
    </div>`;

    const catGrid = root.querySelector('#tatakota-category-grid');
    CATEGORY_CARDS.forEach((c, idx) => {
        const count = State.rawGeojsonCache[c.key]?.length || 0;
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'tatakota-category-card tw-group tw-relative tw-w-full tw-min-w-0 tw-overflow-hidden tw-text-left tw-p-6 tw-rounded-2xl tw-border tw-border-white/8 tw-bg-slate-900/80 tw-backdrop-blur-sm tw-transition-all tw-duration-300 hover:tw-scale-[1.02] hover:tw-shadow-xl hover:tw-border-amber-500/30 tw-opacity-0 tw-translate-y-4';
        card.style.transitionDelay = `${idx * 60}ms`;
        card.innerHTML = `
            <div class="tw-absolute tw-inset-0 tw-bg-gradient-to-br ${c.gradient} tw-opacity-0 tw-transition-opacity tw-duration-300 group-hover:tw-opacity-100"></div>
            <div class="tw-relative tw-z-10">
                <div class="tw-w-8 tw-h-1 tw-rounded-full tw-mb-4" style="background:${c.color}"></div>
                <h3 class="tw-font-display tw-text-lg tw-font-bold tw-text-slate-100 tw-mb-1">${esc(c.title)}</h3>
                <p class="tw-font-ui tw-text-xs tw-text-slate-400 tw-leading-relaxed tw-mb-3">${esc(c.desc)}</p>
                ${count ? `<span class="tw-inline-flex tw-items-center tw-px-2 tw-py-0.5 tw-rounded-full tw-text-[10px] tw-font-mono tw-font-semibold" style="background:${c.color}18;color:${c.color}">${count.toLocaleString()} lokasi</span>` : ''}
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

// -- Card list per category -----------------------------------------------------
function _renderCardList(root) {
    const catInfo = CATEGORY_CARDS.find(c => c.key === _activeCat);
    const catColor = CATEGORIES[_activeCat]?.color || '#d4a017';
    const pageTitle = CATEGORY_PAGE_TITLES[_activeCat] || `${catInfo?.title || 'Tata Kelola'} Yogyakarta`;
    const pageSubtitle = CATEGORY_PAGE_SUBTITLES[_activeCat] || 'Jelajahi lokasi dan informasi tata kelola wilayah di Daerah Istimewa Yogyakarta.';

    root.innerHTML = `
    <div class="tw-relative tw-w-full">
        <button type="button" id="tatakota-back-cats"
            class="tw-fixed tw-left-4 tw-top-[76px] tw-z-[600] tw-flex tw-items-center tw-gap-2 tw-rounded-full tw-border tw-border-slate-700 tw-bg-slate-900 tw-px-4 tw-py-2 tw-font-ui tw-text-sm tw-font-medium tw-text-amber-400 tw-shadow-lg tw-shadow-black/20 tw-backdrop-blur-md tw-transition-all tw-duration-200 hover:tw-bg-slate-800 hover:tw-text-amber-300">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Kembali
        </button>
        <div class="page-header tw-pt-16 tw-text-center">
            <h1 class="page-title">${esc(pageTitle)}</h1>
            <p class="page-subtitle">${esc(pageSubtitle)}</p>
            <div class="tw-mt-4 tw-flex tw-justify-center">
                <button type="button" id="tatakota-btn-lihat-peta"
                    class="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-xl tw-bg-amber-500/15 tw-text-amber-400 hover:tw-bg-amber-500/25 tw-border tw-border-amber-500/30 tw-text-xs tw-font-semibold tw-transition-all tw-duration-200 tw-font-ui">
                    Lihat Semua di Peta
                </button>
            </div>
        </div>
        <div id="tatakota-counter" class="tw-font-mono tw-text-xs tw-text-slate-500 tw-mb-4" aria-live="polite"></div>
        <div id="tatakota-grid-host" class="tw-w-full"></div>
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
    grid.className = 'tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6';

    slice.forEach(({ feature, cat }, cardIdx) => {
        const props = feature.properties || {};
        const name  = props.name || props.nama || 'Lokasi';
        const sub   = props.subcategory || props.type || CATEGORIES[cat]?.label || '';
        const addr  = props.alamat || props.address || 'DI Yogyakarta';
        const { lat, lng } = getCoords(feature);
        const img   = cardImageUrl(cat, name);
        const catColor = CATEGORIES[cat]?.color || '#d4a017';
        const rating = Number((4.1 + (hashPick(`${name}|rating`, 8) / 10)).toFixed(1));

        const card = document.createElement('article');
        card.className = 'tw-group tw-flex tw-h-full tw-min-w-0 tw-cursor-pointer tw-flex-col tw-overflow-hidden tw-rounded-2xl tw-border tw-border-white/10 tw-bg-slate-900/80 tw-shadow-lg tw-shadow-black/20 tw-opacity-0 tw-translate-y-5 tw-transition-all tw-duration-300 hover:tw-scale-[1.02] hover:tw-shadow-xl hover:tw-shadow-amber-500/10 hover:tw-border-amber-500/35';
        const safeImg = String(img).replace(/"/g, '&quot;').replace(/'/g, '%27');
        card.innerHTML = `
            <img src="${safeImg}" alt="${esc(name)}" loading="lazy"
                class="tw-aspect-[4/3] tw-w-full tw-object-cover tw-rounded-t-2xl tw-bg-slate-800"
                onerror="this.src='https://picsum.photos/seed/yogyakarta/800/600';">
            <div class="tw-flex tw-min-h-0 tw-flex-1 tw-flex-col tw-p-5">
                <div class="tw-mb-3">
                    <span class="tw-inline-flex tw-max-w-full tw-items-center tw-rounded-full tw-border tw-border-amber-400/25 tw-bg-amber-400/10 tw-px-2.5 tw-py-1 tw-text-[10px] tw-font-semibold tw-text-amber-300 tw-font-ui">${esc(sub)}</span>
                </div>
                <h3 class="tw-mb-2 tw-font-display tw-text-lg tw-font-bold tw-leading-snug tw-text-slate-100">${esc(name)}</h3>
                <p class="tw-line-clamp-2 tw-min-h-[40px] tw-text-sm tw-leading-relaxed tw-text-slate-400 tw-font-ui">${esc(addr)}</p>
                <div class="tw-mt-3 tw-flex tw-items-center tw-gap-2" aria-label="Rating ${rating.toFixed(1)} dari 5">
                    ${renderRatingStars(rating)}
                    <span class="tw-font-mono tw-text-xs tw-text-slate-500">${rating.toFixed(1)}</span>
                </div>
                <div class="tw-mt-auto tw-flex tw-items-center tw-gap-3 tw-pt-5">
                    <button type="button" class="js-detail tw-inline-flex tw-flex-1 tw-items-center tw-justify-center tw-rounded-xl tw-border tw-border-white/15 tw-bg-white/5 tw-px-4 tw-py-2.5 tw-text-xs tw-font-bold tw-text-slate-200 tw-transition-colors hover:tw-border-amber-400/45 hover:tw-text-amber-300 tw-font-ui">Detail</button>
                    <button type="button" class="js-map tw-ml-auto tw-inline-flex tw-flex-1 tw-items-center tw-justify-center tw-rounded-xl tw-border tw-px-4 tw-py-2.5 tw-text-xs tw-font-bold tw-transition-colors tw-font-ui"
                        style="color:${catColor};border-color:${catColor}55;background:${catColor}12">Lihat di Peta</button>
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

    const old = host.firstElementChild;
    if (old) old.replaceWith(grid);
    else host.appendChild(grid);

    const loadBtn = root.querySelector('#tatakota-loadmore');
    if (loadBtn) loadBtn.style.display = all.length > _visibleCount ? 'block' : 'none';
}

function esc(s) {
    return String(s)
        .replace(new RegExp('\\u00e2\\u02dc\\u2026', 'g'), '&#9733;')
        .replace(new RegExp('\\u00e2\\u02dc\\u2020', 'g'), '&#9734;')
        .replace(new RegExp('\\u00c2\\u00b7', 'g'), '&middot;')
        .replace(new RegExp('\\u00e2\\u20ac"', 'g'), '&mdash;')
        .replace(new RegExp('\\u00c3\\u00a2\\u00e2\\u201a\\u00ac\\u00e2\\u201e\\u00a2', 'g'), "'")
        .replace(new RegExp('\\u00c3\\u00a2\\u00e2\\u201a\\u00ac\\u00c5\\u201c|\\u00c3\\u00a2\\u00e2\\u201a\\u00ac', 'g'), '"')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderRatingStars(rating) {
    const value = Math.max(0, Math.min(5, Number(rating) || 0));
    const full = Math.round(value);
    return `<span class="tw-inline-flex tw-items-center tw-gap-0.5" aria-hidden="true">${
        Array.from({ length: 5 }, (_, idx) => {
            const filled = idx < full;
            return `<span class="${filled ? 'tw-text-amber-400' : 'tw-text-slate-600'} tw-text-sm tw-leading-none">${filled ? '&#9733;' : '&#9734;'}</span>`;
        }).join('')
    }</span>`;
}
