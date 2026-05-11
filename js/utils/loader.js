export class LoadingManager {
  constructor(total) {
    this.total = total;
    this.loaded = 0;
    this.bar = document.getElementById('loading-bar');
    this.label = document.getElementById('loading-label');
  }

  tick(labelStr) {
    this.loaded++;
    const pct = (this.loaded / this.total) * 100;
    if(this.bar) this.bar.style.width = pct + '%';
    if(this.label) this.label.textContent = `Memuat ${labelStr}...`;
    if (this.loaded === this.total) this.complete();
  }

  complete() {
    setTimeout(() => {
      const el = document.getElementById('loading-overlay');
      if(el) el.classList.add('hidden');
    }, 300);
  }
}

export async function loadLargeGeoJSON(url, onChunk) {
  const response = await fetch(url);
  const data = await response.json();
  const features = data.features;
  const CHUNK_SIZE = 200;

  for (let i = 0; i < features.length; i += CHUNK_SIZE) {
    const chunk = features.slice(i, i + CHUNK_SIZE);
    onChunk(chunk);
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}
