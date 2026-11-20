/**
 * VAN CLINIC — CORE JAVASCRIPT (Pure Vanilla JS, 0 dependencies)
 * Файл: assets/js/app.js
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. АККОРДЕОНЫ (FAQ & Чек-листы)
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      if (item) {
        const isOpen = item.classList.toggle('is-open');
        header.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }
    });
  });

  // 2. ИНТЕРАКТИВНЫЙ ПОИСК В ОНЛАЙН-ПРАЙСЕ
  const priceInput = document.getElementById('price-search-input');
  const priceRows = document.querySelectorAll('.price-row');
  
  if (priceInput && priceRows.length > 0) {
    priceInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      
      priceRows.forEach(row => {
        const title = (row.dataset.title || '').toLowerCase();
        const specialty = (row.dataset.specialty || '').toLowerCase();
        
        if (title.includes(query) || specialty.includes(query)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // 3. МОДАЛЬНОЕ ОКНО ОНЛАЙН-ЗАПИСИ
  const bookingModal = document.getElementById('booking-modal');
  const bookingClose = document.querySelectorAll('[data-close-booking]');
  const bookingForm = document.getElementById('van-modal-booking-form');

  if (bookingModal) {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-open-booking], .js-booking-open');
      if (!trigger) return;
      e.preventDefault();

      // Проброс контекста в скрытые поля формы
      const docId = trigger.dataset.doctorId || '';
      const srvId = trigger.dataset.serviceId || '';
      const brId  = trigger.dataset.branchId || '';
      const deptId = trigger.dataset.departmentId || '';

      if (bookingForm) {
        if (bookingForm.querySelector('[name="doctor_id"]')) {
          bookingForm.querySelector('[name="doctor_id"]').value = docId;
        }
        if (bookingForm.querySelector('[name="service_id"]')) {
          bookingForm.querySelector('[name="service_id"]').value = srvId;
        }
        if (bookingForm.querySelector('[name="branch_id"]')) {
          bookingForm.querySelector('[name="branch_id"]').value = brId;
        }
      }

      bookingModal.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    });

    bookingClose.forEach(closeBtn => {
      closeBtn.addEventListener('click', () => {
        bookingModal.classList.remove('is-active');
        document.body.style.overflow = '';
      });
    });

    // Закрытие по ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && bookingModal.classList.contains('is-active')) {
        bookingModal.classList.remove('is-active');
        document.body.style.overflow = '';
      }
    });

    // Отправка формы бронирования на REST API
    if (bookingForm) {
      bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        const nameInput = bookingForm.querySelector('[name="name"]');
        const phoneInput = bookingForm.querySelector('[name="phone"]');
        const consentCheckbox = bookingForm.querySelector('[name="consent"]');
        const doctorId = bookingForm.querySelector('[name="doctor_id"]')?.value || '';
        const serviceId = bookingForm.querySelector('[name="service_id"]')?.value || '';
        const branchId = bookingForm.querySelector('[name="branch_id"]')?.value || '';

        if (!consentCheckbox || !consentCheckbox.checked) {
          alert('Будь ласка, підтвердіть згоду на обробку персональних даних.');
          return;
        }

        const phone = phoneInput ? phoneInput.value.trim() : '';
        if (!phone) {
          alert('Вкажіть номер телефону.');
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.dataset.originalText = submitBtn.textContent;
          submitBtn.textContent = 'Обробка...';
        }

        try {
          const restUrl = (window.vanClinicData && window.vanClinicData.restUrl)
            ? window.vanClinicData.restUrl + 'booking'
            : '/wp-json/van/v1/booking';
          const nonce = (window.vanClinicData && window.vanClinicData.nonce) || '';

          const response = await fetch(restUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-WP-Nonce': nonce
            },
            body: JSON.stringify({
              name: nameInput ? nameInput.value.trim() : '',
              phone: phone,
              consent: true,
              doctor_id: doctorId,
              service_id: serviceId,
              branch_id: branchId
            })
          });

          const data = await response.json();

          if (response.ok && data.success) {
            const leadId = data.lead_id || Date.now();
            const homeUrl = (window.vanClinicData && window.vanClinicData.homeUrl) || '/uk/';
            // Редирект на /spasibo/?lead_id={id}
            window.location.href = homeUrl + 'spasibo/?lead_id=' + encodeURIComponent(leadId);
          } else {
            alert(data.message || 'Помилка надсилання. Спробуйте ще раз.');
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = submitBtn.dataset.originalText || 'Підтвердити запис';
            }
          }
        } catch (err) {
          alert('Помилка мережі. Спробуйте зателефонувати до клініки.');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.originalText || 'Підтвердити запис';
          }
        }
      });
    }
  }

  // 3.1 ГЛАВНАЯ 3D-ФОРМА БЫСТРОЙ ЗАПИСИ В HERO
  const heroBookingForm = document.getElementById('van-hero-booking-form');
  if (heroBookingForm) {
    heroBookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = heroBookingForm.querySelector('button[type="submit"]');
      const nameInput = heroBookingForm.querySelector('[name="name"]');
      const phoneInput = heroBookingForm.querySelector('[name="phone"]');
      const specSelect = heroBookingForm.querySelector('[name="specialty"]');
      const hpInput = heroBookingForm.querySelector('[name="website"]');

      if (hpInput && hpInput.value) return; // bot detection

      const phone = phoneInput ? phoneInput.value.trim() : '';
      if (!phone) {
        alert('Вкажіть номер телефону.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Зачекайте...</span>';
      }

      try {
        const restUrl = (window.vanClinicData && window.vanClinicData.restUrl)
          ? window.vanClinicData.restUrl + 'booking'
          : '/wp-json/van/v1/booking';
        const nonce = (window.vanClinicData && window.vanClinicData.nonce) || '';

        const response = await fetch(restUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': nonce
          },
          body: JSON.stringify({
            name: nameInput ? nameInput.value.trim() : '',
            phone: phone,
            specialty_title: specSelect ? specSelect.value : '',
            consent: true
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const leadId = data.lead_id || Date.now();
          const homeUrl = (window.vanClinicData && window.vanClinicData.homeUrl) || '/uk/';
          window.location.href = homeUrl + 'spasibo/?lead_id=' + encodeURIComponent(leadId);
        } else {
          alert(data.message || 'Помилка надсилання. Спробуйте ще раз.');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitBtn.dataset.originalText;
          }
        }
      } catch (err) {
        alert('Помилка мережі. Спробуйте зателефонувати до клініки.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = submitBtn.dataset.originalText;
        }
      }
    });
  }

  // 4. GLASS SPOTLIGHT & SPECULAR GLARE INTERACTION (React Bits / Magic UI)
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest('.spotlight-card, .tilt-card-3d');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    card.style.setProperty('--glare-x', `${x}px`);
    card.style.setProperty('--glare-y', `${y}px`);
  }, { passive: true });

  // 5. STICKY FROSTED HEADER DYNAMIC SCROLL (Arc UI Inspired)
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    let ticking = false;
    const updateHeaderOnScroll = () => {
      if (window.scrollY > 25) {
        siteHeader.classList.add('is-scrolled');
      } else {
        siteHeader.classList.remove('is-scrolled');
      }
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeaderOnScroll);
        ticking = true;
      }
    }, { passive: true });
    updateHeaderOnScroll();
  }
});
