/**
 * VAN CLINIC — Table of Contents (TOC) & Scrollspy (Vanilla JS, 0 dependencies)
 * Файл: assets/js/toc.js
 */

document.addEventListener('DOMContentLoaded', () => {
  const contentArea = document.querySelector('.article-content__body');
  const tocContainer = document.getElementById('article-toc-container');
  const tocNav = document.getElementById('article-toc-nav');
  const tocDetails = document.querySelector('.article-toc__details');

  if (!contentArea || !tocContainer || !tocNav) return;

  // Поиск всех H2 и H3 внутри контента
  const headings = contentArea.querySelectorAll('h2, h3');
  const h2Count = contentArea.querySelectorAll('h2').length;

  // Правило ТЗ: если меньше 3 заголовков H2 — оглавление не выводится
  if (h2Count < 3) {
    tocContainer.remove();
    return;
  }

  // Транслитерация кириллицы в ЧПУ id
  const translitMap = {
    'а':'a','б':'b','в':'v','г':'h','ґ':'g','д':'d','е':'e','є':'ye','ж':'zh','з':'z',
    'и':'y','і':'i','ї':'yi','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p',
    'р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch',
    'ь':'','ю':'yu','я':'ya',' ':'-','_':'-'
  };

  function slugify(text) {
    return text.toLowerCase()
      .split('')
      .map(char => translitMap[char] || char)
      .join('')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'section';
  }

  const usedIds = new Set();
  const listElement = document.createElement('ul');
  listElement.className = 'toc-list';

  headings.forEach((heading, idx) => {
    let rawText = heading.textContent.trim();
    let id = heading.id || slugify(rawText);

    // Дедупликация ID
    let uniqueId = id;
    let counter = 1;
    while (usedIds.has(uniqueId) || document.getElementById(uniqueId)) {
      uniqueId = `${id}-${counter++}`;
    }
    usedIds.add(uniqueId);
    heading.id = uniqueId;

    // Создание элемента списка TOC
    const listItem = document.createElement('li');
    listItem.className = `toc-item toc-item--${heading.tagName.toLowerCase()}`;

    const link = document.createElement('a');
    link.href = `#${uniqueId}`;
    link.textContent = rawText;
    link.className = 'toc-link';

    listItem.appendChild(link);
    listElement.appendChild(listItem);
  });

  tocNav.appendChild(listElement);
  tocContainer.style.display = 'block';

  // На мобильных экранах (< 992px) сворачиваем details по умолчанию
  if (window.innerWidth < 992 && tocDetails) {
    tocDetails.removeAttribute('open');
  }

  // SCROLLSPY ЧЕРЕЗ INTERSECTION OBSERVER
  const tocLinks = tocNav.querySelectorAll('.toc-link');
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -70% 0px',
    threshold: 0
  };

  let activeHeadingId = null;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activeHeadingId = entry.target.id;
        updateActiveLink();
      }
    });
  }, observerOptions);

  headings.forEach(heading => observer.observe(heading));

  function updateActiveLink() {
    tocLinks.forEach(link => {
      if (link.getAttribute('href') === `#${activeHeadingId}`) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });
  }

  // Плавный скролл с отступом под фиксированную шапку
  tocNav.addEventListener('click', (e) => {
    const link = e.target.closest('.toc-link');
    if (!link) return;

    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    const targetElem = document.getElementById(targetId);

    if (targetElem) {
      const headerOffset = 85;
      const elementPosition = targetElem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // На мобилках закрываем details после выбора пункта
      if (window.innerWidth < 992 && tocDetails) {
        tocDetails.removeAttribute('open');
      }
    }
  });
});

