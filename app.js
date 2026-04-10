/**
 * app.js — Yojna Setu Main Application
 * Orchestrates: Data loading, Rendering, Filters, Modal, i18n, Chatbot
 */

/* ── Global accessible to chatbot ── */
window.YS_SCHEMES  = [];
window.openSchemeModal = openModal;

/* ── State ── */
let SCHEMES       = [];
let filteredSchemes = [];
let currentLang   = localStorage.getItem('ys_lang') || 'en';
let activeCategory = 'all';
let pendingLink   = '';

/* ── DOM Refs ── */
const cardsGrid         = () => document.getElementById('cardsGrid');
const skeletonGrid      = () => document.getElementById('skeletonGrid');
const emptyState        = () => document.getElementById('emptyState');
const resultCount       = () => document.getElementById('resultCount');
const searchInput       = () => document.getElementById('searchInput');
const stateFilter       = () => document.getElementById('stateFilter');
const eligibilityFilter = () => document.getElementById('eligibilityFilter');
const categoryFilter    = () => document.getElementById('categoryFilter');
const sortSelect        = () => document.getElementById('sortSelect');
const modalOverlay      = () => document.getElementById('modalOverlay');
const modalBody         = () => document.getElementById('modalBody');
const modalHeaderLeft   = () => document.getElementById('modalHeaderLeft');
const disclaimerOverlay = () => document.getElementById('disclaimerOverlay');

// ============================================================
// 1. DATA LOADING
// ============================================================
async function loadSchemes() {
  try {
    const res = await fetch('schemes.json');
    SCHEMES = await res.json();
    window.YS_SCHEMES = SCHEMES;
  } catch (e) {
    console.error('[YS] Failed to load schemes.json', e);
    SCHEMES = [];
  }
}

// ============================================================
// 2. RENDERING CARDS
// ============================================================
function categoryLabel(cat) {
  const map = {
    scholarship: { en: 'Scholarship', hi: 'छात्रवृत्ति', bn: 'বৃত্তি' },
    internship:  { en: 'Internship',  hi: 'इंटर्नशिप',  bn: 'ইন্টার্নশিপ' },
    'pm-scheme': { en: 'PM Scheme',   hi: 'पीएम योजना', bn: 'পিএম প্রকল্প' },
    'state-scheme':{ en:'State Scheme', hi:'राज्य योजना',bn:'রাজ্য প্রকল্প' },
    housing:     { en: 'Housing',     hi: 'आवास',       bn: 'আবাসন' },
    finance:     { en: 'Finance',     hi: 'वित्त',      bn: 'অর্থায়ন' },
    agriculture: { en: 'Agriculture', hi: 'कृषि',       bn: 'কৃষি' },
    women:       { en: 'Women',       hi: 'महिलाएं',    bn: 'মহিলা' },
    startup:     { en: 'Startup',     hi: 'स्टार्टअप',  bn: 'স্টার্টআপ' },
    skill:       { en: 'Skill Dev',   hi: 'कौशल विकास', bn: 'দক্ষতা উন্নয়ন' },
  };
  return (map[cat] || {})[currentLang] || (map[cat] || {}).en || cat;
}

function getSchemeName(s)  { return (currentLang === 'hi' ? s.nameHi : currentLang === 'bn' ? s.nameBn : s.name) || s.name; }
function getSchemeDesc(s)  { return (currentLang === 'hi' ? s.shortDescHi : currentLang === 'bn' ? s.shortDescBn : s.shortDesc) || s.shortDesc; }

