export function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

export function toRad(d) { return d * Math.PI / 180; }

export function formatDistance(km) {
    if (km < 1) return (km * 1000).toFixed(0) + ' m';
    return km.toFixed(1) + ' km';
}

export function sanitizeText(str) {
    return String(str ?? '')
        .replace(new RegExp('\\u00c2\\u00b7', 'g'), '\u00b7')
        .replace(new RegExp('\\u00c2\\u00b0', 'g'), '\u00b0')
        .replace(new RegExp('\\u00c2\\u00b1', 'g'), '\u00b1')
        .replace(new RegExp('\\u00e2\\u20ac\\u201d|\\u00e2\\u20ac"', 'g'), '\u2014')
        .replace(new RegExp('\\u00e2\\u20ac\\u201c', 'g'), '\u2013')
        .replace(new RegExp('\\u00e2\\u20ac\\u2122', 'g'), "'")
        .replace(new RegExp('\\u00e2\\u20ac\\u0153|\\u00e2\\u20ac\\u009d|\\u00e2\\u20ac', 'g'), '"')
        .replace(new RegExp('\\u00e2\\u20ac\\u00a6', 'g'), '\u2026')
        .replace(new RegExp('\\u00e2\\u2020\\u2019', 'g'), '\u2192')
        .replace(new RegExp('\\u00e2\\u20ac\\u00a2', 'g'), '\u2022')
        .replace(new RegExp('\\u00e2\\u02dc\\u2026', 'g'), '\u2605')
        .replace(new RegExp('\\u00e2\\u02dc\\u2020', 'g'), '\u2606')
        .replace(new RegExp('\\u00e2\\u02dc\\u00be', 'g'), '\u263e')
        .replace(new RegExp('\\u00e2\\u02dc\\u20ac', 'g'), '\u2600')
        .replace(new RegExp('\\u00c3\\u0097', 'g'), '\u00d7')
        .replace(/\u00C3\u0082\u00C2\u00B7|\u00C2\u00B7/g, '\u00b7')
        .replace(/\u00C3\u0082\u00C2\u00B0|\u00C2\u00B0/g, '\u00b0')
        .replace(/\u00C3\u0082\u00C2\u00B1|\u00C2\u00B1/g, '\u00b1')
        .replace(/\u00C3\u0097/g, '\u00d7')
        .replace(/\u00E2\u20AC\u201D/g, '\u2014')
        .replace(/\u00E2\u20AC\u201C/g, '\u2013')
        .replace(/\u00E2\u20AC\u2122/g, "'")
        .replace(/\u00E2\u20AC\u0153|\u00E2\u20AC\u009D/g, '"')
        .replace(/\u00E2\u20AC\u00A6/g, '\u2026')
        .replace(/\u00E2\u2020\u2019/g, '\u2192')
        .replace(/\u00E2\u20AC\u00A2/g, '\u2022')
        .replace(/\u00E2\u02DC\u2026/g, '\u2605')
        .replace(/\u00E2\u02DC\u2020/g, '\u2606')
        .replace(/\u00E2\u02DC\u00BE/g, '\u263e')
        .replace(/\u00E2\u02DC\u20AC/g, '\u2600')
        .replace(/\u00E2\u2122\u00BF/g, '\u267f')
        .replace(/\u00E2\u203A\u00B5/g, '\u26f5')
        .replace(/\u00E2\u203A\u00BA/g, '\u26fa')
        .replace(/\u00E2\u0161\u00A1/g, '\u26a1');
}

export function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.innerText = sanitizeText(str);
    return div.innerHTML;
}

export function getFeatureCenter(feature) {
    if (feature.geometry.type === 'Point') {
        return [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
    }
    if (feature.geometry.type === 'Polygon') {
        let lats = 0, lngs = 0, count = 0;
        feature.geometry.coordinates[0].forEach(coord => {
            lngs += coord[0]; lats += coord[1]; count++;
        });
        return [lats/count, lngs/count];
    }
    if (feature.geometry.type === 'MultiPolygon') {
        return [feature.geometry.coordinates[0][0][0][1], feature.geometry.coordinates[0][0][0][0]];
    }
    return [-7.7956, 110.3695];
}
