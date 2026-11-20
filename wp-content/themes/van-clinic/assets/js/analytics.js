/**
 * VAN CLINIC — DATA LAYER ANALYTICS (GA4 + GTM Event Bus)
 * Файл: assets/js/analytics.js
 * 
 * Особенности:
 * - Pure Vanilla JS, без внешних библиотек
 * - Нулевое влияние на FID / INP
 * - Строгое соблюдение приватности: никаких PII (телефон/email) в dataLayer
 */

document.addEventListener('DOMContentLoaded', () => {
    window.dataLayer = window.dataLayer || [];
    const body = document.body;
    const pageType = body.dataset.pageType || 'other';
    const postId   = body.dataset.postId || null;
    const specialty = body.dataset.specialty || '';

    // 1. generate_lead (Страница благодарности /spasibo/)
    if (pageType === 'thank_you' || window.location.pathname.includes('/spasibo/') || window.location.pathname.includes('/dyakuyemo/')) {
        const leadSent = sessionStorage.getItem('van_ga4_lead_sent');
        if (!leadSent) {
            const urlParams = new URLSearchParams(window.location.search);
            const leadId = urlParams.get('lead_id') || ('web_' + Date.now());

            window.dataLayer.push({
                event: 'generate_lead',
                lead_type: 'booking',
                lead_id: leadId
            });

            sessionStorage.setItem('van_ga4_lead_sent', '1');
        }
    }

    // 2. doctor_view (Просмотр профиля врача)
    if (pageType === 'doctor' && postId) {
        window.dataLayer.push({
            event: 'doctor_view',
            doctor_id: postId,
            specialty: specialty
        });
    }

    // 3. phone_click (Клик по кликабельным телефонным номерам)
    document.addEventListener('click', (e) => {
        const phoneLink = e.target.closest('a[href^="tel:"]');
        if (phoneLink) {
            const rawPhone = phoneLink.getAttribute('href').replace('tel:', '').trim();
            window.dataLayer.push({
                event: 'phone_click',
                phone: rawPhone,
                page_type: pageType
            });
        }
    });

    // 4. messenger_click (Клик по Telegram / Viber)
    document.addEventListener('click', (e) => {
        const messengerLink = e.target.closest('a[href*="t.me"], a[href*="telegram.me"], a[href^="viber:"]');
        if (messengerLink) {
            const href = messengerLink.getAttribute('href');
            const isTg = href.includes('t.me') || href.includes('telegram');
            const messengerType = isTg ? 'telegram' : 'viber';
            const location = messengerLink.dataset.location || (messengerLink.closest('footer') ? 'footer' : (messengerLink.closest('header') ? 'header' : 'content'));

            window.dataLayer.push({
                event: 'messenger_click',
                messenger: messengerType,
                location: location
            });
        }
    });

    // 5. booking_start (Клик по кнопке вызова модалки «Записатися»)
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-open-booking], .js-booking-open');
        if (trigger) {
            window.dataLayer.push({
                event: 'booking_start',
                doctor_id: trigger.dataset.doctorId || null,
                service_id: trigger.dataset.serviceId || null,
                branch_id: trigger.dataset.branchId || null,
                page_type: pageType
            });
        }
    });

    // 6. faq_open (Раскрытие аккордеона FAQ)
    document.addEventListener('click', (e) => {
        const header = e.target.closest('.accordion-header');
        if (header) {
            const item = header.closest('.accordion-item');
            // Проверяем состояние: если элемент открывается
            const isOpening = !item || !item.classList.contains('is-open');
            if (isOpening) {
                const questionText = header.querySelector('span')?.textContent.trim() || header.textContent.trim();
                window.dataLayer.push({
                    event: 'faq_open',
                    question: questionText
                });
            }
        }
    });

    // 7. price_search (Живой поиск по прайс-листу с debounce 500ms)
    const priceInput = document.getElementById('price-search-input');
    if (priceInput) {
        let priceTimer = null;
        priceInput.addEventListener('input', (e) => {
            clearTimeout(priceTimer);
            priceTimer = setTimeout(() => {
                const val = e.target.value.trim();
                if (val.length >= 2) {
                    const visibleCount = document.querySelectorAll('.price-row:not([style*="display: none"])').length;
                    window.dataLayer.push({
                        event: 'price_search',
                        search_term: val,
                        results_count: visibleCount
                    });
                }
            }, 500);
        });
    }

    // 8. form_submit_contact (Успешная отправка формы обратной связи)
    // Слушаем кастомное событие van_contact_sent
    document.addEventListener('van_contact_sent', (e) => {
        const detail = e.detail || {};
        window.dataLayer.push({
            event: 'form_submit_contact',
            subject: detail.subject || 'question'
        });
    });
});

