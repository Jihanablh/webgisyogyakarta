export function initAboutPage() {
    const container = document.querySelector('#tentang-page .tentang-container');
    if (!container) return;

    container.innerHTML = `
    <style>
        .ta-divider {
            display: flex; align-items: center; gap: 16px; margin: 36px 0;
        }
        .ta-divider::before, .ta-divider::after {
            content: ''; flex: 1; height: 1px; background: rgba(212,175,55,0.2);
        }
        .ta-divider-sym {
            color: #d4af37; font-size: 16px; opacity: 0.6;
        }
        .ta-card-hover {
            transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .ta-card-hover:hover {
            transform: translateY(-3px);
            border-color: rgba(212,175,55,0.35) !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(212,175,55,0.08);
        }
    </style>

    <!-- HERO -->
    <div style="text-align:center; padding: 20px 0 48px; position:relative; overflow:hidden;">
        <!-- Kawung SVG pattern background (very subtle) -->
        <div style="position:absolute;inset:0;opacity:0.03;pointer-events:none;">
            <svg width="100%" height="100%">
                <defs>
                    <pattern id="kawung" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="10" cy="10" r="8" fill="none" stroke="#d4af37" stroke-width="1"/>
                        <circle cx="30" cy="10" r="8" fill="none" stroke="#d4af37" stroke-width="1"/>
                        <circle cx="10" cy="30" r="8" fill="none" stroke="#d4af37" stroke-width="1"/>
                        <circle cx="30" cy="30" r="8" fill="none" stroke="#d4af37" stroke-width="1"/>
                        <circle cx="20" cy="20" r="8" fill="none" stroke="#d4af37" stroke-width="1"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#kawung)"/>
            </svg>
        </div>
        <div style="position:relative;z-index:1;">
            <div style="display:inline-block;padding:5px 18px;border:1px solid rgba(212,175,55,0.3);border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#d4af37;margin-bottom:20px;">
                Versi 2.0 &nbsp;&middot;&nbsp; 2024/2025
            </div>
            <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:52px;font-weight:800;color:#f1f5f9;margin:0 0 14px;letter-spacing:0;">JogjaMap</h1>
            <p style="font-size:18px;color:#94a3b8;line-height:1.6;margin:0 0 24px;">Panduan digital lengkap wilayah<br>Daerah Istimewa Yogyakarta</p>
            <div style="font-size:14px;color:#4b5568;line-height:1.7;">
                <span style="color:#94a3b8;font-weight:600;">Jihan Nabilah Rahman</span><br>
                Proyek Kapita &nbsp;&middot;&nbsp; Semester 6
            </div>
        </div>
    </div>

    <div class="ta-divider"><span class="ta-divider-sym">&#9670;</span></div>

    <!-- PILLARS -->
    <div style="margin-bottom:8px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#4b5568;margin-bottom:20px;text-align:center;">Tiga Pilar Utama</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
            ${[
            { title: 'Navigasi', desc: 'Ribuan lokasi wisata, fasilitas, dan layanan publik DIY dalam satu peta interaktif.', accent: '#3b82f6', border: 'rgba(59,130,246,0.4)' },
            { title: 'Keselamatan', desc: 'Zona risiko bencana, jalur evakuasi, dan kontak darurat terverifikasi dari BPBD DIY dan BNPB.', accent: '#ef4444', border: 'rgba(239,68,68,0.4)' },
            { title: 'Data', desc: 'Statistik visual dan distribusi spasial per wilayah DIY, diperbarui berkala dari sumber terpercaya.', accent: '#22c55e', border: 'rgba(34,197,94,0.4)' },
        ].map(p => `
            <div class="ta-card-hover" style="background:rgba(16,22,40,0.7);border:1px solid rgba(148,163,184,0.1);border-top:3px solid ${p.border};border-radius:14px;padding:28px 24px;">
                <h3 style="font-size:17px;font-weight:700;color:${p.accent};margin:0 0 12px;">${p.title}</h3>
                <p style="font-size:13.5px;color:#94a3b8;line-height:1.65;margin:0;">${p.desc}</p>
            </div>`).join('')}
        </div>
    </div>

    <div class="ta-divider"><span class="ta-divider-sym">&#9670;</span></div>

    <!-- DATA SOURCES -->
    <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#4b5568;margin-bottom:20px;text-align:center;">Sumber Data</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;">
            ${[
            { name: 'OpenStreetMap / HOT', desc: 'Geometri & titik lokasi', accent: '#60a5fa' },
            { name: 'BPBD DIY', desc: 'Data kebencanaan lokal', accent: '#f87171' },
            { name: 'BMKG', desc: 'Cuaca & seismologi', accent: '#34d399' },
            { name: 'BNPB', desc: 'Risiko bencana nasional', accent: '#fb923c' },
            { name: 'BPPTKG', desc: 'Aktivitas Gunung Merapi', accent: '#a78bfa' },
            { name: 'GADM v4.1', desc: 'Batas wilayah administrasi', accent: '#d4af37' },
        ].map(s => `
            <div class="ta-card-hover" style="background:rgba(16,22,40,0.6);border:1px solid rgba(148,163,184,0.1);border-radius:12px;padding:18px;">
                <div style="font-size:15px;font-weight:700;color:${s.accent};margin-bottom:6px;">${s.name}</div>
                <div style="font-size:12.5px;color:#4b5568;">${s.desc}</div>
            </div>`).join('')}
        </div>
    </div>

    <div class="ta-divider"><span class="ta-divider-sym">&#9670;</span></div>

    <!-- TECH STACK -->
    <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#4b5568;margin-bottom:20px;text-align:center;">Teknologi</div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">
            ${['Leaflet.js', 'GeoJSON', 'ES6 Modules', 'CSS Custom Properties',
            'MarkerCluster', 'Canvas API', 'Fetch API', 'Service Worker'].map(t =>
                `<span style="background:#111827;border:1px solid rgba(148,163,184,0.15);color:#94a3b8;padding:8px 18px;border-radius:100px;font-size:13px;font-weight:500;">${t}</span>`
            ).join('')}
        </div>
    </div>

    <div class="ta-divider"><span class="ta-divider-sym">&#9670;</span></div>

    <!-- STAT SUMMARY -->
    <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#4b5568;margin-bottom:20px;text-align:center;">Ringkasan Statistik</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;">
            ${[
            { num: '7.100+', label: 'Tempat', accent: '#60a5fa' },
            { num: '10', label: 'Kategori', accent: '#34d399' },
            { num: '32+', label: 'Subkategori', accent: '#a78bfa' },
            { num: '6', label: 'Sumber Data', accent: '#d4af37' },
        ].map(s => `
            <div class="ta-card-hover" style="background:#0d1117;border:1px solid rgba(148,163,184,0.1);border-left:3px solid ${s.accent};border-radius:12px;padding:22px 18px;">
                <div style="font-family:'Playfair Display',serif;font-size:30px;font-weight:700;color:${s.accent};margin-bottom:6px;">${s.num}</div>
                <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#4b5568;">${s.label}</div>
            </div>`).join('')}
        </div>
    </div>

    <!-- FOOTER -->
    <div style="text-align:center;padding-top:48px;margin-top:48px;border-top:1px solid rgba(148,163,184,0.08);color:#4b5568;font-size:12px;line-height:1.8;">
        JogjaMap v2.0 &nbsp;&middot;&nbsp; Data diperbarui Januari 2025 &nbsp;&middot;&nbsp; Jihan Nabilah Rahman
    </div>`;
}
