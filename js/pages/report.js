import {
    DISASTER_2025_BY_REGION,
    DISASTER_2025_PERIOD,
    DISASTER_2025_TOTAL,
    DISASTER_2025_SOURCE,
    DISASTER_TYPE_KEYS,
    DISASTER_TYPE_LABELS,
    disasterTypeTotals,
    dominantDisasterType,
    highestRegion,
    lowestRegion,
    riskColor,
    shortRegionName
} from '../disaster-2025.js?v=20260526-round26-welcome-encoding';

function fmt(n) {
    return Number(n || 0).toLocaleString('id-ID');
}

function renderRegionRows() {
    return DISASTER_2025_BY_REGION
        .map((r) => `
            <tr>
                <td>${r.kab_kota}</td>
                <td>${fmt(r.cuaca_ekstrem)}</td>
                <td>${fmt(r.tanah_longsor)}</td>
                <td>${fmt(r.kebakaran_hutan_lahan)}</td>
                <td>${fmt(r.gempa_terasa)}</td>
                <td>${fmt(r.banjir)}</td>
                <td>${fmt(r.kebakaran)}</td>
                <td><strong>${fmt(r.jumlah_kejadian)}</strong></td>
                <td><span class="report-risk-chip" style="--risk:${riskColor(r.kelas_risiko)}">${r.kelas_risiko}</span></td>
            </tr>`)
        .join('');
}

function renderTypeRows() {
    const totals = disasterTypeTotals();
    return DISASTER_TYPE_KEYS
        .map((key) => `
            <tr>
                <td>${DISASTER_TYPE_LABELS[key]}</td>
                <td><strong>${fmt(totals[key])}</strong></td>
                <td>${((totals[key] / DISASTER_2025_TOTAL) * 100).toFixed(1).replace('.', ',')}%</td>
            </tr>`)
        .join('');
}

