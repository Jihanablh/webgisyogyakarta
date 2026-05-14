
import { CONFIG, State } from '../state.js';

let _statCharts = [];
let _statChoroMap = null;
let _statChoroLayer = null;

/** Kotak perkiraan per kecamatan (untuk agregasi titik/centroid dari data kebencanaan). */
const KECAMATAN_BOXES = [
    { name: 'Cangkringan', w: 110.36, s: -7.7, e: 110.5, n: -7.58 },
    { name: 'Ngemplak', w: 110.42, s: -7.78, e: 110.52, n: -7.68 },
    { name: 'Pakem', w: 110.38, s: -7.62, e: 110.48, n: -7.52 },
    { name: 'Turi', w: 110.32, s: -7.62, e: 110.4, n: -7.54 },
    { name: 'Prambanan', w: 110.48, s: -7.8, e: 110.58, n: -7.72 },
    { name: 'Depok', w: 110.38, s: -7.82, e: 110.46, n: -7.72 },
    { name: 'Gamping', w: 110.28, s: -7.82, e: 110.36, n: -7.74 },
    { name: 'Kota Yogyakarta', w: 110.35, s: -7.82, e: 110.42, n: -7.74 },
    { name: 'Bantul', w: 110.28, s: -7.96, e: 110.4, n: -7.86 },
    { name: 'Sleman (lain)', w: 110.3, s: -7.72, e: 110.55, n: -7.58 },
    { name: 'Gunungkidul', w: 110.48, s: -8.05, e: 110.72, n: -7.78 },
    { name: 'Kulon Progo', w: 110.05, s: -7.9, e: 110.28, n: -7.68 }
];

function inBox(lat, lng, b) {
    const minLat = Math.min(b.s, b.n);
    const maxLat = Math.max(b.s, b.n);
    const minLng = Math.min(b.w, b.e);
    const maxLng = Math.max(b.w, b.e);
    return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

function featureCentroid(f) {
    const g = f.geometry;
    if (!g) return null;
    if (g.type === 'Point') {
        const [lng, lat] = g.coordinates;
        return [lat, lng];
    }
    if (g.type === 'Polygon' && g.coordinates?.[0]?.length) {
        const ring = g.coordinates[0];
        let sx = 0;
        let sy = 0;
        ring.forEach(([x, y]) => {
            sx += x;
            sy += y;
        });
        return [sy / ring.length, sx / ring.length];
    }
    if (g.type === 'LineString' && g.coordinates?.length) {
        const ring = g.coordinates;
        let sx = 0;
        let sy = 0;
        ring.forEach(([x, y]) => {
            sx += x;
            sy += y;
        });
        return [sy / ring.length, sx / ring.length];
    }
    return null;
}

function getChoroColor(t) {
    if (t <= 0) return '#14532d';
    if (t < 0.15) return '#22c55e';
    if (t < 0.35) return '#84cc16';
    if (t < 0.55) return '#eab308';
    if (t < 0.75) return '#f97316';
    return '#991b1b';
}

function buildKecamatanCounts(features) {
    const counts = Object.fromEntries(KECAMATAN_BOXES.map((b) => [b.name, 0]));
    const list = Array.isArray(features) ? features : [];
    list.forEach((f) => {
        const c = featureCentroid(f);
        if (!c) return;
        const [lat, lng] = c;
        for (const b of KECAMATAN_BOXES) {
            if (inBox(lat, lng, b)) {
                counts[b.name] += 1;
                return;
            }
        }
    });
    return counts;
}

function destroyStatCharts() {
    _statCharts.forEach((c) => {
        try {
            c.destroy();
        } catch (_) {}
    });
    _statCharts = [];
    if (_statChoroMap) {
        try {
            _statChoroMap.remove();
        } catch (_) {}
        _statChoroMap = null;
    }
    _statChoroLayer = null;
}

function formatStatKpi(value, decimals) {
    const v = decimals > 0 ? Number(value.toFixed(decimals)) : Math.round(value);
    if (decimals > 0) {
        return v.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    return v.toLocaleString('id-ID');
}

function animateStatKpiValue(el, target, decimals, durationMs) {
    const from = 0;
    const t0 = performance.now();
    function frame(now) {
        const t = Math.min(1, (now - t0) / durationMs);
        const eased = 1 - (1 - t) ** 3;
        const v = from + (target - from) * eased;
        el.textContent = formatStatKpi(v, decimals);
        if (t < 1) requestAnimationFrame(frame);
        else el.textContent = formatStatKpi(target, decimals);
    }
    requestAnimationFrame(frame);
}

function wireStatKpiCounters(container) {
    const grid = container.querySelector('.stat-kpi-grid');
    const nums = container.querySelectorAll('.stat-kpi-num[data-target]');
    if (!grid || !nums.length) return;

    const run = () => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        nums.forEach((el) => {
            const target = parseFloat(el.dataset.target, 10);
            const decimals = parseInt(el.dataset.decimals || '0', 10);
            if (Number.isNaN(target)) return;
            if (reduce) el.textContent = formatStatKpi(target, decimals);
            else animateStatKpiValue(el, target, decimals, 1400);
        });
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        run();
        return;
    }
    const io = new IntersectionObserver(
        (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
                run();
                io.disconnect();
            }
        },
        { threshold: 0.12 }
    );
    io.observe(grid);
}

