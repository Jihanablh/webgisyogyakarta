import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'data_qgis_kebencanaan_diy');
const boundaryPath = path.join(outDir, 'batas_kecamatan_diy_big.geojson');
const dibiHtmlPath = 'C:/tmp/bnpb_2025b.html';
const today = '14 Mei 2026';

fs.mkdirSync(outDir, { recursive: true });

const source = JSON.parse(fs.readFileSync(boundaryPath, 'utf8'));

function normalizeKab(name) {
  if (name === 'Kota Yogyakarta') return 'Kota Yogyakarta';
  return `Kabupaten ${name}`;
}

function stripZ(coords) {
  if (!Array.isArray(coords)) return coords;
  if (typeof coords[0] === 'number') return coords.slice(0, 2);
  return coords.map(stripZ);
}

function asMultiPolygon(geometry) {
  const coordinates = stripZ(geometry.coordinates);
  if (geometry.type === 'Polygon') {
    return { type: 'MultiPolygon', coordinates: [coordinates] };
  }
  return { type: 'MultiPolygon', coordinates };
}

const finalGeojson = {
  type: 'FeatureCollection',
  name: 'jumlah_dampak_bencana_diy_2025_per_kecamatan',
  crs: {
    type: 'name',
    properties: {
      name: 'urn:ogc:def:crs:EPSG::4326'
    }
  },
  features: source.features
    .filter((feature) => feature.geometry && ['Polygon', 'MultiPolygon'].includes(feature.geometry.type))
    .map((feature) => {
      const p = feature.properties || {};
      return {
        type: 'Feature',
        properties: {
          provinsi: 'Daerah Istimewa Yogyakarta',
          kab_kota: normalizeKab(p.WADMKK || ''),
          kecamatan: p.WADMKC || '',
          tahun: 2025,
          periode: '1 Januari 2025 - 31 Desember 2025',
          jumlah_kejadian: null,
          jumlah_dampak: null,
          meninggal: null,
          luka_luka: null,
          hilang: null,
          mengungsi: null,
          rumah_rusak: null,
          kelas_dampak: 'Data belum tersedia',
          sumber_data: 'DIBI BNPB / Portal Satu Data Bencana Indonesia; BPBD DIY; BIG RBI Administrasi_AR_Kecamatan_10K',
          tanggal_akses: today,
          catatan_validasi: 'Template polygon kecamatan. Data resmi 2025 terverifikasi belum tersedia lengkap sebagai agregasi dampak per kecamatan; angka tidak diisi agar tidak menjadi data perkiraan/dummy.'
        },
        geometry: asMultiPolygon(feature.geometry)
      };
    })
    .sort((a, b) => (a.properties.kab_kota + a.properties.kecamatan).localeCompare(b.properties.kab_kota + b.properties.kecamatan))
};

fs.writeFileSync(
  path.join(outDir, 'jumlah_dampak_bencana_diy_2025_per_kecamatan.geojson'),
  JSON.stringify(finalGeojson, null, 2),
  'utf8'
);

