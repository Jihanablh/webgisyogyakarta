import { CONFIG } from './state.js?v=20260526-round26-welcome-encoding';
import { startAmbientSynth, stopAmbientSynth } from './bgm-synth.js?v=20260526-round26-welcome-encoding';

const BGM_PREF_KEY = 'jogja-siaga-bgm-on';

const TITLE_SHORT = 'Sesuatu di Jogja — Adhitia Sofyan';

let _usingSynth = false;
let _ytPlayer = null;
let _ytReady = false;

function getLabelEl(btn) {
    return btn?.querySelector?.('.bgm-label');
}

function ytIdValid(id) {
    return typeof id === 'string' && /^[a-zA-Z0-9_-]{11}$/.test(id.trim());
}

function loadYouTubeApi() {
    return new Promise((resolve) => {
        if (window.YT && window.YT.Player) {
            resolve();
            return;
        }
        const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            if (typeof prev === 'function') prev();
            resolve();
        };
        if (existing) return;
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        s.async = true;
        document.head.appendChild(s);
    });
}

function ensureYtPlayer(hostId, videoId, onState) {
    return new Promise((resolve, reject) => {
        if (_ytPlayer) {
            resolve(_ytPlayer);
            return;
        }
        loadYouTubeApi()
            .then(() => {
                _ytPlayer = new window.YT.Player(hostId, {
                    height: '180',
                    width: '320',
                    videoId,
                    playerVars: {
                        playsinline: 1,
                        controls: 0,
                        modestbranding: 1,
                        rel: 0
                    },
                    events: {
                        onReady: () => {
                            _ytReady = true;
                            const btn = document.getElementById('bgm-toggle');
                            if (btn) {
                                btn.disabled = false;
                                btn.title = `Putar — ${TITLE_SHORT}`;
                            }
                            resolve(_ytPlayer);
                        },
                        onStateChange: (e) => {
                            if (typeof onState === 'function') onState(e.data);
                        },
                        onError: () => reject(new Error('yt_error'))
                    }
                });
            })
            .catch(reject);
    });
}

function destroyYtPlayer() {
    try {
        _ytPlayer?.destroy?.();
    } catch (_) {}
    _ytPlayer = null;
    _ytReady = false;
    const host = document.getElementById('bgm-youtube-host');
    if (host) host.innerHTML = '';
}

export function initBgm() {
    const audio = document.getElementById('bgm-audio');
    const btn = document.getElementById('bgm-toggle');
    const host = document.getElementById('bgm-youtube-host');
    if (!btn) return;

    const vid = (CONFIG.bgmYoutubeVideoId || '').trim();
    const useYt = ytIdValid(vid) && host;

    const setUi = (playing) => {
        btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
        btn.setAttribute('aria-label', playing ? 'Jeda musik' : 'Putar musik');
        btn.classList.toggle('is-playing', playing);
        if (playing) btn.classList.remove('bgm-error');
        const lab = getLabelEl(btn);
        // Always show song title; play/pause communicated via icon/class
        if (lab) lab.textContent = TITLE_SHORT;
        btn.title = playing ? `Sedang diputar — ${TITLE_SHORT}` : `Putar — ${TITLE_SHORT}`;
    };

    setUi(false);
    btn.disabled = true;
    btn.title = 'Memuat pemutar musik…';

    if (audio) {
        audio.addEventListener('error', () => {
            btn.classList.add('bgm-error');
            btn.title = 'File audio gagal — atur CONFIG.bgmYoutubeVideoId atau letakkan audio/jogja-ambient.mp3';
        });
        audio.addEventListener('playing', () => {
            btn.classList.remove('bgm-error');
        });
    }

    if (useYt) {
        ensureYtPlayer('bgm-youtube-host', vid, (st) => {
            if (st === 1) setUi(true);
            if (st === 2 || st === 0) {
                setUi(false);
                localStorage.setItem(BGM_PREF_KEY, '0');
            }
        }).catch((e) => {
            console.warn('YouTube BGM init gagal, tombol fallback diaktifkan', e);
            destroyYtPlayer();
            btn.disabled = false;
            btn.title = `Putar — ${TITLE_SHORT}`;
        });
    } else {
        btn.disabled = false;
        btn.title = `Putar — ${TITLE_SHORT}`;
    }

    btn.addEventListener('click', async () => {
        if (_usingSynth) {
            stopAmbientSynth();
            _usingSynth = false;
            setUi(false);
            localStorage.setItem(BGM_PREF_KEY, '0');
            return;
        }

        if (useYt && _ytPlayer && _ytReady) {
            const st = _ytPlayer.getPlayerState?.();
            if (st === 1) {
                _ytPlayer.pauseVideo();
                setUi(false);
                localStorage.setItem(BGM_PREF_KEY, '0');
                return;
            }
        }

        if (useYt) {
            try {
                if (audio && !audio.paused) audio.pause();
                await ensureYtPlayer('bgm-youtube-host', vid, (st) => {
                    if (st === 1) setUi(true);
                    if (st === 2 || st === 0) {
                        setUi(false);
                        localStorage.setItem(BGM_PREF_KEY, '0');
                    }
                });
                _ytPlayer.unMute();
                _ytPlayer.setVolume(70);
                _ytPlayer.playVideo();
                setUi(true);
                localStorage.setItem(BGM_PREF_KEY, '1');
                return;
            } catch (e) {
                console.warn('YouTube BGM gagal, fallback audio/sintesis', e);
                destroyYtPlayer();
            }
        }

        if (audio && !audio.paused) {
            audio.pause();
            setUi(false);
            localStorage.setItem(BGM_PREF_KEY, '0');
            return;
        }

        if (audio) {
            try {
                audio.volume = 0.28;
                await audio.play();
                setUi(true);
                localStorage.setItem(BGM_PREF_KEY, '1');
                return;
            } catch (e) {
                console.warn('audio.play gagal', e?.message || e);
            }
        }

        if (startAmbientSynth()) {
            _usingSynth = true;
            btn.classList.remove('bgm-error');
            setUi(true);
            localStorage.setItem(BGM_PREF_KEY, '1');
        } else {
            btn.classList.add('bgm-error');
            btn.title =
                'Pemutaran ditolak. Isi CONFIG.bgmYoutubeVideoId (11 karakter) di state.js atau tambahkan audio/jogja-ambient.mp3';
            setUi(false);
            localStorage.setItem(BGM_PREF_KEY, '0');
        }
    });
}

export function tryResumeBgmFromWelcomeGesture() {
    if (localStorage.getItem(BGM_PREF_KEY) !== '1') return;
    const btn = document.getElementById('bgm-toggle');
    if (!btn) return;
    btn.click();
}
