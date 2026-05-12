/** Data kejadian contoh (satu sumber kebenaran untuk KPI, chart, dan timeline) */
const REPORT_EVENTS = [
    {
        id: 'e1',
        year: 2024,
        jenis: 'Erupsi',
        kecamatan: 'Cangkringan',
        risk: 'Siaga',
        lossMilyar: 2.5,
        korban: 0,
        luka: 12,
        pengungsi: 450,
        dateLabel: '12 Mar 2024 • 14:30 WIB',
        title: 'Erupsi Freatik Gunung Merapi',
        locLabel: 'Kecamatan Cangkringan, Kabupaten Sleman',
        desc: 'Telah terjadi erupsi freatik dengan tinggi kolom abu mencapai 2.500 meter di atas puncak. Angin bertiup ke arah barat daya. Hujan abu vulkanik melanda beberapa desa di kawasan KRB III.',
        statusClass: 'report-pulse-badge tw-rounded tw-border tw-border-red-500/25 tw-bg-red-500/10 tw-px-2.5 tw-py-1 tw-font-ui tw-text-[11px] tw-font-semibold tw-text-red-400',
        statusText: 'Siaga Aktif',
        surfaceClass: 'report-tl-surface--merapi',
        tlAnim: 'report-tl-slide-from-left',
        dotClass: 'tw-bg-red-500',
        barPct: 56,
        barLabel: 'Kapasitas barak (Balai Desa Glagaharjo)',
        barFill: 'tw-bg-amber-500',
        capText: '450 / 800',
        contactLabel: 'BPBD Sleman',
        contactTel: '+62274869902'
    },
    {
        id: 'e2',
        year: 2024,
        jenis: 'Banjir',
        kecamatan: 'Gamping',
        risk: 'Selesai',
        lossMilyar: 0.12,
        korban: 0,
        luka: 0,
        pengungsi: 85,
        dateLabel: '05 Jan 2024 • 02:15 WIB',
        title: 'Banjir Genangan Hujan Ekstrem',
        locLabel: 'Kecamatan Gamping, Kabupaten Sleman',
        desc: 'Curah hujan tinggi menyebabkan meluapnya Sungai Bedog. Genangan 50–80 cm merendam empat pedukuhan di wilayah Gamping.',
        statusClass: 'tw-rounded tw-border tw-border-emerald-500/25 tw-bg-emerald-500/10 tw-px-2.5 tw-py-1 tw-text-[11px] tw-font-semibold tw-text-emerald-400',
        statusText: 'Selesai',
        surfaceClass: 'report-tl-surface--flood',
        tlAnim: 'report-tl-slide-from-right',
        dotClass: 'tw-bg-emerald-500',
        barPct: 0,
        barLabel: 'Kapasitas pengungsian (Masjid Patukan)',
        barFill: 'tw-bg-emerald-500',
        capText: '0 / 150',
        contactLabel: 'Polsek Gamping',
        contactTel: '+62274798221'
    },
    {
        id: 'e3',
        year: 2023,
        jenis: 'Gempa',
        kecamatan: 'Bantul',
        risk: 'Waspada',
        lossMilyar: 4.1,
        korban: 0,
        luka: 3,
        pengungsi: 42,
        dateLabel: '18 Nov 2023 • 08:42 WIB',
        title: 'Gempa M4.8 Lokal DIY',
        locLabel: 'Kabupaten Bantul & Kota Yogyakarta',
        desc: 'Gempa dangkal dirasakan MM IV–V di pusat kota. Sejumlah struktur retak ringan; tidak ada laporan korban jiwa. Tim cepat BPBD melakukan asesmen fasilitas vital.',
        statusClass: 'tw-rounded tw-border tw-border-amber-500/30 tw-bg-amber-500/10 tw-px-2.5 tw-py-1 tw-text-[11px] tw-font-semibold tw-text-amber-400',
        statusText: 'Dalam pemantauan',
        surfaceClass: 'report-tl-surface--quake',
        tlAnim: 'report-tl-slide-from-left',
        dotClass: 'tw-bg-orange-500',
        barPct: 0,
        barLabel: '',
        barFill: '',
        capText: '',
        contactLabel: 'BMKG DIY',
        contactTel: '+62274511064'
    }
];

