import { State, CATEGORIES, FACILITY_MAP } from './state.js?v=20260526-round26-welcome-encoding';
import { haversineDistance, formatDistance, escapeHtml, sanitizeText } from './utils/helpers.js?v=20260526-round26-welcome-encoding';
import { DISASTER_TYPE_KEYS, DISASTER_TYPE_LABELS, riskColor } from './disaster-2025.js?v=20260526-round26-welcome-encoding';

export function initDetailPanel() {
    // Expose to window for legacy onclick compatibility
    window.showInfoCard       = showInfoCard;
    window.closeInfoCard      = closeInfoCard;
    window.showTourismPanel   = showTourismPanel;
    window.closeTourismPanel  = closeTourismPanel;
    window.showDisasterPanel  = showDisasterPanel;
    window.closeDisasterPanel = closeDisasterPanel;
    window.renderMiniBarChart = renderMiniBarChart;
    window.openDetailPanel    = openDetailPanel;

    // Listen for marker click events dispatched by layers.js
    document.addEventListener('markerClicked', (e) => {
        const { feature, category } = e.detail;
        const props = feature?.properties || {};
        const isPengungsian = category === 'kebencanaan' && !!(props.nama_lokasi || props.jenis_posko || props.type_layer === 'titik_pengungsian' || props.type === 'Tempat Pengungsian' || props.subcategory === 'Pengungsian' || props.subcategory === 'Titik Kumpul');
        if (isPengungsian && typeof window.showPengungsianInLeftPanel === 'function') {
            window.showPengungsianInLeftPanel(feature);
            return;
        }
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

// -- Info Card -----------------------------------------------------------------
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

// -- Tourism / General Detail Panel -------------------------------------------
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
            if (i <= Math.floor(rating))      starsHtml += '<span class="star filled">&#9733;</span>';
            else if (i - 0.5 <= rating)       starsHtml += '<span class="star half">&#9733;</span>';
            else                              starsHtml += '<span class="star">&#9734;</span>';
        }
        document.getElementById('tp-stars').innerHTML   = starsHtml;
        document.getElementById('tp-rating').textContent = rating.toFixed(1);
        document.getElementById('tp-reviews').textContent = props.reviews ? `Â· ${props.reviews.toLocaleString()} ulasan` : '';
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
            if (crowdLevel >= 60) { badge2.textContent = 'Ã°Å¸â€Â´ Keramaian tinggi';  badge2.className = 'tp-crowd-badge crowd-high'; }
            else if (crowdLevel >= 30) { badge2.textContent = 'Ã°Å¸Å¸Â¡ Keramaian sedang'; badge2.className = 'tp-crowd-badge crowd-medium'; }
            else { badge2.textContent = 'Ã°Å¸Å¸Â¢ Keramaian rendah'; badge2.className = 'tp-crowd-badge crowd-low'; }
        }
    } else if (chartSection) { chartSection.style.display = 'none'; }

    // Facilities
    const facSection = document.querySelector('.tp-facilities-section');
    const facilities  = props.facilities || [];
    if (facilities.length > 0) {
        if (facSection) facSection.style.display = 'flex';
        document.getElementById('tp-facilities').innerHTML = facilities.map(f => {
            const fac = FACILITY_MAP[f] || { icon: 'Ã°Å¸â€œÂ', label: f };
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

// -- Mini Bar Chart ------------------------------------------------------------
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
        let color = '#27ae60';
        if (data[i] >= 55) color = '#c0392b';
        else if (data[i] >= 40) color = '#e67e22';
        else if (data[i] >= 28) color = '#f1c40f';
        else color = '#27ae60';
        if (i === currentHour) { ctx.shadowColor = color; ctx.shadowBlur = 8; }
        ctx.fillStyle = i === currentHour ? '#ffffff' : color;
        ctx.fillRect(x, y, barW - 1, Math.max(barH, 1));
        ctx.shadowBlur = 0;
    }
}

// -- Disaster Detail Panel -----------------------------------------------------
// Warna badge per subkategori bencana
const DISASTER_BADGE_COLORS = {
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

    // -- Header photo / gradient -----------------------------------------------
    const header = document.getElementById('dp-header');
    const subcat = props.subcategory || props.type || 'Kebencanaan';
    const badgeColor = DISASTER_BADGE_COLORS[subcat] || '#dc2626';

    if (props.foto) {
        header.style.backgroundImage = `url('${props.foto}')`;
    } else {
        header.style.backgroundImage = `linear-gradient(135deg, ${badgeColor}, ${badgeColor}99)`;
    }

    // -- Category badge (subkategori berwarna) ---------------------------------
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

    // -- Nama -----------------------------------------------------------------
    document.getElementById('dp-name').textContent = props.name || 'Unnamed';

    // -- Kapasitas & Status ----------------------------------------------------
    const capRow = document.getElementById('dp-capacity-row');
    if (props.kapasitas || props.status_terisi) {
        capRow.style.display = 'flex';
        const capEl = document.getElementById('dp-capacity');
        const statEl = document.getElementById('dp-status');
        if (capEl) capEl.textContent = props.kapasitas ? `${props.kapasitas.toLocaleString()} jiwa` : 'â€”';
        if (statEl) {
            const st = props.status_terisi || 'â€”';
            statEl.textContent = st;
            statEl.style.color = st.toLowerCase().includes('penuh') ? '#ef4444'
                                : st.toLowerCase().includes('sebagian') ? '#f97316' : '#22c55e';
        }
    } else {
        capRow.style.display = 'none';
    }

    // -- Alamat ---------------------------------------------------------------
    const addrRow = document.getElementById('dp-address-row');
    if (props.address || props.alamat) {
        addrRow.style.display = 'flex';
        document.getElementById('dp-address').textContent = props.address || props.alamat;
    } else {
        addrRow.style.display = 'none';
    }

    // -- Deskripsi -------------------------------------------------------------
    const descEl = document.getElementById('dp-description');
    if (descEl) {
        descEl.textContent = props.deskripsi || props.description || '';
        descEl.style.display = (props.deskripsi || props.description) ? 'block' : 'none';
    }

    // -- Fasilitas -------------------------------------------------------------
    const facSection = document.getElementById('dp-facilities-section');
    const facilities  = props.facilities || [];
    if (facilities.length > 0) {
        facSection.style.display = 'block';
        document.getElementById('dp-facilities').innerHTML = facilities.map(f => {
            const fac = FACILITY_MAP[f] || { icon: 'Ã°Å¸â€œÂ', label: f };
            return `<span class="dp-facility-chip">${fac.icon} ${escapeHtml(fac.label)}</span>`;
        }).join('');
    } else {
        facSection.style.display = 'none';
    }

    // -- Instruksi Evakuasi ----------------------------------------------------
    const evacBox = document.getElementById('dp-evac-box');
    if (props.instruksi_evakuasi) {
        evacBox.style.display = 'block';
        document.getElementById('dp-evac-text').textContent = props.instruksi_evakuasi;
    } else {
        evacBox.style.display = 'none';
    }

    // -- Kontak Darurat --------------------------------------------------------
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

    // -- Sumber & Tanggal ------------------------------------------------------
    const sourceEl = document.getElementById('dp-source');
    const updEl    = document.getElementById('dp-updated');
    if (sourceEl) {
        sourceEl.style.display = 'block';
        if (updEl) updEl.textContent = props.last_updated || props.tanggal_update || 'â€”';
    }

    // -- Tombol aksi -----------------------------------------------------------
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

// -- Report Modal --------------------------------------------------------------
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

function renderStarRow(rating) {
    const r = Math.max(0, Math.min(5, rating));
    const full = Math.floor(r);
    const half = r - full >= 0.5 ? 1 : 0;
    let html = '<span class="dp-stars" aria-label="' + r.toFixed(1) + ' dari 5">';
    for (let i = 0; i < 5; i++) {
        if (i < full) html += '<span class="dp-star dp-star-full">&#9733;</span>';
        else if (i === full && half) html += '<span class="dp-star dp-star-half">&#9733;</span>';
        else html += '<span class="dp-star dp-star-empty">&#9734;</span>';
    }
    html += '</span>';
    return html;
}

function defaultHourlyCrowd(seed) {
    const out = [];
    let h = 0;
    for (let i = 0; i < 24; i++) {
        h = (h * 9301 + 49297 + seed.charCodeAt(i % seed.length)) % 233280;
        out.push(15 + (h % 70));
    }
    return out;
}

function nz(val, fallback) {
    if (val === undefined || val === null || val === '') return fallback;
    if (val === 0 || val === '0') return fallback;
    return val;
}

// -- Unified Dark Panel (vertical scroll, no tabs) ---------------------------
function openUnifiedPanel(feature, categoryKey) {
    const panel = document.getElementById('detail-panel');
    const vertical = document.getElementById('detail-vertical-body');
    if (!panel || !vertical) return;
    const props = feature.properties || {};
    const cat   = CATEGORIES[categoryKey] || {};
    const g     = feature.geometry;
    const isDisaster = categoryKey === 'kebencanaan';
    const isKabupatenRisk = isDisaster && props.kab_kota && props.jumlah_kejadian != null;
    const isPengungsian = !!(props.nama_lokasi || props.jenis_posko || props.type_layer === 'titik_pengungsian' || props.type === 'Tempat Pengungsian' || props.subcategory === 'Pengungsian' || props.subcategory === 'Titik Kumpul');

    const metaEl = document.getElementById('detail-meta-strip');
    if (metaEl) {
        metaEl.classList.remove('hidden');
        if (isDisaster) {
            const risk = isPengungsian ? (props.jenis_posko || 'Pengungsian') : (props.kelas_risiko || props.risiko || props.level_risiko || props.tingkat_risiko || 'â€”');
            const kec = props.kabupaten_kota || props.kab_kota || nz(props.kecamatan, 'Wilayah DIY');
            const zona = props.zona ? String(props.zona) : (props.kapanewon || '');
            metaEl.innerHTML = `
                <div class="detail-meta-row detail-meta-row--risk">
                    <span class="detail-meta-pill">${escapeHtml(String(risk))}</span>
                    <span class="detail-meta-text">${escapeHtml(zona ? `${zona} Â· ${kec}` : String(kec))}</span>
                </div>`;
        } else {
            const rating = Number(props.rating) || 4.2;
            const reviews = props.reviews_count ?? 286;
            const pengunjung = props.pengunjung ?? 2400;
            const jam = props.opening_hours || props.jam_buka || '08.00â€“18.00';
            const htm = props.htm || props.ticket_price || 'Rp 25.000';
            metaEl.innerHTML = `
                <div class="detail-meta-row detail-meta-row--tourism">
                    ${renderStarRow(rating)}
                    <span class="detail-meta-num">${rating.toFixed(1)}</span>
                    <span class="detail-meta-muted">(${Number(reviews).toLocaleString('id-ID')} ulasan)</span>
                </div>
                <div class="detail-meta-grid">
                    <div><span class="detail-meta-k">Pengunjung/hari</span><span class="detail-meta-v">Â±${Number(pengunjung).toLocaleString('id-ID')}</span></div>
                    <div><span class="detail-meta-k">Jam</span><span class="detail-meta-v">${escapeHtml(String(jam))}</span></div>
                    <div><span class="detail-meta-k">Tarif</span><span class="detail-meta-v">${escapeHtml(String(htm))}</span></div>
                </div>`;
        }
    }

    if (g && g.type === 'Point') {
        window._detailLatLng = [g.coordinates[1], g.coordinates[0]];
    } else if (g && g.type === 'Polygon') {
        const coords = g.coordinates[0];
        const avgLat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
        const avgLon = coords.reduce((s, c) => s + c[0], 0) / coords.length;
        window._detailLatLng = [avgLat, avgLon];
    }

    const imgEl = document.getElementById('detail-photo-img');
    const fallbackUnsplashId = {
        kebencanaan: 'photo-1588668214407-6ea9a6d8c272',
        pariwisata: 'photo-1584810359583-96fc3448beaa',
        wisata: 'photo-1584810359583-96fc3448beaa',
        mobilitas: 'photo-1570125909232-e0963dc1758e',
        lingkungan: 'photo-1448375240586-882707db888b',
        kesehatan_darurat: 'photo-1519494026892-80bbd2d6fd0d',
        kebutuhan: 'photo-1555529669-e69e7aa0ba9a',
        tempat_tinggal: 'photo-1566073771259-6a8506099945',
        atm_bank: 'photo-1563013544-824ae1b704d3',
        sosial_tugas: 'photo-1450101499163-a353f31ffcc4',
        akademik: 'photo-1523050854058-8df90110c9f1',
        default: 'photo-1555890725-11ccf6d9922a'
    };
    const pid = fallbackUnsplashId[categoryKey] || fallbackUnsplashId.default;
    const builtFallback = `https://images.unsplash.com/${pid}?auto=format&fit=crop&w=400&h=200&q=80`;
    imgEl.src = props.foto || builtFallback;
    imgEl.onerror = () => {
        imgEl.onerror = null;
        imgEl.src = `https://picsum.photos/seed/yogyakarta/400/200`;
    };

    const badge = document.getElementById('detail-cat-badge');
    const riskBadgeMap = { 'Sangat Tinggi':'badge-risiko-sangat-tinggi','Tinggi':'badge-risiko-tinggi','Sedang':'badge-risiko-sedang','Rendah':'badge-risiko-rendah' };
    const subcatText = props.subcategory || props.subkategori || props.type || props.jenis_bencana;
    const riskKey = props.kelas_risiko || props.risiko || props.level_risiko || '';
    badge.className = 'detail-category-badge ' + (riskBadgeMap[riskKey] || (categoryKey === 'kebencanaan' ? 'badge-risiko-sedang' : 'badge-wisata'));
    badge.textContent = sanitizeText(riskKey || subcatText || cat.label || categoryKey);

    document.getElementById('detail-name').textContent = sanitizeText(props.kab_kota || props.nama_lokasi || props.name || props.nama || 'â€”');

    const hist = Array.isArray(props.riwayat_bencana) ? props.riwayat_bencana : [];
    const lastH = hist.length ? hist[0] : null;

    function row(label, val) {
        return `<div class="dp-row"><span class="dp-label">${label}</span><span class="dp-val">${escapeHtml(String(val))}</span></div>`;
    }

    if (isDisaster) {
        let html = '';
        if (isKabupatenRisk) {
            const risk = props.kelas_risiko || 'â€”';
            const color = riskColor(risk);
            html += `<div class="dp-section">Ringkasan kabupaten/kota 2025</div>`;
            html += row('Wilayah', props.kab_kota);
            html += row('Tahun', props.tahun || 2025);
            html += row('Periode', props.periode || '1 Januari 2025 - 31 Desember 2025');
            html += row('Jumlah kejadian', Number(props.jumlah_kejadian || 0).toLocaleString('id-ID'));
            html += row('Kelas risiko', risk);
            html += `<div class="dp-section">Rincian jenis kejadian</div><div class="dp-chip-row">` +
                DISASTER_TYPE_KEYS.map((key) => `<span class="dp-chip">${escapeHtml(DISASTER_TYPE_LABELS[key])}: <strong>${Number(props[key] || 0).toLocaleString('id-ID')}</strong></span>`).join('') +
                `</div>`;
            html += `<div class="dp-section">Analisis</div>
                <p class="dp-desc">Data menunjukkan ${escapeHtml(props.kab_kota)} berada pada kelas risiko <strong style="color:${color}">${escapeHtml(risk)}</strong> berdasarkan jumlah kejadian kebencanaan tahun 2025.</p>`;
            html += row('Sumber data', props.sumber_data || 'BPBD DIY Infografis Tahunan 2025');
            html += `<div class="dp-section">Catatan</div><p class="dp-desc">${escapeHtml(props.catatan || 'Data menampilkan jumlah kejadian bencana yang tercatat oleh BPBD DIY, bukan jumlah korban jiwa maupun estimasi kerugian material. Tingkat risiko setiap wilayah ditentukan berdasarkan akumulasi total kejadian seluruh jenis bencana per kabupaten/kota selama periode Januari-Desember 2025.')}</p>`;
        } else if (isPengungsian) {
            html += `<div class="dp-section">Informasi posko pengungsian 2025</div>`;
            html += row('Nama lokasi', props.nama_lokasi || props.name || props.nama || 'Posko Pengungsian');
            html += row('Jenis posko', props.jenis_posko || props.type || 'Tempat Pengungsian');
            html += row('Fungsi', props.fungsi || 'Pusat evakuasi dan dukungan logistik');
            html += row('Kabupaten/Kota', props.kabupaten_kota || 'Daerah Istimewa Yogyakarta');
            html += row('Kapanewon', props.kapanewon || 'Tidak tercantum');
            html += row('Kalurahan', props.kalurahan || 'Tidak tercantum');
            html += row('Padukuhan', props.padukuhan || 'Tidak tercantum');
            html += row('Alamat', props.alamat_deskripsi || props.alamat || 'Tidak tercantum');
            html += `<div class="dp-section">Validasi data</div>`;
            html += row('Tingkat akurasi', props.tingkat_akurasi || 'Tercantum pada GeoJSON');
            html += row('Sumber informasi', props.sumber_informasi || props.sumber_data || 'Data posko pengungsian logistik DIY 2025');
            html += row('Tahun data', props.tahun_data || 2025);
            html += `<div class="dp-section">Catatan</div><p class="dp-desc">${escapeHtml(props.catatan || 'Data ditampilkan sesuai atribut pada GeoJSON posko pengungsian logistik DIY 2025.')}</p>`;
        } else {
            const luas = nz(props.luas_terdampak_km2, props.radius_km ? `Â±${Number(props.radius_km) * 12} kmÂ² (estimasi)` : 'Â±42 kmÂ² (estimasi wilayah)');
            const pop = nz(props.populasi_berisiko, 'Â±125.000 jiwa (estimasi populasi terpapar)');
            const korban = nz(props.korban_jiwa, lastH && lastH.korban_jiwa != null ? `${lastH.korban_jiwa} (riwayat terakhir)` : '0 (tidak ada korban jiwa pada skenario baseline)');
            const pengungsi = nz(props.pengungsi, lastH && lastH.pengungsi != null ? String(lastH.pengungsi) : 'â€”');
            const kerugian = nz(props.kerugian_material, lastH && lastH.kerugian_material ? lastH.kerugian_material : 'Data sedang dikonsolidasi');
            html += `<div class="dp-section">Ringkasan zona</div>`;
            html += row('Zona', props.name || props.nama || 'â€”');
            html += row('Jenis', nz(props.jenis_bencana, subcatText || 'â€”'));
            html += row('Tingkat risiko', nz(props.level_risiko, props.risiko || 'Sedang'));
            html += row('Luas terdampak', luas);
            html += row('Populasi berisiko', pop);
            if (props.deskripsi) {
                html += `<div class="dp-section">Deskripsi</div><p class="dp-desc">${escapeHtml(props.deskripsi)}</p>`;
            }
            html += `<div class="dp-section">Dampak &amp; data operasional</div>`;
            html += row('Korban jiwa (referensi)', korban);
            html += row('Pengungsi / terdampak', pengungsi);
            html += row('Kerugian material', kerugian);
            if (props.instruksi_evakuasi) {
                html += `<div class="dp-section">Instruksi evakuasi</div><p class="dp-desc">${escapeHtml(props.instruksi_evakuasi)}</p>`;
            }
            html += `<div class="dp-section">Fasilitas &amp; titik penting terdekat</div>
                <div class="dp-chip-row">
                    <span class="dp-chip">Titik kumpul Â±1,2 km</span>
                    <span class="dp-chip">Puskesmas Â±3 km</span>
                    <span class="dp-chip">Jalur evakuasi utama</span>
                    <span class="dp-chip">Distribusi logistik BPBD</span>
                </div>`;
            if (hist.length) {
                html += `<div class="dp-section">Riwayat kejadian</div>`;
                hist.slice(0, 4).forEach((h) => {
                    html += `<div class="dp-history-card"><strong>${escapeHtml(h.tanggal || '')}</strong> Â· ${escapeHtml(h.jenis || '')} ${escapeHtml(h.skala || '')}<br>${escapeHtml(h.deskripsi || '')}</div>`;
                });
            }
            html += `<div class="dp-section">Indeks aktivitas (24 jam)</div>
                <p class="dp-desc" style="font-size:11px;color:var(--text-muted)">Ilustrasi intensitas pemantauan lapangan.</p>
                <div class="dp-chart-wrap dp-chart-wrap--tall"><canvas id="detail-chart"></canvas></div>`;
        }
        vertical.innerHTML = html;
        requestAnimationFrame(() => {
            const canvas = document.getElementById('detail-chart');
            if (!canvas) return;
            const seed = String(props.name || props.nama || 'z');
            const crowd = defaultHourlyCrowd(seed);
            renderMiniBarChart(canvas, crowd);
        });
    } else {
        const infoRows = [
            ['Kategori', cat.label || categoryKey],
            subcatText ? ['Subkategori', subcatText] : null,
            (props.alamat || props.address) ? ['Alamat', props.alamat || props.address] : null,
            props.kecamatan ? ['Kecamatan', props.kecamatan] : null,
            props.operator ? ['Pengelola', props.operator] : null,
            ['Jam Operasional', props.opening_hours || props.jam_buka || '08.00â€“18.00'],
            ['Tiket / HTM', props.htm || props.ticket_price || 'Gratis'],
        ].filter(Boolean);
        let html = infoRows.map(([l, v]) => row(l, v)).join('');
        html += props.deskripsi ? `<div class="dp-section">Deskripsi</div><p class="dp-desc">${escapeHtml(props.deskripsi)}</p>` : '';
        html += `<div class="dp-section">Ringkasan</div>
            <p class="dp-desc">Lokasi dalam katalog Tata Kelola Jogja Siaga. Angka kunjungan bersifat estimasi bila belum ada sensus resmi.</p>`;
        const fasilList = props.fasilitas || props.amenity_list || ['Parkir', 'Toilet', 'Musholla', 'Area tunggu', 'WiFi'];
        const chips = (Array.isArray(fasilList) ? fasilList : String(fasilList).split(',')).map(s => String(s).trim()).filter(Boolean);
        html += `<div class="dp-section">Fasilitas</div><div class="dp-chip-row">` +
            chips.map((c) => `<span class="dp-chip">${escapeHtml(c)}</span>`).join('') + `</div>`;
        const crowd = props.hourly_crowd || defaultHourlyCrowd(String(props.name || props.nama || categoryKey));
        html += `<div class="dp-section">Keramaian per jam (00â€“23)</div>
            <p class="dp-desc" style="font-size:11px;margin-bottom:8px;color:var(--text-muted)">Hijau rendah Â· Kuning sedang Â· Oranye ramai Â· Merah sangat ramai</p>
            <div class="dp-chart-wrap dp-chart-wrap--tall"><canvas id="detail-chart"></canvas></div>`;
        vertical.innerHTML = html;
        requestAnimationFrame(() => {
            const canvas = document.getElementById('detail-chart');
            if (canvas) renderMiniBarChart(canvas, crowd);
        });
    }

    panel.classList.add('open');
    vertical.scrollTop = 0;
}

export function openDetailPanel(feature, categoryKey) {
    openUnifiedPanel(feature, categoryKey);
}