const qml = `<!DOCTYPE qgis PUBLIC 'http://mrcc.com/qgis.dtd' 'SYSTEM'>
<qgis version="3.34" styleCategories="Symbology|Labeling|Fields">
  <renderer-v2 attr="kelas_dampak" type="categorizedSymbol" symbollevels="0" enableorderby="0" forceraster="0">
    <categories>
      <category value="Tidak ada kejadian" label="Tidak ada kejadian" symbol="0" render="true"/>
      <category value="Rendah" label="Rendah" symbol="1" render="true"/>
      <category value="Sedang" label="Sedang" symbol="2" render="true"/>
      <category value="Tinggi" label="Tinggi" symbol="3" render="true"/>
      <category value="Sangat Tinggi" label="Sangat Tinggi" symbol="4" render="true"/>
      <category value="Data belum tersedia" label="Data belum tersedia / belum tervalidasi" symbol="5" render="true"/>
    </categories>
    <symbols>
      <symbol alpha="1" clip_to_extent="1" type="fill" name="0">
        <layer class="SimpleFill" enabled="1">
          <prop k="color" v="245,245,245,255"/>
          <prop k="outline_color" v="110,110,110,255"/>
          <prop k="outline_width" v="0.25"/>
          <prop k="style" v="solid"/>
        </layer>
      </symbol>
      <symbol alpha="1" clip_to_extent="1" type="fill" name="1">
        <layer class="SimpleFill" enabled="1">
          <prop k="color" v="255,205,213,255"/>
          <prop k="outline_color" v="130,60,60,255"/>
          <prop k="outline_width" v="0.25"/>
          <prop k="style" v="solid"/>
        </layer>
      </symbol>
      <symbol alpha="1" clip_to_extent="1" type="fill" name="2">
        <layer class="SimpleFill" enabled="1">
          <prop k="color" v="244,114,136,255"/>
          <prop k="outline_color" v="120,40,40,255"/>
          <prop k="outline_width" v="0.25"/>
          <prop k="style" v="solid"/>
        </layer>
      </symbol>
      <symbol alpha="1" clip_to_extent="1" type="fill" name="3">
        <layer class="SimpleFill" enabled="1">
          <prop k="color" v="220,38,38,255"/>
          <prop k="outline_color" v="90,20,20,255"/>
          <prop k="outline_width" v="0.25"/>
          <prop k="style" v="solid"/>
        </layer>
      </symbol>
      <symbol alpha="1" clip_to_extent="1" type="fill" name="4">
        <layer class="SimpleFill" enabled="1">
          <prop k="color" v="127,29,29,255"/>
          <prop k="outline_color" v="60,10,10,255"/>
          <prop k="outline_width" v="0.25"/>
          <prop k="style" v="solid"/>
        </layer>
      </symbol>
      <symbol alpha="1" clip_to_extent="1" type="fill" name="5">
        <layer class="SimpleFill" enabled="1">
          <prop k="color" v="229,231,235,255"/>
          <prop k="outline_color" v="156,163,175,255"/>
          <prop k="outline_width" v="0.25"/>
          <prop k="style" v="dense4"/>
        </layer>
      </symbol>
    </symbols>
  </renderer-v2>
  <labeling type="simple">
    <settings>
      <text-style fieldName="kecamatan" namedStyle="Regular" fontSize="8" fontFamily="Arial"/>
      <placement placement="1"/>
    </settings>
  </labeling>
  <fieldConfiguration>
    ${Object.keys(finalGeojson.features[0].properties).map((name) => `<field name="${name}"><editWidget type="TextEdit"/></field>`).join('\n    ')}
  </fieldConfiguration>
</qgis>
`;

fs.writeFileSync(path.join(outDir, 'style_jumlah_dampak_bencana_diy_2025.qml'), qml, 'utf8');

let diyRows = [];
if (fs.existsSync(dibiHtmlPath)) {
  const html = fs.readFileSync(dibiHtmlPath, 'utf8');
  const rows = [...html.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((m) => m[1]);
  for (const row of rows) {
    const cols = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) =>
      m[1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    );
    if (cols.length >= 16 && cols[7] === 'Daerah Istimewa Yogyakarta') {
      diyRows.push(cols);
    }
  }
}

const csvHeader = [
  'no','kode_identitas_bencana','id_kabupaten','tanggal_kejadian','kejadian','lokasi',
  'kabupaten','provinsi','dokumentasi','penyebab','meninggal','hilang','terluka',
  'rumah_rusak','rumah_terendam','fasum_rusak'
];
const csv = [
  csvHeader.join(','),
  ...diyRows.map((row) => csvHeader.map((_, i) => `"${String(row[i] ?? '').replace(/"/g, '""')}"`).join(','))
].join('\n');
fs.writeFileSync(path.join(outDir, 'rekap_dibi_bnpb_diy_2025_terdeteksi.csv'), csv, 'utf8');