function buildCard(scheme, delay = 0) {
  const name   = getSchemeName(scheme);
  const desc   = getSchemeDesc(scheme);
  const viewTx = Translator.t('view_details', 'View Details & Apply');
  return `
    <article class="scheme-card" data-id="${scheme.id}" tabindex="0" role="button"
      aria-label="View details of ${name}" style="animation-delay:${delay}s">
      <div class="card-top">
        <div class="card-icon ${scheme.category}" style="background:${scheme.color}18;color:${scheme.color}">
          <i class="${scheme.icon}"></i>
        </div>
        <span class="category-tag ${scheme.category}">${categoryLabel(scheme.category)}</span>
      </div>
      <h3 class="card-name">${name}</h3>
      <p class="card-desc">${desc}</p>
      <div class="card-meta">
        ${scheme.eligibility.slice(0,3).map(e => `<span class="card-badge">${capitalise(e)}</span>`).join('')}
      </div>
      <div class="card-footer">
        <span class="btn-view">${viewTx} <i class="fa-solid fa-arrow-right"></i></span>
      </div>
    </article>
  `;
}

function renderCards(schemes) {
  const grid = cardsGrid(); const skeleton = skeletonGrid(); const empty = emptyState();
  if (!grid) return;
  skeleton.style.display = 'none';
  if (schemes.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    resultCount().textContent = `0 ${Translator.t('results_found','scheme(s) found')}`;
    return;
  }
  empty.style.display = 'none';
  resultCount().textContent = `${schemes.length} ${Translator.t('results_found','scheme(s) found')}`;
  grid.innerHTML = schemes.map((s, i) => buildCard(s, i * 0.07)).join('');
  grid.querySelectorAll('.scheme-card').forEach(card => {
    const handler = () => openModal(card.dataset.id);
    card.addEventListener('click', handler);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handler(); });
  });
}

