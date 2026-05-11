import { State, CATEGORIES } from './state.js';
import { formatDistance, escapeHtml } from './utils/helpers.js';

export function initDetailPanel() {
    // We attach these to window so legacy onclicks in markers work
    window.showInfoCard = showInfoCard;
    window.closeInfoCard = closeInfoCard;
    window.showTourismPanel = showTourismPanel;
    window.closeTourismPanel = closeTourismPanel;
    window.renderMiniBarChart = renderMiniBarChart;
    window.buildHeatmap = buildHeatmap;
    window.renderDisasterSubTabs = renderDisasterSubTabs;
    window.showDisasterPanel = showDisasterPanel;
    window.closeDisasterPanel = closeDisasterPanel;
    window.renderRecentEvents = renderRecentEvents;
}
function showInfoCard(feature, categoryKey) {
    const card = document.getElementById('info-card');
    const cat = CATEGORIES[categoryKey];
    const props = feature.properties;
    const coords = feature.geometry.coordinates;

    document.getElementById('info-card-badge').style.background = `${cat.color}20`;
    document.getElementById('info-card-icon').textContent = cat.icon;
    document.getElementById('info-card-name').textContent = props.name || 'Unnamed';
    document.getElementById('info-card-type').textContent = props.type || cat.label;

    document.getElementById('info-category-text').textContent = cat.label;
    document.getElementById('info-category-text').style.color = cat.color;

    // Subcategory
    const scRow = document.getElementById('info-detail-subcategory');
    if (props.subcategory) {
        scRow.style.display = 'flex';
        document.getElementById('info-subcategory-text').textContent = props.subcategory;
    } else {
        scRow.style.display = 'none';
    }

    // Distance
    const center = map.getCenter();
    const g = feature.geometry;
    let cLat, cLon;
    if (g.type === 'Point') { cLon = g.coordinates[0]; cLat = g.coordinates[1]; }
    else if (g.type === 'Polygon') { const b = L.geoJSON(feature).getBounds().getCenter(); cLat = b.lat; cLon = b.lng; }
    else if (g.type === 'LineString') { const c = g.coordinates[Math.floor(g.coordinates.length/2)]; cLon = c[0]; cLat = c[1]; }
    else { cLon = 110.3695; cLat = -7.7956; }
    const dist = haversineDistance(center.lat, center.lng, coords[1], coords[0]);
    document.getElementById('info-distance-text').textContent = formatDistance(dist);

    // Hours
    const hoursRow = document.getElementById('info-detail-hours');
    if (props.opening_hours) { hoursRow.style.display = 'flex'; document.getElementById('info-hours-text').textContent = props.opening_hours; }
    else { hoursRow.style.display = 'none'; }

    // Operator
    const opRow = document.getElementById('info-detail-operator');
    if (props.operator) { opRow.style.display = 'flex'; document.getElementById('info-operator-text').textContent = props.operator; }
    else { opRow.style.display = 'none'; }

    // Buttons
    document.getElementById('info-btn-fly').onclick = () => {
        map.flyTo([coords[1], coords[0]], 17, { duration: 1.2 });
    };
    document.getElementById('info-btn-gmaps').onclick = () => {
        window.open(`https://www.google.com/maps?q=${coords[1]},${coords[0]}`, '_blank');
    };

    card.classList.remove('hidden');
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = '';
}

function closeInfoCard() {
    document.getElementById('info-card').classList.add('hidden');
}

