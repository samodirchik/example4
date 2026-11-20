/**
 * Універсальний модуль динамічної підміни телефонних номерів (Колл-трекінг)
 * Файл: assets/js/calltracking.js
 * 
 * Підтримка: Binotel, Ringostat, Generic Pool
 * Захист: Нульовий збій верстки при відсутності провайдера (Graceful Fallback)
 */

(function(window, document) {
    'use strict';

    const VanCallTracking = {
        config: {
            provider: 'generic',
            pool: [],
            cookieName: 'van_calltracking_source',
            cookieDays: 30
        },

        init(userConfig) {
            this.config = Object.assign({}, this.config, userConfig || {});
            const source = this.detectSource();
            this.setSourceCookie(source);
            this.processSwaps(source);
        },

        detectSource() {
            const urlParams = new URLSearchParams(window.location.search);
            const utmSource = urlParams.get('utm_source');
            const gclid = urlParams.get('gclid');

            if (gclid || (utmSource && (utmSource.includes('cpc') || utmSource.includes('google')))) {
                return 'google_ads';
            }
            if (utmSource && (utmSource.includes('fb') || utmSource.includes('facebook') || utmSource.includes('instagram'))) {
                return 'social';
            }
            if (utmSource) {
                return utmSource.toLowerCase();
            }

            // Перевірка Referer
            const ref = document.referrer.toLowerCase();
            if (ref.includes('google.') || ref.includes('bing.') || ref.includes('ukr.net')) {
                return 'organic';
            }

            // Перевірка збереженої cookie
            const saved = this.getSourceCookie();
            if (saved) {
                return saved;
            }

            return 'direct';
        },

        setSourceCookie(source) {
            const date = new Date();
            date.setTime(date.getTime() + (this.config.cookieDays * 24 * 60 * 60 * 1000));
            document.cookie = `${this.config.cookieName}=${encodeURIComponent(source)};expires=${date.toUTCString()};path=/;SameSite=Lax`;
        },

        getSourceCookie() {
            const match = document.cookie.match(new RegExp('(^| )' + this.config.cookieName + '=([^;]+)'));
            return match ? decodeURIComponent(match[2]) : null;
        },

        getNumber(originalPhone, source) {
            if (!this.config.pool || !Array.isArray(this.config.pool) || !this.config.pool.length) {
                return originalPhone;
            }

            // Пошук номера під поточне джерело
            const match = this.config.pool.find(item => item.source === source);
            if (match && match.phone) {
                return match.phone;
            }

            return originalPhone;
        },

        processSwaps(source) {
            if (this.config.provider === 'off') return;

            const elements = document.querySelectorAll('a[href^="tel:"], [data-calltracking]');
            elements.forEach(el => {
                let originalPhone = el.getAttribute('href');
                if (originalPhone && originalPhone.startsWith('tel:')) {
                    originalPhone = originalPhone.replace('tel:', '').trim();
                } else {
                    originalPhone = el.textContent.trim();
                }

                const swappedPhone = this.getNumber(originalPhone, source);

                if (swappedPhone && swappedPhone !== originalPhone) {
                    if (el.tagName === 'A' && el.getAttribute('href')?.startsWith('tel:')) {
                        const cleanDigits = swappedPhone.replace(/[^\d+]/g, '');
                        el.setAttribute('href', 'tel:' + cleanDigits);
                    }

                    // Підміна видимого тексту, якщо він містив номер
                    if (el.textContent.includes(originalPhone) || /\+?380|\(0\d\d\)/.test(el.textContent)) {
                        el.textContent = swappedPhone;
                    }

                    // Фіксація в dataLayer
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({
                        event: 'call_tracking_swap',
                        original_phone: originalPhone,
                        swapped_phone: swappedPhone,
                        source: source
                    });
                }
            });
        }
    };

    window.VanCallTracking = VanCallTracking;

    document.addEventListener('DOMContentLoaded', () => {
        if (typeof window.vanCallTrackingConfig !== 'undefined') {
            VanCallTracking.init(window.vanCallTrackingConfig);
        }
    });

})(window, document);

