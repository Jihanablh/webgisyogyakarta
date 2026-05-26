import fs from 'node:fs';
import path from 'node:path';
import { DISASTER_2025_BY_REGION, getRegionData } from '../js/disaster-2025.js';

const root = process.cwd();
const srcCandidates = [
    path.join(root, 'data/qgis/jumlah_dampak_bencana_diy_2025_per_kabupaten.geojson'),
    'C:/Users/jihan/Downloads/Peta_Dampak_Bencana_DIY_2025_Kabupaten_QGIS/Peta_Dampak_Bencana_DIY_2025_Kabupaten_QGIS/jumlah_dampak_bencana_diy_2025_per_kabupaten.geojson'
];
const outDir = path.join(root, 'data/qgis');
const outPath = path.join(outDir, 'jumlah_dampak_bencana_diy_2025_per_kabupaten.geojson');
const webOutDir = path.join(root, 'qgis');
const webOutPath = path.join(webOutDir, 'jumlah_dampak_bencana_diy_2025_per_kabupaten.geojson');

const srcPath = srcCandidates.find((p) => fs.existsSync(p));
if (!srcPath) throw new Error('GeoJSON kabupaten 2025 tidak ditemukan.');

fs.mkdirSync(outDir, { recursive: true });
const geojson = JSON.parse(fs.readFileSync(srcPath, 'utf8'));

function normalizeRegion(name) {
    const text = String(name || '').trim();
    if (/^kota\s+yogyakarta$/i.test(text)) return 'Kota Yogyakarta';
    if (/^kabupaten\s+/i.test(text)) return text;
    return `Kabupaten ${text}`;
}

geojson.name = 'jumlah_dampak_bencana_diy_2025_per_kabupaten';
geojson.crs = {
    type: 'name',
    properties: { name: 'urn:ogc:def:crs:EPSG::4326' }
};
geojson.features = geojson.features
    .map((feature) => {
        const kabKota = normalizeRegion(feature.properties?.kab_kota);
        const official = getRegionData(kabKota);
        if (!official) return null;
        return {
            type: 'Feature',
            properties: {
                provinsi: official.provinsi,
                kab_kota: official.kab_kota,
                tahun: official.tahun,
                periode: official.periode,
                cuaca_ekstrem: official.cuaca_ekstrem,
                tanah_longsor: official.tanah_longsor,
                kebakaran_hutan_lahan: official.kebakaran_hutan_lahan,
                gempa_terasa: official.gempa_terasa,
                banjir: official.banjir,
                kebakaran: official.kebakaran,
                jumlah_kejadian: official.jumlah_kejadian,
                kelas_risiko: official.kelas_risiko,
                sumber_data: official.sumber_data,
                catatan: official.catatan
            },
            geometry: feature.geometry
        };
    })
    .filter(Boolean)
    .sort((a, b) => a.properties.kab_kota.localeCompare(b.properties.kab_kota));

const missing = DISASTER_2025_BY_REGION
    .map((item) => item.kab_kota)
    .filter((name) => !geojson.features.some((feature) => feature.properties.kab_kota === name));
if (missing.length) throw new Error(`Geometry kabupaten tidak lengkap: ${missing.join(', ')}`);

fs.writeFileSync(outPath, JSON.stringify(geojson, null, 2), 'utf8');
fs.mkdirSync(webOutDir, { recursive: true });
fs.writeFileSync(webOutPath, JSON.stringify(geojson, null, 2), 'utf8');
console.log(`Wrote ${outPath}`);
console.log(`Wrote ${webOutPath}`);
console.log(`Features: ${geojson.features.length}`);
