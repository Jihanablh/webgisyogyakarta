export function initReportPage() {
    const container = document.getElementById('laporan-content');
    if (!container) return;

    container.innerHTML = `
        <div class="report-dashboard" style="padding: 24px; max-width: 1200px; margin: 0 auto; color: var(--text-primary);">
            
            <!-- ROW 1: HEADER SUMMARY -->
                <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.65; margin: 0 0 20px;">Ringkasan kejadian bencana di DIY (data contoh untuk tata letak dashboard). Gunakan filter untuk menyempitkan rentang waktu saat laporan resmi tersedia.</p>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 24px;">
                <div class="report-kpi-stagger" style="background: transparent; border-left: 3px solid var(--accent-gold); padding-left: 16px;">
                    <div style="font-size: 13px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Total Kejadian</div>
                    <div style="font-family: 'Space Mono', monospace; font-size: 36px; font-weight: 700; color: var(--text-primary); line-height: 1.1;">452</div>
                </div>
                <div class="report-kpi-stagger" style="background: transparent; border-left: 3px solid var(--accent-red); padding-left: 16px;">
                    <div style="font-size: 13px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Total Korban Jiwa</div>
                    <div style="font-family: 'Space Mono', monospace; font-size: 36px; font-weight: 700; color: var(--text-primary); line-height: 1.1;">1,240</div>
                </div>
                <div class="report-kpi-stagger" style="background: transparent; border-left: 3px solid var(--accent-blue); padding-left: 16px;">
                    <div style="font-size: 13px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Total Pengungsi</div>
                    <div style="font-family: 'Space Mono', monospace; font-size: 36px; font-weight: 700; color: var(--text-primary); line-height: 1.1;">12.5K</div>
                </div>
                <div class="report-kpi-stagger" style="background: transparent; border-left: 3px solid var(--accent-green); padding-left: 16px;">
                    <div style="font-size: 13px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Total Kerugian</div>
                    <div style="font-family: 'Space Mono', monospace; font-size: 36px; font-weight: 700; color: var(--text-primary); line-height: 1.1;">8.4T</div>
                </div>
            </div>

            <!-- ROW 2: FILTER BAR -->
            <div style="background: var(--bg-card); border: 1px solid var(--border-card); padding: 16px 20px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 32px;">
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <span style="font-size: 13px; color: var(--text-muted); line-height: 28px; margin-right: 8px;">Filter:</span>
                    <button class="filter-pill">Semua Tahun ▼</button>
                    <button class="filter-pill">Jenis Bencana ▼</button>
                    <button class="filter-pill">Kecamatan ▼</button>
                    <button class="filter-pill">Tingkat Risiko ▼</button>
                </div>
                <button style="background: transparent; border: none; color: var(--accent-gold); font-size: 13px; cursor: pointer; text-decoration: underline;">Reset Filter</button>
            </div>

            <!-- ROW 3: GRAFIK UTAMA -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-bottom: 40px;">
                <div style="background: var(--bg-card); padding: 20px; border-radius: 12px; border: 1px solid var(--border-card);">
                    <h3 style="font-size: 15px; margin-bottom: 20px; color: var(--text-primary); font-weight: 600;">Tren Kejadian & Korban per Tahun</h3>
                    <div style="position: relative; height: 300px;"><canvas id="reportChartTrend"></canvas></div>
                </div>
                <div style="background: var(--bg-card); padding: 20px; border-radius: 12px; border: 1px solid var(--border-card);">
                    <h3 style="font-size: 15px; margin-bottom: 20px; color: var(--text-primary); font-weight: 600;">Total Kerugian Material (Rp Miliar)</h3>
                    <div style="position: relative; height: 300px;"><canvas id="reportChartLoss"></canvas></div>
                </div>
            </div>

            <!-- ROW 4: TIMELINE -->
            <div style="margin-bottom: 48px;">
                <h3 style="font-size: 18px; margin-bottom: 24px; color: var(--text-primary); font-weight: 600; border-bottom: 1px solid var(--border-card); padding-bottom: 12px;">Riwayat Bencana</h3>
                
                <div class="timeline-container" style="position: relative; padding-left: 24px; border-left: 2px solid var(--border-card);">
                    
                    <!-- Timeline Item 1 -->
                    <div class="report-tl-item" style="position: relative; margin-bottom: 32px;">
                        <div style="position: absolute; left: -31px; top: 0; width: 12px; height: 12px; border-radius: 50%; background: var(--accent-red); border: 2px solid var(--bg-primary);"></div>
                        <div style="background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 8px; padding: 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                                <div>
                                    <div style="font-family: 'Space Mono', monospace; font-size: 13px; color: var(--accent-gold); margin-bottom: 4px;">12 Mar 2024 • 14:30 WIB</div>
                                    <h4 style="font-size: 16px; color: var(--text-primary); margin: 0 0 4px 0;">Erupsi Freatik Gunung Merapi</h4>
                                    <div style="font-size: 13px; color: var(--text-muted);">Kecamatan Cangkringan, Kabupaten Sleman</div>
                                </div>
                                <span style="background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; border: 1px solid rgba(239, 68, 68, 0.2);">Siaga Aktif</span>
                            </div>
                            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">Telah terjadi erupsi freatik dengan tinggi kolom abu mencapai 2.500 meter di atas puncak. Angin bertiup ke arah barat daya. Hujan abu vulkanik melanda beberapa desa di kawasan KRB III.</p>
                            
                            <div style="display: flex; gap: 24px; margin-bottom: 16px; flex-wrap: wrap;">
                                <div><span style="font-size: 12px; color: var(--text-muted); display: block;">Korban Jiwa</span><strong style="font-size: 15px; color: var(--text-primary);">0</strong></div>
                                <div><span style="font-size: 12px; color: var(--text-muted); display: block;">Luka-luka</span><strong style="font-size: 15px; color: var(--text-primary);">12</strong></div>
                                <div><span style="font-size: 12px; color: var(--text-muted); display: block;">Pengungsi</span><strong style="font-size: 15px; color: var(--text-primary);">450</strong></div>
                                <div><span style="font-size: 12px; color: var(--text-muted); display: block;">Kerugian</span><strong style="font-size: 15px; color: var(--text-primary);">Rp 2.5 M</strong></div>
                            </div>
                            
                            <div style="margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                                    <span style="color: var(--text-muted);">Kapasitas Barak Pengungsian (Balai Desa Glagaharjo)</span>
                                    <span style="color: var(--text-secondary);">450 / 800</span>
                                </div>
                                <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                                    <div style="width: 56%; height: 100%; background: var(--accent-gold);"></div>
                                </div>
                            </div>

                            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-card); padding-top: 16px; margin-top: 16px;">
                                <div style="font-size: 13px; color: var(--text-muted);">Kontak Darurat: <strong style="color: var(--text-secondary);">BPBD Sleman (0274-869902)</strong></div>
                                <button class="btn-primary" style="background: transparent; border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 6px 16px; border-radius: 4px; font-size: 13px; cursor: pointer;">Lihat di Peta</button>
                            </div>
                        </div>
                    </div>

                    <!-- Timeline Item 2 -->
                    <div class="report-tl-item" style="position: relative;">
                        <div style="position: absolute; left: -31px; top: 0; width: 12px; height: 12px; border-radius: 50%; background: var(--accent-green); border: 2px solid var(--bg-primary);"></div>
                        <div style="background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 8px; padding: 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                                <div>
                                    <div style="font-family: 'Space Mono', monospace; font-size: 13px; color: var(--accent-gold); margin-bottom: 4px;">05 Jan 2024 • 02:15 WIB</div>
                                    <h4 style="font-size: 16px; color: var(--text-primary); margin: 0 0 4px 0;">Banjir Genangan Hujan Ekstrem</h4>
                                    <div style="font-size: 13px; color: var(--text-muted);">Kecamatan Gamping, Kabupaten Sleman</div>
                                </div>
                                <span style="background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; border: 1px solid rgba(34, 197, 94, 0.2);">Selesai</span>
                            </div>
                            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">Curah hujan dengan intensitas tinggi menyebabkan meluapnya Sungai Bedog. Genangan air mencapai 50-80 cm merendam 4 pedukuhan di wilayah Gamping.</p>
                            
                            <div style="display: flex; gap: 24px; margin-bottom: 16px; flex-wrap: wrap;">
                                <div><span style="font-size: 12px; color: var(--text-muted); display: block;">Korban Jiwa</span><strong style="font-size: 15px; color: var(--text-primary);">0</strong></div>
                                <div><span style="font-size: 12px; color: var(--text-muted); display: block;">Luka-luka</span><strong style="font-size: 15px; color: var(--text-primary);">0</strong></div>
                                <div><span style="font-size: 12px; color: var(--text-muted); display: block;">Pengungsi</span><strong style="font-size: 15px; color: var(--text-primary);">85</strong></div>
                                <div><span style="font-size: 12px; color: var(--text-muted); display: block;">Kerugian</span><strong style="font-size: 15px; color: var(--text-primary);">Rp 120 Jt</strong></div>
                            </div>
                            
                            <div style="margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                                    <span style="color: var(--text-muted);">Kapasitas Pengungsian (Masjid Patukan)</span>
                                    <span style="color: var(--text-secondary);">0 / 150</span>
                                </div>
                                <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                                    <div style="width: 0%; height: 100%; background: var(--accent-green);"></div>
                                </div>
                            </div>

                            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-card); padding-top: 16px; margin-top: 16px;">
                                <div style="font-size: 13px; color: var(--text-muted);">Kontak Darurat: <strong style="color: var(--text-secondary);">Polsek Gamping (0274-798221)</strong></div>
                                <button class="btn-primary" style="background: transparent; border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 6px 16px; border-radius: 4px; font-size: 13px; cursor: pointer;">Lihat di Peta</button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- ROW 5: EMERGENCY CONTACTS -->
            <div>
                <h3 style="font-size: 18px; margin-bottom: 24px; color: var(--text-primary); font-weight: 600; border-bottom: 1px solid var(--border-card); padding-bottom: 12px;">Pusat Kontak Darurat</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
                    <div style="background: rgba(16, 22, 40, 0.6); border: 1px solid var(--border-card); border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px;">
                        <h4 style="margin: 0 0 8px 0; font-size: 16px;">BPBD DIY</h4>
                        <div style="font-family: 'Space Mono', monospace; font-size: 18px; color: var(--accent-gold); margin-bottom: 12px;">(0274) 555584</div>
                        <div style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">Pusdalops PB DIY<br>Jl. Kenari No.14, Semaki<br>Layanan 24 Jam</div>
                    </div>
                    <div style="background: rgba(16, 22, 40, 0.6); border: 1px solid var(--border-card); border-left: 4px solid #f97316; padding: 20px; border-radius: 8px;">
                        <h4 style="margin: 0 0 8px 0; font-size: 16px;">Basarnas (Kantor SAR)</h4>
                        <div style="font-family: 'Space Mono', monospace; font-size: 18px; color: var(--accent-gold); margin-bottom: 12px;">115 / (0274) 4333604</div>
                        <div style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">Kantor Pencarian dan Pertolongan<br>Jl. Wates Km 11, Sedayu<br>Layanan 24 Jam</div>
                    </div>
                    <div style="background: rgba(16, 22, 40, 0.6); border: 1px solid var(--border-card); border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px;">
                        <h4 style="margin: 0 0 8px 0; font-size: 16px;">PMI DIY</h4>
                        <div style="font-family: 'Space Mono', monospace; font-size: 18px; color: var(--accent-gold); margin-bottom: 12px;">(0274) 372474</div>
                        <div style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">Markas Daerah<br>Jl. Siliwangi No.3, Gamping<br>Layanan 24 Jam</div>
                    </div>
                    <div style="background: rgba(16, 22, 40, 0.6); border: 1px solid var(--border-card); border-left: 4px solid #22c55e; padding: 20px; border-radius: 8px;">
                        <h4 style="margin: 0 0 8px 0; font-size: 16px;">Dinas Pemadam Kebakaran</h4>
                        <div style="font-family: 'Space Mono', monospace; font-size: 18px; color: var(--accent-gold); margin-bottom: 12px;">113 / (0274) 587101</div>
                        <div style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">Mako Damkar Kota<br>Jl. Mayor Suryotomo<br>Layanan 24 Jam</div>
                    </div>
                </div>
            </div>

        </div>

        <style>
            .filter-pill {
                background: var(--bg-elevated); border: 1px solid var(--border-glass); 
                color: var(--text-primary); padding: 6px 16px; border-radius: 20px; 
                font-size: 13px; cursor: pointer; transition: all 0.2s;
            }
            .filter-pill:hover { border-color: var(--accent-gold); }
            .filter-pill.active { border-color: var(--accent-gold); background: rgba(212, 160, 23, 0.12); color: var(--accent-gold); }
        </style>
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

    // Line Chart (Tren Kejadian & Korban) - Dual Axis
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

    // Bar Chart (Kerugian Material)
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
