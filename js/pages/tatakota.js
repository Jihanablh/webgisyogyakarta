import { openDetailPanel } from '../detail-panel.js';
import { State } from '../state.js';

const CATS = [
    { key: 'pariwisata', label: 'Pariwisata' },
    { key: 'mobilitas', label: 'Mobilitas' },
    { key: 'kesehatan_darurat', label: 'Kesehatan' },
    { key: 'akademik', label: 'Pendidikan' },
    { key: 'atm_bank', label: 'Keuangan' },
    { key: 'kebutuhan', label: 'Kebutuhan' }
];

const UNSPLASH = {
    pariwisata: 'photo-1584810359583-96fc3448beaa',
    mobilitas: 'photo-1570125909232-e0963dc1758e',
    kesehatan_darurat: 'photo-1519494026892-80bbd2d6fd0d',
    akademik: 'photo-1523050854058-8df90110c9f1',
    atm_bank: 'photo-1563013544-824ae1b704d3',
    kebutuhan: 'photo-1555529669-e69e7aa0ba9a'
};

const PLACES = {
    pariwisata: [
        { name: 'Candi Prambanan', sub: 'Candi & Budaya', addr: 'Bokoharjo, Prambanan, Sleman', lat: -7.7520, lng: 110.4914, rating: 4.8 },
        { name: 'Malioboro', sub: 'Belanja & Kuliner', addr: 'Jalan Malioboro, Yogyakarta', lat: -7.7929, lng: 110.3658, rating: 4.6 },
        { name: 'Taman Sari', sub: 'Candi & Budaya', addr: 'Patehan, Kraton, Kota Yogyakarta', lat: -7.8067, lng: 110.3593, rating: 4.5 }
    ],
    mobilitas: [
        { name: 'Terminal Giwangan', sub: 'Terminal', addr: 'Jl. Imogiri Timur No.168', lat: -7.8333, lng: 110.3917, rating: 4.1 },
        { name: 'Stasiun Tugu', sub: 'Stasiun', addr: 'Jl. Pasar Kembang', lat: -7.7893, lng: 110.3636, rating: 4.4 },
        { name: 'Halte Malioboro 1', sub: 'Trans Jogja', addr: 'Jl. Malioboro', lat: -7.7931, lng: 110.3655, rating: 4.0 }
    ],
    kesehatan_darurat: [
        { name: 'RS Sardjito', sub: 'Rumah Sakit', addr: 'Jl. Kesehatan 1, Sekip', lat: -7.7684, lng: 110.3741, rating: 4.7 },
        { name: 'Puskesmas Gondokusuman', sub: 'Puskesmas', addr: 'Jl. Kolonel Sugiyono', lat: -7.7890, lng: 110.3780, rating: 4.2 }
    ],
    akademik: [
        { name: 'Universitas Gadjah Mada', sub: 'Universitas', addr: 'Bulaksumur, Sleman', lat: -7.7634, lng: 110.3784, rating: 4.9 },
        { name: 'Universitas Negeri Yogyakarta', sub: 'Universitas', addr: 'Karangmalang, Sleman', lat: -7.7747, lng: 110.3889, rating: 4.5 }
    ],
    atm_bank: [
        { name: 'Kantor Bank BNI DIY', sub: 'Bank', addr: 'Jl. Panembahan Senopati', lat: -7.7970, lng: 110.3702, rating: 4.0 },
        { name: 'ATM Center Malioboro', sub: 'ATM', addr: 'Malioboro', lat: -7.7925, lng: 110.3660, rating: 3.9 }
    ],
    kebutuhan: [
        { name: 'Pasar Beringharjo', sub: 'Pasar Tradisional', addr: 'Jl. Margo Mulyo', lat: -7.7955, lng: 110.3645, rating: 4.3 },
        { name: 'Gudeg Yu Djum', sub: 'Kuliner', addr: 'Jl. Wijilan', lat: -7.8065, lng: 110.3605, rating: 4.7 }
    ]
};