// ============================================================
// 3. MODAL
// ============================================================
function openModal(id) {
  const s = SCHEMES.find(x => x.id === id);
  if (!s) return;
  const t = key => Translator.t(key);
  const lang = currentLang;
  const name = getSchemeName(s);
  const desc = (lang === 'hi' ? s.descriptionHi : lang === 'bn' ? s.descriptionBn : s.description) || s.description;

  // Header
  modalHeaderLeft().innerHTML = `
    <div class="modal-header-icon card-icon ${s.category}" style="background:${s.color}18;color:${s.color}">
      <i class="${s.icon}"></i>
    </div>
    <div>
      <span class="category-tag ${s.category}" style="margin-bottom:4px;display:inline-block">${categoryLabel(s.category)}</span>
      <h2 style="font-family:var(--font-display);font-size:1.2rem;font-weight:800;color:var(--navy);line-height:1.3">${name}</h2>
    </div>
  `;

  // Render checklist via Checklist component
  const checklistHTML = Checklist.render(s);

  // Render steps via Guide component
  const stepsHTML = Guide.renderSteps(s.applicationSteps);

  // Render FAQs
  const faqHTML = Guide.renderFAQs(s.faqs, lang);

  // Tabs
  modalBody().innerHTML = `
    <div class="modal-tabs" role="tablist">
      <button class="modal-tab active" role="tab" data-tab="overview">${t('modal_eligibility') || 'Overview'}</button>
      <button class="modal-tab" role="tab" data-tab="guide"><i class="fa-solid fa-list-check"></i> ${t('modal_how') || 'Apply Guide'}</button>
      <button class="modal-tab" role="tab" data-tab="checklist"><i class="fa-solid fa-square-check"></i> ${t('modal_checklist') || 'Checklist'}</button>
      ${s.faqs?.length ? `<button class="modal-tab" role="tab" data-tab="faq"><i class="fa-solid fa-circle-question"></i> FAQ</button>` : ''}
    </div>

    <!-- TAB: Overview -->
    <div class="modal-tab-content active" data-tab-content="overview">
      <div class="modal-section">
        <p style="font-size:0.9rem;color:var(--text-soft);line-height:1.7;margin-bottom:20px">${desc}</p>
      </div>
      <div class="modal-section">
        <p class="modal-section-title"><i class="fa-solid fa-user-check"></i> ${t('modal_eligibility') || 'Who Can Apply'}</p>
        <div class="elig-tags">${Guide.renderEligibility(s.eligibility)}</div>
      </div>
      <div class="modal-section">
        <p class="modal-section-title"><i class="fa-solid fa-star"></i> ${t('modal_benefits') || 'Key Benefits'}</p>
        <ul class="benefits-list">${Guide.renderBenefits(s.benefits)}</ul>
      </div>
      <div class="modal-section">
        <p class="modal-section-title"><i class="fa-solid fa-file-lines"></i> ${t('modal_documents') || 'Required Documents'}</p>
        <ul class="benefits-list">
          ${s.documents.map(d => `<li class="benefit-item"><span class="benefit-icon" aria-hidden="true"><i class="fa-regular fa-file"></i></span><span>${d}</span></li>`).join('')}
        </ul>
      </div>
      <div style="margin-top:28px">
        <button class="modal-apply-btn" onclick="triggerApply('${s.officialLink}','${name.replace(/'/g,"\\'")}')">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> ${t('modal_apply') || 'Apply Now'}
        </button>
        <p class="modal-disclaimer"><i class="fa-solid fa-shield-halved"></i> ${t('modal_disclaimer') || 'You will be redirected to the official government website.'}</p>
      </div>
    </div>

    <!-- TAB: Step-by-Step Guide -->
    <div class="modal-tab-content" data-tab-content="guide">
      <div class="modal-section">
        <p class="modal-section-title"><i class="fa-solid fa-route"></i> ${t('modal_how') || 'How to Apply'}</p>
        <ol class="guide-steps-list">${stepsHTML}</ol>
      </div>
      <div style="margin-top:24px">
        <button class="modal-apply-btn" onclick="triggerApply('${s.officialLink}','${name.replace(/'/g,"\\'")}')">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> ${t('modal_apply') || 'Apply Now'}
        </button>
      </div>
    </div>

    <!-- TAB: Document Checklist -->
    <div class="modal-tab-content" data-tab-content="checklist">
      <div class="modal-section">
        <p class="modal-section-title"><i class="fa-solid fa-square-check"></i> ${t('modal_checklist') || 'Document Checklist'}</p>
        ${checklistHTML}
      </div>
    </div>

    <!-- TAB: FAQ -->
    ${s.faqs?.length ? `
    <div class="modal-tab-content" data-tab-content="faq">
      <div class="modal-section">${faqHTML}</div>
    </div>` : ''}
  `;

  // Bind tabs
  modalBody().querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      modalBody().querySelectorAll('.modal-tab').forEach(t2 => { t2.classList.remove('active'); t2.setAttribute('aria-selected','false'); });
      modalBody().querySelectorAll('.modal-tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected','true');
      const targetContent = modalBody().querySelector(`[data-tab-content="${tab.dataset.tab}"]`);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // Bind checklist events
  Checklist.bindEvents(s.id, s.documents.length);

  // Bind FAQ
  Guide.bindFAQs(modalBody());

  // Show modal
  modalOverlay().classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay()?.classList.remove('active');
  document.body.style.overflow = '';
}

// ============================================================
// 4. DISCLAIMER / APPLY LINK
// ============================================================
window.triggerApply = function(link, name) {
  pendingLink = link;
  const overlay = disclaimerOverlay();
  if (!overlay) { window.open(link, '_blank', 'noopener,noreferrer'); return; }
  overlay.classList.add('active');
};

// ============================================================
// 5. FILTERS & SEARCH
// ============================================================
function applyFilters() {
  const search   = (searchInput()?.value || '').trim().toLowerCase();
  const stateVal = stateFilter()?.value || 'all';
  const eligVal  = eligibilityFilter()?.value || 'all';
  const catVal   = (categoryFilter()?.value !== 'all' ? categoryFilter().value : activeCategory);
  const sort     = sortSelect()?.value || 'default';

  let results = SCHEMES.filter(s => {
    const catMatch   = catVal === 'all' || s.category === catVal;
    const searchMatch= !search ||
      s.name.toLowerCase().includes(search) ||
      s.shortDesc.toLowerCase().includes(search) ||
      (s.nameHi || '').includes(search) ||
      (s.nameBn || '').includes(search) ||
      s.eligibility.some(e => e.includes(search)) ||
      (s.tags || []).some(t => t.includes(search));
    const stateMatch = stateVal === 'all' || s.state === stateVal || s.state === 'central';
    const eligMatch  = eligVal === 'all' || s.eligibility.includes(eligVal);
    return catMatch && searchMatch && stateMatch && eligMatch;
  });

  if (sort === 'az') results.sort((a,b) => a.name.localeCompare(b.name));
  if (sort === 'za') results.sort((a,b) => b.name.localeCompare(a.name));

  filteredSchemes = results;
  renderCards(results);
}

