import { State, CATEGORIES, FACILITY_MAP } from './state.js';
import { haversineDistance, formatDistance, escapeHtml } from './utils/helpers.js';

export function initDetailPanel() {
    // Expose to window for legacy onclick compatibility
    window.showInfoCard       = showInfoCard;
    window.closeInfoCard      = closeInfoCard;
    window.showTourismPanel   = showTourismPanel;
    window.closeTourismPanel  = closeTourismPanel;
    window.showDisasterPanel  = showDisasterPanel;
    window.closeDisasterPanel = closeDisasterPanel;
    window.renderMiniBarChart = renderMiniBarChart;

    // Listen for marker click events dispatched by layers.js
    document.addEventListener('markerClicked', (e) => {
        const { feature, category } = e.detail;
        // Open unified dark panel
        openUnifiedPanel(feature, category);
    });

    // Report modal close
    const rmClose = document.getElementById('rm-close');
    if (rmClose) rmClose.addEventListener('click', closeReportModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeReportModal(); });

    // Report modal tabs
    const rmTabs = document.getElementById('rm-tabs');
    if (rmTabs) {
        rmTabs.querySelectorAll('.rm-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                rmTabs.querySelectorAll('.rm-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderReportModalTab(tab.dataset.tab);
            });
        });
    }
}

// ── Info Card ─────────────────────────────────────────────────────────────────
function showInfoCard(feature, categoryKey) {
    const card = document.getElementById('info-card');
    if (!card) return;
    const cat   = CATEGORIES[categoryKey] || CATEGORIES.kebencanaan;
    const props = feature.properties;
    const g     = feature.geometry;

    document.getElementById('info-card-badge').style.background = `${cat.color}20`;
    document.getElementById('info-card-icon').textContent  = cat.icon;
    document.getElementById('info-card-name').textContent  = props.name || 'Unnamed';
    document.getElementById('info-card-type').textContent  = props.type || cat.label;
    document.getElementById('info-category-text').textContent = cat.label;
    document.getElementById('info-category-text').style.color  = cat.color;

    const scRow = document.getElementById('info-detail-subcategory');
    if (props.subcategory) {
        scRow.style.display = 'flex';
        document.getElementById('info-subcategory-text').textContent = props.subcategory;
    } else { scRow.style.display = 'none'; }

    // Distance from map center
    if (State.map) {
        const center = State.map.getCenter();
        let cLat, cLon;
        if (g.type === 'Point') { cLon = g.coordinates[0]; cLat = g.coordinates[1]; }
        else { cLat = -7.7956; cLon = 110.3695; }
        const dist = haversineDistance(center.lat, center.lng, cLat, cLon);
        document.getElementById('info-distance-text').textContent = formatDistance(dist);
        document.getElementById('info-detail-distance').style.display = 'flex';
    }

    const hoursRow = document.getElementById('info-detail-hours');
    if (props.opening_hours) { hoursRow.style.display = 'flex'; document.getElementById('info-hours-text').textContent = props.opening_hours; }
    else { hoursRow.style.display = 'none'; }

    const opRow = document.getElementById('info-detail-operator');
    if (props.operator) { opRow.style.display = 'flex'; document.getElementById('info-operator-text').textContent = props.operator; }
    else { opRow.style.display = 'none'; }

    const coords = g.type === 'Point' ? g.coordinates : [110.3695, -7.7956];
    document.getElementById('info-btn-fly').onclick = () => State.map?.flyTo([coords[1], coords[0]], 17, { duration: 1.2 });
    document.getElementById('info-btn-gmaps').onclick = () => window.open(`https://www.google.com/maps?q=${coords[1]},${coords[0]}`, '_blank');

    card.classList.remove('hidden');
}

function closeInfoCard() {
    document.getElementById('info-card')?.classList.add('hidden');
}