let _activeCat = 'pariwisata';

function imgUrl(cat) {
    const id = UNSPLASH[cat] || UNSPLASH.pariwisata;
    return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&h=360&q=80`;
}

function buildFeature(cat, row) {
    return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [row.lng, row.lat] },
        properties: {
            name: row.name,
            subcategory: row.sub,
            alamat: row.addr,
            address: row.addr,
            rating: row.rating,
            pengunjung: 1200 + Math.floor(Math.random() * 4000),
            opening_hours: '08.00–20.00',
            htm: 'Rp 15.000 – Rp 50.000',
            deskripsi: 'Titik layanan publik di wilayah DIY — data tampilan contoh untuk direktori Tata Kelola.',
            foto: imgUrl(cat)
        }
    };
}

function renderGrid(root, cat) {
    const list = PLACES[cat] || PLACES.pariwisata;
    const grid = document.createElement('div');
    grid.className = 'tatakota-grid';
    list.forEach((row, i) => {
        const card = document.createElement('article');
        card.className = 'tatakota-card tw-opacity-0 tw-translate-y-6 tw-transition-all tw-duration-500 tw-ease-out';
        card.style.transitionDelay = `${i * 70}ms`;
        card.innerHTML = `
            <div class="tatakota-card-photo" style="background-image:url('${imgUrl(cat)}')"></div>
            <div class="tatakota-card-body">
                <h3 class="tatakota-card-title">${row.name}</h3>
                <span class="tatakota-card-sub">${row.sub}</span>
                <p class="tatakota-card-addr">${row.addr}</p>
                <div class="tatakota-card-meta">
                    <span class="tatakota-stars">${'★'.repeat(Math.floor(row.rating))}${row.rating % 1 >= 0.5 ? '½' : ''}</span>
                    <span class="tatakota-rating-num">${row.rating.toFixed(1)}</span>
                </div>
                <div class="tatakota-card-actions">
                    <button type="button" class="tatakota-btn tatakota-btn--ghost js-detail">Detail</button>
                    <button type="button" class="tatakota-btn tatakota-btn--gold js-map">Lihat di peta</button>
                </div>
            </div>`;
        const feat = buildFeature(cat, row);
        card.querySelector('.js-detail').addEventListener('click', () => openDetailPanel(feat, cat));
        card.querySelector('.js-map').addEventListener('click', () => {
            document.querySelector('.top-nav-tab[data-page="map"]')?.click();
            if (State.map) {
                State.map.flyTo([row.lat, row.lng], 15, { duration: 1.4 });
            }
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
    const old = root.querySelector('.tatakota-grid');
    if (old) old.replaceWith(grid);
    else root.appendChild(grid);
}

export function initTataKotaPage() {
    const root = document.getElementById('tatakota-content');
    if (!root) return;

    root.innerHTML = `
        <div class="tatakota-hero tw-mb-8">
            <h1 class="tatakota-page-title">Tata Kelola Wilayah</h1>
            <p class="tatakota-page-lead">Direktori fasilitas publik DIY dengan filter kategori. Data kartu bersifat demonstrasi; peta tetap memuat layer GeoJSON asli.</p>
        </div>
        <div class="tatakota-spa-pills" id="tatakota-pills"></div>
        <div id="tatakota-grid-host"></div>`;

    const pills = root.querySelector('#tatakota-pills');
    const host = root.querySelector('#tatakota-grid-host');

    CATS.forEach((c, idx) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'tatakota-spa-pill' + (c.key === _activeCat ? ' is-active' : '');
        b.textContent = c.label;
        b.dataset.cat = c.key;
        b.style.transitionDelay = `${idx * 40}ms`;
        b.addEventListener('click', () => {
            _activeCat = c.key;
            pills.querySelectorAll('.tatakota-spa-pill').forEach(p => p.classList.toggle('is-active', p.dataset.cat === c.key));
            renderGrid(host, c.key);
        });
        pills.appendChild(b);
    });

    renderGrid(host, _activeCat);
}