let _reportCharts = [];

function destroyReportCharts() {
    _reportCharts.forEach((c) => {
        try {
            c.destroy();
        } catch (_) {}
    });
    _reportCharts = [];
}

function telHref(tel) {
    const raw = String(tel).trim();
    if (/^\d{2,4}$/.test(raw)) return `tel:${raw}`;
    const d = raw.replace(/\D/g, '');
    if (!d) return '#';
    if (d.startsWith('62')) return `tel:+${d}`;
    return `tel:+62${d.replace(/^0/, '')}`;
}

function filterEvents(state) {
    return REPORT_EVENTS.filter((ev) => {
        if (state.year !== 'all' && ev.year !== state.year) return false;
        if (state.jenis !== 'all' && ev.jenis !== state.jenis) return false;
        if (state.kecamatan !== 'all' && !String(ev.kecamatan).toLowerCase().includes(String(state.kecamatan).toLowerCase()))
            return false;
        if (state.risk !== 'all' && ev.risk !== state.risk) return false;
        return true;
    });
}

function aggByYear(events, years) {
    const by = Object.fromEntries(years.map((y) => [y, { n: 0, loss: 0, korban: 0 }]));
    events.forEach((ev) => {
        if (!by[ev.year]) return;
        by[ev.year].n += 1;
        by[ev.year].loss += ev.lossMilyar;
        by[ev.year].korban += ev.korban;
    });
    return years.map((y) => by[y]);
}

function renderTimeline(container, events) {
    const rail = container.querySelector('.report-tl-rail');
    if (!rail) return;
    rail.innerHTML = events
        .map(
            (ev) => `
        <div class="report-tl-item ${ev.tlAnim || ''} tw-relative tw-mb-8" data-ev-id="${ev.id}">
            <div class="tw-absolute tw-left-[-29px] tw-top-1 tw-z-[1] tw-h-3 tw-w-3 tw-rounded-full tw-border-2 tw-border-[var(--bg-primary)] ${ev.dotClass} md:tw-left-[-33px]"></div>
            <div class="report-tl-surface ${ev.surfaceClass} tw-relative tw-overflow-hidden tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-card)] tw-p-5 tw-shadow-lg">
                <div class="tw-mb-3 tw-flex tw-flex-wrap tw-items-start tw-justify-between tw-gap-3">
                    <div>
                        <div class="tw-mb-1 report-font-mono tw-text-[13px] tw-text-amber-500">${ev.dateLabel}</div>
                        <h4 class="tw-mb-1 report-font-display tw-text-lg tw-font-semibold tw-text-[var(--text-primary)]">${ev.title}</h4>
                        <div class="tw-text-[13px] tw-text-[var(--text-muted)]">${ev.locLabel}</div>
                    </div>
                    <span class="${ev.statusClass}">${ev.statusText}</span>
                </div>
                <p class="tw-mb-4 tw-text-sm tw-leading-relaxed tw-text-[var(--text-secondary)]">${ev.desc}</p>
                <div class="tw-mb-4 tw-flex tw-flex-wrap tw-gap-6">
                    <div><span class="tw-block tw-text-xs tw-text-[var(--text-muted)]">Korban Jiwa</span><strong class="report-font-mono tw-text-[15px]">${ev.korban}</strong></div>
                    <div><span class="tw-block tw-text-xs tw-text-[var(--text-muted)]">Luka-luka</span><strong class="report-font-mono tw-text-[15px]">${ev.luka}</strong></div>
                    <div><span class="tw-block tw-text-xs tw-text-[var(--text-muted)]">Pengungsi</span><strong class="report-font-mono tw-text-[15px]">${ev.pengungsi}</strong></div>
                    <div><span class="tw-block tw-text-xs tw-text-[var(--text-muted)]">Kerugian</span><strong class="report-font-mono tw-text-[15px]">${ev.lossMilyar < 0.01 ? `Rp ${(ev.lossMilyar * 1000).toFixed(0)} Jt` : `Rp ${ev.lossMilyar.toFixed(1)} M`}</strong></div>
                </div>
                ${ev.barLabel ? `<div class="tw-mb-4">
                    <div class="tw-mb-1 tw-flex tw-justify-between tw-text-xs">
                        <span class="tw-text-[var(--text-muted)]">${ev.barLabel}</span>
                        <span class="tw-text-[var(--text-secondary)]">${ev.capText}</span>
                    </div>
                    <div class="tw-h-1.5 tw-overflow-hidden tw-rounded-full tw-bg-white/10">
                        <div class="tw-h-full tw-rounded-full ${ev.barFill}" style="width:${ev.barPct}%"></div>
                    </div>
                </div>` : ''}
                <div class="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3 tw-border-t tw-border-[var(--border-card)] tw-pt-4">
                    <div class="tw-text-[13px] tw-text-[var(--text-muted)]">Kontak: <a class="tw-font-semibold tw-text-[var(--text-secondary)] hover:tw-text-amber-400" href="${telHref(ev.contactTel)}">${ev.contactLabel}</a></div>
                    <button type="button" class="btn-primary tw-rounded tw-border tw-border-sky-500 tw-bg-transparent tw-px-4 tw-py-1.5 tw-text-[13px] tw-text-sky-400 hover:tw-bg-sky-500/10">Lihat di Peta</button>
                </div>
            </div>
        </div>`
        )
        .join('');
    if (!events.length) {
        rail.innerHTML = `<p class="tw-p-6 tw-font-body tw-text-[var(--text-muted)]">Tidak ada kejadian untuk filter ini.</p>`;
    }
}

