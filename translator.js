/**
 * translator.js — Yojna Setu Multilingual Engine
 * Supports: English (en), Hindi (hi), Bengali (bn)
 * Usage: import via <script src="components/translator.js"></script>
 */

const Translator = (() => {
  // ── State ──────────────────────────────────────────────
  let currentLang = localStorage.getItem('ys_lang') || 'en';
  let translations = {};
  const SUPPORTED = ['en', 'hi', 'bn'];

  // ── Load translations from JSON files ─────────────────
  async function loadTranslations(lang) {
    if (!SUPPORTED.includes(lang)) lang = 'en';
    try {
      const res = await fetch(`${lang}.json`);
      if (!res.ok) throw new Error(`Failed to load ${lang}.json`);
      translations = await res.json();
      currentLang = lang;
      localStorage.setItem('ys_lang', lang);
      return translations;
    } catch (err) {
      console.error('[Translator] Load error:', err);
      // Fallback: return empty so UI doesn't break
      return {};
    }
  }

  // ── Translate a key ────────────────────────────────────
  function t(key, fallback = '') {
    return translations[key] || fallback || key;
  }

  // ── Apply translations to all [data-i18n] elements ────
  function applyToDOM() {
    // Text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[key] !== undefined) {
        el.innerHTML = translations[key];
      }
    });

    // Placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[key]) el.setAttribute('placeholder', translations[key]);
    });

    // Aria-labels
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      if (translations[key]) el.setAttribute('aria-label', translations[key]);
    });

    // Update <html lang> attribute for accessibility
    document.documentElement.lang = currentLang;

    // Update lang switcher UI
    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.lang === currentLang);
    });

    // Fire a custom event so other modules can react
    window.dispatchEvent(new CustomEvent('ys:langChanged', { detail: { lang: currentLang, t: translations } }));
  }

  // ── Switch language ────────────────────────────────────
  async function switchTo(lang) {
    if (lang === currentLang && Object.keys(translations).length > 0) return;
    await loadTranslations(lang);
    applyToDOM();
  }

  // ── Init: load saved or default language ───────────────
  async function init() {
    await loadTranslations(currentLang);
    applyToDOM();
    // Bind lang switcher buttons
    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.addEventListener('click', () => switchTo(btn.dataset.lang));
    });
  }

  // ── Public API ─────────────────────────────────────────
  return { init, switchTo, t, applyToDOM, get lang() { return currentLang; } };
})();

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Translator.init());
} else {
  Translator.init();
}
