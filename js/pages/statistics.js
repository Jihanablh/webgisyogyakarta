import {
    DISASTER_2025_BY_REGION,
    DISASTER_2025_PERIOD,
    DISASTER_2025_TOTAL,
    DISASTER_TYPE_KEYS,
    DISASTER_TYPE_LABELS,
    disasterTypeTotals,
    dominantDisasterType,
    highestRegion,
    lowestRegion,
    riskColor,
    shortRegionName
} from '../disaster-2025.js?v=20260526-round25-polish';
import { CONFIG } from '../state.js?v=20260526-round25-polish';

let _statCharts = [];
let _statHeatmap = null;
let _statTableSort = { key: 'jumlah_kejadian', dir: 'desc' };
let _statTableSearch = '';
let _statTablePage = 1;
const PAGE_SIZE = 5;
const DIY_LOCK_BOUNDS = [[-8.6, 109.2], [-7.1, 111.8]];

const REGION_CENTROIDS = {
    'Kabupaten Sleman': [-7.7156, 110.3556],
    'Kota Yogyakarta': [-7.7956, 110.3695],
    'Kabupaten Gunungkidul': [-7.9657, 110.6024],
    'Kabupaten Bantul': [-7.8846, 110.3341],
    'Kabupaten Kulon Progo': [-7.8267, 110.1641]
};

const TYPE_COLORS = ['#f59e0b', '#ef4444', '#fb923c', '#8b5cf6', '#38bdf8', '#f97316'];

function getCentroid(feature) {
    const g = feature.geometry;
    if (!g) return null;
    if (g.type === 'Point') {
        return [g.coordinates[1], g.coordinates[0]];
    }
    if ((g.type === 'Polygon' || g.type === 'MultiPolygon') && g.coordinates?.[0]?.length) {
        const ring = g.type === 'Polygon' ? g.coordinates[0] : g.coordinates[0][0];
        let sx = 0;
        let sy = 0;
        ring.forEach(([x, y]) => { sx += x; sy += y; });
        return [sy / ring.length, sx / ring.length];
    }
    if (g.type === 'LineString' && g.coordinates?.length) {
        const mid = Math.floor(g.coordinates.length / 2);
        return [g.coordinates[mid][1], g.coordinates[mid][0]];
    }
    return null;
}

function risikoIntensity(levelRisiko) {
    const l = (levelRisiko || '').toLowerCase();
    if (l.includes('sangat tinggi')) return 1.0;
    if (l.includes('tinggi')) return 0.8;
    if (l.includes('sedang')) return 0.5;
    if (l.includes('rendah')) return 0.3;
    if (l.includes('info')) return 0.6;
    return 0.4;
}

function destroyStatCharts() {
    _statCharts.forEach((chart) => {
        try { chart.destroy(); } catch (_) {}
    });
    _statCharts = [];
    if (_statHeatmap) {
        try { _statHeatmap.remove(); } catch (_) {}
        _statHeatmap = null;
    }
}

function fmt(n) {
    return Number(n || 0).toLocaleString('id-ID');
}

function pct(value, total = DISASTER_2025_TOTAL) {
    return `${((Number(value || 0) / total) * 100).toFixed(1).replace('.', ',')}%`;
}

function chartOptions(extra = {}) {
    const isLight = document.documentElement.classList.contains('light');
    const axisColor = isLight ? '#4a3f2a' : '#94a3b8';
    const gridColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(148, 163, 184, 0.08)';
    const tooltipBg = isLight ? '#1a1509' : 'rgba(15, 23, 42, 0.96)';
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: isLight ? '#4a3f2a' : '#cbd5e1', boxWidth: 10, font: { family: 'Inter' } } },
            tooltip: {
                backgroundColor: tooltipBg,
                borderColor: 'rgba(212, 160, 23, 0.4)',
                borderWidth: 1,
                titleColor: '#f8fafc',
                bodyColor: isLight ? '#faf8f3' : '#cbd5e1',
                padding: 12,
                callbacks: {
                    label: (ctx) => {
                        const label = ctx.dataset.label || ctx.label || 'Nilai';
                        const value = Array.isArray(ctx.raw) ? ctx.raw[1] : ctx.raw;
                        return `${label}: ${fmt(value)} (${pct(value)})`;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: { color: axisColor, font: { family: 'Inter' } },
                grid: { color: gridColor }
            },
            y: {
                beginAtZero: true,
                ticks: { color: axisColor, font: { family: 'Inter' } },
                grid: { color: gridColor }
            }
        },
        ...extra
    };
}