function applyFilters(container, state) {
    const list = filterEvents(state);
    const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
    const agg = aggByYear(list, years);

    const totalN = list.length;
    const totalDead = list.reduce((s, e) => s + e.korban, 0);
    const totalRef = list.reduce((s, e) => s + e.pengungsi, 0);
    const totalLossTrilyun = list.reduce((s, e) => s + e.lossMilyar, 0) / 1000;

    const kpi = container.querySelectorAll('.report-kpi-num[data-kpi]');
    kpi.forEach((el) => {
        const k = el.dataset.kpi;
        let v = 0;
        let dec = 0;
        if (k === 'n') {
            v = totalN || 0;
            dec = 0;
        }
        if (k === 'dead') {
            v = totalDead;
            dec = 0;
        }
        if (k === 'ref') {
            v = totalRef;
            dec = 0;
        }
        if (k === 'lossT') {
            v = totalLossTrilyun;
            dec = 2;
        }
        el.textContent = formatReportKpi(v, dec);
    });

    renderTimeline(container, list);

    destroyReportCharts();
    initReportCharts(years, agg);

    const rail = container.querySelector('.report-tl-rail');
    if (rail && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        rail.classList.remove('report-tl-rail--drawn');
        requestAnimationFrame(() => {
            const ioRail = new IntersectionObserver(
                (entries) => {
                    if (entries.some((e) => e.isIntersecting)) {
                        rail.classList.add('report-tl-rail--drawn');
                        ioRail.disconnect();
                    }
                },
                { threshold: 0.08 }
            );
            ioRail.observe(rail);
        });
    } else if (rail) rail.classList.add('report-tl-rail--drawn');

    const tl = container.querySelectorAll('.report-tl-item');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        tl.forEach((el) => el.classList.add('report-tl-visible'));
    } else {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add('report-tl-visible');
                        io.unobserve(e.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -20px 0px' }
        );
        tl.forEach((el) => io.observe(el));
    }
}

