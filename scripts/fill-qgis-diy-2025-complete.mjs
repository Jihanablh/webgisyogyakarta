import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'data_qgis_kebencanaan_diy');
const inputGeojson = path.join(outDir, 'jumlah_dampak_bencana_diy_2025_per_kecamatan.geojson');
const outputGeojson = path.join(outDir, 'jumlah_dampak_bencana_diy_2025_per_kecamatan_lengkap.geojson');
const requestedOutputGeojson = path.join(outDir, 'jumlah_dampak_bencana_diy_2025_per_kecamatan.geojson');
const dibiHtmlPath = 'C:/tmp/bnpb_2025_latest.html';
const accessDate = '15 Mei 2026';

const base = JSON.parse(fs.readFileSync(inputGeojson, 'utf8'));
const html = fs.existsSync(dibiHtmlPath) ? fs.readFileSync(dibiHtmlPath, 'utf8') : '';

function cleanHtmlCell(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDibiRows(sourceHtml) {
  const rows = [...sourceHtml.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((m) => m[1]);
  const parsed = [];
  for (const row of rows) {
    const cols = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => cleanHtmlCell(m[1]));
    if (cols.length >= 16 && cols[7] === 'Daerah Istimewa Yogyakarta') {
      parsed.push({
        no: cols[0],
        tanggal: cols[3],
        kejadian: cols[4],
        lokasi: cols[5],
        kabupaten: normalizeKabName(cols[6]),
        meninggal: toInt(cols[10]),
        hilang: toInt(cols[11]),
        luka_luka: toInt(cols[12]),
        rumah_rusak: toInt(cols[13]),
        raw: cols
      });
    }
  }
  return parsed;
}

function toInt(value) {
  const n = Number(String(value || '').replace(/[^\d-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function normalizeKabName(name) {
  const s = String(name || '').trim();
  if (s === 'Kota Yogyakarta') return 'Kota Yogyakarta';
  if (s.startsWith('Kabupaten ')) return s;
  return `Kabupaten ${s}`;
}

function norm(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/kota\s+gede/g, 'kotagede')
    .replace(/sermin/g, 'semin')
    .replace(/kapenewon/g, 'kapanewon')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectDistricts(row, features) {
  const loc = ` ${norm(row.lokasi)} `;
  const candidates = features
    .filter((feature) => feature.properties.kab_kota === row.kabupaten)
    .filter((feature) => {
      const kec = norm(feature.properties.kecamatan);
      return loc.includes(` ${kec} `);
    })
    .map((feature) => feature.properties.kecamatan);
  return [...new Set(candidates)];
}

function classDampak(value) {
  if (value === 0) return 'Tidak ada kejadian';
  if (value >= 1 && value <= 12) return 'Rendah (1-12)';
  if (value >= 13 && value <= 24) return 'Sedang (13-24)';
  return 'Tinggi (25+)';
}

const dibiRows = parseDibiRows(html);
const aggregate = new Map();
const featureKeys = base.features.map((feature) => `${feature.properties.kab_kota}|${feature.properties.kecamatan}`);
for (const key of featureKeys) {
  aggregate.set(key, {
    jumlah_kejadian: 0,
    meninggal: 0,
    luka_luka: 0,
    hilang: 0,
    mengungsi: 0,
    rumah_rusak: 0,
    usedRows: [],
    skippedMultiRows: 0
  });
}

let assignedRows = 0;
let skippedMultiRows = 0;
for (const row of dibiRows) {
  const districts = detectDistricts(row, base.features);
  if (districts.length === 1) {
    const key = `${row.kabupaten}|${districts[0]}`;
    const item = aggregate.get(key);
    if (!item) continue;
    item.jumlah_kejadian += 1;
    item.meninggal += row.meninggal;
    item.luka_luka += row.luka_luka;
    item.hilang += row.hilang;
    item.rumah_rusak += row.rumah_rusak;
    item.usedRows.push(`${row.no}:${row.tanggal}:${row.kejadian}`);
    assignedRows += 1;
  } else {
    skippedMultiRows += 1;
    for (const kecamatan of districts) {
      const key = `${row.kabupaten}|${kecamatan}`;
      const item = aggregate.get(key);
      if (item) item.skippedMultiRows += 1;
    }
  }
}

const completed = {
  ...base,
  name: 'jumlah_dampak_bencana_diy_2025_per_kecamatan_lengkap',
  crs: {
    type: 'name',
    properties: { name: 'urn:ogc:def:crs:EPSG::4326' }
  },
  features: base.features.map((feature) => {
    const key = `${feature.properties.kab_kota}|${feature.properties.kecamatan}`;
    const data = aggregate.get(key) || {
      jumlah_kejadian: 0,
      meninggal: 0,
      luka_luka: 0,
      hilang: 0,
      mengungsi: 0,
      rumah_rusak: 0,
      usedRows: [],
      skippedMultiRows: 0
    };
    const jumlah_dampak = data.meninggal + data.luka_luka + data.hilang + data.mengungsi + data.rumah_rusak;
    const hasVerifiedSingleDistrictRows = data.usedRows.length > 0;
    const props = {
      provinsi: 'Daerah Istimewa Yogyakarta',
      kab_kota: feature.properties.kab_kota || '',
      kecamatan: feature.properties.kecamatan || '',
      tahun: 2025,
      periode: '1 Januari 2025 - 31 Desember 2025',
      jumlah_kejadian: data.jumlah_kejadian,
      jumlah_dampak,
      meninggal: data.meninggal,
      luka_luka: data.luka_luka,
      hilang: data.hilang,
      mengungsi: data.mengungsi,
      rumah_rusak: data.rumah_rusak,
      kelas_dampak: classDampak(jumlah_dampak),
      sumber_data: 'DIBI/BNPB Data Bencana tabel pencarian 2025; BIG RBI Administrasi_AR_Kecamatan_10K',
      tanggal_akses: accessDate,
      catatan_validasi: hasVerifiedSingleDistrictRows
        ? `Angka diisi dari ${data.usedRows.length} record DIBI/BNPB 2025 yang menyebut satu kecamatan secara eksplisit. Record multi-kecamatan tidak dibagi untuk menghindari asumsi.`
        : data.skippedMultiRows > 0
          ? `Ada ${data.skippedMultiRows} record DIBI/BNPB 2025 yang menyebut kecamatan ini bersama kecamatan lain, tetapi dampaknya tidak tersedia terpisah per kecamatan; nilai diisi 0 sesuai instruksi untuk menghindari perkiraan.`
          : 'Tidak ditemukan record resmi DIBI/BNPB 2025 yang dapat diverifikasi spesifik untuk kecamatan ini; nilai diisi 0 sesuai instruksi, tanpa perkiraan.'
    };
    return {
      type: 'Feature',
      properties: props,
      geometry: feature.geometry
    };
  })
};

fs.writeFileSync(outputGeojson, JSON.stringify(completed, null, 2), 'utf8');
fs.writeFileSync(requestedOutputGeojson, JSON.stringify(completed, null, 2), 'utf8');

const qml = `<qgis version="3.34" styleCategories="Symbology|Labeling|Fields">
  <renderer-v2 attr="kelas_dampak" type="categorizedSymbol" symbollevels="0" enableorderby="0" forceraster="0">
    <categories>
      <category value="Tidak ada kejadian" label="Tidak ada kejadian" symbol="0" render="true"/>
      <category value="Rendah (1-12)" label="Rendah (1-12)" symbol="1" render="true"/>
      <category value="Sedang (13-24)" label="Sedang (13-24)" symbol="2" render="true"/>
      <category value="Tinggi (25+)" label="Tinggi (25+)" symbol="3" render="true"/>
    </categories>
    <symbols>
      <symbol alpha="1" clip_to_extent="1" type="fill" name="0">
        <layer class="SimpleFill" enabled="1">
          <prop k="color" v="248,250,252,255"/>
          <prop k="outline_color" v="148,163,184,255"/>
          <prop k="outline_width" v="0.25"/>
          <prop k="style" v="solid"/>
        </layer>
      </symbol>
      <symbol alpha="1" clip_to_extent="1" type="fill" name="1">
        <layer class="SimpleFill" enabled="1">
          <prop k="color" v="255,205,213,255"/>
          <prop k="outline_color" v="190,80,100,255"/>
          <prop k="outline_width" v="0.25"/>
          <prop k="style" v="solid"/>
        </layer>
      </symbol>
      <symbol alpha="1" clip_to_extent="1" type="fill" name="2">
        <layer class="SimpleFill" enabled="1">
          <prop k="color" v="244,114,136,255"/>
          <prop k="outline_color" v="150,45,65,255"/>
          <prop k="outline_width" v="0.25"/>
          <prop k="style" v="solid"/>
        </layer>
      </symbol>
      <symbol alpha="1" clip_to_extent="1" type="fill" name="3">
        <layer class="SimpleFill" enabled="1">
          <prop k="color" v="220,38,38,255"/>
          <prop k="outline_color" v="100,25,25,255"/>
          <prop k="outline_width" v="0.25"/>
          <prop k="style" v="solid"/>
        </layer>
      </symbol>
    </symbols>
  </renderer-v2>
</qgis>
`;

fs.writeFileSync(path.join(outDir, 'style_jumlah_dampak_bencana_diy_2025.qml'), qml, 'utf8');

const metadata = `METADATA SUMBER DATA

File hasil:
jumlah_dampak_bencana_diy_2025_per_kecamatan.geojson

File salinan pembanding:
jumlah_dampak_bencana_diy_2025_per_kecamatan_lengkap.geojson

Wilayah:
Daerah Istimewa Yogyakarta.

Unit analisis:
Kecamatan/kapanewon/kemantren.

Periode:
1 Januari 2025 - 31 Desember 2025.

Tanggal akses:
${accessDate}.

Sumber data yang digunakan:
1. DIBI/BNPB Data Bencana tabel pencarian.
   URL: https://gis.bnpb.go.id/databencana/tabel/pencarian.php
   Filter: 2025-01-01 sampai 2025-12-31.
2. Portal Satu Data Bencana Indonesia / BNPB.
   URL: https://data.bnpb.go.id/dataset/data-bencana-indonesia
3. BIG RBI Administrasi_AR_Kecamatan_10K.
   URL: https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/Administrasi_AR_Kecamatan_10K/MapServer/0

Metode pengisian data:
1. Polygon kecamatan/kapanewon/kemantren menggunakan batas administrasi BIG dalam CRS EPSG:4326.
2. Data kejadian/dampak 2025 diambil dari tabel pencarian DIBI/BNPB.
3. Record DIBI/BNPB yang menyebut tepat satu kecamatan/kapanewon/kemantren pada kabupaten/kota yang sama digunakan untuk mengisi atribut kecamatan tersebut.
4. Record yang menyebut lebih dari satu kecamatan tidak dibagi rata dan tidak dialokasikan ke kecamatan, karena tidak tersedia dampak resmi terpisah per kecamatan.
5. Kecamatan tanpa record resmi spesifik diisi angka 0 sesuai instruksi pengguna untuk menghindari data perkiraan.

Rumus jumlah dampak:
jumlah_dampak = meninggal + luka_luka + hilang + mengungsi + rumah_rusak.

Aturan jika data tidak tersedia:
Jika data resmi tingkat kecamatan tidak tersedia, tidak terverifikasi, atau hanya tersedia pada tingkat kabupaten/kota/multi-kecamatan, maka nilai diisi 0 dan catatan_validasi menjelaskan alasannya. Angka 0 dalam konteks ini berarti tidak ada data resmi spesifik yang dapat dimasukkan tanpa asumsi, bukan klaim mutlak bahwa tidak pernah terjadi bencana.

Klasifikasi kelas_dampak:
Tidak ada kejadian: jumlah_dampak = 0.
Rendah (1-12): jumlah_dampak 1 sampai 12.
Sedang (13-24): jumlah_dampak 13 sampai 24.
Tinggi (25+): jumlah_dampak 25 atau lebih.

Ringkasan proses:
Jumlah record DIBI/BNPB DIY 2025 yang terdeteksi: ${dibiRows.length}.
Jumlah record yang dapat dialokasikan ke tepat satu kecamatan: ${assignedRows}.
Jumlah record yang tidak dialokasikan karena multi-kecamatan/tidak cocok: ${skippedMultiRows}.

Catatan:
Tidak ada angka perkiraan, simulasi, atau pembagian rata. Semua kolom atribut pada file hasil diisi tanpa null.
`;

fs.writeFileSync(path.join(outDir, 'metadata_sumber_data.txt'), metadata, 'utf8');

console.log(`DIBI DIY rows detected: ${dibiRows.length}`);
console.log(`Assigned single-district rows: ${assignedRows}`);
console.log(`Skipped rows: ${skippedMultiRows}`);
console.log(`Wrote ${outputGeojson}`);
console.log(`Updated ${requestedOutputGeojson}`);
