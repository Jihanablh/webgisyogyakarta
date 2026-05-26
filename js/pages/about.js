function wireMethodology(container, reducedMotion) {
    const method = container.querySelector('.about-method');
    const steps = method ? [...method.querySelectorAll('.about-method-step')] : [];
    if (!method || !steps.length) return;

    if (reducedMotion) {
        method.classList.add('about-method--in');
        steps.forEach((s) => s.classList.add('is-visible'));
        return;
    }

    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((e) => {
                if (!e.isIntersecting) return;
                method.classList.add('about-method--in');
                steps.forEach((s, i) => {
                    setTimeout(() => s.classList.add('is-visible'), 140 + i * 160);
                });
                io.unobserve(method);
            });
        },
        { threshold: 0.18, rootMargin: '0px 0px -24px 0px' }
    );
    io.observe(method);
}

export function initAboutPage() {
    const container = document.querySelector('#tentang-page .tentang-container');
    if (!container) return;

    const pillars = [
        {
            title: 'Navigasi',
            desc: 'Ribuan lokasi wisata, fasilitas, dan layanan publik DIY dalam satu peta interaktif.',
            accent: '#3b82f6',
            border: 'rgba(59,130,246,0.4)'
        },
        {
            title: 'Keselamatan',
            desc: 'Zona risiko bencana, titik pengungsian, dan kontak darurat terverifikasi dari BPBD DIY dan BNPB.',
            accent: '#ef4444',
            border: 'rgba(239,68,68,0.4)'
        },
        {
            title: 'Data',
            desc: 'Statistik visual dan distribusi spasial per wilayah DIY, diperbarui berkala dari sumber terpercaya.',
            accent: '#22c55e',
            border: 'rgba(34,197,94,0.4)'
        }
    ];

    const sources = [
        { name: 'OpenStreetMap / HOT', desc: 'Geometri & titik lokasi', accent: '#60a5fa' },
        { name: 'BPBD DIY', desc: 'Data kebencanaan lokal', accent: '#f87171' },
        { name: 'BMKG', desc: 'Cuaca & seismologi', accent: '#34d399' },
        { name: 'BNPB', desc: 'Risiko bencana nasional', accent: '#fb923c' },
        { name: 'BPBD DIY', desc: 'Koordinasi data kebencanaan wilayah', accent: '#a78bfa' },
        { name: 'GADM v4.1', desc: 'Batas wilayah administrasi', accent: '#d4af37' }
    ];

    const stats = [
        { num: '7.100+', label: 'Tempat', accent: '#60a5fa' },
        { num: '10', label: 'Kategori', accent: '#34d399' },
        { num: '32+', label: 'Subkategori', accent: '#a78bfa' },
        { num: '6', label: 'Sumber Data', accent: '#d4af37' }
    ];

    container.innerHTML = `
    <div class="about-reveal about-hero-animate tw-relative tw-overflow-hidden tw-py-8 tw-text-center md:tw-py-12">
        <div class="about-batik-accent" aria-hidden="true"></div>
        <div class="tw-relative tw-z-[1]">
            <div class="tw-mb-5 tw-inline-block tw-rounded-full tw-border tw-border-amber-500/30 tw-px-4 tw-py-1.5 tw-text-[11px] tw-font-bold tw-uppercase tw-tracking-[0.12em] tw-text-amber-500">
                Versi 2.0 · 2024/2025
            </div>
            <h1 class="about-hero-title tw-mb-3 tw-font-display tw-text-4xl tw-font-extrabold tw-tracking-tight tw-text-[var(--text-primary)] md:tw-text-5xl">Jogja Siaga</h1>
            <p class="tw-mx-auto tw-mb-6 tw-max-w-lg tw-font-body tw-text-base tw-leading-relaxed tw-text-[var(--text-secondary)] md:tw-text-lg">
                Panduan digital wilayah Daerah Istimewa Yogyakarta — peta, risiko, dan tata kelola dalam satu layar.
            </p>
            <div class="tw-font-body tw-text-sm tw-leading-relaxed tw-text-[var(--text-muted)]">
                <span class="tw-font-semibold tw-text-[var(--text-secondary)]">Jihan Nabilah Rahman</span><br>
                Proyek Kapita · Semester 6
            </div>
        </div>
    </div>

    <div class="ta-divider"><span class="ta-divider-sym">&#9670;</span></div>

    <div class="about-reveal tw-mb-2">
        <div class="tw-mb-5 tw-text-center tw-font-ui tw-text-[11px] tw-font-bold tw-uppercase tw-tracking-[0.12em] tw-text-[var(--text-muted)]">Tiga pilar utama</div>
        <div class="tw-grid tw-grid-cols-1 tw-gap-5 md:tw-grid-cols-3">
            ${pillars
                .map(
                    (p) => `
            <div class="about-io-card ta-card-hover tw-rounded-2xl tw-border tw-border-[var(--border-card)] tw-bg-[rgba(16,22,40,0.7)] tw-px-6 tw-py-7" style="border-top:3px solid ${p.border}">
                <h3 class="tw-mb-3 tw-font-display tw-text-[17px] tw-font-bold" style="color:${p.accent}">${p.title}</h3>
                <p class="tw-m-0 tw-font-body tw-text-[13.5px] tw-leading-relaxed tw-text-[var(--text-secondary)]">${p.desc}</p>
            </div>`
                )
                .join('')}
        </div>
    </div>

    <div class="ta-divider"><span class="ta-divider-sym">&#9670;</span></div>

    <div class="about-reveal">
        <div class="tw-mb-5 tw-text-center tw-font-ui tw-text-[11px] tw-font-bold tw-uppercase tw-tracking-[0.12em] tw-text-[var(--text-muted)]">Alur data (input / proses / output)</div>
        <div class="tw-mx-auto tw-grid tw-max-w-4xl tw-grid-cols-1 tw-gap-4 md:tw-grid-cols-3">
            <div class="tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[rgba(16,22,40,0.55)] tw-p-5 tw-text-left">
                <div class="tw-mb-2 tw-font-ui tw-text-xs tw-font-bold tw-uppercase tw-tracking-wide tw-text-amber-500/90">Input</div>
                <p class="tw-font-body tw-text-sm tw-leading-relaxed tw-text-[var(--text-secondary)]">Unduhan GeoJSON &amp; vektor dari instansi (BPBD, BNPB, OSM) serta validasi skema atribut sebelum dimuat ke cache aplikasi.</p>
            </div>
            <div class="tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[rgba(16,22,40,0.55)] tw-p-5 tw-text-left">
                <div class="tw-mb-2 tw-font-ui tw-text-xs tw-font-bold tw-uppercase tw-tracking-wide tw-text-amber-500/90">Proses</div>
                <p class="tw-font-body tw-text-sm tw-leading-relaxed tw-text-[var(--text-secondary)]">Normalisasi kategori, styling risiko per properti fitur, agregasi untuk statistik SPA, dan clustering marker untuk performa peta.</p>
            </div>
            <div class="tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[rgba(16,22,40,0.55)] tw-p-5 tw-text-left">
                <div class="tw-mb-2 tw-font-ui tw-text-xs tw-font-bold tw-uppercase tw-tracking-wide tw-text-amber-500/90">Output</div>
                <p class="tw-font-body tw-text-sm tw-leading-relaxed tw-text-[var(--text-secondary)]">Panel detail, legenda mengambang, halaman laporan, Tata Kelola sebagai SPA terpisah, dan SIGAJOG dengan indeks data GeoJSON.</p>
            </div>
        </div>
    </div>

    <div class="ta-divider"><span class="ta-divider-sym">&#9670;</span></div>

    <div class="about-reveal about-method tw-mb-2">
        <div class="tw-mb-6 tw-text-center tw-font-ui tw-text-[11px] tw-font-bold tw-uppercase tw-tracking-[0.12em] tw-text-[var(--text-muted)]">Metodologi pengembangan</div>
        <div class="about-method-step">
            <h3 class="tw-mb-1 tw-font-display tw-text-base tw-font-semibold tw-text-[var(--text-primary)]">Kebutuhan &amp; persona pengguna</h3>
            <p class="tw-m-0 tw-font-body tw-text-sm tw-leading-relaxed tw-text-[var(--text-secondary)]">Observasi tugas: eksplorasi peta, cek zona risiko, dan akses laporan melalui internet.</p>
        </div>
        <div class="about-method-step">
            <h3 class="tw-mb-1 tw-font-display tw-text-base tw-font-semibold tw-text-[var(--text-primary)]">Perancangan informasi spasial</h3>
            <p class="tw-m-0 tw-font-body tw-text-sm tw-leading-relaxed tw-text-[var(--text-secondary)]">Pemetaan lapisan ke kategori, palet risiko konsisten, serta alur dari welcome sinematik menuju peta interaktif dan SPA.</p>
        </div>
        <div class="about-method-step">
            <h3 class="tw-mb-1 tw-font-display tw-text-base tw-font-semibold tw-text-[var(--text-primary)]">Implementasi &amp; uji coba</h3>
            <p class="tw-m-0 tw-font-body tw-text-sm tw-leading-relaxed tw-text-[var(--text-secondary)]">Leaflet + modul ES6, router ringan, dan uji overlap kontrol peta, legenda, chatbot, serta panel detail di beberapa viewport.</p>
        </div>
        <div class="about-method-step">
            <h3 class="tw-mb-1 tw-font-display tw-text-base tw-font-semibold tw-text-[var(--text-primary)]">Iterasi dari umpan balik</h3>
            <p class="tw-m-0 tw-font-body tw-text-sm tw-leading-relaxed tw-text-[var(--text-secondary)]">Penyesuaian hierarki sidebar, Tata Kelola sebagai halaman mandiri, dan fallback konten agar angka nol tidak mengganggu narasi risiko.</p>
        </div>
    </div>

    <div class="ta-divider"><span class="ta-divider-sym">&#9670;</span></div>

    <div class="about-reveal">
        <div class="tw-mb-5 tw-text-center tw-font-ui tw-text-[11px] tw-font-bold tw-uppercase tw-tracking-[0.12em] tw-text-[var(--text-muted)]">Sumber data</div>
        <div class="tw-grid tw-grid-cols-1 tw-gap-3 sm:tw-grid-cols-2 lg:tw-grid-cols-3">
            ${sources
                .map(
                    (s) => `
            <div class="about-io-card ta-card-hover tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[rgba(16,22,40,0.6)] tw-p-4">
                <div class="tw-mb-1.5 tw-font-display tw-text-[15px] tw-font-bold" style="color:${s.accent}">${s.name}</div>
                <div class="tw-font-body tw-text-[12.5px] tw-text-[var(--text-muted)]">${s.desc}</div>
            </div>`
                )
                .join('')}
        </div>
    </div>

    <div class="ta-divider"><span class="ta-divider-sym">&#9670;</span></div>

    <div class="about-reveal">
        <div class="tw-mb-5 tw-text-center tw-font-ui tw-text-[11px] tw-font-bold tw-uppercase tw-tracking-[0.12em] tw-text-[var(--text-muted)]">Teknologi</div>
        <div class="tw-flex tw-flex-wrap tw-justify-center tw-gap-2.5">
            ${['Leaflet.js', 'GeoJSON', 'ES6 Modules', 'CSS Custom Properties', 'MarkerCluster', 'Canvas API', 'Fetch API', 'Tailwind (prefiks tw-)']
                .map(
                    (t) =>
                        `<span class="tw-rounded-full tw-border tw-border-[var(--border-card)] tw-bg-[#111827] tw-px-[18px] tw-py-2 tw-font-ui tw-text-[13px] tw-font-medium tw-text-[var(--text-secondary)]">${t}</span>`
                )
                .join('')}
        </div>
    </div>

    <div class="ta-divider"><span class="ta-divider-sym">&#9670;</span></div>

    <div class="about-reveal">
        <div class="tw-mb-5 tw-text-center tw-font-ui tw-text-[11px] tw-font-bold tw-uppercase tw-tracking-[0.12em] tw-text-[var(--text-muted)]">Ringkasan statistik</div>
        <div class="tw-grid tw-grid-cols-2 tw-gap-4 lg:tw-grid-cols-4">
            ${stats
                .map(
                    (s) => `
            <div class="about-io-card ta-card-hover tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[#0d1117] tw-px-5 tw-py-5" style="border-left:3px solid ${s.accent}">
                <div class="about-stat-num tw-mb-1.5 tw-font-mono tw-text-3xl tw-font-bold" style="color:${s.accent}">${s.num}</div>
                <div class="tw-font-ui tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wide tw-text-[var(--text-muted)]">${s.label}</div>
            </div>`
                )
                .join('')}
        </div>
    </div>

    <div class="tw-mt-12 tw-border-t tw-border-[var(--border-card)] tw-pt-10 tw-text-center tw-font-body tw-text-xs tw-leading-loose tw-text-[var(--text-muted)]">
        Jogja Siaga v2.0 · Data diperbarui Januari 2026 · Jihan Nabilah Rahman
    </div>`;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reveals = container.querySelectorAll('.about-reveal');
    if (reduced) {
        reveals.forEach((el) => el.classList.add('about-reveal--in'));
    } else {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add('about-reveal--in');
                        io.unobserve(e.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -36px 0px' }
        );
        reveals.forEach((el) => io.observe(el));
    }

    wireMethodology(container, reduced);

    const ioCards = container.querySelectorAll('.about-io-card');
    ioCards.forEach((el, idx) => {
        el.dataset.staggerIdx = String(idx);
    });
    if (reduced) {
        ioCards.forEach((el) => el.classList.add('about-io-card--in'));
    } else {
        const io2 = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (!e.isIntersecting) return;
                    const delay = parseInt(e.target.dataset.staggerIdx || '0', 10) * 100;
                    setTimeout(() => e.target.classList.add('about-io-card--in'), delay);
                    io2.unobserve(e.target);
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -24px 0px' }
        );
        ioCards.forEach((el) => io2.observe(el));
    }
}