export function initReportPage() {
    const container = document.getElementById('laporan-content');
    if (!container) return;
    destroyReportCharts();

    const filterState = { year: 'all', jenis: 'all', kecamatan: 'all', risk: 'all' };

    const pillLabel = () => ({
        year: `Tahun: ${filterState.year === 'all' ? 'Semua' : filterState.year}`,
        jenis: `Jenis: ${filterState.jenis === 'all' ? 'Semua' : filterState.jenis}`,
        kecamatan: `Kecamatan: ${filterState.kecamatan === 'all' ? 'Semua' : filterState.kecamatan}`,
        risk: `Status: ${filterState.risk === 'all' ? 'Semua' : filterState.risk}`
    });

    container.innerHTML = `
        <div class="report-dashboard tw-relative tw-mx-auto tw-max-w-6xl tw-bg-[var(--bg-primary)] tw-px-4 tw-py-6 tw-text-[var(--text-primary)] md:tw-px-6">
            <p class="tw-mb-6 tw-max-w-3xl tw-font-body tw-text-sm tw-leading-relaxed tw-text-[var(--text-secondary)]">
                Ringkasan kejadian bencana di DIY (data contoh). Filter memperbarui angka KPI, grafik, dan timeline di bawah ini.
            </p>

            <div class="report-kpi-grid tw-mb-8 tw-grid tw-grid-cols-2 tw-gap-4 md:tw-grid-cols-4">
                <div class="report-kpi-stagger tw-border-l-[3px] tw-border-amber-500 tw-pl-4">
                    <div class="tw-mb-1 tw-font-ui tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-[var(--text-muted)]">Total Kejadian</div>
                    <div class="report-font-mono report-kpi-num tw-text-3xl tw-font-bold tw-leading-none md:tw-text-4xl" data-kpi="n" data-target="0" data-decimals="0">0</div>
                </div>
                <div class="report-kpi-stagger tw-border-l-[3px] tw-border-red-500 tw-pl-4">
                    <div class="tw-mb-1 tw-font-ui tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-[var(--text-muted)]">Total Korban Jiwa</div>
                    <div class="report-font-mono report-kpi-num tw-text-3xl tw-font-bold tw-leading-none md:tw-text-4xl" data-kpi="dead" data-target="0" data-decimals="0">0</div>
                </div>
                <div class="report-kpi-stagger tw-border-l-[3px] tw-border-sky-500 tw-pl-4">
                    <div class="tw-mb-1 tw-font-ui tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-[var(--text-muted)]">Total Pengungsi</div>
                    <div class="report-font-mono report-kpi-num tw-text-3xl tw-font-bold tw-leading-none md:tw-text-4xl" data-kpi="ref" data-target="0" data-decimals="0">0</div>
                </div>
                <div class="report-kpi-stagger tw-border-l-[3px] tw-border-emerald-500 tw-pl-4">
                    <div class="tw-mb-1 tw-font-ui tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-[var(--text-muted)]">Total Kerugian (T Rp)</div>
                    <div class="report-font-mono report-kpi-num tw-text-3xl tw-font-bold tw-leading-none md:tw-text-4xl" data-kpi="lossT" data-target="0" data-decimals="2">0</div>
                </div>
            </div>

            <div class="report-filter-bar tw-mb-8 tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-4 tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-card)] tw-p-4 md:tw-p-5">
                <div class="tw-flex tw-flex-wrap tw-items-center tw-gap-2">
                    <span class="tw-mr-1 tw-font-ui tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wide tw-text-[var(--text-muted)]">Filter</span>
                    <button type="button" class="filter-pill tw-rounded-full tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-elevated)] tw-px-4 tw-py-1.5 tw-text-[13px] tw-text-[var(--text-primary)] tw-transition-colors hover:tw-border-amber-500/60" data-filter="year">${pillLabel().year}</button>
                    <button type="button" class="filter-pill tw-rounded-full tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-elevated)] tw-px-4 tw-py-1.5 tw-text-[13px] tw-text-[var(--text-primary)] tw-transition-colors hover:tw-border-amber-500/60" data-filter="jenis">${pillLabel().jenis}</button>
                    <button type="button" class="filter-pill tw-rounded-full tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-elevated)] tw-px-4 tw-py-1.5 tw-text-[13px] tw-text-[var(--text-primary)] tw-transition-colors hover:tw-border-amber-500/60" data-filter="kecamatan">${pillLabel().kecamatan}</button>
                    <button type="button" class="filter-pill tw-rounded-full tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-elevated)] tw-px-4 tw-py-1.5 tw-text-[13px] tw-text-[var(--text-primary)] tw-transition-colors hover:tw-border-amber-500/60" data-filter="risk">${pillLabel().risk}</button>
                </div>
                <button type="button" id="report-filter-reset" class="tw-text-sm tw-font-ui tw-text-amber-500 tw-underline tw-underline-offset-2 hover:tw-text-amber-400">Reset Filter</button>
            </div>

            <div class="tw-mb-10 tw-grid tw-grid-cols-1 tw-gap-5 lg:tw-grid-cols-2">
                <div class="tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-card)] tw-p-5">
                    <h3 class="report-font-display tw-mb-4 tw-text-[15px] tw-font-semibold tw-text-[var(--text-primary)]">Tren Kejadian & Korban per Tahun</h3>
                    <div class="tw-relative tw-h-[300px]"><canvas id="reportChartTrend"></canvas></div>
                </div>
                <div class="tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-card)] tw-p-5">
                    <h3 class="report-font-display tw-mb-4 tw-text-[15px] tw-font-semibold tw-text-[var(--text-primary)]">Total Kerugian Material (Rp Miliar)</h3>
                    <div class="tw-relative tw-h-[300px]"><canvas id="reportChartLoss"></canvas></div>
                </div>
            </div>

            <div class="tw-mb-12">
                <h3 class="report-font-display tw-mb-6 tw-border-b tw-border-[var(--border-card)] tw-pb-3 tw-text-lg tw-font-semibold tw-text-[var(--text-primary)]">Riwayat Bencana</h3>
                <div class="report-tl-rail tw-relative tw-pl-6 md:tw-pl-8"></div>
            </div>

            <div>
                <h3 class="report-font-display tw-mb-5 tw-border-b tw-border-[var(--border-card)] tw-pb-3 tw-text-lg tw-font-semibold tw-text-[var(--text-primary)]">Pusat Kontak Darurat</h3>
                <div class="report-contact-grid tw-grid tw-grid-cols-1 tw-gap-4 md:tw-grid-cols-3">
                    <article class="report-contact-card report-contact-card--med">
                        <h4 class="tw-mb-1 tw-font-display tw-text-base tw-font-semibold tw-text-[var(--text-primary)]">BPBD DIY</h4>
                        <p class="tw-mb-3 tw-font-ui tw-text-[11px] tw-font-semibold tw-uppercase tw-tracking-wide tw-text-[var(--text-muted)]">24 jam</p>
                        <a class="report-contact-num tw-mb-3 tw-block tw-font-mono tw-text-2xl tw-font-semibold tw-text-[var(--accent-gold)] hover:tw-text-amber-300" href="tel:+62274555584">0274-555584</a>
                        <p class="tw-text-[13px] tw-leading-snug tw-text-[var(--text-muted)]">Pusdalops PB DIY<br>Jl. Kenari No.14, Semaki</p>
                    </article>
                    <article class="report-contact-card report-contact-card--police">
                        <h4 class="tw-mb-1 tw-font-display tw-text-base tw-font-semibold tw-text-[var(--text-primary)]">Polres DIY</h4>
                        <p class="tw-mb-3 tw-font-ui tw-text-[11px] tw-font-semibold tw-uppercase tw-tracking-wide tw-text-[var(--text-muted)]">Darurat</p>
                        <a class="report-contact-num tw-mb-3 tw-block tw-font-mono tw-text-2xl tw-font-semibold tw-text-[var(--accent-gold)] hover:tw-text-amber-300" href="tel:110">110</a>
                        <p class="tw-text-[13px] tw-leading-snug tw-text-[var(--text-muted)]">Koordinasi keamanan wilayah<br>Hotline terpusat</p>
                    </article>
                    <article class="report-contact-card report-contact-card--sar">
                        <h4 class="tw-mb-1 tw-font-display tw-text-base tw-font-semibold tw-text-[var(--text-primary)]">Basarnas (SAR)</h4>
                        <p class="tw-mb-3 tw-font-ui tw-text-[11px] tw-font-semibold tw-uppercase tw-tracking-wide tw-text-[var(--text-muted)]">24 jam</p>
                        <a class="report-contact-num tw-mb-3 tw-block tw-font-mono tw-text-2xl tw-font-semibold tw-text-[var(--accent-gold)] hover:tw-text-amber-300" href="tel:115">115</a>
                        <p class="tw-text-[13px] tw-leading-snug tw-text-[var(--text-muted)]">Pencarian &amp; pertolongan<br>Jl. Wates Km 11, Sedayu</p>
                    </article>
                    <article class="report-contact-card report-contact-card--pmi">
                        <h4 class="tw-mb-1 tw-font-display tw-text-base tw-font-semibold tw-text-[var(--text-primary)]">PMI DIY</h4>
                        <p class="tw-mb-3 tw-font-ui tw-text-[11px] tw-font-semibold tw-uppercase tw-tracking-wide tw-text-[var(--text-muted)]">24 jam</p>
                        <a class="report-contact-num tw-mb-3 tw-block tw-font-mono tw-text-2xl tw-font-semibold tw-text-[var(--accent-gold)] hover:tw-text-amber-300" href="tel:+62274372474">0274-372474</a>
                        <p class="tw-text-[13px] tw-leading-snug tw-text-[var(--text-muted)]">Markas PMI Daerah<br>Jl. Siliwangi No.3, Gamping</p>
                    </article>
                    <article class="report-contact-card report-contact-card--fire">
                        <h4 class="tw-mb-1 tw-font-display tw-text-base tw-font-semibold tw-text-[var(--text-primary)]">Pemadam Kebakaran</h4>
                        <p class="tw-mb-3 tw-font-ui tw-text-[11px] tw-font-semibold tw-uppercase tw-tracking-wide tw-text-[var(--text-muted)]">24 jam</p>
                        <a class="report-contact-num tw-mb-3 tw-block tw-font-mono tw-text-2xl tw-font-semibold tw-text-[var(--accent-gold)] hover:tw-text-amber-300" href="tel:113">113</a>
                        <p class="tw-text-[13px] tw-leading-snug tw-text-[var(--text-muted)]">Mako Damkar<br>Jl. Mayor Suryotomo</p>
                    </article>
                    <article class="report-contact-card report-contact-card--hospital">
                        <h4 class="tw-mb-1 tw-font-display tw-text-base tw-font-semibold tw-text-[var(--text-primary)]">IGD RS Sardjito</h4>
                        <p class="tw-mb-3 tw-font-ui tw-text-[11px] tw-font-semibold tw-uppercase tw-tracking-wide tw-text-[var(--text-muted)]">IGD</p>
                        <a class="report-contact-num tw-mb-3 tw-block tw-font-mono tw-text-2xl tw-font-semibold tw-text-[var(--accent-gold)] hover:tw-text-amber-300" href="tel:+62274587400">0274-587400</a>
                        <p class="tw-text-[13px] tw-leading-snug tw-text-[var(--text-muted)]">Rujukan medis regional<br>Fakultas Kedokteran UGM</p>
                    </article>
                </div>
            </div>
        </div>`;

    const cycles = {
        year: ['all', 2024, 2023, 2022],
        jenis: ['all', 'Erupsi', 'Banjir', 'Gempa'],
        kecamatan: ['all', 'Cangkringan', 'Gamping', 'Bantul'],
        risk: ['all', 'Siaga', 'Selesai', 'Waspada']
    };

    const bump = (key) => {
        const arr = cycles[key];
        const i = arr.indexOf(filterState[key]);
        filterState[key] = arr[(i < 0 ? 0 : i + 1) % arr.length];
        container.querySelectorAll('.filter-pill[data-filter]').forEach((p) => p.classList.remove('active'));
        const L = pillLabel();
        const btn = container.querySelector(`[data-filter="${key}"]`);
        if (btn) {
            btn.textContent = L[key];
            btn.classList.add('active');
        }
        applyFilters(container, filterState);
    };

    container.querySelectorAll('.filter-pill[data-filter]').forEach((btn) => {
        btn.addEventListener('click', (e) => bump(e.currentTarget.dataset.filter));
    });
    container.querySelector('#report-filter-reset')?.addEventListener('click', () => {
        filterState.year = 'all';
        filterState.jenis = 'all';
        filterState.kecamatan = 'all';
        filterState.risk = 'all';
        const L = pillLabel();
        ['year', 'jenis', 'kecamatan', 'risk'].forEach((k) => {
            const b = container.querySelector(`[data-filter="${k}"]`);
            if (b) {
                b.textContent = L[k];
                b.classList.add('active');
            }
        });
        applyFilters(container, filterState);
    });

    wireReportPageAnimations(container);
    applyFilters(container, filterState);
}

