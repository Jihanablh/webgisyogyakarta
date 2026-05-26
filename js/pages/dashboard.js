import {
    DISASTER_2025_TOTAL,
    DISASTER_2025_PERIOD,
    dominantDisasterType,
    highestRegion,
    lowestRegion
} from '../disaster-2025.js?v=20260526-round26-welcome-encoding';

let _dashboardMap = null;

const local = {
    hero: 'pict/welcome-webgis.jpg',
    welcome: 'pict/welcome-webgis.jpg',
    candi: 'pict/candi.jpg',
    wayang: 'pict/wayang.jpg'
};
const chosen = {
    welcomeFallback: 'pict/welcome.jpg',
    heroFallback: 'pict/kota%20yogyakarta.jpg',
    prambanan: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=600&q=85',
    parangtritis: 'https://images.unsplash.com/photo-1592364395653-83e648b20cc2?w=600&q=85',
    malioboro: 'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?w=600&q=85',
    bukit: 'https://images.unsplash.com/photo-1592364395653-83e648b20cc2?w=1200&q=85',
    keraton: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=85'
};
const remote = (query, w = 900, h = 650) => `https://loremflickr.com/${w}/${h}/${encodeURIComponent(query)}`;
const fallback = (seed, w = 900, h = 650) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
const fmt = (n) => Number(n || 0).toLocaleString('id-ID');

export function initDashboardPage() {
    const root = document.getElementById('dashboard-content');
    if (!root) return;
    root.innerHTML = renderDashboard();
    bindDashboard(root);
    requestAnimationFrame(() => {
        hydrateDashboardMap();
        observeDashboard(root);
        initCounters(root);
    });
}