function wireStatSectionsIO(container) {
    const sections = container.querySelectorAll('.stat-io-section');
    if (!sections.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        sections.forEach((s) => s.classList.add('stat-io-visible'));
        return;
    }
    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('stat-io-visible');
                    io.unobserve(e.target);
                }
            });
        },
        { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );
    sections.forEach((s) => io.observe(s));
}

function renderChoroLegend(el, maxVal) {
    if (!el) return;
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(t * maxVal));
    el.innerHTML = `
        <div class="stat-choro-legend-title">Intensitas heatmap</div>
        <div class="stat-choro-legend-scale" aria-hidden="true"></div>
        <div class="stat-choro-legend-ticks">${ticks.map((x) => `<span>${x}</span>`).join('')}</div>
        <p class="stat-choro-legend-note">Gradien biru dingin hingga merah terang. Area panas menunjukkan konsentrasi titik kebencanaan lebih tinggi.</p>`;
    const scale = el.querySelector('.stat-choro-legend-scale');
    if (scale) {
        scale.style.background =
            'linear-gradient(90deg,#1d4ed8 0%,#22d3ee 24%,#fde047 58%,#fb923c 80%,#ef4444 100%)';
    }
}

function initStatChoropleth() {
    const el = document.getElementById('stat-choro-map');
    const legendEl = document.getElementById('stat-choro-legend');
    if (!el || typeof L === 'undefined') return;
    if (_statChoroMap) {
        try { _statChoroMap.remove(); } catch (_) {}
        _statChoroMap = null;
    }
    const m = L.map(el, {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false,
        preferCanvas: true
    }).setView(CONFIG.center, 10);

    L.tileLayer(CONFIG.tileUrl, {
        attribution: CONFIG.tileAttribution,
        maxZoom: CONFIG.maxZoom,
        minZoom: CONFIG.minZoom
    }).addTo(m);

    let features = State.rawGeojsonCache?.kebencanaan;
    if (!Array.isArray(features) || !features.length) features = [];

    const heatPoints = [];
    features.forEach(f => {
        const c = featureCentroid(f);
        if (!c) return;
        const lr = (f.properties?.level_risiko || '').toLowerCase();
        let intensity = 0.5;
        if (lr.includes('sangat tinggi')) intensity = 1.0;
        else if (lr === 'tinggi') intensity = 0.85;
        else if (lr === 'sedang') intensity = 0.55;
        else if (lr === 'rendah') intensity = 0.3;
        heatPoints.push([c[0], c[1], intensity]);
    });

    _statChoroLayer = L.heatLayer(heatPoints, {
        radius: 90,
        blur: 65,
        maxZoom: 14,
        minOpacity: 0.5,
        gradient: {
            0.0: '#1d4ed8',
            0.2: '#06b6d4',
            0.45: '#fde047',
            0.72: '#fb923c',
            1.0:  '#ef4444'
        }
    }).addTo(m);

    // Tambah batas wilayah DIY
    fetch('data/yogyakarta_boundary.geojson')
        .then(r => r.json())
        .then(geojson => {
            L.geoJSON(geojson, {
                style: { color: '#2980b9', weight: 1.5, opacity: 0.75, fillColor: 'transparent', fillOpacity: 0 }
            }).addTo(m);
        })
        .catch(() => {});

    renderChoroLegend(legendEl, heatPoints.length);
    _statChoroMap = m;
    requestAnimationFrame(() => setTimeout(() => { try { m.invalidateSize(); } catch (_) {} }, 280));
}

