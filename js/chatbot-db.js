// ============================================================
// SIGAJOG — Chatbot Database Engine
// Sistem tanya-jawab lokal berbasis keyword matching
// ============================================================

import { queryGeoKnowledge } from './geo-index.js';

export const CHATBOT_DB = {

  kebencanaan: [
    { id:'kb_001', keywords:['bencana','jenis','apa saja','macam','tipe','ancaman','ada apa'],
      answer:`DIY memiliki 4 ancaman bencana utama:\n- Erupsi Merapi — paling aktif, KRB III radius 0-3 km sangat berbahaya\n- Gempa Bumi — sesar Opak aktif, pernah M6.3 tahun 2006\n- Banjir — kali Code, Winongo, Gajah Wong meluap saat hujan ekstrem\n- Tanah Longsor — lereng Merapi dan perbukitan Menoreh` },
    { id:'kb_002', keywords:['risiko','tingkat','level','zona','bahaya','kelas','warna'],
      answer:`Tingkat risiko bencana DIY dibagi 4 level:\n- SANGAT TINGGI (merah) — KRB III Merapi, sempadan sungai\n- TINGGI (oranye) — KRB II Merapi, lereng curam\n- SEDANG (kuning) — KRB I Merapi, dataran rendah rawan banjir\n- RENDAH (hijau) — wilayah aman relatif` },
  ],

  merapi: [
    { id:'mp_001', keywords:['merapi','gunung','erupsi','vulkanik','lahar','awan panas','letusan'],
      answer:`Gunung Merapi (2.930 mdpl) adalah gunung api paling aktif di Indonesia.\n- Status saat ini: Siaga (Level III)\n- KRB III: radius 3 km dari puncak — DILARANG aktivitas\n- KRB II: radius 3-7 km — waspada tinggi\n- KRB I: radius 7-10 km — waspada\n- Ancaman utama: awan panas, lahar hujan, abu vulkanik` },
    { id:'mp_002', keywords:['lahar','hujan','aliran','sungai','kali','merapi','code','gendol'],
      answer:`Lahar hujan Merapi mengalir melalui:\n- Kali Gendol — jalur utama lahar, Sleman timur\n- Kali Boyong / Code — melewati kota Yogyakarta\n- Kali Woro — Klaten\n- Kali Putih — Magelang\nBahaya lahar terjadi saat hujan deras di puncak meski tidak erupsi.` },
    { id:'mp_003', keywords:['status','siaga','waspada','awas','normal','level merapi','bpptkg','aktivitas'],
      answer:`Level aktivitas Merapi (BPPTKG):\n- Normal (I) — aktivitas biasa, aman\n- Waspada (II) — peningkatan aktivitas, radius 3 km steril\n- Siaga (III) — SAAT INI AKTIF, radius 7 km waspada\n- Awas (IV) — darurat, radius 10 km evakuasi\n\nPantau real-time: magma.esdm.go.id atau BPPTKG (0274) 514180` },
  ],

  gempa: [
    { id:'gm_001', keywords:['gempa','bumi','earthquake','sesar','opak','getaran','seismik','subduksi'],
      answer:`DIY terletak di zona seismik aktif:\n- Sesar Opak — memanjang dari Prambanan ke Parangtritis (N-S)\n- Subduksi Lempeng Indo-Australia — 250 km di selatan Jogja\n- Gempa besar terakhir: 27 Mei 2006, M6.3, korban 5.782 jiwa\n\nWilayah paling berisiko: Bantul selatan, Prambanan, Berbah` },
    { id:'gm_002', keywords:['gempa','saat','terjadi','harus','lakukan','prosedur','tips','apa yang'],
      answer:`Saat gempa berlangsung:\n1. JANGAN panik — merunduk, berlindung, pegang erat (Drop-Cover-Hold)\n2. Di dalam gedung: berlindung di bawah meja kuat, jauh dari jendela\n3. Di luar: menjauh dari gedung, pohon, tiang listrik\n4. Di jalan: berhenti, keluar mobil, jauhi jembatan\n\nSetelah gempa: waspada gempa susulan, jangan masuk bangunan retak` },
  ],

  banjir: [
    { id:'bj_001', keywords:['banjir','genangan','meluap','kali','code','winongo','gajah wong','kanal','sungai'],
      answer:`Wilayah paling rawan banjir di DIY:\n- Bantul — hilir Kali Code, Winongo, Opak\n- Kota Yogyakarta — sempadan Kali Code dan Winongo\n- Sleman — Kali Kuning, Kali Gendol (lahar)\n- Kulon Progo — Kali Progo bagian bawah\n\nMusim waspada: November–April (puncak Desember–Februari)` },
    { id:'bj_002', keywords:['banjir','evakuasi','mengungsi','lari','melarikan','saat banjir','prosedur banjir'],
      answer:`Saat banjir datang:\n1. Pindahkan barang berharga ke lantai atas\n2. Matikan listrik di panel utama\n3. Evakuasi ke titik kumpul terdekat\n4. Bawa: dokumen penting, obat-obatan, baju ganti, air minum\n5. Hubungi BPBD: (0274) 586111` },
  ],

  longsor: [
    { id:'ls_001', keywords:['longsor','tanah','gerakan','lereng','bukit','kulon progo','kokap','menoreh'],
      answer:`Zona rawan longsor tinggi di DIY:\n- Lereng Merapi (Sleman utara) — terutama pasca erupsi\n- Perbukitan Menoreh (Kulon Progo) — Kokap, Girimulyo\n- Perbukitan Gunung Kidul — Pathuk, Gedangsari, Nglipar\n\nWaspada saat hujan >100mm/hari atau berlangsung >3 jam terus-menerus` },
  ],

  pengungsian: [
    { id:'pu_001', keywords:['pengungsian','tempat','lokasi','shelter','kamp','evakuasi','mengungsi','barak','posko'],
      answer:`Titik pengungsian utama di DIY:\n- Sleman: GOR Tridadi, Stadion Maguwoharjo, Barak Cangkringan\n- Kota Yogya: GOR Among Raga, Stadion Mandala Krida\n- Bantul: GOR Rahmatan Lil Alamin, Lapangan Sultan Agung\n- Kulon Progo: GOR Binangun, Stadion Cangkring\n- Gunung Kidul: GOR Siyono, Lapangan Pemda\n\nCek di peta: klik marker pengungsian untuk detail kapasitas` },
    { id:'pu_002', keywords:['kapasitas','pengungsi','jumlah','penuh','tersedia','slot','berapa'],
      answer:`Total kapasitas pengungsian DIY: ±45.000 jiwa\n\nBreakdown per kabupaten:\n- Sleman: ±18.000 jiwa (terbesar, dekat Merapi)\n- Bantul: ±12.000 jiwa\n- Kota Yogyakarta: ±5.000 jiwa\n- Kulon Progo: ±6.000 jiwa\n- Gunung Kidul: ±4.000 jiwa\n\nStatus real-time: BPBD (0274) 586111` },
    { id:'pu_003', keywords:['fasilitas','pengungsian','ada apa','tersedia','mck','toilet','makanan','medis','air'],
      answer:`Fasilitas standar tempat pengungsian DIY:\n- MCK (toilet & kamar mandi)\n- Dapur umum & distribusi makanan\n- Listrik darurat (genset)\n- Air bersih (PDAM atau tandon)\n- Pos kesehatan & pertolongan pertama\n- Area tidur (matras/kasur lipat)\n- Posko informasi keluarga` },
  ],

  evakuasi: [
    { id:'ev_001', keywords:['jalur','evakuasi','rute','jalan','keluar','arah','escape','route'],
      answer:`Jalur evakuasi utama DIY:\n\nMerapi ke selatan:\n- Jalur Barat: Turi → Sleman → Ring Road Barat\n- Jalur Tengah: Cangkringan → Kalasan → Kota\n- Jalur Timur: Kemalang → Prambanan → Klaten\n\nBanjir kota Jogja:\n- Evakuasi ke timur: jauhi sempadan Code/Winongo\n- Titik kumpul: Alun-alun Utara, Alun-alun Selatan\n\nRambu evakuasi: tanda panah biru di jalan utama` },
    { id:'ev_002', keywords:['early warning','peringatan','sirine','alarm','tanda','sinyal','isyarat','bunyi'],
      answer:`Sistem peringatan dini DIY:\n\nMerapi: Sirine di 28 titik lereng\n- 1 kali panjang: tes rutin setiap Jumat 00.00\n- 3 kali pendek berulang: BAHAYA, evakuasi segera\n\nBPBD DIY: SMS blast ke warga zona merah\nBMKG: Notifikasi gempa & cuaca ekstrem\nRadio: RRI Pro 1 Yogyakarta (91.1 FM)\nMedia sosial: @BPBDJogja, @MerapiMagma` },
  ],

  kontak: [
    { id:'kt_001', keywords:['kontak','telepon','nomor','hubungi','bpbd','darurat','call','emergency','112'],
      answer:`Kontak darurat kebencanaan DIY:\n\n- BPBD DIY: (0274) 586111 / 562916\n- BASARNAS DIY: (0274) 486110\n- PMI DIY: (0274) 512126\n- RSUP Dr. Sardjito: (0274) 587333\n- Polda DIY: (0274) 512111\n- Damkar Kota Yogya: (0274) 382883\n- PLN (gangguan): 123\n- PDAM (darurat): (0274) 589078\n\nNomor darurat nasional: 112 (gratis dari HP)` },
    { id:'kt_002', keywords:['bpbd','tugas','fungsi','peran','alamat','kantor'],
      answer:`BPBD (Badan Penanggulangan Bencana Daerah) DIY:\n- Koordinasi penanggulangan bencana di DIY\n- Aktivasi posko darurat saat bencana\n- Distribusi logistik dan bantuan\n- Pengelolaan tempat pengungsian\n\nKantor: Jl. Kenari No.14A, Semaki, Umbulharjo\nLayanan: 24 jam (posko siaga)\nWebsite: bpbd.jogjaprov.go.id` },
  ],

  wisata: [
    { id:'ws_001', keywords:['wisata','tempat','destinasi','tujuan','kunjungi','objek','tourism','liburan'],
      answer:`Destinasi wisata populer Yogyakarta:\n\nBudaya & Sejarah:\n- Kraton Yogyakarta — pusat budaya Jawa, buka 08.00-14.00\n- Candi Prambanan — candi Hindu terbesar di Indonesia\n- Kotagede — pusat kerajinan perak historis\n\nAlam:\n- Kaliurang — resort pegunungan lereng Merapi\n- Pantai Parangtritis — pantai ikonik selatan Jogja\n- Goa Pindul — wisata susur goa (Gunung Kidul)` },
    { id:'ws_002', keywords:['kuliner','makanan','makan','khas','food','restoran','gudeg','bakpia','angkringan'],
      answer:`Kuliner wajib coba di Yogyakarta:\n- Gudeg — nangka muda dimasak santan, ikon Jogja\n- Bakpia Pathuk — oleh-oleh legendaris sejak 1948\n- Angkringan — warung kaki lima ikonik, nasi kucing Rp2.000\n- Wedang Ronde — minuman hangat khas malam hari\n- Mie Lethek Bantul — mie tradisional dari tepung aren\n- Pecel Senggol — sayuran dengan bumbu kacang khas` },
  ],

  transportasi: [
    { id:'tr_001', keywords:['trans jogja','bus','angkutan','transportasi','halte','rute bus','umum','tarif'],
      answer:`Transportasi umum di Yogyakarta:\n\nTrans Jogja (BRT):\n- 17 koridor meliputi seluruh kota\n- Tarif: Rp3.600 (flat)\n- Jam operasi: 05.30–21.30\n- Info rute: transjogja.jogjaprov.go.id\n\nLainnya:\n- Becak: moda tradisional, nego harga\n- Andong: wisata sekitar Malioboro/Kraton\n- GoJek/Grab: tersedia di seluruh DIY\n- Kereta: Stasiun Tugu & Lempuyangan` },
  ],

  aplikasi: [
    { id:'ap_001', keywords:['aplikasi','jogja siaga','fitur','gunakan','cara','ini','tentang','webgis'],
      answer:`JOGJA SIAGA adalah WebGIS kebencanaan DIY.\n\nFitur utama:\n- Peta Kebencanaan — zona risiko bencana interaktif\n- Tata Kelola — fasilitas kota: ATM, RS, transportasi, wisata\n- Statistika — dashboard data kebencanaan DIY\n- Laporan Bencana — riwayat dan analisis kejadian\n- SIGAJOG — asisten informasi lokal ini\n\nData: OpenStreetMap, BPBD DIY, BNPB, BMKG, BPPTKG` },
    { id:'ap_002', keywords:['data','sumber','akurasi','valid','update','diperbarui','kapan'],
      answer:`Sumber data JOGJA SIAGA:\n- OpenStreetMap via HOTOSM — POI dan jalan\n- BPBD DIY — zona bencana dan pengungsian\n- BNPB — risiko bencana nasional\n- BMKG — data cuaca dan gempa\n- BPPTKG — aktivitas Gunung Merapi\n- GADM v4.1 — batas wilayah administrasi\n\nData diperbarui: Januari 2025` },
  ],

  fallback: [
    { id:'fb_001', keywords:[],
      answer:`Maaf, saya belum punya informasi spesifik tentang itu.\n\nSaya bisa bantu tentang:\n- Bencana di Yogyakarta (Merapi, gempa, banjir, longsor)\n- Lokasi dan fasilitas pengungsian\n- Jalur dan prosedur evakuasi\n- Kontak darurat BPBD dan instansi terkait\n- Wisata dan fasilitas kota Yogyakarta\n\nAtau hubungi BPBD DIY langsung: (0274) 586111` }
  ]
};

// ── ENGINE: Keyword Matching ──────────────────────────────────
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
      for (const entry of db[category]) {
        entries.push({ ...entry, category });
      }
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
      'Status Gunung Merapi sekarang?',
      'Di mana tempat pengungsian?',
      'Nomor darurat BPBD DIY',
      'Jalur evakuasi Merapi',
      'Apa yang dilakukan saat gempa?',
      'Wilayah rawan banjir Yogyakarta',
    ];
  }
}