function renderDashboard() {
    const dominant = dominantDisasterType();
    const high = highestRegion();
    const low = lowestRegion();
    const thumbs = [
        ['Prambanan', chosen.prambanan, 'warisan budaya'],
        ['Wayang', local.wayang, 'denyut tradisi'],
        ['Pantai', chosen.parangtritis, 'pantai selatan'],
        ['Kota', chosen.malioboro, 'malioboro']
    ];
    const features = [
        ['Peta Interaktif', 'Layer risiko, pengungsian, dan batas wilayah dalam satu ruang baca spasial.'],
        ['Analisis Risiko', 'Klasifikasi risiko kabupaten/kota berdasarkan total kejadian bencana 2025.'],
        ['Data Pengungsian', 'Posko dan logistik ditampilkan sebagai titik informasi yang dapat ditelusuri.'],
        ['Laporan Historis', 'Narasi kejadian penting disusun sebagai riwayat yang mudah dibaca.'],
        ['Tata Kelola Kota', 'Kategori fasilitas wilayah membantu melihat konteks kota dan layanan publik.'],
        ['Asisten SIGAJOG', 'Chatbot lokal untuk menjawab pertanyaan kebencanaan dan informasi Jogja.']
    ];
    const categories = [
        ['pariwisata', 'Pariwisata', '2.184 lokasi', chosen.prambanan],
        ['kesehatan_darurat', 'Kesehatan', '642 lokasi', remote('hospital indonesia')],
        ['mobilitas', 'Mobilitas', '918 lokasi', remote('train station java')],
        ['akademik', 'Pendidikan', '1.306 lokasi', remote('university yogyakarta')],
        ['atm_bank', 'Keuangan', '1.074 lokasi', remote('bank indonesia')],
        ['sosial_tugas', 'Pemerintahan', '1.042 lokasi', remote('government building java')]
    ];
    const histories = [
        ['Cuaca Ekstrem Maret 2025', 'Maret 2025', 'Selesai', remote('extreme weather indonesia')],
        ['Longsor dan Tanah Ambles', '21 November 2025', 'Pemulihan', remote('landslide java')],
        ['Karhutla dan Gempa Terasa DIY', 'Desember 2025', 'Pemantauan', remote('forest fire smoke indonesia')]
    ];

    return `
        <div class="tw-bg-[#0a0f1e] tw-text-slate-100">
            <section class="tw-relative tw-min-h-screen tw-overflow-hidden">
                <img src="${local.hero}" alt="Tugu Yogyakarta" class="tw-absolute tw-inset-0 tw-h-full tw-w-full tw-object-cover tw-object-center" onerror="this.onerror=null;this.src='${chosen.heroFallback}'">
                <div class="tw-absolute tw-inset-0 tw-bg-gradient-to-b tw-from-black/20 tw-via-transparent tw-to-[#0a0f1e]"></div>
                <div class="dashboard-watermark tw-absolute tw-left-1/2 tw-top-20 tw-w-full -tw-translate-x-1/2 tw-text-center tw-font-ui tw-text-[12vw] tw-font-black tw-leading-none tw-tracking-[0.15em] tw-text-white/10">YOGYAKARTA</div>
                <div class="tw-relative tw-z-10 tw-flex tw-min-h-screen tw-flex-col tw-items-center tw-justify-center tw-px-6 tw-pt-24">
                    <div class="dashboard-reveal tw-text-center">
                        <div class="tw-font-ui tw-text-xs tw-font-bold tw-uppercase tw-tracking-[0.32em] tw-text-amber-300">Sistem Informasi Geografis</div>
                        <h1 class="dashboard-shimmer dashboard-hero-title tw-m-0 tw-mt-4 tw-font-display tw-font-black">JOGJA SIAGA</h1>
                        <p class="tw-mt-4 tw-font-body tw-text-xl tw-italic tw-text-slate-200">Daerah Istimewa Yogyakarta</p>
                        <p class="tw-mt-3 tw-font-ui tw-text-xs tw-font-semibold tw-uppercase tw-tracking-[0.28em] tw-text-amber-500/70">Hamemayu Hayuning Bawana</p>
                    </div>
                    <div class="dashboard-reveal tw-mt-12 tw-flex tw-w-full tw-max-w-5xl tw-flex-col tw-items-center tw-gap-6 lg:tw-flex-row lg:tw-justify-center" style="transition-delay:160ms">
                        <div class="tw-grid tw-grid-cols-2 tw-gap-4 sm:tw-grid-cols-4">
                            ${thumbs.map(([label, src, caption]) => thumb(label, src, caption)).join('')}
                        </div>
                        <button type="button" data-scroll-target="#dashboard-about" class="tw-min-w-[220px] tw-rounded-full tw-bg-white/90 tw-px-8 tw-py-3 tw-font-ui tw-text-sm tw-font-bold tw-text-slate-950 tw-transition-all tw-duration-300 hover:tw-bg-amber-400 active:tw-scale-95">Eksplorasi Sekarang</button>
                    </div>
                    <div class="dashboard-reveal tw-mt-10 tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-6 tw-font-ui tw-text-xs tw-text-slate-300" style="transition-delay:280ms">
                        <strong class="tw-font-mono tw-text-amber-400">7.166</strong><span>Lokasi</span>
                        <span class="tw-h-4 tw-w-px tw-bg-white/20"></span>
                        <strong class="tw-font-mono tw-text-amber-400">10</strong><span>Kategori</span>
                        <span class="tw-h-4 tw-w-px tw-bg-white/20"></span>
                        <strong class="tw-font-mono tw-text-amber-400">42</strong><span>Sub-Kategori</span>
                    </div>
                </div>
            </section>

            <section id="dashboard-about" class="dashboard-section tw-bg-[#0a0f1e] tw-px-6 tw-py-24 lg:tw-px-20">
                <div class="tw-mx-auto tw-max-w-7xl">
                    ${decorTitle('Tentang Jogja Siaga')}
                    <div class="tw-mt-12 tw-grid tw-grid-cols-1 tw-gap-12 lg:tw-grid-cols-2">
                        <div class="dashboard-child tw-space-y-8">
                            <p class="tw-font-body tw-text-base tw-leading-loose tw-text-slate-300">Jogja Siaga adalah WebGIS yang menyatukan data kebencanaan, tata kelola wilayah, posko pengungsian, dan laporan historis dalam satu pengalaman visual yang kuat. Sistem ini membantu membaca Yogyakarta sebagai ruang budaya sekaligus ruang kesiapsiagaan.</p>
                            <div class="tw-grid tw-gap-4">
                                ${['Peta risiko kabupaten/kota 2025', 'Data pengungsian dan logistik', 'Narasi laporan serta statistik interaktif'].map((t) => `<div class="tw-rounded-xl tw-border tw-border-amber-500/20 tw-bg-slate-800/40 tw-p-4 tw-font-ui tw-text-sm tw-font-semibold tw-text-amber-300">${t}</div>`).join('')}
                            </div>
                        </div>
                        <div class="dashboard-child tw-grid tw-grid-cols-1 tw-gap-6 md:tw-grid-cols-3">
                            ${overviewCard('01', 'Risiko Spasial', 'Peta choropleth dan layer pengungsian membantu membaca konsentrasi risiko kebencanaan DIY.')}
                            ${overviewCard('02', 'Fasilitas Publik', 'Data tata kelola menampilkan kategori lokasi penting, layanan kota, dan sebaran fasilitas wilayah.')}
                            ${overviewCard('03', 'Analisis Data', 'Statistik dan laporan 2025 menyajikan rekap kejadian, tren, serta narasi bencana utama.')}
                        </div>
                    </div>
                </div>
            </section>

            <section class="dashboard-section tw-bg-[#0a0f1e] tw-px-6 tw-py-20 lg:tw-px-20">
                <div class="tw-mx-auto tw-max-w-7xl">
                    ${decorTitle('Fitur Unggulan')}
                    <div class="tw-mt-12 tw-grid tw-grid-cols-1 tw-gap-5 md:tw-grid-cols-2 xl:tw-grid-cols-3">
                        ${features.map(([title, desc], i) => featureCard(title, desc, i)).join('')}
                    </div>
                </div>
            </section>

            <section class="dashboard-section tw-relative tw-overflow-hidden tw-px-6 tw-py-24 lg:tw-px-20">
                <img src="${local.candi}" alt="Borobudur" class="tw-absolute tw-inset-0 tw-h-full tw-w-full tw-object-cover tw-object-center" onerror="this.onerror=null;this.src='${chosen.prambanan}'">
                <div class="tw-absolute tw-inset-0 tw-bg-black/60"></div>
                <div class="tw-relative tw-z-10 tw-mx-auto tw-grid tw-max-w-7xl tw-grid-cols-1 tw-gap-5 lg:tw-grid-cols-[1.4fr_0.8fr]">
                    <div class="dashboard-child tw-group tw-relative tw-h-[560px] tw-overflow-hidden tw-rounded-3xl tw-border tw-border-white/20">
                        <img src="${local.candi}" alt="Candi" class="tw-h-full tw-w-full tw-object-cover tw-object-center tw-transition-all tw-duration-500 group-hover:tw-scale-105" onerror="this.onerror=null;this.src='${chosen.prambanan}'">
                        <figcaption class="tw-absolute tw-bottom-5 tw-left-5 tw-font-display tw-text-2xl tw-font-bold tw-text-white tw-opacity-0 tw-transition-opacity group-hover:tw-opacity-100">Borobudur Sunrise</figcaption>
                    </div>
                    <div class="tw-grid tw-gap-5">
                        ${gallerySmall('Pantai Selatan', chosen.bukit, local.candi)}
                        ${gallerySmall('Keraton', chosen.keraton, local.wayang)}
                    </div>
                </div>
                <h2 class="tw-pointer-events-none tw-absolute tw-left-1/2 tw-top-1/2 tw-z-20 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-text-center tw-font-display tw-text-5xl tw-font-extrabold tw-italic tw-text-white/90 lg:tw-text-7xl">Daerah Istimewa Yogyakarta</h2>
            </section>

            <section class="dashboard-section tw-relative tw-overflow-hidden tw-bg-[#0f1729] tw-px-6 tw-py-24 lg:tw-px-20">
                <div class="dashboard-batik tw-absolute tw-inset-0 tw-opacity-[0.08]"></div>
                <div class="tw-relative tw-mx-auto tw-grid tw-max-w-7xl tw-grid-cols-1 tw-gap-10 lg:tw-grid-cols-[1fr_0.9fr]">
                    <div>
                        ${decorTitle('Status Kebencanaan Terkini')}
                        <div class="tw-mt-10 tw-grid tw-grid-cols-1 tw-gap-5 sm:tw-grid-cols-2">
                            ${kpiCard('Total Kejadian 2025', DISASTER_2025_TOTAL, fmt(DISASTER_2025_TOTAL))}
                            ${kpiCard('Risiko Tertinggi', 558, 'Kulon Progo')}
                            ${kpiCard('Risiko Terendah', 80, 'Sleman')}
                            ${kpiCard('Bencana Dominan', 765, 'Tanah Longsor')}
                        </div>
                        <div class="tw-mt-6 tw-grid tw-gap-4 md:tw-grid-cols-2">
                            <div class="tw-rounded-2xl tw-border tw-border-red-500/30 tw-bg-red-950/35 tw-p-5 tw-text-red-200 tw-animate-pulse"><strong class="tw-font-display tw-text-2xl">Kulon Progo Sangat Tinggi</strong><p class="tw-mt-2 tw-text-sm tw-text-red-100/70">Wilayah dengan akumulasi kejadian bencana tertinggi pada 2025.</p></div>
                            <div class="tw-rounded-2xl tw-border tw-border-amber-500/25 tw-bg-amber-950/20 tw-p-5 tw-text-amber-200"><strong class="tw-font-display tw-text-2xl">Cuaca DIY Waspada</strong><p class="tw-mt-2 tw-text-sm tw-text-amber-100/70">Hujan dan angin perlu dipantau pada musim basah.</p></div>
                        </div>
                    </div>
                    <div class="tw-self-center">
                        <button type="button" data-go-page="map" class="tw-block tw-h-[430px] tw-w-full tw-overflow-hidden tw-rounded-3xl tw-border tw-border-amber-500/20 tw-bg-slate-900 tw-p-0 tw-shadow-2xl tw-shadow-black/40">
                            <div id="dashboard-mini-map" class="tw-h-full tw-w-full"></div>
                        </button>
                        <button type="button" data-go-page="map" class="tw-mt-5 tw-w-full tw-rounded-full tw-bg-amber-500 tw-px-6 tw-py-3 tw-font-ui tw-text-sm tw-font-bold tw-text-slate-950 hover:tw-bg-amber-400">Lihat Peta Lengkap</button>
                    </div>
                </div>
            </section>

            <section class="dashboard-section tw-bg-[#0a0f1e] tw-px-6 tw-py-24 lg:tw-px-20">
                <div class="tw-mx-auto tw-grid tw-max-w-7xl tw-grid-cols-1 tw-gap-8 lg:tw-grid-cols-[1.7fr_0.9fr]">
                    <div>
                        <div class="tw-mb-8 tw-flex tw-items-center tw-justify-between">
                            ${decorTitle('Riwayat Bencana')}
                            <button type="button" data-go-page="laporan" class="tw-rounded-full tw-border tw-border-amber-500/40 tw-px-5 tw-py-2.5 tw-font-ui tw-text-sm tw-font-bold tw-text-amber-400 hover:tw-bg-amber-500/10">Lihat Semua Laporan</button>
                        </div>
                        <div class="tw-grid tw-grid-cols-1 tw-gap-5 md:tw-grid-cols-3">
                            ${histories.map(([title, date, status, src], i) => historyCard(title, date, status, src, i)).join('')}
                        </div>
                    </div>
                    <div class="tw-rounded-3xl tw-border tw-border-amber-500/20 tw-bg-slate-900/80 tw-p-6">
                        <div class="tw-font-ui tw-text-xs tw-font-bold tw-uppercase tw-tracking-[0.24em] tw-text-amber-400">SIGAJOG</div>
                        <h3 class="tw-mt-3 tw-font-display tw-text-3xl tw-font-bold tw-text-white">Asisten Kebencanaan</h3>
                        <div class="tw-mt-6 tw-space-y-3">
                            <div class="tw-max-w-[86%] tw-rounded-2xl tw-bg-slate-800 tw-p-3 tw-text-sm tw-text-slate-300">Apa wilayah dengan risiko tertinggi?</div>
                            <div class="tw-ml-auto tw-max-w-[86%] tw-rounded-2xl tw-bg-amber-500 tw-p-3 tw-text-sm tw-font-semibold tw-text-slate-950">Kulon Progo, 558 kejadian pada 2025.</div>
                            <div class="tw-max-w-[86%] tw-rounded-2xl tw-bg-slate-800 tw-p-3 tw-text-sm tw-text-slate-300">Buka detail peta dan laporan?</div>
                        </div>
                        <button type="button" id="dashboard-chatbot-btn" class="tw-mt-6 tw-w-full tw-rounded-full tw-bg-amber-500 tw-py-3 tw-font-ui tw-text-sm tw-font-bold tw-text-slate-950 hover:tw-bg-amber-400">Mulai Bertanya</button>
                    </div>
                </div>
            </section>

            <section class="dashboard-section tw-bg-[#0f1729] tw-px-6 tw-py-20 lg:tw-px-20">
                <div class="tw-mx-auto tw-max-w-7xl">
                    ${decorTitle('Tata Kelola Wilayah')}
                    <div class="tw-mt-10 tw-grid tw-grid-cols-1 tw-gap-5 md:tw-grid-cols-2 xl:tw-grid-cols-3">
                        ${categories.map(([key, title, count, src], i) => categoryCard(key, title, count, src, i)).join('')}
                    </div>
                </div>
            </section>

            <footer class="tw-bg-[#080d19] tw-px-6 tw-py-10 lg:tw-px-20">
                <div class="tw-mx-auto tw-max-w-7xl tw-border-t tw-border-amber-500/35 tw-pt-6 tw-font-ui tw-text-xs tw-text-slate-500">
                    <div class="tw-flex tw-flex-col tw-gap-4 md:tw-flex-row md:tw-items-center md:tw-justify-between">
                        <span>Data: BPBD DIY, OpenStreetMap, GADM v4.1 - Jihan Nabilah Rahman - 2025</span>
                        <div class="tw-flex tw-gap-4">
                            ${['map','tatakota','laporan','statistik','tentang'].map((p) => `<button type="button" data-go-page="${p}" class="tw-text-slate-400 hover:tw-text-amber-400">${p}</button>`).join('')}
                        </div>
                    </div>
                </div>
            </footer>
            <div class="tw-fixed tw-bottom-6 tw-right-6 tw-z-[850] tw-flex tw-items-center tw-gap-3">
                <button type="button" id="dashboard-bgm-btn" class="tw-rounded-full tw-border tw-border-amber-500/40 tw-bg-slate-950/80 tw-px-5 tw-py-3 tw-font-ui tw-text-xs tw-font-bold tw-text-amber-400 tw-shadow-2xl tw-shadow-black/30 tw-backdrop-blur-md tw-transition-all hover:tw-bg-amber-500/10 active:tw-scale-95">Sesuatu di Jogja</button>
                <button type="button" id="dashboard-chat-float-btn" class="tw-rounded-full tw-bg-amber-500 tw-px-5 tw-py-3 tw-font-ui tw-text-xs tw-font-bold tw-text-slate-950 tw-shadow-2xl tw-shadow-black/30 tw-transition-all hover:tw-bg-amber-400 active:tw-scale-95">Tanya SIGAJOG</button>
            </div>
        </div>`;
}