function renderHistoryTimeline() {
    const events = [
        {
            title: 'Bencana Cuaca Ekstrem - Maret 2025',
            image: 'https://picsum.photos/seed/extreme-weather-yogyakarta-indonesia/1200/560',
            time: 'Maret 2025 - Rekap kejadian',
            status: 'Selesai',
            statusClass: 'tw-border-green-700/50 tw-bg-green-900/50 tw-text-green-400',
            borderClass: 'tw-border-l-amber-400',
            location: 'Lima kabupaten/kota - Daerah Istimewa Yogyakarta',
            desc: 'Hujan lebat disertai angin kencang dan fenomena hujan es melanda seluruh lima kabupaten/kota DIY secara bersamaan, dengan dampak yang bervariasi di setiap wilayah.',
            impactCards: [
                { area: 'Sleman', items: ['13 rumah rusak', '36 titik pohon tumbang', '10 akses jalan terhambat', '8 titik listrik terputus'] },
                { area: 'Kota Yogyakarta', items: ['4 rumah rusak', '1 fasilitas pendidikan terdampak', '5 titik jalan terganggu'] },
                { area: 'Gunungkidul', items: ['69 rumah terendam banjir', '5 unit rusak', '18 titik luapan air', '2 fasilitas pemerintahan terdampak'] },
                { area: 'Kulon Progo', items: ['7 titik longsor di Girimulyo dan Kokap', '5 rumah rusak', '2 akses jalan terputus'] },
                { area: 'Bantul', items: ['25 unit rumah rusak', '39 lokasi jalan rusak', '25 titik listrik', '4 kandang ternak', '1 kantor koperasi terdampak'] }
            ],
            progress: 67,
            contact: 'BPBD DIY'
        },
        {
            title: 'Bencana Longsor dan Tanah Ambles - November 2025',
            image: 'https://picsum.photos/seed/landslide-hillside-java/1200/560',
            time: '21 Nov 2025 - Bantul',
            status: 'Pemulihan',
            statusClass: 'tw-border-amber-700/50 tw-bg-amber-900/50 tw-text-amber-400',
            borderClass: 'tw-border-l-red-500',
            location: 'Sriharjo, Imogiri; Sedayu; Pajangan - Kabupaten Bantul',
            desc: 'Pada 21 November 2025 hujan intensitas tinggi memicu pergerakan tanah di Bantul. Jalan utama penghubung Padukuhan Wunut dan Sompok di Kalurahan Sriharjo, Imogiri ambles total; 150 warga Sompok dan 300 warga Kedungmiri terisolasi sehingga dibangun jembatan darurat. Di Sedayu dan Pajangan, pergerakan tanah merusak struktur bangunan warga dan pemerintah merekomendasikan relokasi untuk rumah dengan kerusakan berat di zona kerentanan tinggi.',
            impactCards: [
                { area: 'Sriharjo, Imogiri', items: ['Jalan utama Padukuhan Wunut - Sompok ambles total', '150 warga Sompok terisolasi', '300 warga Kedungmiri terisolasi', 'Jembatan darurat dibangun untuk akses sementara'] },
                { area: 'Sedayu dan Pajangan', items: ['Pergerakan tanah merusak struktur bangunan warga', 'Kerusakan turut menyasar bangunan fasilitas pemerintahan', 'Relokasi direkomendasikan untuk rumah rusak berat', 'Prioritas pemantauan pada zona kerentanan tanah tinggi'] }
            ],
            progress: 72,
            contact: 'BPBD Kabupaten Bantul'
        },
        {
            title: 'Tanah Longsor Kulon Progo',
            image: 'https://picsum.photos/seed/landslide-hills-indonesia/1200/560',
            time: '31 Des 2025 · 23.59 WIB',
            status: 'Siaga Aktif',
            statusClass: 'tw-border-red-700/50 tw-bg-red-900/50 tw-text-red-400',
            borderClass: 'tw-border-l-red-500',
            location: 'Kapanewon se-Kulon Progo · Kabupaten Kulon Progo',
            desc: 'Kulon Progo menjadi wilayah dengan jumlah kejadian tertinggi sepanjang 2025. Tanah longsor mendominasi laporan wilayah ini dengan 448 kejadian dari total 558 kejadian, terutama pada area perbukitan dan akses permukiman.',
            impactCards: [
                { area: 'Girimulyo', items: ['Lereng perbukitan menjadi fokus pemantauan', 'Akses permukiman rawan tertutup material', 'Koordinasi kesiapsiagaan dilakukan bersama kapanewon'] },
                { area: 'Kokap', items: ['Wilayah bukit Menoreh memiliki paparan longsor tinggi', 'Drainase dan tebing jalan menjadi titik prioritas', 'Respons cepat diarahkan untuk jalur penghubung warga'] },
                { area: 'Kalibawang', items: ['Pemantauan gerakan tanah saat hujan intensitas tinggi', 'Sosialisasi jalur aman untuk warga lereng', 'Pendataan titik rawan dilakukan lintas desa'] },
                { area: 'Pengasih', items: ['Pusat koordinasi logistik kabupaten', 'Distribusi informasi kejadian ke pos lapangan', 'Dukungan laporan warga untuk validasi cepat'] }
            ],
            progress: 80,
            contact: 'BPBD Kabupaten Kulon Progo'
        },
        {
            title: 'Kebakaran dan Longsor Bantul',
            image: 'https://picsum.photos/seed/fire-disaster-settlement-indonesia/1200/560',
            time: '31 Des 2025 · 21.30 WIB',
            status: 'Selesai',
            statusClass: 'tw-border-green-700/50 tw-bg-green-900/50 tw-text-green-400',
            borderClass: 'tw-border-l-orange-500',
            location: 'Kapanewon terdampak · Kabupaten Bantul',
            desc: 'Bantul masuk kelas risiko tinggi dengan 333 kejadian. Komponen terbesar berasal dari tanah longsor dan kebakaran, sehingga pemantauan wilayah padat permukiman dan lereng rawan tetap menjadi prioritas.',
            impactCards: [
                { area: 'Imogiri', items: ['Longsor dan tanah ambles menjadi perhatian utama', 'Akses padukuhan rawan terputus saat hujan ekstrem', 'Jalur darurat disiapkan untuk mobilitas warga'] },
                { area: 'Sedayu', items: ['Kerentanan gerakan tanah pada bangunan warga', 'Pendataan rumah rusak menjadi prioritas lapangan', 'Koordinasi relokasi untuk zona berisiko tinggi'] },
                { area: 'Bantul Perkotaan', items: ['Kebakaran permukiman dipantau pada area padat', 'Kesiapan armada pemadam diperkuat', 'Edukasi pencegahan korsleting listrik dilakukan berkala'] },
                { area: 'Pajangan', items: ['Tebing dan tanah miring dimonitor intensif', 'Warga diminta waspada retakan baru', 'Akses evakuasi disiapkan saat hujan panjang'] }
            ],
            progress: 61,
            contact: 'BPBD Kabupaten Bantul'
        },
        {
            title: 'Longsor dan Kebakaran Gunungkidul',
            image: 'https://picsum.photos/seed/gunungkidul-cave-landslide/1200/560',
            time: '31 Des 2025 · 18.10 WIB',
            status: 'Selesai',
            statusClass: 'tw-border-green-700/50 tw-bg-green-900/50 tw-text-green-400',
            borderClass: 'tw-border-l-rose-500',
            location: 'Kapanewon terdampak · Kabupaten Gunungkidul',
            desc: 'Gunungkidul mencatat 262 kejadian selama periode analisis. Tanah longsor dan kebakaran menjadi dua jenis kejadian paling menonjol pada rekap kabupaten ini, dengan karakter wilayah karst dan perbukitan yang perlu dipantau.',
            impactCards: [
                { area: 'Gedangsari', items: ['Perbukitan rawan longsor saat curah hujan naik', 'Akses jalan desa dipantau untuk potensi material jatuh', 'Warga lereng diminta melapor jika muncul retakan'] },
                { area: 'Patuk', items: ['Koridor perbukitan menjadi area pemantauan', 'Drainase dan tebing jalan menjadi prioritas', 'Koordinasi desa tangguh bencana diperkuat'] },
                { area: 'Wonosari', items: ['Kebakaran bangunan dan lahan menjadi perhatian', 'Kesiapsiagaan armada pemadam dipertahankan', 'Pendataan kejadian dilakukan melalui pos kabupaten'] },
                { area: 'Nglipar', items: ['Kerentanan lereng dan akses desa dipantau', 'Informasi cuaca ekstrem disebarkan ke warga', 'Jalur alternatif disiapkan saat jalan terganggu'] }
            ],
            progress: 48,
            contact: 'BPBD Kabupaten Gunungkidul'
        },
        {
            title: 'Cuaca Ekstrem Kota Yogyakarta',
            image: 'https://picsum.photos/seed/storm-city-yogyakarta/1200/560',
            time: '31 Des 2025 · 16.45 WIB',
            status: 'Pemantauan',
            statusClass: 'tw-border-amber-700/50 tw-bg-amber-900/50 tw-text-amber-400',
            borderClass: 'tw-border-l-yellow-400',
            location: 'Kemantren se-Kota Yogyakarta · Kota Yogyakarta',
            desc: 'Kota Yogyakarta berada pada kelas risiko sedang. Cuaca ekstrem menjadi jenis kejadian dominan dengan 96 kejadian dari total 141 kejadian sepanjang tahun, terutama berdampak pada pohon tumbang, akses jalan, dan fasilitas perkotaan.',
            impactCards: [
                { area: 'Gondokusuman', items: ['Pohon tumbang menjadi risiko utama saat angin kencang', 'Akses jalan perkotaan membutuhkan respons cepat', 'Koordinasi lintas dinas dilakukan untuk pembersihan'] },
                { area: 'Umbulharjo', items: ['Kepadatan permukiman meningkatkan kebutuhan respons cepat', 'Drainase dan genangan dipantau saat hujan lebat', 'Informasi peringatan dini diteruskan ke kelurahan'] },
                { area: 'Gedongtengen', items: ['Aktivitas wisata dan transportasi perlu mitigasi gangguan', 'Pohon peneduh jalan dipantau berkala', 'Petugas lapangan disiagakan saat prakiraan hujan ekstrem'] },
                { area: 'Kraton', items: ['Kawasan heritage dipantau dari dampak angin dan hujan', 'Koordinasi pembersihan akses wisata dilakukan', 'Laporan warga menjadi kanal validasi kejadian'] }
            ],
            progress: 39,
            contact: 'BPBD Kota Yogyakarta'
        },
        {
            title: 'Rekap Risiko Terendah Sleman',
            image: 'https://picsum.photos/seed/sleman-northern-yogyakarta-report/1200/560',
            time: '31 Des 2025 · 15.20 WIB',
            status: 'Selesai',
            statusClass: 'tw-border-green-700/50 tw-bg-green-900/50 tw-text-green-400',
            borderClass: 'tw-border-l-cyan-400',
            location: 'Kapanewon se-Sleman · Kabupaten Sleman',
            desc: 'Sleman menjadi wilayah dengan jumlah kejadian paling rendah, yaitu 80 kejadian. Rekap ini tetap perlu dibaca sebagai jumlah kejadian, bukan ukuran korban maupun kerusakan, sehingga pemantauan cuaca ekstrem dan kerentanan wilayah tetap menjadi konteks penting.',
            impactCards: [
                { area: 'Cangkringan', items: ['Kesiapsiagaan cuaca ekstrem tetap menjadi pemantauan utama', 'Jalur evakuasi dan titik kumpul dipantau berkala', 'Informasi resmi kebencanaan menjadi rujukan lapangan'] },
                { area: 'Pakem', items: ['Cuaca ekstrem dan lereng perbukitan menjadi perhatian', 'Kesiapan relawan dan barak dipertahankan', 'Peringatan dini diteruskan ke komunitas lereng'] },
                { area: 'Depok', items: ['Kepadatan aktivitas perkotaan membutuhkan respons cepat', 'Kejadian cuaca ekstrem dipantau pada koridor jalan utama', 'Koordinasi kampus dan fasilitas umum diperkuat'] },
                { area: 'Prambanan', items: ['Area timur Sleman dipantau untuk hujan dan angin', 'Koordinasi dengan wilayah perbatasan dilakukan', 'Akses wisata perlu kesiapsiagaan saat cuaca buruk'] }
            ],
            progress: 22,
            contact: 'BPBD Kabupaten Sleman'
        },
        {
            title: 'Karhutla dan Gempa Terasa DIY',
            image: 'https://picsum.photos/seed/forest-fire-smoke-indonesia/1200/560',
            time: '31 Des 2025 · 12.00 WIB',
            status: 'Pemantauan',
            statusClass: 'tw-border-amber-700/50 tw-bg-amber-900/50 tw-text-amber-400',
            borderClass: 'tw-border-l-violet-400',
            location: 'Daerah Istimewa Yogyakarta',
            desc: 'Karhutla tercatat 24 kejadian dan gempa terasa 19 kejadian pada rekap tahunan. Keduanya menjadi bagian dari pemantauan lintas kabupaten/kota DIY karena dampaknya bisa menyebar cepat dan membutuhkan koordinasi lintas sektor.',
            impactCards: [
                { area: 'Karhutla Kulon Progo', items: ['Area perbukitan dan lahan kering menjadi prioritas', 'Asap dan penjalaran api dipantau saat kemarau', 'Koordinasi pemadaman dilakukan dengan relawan lokal'] },
                { area: 'Karhutla Gunungkidul', items: ['Vegetasi kering meningkatkan risiko penjalaran api', 'Akses pemadaman pada wilayah berbukit perlu disiapkan', 'Edukasi pembakaran lahan menjadi fokus pencegahan'] },
                { area: 'Gempa Terasa Bantul', items: ['Wilayah selatan tetap perlu kesiapsiagaan gempa', 'Edukasi drop-cover-hold diperkuat pada fasilitas umum', 'Pelaporan kerusakan cepat menjadi prioritas pascagempa'] },
                { area: 'Gempa Terasa DIY', items: ['Koordinasi BMKG menjadi rujukan informasi resmi', 'Pemeriksaan bangunan dilakukan bila ada getaran signifikan', 'Informasi publik perlu bebas dari rumor dan kepanikan'] }
            ],
            progress: 18,
            contact: 'BPBD DIY'
        }
    ];
    const statLabels = ['Korban Jiwa', 'Luka-luka', 'Pengungsi', 'Kerugian'];
    return `
        <div class="tw-space-y-4">
            ${events.map((ev, idx) => {
                return `
                    <article class="stat-animate tw-opacity-0 tw-translate-y-4 tw-overflow-hidden tw-rounded-2xl tw-border tw-border-slate-700/50 tw-bg-slate-800/60 tw-shadow-xl tw-shadow-black/20 tw-transition-all tw-duration-500 hover:tw-scale-[1.01] hover:-tw-translate-y-1">
                        <div class="tw-relative tw-h-48 tw-overflow-hidden">
                            <img src="${ev.image}" alt="${ev.title}" class="tw-h-full tw-w-full tw-object-cover" loading="lazy" onerror="this.onerror=null;this.src='https://picsum.photos/seed/disaster-indonesia-nature/1200/560';">
                            <div class="tw-absolute tw-inset-0 tw-bg-gradient-to-t tw-from-slate-950 tw-via-slate-950/45 tw-to-transparent"></div>
                            <div class="tw-absolute tw-left-5 tw-right-5 tw-top-5 tw-flex tw-items-start tw-justify-between tw-gap-3">
                                <div class="tw-rounded-full tw-bg-orange-500/20 tw-px-3 tw-py-1 tw-font-mono tw-text-xs tw-font-bold tw-text-orange-300">${ev.time}</div>
                                <span class="tw-rounded-full tw-border tw-px-3 tw-py-1 tw-text-xs tw-font-bold ${ev.statusClass}">${ev.status}</span>
                            </div>
                            <div class="tw-absolute tw-bottom-5 tw-left-5 tw-right-5">
                                <h4 class="tw-m-0 tw-font-display tw-text-3xl tw-font-bold tw-text-white">${ev.title}</h4>
                                <div class="tw-mt-1 tw-text-sm tw-font-medium tw-text-slate-200">${ev.location}</div>
                            </div>
                        </div>
                        <div class="tw-p-6">
                        <p class="tw-text-sm tw-leading-relaxed tw-text-slate-300">${ev.desc}</p>
                        ${ev.impactCards ? `
                            <div class="tw-mt-6 tw-grid tw-grid-cols-1 tw-gap-3 md:tw-grid-cols-2">
                                ${ev.impactCards.map((item, areaIdx) => `
                                    <div class="tw-rounded-xl tw-border-l-4 ${['tw-border-l-blue-400','tw-border-l-amber-400','tw-border-l-emerald-400','tw-border-l-orange-400','tw-border-l-red-400'][areaIdx % 5]} tw-bg-slate-800/60 tw-p-4">
                                        <h5 class="tw-mb-2 tw-font-ui tw-text-sm tw-font-bold tw-text-amber-400">${item.area}</h5>
                                        <ul class="tw-space-y-1.5">
                                            ${item.items.map((impact) => `<li class="tw-flex tw-items-start tw-gap-2 tw-text-xs tw-leading-relaxed tw-text-slate-300"><span class="tw-mt-1.5 tw-h-1.5 tw-w-1.5 tw-flex-none tw-rounded-full tw-bg-amber-500"></span><span>${impact}</span></li>`).join('')}
                                        </ul>
                                    </div>`).join('')}
                            </div>` : `
                            <div class="tw-mt-4 tw-grid tw-grid-cols-2 tw-gap-3 md:tw-grid-cols-4">
                                ${ev.stats.map((value, statIdx) => `
                                    <div class="tw-rounded-xl tw-border tw-border-slate-700/70 tw-bg-slate-900/70 tw-p-3">
                                        <span class="tw-block tw-text-[10px] tw-font-bold tw-uppercase tw-tracking-wider tw-text-slate-500">${statLabels[statIdx]}</span>
                                        <strong class="tw-mt-1 tw-block tw-font-mono tw-text-lg tw-text-amber-300">${value}</strong>
                                    </div>`).join('')}
                            </div>`}
                        <div class="tw-mt-6">
                            <div class="tw-mb-1 tw-flex tw-justify-between tw-text-xs">
                                <span class="tw-text-slate-400">Kapasitas barak / kesiapan posko</span>
                                <span class="tw-text-slate-200">${ev.progress}%</span>
                            </div>
                            <div class="tw-h-2 tw-overflow-hidden tw-rounded-full tw-bg-white/10">
                                <div class="tw-h-full tw-rounded-full tw-bg-amber-400 tw-shadow-[0_0_14px_rgba(251,191,36,0.35)]" style="width:${ev.progress}%"></div>
                            </div>
                        </div>
                        <div class="tw-mt-4 tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3 tw-border-t tw-border-white/10 tw-pt-4">
                            <div class="tw-text-xs tw-text-slate-400">
                                Kontak BPBD: <span class="tw-font-semibold tw-text-slate-200">${ev.contact}</span>
                            </div>
                            <button type="button" class="tw-rounded-lg tw-border tw-border-amber-500/30 tw-bg-amber-500/10 tw-px-4 tw-py-2 tw-text-xs tw-font-bold tw-text-amber-300 hover:tw-bg-amber-500/20 hover:tw-brightness-110 active:tw-scale-95 tw-transition-all tw-duration-150">Lihat Detail</button>
                        </div>
                        </div>
                    </article>`;
            }).join('')}
        </div>`;
}