function createChart(id, config) {
    const canvas = document.getElementById(id);
    if (!canvas || typeof Chart === 'undefined') return null;
    const instance = new Chart(canvas, config);
    _statCharts.push(instance);
    return instance;
}

function kpiCards() {
    const high = highestRegion();
    const low = lowestRegion();
    const dominant = dominantDisasterType();
    const cards = [
        { label: 'Total Kejadian 2025', value: fmt(DISASTER_2025_TOTAL), note: DISASTER_2025_PERIOD },
        { label: 'Risiko Tertinggi', value: shortRegionName(high.kab_kota), note: `${fmt(high.jumlah_kejadian)} kejadian` },
        { label: 'Risiko Terendah', value: shortRegionName(low.kab_kota), note: `${fmt(low.jumlah_kejadian)} kejadian` },
        { label: 'Bencana Dominan', value: dominant.label, note: `${fmt(dominant.value)} kejadian` }
    ];

    return `
        <section class="tw-mb-8 tw-grid tw-grid-cols-1 tw-gap-4 md:tw-grid-cols-2 xl:tw-grid-cols-4">
            ${cards.map((card, idx) => `
                <article class="stat-animate tw-opacity-0 tw-translate-y-4 tw-rounded-2xl tw-border tw-border-slate-700/50 tw-bg-slate-800/60 tw-p-5 tw-shadow-xl tw-shadow-black/20 tw-transition-all tw-duration-500 hover:tw-scale-[1.02] hover:-tw-translate-y-1">
                    <div class="tw-text-xs tw-font-semibold tw-uppercase tw-tracking-[0.18em] tw-text-slate-400">${card.label}</div>
                    <div class="tw-mt-3 tw-font-mono tw-text-3xl tw-font-bold tw-text-amber-300">${card.value}</div>
                    <p class="tw-mt-2 tw-text-sm tw-text-slate-400">${card.note}</p>
                </article>`).join('')}
        </section>`;
}

function chartCard(title, note, id, extraClass = '') {
    return `
        <article class="stat-animate tw-opacity-0 tw-translate-y-4 tw-rounded-2xl tw-border tw-border-slate-700/50 tw-bg-slate-800/60 tw-p-5 tw-shadow-xl tw-shadow-black/20 tw-transition-all tw-duration-500 hover:tw-scale-[1.01] hover:-tw-translate-y-1 ${extraClass}">
            <div class="tw-mb-4">
                <h3 class="tw-font-display tw-text-xl tw-font-bold tw-text-amber-400">${title}</h3>
                <p class="tw-mt-1 tw-text-sm tw-text-slate-400">${note}</p>
            </div>
            <div class="stat-chart-wrap tw-h-72"><canvas id="${id}"></canvas></div>
        </article>`;
}

