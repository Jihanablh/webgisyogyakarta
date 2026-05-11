export function initAboutPage() {
    const container = document.querySelector('#tentang-page .tentang-container');
    if (!container) return;

    container.innerHTML = `
    <!-- HERO -->
    <div class="ta-hero">
        <div class="ta-hero-inner">
            <div class="ta-version-badge">Versi 2.0</div>
            <h1 class="ta-title">JogjaMap</h1>
            <p class="ta-subtitle">Panduan digital lengkap wilayah<br>Daerah Istimewa Yogyakarta</p>
            <div class="ta-author">
                <span class="ta-author-name">Dibuat oleh Jihan Nabilah Rahman</span>
                <span class="ta-author-meta">Proyek Tugas Akhir &nbsp;·&nbsp; Kapita &nbsp;·&nbsp; Semester 6 &nbsp;·&nbsp; 2024/2025</span>
            </div>
        </div>
    </div>

    <!-- PILLARS -->
    <div class="ta-section">
        <div class="ta-section-label">Tiga Pilar Utama</div>
        <div class="ta-pillars">
            <div class="ta-pillar-card">
                <div class="ta-pillar-icon" style="background:rgba(59,130,246,0.1);color:#60a5fa;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <h3 class="ta-pillar-title">Navigasi</h3>
                <p class="ta-pillar-desc">Ribuan lokasi wisata, fasilitas, dan layanan publik DIY dalam satu peta interaktif yang mudah dijelajahi.</p>
            </div>
            <div class="ta-pillar-card">
                <div class="ta-pillar-icon" style="background:rgba(220,38,38,0.1);color:#f87171;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <h3 class="ta-pillar-title">Keselamatan</h3>
                <p class="ta-pillar-desc">Zona risiko bencana, jalur evakuasi, dan kontak darurat terverifikasi dari BPBD DIY dan BNPB.</p>
            </div>
            <div class="ta-pillar-card">
                <div class="ta-pillar-icon" style="background:rgba(16,185,129,0.1);color:#34d399;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                </div>
                <h3 class="ta-pillar-title">Data</h3>
                <p class="ta-pillar-desc">Statistik visual dan distribusi spasial per wilayah DIY, diperbarui berkala dari sumber terpercaya.</p>
            </div>
        </div>
    </div>

    <!-- DATA SOURCES -->
    <div class="ta-section ta-section-alt">
        <div class="ta-section-label">Sumber Data</div>
        <div class="ta-sources-grid">
            ${[
                { name: 'OSM / HOT', desc: 'Geometri & POI', color: '#60a5fa' },
                { name: 'BPBD DIY',  desc: 'Data Bencana',   color: '#f87171' },
                { name: 'BMKG',      desc: 'Cuaca & Gempa',  color: '#34d399' },
                { name: 'BNPB',      desc: 'Risiko Nasional',color: '#fb923c' },
                { name: 'BPPTKG',   desc: 'Aktivitas Merapi',color: '#a78bfa' },
                { name: 'GADM v4.1', desc: 'Batas Wilayah',  color: '#fbbf24' },
            ].map(s => `
            <div class="ta-source-card">
                <div class="ta-source-name" style="color:${s.color}">${s.name}</div>
                <div class="ta-source-desc">${s.desc}</div>
            </div>`).join('')}
        </div>
    </div>

    <!-- TECH STACK -->
    <div class="ta-section">
        <div class="ta-section-label">Teknologi yang Digunakan</div>
        <div class="ta-tech-grid">
            ${['Leaflet.js','GeoJSON','ES6 Modules','CSS Variables',
               'MarkerCluster','Leaflet Heat','Service Worker','Canvas API'].map(t =>
                `<span class="ta-tech-badge">${t}</span>`).join('')}
        </div>
    </div>

    <!-- STATS -->
    <div class="ta-section ta-section-alt">
        <div class="ta-section-label">Statistik Aplikasi</div>
        <div class="ta-stat-row">
            ${[
                { num: '7.134+', label: 'Tempat',    accent: '#60a5fa' },
                { num: '10',     label: 'Kategori',  accent: '#34d399' },
                { num: '32+',    label: 'Sub-kat',   accent: '#a78bfa' },
                { num: '6',      label: 'Sumber',    accent: '#fbbf24' },
            ].map(s => `
            <div class="ta-stat-card" style="border-left-color:${s.accent}">
                <div class="ta-stat-num" style="color:${s.accent}">${s.num}</div>
                <div class="ta-stat-label">${s.label}</div>
            </div>`).join('')}
        </div>
    </div>

    <!-- FOOTER -->
    <div class="ta-footer">
        Versi 2.0 &nbsp;·&nbsp; Data terakhir diperbarui Januari 2025 &nbsp;·&nbsp; Jihan Nabilah Rahman
    </div>`;
}
