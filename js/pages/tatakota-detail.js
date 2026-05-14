import { CONFIG, CATEGORIES } from '../state.js';

function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function getCoords(feature) {
    let lat = -7.7956, lng = 110.3695;
    if (feature.geometry?.type === 'Point') {
        lng = feature.geometry.coordinates[0];
        lat = feature.geometry.coordinates[1];
    } else if (feature.geometry?.type === 'Polygon' && feature.geometry.coordinates?.[0]?.length) {
        const ring = feature.geometry.coordinates[0];
        let sx = 0, sy = 0;
        ring.forEach(([x, y]) => { sx += x; sy += y; });
        lng = sx / ring.length;
        lat = sy / ring.length;
    }
    return { lat, lng };
}

function labelFor(key) {
    const labels = {
        name: 'Nama lokasi',
        nama: 'Nama lokasi',
        type: 'Jenis tempat',
        category: 'Kategori',
        subcategory: 'Subkategori',
        alamat: 'Alamat',
        address: 'Alamat',
        rating: 'Rating',
        sumber: 'Sumber data',
        tahun_data: 'Tahun data',
        keterangan: 'Keterangan'
    };
    if (labels[key]) return labels[key];
    return String(key).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Render detail lokasi ke dalam container (SPA Tata Kelola).
 */
export function renderTataKotaDetailInto(container, id, opts) {
    const onBack = opts?.onBack || (() => {});
    const raw = sessionStorage.getItem(`tatakotaDetail:${id}`);

    if (!raw) {
        container.innerHTML = `
        <div class="tw-max-w-lg tw-mx-auto tw-px-6 tw-py-20 tw-text-center tw-font-ui">
            <p class="tw-mb-6 tw-text-sm tw-text-slate-400">Data lokasi tidak ditemukan. Buka dari halaman Tata Kelola.</p>
            <button type="button" class="tatakota-btn tatakota-btn--gold js-tk-back-root tw-px-6">Kembali</button>
        </div>`;
        container.querySelector('.js-tk-back-root')?.addEventListener('click', onBack);
        return;
    }

    let payload;
    try { payload = JSON.parse(raw); } catch (_) {
        container.innerHTML = `<p class="tw-p-8 tw-text-sm tw-text-slate-500">Data tidak valid.</p>`;
        return;
    }

    const { cat, feature } = payload;
    const props  = feature?.properties || {};
    const name   = props.name || props.nama || 'Lokasi';
    const { lat, lng } = getCoords(feature);

    const catLabel = CATEGORIES[cat]?.label || cat;
    const catColor = CATEGORIES[cat]?.color || '#d4a017';
    const sub      = props.subcategory || props.type || catLabel;

    // Hero image: pakai foto dari props atau Picsum
    const hero = props.foto || `https://picsum.photos/seed/${encodeURIComponent(cat + name.slice(0, 8))}/1200/480`;

    // Fasilitas
    const fasilitas = Array.isArray(props.facilities) ? props.facilities : [];

    // Rows info
    const skipKeys = new Set(['foto', 'photo', 'image', 'geometry', 'coordinates', 'facilities', 'riwayat_bencana', 'instruksi_evakuasi']);
    const rows = Object.entries(props)
        .filter(([k]) => !skipKeys.has(k) && typeof props[k] !== 'object')
        .map(([k, v]) => `
        <tr class="tw-border-b tw-border-white/5">
            <td class="tw-py-3 tw-pr-5 tw-font-ui tw-text-sm tw-font-semibold tw-text-amber-200/80 tw-whitespace-nowrap">${esc(labelFor(k))}</td>
            <td class="tw-py-3 tw-font-body tw-text-sm tw-leading-relaxed tw-text-slate-300">${esc(String(v).slice(0, 140))}</td>
        </tr>`).join('');

    // Keramaian bar chart data (ilustratif konsisten per lokasi hash)
    function h(s) { let n = 0; for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) >>> 0; return n; }
    const seed = h(name + cat);
    const crowd = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map((d, i) => ({
        day: d,
        pct: 20 + ((seed >> (i * 4)) & 0x3f)
    }));

    container.innerHTML = `
    <div class="tatakota-detail-spa tw-opacity-0 tw-translate-y-3 detail-page-entrance">
        <!-- Hero -->
        <div class="tw-relative tw-h-[58vh] tw-min-h-[420px] tw-w-full tw-overflow-hidden">
            <button type="button" class="js-tk-back tw-absolute tw-left-6 tw-top-6 tw-z-30 tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-full tw-border tw-border-amber-500/50 tw-bg-slate-950/75 tw-backdrop-blur-md tw-text-amber-300 hover:tw-bg-amber-500/10 tw-text-xs tw-font-semibold tw-transition-all tw-duration-200 tw-font-ui" aria-label="Kembali ke daftar">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Kembali
            </button>
            <img src="${esc(hero)}" alt="${esc(name)}"
                class="tw-absolute tw-inset-0 tw-h-full tw-w-full tw-object-cover"
                loading="lazy" onerror="this.src='https://picsum.photos/seed/1015/1200/480'">
            <div class="tw-absolute tw-inset-0" style="background:linear-gradient(to top, #0a0f1e 0%, rgba(10,15,30,0.55) 55%, transparent 100%)"></div>
            <div class="tw-absolute tw-bottom-0 tw-left-0 tw-right-0 tw-px-6 tw-pb-6 md:tw-px-10">
                <div class="tw-flex tw-items-center tw-gap-2 tw-mb-3 tw-opacity-0 tw-translate-y-3 detail-entrance" style="--delay:0ms">
                    <span class="tw-inline-flex tw-items-center tw-px-3 tw-py-1 tw-rounded-full tw-text-[10px] tw-font-semibold tw-uppercase tw-tracking-wider tw-border"
                          style="background:${catColor}22;color:${catColor};border-color:${catColor}44">${esc(catLabel)}</span>
                    <span class="tw-inline-flex tw-items-center tw-px-3 tw-py-1 tw-rounded-full tw-bg-white/10 tw-text-white/70 tw-text-[10px] tw-font-semibold tw-uppercase tw-tracking-wider">${esc(sub)}</span>
                </div>
                <h1 class="tw-font-display tw-text-3xl md:tw-text-5xl tw-font-extrabold tw-text-white tw-leading-tight tw-opacity-0 tw-translate-y-3 detail-entrance" style="--delay:80ms">${esc(name)}</h1>
            </div>
        </div>

        <!-- Content -->
        <div class="tw-max-w-6xl tw-mx-auto tw-px-5 tw-py-10 md:tw-px-10 md:tw-py-14 tw-space-y-10">

            <!-- Grid 2 kolom -->
            <div class="tw-grid tw-grid-cols-1 tw-gap-10 lg:tw-grid-cols-[1.2fr_0.8fr]">

                <!-- Info utama -->
                <section class="tw-opacity-0 tw-translate-y-4 detail-entrance" style="--delay:160ms">
                    <div class="tw-mb-5">
                        <h2 class="tw-font-display tw-text-2xl tw-font-bold tw-text-slate-100">Informasi Lokasi</h2>
                        <p class="tw-mt-2 tw-text-sm tw-leading-relaxed tw-text-slate-500 tw-font-ui">Ringkasan atribut utama dari data lokasi.</p>
                    </div>
                    <div class="tw-overflow-x-auto">
                        <table class="tw-w-full tw-border-collapse tw-text-left tw-px-4">
                            ${rows || '<tr><td class="tw-p-4 tw-text-sm tw-text-slate-500">Tidak ada properti tersedia.</td></tr>'}
                        </table>
                    </div>
                </section>

                <!-- Fasilitas + aksi -->
                <div class="tw-flex tw-flex-col tw-gap-4">
                    ${fasilitas.length ? `
                    <section class="tw-opacity-0 tw-translate-y-4 detail-entrance" style="--delay:220ms">
                        <h2 class="tw-font-display tw-text-xl tw-font-bold tw-text-slate-100 tw-mb-4">Fasilitas</h2>
                        <div class="tw-flex tw-flex-wrap tw-gap-2">
                            ${fasilitas.map(f => `<span class="tw-px-3 tw-py-1.5 tw-rounded-full tw-bg-amber-400/5 tw-border tw-border-amber-400/25 tw-text-amber-100/90 tw-text-xs tw-font-medium">${esc(String(f))}</span>`).join('')}
                        </div>
                    </section>` : ''}

                    <!-- Aksi -->
                    <section class="tw-opacity-0 tw-translate-y-4 detail-entrance" style="--delay:280ms">
                        <h2 class="tw-font-display tw-text-xl tw-font-bold tw-text-slate-100 tw-mb-4">Aksi Cepat</h2>
                        <div class="tw-flex tw-flex-wrap tw-gap-3">
                            <button type="button" id="tk-btn-arahkan"
                                class="tw-inline-flex tw-items-center tw-justify-center tw-py-2.5 tw-px-5 tw-rounded-xl tw-bg-amber-400/90 hover:tw-bg-amber-300 tw-text-slate-950 tw-text-sm tw-font-bold tw-transition-all tw-duration-200 tw-font-ui">
                                Arahkan ke Sini
                            </button>
                            <button type="button" id="tk-btn-peta-kategori"
                                class="tw-inline-flex tw-items-center tw-justify-center tw-py-2.5 tw-px-5 tw-rounded-xl tw-border tw-border-amber-500/40 tw-text-amber-300 hover:tw-bg-amber-500/10 tw-text-sm tw-font-semibold tw-transition-all tw-duration-200 tw-font-ui">
                                Lihat di Peta
                            </button>
                            <a href="https://maps.google.com?q=${lat},${lng}" target="_blank" rel="noopener noreferrer"
                                class="tw-inline-flex tw-items-center tw-justify-center tw-py-2.5 tw-px-5 tw-rounded-xl tw-border tw-border-white/15 tw-text-slate-400 hover:tw-bg-white/5 tw-text-sm tw-font-semibold tw-transition-all tw-duration-200 tw-font-ui">
                                Buka di Google Maps
                            </a>
                        </div>
                    </section>
                </div>
            </div>

            <!-- Grafik keramaian -->
            <section class="tw-opacity-0 tw-translate-y-4 detail-entrance" style="--delay:340ms">
                <h2 class="tw-font-display tw-text-2xl tw-font-bold tw-text-slate-100 tw-mb-5">Estimasi Keramaian Mingguan</h2>
                <div class="tw-flex tw-items-end tw-gap-1.5 tw-h-20">
                    ${crowd.map(c => `
                    <div class="tw-flex-1 tw-flex tw-flex-col tw-items-center tw-gap-1">
                        <div class="tw-w-full tw-rounded-sm tw-transition-all tw-duration-700"
                             style="height:${c.pct}%;background:${catColor};opacity:0.8;min-height:4px"></div>
                        <span class="tw-text-[9px] tw-font-mono tw-text-slate-500">${c.day}</span>
                    </div>`).join('')}
                </div>
                <p class="tw-mt-2 tw-text-[10px] tw-text-slate-600 tw-font-ui">Estimasi ilustratif — bukan data real-time</p>
            </section>
        </div>
    </div>`;

    // Wire back button
    container.querySelector('.js-tk-back')?.addEventListener('click', onBack);

    // Arahkan ke Sini — SPA single marker map
    container.querySelector('#tk-btn-arahkan')?.addEventListener('click', () => {
        const tatakoPage = document.getElementById('tatakota-page');
        if (tatakoPage) tatakoPage.classList.add('hidden');
        import('./spa-map.js').then(({ showSingleMarkerMap }) => {
            showSingleMarkerMap(name, lat, lng, 'tatakota-page');
        });
    });

    // Lihat di Peta — SPA category map
    container.querySelector('#tk-btn-peta-kategori')?.addEventListener('click', () => {
        const features = (window.State?.rawGeojsonCache?.[cat]) || [];
        const tatakoPage = document.getElementById('tatakota-page');
        if (tatakoPage) tatakoPage.classList.add('hidden');
        import('./spa-map.js').then(({ showCategoryMap }) => {
            showCategoryMap(catLabel, features, catColor, 'tatakota-page');
        });
    });

    // Entrance animations
    requestAnimationFrame(() => {
        container.querySelector('.detail-page-entrance')?.classList.remove('tw-opacity-0', 'tw-translate-y-3');
        container.querySelector('.detail-page-entrance')?.classList.add('tw-opacity-100', 'tw-translate-y-0', 'tw-transition-all', 'tw-duration-500');
        container.querySelectorAll('.detail-entrance').forEach(el => {
            const delay = parseInt(el.style.getPropertyValue('--delay')) || 0;
            setTimeout(() => {
                el.classList.remove('tw-opacity-0', 'tw-translate-y-3', 'tw-translate-y-4');
                el.classList.add('tw-opacity-100', 'tw-translate-y-0');
                el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            }, delay);
        });
    });
}

/** Legacy deep-link support */
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
