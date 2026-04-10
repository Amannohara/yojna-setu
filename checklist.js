/**
 * checklist.js — Yojna Setu Document Checklist
 * Features:
 *  - Per-scheme document tracking
 *  - localStorage persistence
 *  - Progress bar
 *  - PDF download via browser print
 */

const Checklist = (() => {
  const STORAGE_KEY = 'ys_checklists';

  // ── Load all saved checklists ──────────────────────────
  function loadAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  // ── Save all checklists ────────────────────────────────
  function saveAll(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // ── Get checked items for a scheme ────────────────────
  function getChecked(schemeId) {
    return loadAll()[schemeId] || [];
  }

  // ── Toggle a document item ─────────────────────────────
  function toggle(schemeId, docIndex, checked) {
    const all = loadAll();
    if (!all[schemeId]) all[schemeId] = [];
    if (checked) {
      if (!all[schemeId].includes(docIndex)) all[schemeId].push(docIndex);
    } else {
      all[schemeId] = all[schemeId].filter(i => i !== docIndex);
    }
    saveAll(all);
  }

  // ── Render checklist HTML for a scheme ────────────────
  function render(scheme) {
    const checked = getChecked(scheme.id);
    const total   = scheme.documents.length;
    const done    = checked.length;
    const pct     = total > 0 ? Math.round((done / total) * 100) : 0;

    const items = scheme.documents.map((doc, i) => {
      const isChecked = checked.includes(i);
      return `
        <li class="checklist-item ${isChecked ? 'checked' : ''}" data-index="${i}">
          <label class="checklist-label">
            <input
              type="checkbox"
              class="checklist-cb"
              data-scheme="${scheme.id}"
              data-index="${i}"
              ${isChecked ? 'checked' : ''}
              aria-label="${doc}"
            />
            <span class="checklist-box">
              <i class="fa-solid fa-check checklist-tick"></i>
            </span>
            <span class="checklist-text">${doc}</span>
          </label>
        </li>
      `;
    }).join('');

    return `
      <div class="checklist-wrapper" id="checklist-${scheme.id}">
        <div class="checklist-progress-bar-wrap">
          <div class="checklist-progress-info">
            <span class="checklist-progress-label" data-i18n="modal_progress">Documents Ready</span>
            <span class="checklist-progress-count">${done}/${total}</span>
          </div>
          <div class="checklist-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
            <div class="checklist-bar-fill" style="width:${pct}%" data-pct="${pct}"></div>
          </div>
        </div>
        <ul class="checklist-list" role="list">${items}</ul>
        <div class="checklist-actions">
          <button class="checklist-download-btn" data-scheme="${scheme.id}" title="Download as PDF">
            <i class="fa-solid fa-file-pdf"></i>
            <span data-i18n="modal_download_pdf">Download Checklist PDF</span>
          </button>
        </div>
      </div>
    `;
  }

  // ── Update progress bar live ───────────────────────────
  function updateProgress(schemeId, total) {
    const checked = getChecked(schemeId);
    const done    = checked.length;
    const pct     = total > 0 ? Math.round((done / total) * 100) : 0;
    const wrapper = document.getElementById(`checklist-${schemeId}`);
    if (!wrapper) return;
    const fill  = wrapper.querySelector('.checklist-bar-fill');
    const count = wrapper.querySelector('.checklist-progress-count');
    if (fill)  { fill.style.width = `${pct}%`; fill.dataset.pct = pct; }
    if (count) count.textContent = `${done}/${total}`;
  }

  // ── Download checklist as PDF ──────────────────────────
  function downloadPDF(scheme) {
    const checked = getChecked(scheme.id);

    const docRows = scheme.documents.map((doc, i) => {
      const status = checked.includes(i) ? '✅' : '☐';
      return `<tr><td style="font-size:18px;width:30px">${status}</td><td style="padding:8px 0;font-size:14px;color:#222">${doc}</td></tr>`;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <title>Document Checklist – ${scheme.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #1a2540; }
          h1 { font-size: 20px; color: #0d1b4b; margin-bottom: 4px; }
          p  { font-size: 13px; color: #666; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; }
          td { border-bottom: 1px solid #eee; padding: 10px 8px; vertical-align: top; }
          .footer { margin-top: 40px; font-size: 11px; color: #aaa; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Document Checklist</h1>
        <p>${scheme.name}<br>Source: Yojna Setu · yojna-setu.netlify.app</p>
        <table>${docRows}</table>
        <div class="footer">Generated by Yojna Setu — India's Government Scheme Finder</div>
      </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => { win.print(); }, 400);
    }
  }

  // ── Bind events on a rendered checklist ───────────────
  function bindEvents(schemeId, totalDocs) {
    // Checkbox changes
    document.querySelectorAll(`.checklist-cb[data-scheme="${schemeId}"]`).forEach(cb => {
      cb.addEventListener('change', () => {
        const idx = parseInt(cb.dataset.index);
        toggle(schemeId, idx, cb.checked);
        // Toggle visual class
        const li = cb.closest('.checklist-item');
        if (li) li.classList.toggle('checked', cb.checked);
        updateProgress(schemeId, totalDocs);
      });
    });

    // Download PDF button
    const dlBtn = document.querySelector(`.checklist-download-btn[data-scheme="${schemeId}"]`);
    if (dlBtn) {
      dlBtn.addEventListener('click', () => {
        // We need the scheme object — fetch from window.YS_SCHEMES
        const scheme = (window.YS_SCHEMES || []).find(s => s.id === schemeId);
        if (scheme) downloadPDF(scheme);
      });
    }
  }

  return { render, bindEvents, getChecked, toggle, updateProgress };
})();