// =====================================================
// SIDEBAR
function showTourismPanel(feature, categoryKey) {
    const panel = document.getElementById('tourism-panel');
    const props = feature.properties;
    const coords = feature.geometry.coordinates;
    const catKey = categoryKey || props.category || 'pariwisata';
    const cat = CATEGORIES[catKey] || CATEGORIES.pariwisata;

    closeInfoCard();

    // Header photo with dynamic category color fallback
    const header = document.getElementById('tp-header');
    if (props.foto) {
        header.style.backgroundImage = `url('${props.foto}')`;
    } else {
        header.style.backgroundImage = `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`;
    }

    // Category badge color
    const badgeEl = document.getElementById('tp-category-badge');
    badgeEl.textContent = props.subcategory || props.type || cat.label;
    badgeEl.style.background = `${cat.color}cc`;

    document.getElementById('tp-name').textContent = props.name || 'Unnamed';

    // Rating (hide row if no rating)
    const rating = props.rating || 0;
    const statsRow = document.querySelector('.tp-stats-row');
    if (rating > 0) {
        statsRow.style.display = 'flex';
        const starsEl = document.getElementById('tp-stars');
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) starsHtml += '<span class="star filled">★</span>';
            else if (i - 0.5 <= rating) starsHtml += '<span class="star half">★</span>';
            else starsHtml += '<span class="star">★</span>';
        }
        starsEl.innerHTML = starsHtml;
        document.getElementById('tp-rating').textContent = rating.toFixed(1);
        document.getElementById('tp-reviews').textContent = props.reviews ? `· ${props.reviews.toLocaleString()} ulasan` : '';
        document.getElementById('tp-visitors').textContent = props.visitors_per_day ? `~${props.visitors_per_day.toLocaleString()} / hari` : '';
    } else {
        statsRow.style.display = 'none';
    }

    // Hours & ticket (show/hide)
    const pillsRow = document.querySelector('.tp-info-pills');
    if (props.opening_hours || props.ticket_price) {
        pillsRow.style.display = 'flex';
        document.getElementById('tp-hours').textContent = props.opening_hours || '-';
        document.getElementById('tp-ticket').textContent = props.ticket_price || '-';
    } else {
        pillsRow.style.display = 'none';
    }

    // Crowd chart (only for pariwisata or data with hourly_crowd)
    const chartSection = document.querySelector('.tp-chart-section');
    const hourlyData = props.hourly_crowd;
    if (hourlyData && hourlyData.length === 24) {
        chartSection.style.display = 'block';
        const currentHour = new Date().getHours();
        const crowdLevel = hourlyData[currentHour] || 0;
        const badge = document.getElementById('tp-crowd-badge');
        if (crowdLevel >= 60) { badge.textContent = '🔴 Keramaian tinggi'; badge.className = 'tp-crowd-badge crowd-high'; }
        else if (crowdLevel >= 30) { badge.textContent = '🟡 Keramaian sedang'; badge.className = 'tp-crowd-badge crowd-medium'; }
        else { badge.textContent = '🟢 Keramaian rendah'; badge.className = 'tp-crowd-badge crowd-low'; }
    } else {
        chartSection.style.display = 'none';
    }

    // Facilities
    const facilitiesSection = document.querySelector('.tp-facilities-section');
    const facilities = props.facilities || [];
    if (facilities.length > 0) {
        facilitiesSection.style.display = 'flex';
        document.getElementById('tp-facilities').innerHTML = facilities.map(f => {
            const fac = FACILITY_MAP[f] || { icon: '📍', label: f };
            return `<div class="tp-facility-item"><span class="tp-facility-icon">${fac.icon}</span><span class="tp-facility-label">${fac.label}</span></div>`;
        }).join('');
    } else {
        facilitiesSection.style.display = 'none';
    }

    // Description
    const descEl = document.getElementById('tp-description');
    descEl.textContent = props.description || '';
    descEl.style.display = props.description ? 'block' : 'none';

    // Address
    const addrRow = document.getElementById('tp-address-row');
    if (props.address) {
        addrRow.style.display = 'flex';
        document.getElementById('tp-address').textContent = props.address;
    } else {
        addrRow.style.display = 'none';
    }

    // Tips
    const tipsRow = document.getElementById('tp-tips-row');
    if (props.tips) {
        tipsRow.style.display = 'block';
        document.getElementById('tp-tips').textContent = props.tips;
    } else {
        tipsRow.style.display = 'none';
    }

    // Action buttons
    document.getElementById('tp-btn-fly').onclick = () => map.flyTo([coords[1], coords[0]], 17, { duration: 1.2 });
    document.getElementById('tp-btn-gmaps').onclick = () => window.open(`https://www.google.com/maps?q=${coords[1]},${coords[0]}`, '_blank');

    // Button color
    const primaryBtn = document.getElementById('tp-btn-fly');
    primaryBtn.style.background = `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`;
    primaryBtn.style.boxShadow = `0 4px 15px ${cat.color}4d`;

    panel.classList.remove('hidden');
    panel.style.animation = 'none';
    panel.offsetHeight;
    panel.style.animation = '';

    // Render chart if visible
    if (hourlyData && hourlyData.length === 24) {
        requestAnimationFrame(() => {
            try { renderMiniBarChart(document.getElementById('tp-chart'), hourlyData); }
            catch (e) { console.warn('Chart render error:', e); }
        });
    }
}

