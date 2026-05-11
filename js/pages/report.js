import { State, CATEGORIES } from '../state.js';

export function initReportPage() {
    renderLaporan('erupsi');
    document.querySelectorAll('.page-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.page-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            renderLaporan(e.target.dataset.disaster);
        });
    });
}
function renderLaporan(disasterType) {
    const content = document.getElementById('laporan-content');
    const hist = DISASTER_HISTORY[disasterType] || [];
    
    const totalKorban = hist.reduce((s, h) => s + (h.korban_jiwa || 0), 0);
    const totalPengungsi = hist.reduce((s, h) => s + (h.pengungsi || 0), 0);
    const accentColor = disasterType === 'erupsi' ? '#ef4444' : disasterType === 'banjir' ? '#3b82f6' : disasterType === 'gempa' ? '#ea580c' : '#ca8a04';

    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 300px 1fr; gap: 32px; align-items: start;">
            <div style="display: flex; flex-direction: column; gap: 16px; position: sticky; top: 120px;">
                <div style="background: #161b22; border-left: 3px solid ${accentColor}; border-radius: var(--radius-sm); padding: 16px;">
                    <div style="font-size: 32px; font-weight: 700; color: ${accentColor};">${totalKorban.toLocaleString()}</div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin-top: 4px;">Korban Jiwa</div>
                </div>
                <div style="background: #161b22; border-left: 3px solid ${accentColor}; border-radius: var(--radius-sm); padding: 16px;">
                    <div style="font-size: 32px; font-weight: 700; color: ${accentColor};">${totalPengungsi.toLocaleString()}</div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin-top: 4px;">Pengungsi</div>
                </div>
                <div style="background: #161b22; border-left: 3px solid ${accentColor}; border-radius: var(--radius-sm); padding: 16px;">
                    <div style="font-size: 24px; font-weight: 700; color: ${accentColor};">${hist[0] ? hist[0].kerugian_material : '-'}</div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin-top: 4px;">Kerugian (Terkini)</div>
                </div>
            </div>
            
            <div style="border-left: 1px solid #30363d; padding-left: 24px; display: flex; flex-direction: column; gap: 24px;">
                ${hist.length === 0 ? '<p style="color: var(--text-muted);">Belum ada data riwayat tercatat.</p>' : 
                hist.map(h => `
                    <div style="position: relative; background: rgba(30,41,59,0.3); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 20px; transition: all 0.3s; cursor: default;" onmouseover="this.style.background='#1c2128'; this.style.transform='translateX(4px)'" onmouseout="this.style.background='rgba(30,41,59,0.3)'; this.style.transform='translateX(0)'">
                        <div style="position: absolute; left: -29px; top: 24px; width: 10px; height: 10px; border-radius: 50%; background: ${accentColor}; border: 2px solid #0a0e1a;"></div>
                        <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">${h.tanggal}</div>
                        <div style="font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">${h.jenis} <span style="font-size: 11px; padding: 2px 8px; background: rgba(255,255,255,0.1); border-radius: 12px; margin-left: 8px; vertical-align: middle;">${h.skala || h.wilayah}</span></div>
                        <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">${h.korban_jiwa ? h.korban_jiwa + ' korban · ' : ''}${h.rumah_terdampak ? h.rumah_terdampak + ' rumah terdampak · ' : ''}${h.pengungsi ? h.pengungsi + ' mengungsi · ' : ''}${h.kerugian_material || ''}</div>
                        <p style="font-size: 14px; line-height: 1.6; color: var(--text-muted);">${h.deskripsi}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}
