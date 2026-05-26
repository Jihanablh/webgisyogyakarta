import { State, CATEGORIES } from './state.js?v=20260526-round26-welcome-encoding';
import { createMarker } from './markers.js?v=20260526-round26-welcome-encoding';
import { loadLargeGeoJSON } from './utils/loader.js?v=20260526-round26-welcome-encoding';
import {
    DISASTER_2025_PERIOD,
    DISASTER_2025_TOTAL,
    DISASTER_2025_ANALYSIS_NOTE,
    DISASTER_TYPE_KEYS,
    DISASTER_TYPE_LABELS,
    disasterTypeTotals,
    dominantDisasterType,
    highestRegion,
    lowestRegion,
    riskColor,
    shortRegionName
} from './disaster-2025.js?v=20260526-round26-welcome-encoding';

// -- Internal kebencanaan layers ------------------------------------------------
let _kebHeatLayer    = null;  // L.heatLayer for zona bencana
let _kebLineLayer    = null;  // L.featureGroup for jalur evakuasi lines
let _kebMarkerLayer  = null;  // L.featureGroup for titik pengungsian / titik kumpul
let _kabRiskLayer    = null;  // Kabupaten/kota 2025 risk polygons
let _boundaryLayer   = null;  // DIY boundary GeoJSON
let _kebZonaVisible = true;
let _kebLineVisible = false;
let _kebPengungsianVisible = true;
let _selectedKabLayer = null;

