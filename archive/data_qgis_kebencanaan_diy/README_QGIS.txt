README QGIS

Paket data:
data_qgis_kebencanaan_diy

File utama:
jumlah_dampak_bencana_diy_2025_per_kecamatan_lengkap.geojson

File style:
style_jumlah_dampak_bencana_diy_2025.qml

Cara membuka di QGIS:
1. Buka QGIS.
2. Pilih Layer > Add Layer > Add Vector Layer.
3. Pilih file jumlah_dampak_bencana_diy_2025_per_kecamatan_lengkap.geojson.
4. Klik Add.
5. Klik kanan layer > Properties > Symbology > Style > Load Style.
6. Pilih style_jumlah_dampak_bencana_diy_2025.qml.
7. Klik Apply / OK.

Status pengisian:
Semua kolom atribut wajib sudah terisi dan tidak null.

Metode ringkas:
Record DIBI/BNPB 2025 yang menyebut tepat satu kecamatan/kapanewon/kemantren digunakan untuk mengisi kecamatan tersebut. Record multi-kecamatan tidak dibagi rata dan tidak dialokasikan, karena tidak tersedia dampak resmi terpisah per kecamatan. Kecamatan tanpa record resmi spesifik diisi angka 0 sesuai instruksi agar tidak menggunakan perkiraan.

Rumus jumlah_dampak:
jumlah_dampak = meninggal + luka_luka + hilang + mengungsi + rumah_rusak

Kelas legenda:
1. Tidak ada kejadian
2. Rendah (1-12)
3. Sedang (13-24)
4. Tinggi (25+)

Catatan:
Angka 0 dapat berarti tidak ada record resmi spesifik kecamatan yang dapat dimasukkan tanpa asumsi, terutama jika data yang tersedia hanya multi-kecamatan atau tingkat kabupaten/kota. Lihat metadata_sumber_data.txt untuk penjelasan lengkap.
