/**
 * VAN CLINIC — APPLE-STYLE HEADER INTERACTION SCRIPT
 * Файл: assets/js/header.js
 * Функционал: Scroll shrink, Mega-menu toggle, Off-canvas drawer, Focus trap, Search dropdown
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('site-header');
    const burgerBtn = document.getElementById('header-burger-btn');
    const drawer = document.getElementById('mobile-menu-drawer');
    const drawerOverlay = document.getElementById('mobile-drawer-overlay');
    const drawerCloseBtn = document.getElementById('mobile-drawer-close-btn');
    const searchToggle = document.getElementById('header-search-toggle');
    const searchDropdown = document.getElementById('header-search-dropdown');
    const searchCloseBtn = document.getElementById('header-search-close-btn');
    const searchInput = document.getElementById('header-search-input');
    const megaNavItems = document.querySelectorAll('.nav-item--has-mega');
    const mobileAccordions = document.querySelectorAll('.mobile-nav__accordion-btn');

    // 1. SCROLL DETECT & HEADER SHRINK (Desktop: 64px -> 56px, Mobile: Smart show/hide)
    let lastScrollY = window.scrollY;
    let isTicking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!header) return;

      // Subtle shrink and elevation on scroll (Always pinned on both desktop & mobile)
      if (currentScrollY > 20) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }

      header.style.transform = 'translateY(0)';

      lastScrollY = currentScrollY;
      isTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (!isTicking) {
        window.requestAnimationFrame(handleScroll);
        isTicking = true;
      }
    }, { passive: true });

    handleScroll();

    // 2. DESKTOP SEARCH DROPDOWN
    if (searchToggle && searchDropdown) {
      searchToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const isActive = searchDropdown.classList.toggle('is-active');
        searchToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        searchDropdown.setAttribute('aria-hidden', isActive ? 'false' : 'true');

        if (isActive && searchInput) {
          setTimeout(() => searchInput.focus(), 50);
        }
      });

      if (searchCloseBtn) {
        searchCloseBtn.addEventListener('click', () => {
          searchDropdown.classList.remove('is-active');
          searchToggle.setAttribute('aria-expanded', 'false');
          searchDropdown.setAttribute('aria-hidden', 'true');
          searchToggle.focus();
        });
      }
    }

    // 3. DESKTOP MEGA-MENU (Touch & Keyboard support)
    megaNavItems.forEach((item) => {
      const link = item.querySelector('.nav-link');
      if (!link) return;

      link.addEventListener('click', (e) => {
        // If screen is tablet / touch enabled
        if (window.innerWidth >= 992 && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
          if (!item.classList.contains('is-open')) {
            e.preventDefault();
            closeAllMegaMenus();
            item.classList.add('is-open');
            link.setAttribute('aria-expanded', 'true');
          }
        }
      });
    });

    const closeAllMegaMenus = () => {
      megaNavItems.forEach((item) => {
        item.classList.remove('is-open');
        const link = item.querySelector('.nav-link');
        if (link) link.setAttribute('aria-expanded', 'false');
      });
    };

    // Close mega-menu or search on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-item--has-mega')) {
        closeAllMegaMenus();
      }
      if (searchDropdown && searchToggle && !e.target.closest('#header-search-dropdown') && !e.target.closest('#header-search-toggle')) {
        searchDropdown.classList.remove('is-active');
        searchToggle.setAttribute('aria-expanded', 'false');
        searchDropdown.setAttribute('aria-hidden', 'true');
      }
    });

    // 4. MOBILE OFF-CANVAS DRAWER
    const openDrawer = () => {
      if (!drawer) return;
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      burgerBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';

      // Focus first focusable element
      const firstFocusable = drawer.querySelector('button, [href], input');
      if (firstFocusable) firstFocusable.focus();
    };

    const closeDrawer = () => {
      if (!drawer) return;
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      burgerBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      burgerBtn.focus();
    };

    if (burgerBtn) burgerBtn.addEventListener('click', openDrawer);
    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

    // 5. MOBILE ACCORDION ITEMS
    mobileAccordions.forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.mobile-nav__item');
        if (!item) return;
        const isOpen = item.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    });

    // 6. ACCESSIBILITY: ESC KEY & FOCUS TRAP
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (drawer && drawer.classList.contains('is-open')) {
          closeDrawer();
        }
        if (searchDropdown && searchDropdown.classList.contains('is-active')) {
          searchDropdown.classList.remove('is-active');
          searchToggle.setAttribute('aria-expanded', 'false');
          searchDropdown.setAttribute('aria-hidden', 'true');
        }
        closeAllMegaMenus();
      }

      // Focus trap in mobile drawer
      if (e.key === 'Tab' && drawer && drawer.classList.contains('is-open')) {
        const focusables = drawer.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });

  });
})();