function typeSummarySection() {
    const totals = disasterTypeTotals();
    const orderedKeys = [...DISASTER_TYPE_KEYS].sort((a, b) => Number(totals[b] || 0) - Number(totals[a] || 0));
    return `
        <section class="stat-animate tw-opacity-0 tw-translate-y-4 tw-overflow-hidden tw-rounded-2xl tw-border tw-border-slate-700/50 tw-bg-slate-800/60 tw-shadow-xl tw-shadow-black/20 tw-transition-all tw-duration-500">
            <div class="tw-p-6 tw-pb-4">
            <h3 class="tw-font-display tw-text-2xl tw-font-bold tw-text-amber-400">Rekap Jenis Bencana</h3>
            <p class="tw-mt-2 tw-text-sm tw-text-slate-400">Persentase dihitung terhadap total ${fmt(DISASTER_2025_TOTAL)} kejadian.</p>
            </div>
            <div class="tw-overflow-x-auto">
                <table class="tw-min-w-full tw-text-left tw-text-sm tw-text-slate-300">
                    <thead>
                        <tr class="tw-bg-slate-700/30">
                            <th class="tw-px-6 tw-py-3 tw-text-xs tw-font-semibold tw-uppercase tw-tracking-widest tw-text-slate-400">Jenis Kejadian</th>
                            <th class="tw-px-6 tw-py-3 tw-text-xs tw-font-semibold tw-uppercase tw-tracking-widest tw-text-slate-400">Total</th>
                            <th class="tw-px-6 tw-py-3 tw-text-xs tw-font-semibold tw-uppercase tw-tracking-widest tw-text-slate-400">Proporsi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderedKeys.map((key) => {
                            const value = Number(totals[key] || 0);
                            const percent = (value / DISASTER_2025_TOTAL) * 100;
                            return `
                            <tr class="tw-border-b tw-border-slate-700/30 tw-transition-colors tw-duration-150 hover:tw-bg-slate-700/20">
                                <td class="tw-px-6 tw-py-4 tw-text-slate-100">${DISASTER_TYPE_LABELS[key]}</td>
                                <td class="tw-px-6 tw-py-4 tw-font-mono tw-font-bold tw-text-amber-400">${fmt(value)}</td>
                                <td class="tw-px-6 tw-py-4 tw-text-slate-300">
                                    <span>${pct(value)}</span>
                                    <span class="tw-ml-2 tw-inline-block tw-h-1.5 tw-w-32 tw-overflow-hidden tw-rounded-full tw-bg-slate-600 tw-align-middle">
                                        <span class="tw-block tw-h-full tw-rounded-full tw-bg-amber-500" style="width:${Math.max(3, Math.round(percent))}%"></span>
                                    </span>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </section>`;
}

function heatmapSection() {
    return `
        <section class="stat-animate tw-mb-8 tw-opacity-0 tw-translate-y-4 tw-rounded-2xl tw-border tw-border-slate-700/50 tw-bg-slate-800/60 tw-p-5 tw-shadow-xl tw-shadow-black/20 tw-transition-all tw-duration-500">
            <div class="tw-mb-4 tw-flex tw-flex-wrap tw-items-end tw-justify-between tw-gap-3">
                <div>
                    <h3 class="tw-font-display tw-text-2xl tw-font-bold tw-text-amber-400">Choropleth Risiko Kebencanaan</h3>
                    <p class="tw-mt-1 tw-text-sm tw-text-slate-400">Poligon kabupaten/kota berdasarkan jumlah kejadian kebencanaan tahun 2025.</p>
                </div>
                <div class="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-slate-300">
                    <span class="tw-h-3 tw-w-10 tw-rounded-full tw-bg-gradient-to-r tw-from-cyan-500 tw-via-amber-400 tw-to-red-600"></span>
                    Rendah ke sangat tinggi
                </div>
            </div>
            <div id="stat-heatmap" class="tw-h-[430px] tw-overflow-hidden tw-rounded-xl tw-border tw-border-slate-700/60 tw-bg-slate-950"></div>
        </section>`;
}

function tableRows() {
    const filtered = DISASTER_2025_BY_REGION
        .filter((row) => row.kab_kota.toLowerCase().includes(_statTableSearch.toLowerCase()))
        .sort((a, b) => b.jumlah_kejadian - a.jumlah_kejadian);
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    _statTablePage = Math.min(_statTablePage, pages);
    const start = (_statTablePage - 1) * PAGE_SIZE;
    const maxTotal = Math.max(...DISASTER_2025_BY_REGION.map((row) => row.jumlah_kejadian));
    const riskBadgeClass = (risk) => ({
        'Sangat Tinggi': 'tw-border-red-700/50 tw-bg-red-900/40 tw-text-red-400',
        Tinggi: 'tw-border-orange-700/50 tw-bg-orange-900/40 tw-text-orange-400',
        Sedang: 'tw-border-yellow-700/50 tw-bg-yellow-900/40 tw-text-yellow-400',
        Rendah: 'tw-border-teal-700/50 tw-bg-teal-900/40 tw-text-teal-400'
    }[risk] || 'tw-border-slate-600/50 tw-bg-slate-800/70 tw-text-slate-300');
    return {
        pages,
        total: filtered.length,
        rows: filtered.slice(start, start + PAGE_SIZE)
            .map((r) => `
                <tr class="tw-border-b tw-border-slate-700/30 tw-transition-colors tw-duration-150 hover:tw-bg-slate-700/20">
                    <td class="tw-px-6 tw-py-4 tw-font-semibold tw-text-slate-100">${r.kab_kota}</td>
                    <td class="tw-px-6 tw-py-4 tw-text-center tw-text-slate-300">${fmt(r.cuaca_ekstrem)}</td>
                    <td class="tw-px-6 tw-py-4 tw-text-center tw-text-slate-300">${fmt(r.tanah_longsor)}</td>
                    <td class="tw-px-6 tw-py-4 tw-text-center tw-text-slate-300">${fmt(r.kebakaran_hutan_lahan)}</td>
                    <td class="tw-px-6 tw-py-4 tw-text-center tw-text-slate-300">${fmt(r.gempa_terasa)}</td>
                    <td class="tw-px-6 tw-py-4 tw-text-center tw-text-slate-300">${fmt(r.banjir)}</td>
                    <td class="tw-px-6 tw-py-4 tw-text-center tw-text-slate-300">${fmt(r.kebakaran)}</td>
                    <td class="tw-px-6 tw-py-4">
                        <div class="tw-flex tw-items-center tw-gap-3">
                            <span class="tw-w-12 tw-font-mono tw-font-bold tw-text-amber-400">${fmt(r.jumlah_kejadian)}</span>
                            <span class="tw-h-1.5 tw-w-24 tw-overflow-hidden tw-rounded-full tw-bg-slate-600">
                                <span class="tw-block tw-h-full tw-rounded-full tw-bg-amber-500" style="width:${Math.round((r.jumlah_kejadian / maxTotal) * 100)}%"></span>
                            </span>
                        </div>
                    </td>
                    <td class="tw-px-6 tw-py-4"><span class="tw-rounded-full tw-border tw-px-3 tw-py-1 tw-text-xs tw-font-bold ${riskBadgeClass(r.kelas_risiko)}">${r.kelas_risiko}</span></td>
                </tr>`)
            .join('')
    };
}

function renderTableBody() {
    const tbody = document.getElementById('stat-table-body');
    const meta = document.getElementById('stat-table-meta');
    const prev = document.getElementById('stat-table-prev');
    const next = document.getElementById('stat-table-next');
    if (!tbody || !meta) return;
    const data = tableRows();
    tbody.innerHTML = data.rows || '<tr><td colspan="9" class="tw-px-4 tw-py-6 tw-text-center tw-text-slate-400">Data tidak ditemukan.</td></tr>';
    meta.textContent = `Menampilkan ${data.total} wilayah - halaman ${_statTablePage} dari ${data.pages}`;
    if (prev) prev.disabled = _statTablePage <= 1;
    if (next) next.disabled = _statTablePage >= data.pages;
}

function tableSection() {
    return `
        <section class="stat-animate tw-opacity-0 tw-translate-y-4 tw-overflow-hidden tw-rounded-2xl tw-border tw-border-slate-700/50 tw-bg-slate-800/60 tw-shadow-xl tw-shadow-black/20 tw-transition-all tw-duration-500">
            <div class="tw-flex tw-flex-wrap tw-items-end tw-justify-between tw-gap-3 tw-p-6 tw-pb-4">
                <div>
                    <h3 class="tw-font-display tw-text-2xl tw-font-bold tw-text-amber-400">Rekap Kabupaten/Kota Tahun 2025</h3>
                    <p class="tw-mt-1 tw-text-sm tw-text-slate-400">Data diurutkan dari total kejadian tertinggi ke terendah.</p>
                    <p id="stat-table-meta" class="tw-mt-1 tw-text-xs tw-text-slate-500">Memuat data...</p>
                </div>
                <input id="stat-table-search" class="tw-rounded-xl tw-border tw-border-slate-600/60 tw-bg-slate-800/80 tw-px-4 tw-py-2 tw-text-sm tw-text-slate-100 tw-outline-none focus:tw-border-amber-400/70" placeholder="Cari wilayah...">
            </div>
            <div class="tw-overflow-x-auto">
                <table class="tw-min-w-full tw-text-left tw-text-sm tw-text-slate-300">
                    <thead>
                        <tr class="tw-bg-slate-700/30">
                            ${[
                                ['kab_kota', 'Wilayah'],
                                ['cuaca_ekstrem', 'Cuaca Ekstrem'],
                                ['tanah_longsor', 'Longsor'],
                                ['kebakaran_hutan_lahan', 'Karhutla'],
                                ['gempa_terasa', 'Gempa'],
                                ['banjir', 'Banjir'],
                                ['kebakaran', 'Kebakaran'],
                                ['jumlah_kejadian', 'Total'],
                                ['kelas_risiko', 'Risiko']
                            ].map(([, label]) => `<th class="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-semibold tw-uppercase tw-tracking-widest tw-text-slate-400">${label}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody id="stat-table-body"></tbody>
                </table>
            </div>
            <div class="tw-flex tw-items-center tw-justify-end tw-gap-2 tw-p-6 tw-pt-4">
                <button id="stat-table-prev" class="tw-rounded-lg tw-border tw-border-slate-600/70 tw-px-3 tw-py-2 tw-text-xs tw-font-semibold tw-text-slate-200 disabled:tw-cursor-not-allowed disabled:tw-opacity-40 hover:tw-bg-slate-700/60">Sebelumnya</button>
                <button id="stat-table-next" class="tw-rounded-lg tw-border tw-border-amber-500/40 tw-px-3 tw-py-2 tw-text-xs tw-font-semibold tw-text-amber-300 disabled:tw-cursor-not-allowed disabled:tw-opacity-40 hover:tw-bg-amber-500/10">Berikutnya</button>
            </div>
        </section>`;
}

function renderLayout(container) {
    container.innerHTML = `
        ${kpiCards()}
        <section class="tw-mb-8 tw-grid tw-grid-cols-1 tw-gap-5 xl:tw-grid-cols-2">
            ${chartCard('Distribusi Kejadian per Kabupaten/Kota', 'Bar horizontal untuk membaca perbandingan antarwilayah.', 'statChartKabupaten')}
            ${chartCard('Donut Komposisi Jenis Bencana', 'Proporsi enam jenis kejadian yang dianalisis.', 'statChartJenisDonut')}
        </section>
        <section class="tw-mb-8 tw-grid tw-grid-cols-1 tw-gap-5 xl:tw-grid-cols-3">
            ${chartCard('Tren Kejadian 2019-2025', 'Konteks historis untuk melihat arah perubahan tahunan.', 'statChartTrendYear')}
            ${chartCard('Frekuensi Bulanan 2025', 'Distribusi kejadian bulanan berbasis komposisi total 2025.', 'statChartMonthly')}
            ${chartCard('Radar Kerentanan Wilayah', 'Indeks komparatif dari komposisi kejadian per wilayah.', 'statChartRadar')}
        </section>
        <section class="tw-mb-8 tw-grid tw-grid-cols-1 tw-gap-5 xl:tw-grid-cols-2">
            ${chartCard('Breakdown Jenis Bencana per Kabupaten', 'Stacked bar untuk enam jenis kejadian per wilayah.', 'statChartStacked')}
            ${chartCard('Area Tren Korban Jiwa', 'Ditampilkan sebagai indikator pemantauan; analisis utama tetap jumlah kejadian.', 'statChartVictimsArea')}
        </section>
        <section class="tw-mb-8 tw-grid tw-grid-cols-1 tw-gap-5 xl:tw-grid-cols-2">
            ${chartCard('Perbandingan Tanah Longsor', 'Tanah longsor antar kabupaten/kota pada periode 2025.', 'statChartLongsor')}
            ${chartCard('Distribusi Kelas Risiko', 'Jumlah wilayah pada setiap kelas risiko kejadian.', 'statChartRiskDistribution')}
        </section>
        ${heatmapSection()}
        <section class="tw-mb-8 tw-space-y-5">
            ${typeSummarySection()}
            ${tableSection()}
        </section>
    `;
}

function initCharts() {
    if (typeof Chart === 'undefined') return false;
    const labels = DISASTER_2025_BY_REGION.map((r) => shortRegionName(r.kab_kota));
    const totals = DISASTER_2025_BY_REGION.map((r) => r.jumlah_kejadian);
    const typeTotals = disasterTypeTotals();
    const typeLabels = DISASTER_TYPE_KEYS.map((key) => DISASTER_TYPE_LABELS[key]);
    const typeValues = DISASTER_TYPE_KEYS.map((key) => typeTotals[key]);

    createChart('statChartKabupaten', {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Jumlah kejadian', data: totals, backgroundColor: DISASTER_2025_BY_REGION.map((r) => riskColor(r.kelas_risiko)), borderRadius: 10 }] },
        options: chartOptions({ indexAxis: 'y', plugins: { ...chartOptions().plugins, legend: { display: false } } })
    });

    createChart('statChartJenisDonut', {
        type: 'doughnut',
        data: { labels: typeLabels, datasets: [{ data: typeValues, backgroundColor: TYPE_COLORS, borderColor: '#0f172a', borderWidth: 3 }] },
        options: chartOptions({ cutout: '62%', scales: {} })
    });

    createChart('statChartTrendYear', {
        type: 'line',
        data: { labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'], datasets: [{ label: 'Kejadian tahunan', data: [742, 815, 930, 1048, 1116, 1242, 1374], borderColor: '#facc15', backgroundColor: 'rgba(250,204,21,0.15)', fill: true, tension: 0.38 }] },
        options: chartOptions()
    });

    createChart('statChartMonthly', {
        type: 'bar',
        data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'], datasets: [
            { label: 'Hidrometeorologi', data: [128, 136, 151, 109, 96, 82, 70, 74, 91, 122, 141, 164], backgroundColor: '#38bdf8', borderRadius: 8 },
            { label: 'Non-hidrometeorologi', data: [18, 16, 19, 14, 13, 10, 9, 8, 11, 14, 15, 18], backgroundColor: '#f97316', borderRadius: 8 }
        ] },
        options: chartOptions()
    });

    createChart('statChartRadar', {
        type: 'radar',
        data: { labels, datasets: [{ label: 'Indeks kerentanan', data: totals.map((v) => Math.round((v / Math.max(...totals)) * 100)), borderColor: '#22d3ee', backgroundColor: 'rgba(34,211,238,0.18)', pointBackgroundColor: '#facc15' }] },
        options: chartOptions({ scales: { r: { angleLines: { color: 'rgba(148,163,184,0.16)' }, grid: { color: 'rgba(148,163,184,0.16)' }, pointLabels: { color: '#cbd5e1' }, ticks: { color: '#94a3b8', backdropColor: 'transparent' } } } })
    });

    createChart('statChartStacked', {
        type: 'bar',
        data: { labels, datasets: DISASTER_TYPE_KEYS.map((key, idx) => ({ label: DISASTER_TYPE_LABELS[key], data: DISASTER_2025_BY_REGION.map((r) => r[key]), backgroundColor: TYPE_COLORS[idx], borderRadius: 4 })) },
        options: chartOptions({ scales: { x: { stacked: true, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.08)' } }, y: { stacked: true, beginAtZero: true, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.08)' } } } })
    });

    createChart('statChartVictimsArea', {
        type: 'line',
        data: { labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'], datasets: [{ label: 'Korban jiwa tercatat', data: [5, 3, 7, 4, 6, 3, 0], borderColor: '#fb7185', backgroundColor: 'rgba(251,113,133,0.18)', fill: true, tension: 0.4 }] },
        options: chartOptions()
    });

    createChart('statChartLongsor', {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Tanah longsor', data: DISASTER_2025_BY_REGION.map((r) => r.tanah_longsor), backgroundColor: '#dc2626', borderRadius: 10 }] },
        options: chartOptions({ plugins: { ...chartOptions().plugins, legend: { display: false } } })
    });

    const riskOrder = ['Rendah', 'Sedang', 'Tinggi', 'Sangat Tinggi'];
    createChart('statChartRiskDistribution', {
        type: 'doughnut',
        data: {
            labels: riskOrder,
            datasets: [{
                data: riskOrder.map((risk) => DISASTER_2025_BY_REGION.filter((r) => r.kelas_risiko === risk).length),
                backgroundColor: riskOrder.map(riskColor),
                borderColor: '#0f172a',
                borderWidth: 3
            }]
        },
        options: chartOptions({ cutout: '62%', scales: {} })
    });
    return true;
}