// ── Tourism / General Detail Panel ───────────────────────────────────────────
function showTourismPanel(feature, categoryKey) {
    const panel = document.getElementById('tourism-panel');
    if (!panel) return;
    const props  = feature.properties;
    const g      = feature.geometry;
    const catKey = categoryKey || props.category || 'pariwisata';
    const cat    = CATEGORIES[catKey] || CATEGORIES.pariwisata;

    closeInfoCard();
    closeDisasterPanel();

    // Header photo / gradient
    const header = document.getElementById('tp-header');
    if (props.foto) header.style.backgroundImage = `url('${props.foto}')`;
    else            header.style.backgroundImage = `linear-gradient(135deg, ${cat.color}, ${cat.color}99)`;

    const badge = document.getElementById('tp-category-badge');
    badge.textContent  = props.subcategory || props.type || cat.label;
    badge.style.background = `${cat.color}cc`;

    document.getElementById('tp-name').textContent = props.name || 'Unnamed';

    // Rating
    const rating    = props.rating || 0;
    const statsRow  = document.querySelector('.tp-stats-row');
    if (rating > 0 && statsRow) {
        statsRow.style.display = 'flex';
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating))      starsHtml += '<span class="star filled">★</span>';
            else if (i - 0.5 <= rating)       starsHtml += '<span class="star half">★</span>';
            else                              starsHtml += '<span class="star">★</span>';
        }
        document.getElementById('tp-stars').innerHTML   = starsHtml;
        document.getElementById('tp-rating').textContent = rating.toFixed(1);
        document.getElementById('tp-reviews').textContent = props.reviews ? `· ${props.reviews.toLocaleString()} ulasan` : '';
        document.getElementById('tp-visitors').textContent = props.visitors_per_day ? `~${props.visitors_per_day.toLocaleString()} / hari` : '';
    } else if (statsRow) { statsRow.style.display = 'none'; }

    // Hours & ticket
    const pillsRow = document.querySelector('.tp-info-pills');
    if (props.opening_hours || props.ticket_price) {
        if (pillsRow) pillsRow.style.display = 'flex';
        document.getElementById('tp-hours').textContent  = props.opening_hours  || '-';
        document.getElementById('tp-ticket').textContent = props.ticket_price || '-';
    } else if (pillsRow) { pillsRow.style.display = 'none'; }

    // Crowd chart
    const chartSection = document.querySelector('.tp-chart-section');
    const hourlyData   = props.hourly_crowd;
    if (hourlyData && hourlyData.length === 24) {
        if (chartSection) chartSection.style.display = 'block';
        const currentHour = new Date().getHours();
        const crowdLevel  = hourlyData[currentHour] || 0;
        const badge2 = document.getElementById('tp-crowd-badge');
        if (badge2) {
            if (crowdLevel >= 60) { badge2.textContent = '🔴 Keramaian tinggi';  badge2.className = 'tp-crowd-badge crowd-high'; }
            else if (crowdLevel >= 30) { badge2.textContent = '🟡 Keramaian sedang'; badge2.className = 'tp-crowd-badge crowd-medium'; }
            else { badge2.textContent = '🟢 Keramaian rendah'; badge2.className = 'tp-crowd-badge crowd-low'; }
        }
    } else if (chartSection) { chartSection.style.display = 'none'; }

    // Facilities
    const facSection = document.querySelector('.tp-facilities-section');
    const facilities  = props.facilities || [];
    if (facilities.length > 0) {
        if (facSection) facSection.style.display = 'flex';
        document.getElementById('tp-facilities').innerHTML = facilities.map(f => {
            const fac = FACILITY_MAP[f] || { icon: '📍', label: f };
            return `<div class="tp-facility-item"><span class="tp-facility-icon">${fac.icon}</span><span class="tp-facility-label">${escapeHtml(fac.label)}</span></div>`;
        }).join('');
    } else if (facSection) { facSection.style.display = 'none'; }

    // Description
    const descEl = document.getElementById('tp-description');
    if (descEl) { descEl.textContent = props.description || ''; descEl.style.display = props.description ? 'block' : 'none'; }

    // Address
    const addrRow = document.getElementById('tp-address-row');
    if (props.address) { addrRow.style.display = 'flex'; document.getElementById('tp-address').textContent = props.address; }
    else if (addrRow) { addrRow.style.display = 'none'; }

    // Tips
    const tipsRow = document.getElementById('tp-tips-row');
    if (props.tips) { if(tipsRow) tipsRow.style.display = 'block'; document.getElementById('tp-tips').textContent = props.tips; }
    else if (tipsRow) { tipsRow.style.display = 'none'; }

    // Action buttons
    const coords = g.type === 'Point' ? g.coordinates : [110.3695, -7.7956];
    const flyBtn = document.getElementById('tp-btn-fly');
    if (flyBtn) {
        flyBtn.onclick = () => State.map?.flyTo([coords[1], coords[0]], 17, { duration: 1.2 });
        flyBtn.style.background  = `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`;
        flyBtn.style.boxShadow   = `0 4px 15px ${cat.color}4d`;
    }
    const mapsBtn = document.getElementById('tp-btn-gmaps');
    if (mapsBtn) mapsBtn.onclick = () => window.open(`https://www.google.com/maps?q=${coords[1]},${coords[0]}`, '_blank');

    panel.classList.remove('hidden');

    // Render chart
    if (hourlyData && hourlyData.length === 24) {
        requestAnimationFrame(() => {
            const canvas = document.getElementById('tp-chart');
            if (canvas) renderMiniBarChart(canvas, hourlyData);
        });
    }
}