function renderContactCards() {
    const contacts = [
        { name: 'BPBD DIY', detail: 'Pusat informasi dan koordinasi kebencanaan DIY', phone: '(0274) 555584' },
        { name: 'BNPB', detail: 'Pusat Data, Informasi dan Komunikasi Kebencanaan', phone: '117' },
        { name: 'BMKG', detail: 'Informasi cuaca, iklim, dan gempa bumi', phone: '(021) 196' },
        { name: 'Basarnas Yogyakarta', detail: 'Pencarian dan pertolongan darurat', phone: '115' },
        { name: 'Pemadam Kebakaran', detail: 'Respons kebakaran dan penyelamatan kota/kabupaten', phone: '113' },
        { name: 'Panggilan Darurat Nasional', detail: 'Nomor tunggal kegawatdaruratan', phone: '112' }
    ];
    return contacts.map((c) => `
        <article class="stat-animate tw-opacity-0 tw-translate-y-4 tw-flex tw-gap-3 tw-rounded-2xl tw-border tw-border-slate-700/50 tw-bg-slate-800/60 tw-p-5 tw-shadow-xl tw-shadow-black/20 tw-transition-all tw-duration-500 hover:tw-scale-[1.01] hover:-tw-translate-y-1">
            <div class="tw-grid tw-h-10 tw-w-10 tw-flex-none tw-place-items-center tw-rounded-xl tw-border tw-border-cyan-400/20 tw-bg-cyan-400/10 tw-font-mono tw-text-xs tw-font-black tw-text-cyan-200">${c.name.slice(0, 2).toUpperCase()}</div>
            <div>
                <h4 class="tw-m-0 tw-font-display tw-text-base tw-font-bold tw-text-slate-100">${c.name}</h4>
                <p class="tw-mt-2 tw-text-sm tw-leading-relaxed tw-text-slate-400">${c.detail}</p>
                <a class="tw-mt-3 tw-inline-flex tw-rounded-lg tw-border tw-border-amber-500/30 tw-bg-amber-500/10 tw-px-3 tw-py-2 tw-text-xs tw-font-bold tw-text-amber-300 hover:tw-bg-amber-500/20" href="tel:${String(c.phone).replace(/[^\d+]/g, '')}">${c.phone}</a>
            </div>
        </article>`).join('');
}