function resetAll() {
  if (searchInput()) searchInput().value = '';
  if (stateFilter())       stateFilter().value = 'all';
  if (eligibilityFilter()) eligibilityFilter().value = 'all';
  if (categoryFilter())    categoryFilter().value = 'all';
  if (sortSelect())        sortSelect().value = 'default';
  activeCategory = 'all';
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  document.querySelector('.pill[data-category="all"]')?.classList.add('active');
  applyFilters();
}

// ============================================================
// 6. UTILITIES
// ============================================================
function capitalise(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }

// ============================================================
// 7. EVENT LISTENERS
// ============================================================
function bindEvents() {
  // Search
  document.getElementById('searchBtn')?.addEventListener('click', applyFilters);
  document.getElementById('searchInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') applyFilters(); });
  document.getElementById('searchInput')?.addEventListener('input', e => { if (!e.target.value) applyFilters(); });

  // Filters
  ['stateFilter','eligibilityFilter','categoryFilter'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', applyFilters);
  });
  document.getElementById('sortSelect')?.addEventListener('change', applyFilters);

  // Clear
  document.getElementById('clearFilters')?.addEventListener('click', resetAll);
  document.getElementById('resetBtn')?.addEventListener('click', resetAll);

  // Category pills
  document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.category;
      const cf = document.getElementById('categoryFilter');
      if (cf) cf.value = activeCategory;
      applyFilters();
      setTimeout(() => document.getElementById('schemes')?.scrollIntoView({ behavior:'smooth', block:'start' }), 100);
    });
  });

  // Modal
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.getElementById('modalOverlay')?.addEventListener('click', e => { if (e.target === document.getElementById('modalOverlay')) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Disclaimer
  document.getElementById('disclaimerProceed')?.addEventListener('click', () => {
    if (pendingLink) window.open(pendingLink, '_blank', 'noopener,noreferrer');
    disclaimerOverlay().classList.remove('active');
    pendingLink = '';
  });
  document.getElementById('disclaimerCancel')?.addEventListener('click', () => {
    disclaimerOverlay()?.classList.remove('active');
    pendingLink = '';
  });

  // Mobile sidebar
  document.getElementById('filterToggleBtn')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.add('open');
    document.getElementById('sidebarOverlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
  function closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebarOverlay')?.classList.remove('active');
    document.body.style.overflow = '';
  }
  document.getElementById('filterCloseBtn')?.addEventListener('click', closeSidebar);
  document.getElementById('sidebarOverlay')?.addEventListener('click', closeSidebar);

  // Hamburger
  document.getElementById('hamburger')?.addEventListener('click', () => {
    const hb = document.getElementById('hamburger');
    hb.classList.toggle('open');
    document.querySelector('.nav-links')?.classList.toggle('mobile-open');
  });

  // Navbar scroll
  window.addEventListener('scroll', () => {
    document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  // Re-render on language change
  window.addEventListener('ys:langChanged', e => {
    currentLang = e.detail.lang;
    applyFilters();
  });
}

// ============================================================
// 8. INIT
// ============================================================
async function init() {
  await loadSchemes();
  bindEvents();
  // Simulate loader
  setTimeout(() => applyFilters(), 800);
  // Init chatbot
  if (typeof Chatbot !== 'undefined') Chatbot.init(SCHEMES);
}

document.addEventListener('DOMContentLoaded', init);
