"""Generate kebencanaan.geojson — Disaster risk zones for Yogyakarta WebGIS"""
import json

features = []

# ========== ZONA KRB MERAPI ==========
# KRB III (Tinggi) — ~5km radius from summit
features.append({
    "type": "Feature",
    "geometry": {"type": "Polygon", "coordinates": [[
        [110.4257, -7.5207], [110.4557, -7.5307], [110.4757, -7.5507],
        [110.4807, -7.5707], [110.4707, -7.5907], [110.4457, -7.5957],
        [110.4207, -7.5907], [110.4057, -7.5707], [110.4007, -7.5507],
        [110.4107, -7.5307], [110.4257, -7.5207]
    ]]},
    "properties": {
        "name": "Zona KRB III Merapi", "category": "kebencanaan",
        "subcategory": "Risiko Erupsi Merapi", "type_layer": "zona_bahaya",
        "level_risiko": "Tinggi", "zona": "KRB III", "radius_km": 5,
        "deskripsi": "Zona paling berbahaya, radius 0-5 km dari puncak Merapi. Area ini terkena dampak langsung awan panas (pyroclastic flow), lontaran material vulkanik, dan lahar.",
        "foto": "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=600",
        "sumber_data": "BPPTKG / BPBD DIY", "last_updated": "2024-01-15",
        "kontak_darurat": "+62274-515059 (BPBD DIY)",
        "kapasitas": 0, "facilities": [],
        "instruksi_evakuasi": "1. Segera tinggalkan zona KRB III jika ada peringatan. 2. Ikuti jalur evakuasi yang telah ditentukan (menjauhi sungai/lembah). 3. Gunakan masker N95 untuk melindungi dari abu vulkanik. 4. Menuju titik kumpul terdekat yang telah ditetapkan BPBD.",
        "riwayat_bencana": [
            {"tanggal": "2010-10-26", "jenis": "Erupsi", "skala": "VEI 4", "korban_jiwa": 353, "pengungsi": 350000, "kerugian_material": "Rp 4,23 Triliun", "deskripsi": "Erupsi besar Merapi 2010, terbesar dalam 100 tahun terakhir.", "sumber": "BNPB"},
            {"tanggal": "2006-06-14", "jenis": "Erupsi", "skala": "VEI 2", "korban_jiwa": 2, "pengungsi": 17000, "kerugian_material": "Rp 180 Miliar", "deskripsi": "Erupsi sedang, awan panas mengarah ke Kali Gendol.", "sumber": "BPPTKG"},
            {"tanggal": "2018-05-11", "jenis": "Erupsi Freatik", "skala": "VEI 1", "korban_jiwa": 0, "pengungsi": 2400, "kerugian_material": "Rp 5 Miliar", "deskripsi": "Erupsi freatik dengan kolom abu setinggi 5.500 meter.", "sumber": "BPPTKG"}
        ]
    }
})

# KRB II (Sedang) — ~10km radius
features.append({
    "type": "Feature",
    "geometry": {"type": "Polygon", "coordinates": [[
        [110.3957, -7.5007], [110.4457, -7.5007], [110.4957, -7.5207],
        [110.5157, -7.5607], [110.5107, -7.6007], [110.4857, -7.6207],
        [110.4457, -7.6307], [110.3957, -7.6207], [110.3657, -7.6007],
        [110.3557, -7.5607], [110.3657, -7.5207], [110.3957, -7.5007]
    ]]},
    "properties": {
        "name": "Zona KRB II Merapi", "category": "kebencanaan",
        "subcategory": "Risiko Erupsi Merapi", "type_layer": "zona_bahaya",
        "level_risiko": "Sedang", "zona": "KRB II", "radius_km": 10,
        "deskripsi": "Zona bahaya sedang, radius 5-10 km. Terdampak hujan abu lebat, lahar dingin, dan potensi aliran piroklastik saat erupsi besar.",
        "foto": "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=600",
        "sumber_data": "BPPTKG / BPBD DIY", "last_updated": "2024-01-15",
        "kontak_darurat": "+62274-515059 (BPBD DIY)",
        "kapasitas": 0, "facilities": [],
        "instruksi_evakuasi": "1. Pantau informasi BPPTKG secara berkala. 2. Siapkan tas siaga bencana (dokumen, obat, makanan). 3. Kenali rute evakuasi dan lokasi barak pengungsian terdekat.",
        "riwayat_bencana": [
            {"tanggal": "2010-10-26", "jenis": "Erupsi", "skala": "VEI 4", "korban_jiwa": 353, "pengungsi": 350000, "kerugian_material": "Rp 4,23 Triliun", "deskripsi": "Erupsi besar Merapi 2010.", "sumber": "BNPB"}
        ]
    }
})