function closeTourismPanel() {
    document.getElementById('tourism-panel')?.classList.add('hidden');
}

// ── Mini Bar Chart ────────────────────────────────────────────────────────────
function renderMiniBarChart(canvas, data) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 340;
    const h = canvas.clientHeight || 100;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const max = Math.max(...data, 1);
    const barW = (w - 2) / 24;
    const currentHour = new Date().getHours();
    for (let i = 0; i < 24; i++) {
        const val  = data[i] / max;
        const barH = val * (h - 8);
        const x = i * barW + 1;
        const y = h - barH - 2;
        let color = data[i] >= 60 ? '#ef4444' : data[i] >= 30 ? '#f59e0b' : '#10b981';
        if (i === currentHour) { ctx.shadowColor = color; ctx.shadowBlur = 8; }
        ctx.fillStyle = i === currentHour ? '#ffffff' : color;
        ctx.fillRect(x, y, barW - 1, Math.max(barH, 1));
        ctx.shadowBlur = 0;
    }
}

// ── Disaster Detail Panel ─────────────────────────────────────────────────────
// Warna badge per subkategori bencana
const DISASTER_BADGE_COLORS = {
    'Rawan Erupsi': '#ef4444', 'Risiko Erupsi': '#ef4444',
    'KRB III': '#ef4444',      'KRB II': '#dc2626',    'KRB I': '#b91c1c',
    'Rawan Banjir': '#3b82f6', 'Risiko Banjir': '#2563eb', 'Daerah Banjir': '#1d4ed8',
    'Rawan Gempa':  '#f97316', 'Risiko Gempa':  '#ea580c', 'Zona Gempa':   '#c2410c',
    'Rawan Longsor':'#92400e', 'Risiko Longsor':'#78350f', 'Zona Longsor': '#713f12',
    'Rawan Kekeringan':'#ca8a04','Kekeringan':  '#a16207',
    'Jalur Evakuasi':'#22c55e',
    'Titik Kumpul': '#06b6d4', 'Pengungsian':  '#6366f1',
};

