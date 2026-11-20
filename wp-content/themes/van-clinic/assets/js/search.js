/**
 * Поиск по сайту VAN Clinic: переключение табов и GA4 event
 * Файл: assets/js/search.js
 */

document.addEventListener('DOMContentLoaded', () => {
    const searchContainer = document.querySelector('.search-results-page');
    if (!searchContainer) return;

    const searchTerm = searchContainer.dataset.searchTerm || '';
    const totalResults = parseInt(searchContainer.dataset.resultsCount || '0', 10);

    // 1. Фиксация GA4 site_search события (только один раз при загрузке страницы)
    if (searchTerm) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'site_search',
            search_term: searchTerm,
            results_count: totalResults
        });
    }

    // 2. Интерактивные табы без перезагрузки (progressive enhancement)
    const tabs = document.querySelectorAll('.js-search-tab');
    const items = document.querySelectorAll('.js-search-item');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const type = tab.dataset.type;
            if (!type) return;

            // Если клик с модификатором (Ctrl/Cmd) — разрешаем открытие в новой вкладке
            if (e.metaKey || e.ctrlKey) return;

            e.preventDefault();

            tabs.forEach(t => t.classList.remove('is-active'));
            tab.classList.add('is-active');

            // Фильтрация элементов на клиенте
            let visibleCount = 0;
            items.forEach(item => {
                const itemGroup = item.dataset.group;
                if (type === 'all' || itemGroup === type) {
                    item.style.display = '';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            // Обновление URL в строке браузера без перезагрузки
            const url = new URL(window.location.href);
            if (type === 'all') {
                url.searchParams.delete('type');
            } else {
                url.searchParams.set('type', type);
            }
            window.history.pushState({}, '', url.toString());
        });
    });
});

