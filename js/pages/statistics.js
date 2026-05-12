
let _statCharts = [];

function destroyStatCharts() {
    _statCharts.forEach(c => { try { c.destroy(); } catch (_) {} });
    _statCharts = [];
}

export function initStatisticsPage() {
    const container = document.getElementById('statistik-content');
    if (!container) return;
    destroyStatCharts();

    container.innerHTML = `
        <div class="stat-dashboard" style="padding: 24px; max-width: 1400px; margin: 0 auto; color: var(--text-primary);">
            <p class="tw-mb-6 tw-max-w-3xl tw-text-sm tw-leading-relaxed tw-text-[var(--text-secondary)]">
                Ringkasan agregat data kebencanaan wilayah DIY berbasis sampel operasional untuk keperluan demonstrasi dashboard.
                Angka dan grafik bersifat ilustratif dan tidak menggantikan laporan resmi BPBD.
            </p>
            <!-- ROW 1: KPI CARDS -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 24px;">
                <div style="background: var(--bg-card); padding: 24px; border-radius: 12px; border: 1px solid var(--border-card);">
                    <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">Total Daerah Terdampak</div>
                    <div style="font-family: 'Space Mono', monospace; font-size: 32px; font-weight: 700; color: var(--accent-gold);">142<span style="font-size:14px; color:var(--accent-red); margin-left:8px;">↑ 12%</span></div>
                </div>
                <div style="background: var(--bg-card); padding: 24px; border-radius: 12px; border: 1px solid var(--border-card);">
                    <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">Populasi Berisiko</div>
                    <div style="font-family: 'Space Mono', monospace; font-size: 32px; font-weight: 700; color: var(--accent-blue);">84.5K<span style="font-size:14px; color:var(--accent-green); margin-left:8px;">↓ 5%</span></div>
                </div>
                <div style="background: var(--bg-card); padding: 24px; border-radius: 12px; border: 1px solid var(--border-card);">
                    <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">Fasilitas Terdampak</div>
                    <div style="font-family: 'Space Mono', monospace; font-size: 32px; font-weight: 700; color: var(--accent-merapi);">28<span style="font-size:14px; color:var(--accent-red); margin-left:8px;">↑ 2%</span></div>
                </div>
                <div style="background: var(--bg-card); padding: 24px; border-radius: 12px; border: 1px solid var(--border-card);">
                    <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">Kapasitas Pengungsian</div>
                    <div style="font-family: 'Space Mono', monospace; font-size: 32px; font-weight: 700; color: var(--accent-green);">12.4K<span style="font-size:14px; color:var(--text-muted); margin-left:8px;">Sisa 4.2K</span></div>
                </div>
            </div>

            <!-- ROW 2: MAIN CHARTS -->
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px;">
                <div style="background: var(--bg-card); padding: 20px; border-radius: 12px; border: 1px solid var(--border-card);">
                    <h3 style="font-size: 14px; margin-bottom: 16px; color: var(--text-secondary);">Distribusi Bencana per Kecamatan</h3>
                    <div style="position: relative; height: 300px;"><canvas id="statChartDist"></canvas></div>
                </div>
                <div style="background: var(--bg-card); padding: 20px; border-radius: 12px; border: 1px solid var(--border-card);">
                    <h3 style="font-size: 14px; margin-bottom: 16px; color: var(--text-secondary);">Komposisi Jenis Bencana</h3>
                    <div style="position: relative; height: 300px;"><canvas id="statChartComp"></canvas></div>
                </div>
            </div>

            <!-- ROW 3: SUPPORTING CHARTS -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px;">
                <div style="background: var(--bg-card); padding: 20px; border-radius: 12px; border: 1px solid var(--border-card);">
                    <h3 style="font-size: 14px; margin-bottom: 16px; color: var(--text-secondary);">Tren Kejadian Bencana per Tahun</h3>
                    <div style="position: relative; height: 250px;"><canvas id="statChartTrend"></canvas></div>
                </div>
                <div style="background: var(--bg-card); padding: 20px; border-radius: 12px; border: 1px solid var(--border-card);">
                    <h3 style="font-size: 14px; margin-bottom: 16px; color: var(--text-secondary);">Frekuensi Bencana per Bulan</h3>
                    <div style="position: relative; height: 250px;"><canvas id="statChartFreq"></canvas></div>
                </div>
                <div style="background: var(--bg-card); padding: 20px; border-radius: 12px; border: 1px solid var(--border-card);">
                    <h3 style="font-size: 14px; margin-bottom: 16px; color: var(--text-secondary);">Indeks Kerentanan per Wilayah</h3>
                    <div style="position: relative; height: 250px;"><canvas id="statChartRadar"></canvas></div>
                </div>
            </div>

            <!-- ROW 4: DATA TABLE -->
            <div style="background: var(--bg-card); padding: 20px; border-radius: 12px; border: 1px solid var(--border-card);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h3 style="font-size: 14px; color: var(--text-secondary);">Data Detail Wilayah</h3>
                    <div>
                        <input type="text" placeholder="Cari kecamatan..." style="background: var(--bg-elevated); border: 1px solid var(--border-glass); color: var(--text-primary); padding: 6px 12px; border-radius: 6px; font-size: 13px; margin-right: 8px;">
                        <button style="background: var(--bg-elevated); border: 1px solid var(--border-glass); color: var(--text-primary); padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px;">Export CSV</button>
                    </div>
                </div>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--border-card); color: var(--text-muted);">
                                <th style="padding: 12px 8px;">Kecamatan</th>
                                <th style="padding: 12px 8px;">Jenis Bencana Utama</th>
                                <th style="padding: 12px 8px;">Luas Terdampak (km²)</th>
                                <th style="padding: 12px 8px;">Populasi</th>
                                <th style="padding: 12px 8px;">Tingkat Risiko</th>
                                <th style="padding: 12px 8px;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(192, 57, 43, 0.1);">
                                <td style="padding: 12px 8px;">Cangkringan</td>
                                <td style="padding: 12px 8px;">Erupsi Merapi</td>
                                <td style="padding: 12px 8px;">45.2</td>
                                <td style="padding: 12px 8px;">12,500</td>
                                <td style="padding: 12px 8px;"><span style="color:#ef4444; font-weight:bold;">Sangat Tinggi</span></td>
                                <td style="padding: 12px 8px;">Siaga Aktif</td>
                            </tr>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(230, 126, 34, 0.1);">
                                <td style="padding: 12px 8px;">Ngemplak</td>
                                <td style="padding: 12px 8px;">Banjir Lahar</td>
                                <td style="padding: 12px 8px;">18.4</td>
                                <td style="padding: 12px 8px;">24,100</td>
                                <td style="padding: 12px 8px;"><span style="color:#e67e22; font-weight:bold;">Tinggi</span></td>
                                <td style="padding: 12px 8px;">Waspada</td>
                            </tr>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 12px 8px;">Depok</td>
                                <td style="padding: 12px 8px;">Gempa Bumi</td>
                                <td style="padding: 12px 8px;">32.1</td>
                                <td style="padding: 12px 8px;">115,000</td>
                                <td style="padding: 12px 8px;"><span style="color:#f39c12; font-weight:bold;">Sedang</span></td>
                                <td style="padding: 12px 8px;">Aman</td>
                            </tr>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 12px 8px;">Gamping</td>
                                <td style="padding: 12px 8px;">Banjir Genangan</td>
                                <td style="padding: 12px 8px;">8.5</td>
                                <td style="padding: 12px 8px;">82,400</td>
                                <td style="padding: 12px 8px;"><span style="color:#f39c12; font-weight:bold;">Sedang</span></td>
                                <td style="padding: 12px 8px;">Aman</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; font-size: 12px; color: var(--text-muted);">
                    <div>Menampilkan 1-4 dari 78 Kecamatan</div>
                    <div style="display: flex; gap: 4px;">
                        <button style="background: transparent; border: 1px solid var(--border-card); color: var(--text-secondary); padding: 4px 8px; border-radius: 4px; cursor: pointer;">Prev</button>
                        <button style="background: var(--bg-elevated); border: 1px solid var(--border-glass); color: var(--text-primary); padding: 4px 8px; border-radius: 4px; cursor: pointer;">1</button>
                        <button style="background: transparent; border: 1px solid var(--border-card); color: var(--text-secondary); padding: 4px 8px; border-radius: 4px; cursor: pointer;">2</button>
                        <button style="background: transparent; border: 1px solid var(--border-card); color: var(--text-secondary); padding: 4px 8px; border-radius: 4px; cursor: pointer;">Next</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            initCharts();
            const dash = container.querySelector('.stat-dashboard');
            if (dash) {
                Array.from(dash.children).forEach((row, i) => {
                    row.classList.add('tw-opacity-0', 'tw-translate-y-8', 'tw-transition-all', 'tw-duration-700', 'tw-ease-out');
                    setTimeout(() => row.classList.add('tw-opacity-100', 'tw-translate-y-0'), 50 + i * 100);
                });
            }
        });
    });
}

function initCharts() {
    if (typeof Chart === 'undefined') return;
    
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 41, 0.9)';
    Chart.defaults.plugins.tooltip.titleColor = '#d4a017';

    const mk = (id, cfg) => {
        const el = document.getElementById(id);
        if (!el) return;
        const c = new Chart(el, cfg);
        _statCharts.push(c);
    };

    // 1. Bar Chart Horizontal (Distribusi Bencana)
    mk('statChartDist', {
        type: 'bar',
        data: {
            labels: ['Cangkringan', 'Ngemplak', 'Pakem', 'Turi', 'Prambanan', 'Depok', 'Gamping'],
            datasets: [{
                label: 'Jumlah Kejadian',
                data: [42, 28, 25, 18, 15, 8, 5],
                backgroundColor: 'rgba(212, 160, 23, 0.8)',
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { grid: { display: false } }
            }
        }
    });

    // 2. Donut Chart (Komposisi)
    mk('statChartComp', {
        type: 'doughnut',
        data: {
            labels: ['Erupsi', 'Banjir Lahar', 'Gempa Bumi', 'Tanah Longsor', 'Kekeringan'],
            datasets: [{
                data: [35, 25, 15, 15, 10],
                backgroundColor: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#3b82f6'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 12, padding: 15 } }
            },
            cutout: '70%'
        }
    });

    // 3. Line Chart (Tren)
    mk('statChartTrend', {
        type: 'line',
        data: {
            labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
            datasets: [{
                label: 'Kejadian',
                data: [12, 19, 15, 22, 18, 30, 25],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#3b82f6'
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

    // 4. Bar Chart Grouped (Frekuensi per Bulan)
    mk('statChartFreq', {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
            datasets: [
                { label: 'Erupsi', data: [5, 8, 3, 2, 4, 1], backgroundColor: '#ef4444', borderRadius: 2 },
                { label: 'Banjir', data: [12, 15, 10, 4, 1, 0], backgroundColor: '#3b82f6', borderRadius: 2 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top', align: 'end', labels: { boxWidth: 10 } } },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });

    // 5. Radar Chart (Indeks Kerentanan)
    mk('statChartRadar', {
        type: 'radar',
        data: {
            labels: ['Fisik', 'Sosial', 'Ekonomi', 'Infrastruktur', 'Lingkungan'],
            datasets: [{
                label: 'Sleman',
                data: [80, 60, 70, 85, 90],
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: '#ef4444',
                pointBackgroundColor: '#ef4444'
            }, {
                label: 'Bantul',
                data: [60, 75, 65, 70, 50],
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: '#3b82f6',
                pointBackgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: {
                r: {
                    angleLines: { color: 'rgba(255,255,255,0.1)' },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    pointLabels: { color: '#94a3b8' },
                    ticks: { display: false }
                }
            }
        }
    });
}