function thumb(label, src, caption) {
    return `
        <figure class="dashboard-thumb tw-group tw-w-36">
            <div class="tw-h-48 tw-w-36 tw-overflow-hidden tw-rounded-2xl tw-border tw-border-white/20 tw-shadow-2xl tw-shadow-black/40 tw-transition-all tw-duration-300 group-hover:tw-scale-105 group-hover:tw-border-2 group-hover:tw-border-amber-400">
                <img src="${src}" alt="${label}" class="tw-h-full tw-w-full tw-object-cover tw-object-center" onerror="this.onerror=null;this.src='${fallback(label, 420, 560)}'">
            </div>
            <figcaption class="tw-mt-2 tw-translate-y-3 tw-font-ui tw-text-[11px] tw-text-slate-300 tw-opacity-70 tw-transition-all tw-duration-300 group-hover:tw-translate-y-0 group-hover:tw-opacity-100">${caption}</figcaption>
        </figure>`;
}

function decorTitle(title) {
    return `
        <div class="dashboard-title-row tw-flex tw-items-center tw-gap-5">
            <span class="tw-h-px tw-flex-1 tw-origin-right tw-bg-amber-500/60"></span>
            <h2 class="tw-m-0 tw-whitespace-nowrap tw-font-display tw-text-3xl tw-font-bold tw-uppercase tw-tracking-wider tw-text-slate-200 lg:tw-text-4xl">${title}</h2>
            <span class="tw-h-px tw-flex-1 tw-origin-left tw-bg-amber-500/60"></span>
        </div>`;
}

