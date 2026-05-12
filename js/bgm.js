const BGM_PREF_KEY = 'jogja-siaga-bgm-on';

export function initBgm() {
    const audio = document.getElementById('bgm-audio');
    const btn = document.getElementById('bgm-toggle');
    if (!audio || !btn) return;

    const setUi = (playing) => {
        btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
        btn.classList.toggle('is-playing', playing);
        btn.textContent = playing ? 'Matikan musik' : 'Musik Jogja';
    };

    setUi(false);

    btn.addEventListener('click', async () => {
        try {
            if (audio.paused) {
                audio.volume = 0.28;
                await audio.play();
                setUi(true);
                localStorage.setItem(BGM_PREF_KEY, '1');
            } else {
                audio.pause();
                setUi(false);
                localStorage.setItem(BGM_PREF_KEY, '0');
            }
        } catch (e) {
            console.warn('Musik latar: berkas tidak ditemukan atau pemutaran ditolak. Tambahkan audio/jogja-ambient.mp3 (lihat audio/README.md).', e?.message || e);
            setUi(false);
            localStorage.setItem(BGM_PREF_KEY, '0');
        }
    });
}

/** Call from welcome CTA (user gesture) so autoplay policies allow resume. */
export function tryResumeBgmFromWelcomeGesture() {
    if (localStorage.getItem(BGM_PREF_KEY) !== '1') return;
    const audio = document.getElementById('bgm-audio');
    const btn = document.getElementById('bgm-toggle');
    if (!audio || !btn) return;
    audio.volume = 0.26;
    audio.play()
        .then(() => {
            btn.setAttribute('aria-pressed', 'true');
            btn.classList.add('is-playing');
            btn.textContent = 'Matikan musik';
        })
        .catch(() => {
            /* Missing file or policy — silent */
        });
}
