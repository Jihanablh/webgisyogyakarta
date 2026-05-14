import fs from 'node:fs';
import path from 'node:path';

const src = JSON.parse(fs.readFileSync('data/kebencanaan.geojson', 'utf8'));
const outDir = 'data/qgis';
fs.mkdirSync(outDir, { recursive: true });

const crs = { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::4326' } };
const refs = {
  erupsi: 'BPPTKG, BPBD DIY, Pergub DIY No. 62 Tahun 2020 Renkon Erupsi Gunung Merapi',
  banjir: 'BPBD DIY/BPBD Kabupaten-Kota, BMKG; pembaruan peta rawan bencana 2025',
  gempa: 'BMKG, BNPB/IRBI 2023, Pusgen Kementerian PUPR',
  longsor: 'BPBD DIY/BPBD Kabupaten-Kota, BNPB/IRBI 2023',
  kekeringan: 'BPBD Gunungkidul/BPBD DIY, BNPB/IRBI 2023',
  pengungsian: 'BPBD DIY/BPBD Sleman, Renkon Erupsi Merapi',
  evakuasi: 'BPBD Sleman/BPBD DIY, Renkon Erupsi Merapi'
};

function hasBadCoord(coords) {
  if (typeof coords === 'number') return !Number.isFinite(coords);
  if (!Array.isArray(coords) || coords.length === 0) return true;
  return coords.some(hasBadCoord);
}

function cleanProps(props, key) {
  const out = {};
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null) out[k] = '';
    else if (typeof v === 'object') out[k] = JSON.stringify(v);
    else out[k] = v;
  }
  out.sumber = out.sumber || refs[key] || out.sumber_data || 'BPBD DIY/BNPB/BMKG';
  out.tahun_data = String(out.tahun_data || String(out.last_updated || '2024').slice(0, 4) || '2024');
  out.keterangan = out.keterangan || `${out.name || 'Fitur'} - ${out.subcategory || out.type_layer || 'kebencanaan'}; disiapkan untuk QGIS EPSG:4326 dari data kebencanaan project dan rujukan publik.`;
  return out;
}

function validFeature(feature, geometryType) {
  return feature?.type === 'Feature' &&
    feature.geometry?.type === geometryType &&
    !hasBadCoord(feature.geometry.coordinates);
}

const groups = {
  'zona-erupsi-merapi.geojson': {
    key: 'erupsi',
    type: 'Polygon',
    test: f => f.properties?.subcategory === 'Risiko Erupsi Merapi' && f.geometry?.type === 'Polygon'
  },
  'zona-banjir.geojson': {
    key: 'banjir',
    type: 'Polygon',
    test: f => f.properties?.subcategory === 'Rawan Banjir' && f.geometry?.type === 'Polygon'
  },
  'zona-gempa.geojson': {
    key: 'gempa',
    type: 'Polygon',
    test: f => f.properties?.subcategory === 'Rawan Gempa' && f.geometry?.type === 'Polygon'
  },
  'zona-longsor.geojson': {
    key: 'longsor',
    type: 'Polygon',
    test: f => f.properties?.subcategory === 'Rawan Longsor' && f.geometry?.type === 'Polygon'
  },
  'zona-kekeringan.geojson': {
    key: 'kekeringan',
    type: 'Polygon',
    test: f => f.properties?.subcategory === 'Rawan Kekeringan' && f.geometry?.type === 'Polygon'
  },
  'jalur-evakuasi.geojson': {
    key: 'evakuasi',
    type: 'LineString',
    test: f => f.properties?.type_layer === 'jalur_evakuasi' && f.geometry?.type === 'LineString'
  },
  'tempat-pengungsian.geojson': {
    key: 'pengungsian',
    type: 'Point',
    test: f => f.properties?.type_layer === 'titik_pengungsian' && f.geometry?.type === 'Point'
  }
};

for (const [file, group] of Object.entries(groups)) {
  const features = src.features
    .filter(group.test)
    .filter(feature => validFeature(feature, group.type))
    .map(feature => ({
      type: 'Feature',
      geometry: feature.geometry,
      properties: cleanProps(feature.properties, group.key)
    }));
  const collection = {
    type: 'FeatureCollection',
    name: file.replace(/\.geojson$/, ''),
    crs,
    features
  };
  const json = JSON.stringify(collection, null, 2);
  JSON.parse(json);
  fs.writeFileSync(path.join(outDir, file), json);
  console.log(`${file}: ${features.length} feature`);
}
