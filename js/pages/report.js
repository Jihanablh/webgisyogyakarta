import { State, CATEGORIES } from '../state.js';

const DISASTER_HISTORY = {
    erupsi: [
        { tanggal: 'Nov 2010', jenis: 'Erupsi Eksplosif', skala: 'VEI-4', wilayah: 'Sleman & Magelang', korban_jiwa: 347, rumah_terdampak: 2682, pengungsi: 410388, kerugian_material: 'Rp 3,56 T', deskripsi: 'Erupsi terbesar Merapi dalam seabad. Awan panas mencapai 15 km. Semua zona KRB III dievakuasi.' },
        { tanggal: 'Jan 2021', jenis: 'Erupsi Effusif', skala: 'VEI-2', wilayah: 'Sleman', korban_jiwa: 0, rumah_terdampak: 0, pengungsi: 1200, kerugian_material: 'Rp 28 M', deskripsi: 'Guguran lava pijar mencapai 3 km ke arah barat daya. Hujan abu tipis di Sleman selatan.' },
        { tanggal: 'Jun 2006', jenis: 'Erupsi Effusif', skala: 'VEI-2', wilayah: 'Sleman', korban_jiwa: 2, rumah_terdampak: 0, pengungsi: 25000, kerugian_material: 'Rp 64 M', deskripsi: 'Bersamaan dengan gempa Yogyakarta. Awan panas kecil ke arah selatan.' },
    ],
    banjir: [
        { tanggal: 'Mar 2023', jenis: 'Banjir Bandang', skala: 'Sedang', wilayah: 'Bantul (Opak)', korban_jiwa: 0, rumah_terdampak: 312, pengungsi: 890, kerugian_material: 'Rp 4,2 M', deskripsi: 'Luapan Sungai Opak akibat intensitas hujan tinggi selama 6 jam berturut-turut.' },
        { tanggal: 'Jan 2022', jenis: 'Banjir Genangan', skala: 'Ringan', wilayah: 'Kota Yogyakarta', korban_jiwa: 0, rumah_terdampak: 178, pengungsi: 220, kerugian_material: 'Rp 1,8 M', deskripsi: 'Drainase kota tak mampu menampung debit hujan. Beberapa ruas jalan terendam 30–80 cm.' },
        { tanggal: 'Feb 2021', jenis: 'Banjir Lahar', skala: 'Berat', wilayah: 'Sleman (Merapi)', korban_jiwa: 1, rumah_terdampak: 58, pengungsi: 140, kerugian_material: 'Rp 7,5 M', deskripsi: 'Material vulkanik Merapi terbawa hujan membentuk lahar dingin di Kali Boyong dan Kali Kuning.' },
    ],
    gempa: [
        { tanggal: '27 Mei 2006', jenis: 'Gempa Tektonik', skala: 'M 6.3', wilayah: 'Bantul', korban_jiwa: 5782, rumah_terdampak: 127000, pengungsi: 600000, kerugian_material: 'Rp 29,1 T', deskripsi: 'Gempa paling mematikan dalam sejarah modern DIY. Episentrum 10 km selatan Bantul, kedalaman 17 km.' },
        { tanggal: 'Jun 2022', jenis: 'Gempa Tektonik', skala: 'M 5.1', wilayah: 'Gunung Kidul', korban_jiwa: 0, rumah_terdampak: 45, pengungsi: 0, kerugian_material: 'Rp 320 jt', deskripsi: 'Guncangan terasa hingga Kota Yogyakarta. Beberapa rumah tua di Wonosari rusak ringan.' },
    ],
    longsor: [
        { tanggal: 'Feb 2020', jenis: 'Tanah Longsor', skala: 'Besar', wilayah: 'Kulon Progo', korban_jiwa: 3, rumah_terdampak: 22, pengungsi: 60, kerugian_material: 'Rp 2,1 M', deskripsi: 'Lereng bukit di Kokap longsor setelah hujan 3 hari berturut-turut. Jalan penghubung desa terputus.' },
        { tanggal: 'Jan 2023', jenis: 'Tanah Longsor', skala: 'Sedang', wilayah: 'Gunung Kidul', korban_jiwa: 0, rumah_terdampak: 8, pengungsi: 15, kerugian_material: 'Rp 450 jt', deskripsi: 'Longsoran material tanah dan batu menutup akses jalan di Kecamatan Panggang.' },
    ],
};