# KRB I (Rendah) — ~15km radius
features.append({
    "type": "Feature",
    "geometry": {"type": "Polygon", "coordinates": [[
        [110.3457, -7.4807], [110.4457, -7.4707], [110.5457, -7.4907],
        [110.5757, -7.5507], [110.5657, -7.6307], [110.5257, -7.6707],
        [110.4457, -7.6807], [110.3657, -7.6707], [110.3257, -7.6307],
        [110.3157, -7.5507], [110.3257, -7.4907], [110.3457, -7.4807]
    ]]},
    "properties": {
        "name": "Zona KRB I Merapi", "category": "kebencanaan",
        "subcategory": "Risiko Erupsi Merapi", "type_layer": "zona_bahaya",
        "level_risiko": "Rendah", "zona": "KRB I", "radius_km": 15,
        "deskripsi": "Zona waspada, radius 10-15 km. Terdampak hujan abu tipis dan lahar dingin pasca-erupsi melalui sungai-sungai yang berhulu di Merapi.",
        "foto": "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=600",
        "sumber_data": "BPPTKG", "last_updated": "2024-01-15",
        "kontak_darurat": "+62274-515059 (BPBD DIY)",
        "kapasitas": 0, "facilities": [],
        "instruksi_evakuasi": "1. Ikuti perkembangan status Merapi via BPPTKG. 2. Hindari area tepian sungai saat hujan deras pasca-erupsi.",
        "riwayat_bencana": []
    }
})

# ========== JALUR EVAKUASI ==========
features.append({
    "type": "Feature",
    "geometry": {"type": "LineString", "coordinates": [
        [110.4457, -7.5707], [110.4357, -7.5907], [110.4257, -7.6107],
        [110.4157, -7.6407], [110.4057, -7.6707], [110.3957, -7.7007],
        [110.3857, -7.7307], [110.3757, -7.7607]
    ]},
    "properties": {
        "name": "Jalur Evakuasi Merapi — Sleman Barat", "category": "kebencanaan",
        "subcategory": "Risiko Erupsi Merapi", "type_layer": "jalur_evakuasi",
        "level_risiko": "Info", "deskripsi": "Jalur evakuasi utama via Jl. Kaliurang menuju Kota Yogyakarta. Jarak tempuh ~25 km, estimasi 45 menit.",
        "sumber_data": "BPBD Sleman", "last_updated": "2023-08-10",
        "instruksi_evakuasi": "Ikuti rambu evakuasi hijau. Jangan berhenti di tepian sungai. Utamakan kendaraan roda dua untuk menghindari kemacetan.",
        "riwayat_bencana": []
    }
})

