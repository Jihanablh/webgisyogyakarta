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

export function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.innerText = str;
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