const metadata = `METADATA SUMBER DATA

Judul data:
Jumlah Dampak Sebaran per Kecamatan Bencana Tahun 2025 Daerah Istimewa Yogyakarta

Folder:
data_qgis_kebencanaan_diy

File utama:
jumlah_dampak_bencana_diy_2025_per_kecamatan.geojson

Status data dampak:
STRUKTUR SIAP ISI / ANGKA DAMPAK BELUM DIISI.

Alasan:
Hasil pengecekan sumber resmi menunjukkan bahwa data kejadian tahun 2025 dari DIBI/BNPB dapat memuat lokasi kecamatan/kapanewon/kemantren dalam deskripsi kejadian. Namun angka dampak seperti meninggal, hilang, terluka, rumah rusak, rumah terendam, dan fasum rusak pada tabel publik berada pada level record kejadian/kabupaten, dan beberapa record menyebut lebih dari satu kecamatan dalam satu kejadian. Karena tidak tersedia pembagian dampak resmi per kecamatan, angka tidak diagregasikan agar tidak menjadi perkiraan atau data dummy.

Sumber batas administrasi:
BIG Geoservices RBI - BATASWILAYAH/Administrasi_AR_Kecamatan_10K MapServer layer 0
URL:
https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/Administrasi_AR_Kecamatan_10K/MapServer/0

Sumber data kejadian/dampak yang dicek:
1. Portal Satu Data Bencana Indonesia / BNPB
   Dataset: Kompilasi Data Kejadian dan Dampak Bencana
   URL: https://data.bnpb.go.id/dataset/data-bencana-indonesia
   Catatan portal: dataset bersumber dari DIBI BNPB dan dimodifikasi 16 April 2026.
2. DIBI/BNPB Data Bencana - tabel pencarian
   URL: https://gis.bnpb.go.id/databencana/tabel/pencarian.php
   Filter yang dicek: 2025-01-01 sampai 2025-12-31.
3. BPBD DIY
   URL: https://bpbd.jogjaprov.go.id/
   Digunakan sebagai pembanding naratif kejadian 2025, bukan sebagai tabel agregasi kecamatan final.

Tanggal akses:
${today}

CRS:
EPSG:4326 - WGS 84 / CRS84 longitude-latitude.

Jumlah polygon:
${finalGeojson.features.length} kecamatan/kapanewon/kemantren.

Kabupaten/kota tercakup:
Kabupaten Bantul, Kabupaten Gunungkidul, Kabupaten Kulon Progo, Kabupaten Sleman, Kota Yogyakarta.

Metode:
1. Mengambil polygon kecamatan/kapanewon/kemantren DIY dari layanan BIG.
2. Menormalisasi atribut menjadi provinsi, kab_kota, kecamatan.
3. Menambahkan kolom dampak sesuai kebutuhan QGIS.
4. Tidak mengisi angka kejadian/dampak karena data resmi publik belum menyediakan agregasi kecamatan tahun 2025 penuh yang dapat diverifikasi tanpa asumsi.
5. kelas_dampak diisi "Data belum tersedia" agar pengguna QGIS tidak salah membaca sebagai "Tidak ada kejadian".

Keterbatasan:
File ini adalah template polygon resmi siap join/input. Untuk peta final berangka, isi kolom jumlah_kejadian, meninggal, luka_luka, hilang, mengungsi, rumah_rusak, jumlah_dampak, dan kelas_dampak setelah memperoleh tabel resmi yang sudah mengagregasikan dampak per kecamatan dari DIBI/BNPB/BPBD DIY.

Catatan GeoPackage:
File GeoPackage tidak dibuat karena lingkungan kerja ini tidak menyediakan GDAL/ogr2ogr atau library geospasial Python. GeoJSON yang dibuat tetap valid dan dapat langsung dibuka di QGIS.
`;

fs.writeFileSync(path.join(outDir, 'metadata_sumber_data.txt'), metadata, 'utf8');

const readme = `README QGIS

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
`;

fs.writeFileSync(path.join(outDir, 'README_QGIS.txt'), readme, 'utf8');

console.log(`created ${finalGeojson.features.length} features`);
console.log(`dibi diy rows detected: ${diyRows.length}`);
