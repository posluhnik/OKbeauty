(() => {
  'use strict';
  document.documentElement.classList.add('js-enabled');

  const translations = window.OKSANABEAUTY_TRANSLATIONS || {};
  const supportedLanguages = ['en', 'nl', 'uk', 'ru'];
  const languageStorageKey = 'oksanabeautyLanguage';
  const getSavedLanguage = () => {
    try {
      const saved = localStorage.getItem(languageStorageKey);
      return supportedLanguages.includes(saved) ? saved : 'en';
    } catch {
      return 'en';
    }
  };
  let currentLanguage = getSavedLanguage();

  function applyLanguage(language, persist = true) {
    const lang = supportedLanguages.includes(language) ? language : 'en';
    const dictionary = translations[lang] || translations.en || {};
    currentLanguage = lang;

    document.documentElement.lang = ({ en: 'en', nl: 'nl-NL', uk: 'uk-UA', ru: 'ru-RU' })[lang] || 'en';
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.dataset.i18n;
      if (Object.prototype.hasOwnProperty.call(dictionary, key)) element.innerHTML = dictionary[key];
    });
    document.querySelectorAll('[data-i18n-content]').forEach((element) => {
      const key = element.dataset.i18nContent;
      if (Object.prototype.hasOwnProperty.call(dictionary, key)) element.setAttribute('content', dictionary[key]);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      const key = element.dataset.i18nPlaceholder;
      if (Object.prototype.hasOwnProperty.call(dictionary, key)) element.setAttribute('placeholder', dictionary[key]);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
      const key = element.dataset.i18nAriaLabel;
      if (Object.prototype.hasOwnProperty.call(dictionary, key)) element.setAttribute('aria-label', dictionary[key]);
    });
    document.querySelectorAll('[data-i18n-title]').forEach((element) => {
      const key = element.dataset.i18nTitle;
      if (Object.prototype.hasOwnProperty.call(dictionary, key)) element.setAttribute('title', dictionary[key]);
    });
    document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
      const key = element.dataset.i18nAlt;
      if (Object.prototype.hasOwnProperty.call(dictionary, key)) element.setAttribute('alt', dictionary[key]);
    });

    const languageSelect = document.querySelector('#language-select');
    if (languageSelect) languageSelect.value = lang;
    const menuToggle = document.querySelector('.nav-toggle');
    if (menuToggle) {
      menuToggle.setAttribute('aria-label', menuToggle.getAttribute('aria-expanded') === 'true'
        ? (dictionary.menuClose || 'Close menu') : (dictionary.menuOpen || 'Open menu'));
    }
    try {
      const locale = document.querySelector('meta[property="og:locale"]');
      if (locale && dictionary.ogLocale) locale.setAttribute('content', dictionary.ogLocale);
      if (persist) {
        localStorage.setItem(languageStorageKey, lang);
      }
    } catch {
    }
  }

  const languageSelect = document.querySelector('#language-select');
  languageSelect?.addEventListener('change', (event) => applyLanguage(event.target.value));
  applyLanguage(currentLanguage, false);

  document.querySelectorAll('a[href="#top"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#primary-nav');
  const closeNav = () => {
    if (!navToggle || !nav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', (translations[currentLanguage] || translations.en || {}).menuOpen || 'Open menu');
    nav.classList.remove('is-open');
    nav.style.top = '';
    nav.style.backgroundColor = '';
    nav.style.opacity = '';
    document.body.classList.remove('menu-open');
  };

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      navToggle.setAttribute('aria-label', ((translations[currentLanguage] || translations.en || {})[isOpen ? 'menuOpen' : 'menuClose']) || (isOpen ? 'Open menu' : 'Close menu'));
      nav.classList.toggle('is-open', !isOpen);
      const header = document.querySelector('.site-header');
      const headerBottom = header ? header.getBoundingClientRect().bottom : 108;
      nav.style.top = !isOpen ? `${Math.max(0, headerBottom)}px` : '';
      nav.style.backgroundColor = !isOpen ? '#ffffff' : '';
      nav.style.opacity = !isOpen ? '1' : '';
      document.body.classList.toggle('menu-open', !isOpen);
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeNav(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 800) closeNav(); });
  }

  const year = document.querySelector('#current-year');
  if (year) year.textContent = String(new Date().getFullYear());

  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, io) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const lightbox = document.querySelector('#lightbox');
  const lightboxImg = lightbox?.querySelector('img');
  const lightboxClose = lightbox?.querySelector('.lightbox-close');
  const lightboxPdfLink = lightbox?.querySelector('[data-award-pdf-link]');
  let previousFocus = null;

  const openLightbox = (source, alt, pdfSource = '', trigger = null) => {
    if (!lightbox || !lightboxImg) return;
    previousFocus = trigger;
    lightboxImg.src = source;
    lightboxImg.alt = alt || ((translations[currentLanguage] || translations.en || {}).lightboxLabel || 'Certificate or photo');
    if (lightboxPdfLink) {
      if (pdfSource) {
        lightboxPdfLink.href = pdfSource;
        lightboxPdfLink.hidden = false;
      } else {
        lightboxPdfLink.hidden = true;
        lightboxPdfLink.removeAttribute('href');
      }
    }
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightboxClose?.focus();
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.hidden = true;
    if (lightboxPdfLink) {
      lightboxPdfLink.hidden = true;
      lightboxPdfLink.removeAttribute('href');
    }
    document.body.style.overflow = '';
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
  };

  document.querySelectorAll('[data-lightbox]').forEach((button) => {
    button.addEventListener('click', () => {
      const image = button.querySelector('img');
      openLightbox(button.dataset.lightbox, image?.alt || '', '', button);
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox();
  });

  const awardGallery = document.querySelector('[data-award-gallery]');
  if (awardGallery) {
    const slides = Array.from(awardGallery.querySelectorAll('[data-award-index]'));
    const currentLabel = awardGallery.querySelector('[data-award-current]');
    const totalLabel = awardGallery.querySelector('[data-award-total]');
    const progress = awardGallery.querySelector('[data-award-progress]');
    const progressFill = awardGallery.querySelector('[data-award-progress-fill]');
    let activeAward = 0;
    let touchStartX = null;

    const renderAwards = () => {
      const total = slides.length;
      const visibleIndexes = new Set([
        activeAward,
        (activeAward - 1 + total) % total,
        (activeAward + 1) % total
      ]);

      slides.forEach((slide, index) => {
        const image = slide.querySelector('img[data-src]');
        const isVisible = visibleIndexes.has(index);

        if (image) {
          if (isVisible) {
            image.loading = index === activeAward ? 'eager' : 'lazy';
            if (!image.getAttribute('src')) image.setAttribute('src', image.dataset.src);
          } else if (image.hasAttribute('src')) {
            image.removeAttribute('src');
          }
        }

        slide.classList.remove('is-active', 'is-prev', 'is-next', 'is-far');
        slide.removeAttribute('aria-current');
        let delta = index - activeAward;
        if (delta > total / 2) delta -= total;
        if (delta < -total / 2) delta += total;
        if (delta === 0) {
          slide.classList.add('is-active');
          slide.setAttribute('aria-current', 'true');
          slide.setAttribute('tabindex', '0');
        } else if (delta === -1) {
          slide.classList.add('is-prev');
          slide.setAttribute('tabindex', '0');
        } else if (delta === 1) {
          slide.classList.add('is-next');
          slide.setAttribute('tabindex', '0');
        } else {
          slide.classList.add('is-far');
          slide.setAttribute('tabindex', '-1');
        }
      });
      if (currentLabel) currentLabel.textContent = String(activeAward + 1).padStart(2, '0');
      if (totalLabel) totalLabel.textContent = String(total).padStart(2, '0');
      if (progress) {
        progress.setAttribute('aria-valuenow', String(activeAward + 1));
        progress.setAttribute('aria-valuemax', String(total));
      }
      if (progressFill) progressFill.style.width = `${((activeAward + 1) / total) * 100}%`;
    };

    const goToAward = (index) => {
      activeAward = (index + slides.length) % slides.length;
      renderAwards();
    };

    slides.forEach((slide, index) => {
      slide.addEventListener('click', () => {
        if (index !== activeAward) {
          goToAward(index);
          return;
        }
        const image = slide.querySelector('img');
        openLightbox(image?.src || '', image?.alt || 'Certificate', slide.dataset.awardPdf || '', slide);
      });
    });

    awardGallery.querySelector('[data-award-prev]')?.addEventListener('click', () => goToAward(activeAward - 1));
    awardGallery.querySelector('[data-award-next]')?.addEventListener('click', () => goToAward(activeAward + 1));
    awardGallery.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0]?.clientX ?? null;
    }, { passive: true });
    awardGallery.addEventListener('touchend', (event) => {
      if (touchStartX === null) return;
      const difference = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
      if (Math.abs(difference) > 45) goToAward(activeAward + (difference < 0 ? 1 : -1));
      touchStartX = null;
    }, { passive: true });
    awardGallery.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToAward(activeAward - 1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToAward(activeAward + 1);
      }
    });

    renderAwards();
  }

})();