function overviewCard(num, title, desc) {
    return `
        <article class="tw-rounded-2xl tw-border tw-border-amber-500/20 tw-bg-slate-800/50 tw-p-8 tw-text-center tw-transition-all tw-duration-300 hover:-tw-translate-y-2 hover:tw-border-amber-500/60 hover:tw-bg-slate-700/50">
            <div class="tw-mb-4 tw-font-mono tw-text-4xl tw-font-bold tw-text-amber-400/30">${num}</div>
            <h3 class="tw-m-0 tw-font-display tw-text-xl tw-font-bold tw-text-amber-400">${title}</h3>
            <p class="tw-mt-3 tw-font-body tw-text-sm tw-leading-relaxed tw-text-slate-400">${desc}</p>
        </article>`;
}

function featureCard(title, desc, i) {
    return `
        <article class="dashboard-child tw-rounded-2xl tw-border tw-border-amber-500/20 tw-bg-slate-800/60 tw-p-6 tw-transition-all tw-duration-300 hover:-tw-translate-y-2 hover:tw-border-amber-500/60 hover:tw-bg-slate-700/50" style="transition-delay:${i * 100}ms">
            <h3 class="tw-m-0 tw-font-display tw-text-2xl tw-font-bold tw-text-amber-400">${title}</h3>
            <p class="tw-mt-3 tw-font-body tw-text-sm tw-leading-relaxed tw-text-slate-400">${desc}</p>
        </article>`;
}