function showDisasterPanel(feature, categoryKey) {
    const panel = document.getElementById('disaster-panel');
    if (!panel) return;
    const props = feature.properties;
    closeTourismPanel();
    closeInfoCard();
    State.currentReportFeature = { feature, categoryKey };

    // ── Header photo / gradient ───────────────────────────────────────────────
    const header = document.getElementById('dp-header');
    const subcat = props.subcategory || props.type || 'Kebencanaan';
    const badgeColor = DISASTER_BADGE_COLORS[subcat] || '#dc2626';

    if (props.foto) {
        header.style.backgroundImage = `url('${props.foto}')`;
    } else {
        header.style.backgroundImage = `linear-gradient(135deg, ${badgeColor}, ${badgeColor}99)`;
    }

    // ── Category badge (subkategori berwarna) ─────────────────────────────────
    const badgeEl = document.getElementById('dp-category-badge');
    if (badgeEl) {
        badgeEl.textContent = subcat;
        badgeEl.style.cssText = `
            display:inline-block;font-size:10px;font-weight:700;text-transform:uppercase;
            letter-spacing:0.08em;padding:4px 12px;border-radius:20px;
            background:${badgeColor}cc;color:#fff;border:1px solid ${badgeColor};
            backdrop-filter:blur(8px);margin-bottom:8px;
        `;
    }

    // ── Nama ─────────────────────────────────────────────────────────────────
    document.getElementById('dp-name').textContent = props.name || 'Unnamed';

    // ── Kapasitas & Status ────────────────────────────────────────────────────
    const capRow = document.getElementById('dp-capacity-row');
    if (props.kapasitas || props.status_terisi) {
        capRow.style.display = 'flex';
        const capEl = document.getElementById('dp-capacity');
        const statEl = document.getElementById('dp-status');
        if (capEl) capEl.textContent = props.kapasitas ? `${props.kapasitas.toLocaleString()} jiwa` : '—';
        if (statEl) {
            const st = props.status_terisi || '—';
            statEl.textContent = st;
            statEl.style.color = st.toLowerCase().includes('penuh') ? '#ef4444'
                                : st.toLowerCase().includes('sebagian') ? '#f97316' : '#22c55e';
        }
    } else {
        capRow.style.display = 'none';
    }

    // ── Alamat ───────────────────────────────────────────────────────────────
    const addrRow = document.getElementById('dp-address-row');
    if (props.address || props.alamat) {
        addrRow.style.display = 'flex';
        document.getElementById('dp-address').textContent = props.address || props.alamat;
    } else {
        addrRow.style.display = 'none';
    }

    // ── Deskripsi ─────────────────────────────────────────────────────────────
    const descEl = document.getElementById('dp-description');
    if (descEl) {
        descEl.textContent = props.deskripsi || props.description || '';
        descEl.style.display = (props.deskripsi || props.description) ? 'block' : 'none';
    }

    // ── Fasilitas ─────────────────────────────────────────────────────────────
    const facSection = document.getElementById('dp-facilities-section');
    const facilities  = props.facilities || [];
    if (facilities.length > 0) {
        facSection.style.display = 'block';
        document.getElementById('dp-facilities').innerHTML = facilities.map(f => {
            const fac = FACILITY_MAP[f] || { icon: '📍', label: f };
            return `<span class="dp-facility-chip">${fac.icon} ${escapeHtml(fac.label)}</span>`;
        }).join('');
    } else {
        facSection.style.display = 'none';
    }

    // ── Instruksi Evakuasi ────────────────────────────────────────────────────
    const evacBox = document.getElementById('dp-evac-box');
    if (props.instruksi_evakuasi) {
        evacBox.style.display = 'block';
        document.getElementById('dp-evac-text').textContent = props.instruksi_evakuasi;
    } else {
        evacBox.style.display = 'none';
    }

    // ── Kontak Darurat ────────────────────────────────────────────────────────
    const contactCard = document.getElementById('dp-contact');
    if (props.kontak_darurat || props.instansi) {
        contactCard.style.display = 'flex';
        const nameEl = document.getElementById('dp-contact-name');
        const phoneEl = document.getElementById('dp-contact-phone');
        const callEl  = document.getElementById('dp-contact-call');
        const phone = (props.kontak_darurat || '').replace(/[^\d+]/g, '').slice(0, 16);
        if (nameEl) nameEl.textContent = props.instansi || 'BPBD DIY';
        if (phoneEl) {
            phoneEl.textContent = props.kontak_darurat || '';
            phoneEl.href = `tel:${phone}`;
        }
        if (callEl) callEl.href = `tel:${phone}`;
        // Badge color for call button
        const callBtn = document.querySelector('.dp-contact-call-btn');
        if (callBtn) callBtn.style.background = badgeColor;
    } else {
        contactCard.style.display = 'none';
    }

    // ── Sumber & Tanggal ──────────────────────────────────────────────────────
    const sourceEl = document.getElementById('dp-source');
    const updEl    = document.getElementById('dp-updated');
    if (sourceEl) {
        sourceEl.style.display = 'block';
        if (updEl) updEl.textContent = props.last_updated || props.tanggal_update || '—';
    }

    // ── Tombol aksi ───────────────────────────────────────────────────────────
    const g = feature.geometry;
    let cLat = -7.7956, cLon = 110.3695;
    if (g.type === 'Point') { cLon = g.coordinates[0]; cLat = g.coordinates[1]; }

    document.getElementById('dp-btn-gmaps').onclick = () =>
        window.open(`https://www.google.com/maps?q=${cLat},${cLon}`, '_blank');
    document.getElementById('dp-btn-report').onclick = () => {
        const lapTab = document.querySelector('.top-nav-tab[data-page="laporan"]');
        if (lapTab) lapTab.click();
    };

    panel.classList.remove('hidden');
}