async function initHeatmap() {
    const el = document.getElementById('stat-heatmap');
    if (!el || typeof L === 'undefined') return;
    if (el.clientHeight === 0 || el.clientWidth === 0) {
        setTimeout(initHeatmap, 160);
        return;
    }
    _statHeatmap = L.map(el, {
        center: CONFIG.center,
        zoom: CONFIG.zoom,
        minZoom: CONFIG.minZoom,
        maxZoom: CONFIG.maxZoom,
        maxBounds: DIY_LOCK_BOUNDS,
        maxBoundsViscosity: CONFIG.maxBoundsViscosity,
        zoomControl: false,
        attributionControl: true,
        preferCanvas: true,
        renderer: L.canvas()
    });
    L.tileLayer(CONFIG.tileUrl, {
        attribution: CONFIG.tileAttribution,
        maxZoom: 19,
        keepBuffer: 4,
        updateWhenIdle: false,
        updateWhenZooming: false
    }).addTo(_statHeatmap);
    await new Promise((resolve) => setTimeout(resolve, 180));
    _statHeatmap.invalidateSize();

    const choroplethColor = (name) => {
        if (name === 'Kabupaten Sleman') return '#00bcd4';
        if (name === 'Kota Yogyakarta') return '#ff9800';
        if (name === 'Kabupaten Gunungkidul' || name === 'Kabupaten Bantul') return '#f44336';
        if (name === 'Kabupaten Kulon Progo') return '#b71c1c';
        return '#64748b';
    };

    try {
        const kabRes = await fetch('qgis/jumlah_dampak_bencana_diy_2025_per_kabupaten.geojson');
        const kabGeo = await kabRes.json();
        const layer = L.geoJSON(kabGeo, {
            style: (feature) => {
                const p = feature.properties || {};
                const color = choroplethColor(p.kab_kota);
                return { color: '#e2e8f0', weight: 1.4, opacity: 0.9, fillColor: color, fillOpacity: 0.55, className: 'kab-risk-polygon' };
            },
            onEachFeature: (feature, layer) => {
                const p = feature.properties || {};
                layer.bindTooltip(`
                    <div class="tw-rounded-xl tw-border tw-border-amber-500/30 tw-bg-slate-950 tw-p-3 tw-text-slate-100">
                        <div class="tw-font-display tw-text-base tw-font-bold">${p.kab_kota}</div>
                        <div class="tw-mt-1 tw-text-xs tw-text-slate-300">${Number(p.jumlah_kejadian || 0).toLocaleString('id-ID')} kejadian</div>
                        <div class="tw-mt-1 tw-text-xs tw-font-bold tw-text-amber-300">Risiko ${p.kelas_risiko}</div>
                    </div>`, { sticky: true, direction: 'top', opacity: 1, className: 'map-marker-tooltip' });
                layer.on('mouseover', () => layer.setStyle({ weight: 2.6, fillOpacity: 0.72 }));
                layer.on('mouseout', () => layer.setStyle({ weight: 1.4, fillOpacity: 0.55 }));
                layer.on('click', () => layer.openTooltip());
            }
        }).addTo(_statHeatmap);
    } catch (_) {
        /* Choropleth remains available as a basemap if polygon source is unavailable. */
    }

    try {
        const res = await fetch('data/yogyakarta_boundary.geojson');
        const geo = await res.json();
        const boundary = L.geoJSON(geo, {
            style: {
                color: '#2980b9',
                weight: 1.5,
                opacity: 0.7,
                fillOpacity: 0
            },
            className: 'diy-boundary'
        }).addTo(_statHeatmap);
    } catch (_) {
        /* Boundary is optional; keep the configured initial view. */
    }
    setTimeout(() => _statHeatmap?.invalidateSize(), 150);
}

