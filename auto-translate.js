(() => {
  const root = document.documentElement;
  const sourceLang = root.dataset.sourceLang;
  const targetLang = root.dataset.targetLang;

  if (!sourceLang || !targetLang || sourceLang === targetLang) {
    return;
  }

  const cookieValue = `/${sourceLang}/${targetLang}`;
  const maxAge = 60 * 60 * 24 * 365;

  document.cookie = `googtrans=${cookieValue}; path=/; max-age=${maxAge}`;

  if (location.hostname) {
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${location.hostname}; max-age=${maxAge}`;
  }

  const holder = document.createElement('div');
  holder.id = 'google_translate_element';
  holder.className = 'google-translate-holder';
  holder.setAttribute('aria-hidden', 'true');
  document.body.appendChild(holder);

  const applyTargetLanguage = () => {
    const combo = document.querySelector('.goog-te-combo');
    if (!combo) {
      return false;
    }

    if (combo.value !== targetLang) {
      combo.value = targetLang;
      combo.dispatchEvent(new Event('change'));
    }

    return true;
  };

  const observer = new MutationObserver(() => {
    if (applyTargetLanguage()) {
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  window.googleTranslateElementInit = () => {
    if (!window.google || !google.translate || !google.translate.TranslateElement) {
      return;
    }

    new google.translate.TranslateElement(
      {
        pageLanguage: sourceLang,
        autoDisplay: false,
      },
      'google_translate_element'
    );

    setTimeout(() => {
      if (applyTargetLanguage()) {
        observer.disconnect();
      }
    }, 700);
  };

  const script = document.createElement('script');
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.async = true;
  document.head.appendChild(script);
})();