function gallerySmall(title, src, fb = 'pict/candi.jpg') {
    return `
        <figure class="dashboard-child tw-group tw-relative tw-h-[270px] tw-overflow-hidden tw-rounded-3xl tw-border tw-border-white/20">
            <img src="${src}" alt="${title}" class="tw-h-full tw-w-full tw-object-cover tw-object-center tw-transition-all tw-duration-500 group-hover:tw-scale-105 group-hover:tw-brightness-110" onerror="this.onerror=null;this.src='${fb}'">
            <figcaption class="tw-absolute tw-bottom-4 tw-left-4 tw-font-display tw-text-2xl tw-font-bold tw-text-white tw-opacity-0 tw-transition-opacity group-hover:tw-opacity-100">${title}</figcaption>
        </figure>`;
}

function kpiCard(label, final, display) {
    return `
        <div class="dashboard-child dashboard-kpi-flip tw-rounded-2xl tw-border tw-border-amber-500/20 tw-bg-slate-800/50 tw-p-6 tw-transition-all tw-duration-700 hover:tw-border-amber-500/50 hover:tw-bg-slate-700/50">
            <div class="tw-font-ui tw-text-xs tw-font-bold tw-uppercase tw-tracking-widest tw-text-slate-500">${label}</div>
            <div class="dashboard-counter tw-mt-3 tw-font-mono tw-text-3xl tw-font-bold tw-text-amber-400" data-final="${Number(final) || 0}">${display}</div>
        </div>`;
}

