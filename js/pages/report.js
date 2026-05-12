export function initReportPage() {
    const container = document.getElementById('laporan-content');
    if (!container) return;

    container.innerHTML = `
        <div class="report-dashboard tw-mx-auto tw-max-w-6xl tw-px-4 tw-py-6 tw-text-[var(--text-primary)] md:tw-px-6">
            <p class="tw-mb-6 tw-max-w-3xl tw-text-sm tw-leading-relaxed tw-text-[var(--text-secondary)]">
                Ringkasan kejadian bencana di DIY (data contoh untuk tata letak dashboard). Gunakan filter untuk menyempitkan rentang waktu saat laporan resmi tersedia.
            </p>

            <div class="tw-mb-8 tw-grid tw-grid-cols-2 tw-gap-4 md:tw-grid-cols-4">
                <div class="report-kpi-stagger tw-border-l-[3px] tw-border-amber-500 tw-pl-4">
                    <div class="tw-mb-1 tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-[var(--text-muted)]">Total Kejadian</div>
                    <div class="report-font-mono tw-text-3xl tw-font-bold tw-leading-none md:tw-text-4xl">452</div>
                </div>
                <div class="report-kpi-stagger tw-border-l-[3px] tw-border-red-500 tw-pl-4">
                    <div class="tw-mb-1 tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-[var(--text-muted)]">Total Korban Jiwa</div>
                    <div class="report-font-mono tw-text-3xl tw-font-bold tw-leading-none md:tw-text-4xl">1,240</div>
                </div>
                <div class="report-kpi-stagger tw-border-l-[3px] tw-border-sky-500 tw-pl-4">
                    <div class="tw-mb-1 tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-[var(--text-muted)]">Total Pengungsi</div>
                    <div class="report-font-mono tw-text-3xl tw-font-bold tw-leading-none md:tw-text-4xl">12.5K</div>
                </div>
                <div class="report-kpi-stagger tw-border-l-[3px] tw-border-emerald-500 tw-pl-4">
                    <div class="tw-mb-1 tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-[var(--text-muted)]">Total Kerugian</div>
                    <div class="report-font-mono tw-text-3xl tw-font-bold tw-leading-none md:tw-text-4xl">8.4T</div>
                </div>
            </div>

            <div class="tw-mb-8 tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-4 tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-card)] tw-p-4 md:tw-p-5">
                <div class="tw-flex tw-flex-wrap tw-items-center tw-gap-2">
                    <span class="tw-mr-1 tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wide tw-text-[var(--text-muted)]">Filter</span>
                    <button type="button" class="filter-pill tw-rounded-full tw-border tw-border-white/10 tw-bg-[var(--bg-elevated)] tw-px-4 tw-py-1.5 tw-text-[13px] tw-text-[var(--text-primary)] tw-transition-colors hover:tw-border-amber-500/60">Semua Tahun ▼</button>
                    <button type="button" class="filter-pill tw-rounded-full tw-border tw-border-white/10 tw-bg-[var(--bg-elevated)] tw-px-4 tw-py-1.5 tw-text-[13px] tw-text-[var(--text-primary)] tw-transition-colors hover:tw-border-amber-500/60">Jenis Bencana ▼</button>
                    <button type="button" class="filter-pill tw-rounded-full tw-border tw-border-white/10 tw-bg-[var(--bg-elevated)] tw-px-4 tw-py-1.5 tw-text-[13px] tw-text-[var(--text-primary)] tw-transition-colors hover:tw-border-amber-500/60">Kecamatan ▼</button>
                    <button type="button" class="filter-pill tw-rounded-full tw-border tw-border-white/10 tw-bg-[var(--bg-elevated)] tw-px-4 tw-py-1.5 tw-text-[13px] tw-text-[var(--text-primary)] tw-transition-colors hover:tw-border-amber-500/60">Tingkat Risiko ▼</button>
                </div>
                <button type="button" class="tw-text-sm tw-text-amber-500 tw-underline tw-underline-offset-2 hover:tw-text-amber-400">Reset Filter</button>
            </div>

            <div class="tw-mb-10 tw-grid tw-grid-cols-1 tw-gap-5 lg:tw-grid-cols-2">
                <div class="tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-card)] tw-p-5">
                    <h3 class="tw-mb-4 tw-text-[15px] tw-font-semibold tw-text-[var(--text-primary)]">Tren Kejadian & Korban per Tahun</h3>
                    <div class="tw-relative tw-h-[300px]"><canvas id="reportChartTrend"></canvas></div>
                </div>
                <div class="tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-card)] tw-p-5">
                    <h3 class="tw-mb-4 tw-text-[15px] tw-font-semibold tw-text-[var(--text-primary)]">Total Kerugian Material (Rp Miliar)</h3>
                    <div class="tw-relative tw-h-[300px]"><canvas id="reportChartLoss"></canvas></div>
                </div>
            </div>

            <div class="tw-mb-12">
                <h3 class="tw-mb-6 tw-border-b tw-border-[var(--border-card)] tw-pb-3 tw-text-lg tw-font-semibold tw-text-[var(--text-primary)]">Riwayat Bencana</h3>

                <div class="tw-relative tw-pl-6 tw-border-l-2 tw-border-red-500/35 md:tw-pl-8">
                    <div class="report-tl-item report-tl-slide-from-left tw-relative tw-mb-8">
                        <div class="tw-absolute tw-left-[-29px] tw-top-1 tw-h-3 tw-w-3 tw-rounded-full tw-border-2 tw-border-[var(--bg-primary)] tw-bg-red-500 md:tw-left-[-33px]"></div>
                        <div class="tw-rounded-lg tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-card)] tw-p-5">
                            <div class="tw-mb-3 tw-flex tw-flex-wrap tw-items-start tw-justify-between tw-gap-3">
                                <div>
                                    <div class="tw-mb-1 report-font-mono tw-text-[13px] tw-text-amber-500">12 Mar 2024 • 14:30 WIB</div>
                                    <h4 class="tw-mb-1 report-font-display tw-text-lg tw-font-semibold tw-text-[var(--text-primary)]">Erupsi Freatik Gunung Merapi</h4>
                                    <div class="tw-text-[13px] tw-text-[var(--text-muted)]">Kecamatan Cangkringan, Kabupaten Sleman</div>
                                </div>
                                <span class="tw-rounded tw-border tw-border-red-500/25 tw-bg-red-500/10 tw-px-2.5 tw-py-1 tw-text-[11px] tw-font-semibold tw-text-red-400">Siaga Aktif</span>
                            </div>
                            <p class="tw-mb-4 tw-text-sm tw-leading-relaxed tw-text-[var(--text-secondary)]">
                                Telah terjadi erupsi freatik dengan tinggi kolom abu mencapai 2.500 meter di atas puncak. Angin bertiup ke arah barat daya. Hujan abu vulkanik melanda beberapa desa di kawasan KRB III.
                            </p>
                            <div class="tw-mb-4 tw-flex tw-flex-wrap tw-gap-6">
                                <div><span class="tw-block tw-text-xs tw-text-[var(--text-muted)]">Korban Jiwa</span><strong class="report-font-mono tw-text-[15px]">0</strong></div>
                                <div><span class="tw-block tw-text-xs tw-text-[var(--text-muted)]">Luka-luka</span><strong class="report-font-mono tw-text-[15px]">12</strong></div>
                                <div><span class="tw-block tw-text-xs tw-text-[var(--text-muted)]">Pengungsi</span><strong class="report-font-mono tw-text-[15px]">450</strong></div>
                                <div><span class="tw-block tw-text-xs tw-text-[var(--text-muted)]">Kerugian</span><strong class="report-font-mono tw-text-[15px]">Rp 2.5 M</strong></div>
                            </div>
                            <div class="tw-mb-4">
                                <div class="tw-mb-1 tw-flex tw-justify-between tw-text-xs">
                                    <span class="tw-text-[var(--text-muted)]">Kapasitas barak (Balai Desa Glagaharjo)</span>
                                    <span class="tw-text-[var(--text-secondary)]">450 / 800</span>
                                </div>
                                <div class="tw-h-1.5 tw-overflow-hidden tw-rounded-full tw-bg-white/10">
                                    <div class="tw-h-full tw-w-[56%] tw-rounded-full tw-bg-amber-500"></div>
                                </div>
                            </div>
                            <div class="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3 tw-border-t tw-border-[var(--border-card)] tw-pt-4">
                                <div class="tw-text-[13px] tw-text-[var(--text-muted)]">Kontak: <strong class="tw-text-[var(--text-secondary)]">BPBD Sleman (0274-869902)</strong></div>
                                <button type="button" class="btn-primary tw-rounded tw-border tw-border-sky-500 tw-bg-transparent tw-px-4 tw-py-1.5 tw-text-[13px] tw-text-sky-400 hover:tw-bg-sky-500/10">Lihat di Peta</button>
                            </div>
                        </div>
                    </div>

                    <div class="report-tl-item report-tl-slide-from-right tw-relative tw-mb-8">
                        <div class="tw-absolute tw-left-[-29px] tw-top-1 tw-h-3 tw-w-3 tw-rounded-full tw-border-2 tw-border-[var(--bg-primary)] tw-bg-emerald-500 md:tw-left-[-33px]"></div>
                        <div class="tw-rounded-lg tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-card)] tw-p-5">
                            <div class="tw-mb-3 tw-flex tw-flex-wrap tw-items-start tw-justify-between tw-gap-3">
                                <div>
                                    <div class="tw-mb-1 report-font-mono tw-text-[13px] tw-text-amber-500">05 Jan 2024 • 02:15 WIB</div>
                                    <h4 class="tw-mb-1 report-font-display tw-text-lg tw-font-semibold tw-text-[var(--text-primary)]">Banjir Genangan Hujan Ekstrem</h4>
                                    <div class="tw-text-[13px] tw-text-[var(--text-muted)]">Kecamatan Gamping, Kabupaten Sleman</div>
                                </div>
                                <span class="tw-rounded tw-border tw-border-emerald-500/25 tw-bg-emerald-500/10 tw-px-2.5 tw-py-1 tw-text-[11px] tw-font-semibold tw-text-emerald-400">Selesai</span>
                            </div>
                            <p class="tw-mb-4 tw-text-sm tw-leading-relaxed tw-text-[var(--text-secondary)]">
                                Curah hujan tinggi menyebabkan meluapnya Sungai Bedog. Genangan 50–80 cm merendam empat pedukuhan di wilayah Gamping.
                            </p>
                            <div class="tw-mb-4 tw-flex tw-flex-wrap tw-gap-6">
                                <div><span class="tw-block tw-text-xs tw-text-[var(--text-muted)]">Korban Jiwa</span><strong class="report-font-mono tw-text-[15px]">0</strong></div>
                                <div><span class="tw-block tw-text-xs tw-text-[var(--text-muted)]">Luka-luka</span><strong class="report-font-mono tw-text-[15px]">0</strong></div>
                                <div><span class="tw-block tw-text-xs tw-text-[var(--text-muted)]">Pengungsi</span><strong class="report-font-mono tw-text-[15px]">85</strong></div>
                                <div><span class="tw-block tw-text-xs tw-text-[var(--text-muted)]">Kerugian</span><strong class="report-font-mono tw-text-[15px]">Rp 120 Jt</strong></div>
                            </div>
                            <div class="tw-mb-4">
                                <div class="tw-mb-1 tw-flex tw-justify-between tw-text-xs">
                                    <span class="tw-text-[var(--text-muted)]">Kapasitas pengungsian (Masjid Patukan)</span>
                                    <span class="tw-text-[var(--text-secondary)]">0 / 150</span>
                                </div>
                                <div class="tw-h-1.5 tw-overflow-hidden tw-rounded-full tw-bg-white/10">
                                    <div class="tw-h-full tw-w-0 tw-rounded-full tw-bg-emerald-500"></div>
                                </div>
                            </div>
                            <div class="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3 tw-border-t tw-border-[var(--border-card)] tw-pt-4">
                                <div class="tw-text-[13px] tw-text-[var(--text-muted)]">Kontak: <strong class="tw-text-[var(--text-secondary)]">Polsek Gamping (0274-798221)</strong></div>
                                <button type="button" class="btn-primary tw-rounded tw-border tw-border-sky-500 tw-bg-transparent tw-px-4 tw-py-1.5 tw-text-[13px] tw-text-sky-400 hover:tw-bg-sky-500/10">Lihat di Peta</button>
                            </div>
                        </div>
                    </div>

                    <div class="report-tl-item report-tl-slide-from-left tw-relative">
                        <div class="tw-absolute tw-left-[-29px] tw-top-1 tw-h-3 tw-w-3 tw-rounded-full tw-border-2 tw-border-[var(--bg-primary)] tw-bg-orange-500 md:tw-left-[-33px]"></div>
                        <div class="tw-rounded-lg tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-card)] tw-p-5">
                            <div class="tw-mb-3 tw-flex tw-flex-wrap tw-items-start tw-justify-between tw-gap-3">
                                <div>
                                    <div class="tw-mb-1 report-font-mono tw-text-[13px] tw-text-amber-500">18 Nov 2023 • 08:42 WIB</div>
                                    <h4 class="tw-mb-1 report-font-display tw-text-lg tw-font-semibold tw-text-[var(--text-primary)]">Gempa M4.8 Lokal DIY</h4>
                                    <div class="tw-text-[13px] tw-text-[var(--text-muted)]">Kabupaten Bantul &amp; Kota Yogyakarta</div>
                                </div>
                                <span class="tw-rounded tw-border tw-border-amber-500/30 tw-bg-amber-500/10 tw-px-2.5 tw-py-1 tw-text-[11px] tw-font-semibold tw-text-amber-400">Dalam pemantauan</span>
                            </div>
                            <p class="tw-mb-4 tw-text-sm tw-leading-relaxed tw-text-[var(--text-secondary)]">
                                Gempa dangkal dirasakan MM IV–V di pusat kota. Sejumlah struktur retak ringan; tidak ada laporan korban jiwa. Tim cepat BPBD melakukan asesmen fasilitas vital.
                            </p>
                            <div class="tw-mb-4 tw-flex tw-flex-wrap tw-gap-6">
                                <div><span class="tw-block tw-text-xs tw-text-[var(--text-muted)]">Korban Jiwa</span><strong class="report-font-mono tw-text-[15px]">0</strong></div>
                                <div><span class="tw-block tw-text-xs tw-text-[var(--text-muted)]">Luka-luka</span><strong class="report-font-mono tw-text-[15px]">3</strong></div>
                                <div><span class="tw-block tw-text-xs tw-text-[var(--text-muted)]">Pengungsi sementara</span><strong class="report-font-mono tw-text-[15px]">42</strong></div>
                                <div><span class="tw-block tw-text-xs tw-text-[var(--text-muted)]">Kerugian estimasi</span><strong class="report-font-mono tw-text-[15px]">Rp 4.1 M</strong></div>
                            </div>
                            <div class="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3 tw-border-t tw-border-[var(--border-card)] tw-pt-4">
                                <div class="tw-text-[13px] tw-text-[var(--text-muted)]">Kontak: <strong class="tw-text-[var(--text-secondary)]">BMKG DIY (0274-511064)</strong></div>
                                <button type="button" class="btn-primary tw-rounded tw-border tw-border-sky-500 tw-bg-transparent tw-px-4 tw-py-1.5 tw-text-[13px] tw-text-sky-400 hover:tw-bg-sky-500/10">Lihat di Peta</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h3 class="tw-mb-5 tw-border-b tw-border-[var(--border-card)] tw-pb-3 tw-text-lg tw-font-semibold tw-text-[var(--text-primary)]">Pusat Kontak Darurat</h3>
                <div class="tw-grid tw-grid-cols-1 tw-gap-4 sm:tw-grid-cols-2 xl:tw-grid-cols-4">
                    <div class="tw-rounded-lg tw-border tw-border-[var(--border-card)] tw-border-l-4 tw-border-l-red-500 tw-bg-[rgba(16,22,40,0.6)] tw-p-5">
                        <h4 class="tw-mb-2 tw-text-base tw-font-semibold">BPBD DIY</h4>
                        <div class="tw-mb-3 report-font-mono tw-text-lg tw-text-amber-500">(0274) 555584</div>
                        <p class="tw-text-[13px] tw-leading-snug tw-text-[var(--text-muted)]">Pusdalops PB DIY<br>Jl. Kenari No.14, Semaki<br>Layanan 24 jam</p>
                    </div>
                    <div class="tw-rounded-lg tw-border tw-border-[var(--border-card)] tw-border-l-4 tw-border-l-orange-500 tw-bg-[rgba(16,22,40,0.6)] tw-p-5">
                        <h4 class="tw-mb-2 tw-text-base tw-font-semibold">Basarnas (Kantor SAR)</h4>
                        <div class="tw-mb-3 report-font-mono tw-text-lg tw-text-amber-500">115 / (0274) 4333604</div>
                        <p class="tw-text-[13px] tw-leading-snug tw-text-[var(--text-muted)]">Kantor Pencarian dan Pertolongan<br>Jl. Wates Km 11, Sedayu<br>Layanan 24 jam</p>
                    </div>
                    <div class="tw-rounded-lg tw-border tw-border-[var(--border-card)] tw-border-l-4 tw-border-l-sky-500 tw-bg-[rgba(16,22,40,0.6)] tw-p-5">
                        <h4 class="tw-mb-2 tw-text-base tw-font-semibold">PMI DIY</h4>
                        <div class="tw-mb-3 report-font-mono tw-text-lg tw-text-amber-500">(0274) 372474</div>
                        <p class="tw-text-[13px] tw-leading-snug tw-text-[var(--text-muted)]">Markas Daerah<br>Jl. Siliwangi No.3, Gamping<br>Layanan 24 jam</p>
                    </div>
                    <div class="tw-rounded-lg tw-border tw-border-[var(--border-card)] tw-border-l-4 tw-border-l-emerald-500 tw-bg-[rgba(16,22,40,0.6)] tw-p-5">
                        <h4 class="tw-mb-2 tw-text-base tw-font-semibold">Dinas Pemadam Kebakaran</h4>
                        <div class="tw-mb-3 report-font-mono tw-text-lg tw-text-amber-500">113 / (0274) 587101</div>
                        <p class="tw-text-[13px] tw-leading-snug tw-text-[var(--text-muted)]">Mako Damkar Kota<br>Jl. Mayor Suryotomo<br>Layanan 24 jam</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    wireReportPageAnimations(container);
    setTimeout(initReportCharts, 100);
}

function wireReportPageAnimations(container) {
    requestAnimationFrame(() => {
        container.querySelectorAll('.report-kpi-stagger').forEach((el, i) => {
            el.style.transitionDelay = `${i * 70}ms`;
            requestAnimationFrame(() => el.classList.add('report-kpi-visible'));
        });
    });

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

    container.querySelectorAll('.filter-pill').forEach((btn) => {
        btn.addEventListener('click', () => btn.classList.toggle('active'));
    });
}

function initReportCharts() {
    if (typeof Chart === 'undefined') return;

    new Chart(document.getElementById('reportChartTrend'), {
        type: 'line',
        data: {
            labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
            datasets: [
                {
                    label: 'Kejadian',
                    data: [42, 38, 45, 55, 48, 62, 50],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    yAxisID: 'y',
                    tension: 0.4
                },
                {
                    label: 'Korban Jiwa',
                    data: [15, 8, 22, 30, 12, 45, 18],
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
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { position: 'top', align: 'end', labels: { boxWidth: 10 } } },
            scales: {
                x: { grid: { display: false } },
                y: { type: 'linear', display: true, position: 'left', grid: { color: 'rgba(255,255,255,0.05)' } },
                y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
            }
        }
    });

    new Chart(document.getElementById('reportChartLoss'), {
        type: 'bar',
        data: {
            labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
            datasets: [{
                label: 'Kerugian (Miliar Rp)',
                data: [120, 85, 210, 150, 190, 320, 180],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
}