function closeDisasterPanel() {
    document.getElementById('disaster-panel')?.classList.add('hidden');
}

// ── Report Modal ──────────────────────────────────────────────────────────────
function closeReportModal() {
    document.getElementById('report-modal')?.classList.add('hidden');
}

function renderReportModalTab(tab) {
    const content = document.getElementById('rm-content');
    if (!content) return;
    const feature = State.currentReportFeature?.feature;
    if (!feature) { content.innerHTML = '<p style="color:var(--text-muted);padding:20px">Tidak ada data dipilih.</p>'; return; }
    const props = feature.properties;
    if (tab === 'ringkasan') {
        content.innerHTML = `<div style="padding:20px"><h3>${escapeHtml(props.name||'')}</h3><p>${escapeHtml(props.deskripsi||'')}</p></div>`;
    } else if (tab === 'riwayat') {
        const hist = props.riwayat_bencana || [];
        content.innerHTML = `<div style="padding:20px">${hist.length ? hist.map(h => `<div style="margin-bottom:12px;padding:12px;background:rgba(30,41,59,0.4);border-radius:8px"><strong>${h.tanggal}</strong><br>${h.jenis} ${h.skala}<br>${h.deskripsi||''}</div>`).join('') : '<p style="color:var(--text-muted)">Belum ada riwayat.</p>'}</div>`;
    } else if (tab === 'evakuasi') {
        content.innerHTML = `<div style="padding:20px"><p>${escapeHtml(props.instruksi_evakuasi||'Tidak ada instruksi tersedia.')}</p></div>`;
    } else if (tab === 'kontak') {
        content.innerHTML = `<div style="padding:20px"><p>Kontak Darurat BPBD: <a href="tel:${props.kontak_darurat||''}">${escapeHtml(props.kontak_darurat||'-')}</a></p></div>`;
    }
}