function historyCard(title, date, status, src, i) {
    return `
        <article class="dashboard-child tw-group tw-relative tw-h-80 tw-overflow-hidden tw-rounded-2xl tw-border tw-border-slate-700/50 tw-bg-slate-900" style="transition-delay:${i * 100}ms">
            <img src="${src}" alt="${title}" class="tw-h-full tw-w-full tw-object-cover tw-object-center tw-blur-[1px] tw-transition-all tw-duration-500 group-hover:tw-scale-105 group-hover:tw-blur-0" onerror="this.onerror=null;this.src='${fallback(title)}'">
            <div class="tw-absolute tw-inset-0 tw-bg-gradient-to-t tw-from-slate-950 tw-via-slate-950/35 tw-to-transparent"></div>
            <div class="tw-absolute tw-left-5 tw-right-5 tw-top-5 tw-flex tw-items-center tw-justify-between">
                <span class="tw-rounded-full tw-bg-orange-500/20 tw-px-3 tw-py-1 tw-font-mono tw-text-xs tw-font-bold tw-text-orange-300">${date}</span>
                <span class="tw-rounded-full tw-border tw-border-amber-500/35 tw-bg-amber-500/15 tw-px-3 tw-py-1 tw-font-ui tw-text-xs tw-font-bold tw-text-amber-300">${status}</span>
            </div>
            <div class="tw-absolute tw-bottom-5 tw-left-5 tw-right-5">
                <h3 class="tw-font-display tw-text-2xl tw-font-bold tw-text-white">${title}</h3>
                <button type="button" data-go-page="laporan" class="tw-mt-4 tw-rounded-full tw-border tw-border-white/25 tw-px-4 tw-py-2 tw-font-ui tw-text-xs tw-font-bold tw-text-slate-200 hover:tw-border-amber-400 hover:tw-text-amber-300">Detail</button>
            </div>
        </article>`;
}

