# JOGJA SIAGA 🗺️
### Sistem Informasi Geografis Kebencanaan Daerah Istimewa Yogyakarta

> *Hamemayu Hayuning Bawana* — Menjaga Keindahan dan Keselamatan Alam

[![Live Demo](https://img.shields.io/badge/Live%20Demo-webgisyogyakarta.vercel.app-gold?style=for-the-badge&logo=vercel)](https://webgisyogyakarta.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Made With](https://img.shields.io/badge/Made%20With-Leaflet.js%20%2B%20Tailwind-green?style=for-the-badge)](https://leafletjs.com/)

---

## 📋 Tentang Proyek
**JOGJA SIAGA** adalah aplikasi WebGIS (Web Geographic Information System) berbasis browser yang menyajikan informasi kebencanaan dan tata kelola kota Daerah Istimewa Yogyakarta secara interaktif, informatif, dan estetik.

Aplikasi ini dikembangkan sebagai Tugas Akhir oleh **Jihan Nabilah Rahman** dengan tujuan memberikan akses informasi spasial kebencanaan yang mudah dipahami oleh masyarakat umum maupun pemangku kepentingan di wilayah DIY.

---

## ✨ Fitur Utama

### 🗺️ Peta Kebencanaan
- Visualisasi choropleth risiko bencana per kabupaten/kota DIY berdasarkan data BPBD 2025
- Layer heatmap konsentrasi kejadian bencana
- Informasi detail wilayah saat klik poligon kabupaten
- Basemap pilihan: Peta, Satelit, dan Terrain
- Marker pengungsian interaktif dengan detail posko

### 🏛️ Tata Kelola Kota
- Data 6 kategori fasilitas: Pariwisata, Mobilitas, Kesehatan, Pendidikan, Keuangan, Pemerintahan
- Halaman detail setiap lokasi dengan foto, fasilitas, rating, dan grafik keramaian mingguan
- Peta titik lokasi per kategori
- Arahkan ke Google Maps langsung dari aplikasi

### 📊 Laporan Bencana
- Rekap kejadian bencana DIY tahun 2025 (1.374 total kejadian)
- Riwayat naratif bencana tematik dengan data per wilayah terdampak
- Pusat Kontak Darurat (BPBD, BASARNAS, PMI, RS Sardjito, Polda DIY, Damkar)

### 📈 Statistika
- 9 grafik interaktif dengan tooltip informatif
- Heatmap konsentrasi kebencanaan berbasis Leaflet.heat
- Tabel data kebencanaan per kabupaten/kota
- Rekap jenis bencana dengan proporsi visual

### 🤖 Asisten SIGAJOG
- Chatbot lokal berbasis keyword matching
- Database pengetahuan dari data GeoJSON aktual
- Menjawab pertanyaan tentang zona bencana, pengungsian, fasilitas, dan tata kelola kota

### 🎵 Musik Latar
- Memutar "Sesuatu di Jogja" — Adhitia Sofyan via YouTube IFrame API

---

## 🛠️ Teknologi
| Teknologi | Kegunaan |
|---|---|
| HTML5 + CSS3 + JavaScript ES6 | Core aplikasi SPA |
| [Leaflet.js 1.9.4](https://leafletjs.com/) | Peta interaktif |
| [Leaflet.MarkerCluster](https://github.com/Leaflet/Leaflet.markercluster) | Clustering marker |
| [Leaflet.heat](https://github.com/Leaflet/Leaflet.heat) | Heatmap kebencanaan |
| [Chart.js](https://www.chartjs.org/) | Grafik statistik |
| [Tailwind CSS](https://tailwindcss.com/) | Styling dan animasi UI |
| [Google Fonts](https://fonts.google.com/) | Tipografi (Playfair Display, Inter, Noto Serif, Space Mono) |
| [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference) | Pemutar musik latar |
| [Vercel](https://vercel.com/) | Hosting dan deployment |
| GeoJSON | Format data spasial |

---

## 📁 Struktur Proyek
```
webgisyogyakarta/
├── index.html              # Entry point SPA
├── vercel.json             # Konfigurasi routing Vercel
├── sw.js                   # Service Worker (PWA)
├── css/
│   ├── main.css            # Reset, layout, peta, navbar
│   ├── welcome.css         # Splash screen & animasi
│   ├── sidebar.css         # Panel kiri peta
│   ├── detail-panel.css    # Panel detail lokasi/pengungsian
│   ├── pages.css           # Halaman SPA (laporan, statistika, dll)
│   └── components.css      # Chatbot, legend, komponen bersama
├── js/
│   ├── main.js             # Logic utama: peta, tab, layer, chatbot
│   └── chatbot-db.js       # Database pengetahuan SIGAJOG
├── data/
│   ├── *.geojson           # Data spasial semua layer
│   └── posko_pengungsian_logistik_diy_2025.geojson
└── assets/
    ├── candi.jpg
    ├── kota_yogyakarta.jpg
    ├── welcome.jpg
    └── wayang.jpg
```

---

## 📊 Data
| Sumber | Data | Tahun |
|---|---|---|
| OpenStreetMap via HOTOSM | POI, Jalan, Bangunan | 2024 |
| BPBD DIY | Zona Bencana, Pengungsian, Laporan Kejadian | 2025 |
| BNPB | Risiko Bencana Nasional | 2023 |
| GADM v4.1 | Batas Wilayah Administrasi | 2023 |

### Statistik Data (2025)
- **7.166+** total lokasi tercatat
- **10** kategori data
- **42** sub-kategori
- **1.374** total kejadian bencana DIY
- **5** kabupaten/kota terpetakan

### Tingkat Risiko Bencana DIY 2025
| Wilayah | Total Kejadian | Tingkat Risiko |
|---|---|---|
| Kabupaten Kulon Progo | 558 | 🔴 Sangat Tinggi |
| Kabupaten Bantul | 333 | 🟠 Tinggi |
| Kabupaten Gunungkidul | 262 | 🟠 Tinggi |
| Kota Yogyakarta | 141 | 🟡 Sedang |
| Kabupaten Sleman | 80 | 🟢 Rendah |

---

## 🚀 Cara Menjalankan

### Online
Akses langsung di: **[https://webgisyogyakarta.vercel.app/](https://webgisyogyakarta.vercel.app/)**

### Lokal
```bash
# Clone repositori
git clone https://github.com/Jihanablh/webgisyogyakarta.git

# Masuk ke direktori proyek
cd webgisyogyakarta

# Jalankan dengan live server (VS Code extension)
# atau dengan Python HTTP server
python -m http.server 8000

# Buka di browser
# http://localhost:8000
```

> ⚠️ **Catatan:** Aplikasi memerlukan server HTTP untuk fetch file GeoJSON. Tidak bisa dibuka langsung via `file://` protocol.

---

## 🗺️ Cara Penggunaan
1. **Welcome Screen** — Klik "Mulai Eksplorasi" untuk masuk ke aplikasi
2. **Dashboard** — Lihat overview data kebencanaan dan tata kelola DIY
3. **Peta Kebencanaan** — Klik poligon kabupaten untuk melihat detail risiko, klik marker pengungsian untuk info posko
4. **Tata Kelola** — Pilih kategori, jelajahi card lokasi, lihat detail dan grafik keramaian
5. **Laporan Bencana** — Baca riwayat kejadian bencana tematik 2025
6. **Statistika** — Analisis data kebencanaan lewat grafik dan heatmap interaktif
7. **SIGAJOG** — Klik "Tanya SIGAJOG" untuk bertanya tentang kebencanaan dan fasilitas DIY

---

## 🎨 Desain
Aplikasi menggunakan tema dark dengan aksen emas khas Yogyakarta:
```css
--bg-primary:    #0a0f1e   /* Biru navy sangat gelap */
--accent-gold:   #d4a017   /* Emas Kraton */
--accent-merapi: #e67e22   /* Oranye bencana */
--text-primary:  #f0ede4   /* Krem putih */
```

**Tipografi:**
- `Playfair Display` — Judul dan branding
- `Inter` — Label dan navigasi UI
- `Noto Serif` — Body text dan deskripsi
- `Space Mono` — Angka dan data statistik

---

## 📱 Responsivitas
| Breakpoint | Tampilan |
|---|---|
| Desktop (≥1200px) | Layout penuh, panel kiri, peta fullscreen |
| Tablet (768–1199px) | Layout adaptif, panel collapse |
| Mobile (<768px) | Single column, touch-friendly |

---

## 👩‍💻 Pengembang
**Jihan Nabilah Rahman**
Tugas Akhir · 2024/2025

[![GitHub](https://img.shields.io/badge/GitHub-Jihanablh-black?style=flat-square&logo=github)](https://github.com/Jihanablh)

---

## 📄 Lisensi
Proyek ini dikembangkan untuk keperluan akademis. Data bersumber dari lembaga publik dan terbuka.
```
Data spasial © OpenStreetMap contributors
Batas wilayah © GADM v4.1
Data bencana © BPBD DIY 2025
```

---

<div align="center">

**JOGJA SIAGA** · Sistem Informasi Geografis Kebencanaan DIY

*Hamemayu Hayuning Bawana*

Made with ❤️ for Yogyakarta

</div>
