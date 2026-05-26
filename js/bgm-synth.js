/** Continuous soft pad — Web Audio fallback when <audio> fails. */
let _ctx = null;
let _master = null;
const _oscs = [];

export function startAmbientSynth() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
        stopAmbientSynth();
        _ctx = new AC();
        _master = _ctx.createGain();
        _master.gain.value = 0.07;
        _master.connect(_ctx.destination);
        if (_ctx.state === 'suspended') {
            void _ctx.resume();
        }
        const freqs = [130.81, 164.81, 196.0, 246.94];
        freqs.forEach((f, i) => {
            const osc = _ctx.createOscillator();
            const g = _ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = f;
            g.gain.value = 0.12 + i * 0.02;
            osc.connect(g);
            g.connect(_master);
            osc.start();
            _oscs.push(osc);
        });
        return true;
    } catch (_) {
        return false;
    }
}

export function stopAmbientSynth() {
    _oscs.forEach((osc) => {
        try {
            osc.stop();
        } catch (_) { /* */ }
    });
    _oscs.length = 0;
    if (_ctx) {
        try {
            _ctx.close();
        } catch (_) { /* */ }
    }
    _ctx = null;
    _master = null;
}
