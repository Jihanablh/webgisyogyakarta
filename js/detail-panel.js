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
        if (category === 'kebencanaan') {
            showDisasterPanel(feature, category);
        } else {
            showTourismPanel(feature, category);
        }
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
function showDisasterPanel(feature, categoryKey) {
    const panel = document.getElementById('disaster-panel');
    if (!panel) return;
    const props = feature.properties;
    closeTourismPanel();
    closeInfoCard();
    State.currentReportFeature = { feature, categoryKey };

    const header = document.getElementById('dp-header');
    header.style.backgroundImage = props.foto
        ? `url('${props.foto}')`
        : 'linear-gradient(135deg, #dc2626, #991b1b)';

    const badgeEl = document.getElementById('dp-risk-badge');
    const lr = props.level_risiko || 'Info';
    const zona = props.zona ? ` · ${props.zona}` : '';
    const riskClass = lr === 'Tinggi' ? 'risk-high' : lr === 'Sedang' ? 'risk-medium' : lr === 'Rendah' ? 'risk-low' : 'risk-info';
    badgeEl.className = `dp-risk-badge ${riskClass}`;
    badgeEl.textContent = `${lr === 'Tinggi' ? '🔴' : lr === 'Sedang' ? '🟠' : lr === 'Rendah' ? '🟡' : 'ℹ️'} RISIKO ${lr.toUpperCase()}${zona}`;

    document.getElementById('dp-name').textContent = props.name || 'Unnamed';

    const metaItems = [];
    if (props.radius_km)    metaItems.push(`📍 Radius 0–${props.radius_km} km dari puncak`);
    if (props.sumber_data)  metaItems.push(`📊 Sumber: ${props.sumber_data}`);
    if (props.last_updated) metaItems.push(`Diperbarui: ${props.last_updated}`);
    document.getElementById('dp-meta').innerHTML = metaItems.join(' · ');

    document.getElementById('dp-description').textContent = props.deskripsi || '';

    const facSection = document.getElementById('dp-facilities-section');
    const facilities = props.facilities || [];
    if (facilities.length > 0) {
        facSection.style.display = 'block';
        document.getElementById('dp-facilities').innerHTML = facilities.map(f => `<span class="dp-facility-chip">${escapeHtml(f)}</span>`).join('');
    } else { facSection.style.display = 'none'; }

    const evacBox = document.getElementById('dp-evac-box');
    if (props.instruksi_evakuasi) { evacBox.style.display = 'block'; document.getElementById('dp-evac-text').textContent = props.instruksi_evakuasi; }
    else { evacBox.style.display = 'none'; }

    const histSection = document.getElementById('dp-history-section');
    const history = props.riwayat_bencana || [];
    if (history.length > 0) {
        histSection.style.display = 'block';
        document.getElementById('dp-history-list').innerHTML = history.slice(0, 3).map(h => `
            <div class="dp-history-item">
                <div class="dp-history-date">🗓️ ${h.tanggal}</div>
                <div class="dp-history-detail">${escapeHtml(h.jenis)} ${h.skala} · ${h.korban_jiwa} korban jiwa</div>
                <div class="dp-history-sub">${(h.pengungsi || 0).toLocaleString()} pengungsi · ${h.kerugian_material || '-'}</div>
            </div>`).join('');
    } else { histSection.style.display = 'none'; }

    const contactEl = document.getElementById('dp-contact');
    if (props.kontak_darurat) {
        contactEl.style.display = 'flex';
        const phone = props.kontak_darurat.replace(/[^\d+]/g, '').slice(0, 16);
        document.getElementById('dp-contact-phone').textContent = props.kontak_darurat;
        document.getElementById('dp-contact-phone').href = `tel:${phone}`;
    } else { contactEl.style.display = 'none'; }

    // Detect center for gmaps
    const g = feature.geometry;
    let cLat = -7.7956, cLon = 110.3695;
    if (g.type === 'Point') { cLon = g.coordinates[0]; cLat = g.coordinates[1]; }

    document.getElementById('dp-btn-gmaps').onclick = () => window.open(`https://www.google.com/maps?q=${cLat},${cLon}`, '_blank');
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