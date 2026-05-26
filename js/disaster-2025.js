export const DISASTER_2025_SOURCE =
    'BPBD DIY Infografis Kebencanaan Tahunan 2025';

export const DISASTER_2025_PERIOD = '1 Januari 2025 - 31 Desember 2025';
export const DISASTER_2025_ANALYSIS_NOTE =
    'Data menampilkan jumlah kejadian bencana yang tercatat oleh BPBD DIY, bukan jumlah korban jiwa maupun estimasi kerugian material. Tingkat risiko setiap wilayah ditentukan berdasarkan akumulasi total kejadian seluruh jenis bencana per kabupaten/kota selama periode Januari-Desember 2025.';

export const DISASTER_TYPE_KEYS = [
    'cuaca_ekstrem',
    'tanah_longsor',
    'kebakaran_hutan_lahan',
    'gempa_terasa',
    'banjir',
    'kebakaran'
];

export const DISASTER_TYPE_LABELS = {
    cuaca_ekstrem: 'Cuaca Ekstrem',
    tanah_longsor: 'Tanah Longsor',
    kebakaran_hutan_lahan: 'Kebakaran Hutan dan Lahan',
    gempa_terasa: 'Gempa Terasa',
    banjir: 'Banjir',
    kebakaran: 'Kebakaran'
};

export const DISASTER_2025_BY_REGION = [
    {
        provinsi: 'Daerah Istimewa Yogyakarta',
        kab_kota: 'Kabupaten Sleman',
        tahun: 2025,
        periode: DISASTER_2025_PERIOD,
        cuaca_ekstrem: 34,
        tanah_longsor: 22,
        kebakaran_hutan_lahan: 4,
        gempa_terasa: 0,
        banjir: 5,
        kebakaran: 15,
        jumlah_kejadian: 80,
        kelas_risiko: 'Rendah',
        sumber_data: DISASTER_2025_SOURCE,
        catatan: DISASTER_2025_ANALYSIS_NOTE
    },
    {
        provinsi: 'Daerah Istimewa Yogyakarta',
        kab_kota: 'Kota Yogyakarta',
        tahun: 2025,
        periode: DISASTER_2025_PERIOD,
        cuaca_ekstrem: 96,
        tanah_longsor: 27,
        kebakaran_hutan_lahan: 1,
        gempa_terasa: 0,
        banjir: 3,
        kebakaran: 14,
        jumlah_kejadian: 141,
        kelas_risiko: 'Sedang',
        sumber_data: DISASTER_2025_SOURCE,
        catatan: DISASTER_2025_ANALYSIS_NOTE
    },
    {
        provinsi: 'Daerah Istimewa Yogyakarta',
        kab_kota: 'Kabupaten Gunungkidul',
        tahun: 2025,
        periode: DISASTER_2025_PERIOD,
        cuaca_ekstrem: 50,
        tanah_longsor: 127,
        kebakaran_hutan_lahan: 6,
        gempa_terasa: 11,
        banjir: 8,
        kebakaran: 60,
        jumlah_kejadian: 262,
        kelas_risiko: 'Tinggi',
        sumber_data: DISASTER_2025_SOURCE,
        catatan: DISASTER_2025_ANALYSIS_NOTE
    },
    {
        provinsi: 'Daerah Istimewa Yogyakarta',
        kab_kota: 'Kabupaten Bantul',
        tahun: 2025,
        periode: DISASTER_2025_PERIOD,
        cuaca_ekstrem: 53,
        tanah_longsor: 141,
        kebakaran_hutan_lahan: 1,
        gempa_terasa: 6,
        banjir: 9,
        kebakaran: 123,
        jumlah_kejadian: 333,
        kelas_risiko: 'Tinggi',
        sumber_data: DISASTER_2025_SOURCE,
        catatan: DISASTER_2025_ANALYSIS_NOTE
    },
    {
        provinsi: 'Daerah Istimewa Yogyakarta',
        kab_kota: 'Kabupaten Kulon Progo',
        tahun: 2025,
        periode: DISASTER_2025_PERIOD,
        cuaca_ekstrem: 63,
        tanah_longsor: 448,
        kebakaran_hutan_lahan: 12,
        gempa_terasa: 2,
        banjir: 8,
        kebakaran: 25,
        jumlah_kejadian: 558,
        kelas_risiko: 'Sangat Tinggi',
        sumber_data: DISASTER_2025_SOURCE,
        catatan: DISASTER_2025_ANALYSIS_NOTE
    }
];

export const DISASTER_2025_TOTAL = DISASTER_2025_BY_REGION.reduce((sum, item) => sum + item.jumlah_kejadian, 0);

export function getRiskClass(total) {
    if (total > 400) return 'Sangat Tinggi';
    if (total >= 251) return 'Tinggi';
    if (total >= 101) return 'Sedang';
    return 'Rendah';
}

export function riskColor(risk) {
    return {
        Rendah: '#14b8a6',
        Sedang: '#f59e0b',
        Tinggi: '#ef4444',
        'Sangat Tinggi': '#991b1b'
    }[risk] || '#94a3b8';
}

export function shortRegionName(name) {
    return String(name || '')
        .replace(/^Kabupaten\s+/i, '')
        .replace(/^Kota\s+/i, 'Kota ');
}

export function getRegionData(name) {
    return DISASTER_2025_BY_REGION.find((item) => item.kab_kota === name) || null;
}

export function disasterTypeTotals() {
    return Object.fromEntries(
        DISASTER_TYPE_KEYS.map((key) => [
            key,
            DISASTER_2025_BY_REGION.reduce((sum, item) => sum + Number(item[key] || 0), 0)
        ])
    );
}

export function dominantDisasterType() {
    const totals = disasterTypeTotals();
    const [key, value] = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
    return { key, label: DISASTER_TYPE_LABELS[key], value };
}

export function highestRegion() {
    return [...DISASTER_2025_BY_REGION].sort((a, b) => b.jumlah_kejadian - a.jumlah_kejadian)[0];
}

export function lowestRegion() {
    return [...DISASTER_2025_BY_REGION].sort((a, b) => a.jumlah_kejadian - b.jumlah_kejadian)[0];
}