function closeTourismPanel() {
    document.getElementById('tourism-panel').classList.add('hidden');
}

function renderMiniBarChart(canvas, data) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const max = Math.max(...data, 1);
    const barW = (w - 2) / 24;
    const gap = 1;
    const currentHour = new Date().getHours();

    for (let i = 0; i < 24; i++) {
        const val = data[i] / max;
        const barH = val * (h - 8);
        const x = i * barW + 1;
        const y = h - barH - 2;

        // Color based on value
        let color;
        if (data[i] >= 60) color = '#ef4444';
        else if (data[i] >= 30) color = '#f59e0b';
        else color = '#10b981';

        // Highlight current hour
        if (i === currentHour) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
        }

        ctx.fillStyle = i === currentHour ? '#ffffff' : color;
        ctx.fillRect(x, y, barW - gap, Math.max(barH, 1));
        ctx.shadowBlur = 0;
    }
}

// =====================================================
// HEATMAP
// =====================================================
function buildHeatmap() {
    if (!categoryData.pariwisata) return;
    const heatPoints = categoryData.pariwisata.features.map(f => {
        const coords = f.geometry.coordinates;
        const intensity = (f.properties.visitors_per_day || 1000) / 5000;
        return [coords[1], coords[0], Math.min(intensity, 1)];
    });
    heatmapLayer = L.heatLayer(heatPoints, {
        radius: 35, blur: 25, maxZoom: 15,
        gradient: { 0.2: '#06b6d4', 0.4: '#10b981', 0.6: '#f59e0b', 0.8: '#ef4444', 1.0: '#e11d48' }
    });
}

// =====================================================
// UTILITIES
function renderDisasterSubTabs() {
    const container = document.getElementById('disaster-sub-tabs');
    const subcats = categoryMeta.kebencanaan ? Object.keys(categoryMeta.kebencanaan.subcategories || {}) : [];
    const tabs = [{ key: 'all', label: 'Semua' }, ...subcats.map(s => ({ key: s, label: s.replace('Risiko ','').replace('Rawan ','') }))];
    container.innerHTML = tabs.map(t =>
        `<button class="dst-tab ${t.key === activeDisasterSubTab ? 'active' : ''}" data-subtab="${t.key}">${t.label}</button>`
    ).join('');
    container.querySelectorAll('.dst-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            activeDisasterSubTab = btn.dataset.subtab;
            container.querySelectorAll('.dst-tab').forEach(b => b.classList.toggle('active', b === btn));
            rebuildCategoryLayer('kebencanaan');
        });
    });
}

// =====================================================
// DISASTER DETAIL PANEL
// =====================================================
function getFeatureCenter(feature) {
    const g = feature.geometry;
    if (g.type === 'Point') return [g.coordinates[1], g.coordinates[0]];
    if (g.type === 'Polygon') { const b = L.geoJSON(feature).getBounds().getCenter(); return [b.lat, b.lng]; }
    if (g.type === 'LineString') { const c = g.coordinates[Math.floor(g.coordinates.length / 2)]; return [c[1], c[0]]; }
    return [-7.7956, 110.3695];
}

