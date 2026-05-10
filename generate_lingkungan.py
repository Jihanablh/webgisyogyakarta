"""Generate lingkungan.geojson — Environmental data for Yogyakarta WebGIS"""
import json

features = []

# ========== KERENTANAN DRAINASE ==========
features.append({
    "type": "Feature",
    "geometry": {"type": "Polygon", "coordinates": [[
        [110.3550, -7.7750], [110.3850, -7.7700], [110.3900, -7.7950],
        [110.3700, -7.8100], [110.3500, -7.8050], [110.3400, -7.7900], [110.3550, -7.7750]
    ]]},
    "properties": {
        "name": "Zona Rawan Genangan Pusat Kota", "category": "lingkungan",
        "subcategory": "Kerentanan Drainase Kota", "type_layer": "zona_bahaya",
        "level_risiko": "Sedang", "deskripsi": "Area pusat kota Yogyakarta dengan kapasitas drainase terbatas. Genangan terjadi saat curah hujan >60mm/jam.",
        "foto": "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600",
        "sumber_data": "Dinas PU Kota Yogyakarta", "last_updated": "2024-03-15",
        "facilities": [], "kapasitas": 0, "riwayat_bencana": []
    }
})

# ========== TUTUPAN LAHAN & RTH ==========
rth_spots = [
    {"name": "Hutan Kota Gembira Loka", "lat": -7.8050, "lon": 110.3970, "desc": "Ruang terbuka hijau seluas 20 ha, habitat satwa dan paru-paru kota."},
    {"name": "RTH Alun-Alun Utara", "lat": -7.7990, "lon": 110.3640, "desc": "Taman bersejarah dengan pohon beringin kembar, luas 1,5 ha."},
    {"name": "Taman Denggung Sleman", "lat": -7.7250, "lon": 110.3550, "desc": "RTH terbesar di Sleman, pusat kegiatan olahraga masyarakat."},
    {"name": "Hutan Pinus Mangunan", "lat": -7.9329, "lon": 110.4082, "desc": "Hutan konservasi seluas 500 ha, penyangga air dan pencegah longsor."},
    {"name": "Kebun Raya Gembiraloka", "lat": -7.8020, "lon": 110.3980, "desc": "Koleksi flora dan fauna, fungsi konservasi dan edukasi lingkungan."},
]
for s in rth_spots:
    features.append({
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [s["lon"], s["lat"]]},
        "properties": {
            "name": s["name"], "category": "lingkungan",
            "subcategory": "Tutupan Lahan & RTH", "type_layer": "titik_lingkungan",
            "level_risiko": "Info", "deskripsi": s["desc"],
            "foto": "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600",
            "sumber_data": "DLH DIY", "last_updated": "2024-02-01",
            "facilities": [], "kapasitas": 0, "riwayat_bencana": []
        }
    })

# ========== KUALITAS UDARA ==========
udara_spots = [
    {"name": "Stasiun BMKG Mlati (ISPU Baik)", "lat": -7.7500, "lon": 110.3400, "desc": "AQI rata-rata 45 (Baik). Pemantauan PM2.5, PM10, SO2, NO2, O3."},
    {"name": "Stasiun DLH Kota Yogyakarta (ISPU Sedang)", "lat": -7.7950, "lon": 110.3650, "desc": "AQI rata-rata 65 (Sedang). Polusi kendaraan di area komersial."},
    {"name": "Stasiun DLH Bantul (ISPU Baik)", "lat": -7.8900, "lon": 110.3300, "desc": "AQI rata-rata 35 (Baik). Lingkungan pedesaan dengan tutupan hijau tinggi."},
]
for s in udara_spots:
    features.append({
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [s["lon"], s["lat"]]},
        "properties": {
            "name": s["name"], "category": "lingkungan",
            "subcategory": "Kualitas Udara", "type_layer": "titik_lingkungan",
            "level_risiko": "Info", "deskripsi": s["desc"],
            "foto": "https://images.unsplash.com/photo-1530349312469-7c40faab9d44?w=600",
            "sumber_data": "BMKG / DLH DIY", "last_updated": "2024-04-01",
            "facilities": [], "kapasitas": 0, "riwayat_bencana": []
        }
    })

