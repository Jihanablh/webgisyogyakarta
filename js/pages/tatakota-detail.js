import { CONFIG } from '../state.js';

function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Render detail lokasi ke dalam container (SPA Tata Kelola).
 * @param {HTMLElement} container
 * @param {string} id
 * @param {{ onBack: () => void }} opts
 */
export function renderTataKotaDetailInto(container, id, opts) {
    const onBack = opts?.onBack || (() => {});
    const raw = sessionStorage.getItem(`tatakotaDetail:${id}`);

    if (!raw) {
        container.innerHTML = `
            <div class="tatakota-detail-fallback tw-mx-auto tw-max-w-lg tw-px-6 tw-py-16 tw-text-center tw-font-ui">
                <p class="tw-mb-6 tw-font-body tw-text-[var(--text-secondary)]">Data lokasi tidak ditemukan di sesi ini. Buka dari halaman Tata Kelola.</p>
                <button type="button" class="tatakota-btn tatakota-btn--gold js-tk-back-root">Kembali</button>
            </div>`;
        container.querySelector('.js-tk-back-root')?.addEventListener('click', onBack);
        return;
    }

    let payload;
    try {
        payload = JSON.parse(raw);
    } catch (_) {
        container.innerHTML = `<p class="tw-p-8 tw-font-body tw-text-[var(--text-muted)]">Data tidak valid.</p>`;
        return;
    }
    const { cat, feature } = payload;
    const props = feature?.properties || {};
    const name = props.name || props.nama || 'Lokasi';
    let lat = -7.7956;
    let lng = 110.3695;
    if (feature.geometry?.type === 'Point') {
        lng = feature.geometry.coordinates[0];
        lat = feature.geometry.coordinates[1];
    } else if (feature.geometry?.type === 'Polygon' && feature.geometry.coordinates?.[0]?.length) {
        const ring = feature.geometry.coordinates[0];
        let sx = 0;
        let sy = 0;
        ring.forEach(([x, y]) => {
            sx += x;
            sy += y;
        });
        lng = sx / ring.length;
        lat = sy / ring.length;
    }

    const hero = props.foto || `https://picsum.photos/seed/${encodeURIComponent(cat + name)}/1200/480`;
    const skipKeys = new Set(['geometry', 'coordinates']);

    const rows = Object.entries(props)
        .filter(([k]) => !skipKeys.has(k) && typeof props[k] !== 'object')
        .map(
            ([k, v]) =>
                `<tr class="tw-border-b tw-border-white/5"><td class="tw-py-2 tw-pr-4 tw-font-ui tw-text-xs tw-uppercase tw-tracking-wide tw-text-[var(--text-muted)]">${esc(k)}</td><td class="tw-py-2 tw-font-body tw-text-sm tw-text-[var(--text-primary)]">${esc(String(v))}</td></tr>`
        )
        .join('');

    container.innerHTML = `
        <div class="tatakota-detail-spa">
            <header class="tatakota-detail-spa-head tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-b tw-border-[var(--border-card)] tw-bg-[var(--bg-elevated)] tw-px-4 tw-py-3">
                <button type="button" class="tatakota-btn tatakota-btn--ghost js-tk-back" aria-label="Kembali ke daftar">← Kembali</button>
                <span class="tw-font-ui tw-text-[10px] tw-uppercase tw-tracking-widest tw-text-[var(--text-muted)]">Detail lokasi</span>
            </header>
            <div class="tatakota-detail-hero tw-relative tw-h-[40vh] tw-w-full tw-overflow-hidden">
                <img src="${esc(hero)}" alt="" class="tw-absolute tw-inset-0 tw-h-full tw-w-full tw-object-cover" />
                <div class="tw-absolute tw-inset-0 tw-bg-gradient-to-t tw-from-[#0a0f1e] tw-via-[#0a0f1e]/55 tw-to-transparent"></div>
                <div class="tw-absolute tw-bottom-0 tw-left-0 tw-right-0 tw-p-6 md:tw-p-10">
                    <h1 class="tw-font-display tw-text-3xl tw-font-extrabold tw-text-white md:tw-text-4xl">${esc(name)}</h1>
                    <p class="tw-mt-2 tw-font-ui tw-text-xs tw-uppercase tw-tracking-wider tw-text-amber-400/90">${esc(cat)}</p>
                </div>
            </div>
            <div class="tw-mx-auto tw-max-w-6xl tw-space-y-8 tw-px-4 tw-py-8 md:tw-px-8">
                <div class="tw-grid tw-grid-cols-1 tw-gap-6 lg:tw-grid-cols-2">
                <section class="about-io-card">
                    <h2 class="tw-mb-3 tw-font-display tw-text-lg tw-text-amber-500">Informasi utama</h2>
                    <div class="tw-overflow-hidden tw-rounded-xl tw-border tw-border-[var(--border-card)] tw-bg-[var(--bg-card)]">
                        <table class="tw-w-full tw-border-collapse tw-text-left">${rows || '<tr><td class="tw-p-4 tw-font-body tw-text-[var(--text-muted)]">Tidak ada properti teks.</td></tr>'}</table>
                    </div>
                </section>
                <section class="about-io-card">
                    <h2 class="tw-mb-3 tw-font-display tw-text-lg tw-text-amber-500">Peta & aksi</h2>
                    <p class="tw-mb-3 tw-font-body tw-text-xs tw-text-[var(--text-muted)]">Peta internal hanya preview. Gunakan tombol untuk membuka halaman peta bersih satu marker.</p>
                    <div id="tatakota-embed-map" class="tw-h-[280px] tw-w-full tw-overflow-hidden tw-rounded-xl tw-border tw-border-amber-500/20 tw-shadow-lg"></div>
                    <div class="tw-mt-4 tw-flex tw-gap-3">
                      <button type="button" id="tatakota-open-clean-map" class="tatakota-btn tatakota-btn--gold">Lihat di Peta</button>
                      <button type="button" id="tatakota-embed-zoom" class="tatakota-btn tatakota-btn--ghost">Arahkan ke Sini</button>
                    </div>
                </section>
                </div>
            </div>
        </div>`;

    container.querySelector('.js-tk-back')?.addEventListener('click', onBack);

    const mapDiv = container.querySelector('#tatakota-embed-map');
    if (mapDiv && typeof L !== 'undefined') {
        const tile = L.tileLayer(CONFIG.tileUrl, {
            attribution: CONFIG.tileAttribution,
            maxZoom: 19
        });
        const map = L.map(mapDiv, { zoomControl: true, scrollWheelZoom: true }).setView([lat, lng], 14);
        tile.addTo(map);
        L.marker([lat, lng]).bindPopup(esc(name)).addTo(map);
        setTimeout(() => map.invalidateSize(), 200);
        container.querySelector('#tatakota-embed-zoom')?.addEventListener('click', () => {
            map.setView([lat, lng], 17, { animate: true });
        });
    }
    container.querySelector('#tatakota-open-clean-map')?.addEventListener('click', () => {
        const sid = `single-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
        sessionStorage.setItem(`singleMap:${sid}`, JSON.stringify({ name, lat, lng }));
        window.open(`${location.pathname}#map/single/${encodeURIComponent(sid)}`, '_blank', 'noopener,noreferrer');
    });
}

/** Deep link lama (?view=detail&tatakotaId=) — tetap didukung lewat redirect hash di main.js */
export function mountTataKotaDetailView(id) {
    const root = document.createElement('div');
    root.id = 'tatakota-detail-root';
    root.className = 'tatakota-detail-root';
    const mc = document.getElementById('main-content');
    if (mc) mc.style.display = 'none';
    document.body.appendChild(root);
    renderTataKotaDetailInto(root, id, {
        onBack: () => {
            root.remove();
            if (mc) mc.style.display = '';
            location.href = location.pathname;
        }
    });
}