export function initStatisticsPage() {
    const container = document.getElementById('statistik-content');
    if (!container) return;
    destroyStatCharts();

    container.innerHTML = `
        <div class="stat-dashboard tw-mx-auto tw-max-w-[1400px] tw-px-4 tw-py-6 tw-text-[var(--text-primary)] md:tw-px-6">
            <p class="stat-io-section tw-mb-6 tw-max-w-3xl tw-font-body tw-text-sm tw-leading-relaxed tw-text-[var(--text-secondary)]">
                Ringkasan agregat data kebencanaan wilayah DIY berbasis sampel operasional untuk keperluan demonstrasi dashboard.
                Angka dan grafik bersifat ilustratif dan tidak menggantikan laporan resmi BPBD.
            </p>

            <div class="stat-io-section stat-kpi-grid tw-mb-6 tw-grid tw-grid-cols-1 tw-gap-5 sm:tw-grid-cols-2 xl:tw-grid-cols-4">
                <div class="tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-card)] tw-p-6 tw-shadow-[0_0_0_1px_rgba(212,160,23,0.06)]">
                    <div class="tw-mb-2 tw-font-ui tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-[var(--text-muted)]">Total Daerah Terdampak</div>
                    <div class="tw-flex tw-flex-wrap tw-items-baseline tw-gap-2">
                        <span class="stat-kpi-num tw-font-mono tw-text-3xl tw-font-bold tw-text-[var(--accent-gold)] md:tw-text-4xl" data-target="142" data-decimals="0">0</span>
                        <span class="tw-font-mono tw-text-sm tw-text-[var(--accent-batik-red)]">↑ 12%</span>
                    </div>
                </div>
                <div class="tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-card)] tw-p-6">
                    <div class="tw-mb-2 tw-font-ui tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-[var(--text-muted)]">Populasi Berisiko</div>
                    <div class="tw-flex tw-flex-wrap tw-items-baseline tw-gap-2">
                        <span class="stat-kpi-num tw-font-mono tw-text-3xl tw-font-bold tw-text-[var(--accent-blue)] md:tw-text-4xl" data-target="84.5" data-decimals="1">0</span>
                        <span class="tw-font-ui tw-text-sm tw-text-[var(--text-secondary)]">ribu jiwa</span>
                        <span class="tw-font-mono tw-text-sm tw-text-[var(--accent-green)]">↓ 5%</span>
                    </div>
                </div>
                <div class="tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-card)] tw-p-6">
                    <div class="tw-mb-2 tw-font-ui tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-[var(--text-muted)]">Fasilitas Terdampak</div>
                    <div class="tw-flex tw-flex-wrap tw-items-baseline tw-gap-2">
                        <span class="stat-kpi-num tw-font-mono tw-text-3xl tw-font-bold tw-text-[var(--accent-merapi)] md:tw-text-4xl" data-target="28" data-decimals="0">0</span>
                        <span class="tw-font-mono tw-text-sm tw-text-[var(--accent-batik-red)]">↑ 2%</span>
                    </div>
                </div>
                <div class="tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-card)] tw-p-6">
                    <div class="tw-mb-2 tw-font-ui tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-[var(--text-muted)]">Kapasitas Pengungsian</div>
                    <div class="tw-flex tw-flex-wrap tw-items-baseline tw-gap-2">
                        <span class="stat-kpi-num tw-font-mono tw-text-3xl tw-font-bold tw-text-[var(--accent-green)] md:tw-text-4xl" data-target="12.4" data-decimals="1">0</span>
                        <span class="tw-font-ui tw-text-sm tw-text-[var(--text-secondary)]">ribu tempat tidur</span>
                    </div>
                    <div class="tw-mt-1 tw-font-ui tw-text-xs tw-text-[var(--text-muted)]">Sisa kapasitas ~4.2K (ilustratif)</div>
                </div>
            </div>

            <div class="stat-io-section tw-mb-6 tw-grid tw-grid-cols-1 tw-gap-5 lg:tw-grid-cols-[2fr_1fr]">
                <div class="tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-card)] tw-p-5">
                    <h3 class="tw-mb-4 tw-border-b tw-border-[var(--border-card)] tw-pb-3 tw-font-display tw-text-sm tw-font-semibold tw-tracking-wide tw-text-[var(--text-secondary)]">Distribusi Bencana per Kecamatan</h3>
                    <div class="tw-relative tw-h-[300px]"><canvas id="statChartDist"></canvas></div>
                </div>
                <div class="tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-card)] tw-p-5">
                    <h3 class="tw-mb-4 tw-border-b tw-border-[var(--border-card)] tw-pb-3 tw-font-display tw-text-sm tw-font-semibold tw-tracking-wide tw-text-[var(--text-secondary)]">Komposisi Jenis Bencana</h3>
                    <div class="tw-relative tw-h-[300px]"><canvas id="statChartComp"></canvas></div>
                </div>
            </div>

            <div class="stat-io-section tw-mb-6 tw-grid tw-grid-cols-1 tw-gap-5 md:tw-grid-cols-3">
                <div class="tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-card)] tw-p-5">
                    <h3 class="tw-mb-4 tw-border-b tw-border-[var(--border-card)] tw-pb-3 tw-font-display tw-text-sm tw-font-semibold tw-tracking-wide tw-text-[var(--text-secondary)]">Tren Kejadian Bencana per Tahun</h3>
                    <div class="tw-relative tw-h-[250px]"><canvas id="statChartTrend"></canvas></div>
                </div>
                <div class="tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-card)] tw-p-5">
                    <h3 class="tw-mb-4 tw-border-b tw-border-[var(--border-card)] tw-pb-3 tw-font-display tw-text-sm tw-font-semibold tw-tracking-wide tw-text-[var(--text-secondary)]">Frekuensi Bencana per Bulan</h3>
                    <div class="tw-relative tw-h-[250px]"><canvas id="statChartFreq"></canvas></div>
                </div>
                <div class="tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-card)] tw-p-5">
                    <h3 class="tw-mb-4 tw-border-b tw-border-[var(--border-card)] tw-pb-3 tw-font-display tw-text-sm tw-font-semibold tw-tracking-wide tw-text-[var(--text-secondary)]">Indeks Kerentanan per Wilayah</h3>
                    <div class="tw-relative tw-h-[250px]"><canvas id="statChartRadar"></canvas></div>
                </div>
            </div>

            <div class="stat-io-section stat-choro-section tw-mb-6 tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-card)] tw-p-5">
                <h3 class="tw-mb-1 tw-font-display tw-text-base tw-font-semibold tw-text-[var(--text-primary)]">Heatmap konsentrasi kebencanaan</h3>
                <p class="tw-mb-4 tw-max-w-3xl tw-font-body tw-text-xs tw-leading-relaxed tw-text-[var(--text-muted)]">
                    Visualisasi konsentrasi titik kebencanaan dengan intensitas warna kuat untuk area prioritas mitigasi.
                </p>
                <div class="stat-choro-row tw-flex tw-flex-col tw-gap-4 lg:tw-flex-row">
                    <div id="stat-choro-map" class="stat-choro-map tw-min-h-[320px] tw-flex-1 tw-overflow-hidden tw-rounded-lg tw-border tw-border-[var(--border-card)]"></div>
                    <div id="stat-choro-legend" class="stat-choro-legend tw-w-full tw-shrink-0 tw-rounded-lg tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-elevated)] tw-p-4 lg:tw-w-[220px]"></div>
                </div>
            </div>

            <div class="stat-io-section tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-card)] tw-p-5">
                <div class="tw-mb-4 tw-flex tw-flex-col tw-gap-3 sm:tw-flex-row sm:tw-items-center sm:tw-justify-between">
                    <h3 class="tw-font-display tw-text-sm tw-font-semibold tw-tracking-wide tw-text-[var(--text-secondary)]">Data Detail Wilayah</h3>
                    <div class="tw-flex tw-flex-wrap tw-gap-2">
                        <input type="text" placeholder="Cari kecamatan..." class="tw-min-w-[180px] tw-rounded-md tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-elevated)] tw-px-3 tw-py-2 tw-font-ui tw-text-sm tw-text-[var(--text-primary)] placeholder:tw-text-[var(--text-muted)]">
                        <button type="button" class="tw-rounded-md tw-border tw-border-[var(--border-glass)] tw-bg-[var(--bg-elevated)] tw-px-3 tw-py-2 tw-font-ui tw-text-sm tw-text-[var(--text-primary)] hover:tw-border-amber-500/50">Export CSV</button>
                    </div>
                </div>
                <div class="tw-overflow-x-auto">
                    <table class="tw-w-full tw-border-collapse tw-text-left tw-font-ui tw-text-[13px]">
                        <thead>
                            <tr class="tw-border-b tw-border-[var(--border-card)] tw-text-[var(--text-muted)]">
                                <th class="tw-p-3">Kecamatan</th>
                                <th class="tw-p-3">Jenis Bencana Utama</th>
                                <th class="tw-p-3 tw-font-mono">Luas (km²)</th>
                                <th class="tw-p-3 tw-font-mono">Populasi</th>
                                <th class="tw-p-3">Tingkat Risiko</th>
                                <th class="tw-p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody class="tw-text-[var(--text-secondary)]">
                            <tr class="tw-border-b tw-border-white/5 tw-bg-[rgba(192,57,43,0.08)]">
                                <td class="tw-p-3">Cangkringan</td>
                                <td class="tw-p-3">Erupsi Merapi</td>
                                <td class="tw-p-3 tw-font-mono">45.2</td>
                                <td class="tw-p-3 tw-font-mono">12,500</td>
                                <td class="tw-p-3 tw-font-semibold tw-text-red-400">Sangat Tinggi</td>
                                <td class="tw-p-3">Siaga Aktif</td>
                            </tr>
                            <tr class="tw-border-b tw-border-white/5 tw-bg-[rgba(230,126,34,0.08)]">
                                <td class="tw-p-3">Ngemplak</td>
                                <td class="tw-p-3">Banjir Lahar</td>
                                <td class="tw-p-3 tw-font-mono">18.4</td>
                                <td class="tw-p-3 tw-font-mono">24,100</td>
                                <td class="tw-p-3 tw-font-semibold tw-text-orange-400">Tinggi</td>
                                <td class="tw-p-3">Waspada</td>
                            </tr>
                            <tr class="tw-border-b tw-border-white/5">
                                <td class="tw-p-3">Depok</td>
                                <td class="tw-p-3">Gempa Bumi</td>
                                <td class="tw-p-3 tw-font-mono">32.1</td>
                                <td class="tw-p-3 tw-font-mono">115,000</td>
                                <td class="tw-p-3 tw-font-semibold tw-text-amber-400">Sedang</td>
                                <td class="tw-p-3">Aman</td>
                            </tr>
                            <tr class="tw-border-b tw-border-white/5">
                                <td class="tw-p-3">Gamping</td>
                                <td class="tw-p-3">Banjir Genangan</td>
                                <td class="tw-p-3 tw-font-mono">8.5</td>
                                <td class="tw-p-3 tw-font-mono">82,400</td>
                                <td class="tw-p-3 tw-font-semibold tw-text-amber-400">Sedang</td>
                                <td class="tw-p-3">Aman</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="tw-mt-4 tw-flex tw-flex-col tw-gap-2 tw-font-ui tw-text-xs tw-text-[var(--text-muted)] sm:tw-flex-row sm:tw-items-center sm:tw-justify-between">
                    <div>Menampilkan 1–4 dari 78 kecamatan (contoh)</div>
                    <div class="tw-flex tw-gap-1">
                        <button type="button" class="tw-rounded tw-border tw-border-[var(--border-card)] tw-bg-transparent tw-px-2 tw-py-1 tw-text-[var(--text-secondary)]">Prev</button>
                        <button type="button" class="tw-rounded tw-border tw-border-[var(--border-glass)] tw-bg-[var(--bg-elevated)] tw-px-2 tw-py-1 tw-text-[var(--text-primary)]">1</button>
                        <button type="button" class="tw-rounded tw-border tw-border-[var(--border-card)] tw-bg-transparent tw-px-2 tw-py-1 tw-text-[var(--text-secondary)]">2</button>
                        <button type="button" class="tw-rounded tw-border tw-border-[var(--border-card)] tw-bg-transparent tw-px-2 tw-py-1 tw-text-[var(--text-secondary)]">Next</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    wireStatSectionsIO(container);
    wireStatKpiCounters(container);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            initCharts();
            initStatChoropleth();
            setTimeout(() => {
                try {
                    _statChoroMap?.invalidateSize();
                } catch (_) {}
            }, 400);
        });
    });
}

const chartAnim = { duration: 1100, easing: 'easeOutQuart' };

function initCharts() {
    if (typeof Chart === 'undefined') return;

    const bgElev = getComputedStyle(document.documentElement).getPropertyValue('--bg-elevated').trim() || 'rgba(19, 29, 53, 0.96)';
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif';
    Chart.defaults.plugins.tooltip.backgroundColor = bgElev;
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(212,160,23,0.35)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.titleColor = '#d4a017';
    Chart.defaults.plugins.tooltip.bodyColor = '#f0ede4';
    Chart.defaults.plugins.tooltip.titleFont = { family: Chart.defaults.font.family, size: 12, weight: '600' };
    Chart.defaults.plugins.tooltip.bodyFont = { family: Chart.defaults.font.family, size: 13 };
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.displayColors = true;
    Chart.defaults.plugins.tooltip.callbacks = {
        label(ctx) {
            const parsed = ctx.parsed;
            let val =
                typeof parsed === 'number'
                    ? parsed
                    : parsed?.y ?? parsed?.r ?? (Array.isArray(ctx.raw) ? ctx.raw[ctx.dataIndex] : ctx.raw);
            if (val == null) return ` ${ctx.label || ''}`;
            const n = typeof val === 'number' ? val.toLocaleString('id-ID') : String(val);
            const prefix = ctx.dataset?.label ? `${ctx.dataset.label}: ` : '';
            return ` ${prefix}${n}`;
        }
    };

    const mk = (id, cfg) => {
        const el = document.getElementById(id);
        if (!el) return;
        const opts = cfg.options || {};
        const baseAnim =
            opts.animation === false
                ? false
                : { ...chartAnim, ...(typeof opts.animation === 'object' && opts.animation ? opts.animation : {}) };
        const c = new Chart(el, {
            ...cfg,
            options: { ...opts, animation: baseAnim }
        });
        _statCharts.push(c);
    };

    const distData = [42, 28, 25, 18, 15, 8, 5];
    const distTotal = distData.reduce((a, b) => a + b, 0) || 1;
    const distLabels = ['Cangkringan', 'Ngemplak', 'Pakem', 'Turi', 'Prambanan', 'Depok', 'Gamping'];
    const distContext = ['Erupsi', 'Banjir Lahar', 'Banjir', 'Erupsi', 'Gempa', 'Gempa', 'Banjir'];
    mk('statChartDist', {
        type: 'bar',
        data: {
            labels: distLabels,
            datasets: [{
                label: 'Jumlah Kejadian',
                data: distData,
                backgroundColor: [
                    'rgba(239,68,68,0.85)','rgba(249,115,22,0.85)','rgba(234,179,8,0.85)',
                    'rgba(239,68,68,0.75)','rgba(139,92,246,0.85)','rgba(59,130,246,0.85)','rgba(59,130,246,0.75)'
                ],
                borderRadius: 5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title(items) {
                            const i = items[0];
                            return `${i.label}`;
                        },
                        label(ctx) {
                            const v = ctx.parsed.x;
                            const pct = ((v / distTotal) * 100).toFixed(1);
                            return `  ${v.toLocaleString('id-ID')} kejadian (${pct}% dari total)`;
                        },
                        afterLabel(ctx) {
                            const i = ctx.dataIndex;
                            return `  Jenis dominan: ${distContext[i]}`;
                        }
                    }
                }
            },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { grid: { display: false } }
            }
        }
    });

    const compData = [35, 25, 15, 15, 10];
    const compTotal = compData.reduce((a, b) => a + b, 0) || 1;
    const compLabels = ['Erupsi', 'Banjir Lahar', 'Gempa Bumi', 'Tanah Longsor', 'Kekeringan'];
    mk('statChartComp', {
        type: 'doughnut',
        data: {
            labels: compLabels,
            datasets: [{
                data: compData,
                backgroundColor: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#3b82f6'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { ...chartAnim, animateRotate: true, animateScale: true },
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 12, padding: 14, font: { size: 11 } } },
                tooltip: {
                    callbacks: {
                        label(ctx) {
                            const v = ctx.parsed;
                            const pct = ((v / compTotal) * 100).toFixed(1);
                            return `  ${ctx.label}: ${v.toLocaleString('id-ID')} kasus (${pct}%)`;
                        }
                    }
                }
            },
            cutout: '68%'
        }
    });

    mk('statChartTrend', {
        type: 'line',
        data: {
            labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
            datasets: [{
                label: 'Kejadian',
                data: [12, 19, 15, 22, 18, 30, 25],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.12)',
                tension: 0.42,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label(ctx) {
                            const v = ctx.parsed.y;
                            const data = ctx.dataset.data;
                            const max = Math.max(...data);
                            const note = v === max ? ' — Tertinggi' : '';
                            return `  ${ctx.label}: ${v.toLocaleString('id-ID')} kejadian${note}`;
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

    mk('statChartFreq', {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
            datasets: [
                { label: 'Erupsi', data: [5, 8, 3, 2, 4, 1], backgroundColor: '#ef4444', borderRadius: 3 },
                { label: 'Banjir', data: [12, 15, 10, 4, 1, 0], backgroundColor: '#3b82f6', borderRadius: 3 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top', align: 'end', labels: { boxWidth: 10 } } },
            scales: {
                x: { grid: { display: false }, stacked: false },
                y: { grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });

    mk('statChartRadar', {
        type: 'radar',
        data: {
            labels: ['Fisik', 'Sosial', 'Ekonomi', 'Infrastruktur', 'Lingkungan'],
            datasets: [
                {
                    label: 'Sleman',
                    data: [80, 60, 70, 85, 90],
                    backgroundColor: 'rgba(239, 68, 68, 0.22)',
                    borderColor: '#ef4444',
                    pointBackgroundColor: '#ef4444',
                    borderWidth: 2
                },
                {
                    label: 'Bantul',
                    data: [60, 75, 65, 70, 50],
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: '#3b82f6',
                    pointBackgroundColor: '#3b82f6',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
            scales: {
                r: {
                    angleLines: { color: 'rgba(255,255,255,0.1)' },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    pointLabels: { color: '#94a3b8', font: { size: 11 } },
                    ticks: { display: false }
                }
            }
        }
    });
}