function cleanText(v) {
    return String(v ?? '')
        .replace(/\u00C3\u0082\u00C2\u00B7|\u00C2\u00B7/g, ' - ')
        .replace(/\u00C3\u0082\u00C2\u00B0|\u00C2\u00B0/g, ' derajat ')
        .replace(/\u00C3\u0082\u00C2\u00B1|\u00C2\u00B1/g, '+/-')
        .replace(/\u00C3\u0097/g, 'x')
        .replace(/\u00E2\u20AC\u201D/g, '-')
        .replace(/\u00E2\u20AC\u201C/g, '-')
        .replace(/\u00E2\u20AC\u2122/g, "'")
        .replace(/\u00E2\u20AC\u0153|\u00E2\u20AC\u009D/g, '"')
        .replace(/\u00E2\u20AC\u00A6/g, '...')
        .replace(/\u00E2\u2020\u2019/g, '->')
        .replace(/\u00E2\u20AC\u00A2/g, '-')
        .replace(/\u00E2\u02DC\u2026/g, '*')
        .replace(/\u00E2\u02DC\u00BE/g, '')
        .replace(/\u00E2\u02DC\u20AC/g, '');
}
function esc(v) {
    return cleanText(v)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function isSuppressedFeature(feature) {
    const p = feature?.properties || {};
    const hay = `${p.name || ''} ${p.nama || ''} ${p.subcategory || ''} ${p.type || ''} ${p.type_layer || ''}`;
    const blocked = ['me' + 'rapi', 'eru' + 'psi', 'k' + 'rb'];
    return blocked.some((term) => new RegExp(term, 'i').test(hay));
}
function bindFeatureTooltip(layer, feature) {
    const props = feature.properties || {};
    const title = props.kab_kota || props.name || props.nama || props.nama_lokasi || 'Lokasi';
    const meta = props.jumlah_kejadian != null
        ? `${Number(props.jumlah_kejadian).toLocaleString('id-ID')} kejadian - ${props.kelas_risiko}`
        : props.kapasitas
        ? `Kapasitas ${Number(props.kapasitas).toLocaleString()} jiwa`
        : (props.jenis_posko || props.fungsi || props.subcategory || props.type || props.level_risiko || 'Informasi lokasi');
    layer.bindTooltip(
        `<strong>${esc(title)}</strong><br><span>${esc(meta)}</span>`,
        { direction: 'top', offset: [0, -18], opacity: 1, className: 'map-marker-tooltip' }
    );
}

function genericPopupHtml(feature, category) {
    const props = feature.properties || {};
    const cat = CATEGORIES[category] || {};
    const title = props.name || props.nama || props.nama_lokasi || props.kab_kota || 'Informasi lokasi';
    const rows = [
        ['Kategori', cat.label || props.category || category],
        ['Subkategori', props.subcategory || props.type || props.jenis_posko],
        ['Alamat', props.alamat || props.address || props.alamat_deskripsi],
        ['Rating', props.rating],
        ['Sumber', props.sumber_data || props.sumber || props.sumber_informasi],
        ['Keterangan', props.keterangan || props.catatan]
    ].filter(([, value]) => value !== undefined && value !== null && value !== '');
    return `
        <div class="tw-min-w-[220px] tw-max-w-[300px] tw-rounded-xl tw-border tw-border-amber-500/20 tw-bg-slate-950 tw-p-3 tw-text-slate-100">
            <div class="tw-text-[10px] tw-font-bold tw-uppercase tw-tracking-[0.16em] tw-text-amber-300">${esc(cat.label || 'JOGJA SIAGA')}</div>
            <div class="tw-mt-1 tw-font-display tw-text-base tw-font-bold tw-text-slate-100">${esc(title)}</div>
            <div class="tw-mt-2 tw-space-y-1.5">
                ${rows.map(([label, value]) => `
                    <div class="tw-grid tw-grid-cols-[78px_1fr] tw-gap-2 tw-text-[11px] tw-leading-snug">
                        <span class="tw-text-slate-500">${esc(label)}</span>
                        <strong class="tw-font-medium tw-text-slate-200">${esc(value)}</strong>
                    </div>`).join('')}
            </div>
        </div>`;
}

function normalizePengungsianFeature(feature) {
    const props = feature.properties || {};
    return {
        ...feature,
        properties: {
            ...props,
            name: props.nama_lokasi || props.name || 'Posko Pengungsian',
            nama: props.nama_lokasi || props.nama,
            alamat: props.alamat_deskripsi || props.alamat,
            type: props.jenis_posko || props.type || 'Tempat Pengungsian',
            subcategory: 'Pengungsian',
            type_layer: 'titik_pengungsian'
        }
    };
}

function riskStyle(risk, mode = 'default') {
    const base = {
        Rendah: { color: '#38bdf8', fillColor: '#0f766e', fillOpacity: 0.42, weight: 1.4 },
        Sedang: { color: '#facc15', fillColor: '#ca8a04', fillOpacity: 0.45, weight: 1.5 },
        Tinggi: { color: '#fb7185', fillColor: '#b91c1c', fillOpacity: 0.48, weight: 1.7 },
        'Sangat Tinggi': { color: '#fca5a5', fillColor: '#7f1d1d', fillOpacity: 0.55, weight: 1.9 }
    }[risk] || { color: '#e2e8f0', fillColor: '#64748b', fillOpacity: 0.26, weight: 1.3 };

    if (mode === 'hover') {
        return { ...base, color: '#f8fafc', fillOpacity: Math.min(base.fillOpacity + 0.14, 0.72), weight: base.weight + 1.1, className: 'kab-risk-polygon kab-risk-polygon--hover' };
    }
    if (mode === 'selected') {
        return { ...base, color: '#67e8f9', fillOpacity: Math.min(base.fillOpacity + 0.18, 0.76), weight: base.weight + 1.7, className: 'kab-risk-polygon kab-risk-polygon--selected' };
    }
    return { ...base, opacity: 0.9, className: `kab-risk-polygon ${risk === 'Sangat Tinggi' || risk === 'Tinggi' ? 'kab-risk-polygon--hot' : ''}` };
}

function resetKabRiskPanel() {
    if (_selectedKabLayer) {
        const oldProps = _selectedKabLayer.feature?.properties || {};
        _selectedKabLayer.setStyle(riskStyle(oldProps.kelas_risiko));
        _selectedKabLayer = null;
    }
    setLeftPanelDetailMode(false);
    renderKabRiskPanel();
}

function setLeftPanelDetailMode(isDetail) {
    const searchBox = document.querySelector('#search-input')?.closest('.tw-px-4');
    searchBox?.classList.toggle('hidden', !!isDetail);
    document.getElementById('kab-risk-info-panel')?.classList.toggle('is-detail-mode', !!isDetail);
    document.getElementById('detail-panel')?.classList.remove('open');
}

export function showPengungsianInLeftPanel(feature) {
    const props = { ...(feature?.properties || feature || {}) };
    if (feature?.geometry?.type === 'Point') {
        props.__lat = feature.geometry.coordinates?.[1];
        props.__lng = feature.geometry.coordinates?.[0];
    }
    renderKabRiskPanel(props, true);
}

if (typeof window !== 'undefined') {
    window.showPengungsianInLeftPanel = showPengungsianInLeftPanel;
    window.resetKabRiskPanel = resetKabRiskPanel;
}

function renderKabRiskPanel(props = null, pinned = false) {
    const panel = document.getElementById('kab-risk-info-panel');
    if (!panel) return;
    panel.classList.remove('hidden');
    const typeTotals = disasterTypeTotals();
    const high = highestRegion();
    const low = lowestRegion();
    const dominant = dominantDisasterType();
    const kabPhoto = {
        'Kabupaten Kulon Progo': 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=800&q=85',
        'Kabupaten Bantul': 'https://images.unsplash.com/photo-1592364395653-83e648b20cc2?w=800&q=85',
        'Kabupaten Sleman': 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&q=85',
        'Kabupaten Gunungkidul': 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=85',
        'Kota Yogyakarta': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=85'
    };
    const summaryPhoto = 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=85';
    const riskBadgeClass = (risk) => ({
        'Sangat Tinggi': 'tw-border-red-700/50 tw-bg-red-900/50 tw-text-red-400',
        Tinggi: 'tw-border-orange-700/50 tw-bg-orange-900/50 tw-text-orange-400',
        Sedang: 'tw-border-yellow-700/50 tw-bg-yellow-900/50 tw-text-yellow-400',
        Rendah: 'tw-border-teal-700/50 tw-bg-teal-900/50 tw-text-teal-400'
    }[risk] || 'tw-border-slate-600/50 tw-bg-slate-800/70 tw-text-slate-300');
    const panelShell = (photo, badge, title, subtitle, typeBadge, body, back = false) => `
        <div class="tw-relative tw-h-[180px] tw-w-full tw-overflow-hidden">
            ${back ? '<button type="button" id="kab-risk-back-btn" class="tw-absolute tw-right-3 tw-top-3 tw-z-20 tw-rounded-full tw-bg-slate-700/80 tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-slate-200 tw-transition-all hover:tw-bg-slate-600">Kembali</button>' : ''}
            <img src="${esc(photo)}" alt="${esc(title)}" class="tw-h-[180px] tw-w-full tw-object-cover tw-object-center" loading="lazy" onerror="this.onerror=null;this.src='https://picsum.photos/seed/yogyakarta-fallback/900/520';">
            <div class="tw-absolute tw-inset-0 tw-bg-gradient-to-t tw-from-slate-950 tw-via-slate-950/45 tw-to-transparent"></div>
            <div class="tw-absolute tw-bottom-5 tw-left-6 tw-right-6">
                <span class="tw-inline-flex tw-rounded-full tw-border tw-border-amber-500/50 tw-bg-amber-500/20 tw-px-3 tw-py-1 tw-text-xs tw-font-bold tw-uppercase tw-tracking-widest tw-text-amber-400">${esc(badge)}</span>
            </div>
        </div>
        <div class="tw-px-6 tw-pb-6 tw-pt-4">
            <h2 class="tw-font-display tw-text-xl tw-font-bold tw-leading-tight tw-text-white">${esc(title)}</h2>
            <div class="tw-mt-4 tw-inline-flex tw-rounded-full tw-border tw-border-amber-500/30 tw-bg-slate-900/60 tw-px-4 tw-py-1.5 tw-text-xs tw-font-bold tw-uppercase tw-tracking-widest tw-text-amber-400">${esc(typeBadge)}</div>
            <p class="tw-mt-4 tw-text-sm tw-leading-relaxed tw-text-slate-400">${esc(subtitle)}</p>
            ${body}
        </div>`;
    const dataRow = (label, value) => `
        <div class="tw-flex tw-items-start tw-gap-4 tw-border-b tw-border-slate-700/40 tw-py-2.5">
            <span class="tw-w-2/5 tw-flex-shrink-0 tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-slate-500">${esc(label)}</span>
            <strong class="tw-flex-1 tw-text-right tw-text-sm tw-font-medium tw-leading-snug tw-text-slate-100">${esc(value)}</strong>
        </div>`;
    const statCard = (label, value, color = 'tw-text-amber-400') => `
        <div class="tw-rounded-xl tw-border tw-border-slate-700/30 tw-bg-slate-800/50 tw-p-3 tw-text-center">
            <strong class="tw-block tw-font-mono tw-text-lg tw-font-bold ${color}">${esc(value)}</strong>
            <span class="tw-mt-1 tw-block tw-text-xs tw-font-semibold tw-uppercase tw-text-slate-500">${esc(label)}</span>
        </div>`;
    const regionStatCard = (label, name, value) => `
        <div class="tw-rounded-xl tw-border tw-border-slate-700/30 tw-bg-slate-800/50 tw-p-3">
            <span class="tw-block tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wide tw-text-slate-500">${esc(label)}</span>
            <strong class="tw-mt-1 tw-block tw-text-sm tw-font-semibold tw-leading-snug tw-text-slate-100">${esc(name)}</strong>
            <span class="tw-mt-1 tw-block tw-font-mono tw-text-base tw-font-bold tw-text-amber-400">${Number(value || 0).toLocaleString('id-ID')} kejadian</span>
        </div>`;
    const progressRows = (entries, maxValue) => `
        <div class="tw-mt-4 tw-space-y-3">
            ${entries.map(([label, value]) => {
                const pct = maxValue ? Math.max(3, Math.round((Number(value || 0) / maxValue) * 100)) : 0;
                return `
                    <div class="tw-flex tw-items-center tw-gap-3">
                        <span class="tw-w-28 tw-flex-shrink-0 tw-text-xs tw-font-medium tw-text-slate-400">${esc(label)}</span>
                        <div class="tw-h-1.5 tw-w-full tw-overflow-hidden tw-rounded-full tw-bg-slate-700/50">
                            <div class="tw-h-1.5 tw-rounded-full tw-bg-amber-500" style="width:${pct}%"></div>
                        </div>
                        <span class="tw-w-8 tw-flex-shrink-0 tw-text-right tw-font-mono tw-text-xs tw-text-amber-400">${Number(value || 0).toLocaleString('id-ID')}</span>
                    </div>`;
            }).join('')}
        </div>`;
    const wire = () => {
        panel.querySelector('#kab-risk-stat-btn')?.addEventListener('click', (event) => {
            const action = event.currentTarget?.dataset?.action;
            if (action === 'gmaps') {
                const lat = Number(panel.dataset.lat);
                const lng = Number(panel.dataset.lng);
                if (Number.isFinite(lat) && Number.isFinite(lng)) window.open(`https://maps.google.com?q=${lat},${lng}`, '_blank');
                return;
            }
            window.appRouter?.navigate ? window.appRouter.navigate('statistik') : document.querySelector('.top-nav-tab[data-page="statistik"]')?.click();
        });
        panel.querySelector('#kab-risk-report-btn')?.addEventListener('click', (event) => {
            const action = event.currentTarget?.dataset?.action;
            if (action === 'fly') {
                const lat = Number(panel.dataset.lat);
                const lng = Number(panel.dataset.lng);
                if (Number.isFinite(lat) && Number.isFinite(lng) && State.map) State.map.flyTo([lat, lng], 15, { duration: 0.8 });
                return;
            }
            window.appRouter?.navigate ? window.appRouter.navigate('laporan') : document.querySelector('.top-nav-tab[data-page="laporan"]')?.click();
        });
        panel.querySelector('#kab-risk-back-btn')?.addEventListener('click', resetKabRiskPanel);
    };
    const setPanelContent = (html) => {
        panel.classList.add('tw-opacity-0');
        window.setTimeout(() => {
            panel.innerHTML = html;
            panel.classList.remove('tw-opacity-0');
            panel.classList.add('tw-opacity-100');
            wire();
        }, 90);
    };
    const riskBadgeCss = (risk) => ({
        'Sangat Tinggi': 'badge-risiko-sangat-tinggi',
        Tinggi: 'badge-risiko-tinggi',
        Sedang: 'badge-risiko-sedang',
        Rendah: 'badge-risiko-rendah'
    }[String(risk || '').replace(/^Risiko\s+/i, '')] || 'badge-generic');
    const detailRow = (label, value) => `
        <div class="dp-row">
            <span class="dp-label">${esc(label)}</span>
            <span class="dp-val">${esc(value)}</span>
        </div>`;
    const detailPanelShell = ({ photo, badge, title, risk, subtitle, body, primaryText = 'Lihat Laporan Bencana', secondaryText = 'Buka di Statistika', primaryAction = 'report', secondaryAction = 'statistik' }) => `
        <button class="dp-close-btn" id="kab-risk-back-btn">Kembali</button>
        <div class="detail-photo">
            <img src="${esc(photo)}" alt="${esc(title)}" onerror="this.onerror=null;this.src='https://picsum.photos/seed/yogyakarta/800/600'">
            <div class="detail-photo-overlay">
                <span class="detail-category-badge badge-generic">${esc(badge)}</span>
                <h2 class="detail-name">${esc(title)}</h2>
            </div>
        </div>
        <div class="detail-meta-strip">
            <div class="detail-meta-row detail-meta-row--risk">
                <span class="detail-meta-pill ${riskBadgeCss(risk)}">${esc(risk)}</span>
                <span class="detail-meta-text">${esc(subtitle)}</span>
            </div>
        </div>
        <div class="detail-content detail-content--vertical">
            <div class="detail-vertical-body">
                ${body}
            </div>
        </div>
        <div class="detail-actions">
            <button type="button" id="kab-risk-report-btn" data-action="${esc(primaryAction)}" class="tw-flex-1 tw-rounded-[var(--radius-md)] tw-border-0 tw-bg-[var(--accent-gold)] tw-px-3 tw-py-3 tw-font-ui tw-text-xs tw-font-bold tw-tracking-wide tw-text-slate-950 tw-transition-all hover:tw-bg-[#e8c97a]">${esc(primaryText)}</button>
            <button type="button" id="kab-risk-stat-btn" data-action="${esc(secondaryAction)}" class="tw-flex-1 tw-rounded-[var(--radius-md)] tw-border tw-border-[var(--border-glass)] tw-bg-transparent tw-px-3 tw-py-3 tw-font-ui tw-text-xs tw-font-bold tw-tracking-wide tw-text-[var(--text-secondary)] tw-transition-all hover:tw-border-amber-400 hover:tw-text-amber-400">${esc(secondaryText)}</button>
        </div>`;

    if (!props) {
        delete panel.dataset.lat;
        delete panel.dataset.lng;
        setLeftPanelDetailMode(false);
        const typeEntries = DISASTER_TYPE_KEYS.map((key) => [DISASTER_TYPE_LABELS[key], Number(typeTotals[key] || 0)]);
        const body = `
            <div class="tw-mt-4 tw-grid tw-grid-cols-2 tw-gap-3">
                ${statCard('Total Kejadian', `${DISASTER_2025_TOTAL.toLocaleString('id-ID')}`, 'tw-text-amber-400')}
                ${statCard('Wilayah Berisiko', 'Kulon Progo', 'tw-text-red-400')}
                ${statCard('Wilayah Aman', 'Sleman', 'tw-text-teal-400')}
                ${statCard('Bencana Dominan', 'Longsor', 'tw-text-orange-400')}
            </div>
            <div class="tw-mt-4 tw-text-xs tw-font-bold tw-uppercase tw-tracking-widest tw-text-amber-400">Breakdown Jenis Bencana</div>
            ${progressRows(typeEntries, Math.max(...typeEntries.map(([, value]) => Number(value || 0)), 1))}
            ${dataRow('Periode', DISASTER_2025_PERIOD)}
            <p class="tw-mt-5 tw-font-serif tw-text-sm tw-leading-relaxed tw-text-slate-400">${esc(DISASTER_2025_ANALYSIS_NOTE)}</p>
            <div class="tw-mt-5 tw-grid tw-w-full tw-grid-cols-1 tw-gap-2">
                <button type="button" id="kab-risk-stat-btn" class="tw-w-full tw-rounded-xl tw-bg-amber-500 tw-py-2.5 tw-text-sm tw-font-bold tw-text-slate-900 tw-transition-all hover:tw-bg-amber-400 active:tw-scale-95">Buka Dashboard Statistika</button>
                <button type="button" id="kab-risk-report-btn" class="tw-w-full tw-rounded-xl tw-border tw-border-slate-600/70 tw-bg-transparent tw-py-2.5 tw-text-sm tw-font-bold tw-text-slate-300 tw-transition-all hover:tw-bg-slate-800/60 active:tw-scale-95">Lihat Laporan Bencana</button>
            </div>`;
        setPanelContent(panelShell(summaryPhoto, 'Kebencanaan DIY', 'Peta Risiko Kejadian Bencana DIY 2025', 'Analisis jumlah kejadian kebencanaan kabupaten/kota.', 'Akumulasi Kejadian Bencana 2025', body));
        return;
    }

    setLeftPanelDetailMode(true);

    const isPengungsianProps = !!(props.nama_lokasi || props.jenis_posko || props.type_layer === 'titik_pengungsian' || props.subcategory === 'Pengungsian');
    if (isPengungsianProps) {
        if (Number.isFinite(Number(props.__lat)) && Number.isFinite(Number(props.__lng))) {
            panel.dataset.lat = String(props.__lat);
            panel.dataset.lng = String(props.__lng);
        } else {
            delete panel.dataset.lat;
            delete panel.dataset.lng;
        }
        const kab = props.kabupaten_kota || props.kab_kota || 'Daerah Istimewa Yogyakarta';
        const lokasi = props.kapanewon ? `${props.kapanewon} · ${kab}` : kab;
        const body = `
            <div class="dp-section">Informasi Posko Pengungsian 2025</div>
            ${detailRow('Nama lokasi', props.nama_lokasi || props.name || props.nama || 'Posko Pengungsian')}
            ${detailRow('Jenis posko', props.jenis_posko || props.type || 'Tempat Pengungsian')}
            ${detailRow('Fungsi', props.fungsi || 'Pusat evakuasi dan dukungan logistik')}
            ${detailRow('Kabupaten/Kota', kab)}
            ${detailRow('Kapanewon', props.kapanewon || 'Tidak tercantum')}
            ${detailRow('Kalurahan', props.kalurahan || 'Tidak tercantum')}
            ${detailRow('Alamat', props.alamat_deskripsi || props.alamat || 'Tidak tercantum')}`;
        setPanelContent(detailPanelShell({
            photo: props.foto || 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=800&q=85',
            badge: 'Pengungsian',
            title: props.nama_lokasi || props.name || props.nama || 'Posko Pengungsian',
            risk: props.jenis_posko || 'Pengungsian',
            subtitle: lokasi,
            body,
            primaryText: 'Arahkan ke Sini',
            secondaryText: 'Buka di Google Maps',
            primaryAction: 'fly',
            secondaryAction: 'gmaps'
        }));
        return;
    }

    delete panel.dataset.lat;
    delete panel.dataset.lng;
    const risk = props.kelas_risiko || 'Rendah';
    const total = Number(props.jumlah_kejadian || 0);
    const typeEntries = DISASTER_TYPE_KEYS.map((key) => [DISASTER_TYPE_LABELS[key], Number(props[key] || 0)]);
    const dominantLocal = typeEntries.slice().sort((a, b) => b[1] - a[1])[0] || ['-', 0];
    const body = `
        <div class="dp-section">Informasi Kebencanaan Wilayah 2025</div>
        ${detailRow('Nama wilayah', props.kab_kota || 'Wilayah Dipilih')}
        ${detailRow('Tingkat risiko', risk)}
        ${detailRow('Total kejadian', `${total.toLocaleString('id-ID')} kejadian`)}
        ${detailRow('Bencana dominan', `${dominantLocal[0]} - ${Number(dominantLocal[1] || 0).toLocaleString('id-ID')}`)}
        ${detailRow('Periode data', props.periode || DISASTER_2025_PERIOD)}
        `;
    setPanelContent(detailPanelShell({
        photo: kabPhoto[props.kab_kota] || kabPhoto['Kota Yogyakarta'],
        badge: props.kab_kota || 'Kebencanaan',
        title: props.kab_kota || 'Wilayah Dipilih',
        risk: `Risiko ${risk}`,
        subtitle: 'Daerah Istimewa Yogyakarta',
        body
    }));
}

/** Helper: centroid dari feature geometry */
function getCentroid(feature) {
    const g = feature.geometry;
    if (!g) return null;
    if (g.type === 'Point') {
        return [g.coordinates[1], g.coordinates[0]];
    }
    if ((g.type === 'Polygon' || g.type === 'MultiPolygon') && g.coordinates?.[0]?.length) {
        const ring = g.type === 'Polygon' ? g.coordinates[0] : g.coordinates[0][0];
        let sx = 0, sy = 0;
        ring.forEach(([x, y]) => { sx += x; sy += y; });
        return [sy / ring.length, sx / ring.length];
    }
    if (g.type === 'LineString' && g.coordinates?.length) {
        const mid = Math.floor(g.coordinates.length / 2);
        return [g.coordinates[mid][1], g.coordinates[mid][0]];
    }
    return null;
}

/** Intensity per tingkat risiko */
function risikoIntensity(levelRisiko) {
    const l = (levelRisiko || '').toLowerCase();
    if (l.includes('sangat tinggi')) return 1.0;
    if (l.includes('tinggi'))        return 0.8;
    if (l.includes('sedang'))        return 0.5;
    if (l.includes('rendah'))        return 0.3;
    if (l.includes('info'))          return 0.6;  // jalur evakuasi and pengungsian
    return 0.4;
}

/** Build heatmap layer dari polygon/linestring zona bencana */
function buildKebHeatLayer(features) {
    const heatPoints = [];
    features.forEach(f => {
        const tl = f.properties?.type_layer || '';
        if (tl === 'titik_pengungsian' || tl === 'titik_kumpul') return;
        if (f.geometry?.type === 'Point') return;
        const centroid = getCentroid(f);
        if (!centroid) return;
        const intensity = risikoIntensity(f.properties?.level_risiko);
        heatPoints.push([centroid[0], centroid[1], intensity]);
    });
    if (!heatPoints.length) return null;
    return L.heatLayer(heatPoints, {
        radius: 90,
        blur: 65,
        maxZoom: 16,
        minOpacity: 0.5,
        gradient: {
            0.0:  '#1d4ed8',
            0.2:  '#0ea5e9',
            0.4:  '#22d3ee',
            0.55: '#fde047',
            0.75: '#fb923c',
            0.9:  '#ef4444',
            1.0:  '#dc2626'
        }
    });
}

/** Build line layer untuk jalur evakuasi */
function buildKebLineLayer(features) {
    const evakuasiFeatures = features.filter(f =>
        f.properties?.type_layer === 'jalur_evakuasi' ||
        (f.geometry?.type === 'LineString' || f.geometry?.type === 'MultiLineString')
    );
    if (!evakuasiFeatures.length) return null;
    return L.geoJSON({ type: 'FeatureCollection', features: evakuasiFeatures }, {
        renderer: L.svg({ padding: 0.5 }),
        style: () => ({
            color: '#27ae60',
            weight: 5,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
            noClip: true
        }),
        onEachFeature: (feature, layer) => {
            layer.on('click', () => {
                document.dispatchEvent(new CustomEvent('markerClicked', {
                    detail: { feature, category: 'kebencanaan', layer }
                }));
            });
        }
    });
}

/** Build marker layer untuk titik pengungsian & titik kumpul */
function buildKebMarkerLayer(features) {
    const pointFeatures = features.map(normalizePengungsianFeature).filter(f => {
        const tl = (f.properties?.type_layer || '').toLowerCase();
        const subcat = (f.properties?.subcategory || '').toLowerCase();
        return f.geometry?.type === 'Point' &&
            (tl === 'titik_pengungsian' || tl === 'titik_kumpul' ||
             tl === 'pengungsian' || subcat.includes('pengungsian') ||
             subcat.includes('kumpul'));
    });
    if (!pointFeatures.length) return null;
    return L.geoJSON({ type: 'FeatureCollection', features: pointFeatures }, {
        pointToLayer: (feature, latlng) => createMarker(feature, latlng, 'kebencanaan'),
        onEachFeature: (feature, layer) => {
            bindFeatureTooltip(layer, feature);
            layer.on('click', () => {
                if (_selectedKabLayer) {
                    const oldProps = _selectedKabLayer.feature?.properties || {};
                    _selectedKabLayer.setStyle(riskStyle(oldProps.kelas_risiko));
                    _selectedKabLayer = null;
                }
                showPengungsianInLeftPanel(feature);
            });
        }
    });
}

/** Remove all kebencanaan sublayers from map */
function _clearKebLayers() {
    if (_kebHeatLayer   && State.map) { try { State.map.removeLayer(_kebHeatLayer); }   catch(_) {} }
    if (_kebLineLayer   && State.map) { try { State.map.removeLayer(_kebLineLayer); }   catch(_) {} }
    if (_kebMarkerLayer && State.map) { try { State.map.removeLayer(_kebMarkerLayer); } catch(_) {} }
    if (_kabRiskLayer   && State.map) { try { State.map.removeLayer(_kabRiskLayer); }   catch(_) {} }
    _selectedKabLayer = null;
}

function _syncKebLayers() {
    if (!State.map) return;
    if (_kebLineLayer) {
        if (_kebLineVisible && !State.map.hasLayer(_kebLineLayer)) State.map.addLayer(_kebLineLayer);
        if (!_kebLineVisible && State.map.hasLayer(_kebLineLayer)) State.map.removeLayer(_kebLineLayer);
    }
    if (_kebMarkerLayer) {
        if (_kebPengungsianVisible && !State.map.hasLayer(_kebMarkerLayer)) State.map.addLayer(_kebMarkerLayer);
        if (!_kebPengungsianVisible && State.map.hasLayer(_kebMarkerLayer)) State.map.removeLayer(_kebMarkerLayer);
    }
    if (_kabRiskLayer) {
        if (_kebZonaVisible && !State.map.hasLayer(_kabRiskLayer)) State.map.addLayer(_kabRiskLayer);
        if (!_kebZonaVisible && State.map.hasLayer(_kabRiskLayer)) State.map.removeLayer(_kabRiskLayer);
    }
}

/** Tampilkan zona bencana: heatmap + jalur evakuasi */
export function showKebencanaanZona() {
    _kebZonaVisible = true;
    _syncKebLayers();
}

/** Tampilkan tempat pengungsian: marker titik */
export function showKebencanaanPengungsian() {
    _kebPengungsianVisible = true;
    _syncKebLayers();
}

export function toggleKebencanaanZona() {
    _kebZonaVisible = !_kebZonaVisible;
    _syncKebLayers();
    return _kebZonaVisible;
}

export function toggleKebencanaanJalur() {
    _kebLineVisible = !_kebLineVisible;
    _syncKebLayers();
    return _kebLineVisible;
}

export function toggleKebencanaanPengungsian() {
    _kebPengungsianVisible = !_kebPengungsianVisible;
    _syncKebLayers();
    return _kebPengungsianVisible;
}

/** Load dan render batas wilayah DIY di atas heatmap */
export async function loadDIYBoundary() {
    if (_boundaryLayer) return;
    try {
        const res = await fetch('data/yogyakarta_boundary.geojson');
        const geojson = await res.json();
        _boundaryLayer = L.geoJSON(geojson, {
            style: {
                color: '#22d3ee',
                weight: 1.5,
                opacity: 0.72,
                fillColor: 'transparent',
                fillOpacity: 0
            }
        });
        if (State.map) _boundaryLayer.addTo(State.map);
    } catch (e) {
        console.warn('Gagal load batas DIY:', e);
    }
}

/** Stroke / fill untuk non-kebencanaan layers */
function nonDisasterStyle(category, feature) {
    const cat = CATEGORIES[category];
    const color = cat ? cat.color : '#3b82f6';
    const type = feature.geometry?.type;
    if (type === 'LineString' || type === 'MultiLineString') {
        return { color, weight: 3, opacity: 0.8, dashArray: '6 4' };
    }
    if (type === 'Polygon' || type === 'MultiPolygon') {
        return { color, weight: 2, opacity: 0.7, fillColor: color, fillOpacity: 0.12 };
    }
    return {};
}

function buildLayerGroup(category, features) {
    const layerGroup = L.featureGroup();
    if (!features || features.length === 0) return layerGroup;
    features = features.filter((feature) => !isSuppressedFeature(feature));

    if (category === 'kebencanaan') {
        // Build sublayers
        _kebHeatLayer   = buildKebHeatLayer(features);
        _kebLineLayer   = buildKebLineLayer(features);
        // Return empty placeholder — real layers are managed separately
        return layerGroup;
    }

    const geoJsonLayer = L.geoJSON({ type: 'FeatureCollection', features }, {
        pointToLayer: (feature, latlng) => createMarker(feature, latlng, category),
        onEachFeature: (feature, layer) => {
            if (feature.geometry?.type === 'Point') bindFeatureTooltip(layer, feature);
            layer.bindPopup(genericPopupHtml(feature, category), {
                className: 'dark-leaflet-popup',
                maxWidth: 320,
                closeButton: true
            });
            layer.on('click', () => {
                layer.openPopup();
                document.dispatchEvent(new CustomEvent('markerClicked', {
                    detail: { feature, category, layer }
                }));
            });
        },
        style: (feature) => nonDisasterStyle(category, feature)
    });
    layerGroup.addLayer(geoJsonLayer);
    return layerGroup;
}

async function loadKabupatenRiskLayer() {
    if (_kabRiskLayer || typeof L === 'undefined') return;
    try {
        const res = await fetch('qgis/jumlah_dampak_bencana_diy_2025_per_kabupaten.geojson');
        const geojson = await res.json();
        State.disaster2025Kabupaten = geojson;
        renderKabRiskPanel();
        _kabRiskLayer = L.geoJSON(geojson, {
            renderer: L.svg({ padding: 0.5 }),
            style: (feature) => riskStyle(feature.properties?.kelas_risiko),
            onEachFeature: (feature, layer) => {
                bindFeatureTooltip(layer, feature);
                layer.on('mouseover', () => {
                    if (layer !== _selectedKabLayer) layer.setStyle(riskStyle(feature.properties?.kelas_risiko, 'hover'));
                    layer.bringToFront();
                });
                layer.on('mouseout', () => {
                    if (layer !== _selectedKabLayer) layer.setStyle(riskStyle(feature.properties?.kelas_risiko));
                });
                layer.on('click', () => {
                    if (_selectedKabLayer && _selectedKabLayer !== layer) {
                        const oldProps = _selectedKabLayer.feature?.properties || {};
                        _selectedKabLayer.setStyle(riskStyle(oldProps.kelas_risiko));
                    }
                    _selectedKabLayer = layer;
                    layer.setStyle(riskStyle(feature.properties?.kelas_risiko, 'selected'));
                    layer.bringToFront();
                    renderKabRiskPanel(feature.properties, true);
                });
            }
        });
    } catch (err) {
        console.warn('Gagal memuat data kejadian kabupaten/kota 2025:', err);
        renderKabRiskPanel();
    }
}

async function loadPengungsianLogistikLayer() {
    try {
        const res = await fetch('data/qgis/posko_pengungsian_logistik_diy_2025.geojson');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const geojson = await res.json();
        const features = Array.isArray(geojson.features) ? geojson.features.map(normalizePengungsianFeature) : [];
        State.pengungsianLogistik2025 = { type: 'FeatureCollection', features };
        _kebMarkerLayer = buildKebMarkerLayer(features);
    } catch (err) {
        console.warn('Gagal memuat posko pengungsian logistik 2025:', err);
        _kebMarkerLayer = buildKebMarkerLayer([]);
    }
}

export async function loadLayer(category) {
    if (State.layerCache[category]) {
        if (category === 'kebencanaan') {
            _syncKebLayers();
            return;
        }
        if (State.enabledCategories.has(category)) {
            if (!State.markerClusterGroup.hasLayer(State.layerCache[category])) {
                State.markerClusterGroup.addLayer(State.layerCache[category]);
            }
        }
        return;
    }

    const cat = CATEGORIES[category];
    if (!cat) { console.warn('Unknown category:', category); return; }

    const allFeatures = [];
    try {
        await loadLargeGeoJSON(cat.file, (chunk) => chunk.forEach(f => allFeatures.push(f)));
    } catch (e) {
        console.warn(`Could not load ${cat.file}:`, e);
        return;
    }

    State.categoryData[category] = { type: 'FeatureCollection', features: allFeatures };
    State.rawGeojsonCache[category] = allFeatures;

    const subcatCounts = {};
    allFeatures.forEach(f => {
        const sc = f.properties.subcategory || f.properties.type || 'Lainnya';
        subcatCounts[sc] = (subcatCounts[sc] || 0) + 1;
    });
    State.categoryMeta[category] = { subcategories: subcatCounts };
    State.activeSubcats[category] = new Set(Object.keys(subcatCounts));

    const layerGroup = buildLayerGroup(category, allFeatures);
    State.layerCache[category] = layerGroup;

    if (category === 'kebencanaan') {
        // Show zona bencana by default
        await loadKabupatenRiskLayer();
        await loadPengungsianLogistikLayer();
        if (State.enabledCategories.has(category)) {
            _kebZonaVisible = true;
            _kebLineVisible = false;
            _kebPengungsianVisible = true;
            _syncKebLayers();
        }
    } else {
        if (State.enabledCategories.has(category)) {
            State.markerClusterGroup.addLayer(layerGroup);
        }
    }

    document.dispatchEvent(new CustomEvent('layerLoaded', { detail: { category } }));
}

export function showLayer(category) {
    State.enabledCategories.add(category);
    if (category === 'kebencanaan') { _syncKebLayers(); return; }
    const lg = State.layerCache[category];
    if (lg && !State.markerClusterGroup.hasLayer(lg)) {
        State.markerClusterGroup.addLayer(lg);
    }
}

export function hideLayer(category) {
    State.enabledCategories.delete(category);
    if (category === 'kebencanaan') {
        _clearKebLayers();
        return;
    }
    const lg = State.layerCache[category];
    if (lg) State.markerClusterGroup.removeLayer(lg);
}

export function showOnlyCategory(category) {
    State.onlyKebencanaan = category === 'kebencanaan';
    State.enabledCategories.clear();
    State.enabledCategories.add(category);
    Object.keys(State.layerCache).forEach(cat => {
        if (cat === 'kebencanaan') {
            if (category === 'kebencanaan') {
                _kebZonaVisible = true;
                _kebLineVisible = false;
                _kebPengungsianVisible = true;
                _syncKebLayers();
            }
            else _clearKebLayers();
        } else {
            if (cat !== category) {
                State.markerClusterGroup.removeLayer(State.layerCache[cat]);
            } else {
                if (!State.markerClusterGroup.hasLayer(State.layerCache[cat])) {
                    State.markerClusterGroup.addLayer(State.layerCache[cat]);
                }
            }
        }
    });
}

export function showOnlyKebencanaan() {
    showOnlyCategory('kebencanaan');
}

export function fitMapToCategory(category) {
    const lg = State.layerCache[category];
    if (lg && State.map) {
        const bounds = lg.getBounds();
        if (bounds && bounds.isValid()) {
            State.map.fitBounds(bounds, { padding: [50, 50], duration: 1.2 });
        }
    }
}

export function showAllLayers() {
    State.onlyKebencanaan = false;
    Object.keys(State.layerCache).forEach(cat => {
        State.enabledCategories.add(cat);
        if (cat === 'kebencanaan') {
            _kebZonaVisible = true;
            _kebPengungsianVisible = true;
            _syncKebLayers();
            return;
        }
        if (!State.markerClusterGroup.hasLayer(State.layerCache[cat])) {
            State.markerClusterGroup.addLayer(State.layerCache[cat]);
        }
    });
}

export function rebuildCategoryLayer(key) {
    const rawFeatures = State.rawGeojsonCache[key];
    if (!rawFeatures) return;

    if (key === 'kebencanaan') {
        // Rebuild sublayers
        _clearKebLayers();
        _kebHeatLayer   = buildKebHeatLayer(rawFeatures);
        _kebLineLayer   = buildKebLineLayer(rawFeatures);
        _kebMarkerLayer = buildKebMarkerLayer(State.pengungsianLogistik2025?.features || []);
        if (State.enabledCategories.has(key)) _syncKebLayers();
        return;
    }

    const activeSet = State.activeSubcats[key] || new Set();
    const filtered = rawFeatures.filter(f => {
        const sc = f.properties.subcategory || f.properties.type || 'Lainnya';
        return activeSet.has(sc);
    });

    const old = State.layerCache[key];
    if (old) State.markerClusterGroup.removeLayer(old);

    const layerGroup = buildLayerGroup(key, filtered);
    State.layerCache[key] = layerGroup;

    if (State.enabledCategories.has(key)) {
        State.markerClusterGroup.addLayer(layerGroup);
    }
}
