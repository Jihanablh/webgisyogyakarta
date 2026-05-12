# Musik latar Jogja Siaga

## File lokal (disarankan)

Letakkan berkas MP3 instrumental (gamelan / nusantara, **lisensi yang mengizinkan** penggunaan proyek Anda) di folder ini dengan nama:

**`jogja-ambient.mp3`**

Contoh sumber bebas royalti: cari di [Pixabay Music — gamelan Indonesia](https://pixabay.com/music/search/gamelan%20indonesia/), unduh MP3, lalu rename menjadi `jogja-ambient.mp3`.

Peramban akan mencoba sumber ini **terlebih dahulu**.

## Fallback bawaan halaman

Jika `jogja-ambient.mp3` tidak ada atau gagal dimuat, elemen `<audio>` memakai sumber sekunder:

- **URL:** `https://upload.wikimedia.org/wikipedia/commons/8/87/C_scale_single_channel.ogg`
- **Format:** Ogg Vorbis (mono, contoh singkat)
- **Lisensi:** biasanya **CC BY-SA** atau setara pada Wikimedia Commons; verifikasi di halaman berkas Commons jika Anda mendistribusikan ulang aplikasi secara komersial.

Ini hanya untuk **demo teknis** pemutaran; untuk pengalaman pendengaran yang layak, gunakan file MP3 lokal Anda sendiri.

## Tombol kontrol

Tombol **Musik Jogja** memakai `aria-pressed` dan kelas `.is-playing` agar status putar/jeda jelas bagi pembaca layar dan gaya visual.
