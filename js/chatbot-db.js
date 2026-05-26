// ============================================================
// SIGAJOG — Chatbot Database Engine
// Sistem tanya-jawab lokal berbasis keyword matching
// ============================================================

import { queryGeoKnowledge } from './geo-index.js?v=20260526-round26-welcome-encoding';

export const CHATBOT_DB = {
  kebencanaan: [
    { id:'kb_001', keywords:['bencana','jenis','apa saja','macam','tipe','kejadian','dominan'],
      answer:`Jenis kejadian kebencanaan DIY tahun 2025 yang dianalisis di JOGJA SIAGA:\n- Tanah Longsor: 765 kejadian\n- Cuaca Ekstrem: 296 kejadian\n- Kebakaran: 237 kejadian\n- Banjir: 33 kejadian\n- Kebakaran Hutan dan Lahan: 24 kejadian\n- Gempa Terasa: 19 kejadian\n\nTotal seluruh kejadian: 1.374 kejadian.` },
    { id:'kb_002', keywords:['risiko','tingkat','kelas','warna','wilayah','kabupaten','kota'],
      answer:`Kelas risiko wilayah dihitung dari total kejadian per kabupaten/kota tahun 2025:\n- Kulon Progo: 558 kejadian — Sangat Tinggi\n- Bantul: 333 kejadian — Tinggi\n- Gunungkidul: 262 kejadian — Tinggi\n- Kota Yogyakarta: 141 kejadian — Sedang\n- Sleman: 80 kejadian — Rendah\n\nData ini menunjukkan jumlah kejadian, bukan jumlah korban atau kerusakan.` },
    { id:'kb_003', keywords:['tertinggi','paling tinggi','rawan','kulon progo','terendah','sleman'],
      answer:`Wilayah dengan kejadian tertinggi adalah Kabupaten Kulon Progo dengan 558 kejadian dan kelas risiko Sangat Tinggi.\n\nWilayah dengan kejadian terendah adalah Kabupaten Sleman dengan 80 kejadian dan kelas risiko Rendah.` },
  ],

  wilayah: [
    { id:'rg_001', keywords:['kulon','progo','kulon progo'],
      answer:`Kabupaten Kulon Progo mencatat 558 kejadian pada periode 1 Januari–31 Desember 2025.\nRinciannya: Cuaca Ekstrem 63, Tanah Longsor 448, Kebakaran Hutan dan Lahan 12, Gempa Terasa 2, Banjir 8, Kebakaran 25.\nKelas risiko: Sangat Tinggi.` },
    { id:'rg_002', keywords:['bantul'],
      answer:`Kabupaten Bantul mencatat 333 kejadian pada 2025.\nRinciannya: Cuaca Ekstrem 53, Tanah Longsor 141, Kebakaran Hutan dan Lahan 1, Gempa Terasa 6, Banjir 9, Kebakaran 123.\nKelas risiko: Tinggi.` },
    { id:'rg_003', keywords:['gunungkidul','gunung kidul'],
      answer:`Kabupaten Gunungkidul mencatat 262 kejadian pada 2025.\nRinciannya: Cuaca Ekstrem 50, Tanah Longsor 127, Kebakaran Hutan dan Lahan 6, Gempa Terasa 11, Banjir 8, Kebakaran 60.\nKelas risiko: Tinggi.` },
    { id:'rg_004', keywords:['kota yogyakarta','yogyakarta','jogja kota'],
      answer:`Kota Yogyakarta mencatat 141 kejadian pada 2025.\nRinciannya: Cuaca Ekstrem 96, Tanah Longsor 27, Kebakaran Hutan dan Lahan 1, Gempa Terasa 0, Banjir 3, Kebakaran 14.\nKelas risiko: Sedang.` },
    { id:'rg_005', keywords:['sleman'],
      answer:`Kabupaten Sleman mencatat 80 kejadian pada 2025.\nRinciannya: Cuaca Ekstrem 34, Tanah Longsor 22, Kebakaran Hutan dan Lahan 4, Gempa Terasa 0, Banjir 5, Kebakaran 15.\nKelas risiko: Rendah.` },
  ],

  pengungsian: [
    { id:'pu_001', keywords:['pengungsian','posko','logistik','shelter','evakuasi','mengungsi','barak'],
      answer:`Data pengungsian yang digunakan JOGJA SIAGA berasal dari file posko_pengungsian_logistik_diy_2025.geojson.\n\nMarker pengungsian di peta menampilkan nama posko, jenis posko, fungsi, kabupaten/kota, kapanewon, kalurahan, alamat, dan koordinat. Klik marker pengungsian di Peta Kebencanaan untuk membuka panel detail posko.` },
    { id:'pu_002', keywords:['fasilitas','dapur','bantuan','makanan','air','medis','fungsi'],
      answer:`Posko pengungsian di JOGJA SIAGA mencakup fungsi seperti perlindungan sementara, dapur umum, distribusi bantuan, dan dukungan logistik. Detail setiap posko mengikuti atribut asli dari GeoJSON pengungsian 2025.` },
  ],

  laporan: [
    { id:'lp_001', keywords:['laporan','riwayat','narasi','cuaca ekstrem','maret'],
      answer:`Halaman Laporan Bencana memuat riwayat tematik 2025, termasuk Cuaca Ekstrem Maret 2025 dan Longsor serta Tanah Ambles November 2025. Narasi disusun untuk menjelaskan konteks kejadian, wilayah terdampak, dan respons lapangan.` },
    { id:'lp_002', keywords:['statistika','grafik','chart','dashboard statistik','rekap'],
      answer:`Halaman Statistika menampilkan KPI, grafik kejadian per wilayah, komposisi jenis bencana, choropleth wilayah, serta tabel rekap kabupaten/kota dan jenis bencana. Gunakan halaman itu untuk membaca pola data secara visual.` },
  ],

  tata_kelola: [
    { id:'tk_001', keywords:['tata kelola','kategori','pariwisata','kesehatan','pendidikan','mobilitas','keuangan','pemerintahan'],
      answer:`Menu Tata Kelola menampilkan kategori lokasi di DIY seperti Pariwisata, Mobilitas, Kesehatan, Pendidikan, Keuangan, dan Pemerintahan. Setiap lokasi memiliki card, detail atribut, gambar, aksi cepat, dan estimasi keramaian mingguan.` },
    { id:'tk_002', keywords:['wisata','destinasi','malioboro','prambanan','parangtritis','candi'],
      answer:`Untuk data wisata, buka Tata Kelola lalu pilih Pariwisata Yogyakarta. Kamu bisa melihat card lokasi, membuka detail, atau menampilkan semua titik lokasi di peta kategori.` },
  ],

  kontak: [
    { id:'kt_001', keywords:['kontak','telepon','nomor','hubungi','bpbd','darurat','call','emergency','112'],
      answer:`Kontak darurat rujukan:\n- BPBD DIY: (0274) 555584\n- BNPB: 117\n- Basarnas: 115\n- Pemadam Kebakaran: 113\n- Darurat Nasional: 112\n\nGunakan nomor darurat bila membutuhkan bantuan cepat di lapangan.` },
  ],

  aplikasi: [
    { id:'ap_001', keywords:['aplikasi','jogja siaga','fitur','gunakan','cara','ini','tentang','webgis'],
      answer:`JOGJA SIAGA adalah WebGIS kebencanaan dan informasi wilayah DIY.\n\nFitur utama:\n- Dashboard overview\n- Peta Kebencanaan 2025\n- Tata Kelola lokasi dan fasilitas\n- Laporan Bencana\n- Statistika kebencanaan\n- SIGAJOG sebagai asisten tanya-jawab lokal` },
    { id:'ap_002', keywords:['data','sumber','akurasi','valid','update','diperbarui','kapan'],
      answer:`Sumber data utama di aplikasi ini mencakup BPBD DIY Infografis Kebencanaan Tahunan 2025, OpenStreetMap via HOTOSM, GeoJSON posko pengungsian logistik DIY 2025, serta batas wilayah administrasi. Periode data kebencanaan: 1 Januari–31 Desember 2025.` },
  ],

  fallback: [
    { id:'fb_001', keywords:[],
      answer:`Maaf, aku belum menemukan jawaban spesifik untuk itu.\n\nAku paling siap membantu tentang:\n- Data kejadian bencana DIY 2025\n- Risiko per kabupaten/kota\n- Posko pengungsian dan logistik\n- Laporan dan statistika kebencanaan\n- Kategori Tata Kelola lokasi di DIY\n\nCoba tanyakan nama wilayah, jenis bencana, atau posko yang ingin kamu lihat.` }
  ]
};