# ========== SUMBER AIR BERSIH ==========
air_spots = [
    {"name": "Mata Air Tuk Bening, Sleman", "lat": -7.6500, "lon": 110.4100, "desc": "Mata air alami debit 50 liter/detik, sumber PDAM Sleman."},
    {"name": "Embung Nglanggeran", "lat": -7.8600, "lon": 110.5400, "desc": "Embung penampung air hujan untuk irigasi dan cadangan air musim kemarau."},
    {"name": "Sumur Artesis Gedangsari", "lat": -7.8200, "lon": 110.5800, "desc": "Sumur dalam 120m untuk pasokan air bersih 3 desa di Gunungkidul."},
    {"name": "SPAM IKK Wonosari", "lat": -7.9600, "lon": 110.5900, "desc": "Instalasi pengolahan air minum kapasitas 40 liter/detik untuk Wonosari."},
]
for s in air_spots:
    features.append({
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [s["lon"], s["lat"]]},
        "properties": {
            "name": s["name"], "category": "lingkungan",
            "subcategory": "Sumber Air Bersih", "type_layer": "titik_lingkungan",
            "level_risiko": "Info", "deskripsi": s["desc"],
            "foto": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600",
            "sumber_data": "PDAM / DLH DIY", "last_updated": "2024-01-15",
            "facilities": [], "kapasitas": 0, "riwayat_bencana": []
        }
    })

# ========== PERSEBARAN SAMPAH & TPA ==========
tpa_spots = [
    {"name": "TPA Piyungan", "lat": -7.8350, "lon": 110.4350, "desc": "TPA regional terbesar di DIY, melayani Kota, Sleman, dan Bantul. Kapasitas hampir penuh."},
    {"name": "TPST 3R Moyudan", "lat": -7.7700, "lon": 110.2700, "desc": "Tempat pengolahan sampah terpadu dengan sistem 3R (Reduce, Reuse, Recycle)."},
    {"name": "Bank Sampah Gemah Ripah", "lat": -7.8000, "lon": 110.3400, "desc": "Bank sampah percontohan nasional di Bantul, pionir pengelolaan sampah berbasis masyarakat."},
    {"name": "TPA Baleharjo Wonosari", "lat": -7.9500, "lon": 110.6100, "desc": "TPA untuk wilayah Gunungkidul, kapasitas 5 ton/hari."},
    {"name": "TPST Palbapang Bantul", "lat": -7.8800, "lon": 110.3500, "desc": "Fasilitas composting dan daur ulang sampah organik skala kecamatan."},
]
for s in tpa_spots:
    features.append({
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [s["lon"], s["lat"]]},
        "properties": {
            "name": s["name"], "category": "lingkungan",
            "subcategory": "Persebaran Sampah & TPA", "type_layer": "titik_lingkungan",
            "level_risiko": "Info", "deskripsi": s["desc"],
            "foto": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600",
            "sumber_data": "DLH DIY", "last_updated": "2024-02-01",
            "facilities": [], "kapasitas": 0, "riwayat_bencana": []
        }
    })

geojson = {"type": "FeatureCollection", "features": features}
with open("data/lingkungan.geojson", "w", encoding="utf-8") as f:
    json.dump(geojson, f, ensure_ascii=False, indent=2)
print(f"Created lingkungan.geojson with {len(features)} features")

# Update categories_meta.json
with open("data/categories_meta.json", "r", encoding="utf-8") as f:
    meta = json.load(f)

subcat_counts = {}
for feat in features:
    sc = feat["properties"]["subcategory"]
    subcat_counts[sc] = subcat_counts.get(sc, 0) + 1

meta["lingkungan"] = {"label": "Lingkungan", "subcategories": subcat_counts}

with open("data/categories_meta.json", "w", encoding="utf-8") as f:
    json.dump(meta, f, indent=2, ensure_ascii=False)
print("Updated categories_meta.json with lingkungan")