function categoryCard(key, title, count, src, i) {
    return `
        <button type="button" data-dashboard-category="${key}" class="dashboard-child tw-group tw-relative tw-h-72 tw-overflow-hidden tw-rounded-2xl tw-border tw-border-slate-700/50 tw-bg-slate-900 tw-text-left tw-transition-all tw-duration-300 hover:tw-border-amber-400/70" style="transition-delay:${i * 100}ms">
            <img src="${src}" alt="${title}" class="tw-h-full tw-w-full tw-object-cover tw-object-center tw-transition-all tw-duration-500 group-hover:tw-scale-110 group-hover:tw-brightness-110" onerror="this.onerror=null;this.src='${fallback(title)}'">
            <div class="tw-absolute tw-inset-0 tw-bg-gradient-to-t tw-from-slate-950 tw-via-slate-950/35 tw-to-transparent"></div>
            <span class="tw-absolute tw-right-4 tw-top-4 tw-rounded-full tw-border tw-border-amber-500/40 tw-bg-amber-500/15 tw-px-3 tw-py-1 tw-font-mono tw-text-xs tw-font-bold tw-text-amber-300">${count}</span>
            <div class="tw-absolute tw-inset-0 tw-grid tw-place-items-center">
                <div class="tw-font-display tw-text-4xl tw-font-bold tw-text-white">${title}</div>
            </div>
        </button>`;
}