function formatReportKpi(value, decimals) {
    const v = decimals > 0 ? Number(value.toFixed(decimals)) : Math.round(value);
    if (decimals > 0) return v.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    return v.toLocaleString('id-ID');
}

function wireReportPageAnimations(container) {
    requestAnimationFrame(() => {
        container.querySelectorAll('.report-kpi-stagger').forEach((el, i) => {
            el.style.transitionDelay = `${i * 70}ms`;
            requestAnimationFrame(() => el.classList.add('report-kpi-visible'));
        });
    });
}

function initReportCharts(years, agg) {
    if (typeof Chart === 'undefined') return;

    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg-elevated').trim() || 'rgba(15, 23, 41, 0.96)';
    const gold = '#d4a017';
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif';
    Chart.defaults.plugins.tooltip.backgroundColor = bg;
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(212,160,23,0.35)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.titleColor = gold;
    Chart.defaults.plugins.tooltip.bodyColor = '#f0ede4';
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.displayColors = true;

    const ys = years.map(String);
    const counts = agg.map((a) => a.n);
    const losses = agg.map((a) => Math.round(a.loss * 1000) / 1000);
    const korbans = agg.map((a) => a.korban);
    const sumCount = counts.reduce((a, b) => a + b, 0) || 1;

    const c1 = new Chart(document.getElementById('reportChartTrend'), {
        type: 'line',
        data: {
            labels: ys,
            datasets: [
                {
                    label: 'Kejadian (jumlah)',
                    data: counts,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    yAxisID: 'y',
                    tension: 0.4
                },
                {
                    label: 'Korban jiwa',
                    data: korbans,
                    borderColor: '#ef4444',
                    backgroundColor: '#ef4444',
                    yAxisID: 'y1',
                    type: 'bar',
                    borderRadius: 4,
                    barPercentage: 0.5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 1100, easing: 'easeOutQuart' },
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'top', align: 'end', labels: { boxWidth: 10 } },
                tooltip: {
                    callbacks: {
                        label(ctx) {
                            const v = ctx.parsed?.y ?? ctx.parsed;
                            const n = typeof v === 'number' ? v.toLocaleString('id-ID') : String(v);
                            return ` ${ctx.dataset.label}: ${n}`;
                        },
                        footer(items) {
                            if (!items.length) return [];
                            const raw = items[0].parsed;
                            const val = typeof raw === 'number' ? raw : raw?.y ?? raw?.r;
                            if (val == null || !sumCount) return [];
                            const pct = ((val / sumCount) * 100).toFixed(1);
                            return [`Bagian dari total: ${pct}%`, `Total (kejadian): ${sumCount.toLocaleString('id-ID')}`];
                        }
                    }
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: { type: 'linear', display: true, position: 'left', grid: { color: 'rgba(255,255,255,0.05)' } },
                y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
            }
        }
    });

    const sumLoss = losses.reduce((a, b) => a + b, 0) || 1;

    const c2 = new Chart(document.getElementById('reportChartLoss'), {
        type: 'bar',
        data: {
            labels: ys,
            datasets: [
                {
                    label: 'Kerugian (Miliar Rp)',
                    data: losses,
                    backgroundColor: 'rgba(59, 130, 246, 0.85)',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 1000, easing: 'easeOutCubic' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label(ctx) {
                            const v = ctx.parsed?.y ?? ctx.parsed;
                            const n = typeof v === 'number' ? v.toLocaleString('id-ID', { maximumFractionDigits: 3 }) : String(v);
                            return ` ${ctx.dataset.label}: ${n}`;
                        },
                        footer(items) {
                            if (!items.length) return [];
                            const raw = items[0].parsed;
                            const val = typeof raw === 'number' ? raw : raw?.y ?? raw?.r;
                            if (val == null || !sumLoss) return [];
                            const pct = ((val / sumLoss) * 100).toFixed(1);
                            return [`Bagian dari total: ${pct}%`, `Total kerugian (M): ${sumLoss.toLocaleString('id-ID', { maximumFractionDigits: 3 })}`];
                        }
                    }
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
    _reportCharts.push(c1, c2);
}
