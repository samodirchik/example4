/**
 * Global Alert Banner Dismiss Handler
 * Session-based dismissal + dataLayer event
 */
(function() {
  function initAlert() {
    const alert = document.getElementById('van-global-alert');
    if (!alert) return;
    
    const dismissible = alert.dataset.dismissible === '1';
    if (!dismissible) return;
    
    // Check session storage
    try {
      const dismissed = sessionStorage.getItem('van_alert_dismissed');
      if (dismissed === '1') {
        alert.hidden = true;
        return;
      }
    } catch (e) {
      // Storage access blocked or unavailable
    }
    
    const closeBtn = alert.querySelector('[data-dismiss-alert]');
    if (!closeBtn) return;
    
    closeBtn.addEventListener('click', function() {
      alert.hidden = true;
      try {
        sessionStorage.setItem('van_alert_dismissed', '1');
      } catch (e) {}
      
      // Analytics dataLayer
      if (window.dataLayer && Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
          event: 'alert_dismiss',
          alert_type: alert.className
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAlert);
  } else {
    initAlert();
  }
})();