function animateReportSections(container) {
    container.querySelectorAll('.stat-animate').forEach((el, idx) => {
        setTimeout(() => {
            el.classList.remove('tw-opacity-0', 'tw-translate-y-4');
            el.classList.add('tw-opacity-100', 'tw-translate-y-0');
        }, 80 + idx * 100);
    });
}

export function initReportPage() {
    const container = document.getElementById('laporan-content');
    if (!container) return;

    const high = highestRegion();
    const low = lowestRegion();
    const dominant = dominantDisasterType();

    container.innerHTML = `
        <section class="tw-mb-8 tw-grid tw-grid-cols-1 tw-gap-4 md:tw-grid-cols-2 xl:tw-grid-cols-4">
            <article class="stat-animate tw-opacity-0 tw-translate-y-4 tw-rounded-2xl tw-border tw-border-slate-700/50 tw-bg-slate-800/60 tw-p-5 tw-shadow-xl tw-shadow-black/20 tw-transition-all tw-duration-500 hover:tw-scale-[1.02] hover:-tw-translate-y-1">
                <div class="tw-text-xs tw-font-semibold tw-uppercase tw-tracking-[0.18em] tw-text-slate-400">Total Kejadian</div>
                <div class="tw-mt-3 tw-font-mono tw-text-3xl tw-font-bold tw-text-amber-300">${fmt(DISASTER_2025_TOTAL)}</div>
                <p class="tw-mt-2 tw-text-sm tw-text-slate-400">Daerah Istimewa Yogyakarta</p>
            </article>
            <article class="stat-animate tw-opacity-0 tw-translate-y-4 tw-rounded-2xl tw-border tw-border-slate-700/50 tw-bg-slate-800/60 tw-p-5 tw-shadow-xl tw-shadow-black/20 tw-transition-all tw-duration-500 hover:tw-scale-[1.02] hover:-tw-translate-y-1">
                <div class="tw-text-xs tw-font-semibold tw-uppercase tw-tracking-[0.18em] tw-text-slate-400">Tertinggi</div>
                <div class="tw-mt-3 tw-font-mono tw-text-3xl tw-font-bold tw-text-amber-300">${shortRegionName(high.kab_kota)}</div>
                <p class="tw-mt-2 tw-text-sm tw-text-slate-400">${fmt(high.jumlah_kejadian)} kejadian</p>
            </article>
            <article class="stat-animate tw-opacity-0 tw-translate-y-4 tw-rounded-2xl tw-border tw-border-slate-700/50 tw-bg-slate-800/60 tw-p-5 tw-shadow-xl tw-shadow-black/20 tw-transition-all tw-duration-500 hover:tw-scale-[1.02] hover:-tw-translate-y-1">
                <div class="tw-text-xs tw-font-semibold tw-uppercase tw-tracking-[0.18em] tw-text-slate-400">Terendah</div>
                <div class="tw-mt-3 tw-font-mono tw-text-3xl tw-font-bold tw-text-amber-300">${shortRegionName(low.kab_kota)}</div>
                <p class="tw-mt-2 tw-text-sm tw-text-slate-400">${fmt(low.jumlah_kejadian)} kejadian</p>
            </article>
            <article class="stat-animate tw-opacity-0 tw-translate-y-4 tw-rounded-2xl tw-border tw-border-slate-700/50 tw-bg-slate-800/60 tw-p-5 tw-shadow-xl tw-shadow-black/20 tw-transition-all tw-duration-500 hover:tw-scale-[1.02] hover:-tw-translate-y-1">
                <div class="tw-text-xs tw-font-semibold tw-uppercase tw-tracking-[0.18em] tw-text-slate-400">Dominan</div>
                <div class="tw-mt-3 tw-font-mono tw-text-3xl tw-font-bold tw-text-amber-300">${DISASTER_TYPE_LABELS[dominant.key]}</div>
                <p class="tw-mt-2 tw-text-sm tw-text-slate-400">${fmt(dominant.value)} kejadian</p>
            </article>
        </section>

        <section class="tw-mb-8 tw-grid tw-grid-cols-1 tw-gap-5 xl:tw-grid-cols-2">
            <article class="stat-animate tw-opacity-0 tw-translate-y-4 tw-rounded-2xl tw-border tw-border-slate-700/50 tw-bg-slate-800/60 tw-p-6 tw-shadow-xl tw-shadow-black/20 tw-transition-all tw-duration-500 hover:tw-scale-[1.01] hover:-tw-translate-y-1">
                <h3 class="tw-m-0 tw-font-ui tw-text-base tw-font-bold tw-text-amber-400">Catatan Analisis</h3>
                <p class="tw-mt-3 tw-font-body tw-text-sm tw-leading-relaxed tw-text-slate-300">Data menampilkan jumlah kejadian bencana yang tercatat oleh BPBD DIY, bukan jumlah korban jiwa maupun estimasi kerugian material.</p>
                <p class="tw-mt-2 tw-font-body tw-text-sm tw-leading-relaxed tw-text-slate-300">Tingkat risiko setiap wilayah ditentukan berdasarkan akumulasi total kejadian seluruh jenis bencana per kabupaten/kota selama periode Januari-Desember 2025.</p>
            </article>
            <article class="stat-animate tw-opacity-0 tw-translate-y-4 tw-rounded-2xl tw-border tw-border-slate-700/50 tw-bg-slate-800/60 tw-p-6 tw-shadow-xl tw-shadow-black/20 tw-transition-all tw-duration-500 hover:tw-scale-[1.01] hover:-tw-translate-y-1">
                <h3 class="tw-m-0 tw-font-ui tw-text-base tw-font-bold tw-text-amber-400">Jenis Kejadian Dianalisis</h3>
                <div class="tw-mt-4 tw-flex tw-flex-wrap tw-gap-2">
                    ${DISASTER_TYPE_KEYS.map((key) => `<span class="tw-rounded-full tw-border tw-border-amber-500/20 tw-bg-slate-900/60 tw-px-3 tw-py-1.5 tw-font-ui tw-text-xs tw-font-semibold tw-text-slate-100">${DISASTER_TYPE_LABELS[key]}</span>`).join('')}
                </div>
            </article>
        </section>

        <section class="tw-mb-8">
            <div class="report-table-head tw-mb-3">
                <h3>Riwayat Bencana</h3>
                <p>Riwayat tematik mengikuti jenis kejadian dan wilayah paling menonjol pada rekap 2025.</p>
            </div>
            ${renderHistoryTimeline()}
        </section>

        <section class="tw-mb-4">
            <div class="report-table-head tw-mb-3">
                <h3>Pusat Kontak Darurat</h3>
                <p>Kontak rujukan untuk informasi dan respons kedaruratan kebencanaan.</p>
            </div>
            <div class="tw-grid tw-grid-cols-1 tw-gap-4 md:tw-grid-cols-2">${renderContactCards()}</div>
        </section>
        <button type="button" id="laporan-chatbot-btn" class="tw-fixed tw-bottom-6 tw-right-6 tw-z-[850] tw-rounded-full tw-bg-amber-500 tw-px-5 tw-py-3 tw-font-ui tw-text-xs tw-font-bold tw-text-slate-950 tw-shadow-2xl tw-shadow-black/30 tw-transition-all hover:tw-bg-amber-400 active:tw-scale-95">Tanya SIGAJOG</button>
    `;

    container.querySelector('#laporan-chatbot-btn')?.addEventListener('click', () => document.getElementById('chatbot-toggle')?.click());
    animateReportSections(container);
}
