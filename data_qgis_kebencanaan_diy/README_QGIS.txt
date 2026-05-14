README QGIS

Paket data:
data_qgis_kebencanaan_diy

File yang digunakan:
1. jumlah_dampak_bencana_diy_2025_per_kecamatan.geojson
2. style_jumlah_dampak_bencana_diy_2025.qml
3. metadata_sumber_data.txt
4. rekap_dibi_bnpb_diy_2025_terdeteksi.csv

Cara membuka di QGIS:
1. Buka QGIS.
2. Pilih Layer > Add Layer > Add Vector Layer.
3. Pilih file jumlah_dampak_bencana_diy_2025_per_kecamatan.geojson.
4. Klik Add.
5. Klik kanan layer > Properties > Symbology > Style > Load Style.
6. Pilih style_jumlah_dampak_bencana_diy_2025.qml.
7. Klik Apply / OK.

Status penting:
Layer ini berisi polygon kecamatan/kapanewon/kemantren resmi untuk DIY dan kolom atribut yang siap diisi. Angka dampak 2025 belum diisi karena data resmi publik yang tersedia belum memberikan agregasi dampak penuh per kecamatan tanpa asumsi pembagian.

Kolom yang perlu diisi ketika data resmi per kecamatan tersedia:
- jumlah_kejadian
- meninggal
- luka_luka
- hilang
- mengungsi
- rumah_rusak
- jumlah_dampak
- kelas_dampak
- sumber_data
- catatan_validasi

Rumus jumlah_dampak:
jumlah_dampak = meninggal + luka_luka + hilang + mengungsi + rumah_rusak

Kelas legenda yang tersedia di QML:
1. Tidak ada kejadian
2. Rendah
3. Sedang
4. Tinggi
5. Sangat Tinggi
6. Data belum tersedia / belum tervalidasi

Saran layout peta QGIS:
- Judul: Peta Tematik Jumlah Dampak Sebaran per Kecamatan Bencana Tahun 2025 Daerah Istimewa Yogyakarta
- Legenda hanya menampilkan kelas jumlah dampak per kecamatan.
- Tambahkan inset map lokasi DIY.
- Tambahkan skala.
- Tambahkan arah utara.
- Tambahkan grid koordinat.
- Tambahkan sumber data: BIG RBI untuk batas kecamatan; DIBI BNPB/BPBD DIY untuk data kejadian dan dampak setelah tabel resmi per kecamatan tersedia.
- Tambahkan catatan periode: 1 Januari 2025 sampai 31 Desember 2025.
- Tambahkan batas kabupaten/kota sebagai garis tebal.
- Tambahkan batas kecamatan sebagai garis tipis.

Catatan GeoPackage:
GeoPackage tidak dibuat di lingkungan ini karena GDAL/ogr2ogr tidak tersedia. Di QGIS, Anda bisa membuatnya sendiri dengan:
1. Klik kanan layer GeoJSON.
2. Export > Save Features As.
3. Format: GeoPackage.
4. CRS: EPSG:4326.
5. Nama file: jumlah_dampak_bencana_diy_2025_per_kecamatan.gpkg.
