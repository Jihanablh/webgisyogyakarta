import os

def main():
    with open('archive/app.js', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    def get_lines(start, end):
        return "".join(lines[start-1:end])

    # js/sidebar.js
    # 432-636: Category Tabs & Accordion
    # 656-793: Search
    # 860-882: initSidebar
    sidebar_code = """import { State, CATEGORIES } from './state.js';
import { getFeatureCenter } from './utils/helpers.js';

export function initSidebar({ map, router, onCategoryToggle }) {
    // Add logic from app.js
""" + get_lines(432, 636) + get_lines(656, 793) + get_lines(860, 882) + """
    window.renderCategoryTabs = renderCategoryTabs;
    window.activateCategory = activateCategory;
    window.renderSubcatDetail = renderSubcatDetail;
    window.renderAccordion = renderAccordion;
    window.buildSearchIndex = buildSearchIndex;
    window.initSearch = initSearch;
    window.performSearch = performSearch;
    window.handleSearchSelect = handleSearchSelect;
    window.removeSearchHighlight = removeSearchHighlight;
}
"""
    with open('js/sidebar.js', 'w', encoding='utf-8') as f:
        f.write(sidebar_code)

    # js/detail-panel.js
    # 795-858: Info Card
    # 884-1072: Tourism Panel
    # 1093-1247: Disaster Panel
    detail_panel_code = """import { State, CATEGORIES } from './state.js';
import { formatDistance, escapeHtml } from './utils/helpers.js';

export function initDetailPanel() {
    // We attach these to window so legacy onclicks in markers work
    window.showInfoCard = showInfoCard;
    window.closeInfoCard = closeInfoCard;
    window.showTourismPanel = showTourismPanel;
    window.closeTourismPanel = closeTourismPanel;
    window.renderMiniBarChart = renderMiniBarChart;
    window.buildHeatmap = buildHeatmap;
    window.renderDisasterSubTabs = renderDisasterSubTabs;
    window.showDisasterPanel = showDisasterPanel;
    window.closeDisasterPanel = closeDisasterPanel;
    window.renderRecentEvents = renderRecentEvents;
}
""" + get_lines(795, 858) + get_lines(884, 1072) + get_lines(1093, 1247)
    with open('js/detail-panel.js', 'w', encoding='utf-8') as f:
        f.write(detail_panel_code)

    # js/pages/report.js
    # 1283-1322
    report_code = """import { State, CATEGORIES } from '../state.js';

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
""" + get_lines(1283, 1322)
    with open('js/pages/report.js', 'w', encoding='utf-8') as f:
        f.write(report_code)

    # js/pages/statistics.js
    # 1324-1380
    stat_code = """import { State, CATEGORIES } from '../state.js';

export function initStatisticsPage() {
    renderStatistik();
}
""" + get_lines(1324, 1380)
    with open('js/pages/statistics.js', 'w', encoding='utf-8') as f:
        f.write(stat_code)

    # js/pages/about.js
    about_code = """export function initAboutPage() {
    // About page doesn't need dynamic JS rendering right now
}
"""
    with open('js/pages/about.js', 'w', encoding='utf-8') as f:
        f.write(about_code)

if __name__ == '__main__':
    main()
