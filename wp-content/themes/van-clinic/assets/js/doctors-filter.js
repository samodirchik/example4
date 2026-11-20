/**
 * VAN CLINIC — Doctors AJAX Filter & Live Search (Vanilla JS, AbortController, PushState)
 * Файл: assets/js/doctors-filter.js
 */

document.addEventListener('DOMContentLoaded', () => {
  const filterForm = document.getElementById('doctors-filter-form');
  const searchInput = document.getElementById('doctors-search-input');
  const specialtySelect = document.getElementById('doctors-specialty-select');
  const branchSelect = document.getElementById('doctors-branch-select');
  const sortSelect = document.getElementById('doctors-sort-select');
  const resetButton = document.getElementById('doctors-reset-btn');
  const resultsGrid = document.getElementById('doctors-grid');
  const counterElem = document.getElementById('doctors-found-counter');
  const emptyStateElem = document.getElementById('doctors-empty-state');
  const loadMoreBtn = document.getElementById('doctors-load-more-btn');
  const loadMoreWrap = document.getElementById('doctors-load-more-wrap');

  if (!filterForm || !resultsGrid) return;

  let currentPage = 1;
  let totalPages = (loadMoreBtn && loadMoreBtn.dataset.maxPages) 
    ? parseInt(loadMoreBtn.dataset.maxPages, 10) 
    : 1;
  let abortController = null;
  let debounceTimer = null;

  const restUrl = (window.vanClinicData && window.vanClinicData.restUrl) 
    ? window.vanClinicData.restUrl + 'doctors' 
    : '/wp-json/van/v1/doctors';

  // Получение параметров фильтрации
  function getFilterParams(page = 1) {
    const selectedCity = document.querySelector('input[name="doctor_city"]:checked');
    return {
      search: searchInput ? searchInput.value.trim() : '',
      city: selectedCity ? selectedCity.value : '',
      specialty: specialtySelect ? specialtySelect.value : '',
      branch: branchSelect ? branchSelect.value : '',
      sort: sortSelect ? sortSelect.value : 'experience_desc',
      page: page,
      per_page: 24
    };
  }

  // Обновление URL браузера (Deep Linking без перезагрузки)
  function updateBrowserUrl(params) {
    const url = new URL(window.location);
    Object.keys(params).forEach(key => {
      if (params[key] && params[key] !== 'all' && key !== 'page' && key !== 'per_page') {
        url.searchParams.set(key, params[key]);
      } else {
        url.searchParams.delete(key);
      }
    });
    window.history.pushState({}, '', url);
  }

  // Главная функция запроса врачей
  async function fetchDoctors(append = false) {
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    const params = getFilterParams(currentPage);
    if (!append) {
      updateBrowserUrl(params);
    }

    const queryStr = new URLSearchParams(params).toString();

    try {
      if (loadMoreBtn && append) {
        loadMoreBtn.classList.add('is-loading');
        loadMoreBtn.textContent = 'Завантаження...';
      }

      const response = await fetch(`${restUrl}?${queryStr}`, {
        signal: abortController.signal,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) throw new Error('Network error');

      const data = await response.json();
      totalPages = data.pages;
      if (loadMoreBtn) {
        loadMoreBtn.dataset.maxPages = totalPages;
      }

      renderDoctors(data.doctors, append);

      // Обновление счетчика
      if (counterElem) {
        counterElem.textContent = data.total;
      }

      // Видимость пустого состояния
      if (emptyStateElem) {
        emptyStateElem.style.display = data.total === 0 ? 'block' : 'none';
      }

      // Видимость кнопки "Показати ще"
      if (loadMoreWrap) {
        loadMoreWrap.style.display = currentPage < totalPages ? 'block' : 'none';
      }

    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Doctors fetch error:', err);
      }
    } finally {
      if (loadMoreBtn) {
        loadMoreBtn.classList.remove('is-loading');
        loadMoreBtn.textContent = 'Показати ще лікарів';
      }
    }
  }

  // Рендеринг HTML карточек врачей
  function renderDoctors(doctors, append = false) {
    if (!append) {
      resultsGrid.innerHTML = '';
    }

    if (!doctors || doctors.length === 0) return;

    doctors.forEach(doc => {
      const card = document.createElement('div');
      card.className = `tilt-card-3d doctor-card-preview ${doc.not_accepting ? 'doctor-card--inactive' : ''}`;

      const photoHtml = doc.photo 
        ? `<img src="${doc.photo}" alt="${doc.title}" loading="lazy" class="doctor-card-preview__img" style="object-position: center 10%;">`
        : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 13px; font-weight: 600; background: #f1f5f9;">[Фото лікаря]</div>`;

      const expHtml = doc.experience 
        ? `<span class="tilt-floating-badge doctor-card-preview__badge-exp">Стаж ${doc.experience} років</span>`
        : '';

      const isClickable = (doc.has_landing_page !== false && doc.has_landing_page !== '0' && doc.has_landing_page !== 0);
      const isKr = (doc.city === 'kryvyi-rih');
      const cityLabel = isKr ? 'Кривий Ріг' : 'Дніпро';
      const cityBadge = `<div style="margin-bottom: 6px;"><span style="display: inline-block; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: ${isKr ? '#fef3c7' : '#e0f2fe'}; color: ${isKr ? '#92400e' : '#0369a1'};">📍 ${cityLabel}</span></div>`;

      const photoWrap = isClickable
        ? `<a href="${doc.link}" class="doctor-card-preview__photo" aria-label="${doc.title}">${photoHtml}${expHtml}</a>`
        : `<div class="doctor-card-preview__photo" style="cursor: default;">${photoHtml}${expHtml}</div>`;

      const titleHtml = isClickable
        ? `<a href="${doc.link}" style="color: #0f172a; text-decoration: none;">${doc.title}</a>`
        : `<span style="color: #0f172a;">${doc.title}</span>`;

      const priceHtml = doc.price 
        ? `${Number(doc.price).toLocaleString('uk-UA')} ₴` 
        : 'від 550 ₴';

      card.innerHTML = `
        <div class="specular-glare"></div>
        ${photoWrap}
        <div class="doctor-card-preview__body">
          <div>
            ${cityBadge}
            <h4 class="doctor-card-preview__name">${titleHtml}</h4>
            <p class="doctor-card-preview__spec">${doc.specialty}</p>
          </div>
          <div class="doctor-card-preview__footer">
            <div>
              <span class="doctor-card-preview__price">${priceHtml}</span>
            </div>
            <button type="button" class="doctor-card-preview__btn" data-open-booking data-doctor-id="${doc.id}">
              Запис
            </button>
          </div>
        </div>
      `;
      resultsGrid.appendChild(card);
    });
  }

  // Слушатели событий формы
  function triggerFilter() {
    currentPage = 1;
    fetchDoctors(false);
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(triggerFilter, 300);
    });
  }

  if (specialtySelect) specialtySelect.addEventListener('change', triggerFilter);
  if (branchSelect) branchSelect.addEventListener('change', triggerFilter);
  if (sortSelect) sortSelect.addEventListener('change', triggerFilter);
  
  const cityRadios = document.querySelectorAll('input[name="doctor_city"]');
  cityRadios.forEach(radio => radio.addEventListener('change', triggerFilter));

  // Кнопка сброса фильтров
  if (resetButton) {
    resetButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (searchInput) searchInput.value = '';
      if (specialtySelect) specialtySelect.value = '';
      if (branchSelect) branchSelect.value = '';
      if (sortSelect) sortSelect.value = 'experience_desc';
      const allCityRadio = document.querySelector('input[name="doctor_city"][value=""]');
      if (allCityRadio) allCityRadio.checked = true;
      triggerFilter();
    });
  }

  // Кнопка "Показати ще"
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const maxPages = loadMoreBtn.dataset.maxPages ? parseInt(loadMoreBtn.dataset.maxPages, 10) : totalPages;
      if (currentPage < maxPages) {
        currentPage++;
        fetchDoctors(true);
      }
    });
  }
});