function wireTable() {
    const search = document.getElementById('stat-table-search');
    search?.addEventListener('input', (event) => {
        _statTableSearch = event.target.value || '';
        _statTablePage = 1;
        renderTableBody();
    });
    document.querySelectorAll('.stat-sort-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.sort;
            if (_statTableSort.key === key) {
                _statTableSort.dir = _statTableSort.dir === 'asc' ? 'desc' : 'asc';
            } else {
                _statTableSort = { key, dir: 'desc' };
            }
            renderTableBody();
        });
    });
    document.getElementById('stat-table-prev')?.addEventListener('click', () => {
        _statTablePage = Math.max(1, _statTablePage - 1);
        renderTableBody();
    });
    document.getElementById('stat-table-next')?.addEventListener('click', () => {
        _statTablePage += 1;
        renderTableBody();
    });
    renderTableBody();
}

function animateSections(container) {
    container.querySelectorAll('.stat-animate').forEach((el, idx) => {
        setTimeout(() => {
            el.classList.remove('tw-opacity-0', 'tw-translate-y-4');
            el.classList.add('tw-opacity-100', 'tw-translate-y-0');
        }, 80 + idx * 100);
    });
}

export function initStatisticsPage() {
    const container = document.getElementById('statistik-content') || document.getElementById('statistika-content');
    if (!container) return;
    destroyStatCharts();
    renderLayout(container);
    if (!initCharts()) {
        container.querySelectorAll('.stat-chart-wrap').forEach((wrap) => {
            wrap.innerHTML = '<div class="tw-flex tw-h-full tw-items-center tw-justify-center tw-rounded-xl tw-border tw-border-slate-700/60 tw-bg-slate-950/60 tw-p-6 tw-text-center tw-text-sm tw-text-slate-300">Grafik sedang dimuat. Data fallback tetap tersedia pada KPI dan tabel.</div>';
        });
        const tries = Number(container.dataset.chartRetry || 0);
        if (tries < 10) {
            container.dataset.chartRetry = String(tries + 1);
            setTimeout(() => initStatisticsPage(), 300);
        }
    } else {
        container.dataset.chartRetry = '0';
    }
    wireTable();
    initHeatmap();
    animateSections(container);
}
