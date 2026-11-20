/**
 * Обработчик формы обратной связи /wp-json/van/v1/contact
 * Файл: assets/js/contact-form.js
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('van-contact-feedback-form');
    if (!form) return;

    const alertBox = document.getElementById('van-contact-alert');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Сброс alert
        if (alertBox) {
            alertBox.style.display = 'none';
            alertBox.className = '';
            alertBox.textContent = '';
        }

        const name = form.querySelector('[name="name"]')?.value.trim();
        const phone = form.querySelector('[name="phone"]')?.value.trim();
        const subject = form.querySelector('[name="subject"]')?.value;
        const message = form.querySelector('[name="message"]')?.value.trim();
        const consent = form.querySelector('[name="consent"]')?.checked;
        const hp = form.querySelector('[name="website"]')?.value.trim();

        // 1. Клиентская валидация
        if (!name || name.length < 2) {
            showAlert('Будь ласка, вкажіть ваше ім\'я (не менше 2 символів)', 'error');
            return;
        }

        const cleanPhone = phone.replace(/[^\d+]/g, '');
        if (!/^(\+?380|0)\d{9}$/.test(cleanPhone)) {
            showAlert('Вкажіть коректний український номер телефону (+380...)', 'error');
            return;
        }

        if (!message || message.length < 10) {
            showAlert('Повідомлення має містити не менше 10 символів', 'error');
            return;
        }

        if (!consent) {
            showAlert('Потрібна обов\'язкова згода на обробку персональних даних', 'error');
            return;
        }

        // Блокировка кнопки
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.dataset.originalText = submitBtn.textContent;
            submitBtn.textContent = 'Відправляємо...';
        }

        try {
            const restUrl = (window.vanClinicData && window.vanClinicData.restUrl) 
                ? window.vanClinicData.restUrl + 'contact'
                : '/wp-json/van/v1/contact';
            const nonce = (window.vanClinicData && window.vanClinicData.nonce) || '';

            const response = await fetch(restUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': nonce
                },
                body: JSON.stringify({
                    name: name,
                    phone: cleanPhone,
                    subject: subject,
                    message: message,
                    consent: consent,
                    website: hp,
                    nonce: nonce
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showAlert(data.message || 'Дякуємо! Ваше звернення прийнято. Ми відповімо вам протягом робочого дня.', 'success');
                // Диспетчеризация для аналитики
                document.dispatchEvent(new CustomEvent('van_contact_sent', { detail: { subject: subject } }));
                form.reset();
            } else {
                const errMsg = data.message || (data.code === 'rate_limit_exceeded' 
                    ? 'Забагато звернень. Будь ласка, зателефонуйте до клініки.' 
                    : 'Помилка надсилання. Спробуйте ще раз.');
                showAlert(errMsg, 'error');
            }
        } catch (err) {
            showAlert('Помилка мережі. Перевірте з\'єднання або зателефонуйте нам.', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = submitBtn.dataset.originalText || 'Надіслати повідомлення';
            }
        }
    });

    function showAlert(text, type) {
        if (!alertBox) {
            alert(text);
            return;
        }
        alertBox.textContent = text;
        alertBox.style.display = 'block';
        if (type === 'success') {
            alertBox.style.background = '#f0fdf4';
            alertBox.style.color = '#166534';
            alertBox.style.border = '1px solid #bbf7d0';
        } else {
            alertBox.style.background = '#fef2f2';
            alertBox.style.color = '#991b1b';
            alertBox.style.border = '1px solid #fecaca';
        }
    }
});