// -- ENGINE: Keyword Matching ----------------------------------
export class ChatbotEngine {
  constructor(db) {
    this.db = db;
    this.allEntries = this._flattenDB(db);
    this._geoIndex = null;
  }

  setGeoIndex(index) {
    this._geoIndex = index;
  }

  _flattenDB(db) {
    const entries = [];
    for (const category of Object.keys(db)) {
      if (category === 'fallback') continue;
      for (const entry of db[category]) entries.push({ ...entry, category });
    }
    return entries;
  }

  _normalize(text) {
    return text.toLowerCase()
      .replace(/[.,?!;:()\[\]{}'"]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  _tokenize(text) {
    const stop = new Set(['yang','di','ke','dari','dan','atau','ini','itu','ada','dengan',
      'untuk','pada','dalam','adalah','saya','kamu','apa','bagaimana','dimana','kapan',
      'siapa','berapa','apakah','tolong','bisa','mohon','info','informasi','tentang',
      'mengenai','tahu','tau','dong','ya','yah','deh','nih','loh','sih','bang','kak',
      'mas','mbak','halo','selamat','pagi','siang','malam','terima','kasih']);
    return this._normalize(text).split(' ').filter(t => t.length > 2 && !stop.has(t));
  }

  search(userInput) {
    if (this._geoIndex) {
      const g = queryGeoKnowledge(this._geoIndex, userInput);
      if (g) return this._humanize(g);
    }
    const tokens = this._tokenize(userInput);
    if (!tokens.length) return this._humanize(this.db.fallback[0].answer);
    let bestScore = 0, bestEntry = null;
    for (const entry of this.allEntries) {
      let score = 0;
      for (const token of tokens) {
        for (const kw of entry.keywords) {
          if (kw === token) { score += 3; continue; }
          if (kw.includes(token) || token.includes(kw)) score += 1;
        }
      }
      if (tokens.some(t => entry.category && entry.category.includes(t))) score += 2;
      if (score > bestScore) { bestScore = score; bestEntry = entry; }
    }
    if (bestScore < 1 || !bestEntry) return this._humanize(this.db.fallback[0].answer);
    return this._humanize(bestEntry.answer);
  }

  _humanize(answer) {
    const openers = [
      'Siap, ini informasi yang paling relevan:',
      'Boleh, ini ringkasan yang bisa kamu pakai:',
      'Oke, aku bantu jelaskan ya:'
    ];
    const idx = Math.floor(Math.random() * openers.length);
    return `${openers[idx]}\n${answer}`;
  }

  getSuggestions() {
    return [
      'Wilayah risiko tertinggi 2025?',
      'Berapa kejadian tanah longsor?',
      'Data Kulon Progo tahun 2025',
      'Di mana data pengungsian?',
      'Apa saja jenis bencana?',
      'Nomor darurat BPBD DIY',
    ];
  }
}
