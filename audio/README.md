# Musik latar Jogja Siaga

## Hak cipta & sumber
- **YouTube (embed resmi):** jika `CONFIG.bgmYoutubeVideoId` di `js/state.js` diisi dengan ID video resmi (11 karakter), pemutaran memakai **IFrame API** YouTube setelah **gestur klik** pengguna. Ini **bukan** distribusi ulang file audio; aliran dari YouTube tunduk pada syarat layanan YouTube dan pemegang hak.
- **Tanpa ID YouTube:** urutan fallback di bawah ini dipakai.
- **Jangan** memasukkan rekaman berkarya ciptaan pihak ketiga ke repositori tanpa izin tertulis.

## Urutan sumber pemutaran
1. **YouTube embed** — hanya jika `CONFIG.bgmYoutubeVideoId` valid dan host `#bgm-youtube-host` ada; pemutaran setelah klik tombol.
2. **File lokal** — `jogja-ambient.mp3` di folder ini (unduh sendiri dengan lisensi yang mengizinkan proyek Anda).
3. **Wikimedia Commons (OGG)** — fallback jika MP3 tidak ada atau gagal dimuat (demo singkat; Safari kadang tidak memutar OGG).
4. **Web Audio “pad” sintetis** — jika `<audio>` gagal total atau `play()` ditolak, `js/bgm-synth.js` menghasilkan ambience ringan (multi-sine) yang dihentikan bersama tombol jeda.

Tanpa `crossOrigin` pada elemen `<audio>` kecuali sumber Anda memang memerlukan CORS.

## File lokal

Letakkan berkas MP3 instrumental (gamelan / nusantara) di folder ini dengan nama:

**`jogja-ambient.mp3`**

Contoh sumber bebas royalti: cari di [Pixabay Music — gamelan Indonesia](https://pixabay.com/music/search/gamelan%20indonesia/), unduh MP3, lalu rename menjadi `jogja-ambient.mp3`.

## Fallback OGG (Wikimedia)

- **URL contoh:** `https://upload.wikimedia.org/wikipedia/commons/8/87/C_scale_single_channel.ogg`
- **Format:** Ogg Vorbis
- Verifikasi lisensi di halaman Commons jika Anda mendistribusikan ulang aplikasi secara komersial.

## Tombol kontrol

Tombol BGM memakai `aria-pressed`, kelas `.is-playing`, judul trek pada label (mis. **Sesuatu di Jogja — KLA Project**), status **Putar/Jeda**, dan equalizer CSS (tiga bar) saat aktif.