let _initialized = false;

export function initReportPage() {
    renderLaporan('erupsi');
    if (_initialized) return;
    _initialized = true;
    document.querySelectorAll('.page-tab[data-disaster]').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.page-tab[data-disaster]').forEach(t => t.classList.remove('active'));
            e.currentTarget.classList.add('active');
            renderLaporan(e.currentTarget.dataset.disaster);
        });
    });
}

function renderLaporan(disasterType) {
    const content = document.getElementById('laporan-content');
    if (!content) return;
    const hist = DISASTER_HISTORY[disasterType] || [];
    const totalKorban    = hist.reduce((s, h) => s + (h.korban_jiwa      || 0), 0);
    const totalPengungsi = hist.reduce((s, h) => s + (h.pengungsi        || 0), 0);
    const accentMap = { erupsi: '#ef4444', banjir: '#3b82f6', gempa: '#ea580c', longsor: '#ca8a04' };
    const accentColor = accentMap[disasterType] || '#ef4444';

    content.innerHTML = `
    <div style="display:grid;grid-template-columns:260px 1fr;gap:28px;align-items:start;">
        <div style="display:flex;flex-direction:column;gap:14px;position:sticky;top:80px;">
            <div style="background:#161b22;border-left:3px solid ${accentColor};border-radius:8px;padding:16px;">
                <div style="font-size:30px;font-weight:700;color:${accentColor};">${totalKorban.toLocaleString()}</div>
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);margin-top:4px;">Korban Jiwa</div>
            </div>
            <div style="background:#161b22;border-left:3px solid ${accentColor};border-radius:8px;padding:16px;">
                <div style="font-size:30px;font-weight:700;color:${accentColor};">${totalPengungsi.toLocaleString()}</div>
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);margin-top:4px;">Total Pengungsi</div>
            </div>
            <div style="background:#161b22;border-left:3px solid ${accentColor};border-radius:8px;padding:16px;">
                <div style="font-size:22px;font-weight:700;color:${accentColor};">${hist[0] ? hist[0].kerugian_material : '-'}</div>
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);margin-top:4px;">Kerugian (Terkini)</div>
            </div>
        </div>
        <div style="border-left:1px solid #30363d;padding-left:24px;display:flex;flex-direction:column;gap:20px;">
            ${hist.length === 0
                ? '<p style="color:var(--text-muted)">Belum ada data riwayat tercatat.</p>'
                : hist.map(h => `
                <div style="position:relative;background:rgba(30,41,59,0.3);border:1px solid var(--border-glass);border-radius:12px;padding:20px;transition:all 0.25s;" onmouseover="this.style.background='#1c2128';this.style.transform='translateX(4px)'" onmouseout="this.style.background='rgba(30,41,59,0.3)';this.style.transform='translateX(0)'">
                    <div style="position:absolute;left:-29px;top:24px;width:10px;height:10px;border-radius:50%;background:${accentColor};border:2px solid #0a0e1a;"></div>
                    <div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:6px;">${h.tanggal}</div>
                    <div style="font-size:17px;font-weight:700;color:var(--text-primary);margin-bottom:6px;">${h.jenis} <span style="font-size:11px;padding:2px 8px;background:rgba(255,255,255,0.1);border-radius:10px;margin-left:6px;vertical-align:middle;">${h.skala || h.wilayah}</span></div>
                    <div style="font-size:13px;color:var(--text-secondary);margin-bottom:10px;">${h.korban_jiwa ? h.korban_jiwa + ' korban · ' : ''}${h.pengungsi ? h.pengungsi.toLocaleString() + ' mengungsi · ' : ''}${h.kerugian_material || ''}</div>
                    <p style="font-size:13px;line-height:1.6;color:var(--text-muted);">${h.deskripsi}</p>
                </div>`).join('')}
        </div>
    </div>`;
}