// ── Unified Dark Panel (new #detail-panel) ────────────────────────────────────
function openUnifiedPanel(feature, categoryKey) {
    const panel = document.getElementById('detail-panel');
    if (!panel) return;
    const props = feature.properties;
    const cat   = CATEGORIES[categoryKey] || {};
    const g     = feature.geometry;

    // Store latlng for fly/gmaps buttons
    if (g && g.type === 'Point') {
        window._detailLatLng = [g.coordinates[1], g.coordinates[0]];
    } else if (g && g.type === 'Polygon') {
        const coords = g.coordinates[0];
        const avgLat = coords.reduce((s,c) => s + c[1], 0) / coords.length;
        const avgLon = coords.reduce((s,c) => s + c[0], 0) / coords.length;
        window._detailLatLng = [avgLat, avgLon];
    }

    // Photo
    const imgEl = document.getElementById('detail-photo-img');
    const photoQueries = {
        kebencanaan: 'disaster+yogyakarta+merapi',
        pariwisata:  'yogyakarta+temple+tourism',
        wisata:      'yogyakarta+temple+tourism',
        mobilitas:   'yogyakarta+transport+station',
        lingkungan:  'yogyakarta+nature+environment',
        kesehatan_darurat: 'hospital+indonesia'
    };
    const q = photoQueries[categoryKey] || encodeURIComponent(props.name || 'yogyakarta');
    imgEl.src = props.foto || `https://source.unsplash.com/400x200/?${q}`;
    imgEl.onerror = () => { imgEl.src = `https://picsum.photos/seed/${encodeURIComponent(props.name||'jogja')}/400/200`; };

    // Badge
    const badge = document.getElementById('detail-cat-badge');
    const riskBadgeMap = { 'Sangat Tinggi':'badge-risiko-sangat-tinggi','Tinggi':'badge-risiko-tinggi','Sedang':'badge-risiko-sedang','Rendah':'badge-risiko-rendah' };
    badge.className = 'detail-category-badge ' + (riskBadgeMap[props.risiko] || (categoryKey === 'kebencanaan' ? 'badge-risiko-sedang' : 'badge-wisata'));
    const subcatText = props.subcategory || props.subkategori || props.type || props.jenis_bencana;
    badge.textContent = props.risiko || subcatText || cat.label || categoryKey;

    // Name
    document.getElementById('detail-name').textContent = props.name || props.nama || '—';

    // Build tab content
    const isDisaster = categoryKey === 'kebencanaan';
    const isPengungsian = !!(props.kapasitas_pengungsi || props.type === 'Tempat Pengungsian' || props.subcategory === 'Pengungsian' || props.subcategory === 'Titik Kumpul');

    const tabsContainer = document.getElementById('detail-tabs');
    const tabBtns = tabsContainer.querySelectorAll('.dtab');
    
    // Default panes
    const paneInfo = document.getElementById('dtab-info');
    const paneDetail = document.getElementById('dtab-detail');
    const paneFasil = document.getElementById('dtab-fasilitas');
    const paneGrafik = document.getElementById('dtab-grafik');

    if (isDisaster) {
        tabsContainer.style.display = 'flex';
        // Hide all panes except first
        paneInfo.classList.remove('hidden');
        paneDetail.classList.add('hidden');
        paneFasil.classList.add('hidden');
        paneGrafik.classList.add('hidden');
        
        // Reset active tab button
        tabBtns.forEach((b, i) => {
            b.classList.toggle('active', i === 0);
            b.style.display = 'block'; // Ensure visible
        });

        if (isPengungsian) {
            tabBtns[0].textContent = 'Informasi';
            tabBtns[1].textContent = 'Fasilitas';
            tabBtns[2].textContent = 'Kontak & Akses';
            tabBtns[3].textContent = 'Kapasitas';
            
            // Tab 1: Informasi
            const infoRows = [
                ['Nama', props.name || props.nama || '—'],
                ['Alamat', props.alamat || props.address || '—'],
                ['Kapasitas Maks', props.kapasitas ? `${props.kapasitas} jiwa` : '—'],
                ['Status', props.status_terisi || props.status || 'Aktif'],
            ];
            paneInfo.innerHTML = infoRows.map(([l, v]) => `<div class="dp-row"><span class="dp-label">${l}</span><span class="dp-val">${escapeHtml(String(v))}</span></div>`).join('');
            
            // Tab 2: Fasilitas
            const fasilList = props.fasilitas || props.amenity_list || [];
            if (fasilList.length) {
                paneDetail.innerHTML = fasilList.map(f => `<div class="dp-checklist-item"><div class="dp-check dp-check-yes">v</div>${f}</div>`).join('');
            } else {
                paneDetail.innerHTML = '<p class="dp-desc" style="color:var(--text-muted)">Data fasilitas belum tersedia.</p>';
            }
            
            // Tab 3: Kontak & Akses
            const kontakRows = [
                ['Pengelola', props.instansi || props.operator || 'BPBD DIY'],
                ['Telepon', props.kontak_darurat || props.telepon || '—'],
                ['Akses', props.akses || 'Jalan Raya Utama'],
            ];
            paneFasil.innerHTML = kontakRows.map(([l, v]) => `<div class="dp-row"><span class="dp-label">${l}</span><span class="dp-val">${escapeHtml(String(v))}</span></div>`).join('');
            
            // Tab 4: Kapasitas (Chart placeholder for now)
            paneGrafik.innerHTML = `<div class="dp-section">Grafik Kapasitas</div><div class="dp-chart-wrap"><canvas id="detail-chart"></canvas></div><p class="dp-desc" style="font-size:11px;color:var(--text-muted)">*Data kapasitas harian akan muncul di sini</p>`;
            
        } else {
            // Zona Bencana (Polygons)
            tabBtns[0].textContent = 'Ringkasan';
            tabBtns[1].textContent = 'Detail Dampak';
            tabBtns[2].textContent = 'Fasilitas Terdekat';
            tabBtns[3].textContent = 'Grafik';
            
            // Tab 1: Ringkasan
            const infoRows = [
                ['Zona', props.name || props.nama || '—'],
                ['Kecamatan', props.kecamatan || '—'],
                ['Jenis', props.jenis_bencana || props.subcategory || '—'],
                ['Luas', props.luas_terdampak_km2 ? `${props.luas_terdampak_km2} km²` : '—'],
            ];
            paneInfo.innerHTML = infoRows.map(([l, v]) => `<div class="dp-row"><span class="dp-label">${l}</span><span class="dp-val">${escapeHtml(String(v))}</span></div>`).join('') +
                (props.deskripsi ? `<div class="dp-section">Deskripsi</div><p class="dp-desc">${escapeHtml(props.deskripsi)}</p>` : '');
            
            // Tab 2: Detail Dampak
            const dampakRows = [
                ['Korban Jiwa', props.korban_jiwa || '0'],
                ['Pengungsi', props.pengungsi || '0'],
                ['Kerugian', props.kerugian_material || '—'],
                ['Populasi', props.populasi_berisiko || '—'],
            ];
            paneDetail.innerHTML = dampakRows.map(([l, v]) => `<div class="dp-row"><span class="dp-label">${l}</span><span class="dp-val dp-val-mono">${escapeHtml(String(v))}</span></div>`).join('');
            
            // Tab 3: Fasilitas Terdekat
            paneFasil.innerHTML = `<div class="dp-checklist-item"><div class="dp-check dp-check-yes">v</div>Titik Kumpul Terdekat (1.2km)</div><div class="dp-checklist-item"><div class="dp-check dp-check-yes">v</div>Puskesmas (3km)</div>`;
            
            // Tab 4: Grafik (Chart placeholder for now)
            paneGrafik.innerHTML = `<div class="dp-section">Tren Bencana</div><div class="dp-chart-wrap"><canvas id="detail-chart"></canvas></div><p class="dp-desc" style="font-size:11px;color:var(--text-muted)">*Tren historis akan muncul di sini</p>`;
        }
        
    } else {
        // Tata Kelola: Single Scrollable View (No Tabs)
        tabsContainer.style.display = 'none';
        paneInfo.classList.remove('hidden');
        paneDetail.classList.remove('hidden');
        paneFasil.classList.remove('hidden');
        paneGrafik.classList.remove('hidden');
        
        // Informasi
        const infoRows = [
            ['Kategori', cat.label || categoryKey],
            subcatText ? ['Subkategori', subcatText] : null,
            (props.alamat || props.address) ? ['Alamat', props.alamat || props.address] : null,
            props.kecamatan ? ['Kecamatan', props.kecamatan] : null,
            props.operator ? ['Pengelola', props.operator] : null,
            ['Jam Operasional', props.opening_hours || props.jam_buka || '—'],
            ['Tiket / HTM', props.htm || props.ticket_price || 'Gratis'],
        ].filter(Boolean);
        paneInfo.innerHTML = infoRows.map(([l, v]) => `<div class="dp-row"><span class="dp-label">${l}</span><span class="dp-val">${escapeHtml(String(v))}</span></div>`).join('') +
            (props.deskripsi ? `<div class="dp-section">Deskripsi</div><p class="dp-desc">${escapeHtml(props.deskripsi)}</p>` : '');
            
        // Detail (Rating dll)
        const detailRows = [
            props.rating ? ['Rating', `${props.rating} / 5.0`] : null,
            props.pengunjung ? ['Pengunjung/Hari', `±${Number(props.pengunjung).toLocaleString('id-ID')}`] : null,
        ].filter(Boolean);
        paneDetail.innerHTML = detailRows.length ? `<div class="dp-section">Statistik</div>` + detailRows.map(([l, v]) => `<div class="dp-row"><span class="dp-label">${l}</span><span class="dp-val dp-val-mono">${escapeHtml(String(v))}</span></div>`).join('') : '';
        
        // Fasilitas
        const fasilList = props.fasilitas || props.amenity_list || [];
        if (fasilList.length) {
            paneFasil.innerHTML = `<div class="dp-section">Fasilitas Tersedia</div>` + fasilList.map(f => `<div class="dp-checklist-item"><div class="dp-check dp-check-yes">v</div>${f}</div>`).join('');
        } else {
            paneFasil.innerHTML = '';
        }
        
        // Grafik Keramaian
        if (props.hourly_crowd) {
            paneGrafik.innerHTML = `<div class="dp-section">Grafik Keramaian</div><div class="dp-chart-wrap"><canvas id="detail-chart"></canvas></div>`;
            requestAnimationFrame(() => {
                const canvas = document.getElementById('detail-chart');
                if (canvas) renderMiniBarChart(canvas, props.hourly_crowd);
            });
        } else {
            paneGrafik.innerHTML = '';
        }
    }

    // Open panel
    panel.classList.add('open');
}