features.append({
    "type": "Feature",
    "geometry": {"type": "LineString", "coordinates": [
        [110.4657, -7.5707], [110.4857, -7.5907], [110.5057, -7.6207],
        [110.5157, -7.6507], [110.5057, -7.6807], [110.4957, -7.7107]
    ]},
    "properties": {
        "name": "Jalur Evakuasi Merapi — Sleman Timur", "category": "kebencanaan",
        "subcategory": "Risiko Erupsi Merapi", "type_layer": "jalur_evakuasi",
        "level_risiko": "Info", "deskripsi": "Jalur evakuasi via Prambanan menuju Klaten. Jarak ~20 km, estimasi 35 menit.",
        "sumber_data": "BPBD Sleman", "last_updated": "2023-08-10",
        "instruksi_evakuasi": "Ikuti Jl. Solo-Yogya ke arah timur. Berkumpul di Stadion Prambanan.",
        "riwayat_bencana": []
    }
})

# ========== TITIK PENGUNGSIAN ==========
shelters = [
    {"name": "Barak Pengungsian Stadion Maguwoharjo", "lat": -7.7158, "lon": 110.4078, "kapasitas": 2000,
     "facilities": ["Tenda Darurat", "Air Bersih", "MCK", "Dapur Umum", "Posko Kesehatan"],
     "desc": "Stadion utama Sleman, kapasitas besar untuk pengungsi Merapi.", "foto": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600"},
    {"name": "Barak Pengungsian Balai Desa Umbulharjo", "lat": -7.6277, "lon": 110.4124, "kapasitas": 500,
     "facilities": ["Tenda Darurat", "Air Bersih", "MCK", "Dapur Umum"],
     "desc": "Titik pengungsian terdekat dari lereng Merapi sisi selatan.", "foto": "https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=600"},
    {"name": "Posko Pengungsian GOR Amongrogo", "lat": -7.7842, "lon": 110.3840, "kapasitas": 3000,
     "facilities": ["Tenda Darurat", "Air Bersih", "MCK", "Dapur Umum", "Posko Kesehatan", "Logistik"],
     "desc": "Gedung olahraga besar di pusat kota, digunakan saat erupsi 2010.", "foto": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600"},
    {"name": "Barak Pengungsian Prambanan", "lat": -7.7520, "lon": 110.4700, "kapasitas": 800,
     "facilities": ["Tenda Darurat", "Air Bersih", "MCK"],
     "desc": "Titik pengungsian untuk warga lereng timur Merapi.", "foto": "https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=600"},
]

for s in shelters:
    features.append({
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [s["lon"], s["lat"]]},
        "properties": {
            "name": s["name"], "category": "kebencanaan",
            "subcategory": "Risiko Erupsi Merapi", "type_layer": "titik_pengungsian",
            "level_risiko": "Info", "deskripsi": s["desc"], "foto": s["foto"],
            "kapasitas": s["kapasitas"], "facilities": s["facilities"],
            "sumber_data": "BPBD DIY", "last_updated": "2024-03-01",
            "kontak_darurat": "+62274-515059 (BPBD DIY)",
            "instruksi_evakuasi": "Datang ke posko terdekat, lapor ke petugas, ikuti arahan penempatan tenda.",
            "riwayat_bencana": []
        }
    })

# ========== RAWAN BANJIR ==========
features.append({
    "type": "Feature",
    "geometry": {"type": "Polygon", "coordinates": [[
        [110.3400, -7.8700], [110.3800, -7.8650], [110.3900, -7.8900],
        [110.3700, -7.9100], [110.3400, -7.9050], [110.3200, -7.8900],
        [110.3400, -7.8700]
    ]]},
    "properties": {
        "name": "Zona Rawan Banjir Bantul", "category": "kebencanaan",
        "subcategory": "Rawan Banjir", "type_layer": "rawan_banjir",
        "level_risiko": "Tinggi", "deskripsi": "Kawasan dataran rendah Bantul yang sering terdampak banjir dari luapan Sungai Opak dan Sungai Progo saat musim hujan.",
        "foto": "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600",
        "sumber_data": "BPBD Bantul / BMKG", "last_updated": "2024-02-20",
        "kontak_darurat": "+62274-367233 (BPBD Bantul)",
        "instruksi_evakuasi": "1. Pindahkan barang berharga ke tempat tinggi. 2. Segera evakuasi jika ketinggian air >50cm. 3. Hubungi BPBD Bantul.",
        "riwayat_bencana": [
            {"tanggal": "2024-01-05", "jenis": "Banjir", "skala": "Sedang", "korban_jiwa": 0, "pengungsi": 1200, "kerugian_material": "Rp 2,8 Miliar", "deskripsi": "Banjir akibat hujan lebat merendam 5 desa.", "sumber": "BPBD Bantul"},
            {"tanggal": "2023-02-18", "jenis": "Banjir", "skala": "Besar", "korban_jiwa": 1, "pengungsi": 3500, "kerugian_material": "Rp 7,1 Miliar", "deskripsi": "Banjir besar merendam 12 desa di Bantul.", "sumber": "BNPB"}
        ],
        "facilities": [], "kapasitas": 0
    }
})

features.append({
    "type": "Feature",
    "geometry": {"type": "Polygon", "coordinates": [[
        [110.3500, -7.7800], [110.3800, -7.7750], [110.3850, -7.7950],
        [110.3650, -7.8100], [110.3450, -7.8050], [110.3350, -7.7900],
        [110.3500, -7.7800]
    ]]},
    "properties": {
        "name": "Zona Rawan Banjir Kota Yogyakarta", "category": "kebencanaan",
        "subcategory": "Rawan Banjir", "type_layer": "rawan_banjir",
        "level_risiko": "Sedang", "deskripsi": "Area perkotaan dengan drainase terbatas. Banjir genangan terjadi saat curah hujan >100mm/hari.",
        "foto": "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600",
        "sumber_data": "BPBD Kota Yogyakarta", "last_updated": "2024-02-20",
        "kontak_darurat": "+62274-551215",
        "instruksi_evakuasi": "Hindari jalan yang tergenang. Matikan listrik jika air masuk rumah.",
        "riwayat_bencana": [
            {"tanggal": "2024-01-12", "jenis": "Banjir Genangan", "skala": "Ringan", "korban_jiwa": 0, "pengungsi": 200, "kerugian_material": "Rp 500 Juta", "deskripsi": "Genangan air setinggi 30-50 cm di beberapa titik.", "sumber": "BPBD Kota"}
        ],
        "facilities": [], "kapasitas": 0
    }
})

# ========== RAWAN GEMPA ==========
features.append({
    "type": "Feature",
    "geometry": {"type": "Polygon", "coordinates": [[
        [110.2800, -7.8200], [110.4200, -7.8150], [110.4500, -7.8600],
        [110.4300, -7.9200], [110.3200, -7.9300], [110.2600, -7.8800],
        [110.2800, -7.8200]
    ]]},
    "properties": {
        "name": "Zona Rawan Gempa Bantul-Kota", "category": "kebencanaan",
        "subcategory": "Rawan Gempa", "type_layer": "zona_bahaya",
        "level_risiko": "Tinggi", "deskripsi": "Zona patahan aktif yang menyebabkan gempa 2006 (M 6.3). Potensi gempa dangkal dengan kerusakan tinggi.",
        "foto": "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600",
        "sumber_data": "BMKG / Pusgen Kemen PUPR", "last_updated": "2023-11-01",
        "kontak_darurat": "+62274-515059 (BPBD DIY)",
        "instruksi_evakuasi": "1. Drop, Cover, Hold On. 2. Jauhi bangunan tinggi. 3. Setelah gempa, periksa jalur gas & listrik.",
        "riwayat_bencana": [
            {"tanggal": "2006-05-27", "jenis": "Gempa Bumi", "skala": "M 6.3", "korban_jiwa": 5749, "pengungsi": 600000, "kerugian_material": "Rp 29,1 Triliun", "deskripsi": "Gempa dahsyat Bantul 2006, salah satu bencana terbesar di DIY.", "sumber": "BNPB"}
        ],
        "facilities": [], "kapasitas": 0
    }
})

# ========== RAWAN LONGSOR ==========
features.append({
    "type": "Feature",
    "geometry": {"type": "Polygon", "coordinates": [[
        [110.5200, -7.9200], [110.5800, -7.9100], [110.6100, -7.9500],
        [110.5900, -7.9800], [110.5400, -7.9900], [110.5100, -7.9600],
        [110.5200, -7.9200]
    ]]},
    "properties": {
        "name": "Zona Rawan Longsor Gunungkidul Utara", "category": "kebencanaan",
        "subcategory": "Rawan Longsor", "type_layer": "zona_bahaya",
        "level_risiko": "Sedang", "deskripsi": "Perbukitan karst Gunungkidul dengan kemiringan >40° rawan longsor saat musim hujan.",
        "foto": "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600",
        "sumber_data": "BPBD Gunungkidul", "last_updated": "2024-01-30",
        "kontak_darurat": "+62274-391942 (BPBD Gunungkidul)",
        "instruksi_evakuasi": "Hindari tebing terjal saat hujan deras. Perhatikan retakan tanah sebagai tanda awal.",
        "riwayat_bencana": [
            {"tanggal": "2023-12-15", "jenis": "Longsor", "skala": "Kecil", "korban_jiwa": 0, "pengungsi": 45, "kerugian_material": "Rp 300 Juta", "deskripsi": "Longsor menutup jalan desa di Kecamatan Patuk.", "sumber": "BPBD Gunungkidul"}
        ],
        "facilities": [], "kapasitas": 0
    }
})

# ========== RAWAN KEKERINGAN ==========
features.append({
    "type": "Feature",
    "geometry": {"type": "Polygon", "coordinates": [[
        [110.5000, -7.9500], [110.6500, -7.9400], [110.6800, -8.0200],
        [110.6200, -8.0800], [110.5200, -8.0700], [110.4800, -8.0100],
        [110.5000, -7.9500]
    ]]},
    "properties": {
        "name": "Zona Rawan Kekeringan Gunungkidul Selatan", "category": "kebencanaan",
        "subcategory": "Rawan Kekeringan", "type_layer": "zona_bahaya",
        "level_risiko": "Tinggi", "deskripsi": "Kawasan karst dengan cadangan air tanah terbatas. Kekeringan terjadi setiap musim kemarau (Juni-Oktober).",
        "foto": "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600",
        "sumber_data": "BPBD Gunungkidul / PDAM", "last_updated": "2024-04-01",
        "kontak_darurat": "+62274-391942 (BPBD Gunungkidul)",
        "instruksi_evakuasi": "Hemat penggunaan air. Hubungi BPBD untuk distribusi air bersih.",
        "riwayat_bencana": [
            {"tanggal": "2023-09-01", "jenis": "Kekeringan", "skala": "Besar", "korban_jiwa": 0, "pengungsi": 0, "kerugian_material": "Rp 1,5 Miliar", "deskripsi": "42 desa di Gunungkidul mengalami krisis air bersih.", "sumber": "BPBD Gunungkidul"}
        ],
        "facilities": [], "kapasitas": 0
    }
})

geojson = {"type": "FeatureCollection", "features": features}
with open("data/kebencanaan.geojson", "w", encoding="utf-8") as f:
    json.dump(geojson, f, ensure_ascii=False, indent=2)
print(f"Created kebencanaan.geojson with {len(features)} features")

# Update categories_meta.json
with open("data/categories_meta.json", "r", encoding="utf-8") as f:
    meta = json.load(f)

subcat_counts = {}
for feat in features:
    sc = feat["properties"]["subcategory"]
    subcat_counts[sc] = subcat_counts.get(sc, 0) + 1

meta["kebencanaan"] = {"label": "Kebencanaan", "subcategories": subcat_counts}

with open("data/categories_meta.json", "w", encoding="utf-8") as f:
    json.dump(meta, f, indent=2, ensure_ascii=False)
print("Updated categories_meta.json with kebencanaan")
