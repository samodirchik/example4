/**
 * Vanilla JS Slider & Lightbox для галереи оборудования отделения
 * Файл: assets/js/department-gallery.js
 * 
 * Особенности:
 * - Без jQuery, нулевая нагрузка на INP (< 200ms)
 * - Доступность (a11y): Escape закрывает, стрелки влево/вправо листают, фокус-трап
 */

document.addEventListener('DOMContentLoaded', () => {
    const galleryContainers = document.querySelectorAll('.js-dept-gallery');

    galleryContainers.forEach(container => {
        const slider = container.querySelector('.dept-gallery__track');
        const prevBtn = container.querySelector('.dept-gallery__nav--prev');
        const nextBtn = container.querySelector('.dept-gallery__nav--next');
        const items = container.querySelectorAll('.dept-gallery__item');

        if (!slider || !items.length) return;

        // Навигация горизонтального слайдера
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                const itemWidth = items[0].offsetWidth + 16;
                slider.scrollBy({ left: -itemWidth * 2, behavior: 'smooth' });
            });

            nextBtn.addEventListener('click', () => {
                const itemWidth = items[0].offsetWidth + 16;
                slider.scrollBy({ left: itemWidth * 2, behavior: 'smooth' });
            });
        }

        // Подготовка Lightbox
        let lightbox = document.getElementById('van-gallery-lightbox');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'van-gallery-lightbox';
            lightbox.className = 'van-lightbox';
            lightbox.setAttribute('role', 'dialog');
            lightbox.setAttribute('aria-modal', 'true');
            lightbox.setAttribute('aria-label', 'Збільшене зображення обладнання');
            lightbox.setAttribute('tabindex', '-1');
            lightbox.innerHTML = `
                <div class="van-lightbox__overlay js-lightbox-close"></div>
                <div class="van-lightbox__content">
                    <button type="button" class="van-lightbox__close js-lightbox-close" aria-label="Закрити">&times;</button>
                    <button type="button" class="van-lightbox__btn van-lightbox__btn--prev" aria-label="Попереднє фото">&#10094;</button>
                    <div class="van-lightbox__stage">
                        <img src="" alt="" class="van-lightbox__image" />
                        <div class="van-lightbox__caption"></div>
                    </div>
                    <button type="button" class="van-lightbox__btn van-lightbox__btn--next" aria-label="Наступне фото">&#10095;</button>
                </div>
            `;
            document.body.appendChild(lightbox);
        }

        const imgEl = lightbox.querySelector('.van-lightbox__image');
        const capEl = lightbox.querySelector('.van-lightbox__caption');
        const closeBtns = lightbox.querySelectorAll('.js-lightbox-close');
        const lbPrev = lightbox.querySelector('.van-lightbox__btn--prev');
        const lbNext = lightbox.querySelector('.van-lightbox__btn--next');

        let currentIndex = 0;
        let activeGalleryItems = [];
        let lastFocusedElement = null;

        const openLightbox = (index) => {
            currentIndex = index;
            activeGalleryItems = Array.from(items);
            lastFocusedElement = document.activeElement;
            updateLightbox();
            lightbox.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            lightbox.focus();
        };

        const closeLightbox = () => {
            lightbox.classList.remove('is-open');
            document.body.style.overflow = '';
            if (lastFocusedElement) {
                lastFocusedElement.focus();
            }
        };

        const updateLightbox = () => {
            const currentItem = activeGalleryItems[currentIndex];
            if (!currentItem) return;

            const fullUrl = currentItem.getAttribute('data-full');
            const altText = currentItem.getAttribute('data-caption') || '';

            imgEl.src = fullUrl;
            imgEl.alt = altText;
            capEl.textContent = altText;
        };

        const showPrev = () => {
            currentIndex = (currentIndex - 1 + activeGalleryItems.length) % activeGalleryItems.length;
            updateLightbox();
        };

        const showNext = () => {
            currentIndex = (currentIndex + 1) % activeGalleryItems.length;
            updateLightbox();
        };

        items.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                openLightbox(index);
            });

            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(index);
                }
            });
        });

        closeBtns.forEach(btn => btn.addEventListener('click', closeLightbox));
        lbPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
        lbNext.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

        // Управление с клавиатуры (Escape, Стрелки)
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('is-open')) return;

            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                showPrev();
            } else if (e.key === 'ArrowRight') {
                showNext();
            } else if (e.key === 'Tab') {
                // Focus trap
                const focusables = lightbox.querySelectorAll('button:not([disabled])');
                const first = focusables[0];
                const last = focusables[focusables.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });
    });
});