function showDisasterPanel(feature, categoryKey) {
    const panel = document.getElementById('disaster-panel');
    const props = feature.properties;
    closeTourismPanel();
    closeInfoCard();
    currentReportFeature = { feature, categoryKey };

    // Header photo
    const header = document.getElementById('dp-header');
    header.style.backgroundImage = props.foto ? `url('${props.foto}')` : `linear-gradient(135deg, #dc2626, #991b1b)`;

    // Risk badge
    const badgeEl = document.getElementById('dp-risk-badge');
    const lr = props.level_risiko || 'Info';
    const zona = props.zona ? ` · ${props.zona}` : '';
    const riskClass = lr === 'Tinggi' ? 'risk-high' : lr === 'Sedang' ? 'risk-medium' : lr === 'Rendah' ? 'risk-low' : 'risk-info';
    badgeEl.className = `dp-risk-badge ${riskClass}`;
    badgeEl.textContent = `${lr === 'Tinggi' ? '🔴' : lr === 'Sedang' ? '🟠' : lr === 'Rendah' ? '🟡' : 'ℹ️'} RISIKO ${lr.toUpperCase()}${zona}`;

    document.getElementById('dp-name').textContent = props.name || 'Unnamed';

    // Meta line
    const metaItems = [];
    if (props.radius_km) metaItems.push(`📍 Radius 0–${props.radius_km} km dari puncak`);
    if (props.sumber_data) metaItems.push(`📊 Sumber: ${props.sumber_data}`);
    if (props.last_updated) metaItems.push(`Diperbarui: ${props.last_updated}`);
    document.getElementById('dp-meta').innerHTML = metaItems.join(' · ');

    document.getElementById('dp-description').textContent = props.deskripsi || '';

    // Facilities
    const facSection = document.getElementById('dp-facilities-section');
    const facilities = props.facilities || [];
    if (facilities.length > 0) {
        facSection.style.display = 'block';
        document.getElementById('dp-facilities').innerHTML = facilities.map(f =>
            `<span class="dp-facility-chip">${f}</span>`
        ).join('');
    } else { facSection.style.display = 'none'; }

    // Evacuation
    const evacBox = document.getElementById('dp-evac-box');
    if (props.instruksi_evakuasi) {
        evacBox.style.display = 'block';
        document.getElementById('dp-evac-text').textContent = props.instruksi_evakuasi;
    } else { evacBox.style.display = 'none'; }

    // History
    const histSection = document.getElementById('dp-history-section');
    const history = props.riwayat_bencana || [];
    if (history.length > 0) {
        histSection.style.display = 'block';
        document.getElementById('dp-history-list').innerHTML = history.slice(0, 3).map(h => `
            <div class="dp-history-item">
                <div class="dp-history-date">🗓️ ${h.tanggal}</div>
                <div class="dp-history-detail">${h.jenis} ${h.skala} · ${h.korban_jiwa} korban jiwa</div>
                <div class="dp-history-sub">${(h.pengungsi||0).toLocaleString()} pengungsi · ${h.kerugian_material || '-'}</div>
            </div>
        `).join('');
    } else { histSection.style.display = 'none'; }

    // Contact
    const contactEl = document.getElementById('dp-contact');
    if (props.kontak_darurat) {
        contactEl.style.display = 'flex';
        const phone = props.kontak_darurat.replace(/[^+\d]/g, '').slice(0, 16);
        document.getElementById('dp-contact-phone').textContent = props.kontak_darurat;
        document.getElementById('dp-contact-phone').href = `tel:${phone}`;
    } else { contactEl.style.display = 'none'; }

    // Actions
    const center = getFeatureCenter(feature);
    document.getElementById('dp-btn-gmaps').onclick = () => window.open(`https://www.google.com/maps?q=${center[0]},${center[1]}`, '_blank');
    document.getElementById('dp-btn-report').onclick = () => {
        const lapTab = document.querySelector('.top-nav-tab[data-page="laporan"]');
        if (lapTab) lapTab.click();
    };

    panel.classList.remove('hidden');
}

function closeDisasterPanel() {
    document.getElementById('disaster-panel').classList.add('hidden');
}



// =====================================================
// RECENT EVENTS WIDGET
// =====================================================
function renderRecentEvents() {
    const widget = document.getElementById('recent-events-widget');
    const list = document.getElementById('rew-list');
    const events = [
        { icon: '🌋', title: 'Aktivitas Merapi', status: 'Siaga (Level III)', statusClass: 'status-danger', time: '3 jam lalu' },
        { icon: '🌧️', title: 'Banjir Bantul', status: 'Waspada', statusClass: 'status-warning', time: '2 hari lalu' },
        { icon: '🌿', title: 'Kualitas Udara Kota', status: 'Sedang (AQI 65)', statusClass: 'status-moderate', time: '1 jam lalu' },
    ];
    list.innerHTML = events.map(e => `
        <div class="rew-item">
            <span class="rew-icon">${e.icon}</span>
            <div class="rew-info">
                <div class="rew-event-title">${e.title} <span class="rew-status ${e.statusClass}">→ ${e.status}</span></div>
                <div class="rew-time">Terakhir: ${e.time}</div>
            </div>
        </div>
    `).join('');
    widget.style.display = 'none'; // shown only when disaster category active
}

// =====================================================
// INIT
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initSidebar();
    initSearch();
    initWelcome();
    loadAllData();
    // Report modal ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeReportModal();
    });
});
}

// =====================================================
// SPA ROUTING & RENDERING
