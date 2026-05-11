import { State, CATEGORIES } from '../state.js';

let _initialized = false;

export function initStatisticsPage() {
    renderStatistik();
    _initialized = true;
}

function renderStatistik() {
    const content = document.getElementById('statistik-content');
    if (!content) return;

    const total     = Object.values(State.categoryData).reduce((s, d) => s + (d?.features?.length || 0), 0);
    const catCount  = Object.keys(CATEGORIES).length;
    const subcatCount = Object.values(State.categoryMeta).reduce((s, m) => s + Object.keys(m?.subcategories || {}).length, 0);

    const results = Object.entries(State.categoryData)
        .map(([k, data]) => ({
            key:   k,
            count: data?.features?.length || 0,
            color: CATEGORIES[k]?.color || '#3b82f6',
            label: CATEGORIES[k]?.label || k,
        }))
        .filter(r => r.count > 0)
        .sort((a, b) => b.count - a.count);

    const maxCount = results[0]?.count || 1;

    content.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px;">
        <div style="background:rgba(30,41,59,0.4);border:1px solid var(--border-glass);border-radius:12px;padding:20px;">
            <div style="font-size:30px;font-weight:700;color:var(--text-accent);">${total.toLocaleString()}</div>
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);margin-top:4px;">Total Tempat</div>
        </div>
        <div style="background:rgba(30,41,59,0.4);border:1px solid var(--border-glass);border-radius:12px;padding:20px;">
            <div style="font-size:30px;font-weight:700;color:var(--text-primary);">${catCount}</div>
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);margin-top:4px;">Kategori Utama</div>
        </div>
        <div style="background:rgba(30,41,59,0.4);border:1px solid var(--border-glass);border-radius:12px;padding:20px;">
            <div style="font-size:30px;font-weight:700;color:var(--text-primary);">${subcatCount}</div>
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);margin-top:4px;">Subkategori Detail</div>
        </div>
    </div>
    <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#484f58;margin-bottom:20px;">Distribusi Per Kategori</h3>
    <div style="display:flex;flex-direction:column;gap:14px;">
        ${results.map(r => {
            const pct = ((r.count / maxCount) * 100).toFixed(1);
            return `
            <div style="display:flex;align-items:center;gap:16px;">
                <div style="width:160px;font-size:13px;font-weight:600;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.label}</div>
                <div style="flex:1;height:8px;background:rgba(30,41,59,0.5);border-radius:4px;overflow:hidden;">
                    <div style="height:100%;border-radius:4px;width:0%;background:${r.color};transition:width 1s cubic-bezier(0.34,1.56,0.64,1);" data-target-width="${pct}%"></div>
                </div>
                <div style="width:70px;text-align:right;font-size:13px;font-weight:700;color:var(--text-primary);">${r.count.toLocaleString()}</div>
            </div>`;
        }).join('')}
    </div>`;

    setTimeout(() => {
        content.querySelectorAll('[data-target-width]').forEach(bar => {
            bar.style.width = bar.getAttribute('data-target-width');
        });
    }, 100);
}
