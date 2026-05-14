import { CATEGORIES } from './state.js';

function norm(s) {
    return String(s || '')
        .toLowerCase()
        .replace(/[.,]/g, ' ')
        .trim();
}

/**
 * Bangun indeks sederhana dari fitur GeoJSON yang sudah di-cache di State.
 */
export function buildGeoKnowledgeIndex(state) {
    const lines = [];
    const byKec = new Map();
    const byKab = new Map();

    for (const catKey of Object.keys(CATEGORIES)) {
        const arr = state.rawGeojsonCache?.[catKey];
        if (!Array.isArray(arr)) continue;
        const catLabel = CATEGORIES[catKey]?.label || catKey;

        for (const f of arr) {
            const p = f.properties || {};
            const name = String(p.name || p.nama || 'Tanpa nama').trim();
            const kec = norm(p.kecamatan || p.Kecamatan || p.district || p.DISTRICT || '');
            const kab = norm(p.kabupaten || p.kota || p.Kabupaten || p.city || '');
            const sub = String(p.subcategory || p.type_layer || p.type || '').trim();
            const kap = p.kapasitas != null ? String(p.kapasitas) : '';

            const bits = [`${catLabel}`, name, kec, kab, sub, kap].filter(Boolean).join(' · ');
            lines.push({ text: bits, name, kec, kab, sub, catLabel });

            if (kec) {
                if (!byKec.has(kec)) byKec.set(kec, []);
                if (byKec.get(kec).length < 80) byKec.get(kec).push({ name, sub, catLabel });
            }
            if (kab) {
                if (!byKab.has(kab)) byKab.set(kab, []);
                if (byKab.get(kab).length < 80) byKab.get(kab).push({ name, sub, catLabel });
            }
        }
    }

    return { lines, byKec, byKab };
}

function tokens(q) {
    const stop = new Set([
        'yang',
        'di',
        'ke',
        'dari',
        'dan',
        'atau',
        'ini',
        'itu',
        'ada',
        'dengan',
        'untuk',
        'pada',
        'dalam',
        'berapa',
        'banyak',
        'mana',
        'apa',
        'siapa',
        'dimana',
        'dimanakah',
        'tolong',
        'bisa',
        'list',
        'sebutkan',
        'nama'
    ]);
    return norm(q)
        .split(/\s+/)
        .filter((t) => t.length > 1 && !stop.has(t));
}

/**
 * @returns {string|null}
 */
export function queryGeoKnowledge(index, userQuestion) {
    if (!index?.lines?.length) return null;
    const toks = tokens(userQuestion);
    if (!toks.length) return null;

    const qn = norm(userQuestion);

    if (/pengungsian|shelter|titik kumpul|posko/i.test(qn)) {
        for (const [kec, arr] of index.byKec) {
            if (!kec) continue;
            if (!toks.some((t) => kec.includes(t) || t.includes(kec))) continue;
            const hits = arr.filter((x) => /pengungs|kumpul|posko|shelter|evakuasi/i.test(`${x.sub} ${x.name}`));
            if (hits.length) {
                const list = hits.slice(0, 12).map((h) => `• ${h.name} (${h.sub || h.catLabel})`);
                return `Di sekitar ${kec}, saya menemukan beberapa titik yang relevan:\n${list.join('\n')}\n\nKalau mau, buka peta lalu cari salah satu namanya agar langsung terlihat posisinya.`;
            }
        }
    }

    if (/wisata|obyek|objek|pariwisata|destinasi/i.test(qn)) {
        for (const [kab, arr] of index.byKab) {
            if (!kab) continue;
            if (!toks.some((t) => kab.includes(t) || t.includes(kab))) continue;
            const hits = arr.filter((x) => /wisata|pariwisata|candi|museum|alam|pantai/i.test(`${x.sub} ${x.name} ${x.catLabel}`));
            if (hits.length) {
                const list = hits.slice(0, 12).map((h) => `• ${h.name} (${h.sub || h.catLabel})`);
                return `Untuk area ${kab}, ini beberapa lokasi yang bisa kamu cek:\n${list.join('\n')}`;
            }
        }
    }

    const scored = [];
    for (const row of index.lines) {
        const hay = norm(row.text);
        let s = 0;
        for (const t of toks) {
            if (hay.includes(t)) s += 2;
        }
        if (s > 0) scored.push({ s, row });
    }
    scored.sort((a, b) => b.s - a.s);
    const top = scored.slice(0, 8);
    if (!top.length) return null;

    const out = top.map((x) => `• ${x.row.text}`);
    return `Aku menemukan beberapa lokasi yang paling relevan dengan pertanyaanmu:\n${out.join('\n')}`;
}
