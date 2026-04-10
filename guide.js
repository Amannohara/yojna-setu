/**
 * guide.js — Yojna Setu Application Guide Builder
 * Renders accordion-style step-by-step guides and FAQ sections
 */

const Guide = (() => {

  // ── Render accordion steps ─────────────────────────────
  function renderSteps(steps) {
    return steps.map((step, i) => `
      <li class="guide-step">
        <div class="guide-step-num" aria-hidden="true">${i + 1}</div>
        <div class="guide-step-content">
          <p>${step}</p>
        </div>
        ${i < steps.length - 1 ? '<div class="guide-step-connector"></div>' : ''}
      </li>
    `).join('');
  }

  // ── Render FAQ accordion ───────────────────────────────
  function renderFAQs(faqs, lang) {
    if (!faqs || faqs.length === 0) return '';
    const title = { en: 'Frequently Asked Questions', hi: 'अक्सर पूछे जाने वाले प्रश्न', bn: 'প্রায়শই জিজ্ঞাসিত প্রশ্ন' };
    const items = faqs.map((faq, i) => `
      <div class="faq-item" id="faq-item-${i}">
        <button class="faq-question" aria-expanded="false" aria-controls="faq-answer-${i}">
          <span>${faq.q}</span>
          <i class="fa-solid fa-chevron-down faq-icon" aria-hidden="true"></i>
        </button>
        <div class="faq-answer" id="faq-answer-${i}" role="region" hidden>
          <p>${faq.a}</p>
        </div>
      </div>
    `).join('');

    return `
      <div class="faq-section">
        <h4 class="modal-section-title"><i class="fa-solid fa-circle-question"></i> ${title[lang] || title.en}</h4>
        <div class="faq-list">${items}</div>
      </div>
    `;
  }

  // ── Render benefits list ───────────────────────────────
  function renderBenefits(benefits) {
    return benefits.map(b => `
      <li class="benefit-item">
        <span class="benefit-icon" aria-hidden="true"><i class="fa-solid fa-circle-check"></i></span>
        <span>${b}</span>
      </li>
    `).join('');
  }

  // ── Render eligibility tags ────────────────────────────
  function renderEligibility(eligibility) {
    return eligibility.map(e => `
      <span class="elig-tag">${capitalise(e)}</span>
    `).join('');
  }

  // ── Bind FAQ accordion interactions ───────────────────
  function bindFAQs(container) {
    container.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        const answer   = btn.nextElementSibling;

        // Close all others in same list
        const parent = btn.closest('.faq-list');
        if (parent) {
          parent.querySelectorAll('.faq-question').forEach(other => {
            if (other !== btn) {
              other.setAttribute('aria-expanded', 'false');
              const otherAnswer = other.nextElementSibling;
              if (otherAnswer) otherAnswer.hidden = true;
            }
          });
        }

        btn.setAttribute('aria-expanded', String(!expanded));
        if (answer) answer.hidden = expanded;
      });
    });
  }

  function capitalise(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  return { renderSteps, renderFAQs, renderBenefits, renderEligibility, bindFAQs };
})();