function bindDashboard(root) {
    root.querySelectorAll('[data-go-page]').forEach((btn) => btn.addEventListener('click', () => window.appRouter?.navigate(btn.dataset.goPage)));
    root.querySelectorAll('[data-dashboard-category]').forEach((btn) => {
        btn.addEventListener('click', () => {
            window.__pendingTataKotaCategory = btn.dataset.dashboardCategory;
            window.appRouter?.navigate('tatakota');
        });
    });
    root.querySelectorAll('[data-scroll-target]').forEach((btn) => btn.addEventListener('click', () => document.querySelector(btn.dataset.scrollTarget)?.scrollIntoView({ behavior: 'smooth' })));
    root.querySelector('#dashboard-chatbot-btn')?.addEventListener('click', () => document.getElementById('chatbot-toggle')?.click());
    root.querySelector('#dashboard-chat-float-btn')?.addEventListener('click', () => document.getElementById('chatbot-toggle')?.click());
    root.querySelector('#dashboard-bgm-btn')?.addEventListener('click', () => document.getElementById('bgm-toggle')?.click());
}

async function hydrateDashboardMap() {
    const el = document.getElementById('dashboard-mini-map');
    if (!el || typeof L === 'undefined') return;
    if (_dashboardMap) {
        try { _dashboardMap.remove(); } catch (_) {}
        _dashboardMap = null;
    }
    _dashboardMap = L.map(el, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        maxBounds: [[-8.6, 109.2], [-7.1, 111.8]],
        maxBoundsViscosity: 1
    }).setView([-7.85, 110.37], 9);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(_dashboardMap);
    try {
        const res = await fetch('qgis/jumlah_dampak_bencana_diy_2025_per_kabupaten.geojson');
        const data = await res.json();
        const colors = { Rendah: '#00bcd4', Sedang: '#ff9800', Tinggi: '#f44336', 'Sangat Tinggi': '#b71c1c' };
        const layer = L.geoJSON(data, {
            style: (feature) => ({
                color: '#f8fafc',
                weight: 1.2,
                opacity: 0.7,
                fillColor: colors[feature.properties?.kelas_risiko] || '#64748b',
                fillOpacity: 0.58
            }),
            interactive: false
        }).addTo(_dashboardMap);
        _dashboardMap.fitBounds(layer.getBounds(), { padding: [26, 26] });
    } catch (err) {
        console.warn('Mini map dashboard gagal dimuat:', err);
    }
}

function initCounters(root) {
    const counters = root.querySelectorAll('.dashboard-counter[data-final]');
    const run = (el) => {
        const final = Number(el.dataset.final || 0);
        if (!final) return;
        let start = null;
        const step = (ts) => {
            start = start ?? ts;
            const pct = Math.min((ts - start) / 1000, 1);
            el.textContent = fmt(Math.round(final * pct));
            if (pct < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };
    const io = 'IntersectionObserver' in window
        ? new IntersectionObserver((entries) => entries.forEach((entry) => {
            if (entry.isIntersecting) {
                run(entry.target);
                io.unobserve(entry.target);
            }
        }), { threshold: 0.6 })
        : null;
    counters.forEach((el) => io ? io.observe(el) : run(el));
}

function observeDashboard(root) {
    const items = root.querySelectorAll('.dashboard-section, .dashboard-child, .dashboard-title-row span');
    if (!('IntersectionObserver' in window)) return;
    items.forEach((el) => {
        el.classList.add('tw-opacity-0', 'tw-translate-y-8', 'tw-transition-all', 'tw-duration-700');
        if (el.matches('.dashboard-title-row span')) {
            el.classList.add('tw-scale-x-0');
            el.classList.remove('tw-translate-y-8');
        }
        if (el.classList.contains('dashboard-kpi-flip')) {
            el.classList.remove('tw-translate-y-8');
        }
    });
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.remove('tw-opacity-0', 'tw-translate-y-8', 'tw-scale-x-0');
            entry.target.classList.remove('dashboard-kpi-flip');
            entry.target.classList.add('tw-opacity-100', 'tw-translate-y-0', 'tw-scale-x-100');
            io.unobserve(entry.target);
        });
    }, { threshold: 0.2 });
    items.forEach((el, idx) => {
        if (el.classList.contains('dashboard-child')) el.style.transitionDelay = `${(idx % 6) * 100}ms`;
        io.observe(el);
    });
}
