const BGM_PREF_KEY = 'jogja-siaga-bgm-on';

export function initBgm() {
    const audio = document.getElementById('bgm-audio');
    const btn = document.getElementById('bgm-toggle');
    if (!audio || !btn) return;

    const setUi = (playing) => {
        btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
        btn.setAttribute('aria-label', playing ? 'Matikan musik latar' : 'Putar musik latar');
        btn.classList.toggle('is-playing', playing);
        if (playing) btn.classList.remove('bgm-error');
        btn.textContent = playing ? 'Matikan musik' : 'Musik Jogja';
        btn.title = playing
            ? 'Klik untuk menjeda musik latar'
            : 'Klik untuk memutar musik (file lokal atau fallback Wikimedia — lihat audio/README.md)';
    };

    setUi(false);

    audio.addEventListener('error', () => {
        btn.classList.add('bgm-error');
        btn.title = 'Audio tidak dapat dimuat — periksa file atau jaringan.';
    });
    audio.addEventListener('playing', () => btn.classList.remove('bgm-error'));

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
            console.warn(
                'Musik latar: pemutaran gagal (periksa audio/jogja-ambient.mp3 atau sumber fallback di README).',
                e?.message || e
            );
            btn.classList.add('bgm-error');
            btn.title = 'Pemutaran ditolak atau file tidak ditemukan.';
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
            btn.classList.remove('bgm-error');
            btn.setAttribute('aria-pressed', 'true');
            btn.setAttribute('aria-label', 'Matikan musik latar');
            btn.classList.add('is-playing');
            btn.textContent = 'Matikan musik';
            btn.title = 'Klik untuk menjeda musik latar';
        })
        .catch(() => {
            /* Missing file or policy — silent */
        });
}
