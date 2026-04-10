/**
 * chatbot.js — Yojna Setu AI Scheme Advisor
 * Rule-based recommendation engine with conversation flow.
 * Modular design: swap recommend() with API call for AI upgrade.
 */

const Chatbot = (() => {
  // ── Conversation Flow Definition ──────────────────────
  const FLOW = [
    {
      id: 'welcome',
      message: {
        en: "👋 Hello! I'm your Yojna Setu AI Advisor. I'll ask you a few quick questions and recommend the best government schemes for you. Ready?",
        hi: "👋 नमस्ते! मैं आपका योजना सेतु AI सलाहकार हूं। मैं आपसे कुछ सवाल पूछूंगा और आपके लिए सबसे अच्छी सरकारी योजनाएं सुझाऊंगा। तैयार हैं?",
        bn: "👋 নমস্কার! আমি আপনার যোজনা সেতু AI উপদেষ্টা। আমি আপনাকে কিছু প্রশ্ন করব এবং আপনার জন্য সেরা সরকারি প্রকল্প সুপারিশ করব। প্রস্তুত?"
      },
      type: 'quick',
      options: [
        { label: { en: "Yes, let's go!", hi: "हाँ, शुरू करें!", bn: "হ্যাঁ, শুরু করুন!" }, value: 'yes' }
      ],
      next: 'age'
    },
    {
      id: 'age',
      message: {
        en: "What is your age?",
        hi: "आपकी उम्र क्या है?",
        bn: "আপনার বয়স কত?"
      },
      type: 'quick',
      options: [
        { label: { en: 'Under 18', hi: '18 से कम', bn: '১৮-এর নিচে' }, value: 'under18' },
        { label: { en: '18–24', hi: '18–24', bn: '১৮–২৪' }, value: '18-24' },
        { label: { en: '25–35', hi: '25–35', bn: '২৫–৩৫' }, value: '25-35' },
        { label: { en: '35–60', hi: '35–60', bn: '৩৫–৬০' }, value: '35-60' },
        { label: { en: '60+', hi: '60+', bn: '৬০+' }, value: '60plus' }
      ],
      key: 'age',
      next: 'gender'
    },
    {
      id: 'gender',
      message: {
        en: "What is your gender?",
        hi: "आपका लिंग क्या है?",
        bn: "আপনার লিঙ্গ কী?"
      },
      type: 'quick',
      options: [
        { label: { en: 'Male', hi: 'पुरुष', bn: 'পুরুষ' }, value: 'male' },
        { label: { en: 'Female', hi: 'महिला', bn: 'মহিলা' }, value: 'female' },
        { label: { en: 'Other / Prefer not to say', hi: 'अन्य', bn: 'অন্যান্য' }, value: 'other' }
      ],
      key: 'gender',
      next: 'occupation'
    },
    {
      id: 'occupation',
      message: {
        en: "What is your current occupation?",
        hi: "आपका वर्तमान व्यवसाय क्या है?",
        bn: "আপনার বর্তমান পেশা কী?"
      },
      type: 'quick',
      options: [
        { label: { en: 'Student', hi: 'छात्र/छात्रा', bn: 'ছাত্র/ছাত্রী' }, value: 'student' },
        { label: { en: 'Graduate / Job Seeker', hi: 'स्नातक / नौकरी खोज रहे', bn: 'স্নাতক / চাকরিপ্রার্থী' }, value: 'graduate' },
        { label: { en: 'Farmer', hi: 'किसान', bn: 'কৃষক' }, value: 'farmer' },
        { label: { en: 'Self-Employed / Entrepreneur', hi: 'स्वरोजगार / उद्यमी', bn: 'স্ব-নিযুক্ত / উদ্যোক্তা' }, value: 'entrepreneur' },
        { label: { en: 'Salaried Employee', hi: 'वेतनभोगी', bn: 'বেতনভোগী' }, value: 'employed' },
        { label: { en: 'Homemaker', hi: 'गृहिणी', bn: 'গৃহিণী' }, value: 'homemaker' }
      ],
      key: 'occupation',
      next: 'income'
    },
    {
      id: 'income',
      message: {
        en: "What is your approximate annual family income?",
        hi: "आपकी वार्षिक पारिवारिक आय लगभग कितनी है?",
        bn: "আপনার পারিবারিক বার্ষিক আয় কত?"
      },
      type: 'quick',
      options: [
        { label: { en: 'Below ₹1 Lakh', hi: '₹1 लाख से कम', bn: '₹১ লক্ষের নিচে' }, value: 'below1L', numeric: 100000 },
        { label: { en: '₹1L – ₹3L', hi: '₹1L – ₹3L', bn: '₹১L – ₹৩L' }, value: '1-3L', numeric: 250000 },
        { label: { en: '₹3L – ₹8L', hi: '₹3L – ₹8L', bn: '₹৩L – ₹৮L' }, value: '3-8L', numeric: 500000 },
        { label: { en: '₹8L – ₹18L', hi: '₹8L – ₹18L', bn: '₹৮L – ₹১৮L' }, value: '8-18L', numeric: 1200000 },
        { label: { en: 'Above ₹18L', hi: '₹18L से अधिक', bn: '₹১৮L-এর বেশি' }, value: 'above18L', numeric: 2000000 }
      ],
      key: 'income',
      next: 'category'
    },
    {
      id: 'category',
      message: {
        en: "What is your social category?",
        hi: "आपकी सामाजिक श्रेणी क्या है?",
        bn: "আপনার সামাজিক বিভাগ কী?"
      },
      type: 'quick',
      options: [
        { label: { en: 'General', hi: 'सामान्य', bn: 'সাধারণ' }, value: 'general' },
        { label: { en: 'OBC', hi: 'OBC', bn: 'OBC' }, value: 'obc' },
        { label: { en: 'SC', hi: 'SC', bn: 'SC' }, value: 'sc' },
        { label: { en: 'ST', hi: 'ST', bn: 'ST' }, value: 'st' },
        { label: { en: 'EWS', hi: 'EWS', bn: 'EWS' }, value: 'ews' }
      ],
      key: 'category',
      next: 'state'
    },
    {
      id: 'state',
      message: {
        en: "Which state are you from?",
        hi: "आप किस राज्य से हैं?",
        bn: "আপনি কোন রাজ্যের?"
      },
      type: 'quick',
      options: [
        { label: { en: 'West Bengal', hi: 'पश्चिम बंगाल', bn: 'পশ্চিমবঙ্গ' }, value: 'west-bengal' },
        { label: { en: 'Maharashtra', hi: 'महाराष्ट्र', bn: 'মহারাষ্ট্র' }, value: 'maharashtra' },
        { label: { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश', bn: 'উত্তর প্রদেশ' }, value: 'uttar-pradesh' },
        { label: { en: 'Karnataka', hi: 'कर्नाटक', bn: 'কর্ণাটক' }, value: 'karnataka' },
        { label: { en: 'Rajasthan', hi: 'राजस्थान', bn: 'রাজস্থান' }, value: 'rajasthan' },
        { label: { en: 'Tamil Nadu', hi: 'तमिलनाडु', bn: 'তামিলনাড়ু' }, value: 'tamil-nadu' },
        { label: { en: 'Other State', hi: 'अन्य राज्य', bn: 'অন্য রাজ্য' }, value: 'other' }
      ],
      key: 'state',
      next: 'result'
    }
  ];

  // ── Rule-Based Recommendation Engine ──────────────────
  // Replace this function with an API call for AI upgrade:
  // POST /api/recommend with userProfile → returns schemeIds[]
  function recommend(profile, allSchemes) {
    const income     = profile.income_numeric || 0;
    const occ        = profile.occupation || '';
    const age        = profile.age || '';
    const gender     = profile.gender || '';
    const scores     = {};

    allSchemes.forEach(s => {
      scores[s.id] = 0;

      // Income eligibility
      if (income <= (s.eligibilityIncome?.max || Infinity)) scores[s.id] += 2;

      // Age match
      const ageMin = s.eligibilityAge?.min || 0;
      const ageMax = s.eligibilityAge?.max || 99;
      const ageNum = ageToNum(age);
      if (ageNum >= ageMin && ageNum <= ageMax) scores[s.id] += 2;

      // Gender
      if (s.eligibilityGender === 'all' || s.eligibilityGender === gender) scores[s.id] += 1;

      // Occupation → eligibility tag match
      if (s.eligibility.includes(occ)) scores[s.id] += 3;
      if (occ === 'student'     && s.eligibility.includes('youth'))        scores[s.id] += 1;
      if (occ === 'graduate'    && s.eligibility.includes('youth'))        scores[s.id] += 1;
      if (occ === 'entrepreneur'&& s.eligibility.includes('graduate'))     scores[s.id] += 1;
      if (occ === 'homemaker'   && s.eligibility.includes('women'))        scores[s.id] += 2;

      // Category bonus for scholarships to SC/ST/OBC
      if (['sc','st','obc','ews'].includes(profile.category) && s.category === 'scholarship') scores[s.id] += 2;

      // State match
      if (s.state === profile.state || s.state === 'central') scores[s.id] += 1;
    });

    return allSchemes
      .map(s => ({ ...s, _score: scores[s.id] }))
      .filter(s => s._score >= 3)
      .sort((a, b) => b._score - a._score)
      .slice(0, 4);
  }

  function ageToNum(ageStr) {
    const map = { 'under18': 15, '18-24': 21, '25-35': 30, '35-60': 45, '60plus': 65 };
    return map[ageStr] || 25;
  }

  // ── State ──────────────────────────────────────────────
  let isOpen    = false;
  let step      = 0;
  let profile   = {};
  let lang      = 'en';
  let allSchemes= [];

  // ── Build HTML skeleton ────────────────────────────────
  function buildUI() {
    const el = document.createElement('div');
    el.id = 'ys-chatbot';
    el.setAttribute('role', 'complementary');
    el.setAttribute('aria-label', 'AI Scheme Advisor');
    el.innerHTML = `
      <!-- Floating trigger button -->
      <button class="cb-trigger" id="cb-trigger" aria-label="Open AI Advisor" aria-expanded="false">
        <span class="cb-trigger-icon"><i class="fa-solid fa-robot"></i></span>
        <span class="cb-trigger-label" data-i18n="chatbot_open">Find My Schemes</span>
        <span class="cb-trigger-ping"></span>
      </button>

      <!-- Chat window -->
      <div class="cb-window" id="cb-window" aria-hidden="true" role="dialog" aria-labelledby="cb-title">
        <div class="cb-header">
          <div class="cb-header-info">
            <div class="cb-avatar"><i class="fa-solid fa-robot"></i></div>
            <div>
              <div class="cb-title" id="cb-title" data-i18n="chatbot_title">AI Scheme Advisor</div>
              <div class="cb-status"><span class="cb-dot"></span> <span data-i18n="chatbot_subtitle">I'll help find the best schemes</span></div>
            </div>
          </div>
          <div class="cb-header-actions">
            <button class="cb-btn-icon" id="cb-restart" title="Restart" data-i18n-aria="chatbot_restart">
              <i class="fa-solid fa-rotate-left"></i>
            </button>
            <button class="cb-btn-icon" id="cb-close" title="Close" data-i18n-aria="chatbot_close">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
        <div class="cb-messages" id="cb-messages" role="log" aria-live="polite"></div>
        <div class="cb-options" id="cb-options"></div>
      </div>
    `;
    document.body.appendChild(el);

    document.getElementById('cb-trigger').addEventListener('click', toggle);
    document.getElementById('cb-close').addEventListener('click', close);
    document.getElementById('cb-restart').addEventListener('click', restart);

    window.addEventListener('ys:langChanged', e => {
      lang = e.detail.lang;
    });
  }

  // ── Message helpers ────────────────────────────────────
  function addMessage(text, sender = 'bot', delay = 0) {
    return new Promise(resolve => {
      setTimeout(() => {
        const msgs   = document.getElementById('cb-messages');
        const div    = document.createElement('div');
        div.className = `cb-msg cb-msg-${sender}`;
        div.innerHTML = `<div class="cb-bubble">${text}</div>`;
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
        resolve();
      }, delay);
    });
  }

  function showTyping() {
    const msgs = document.getElementById('cb-messages');
    const div  = document.createElement('div');
    div.id = 'cb-typing';
    div.className = 'cb-msg cb-msg-bot';
    div.innerHTML = `<div class="cb-bubble cb-typing-bubble"><span></span><span></span><span></span></div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById('cb-typing');
    if (t) t.remove();
  }

  function showOptions(opts) {
    const container = document.getElementById('cb-options');
    container.innerHTML = '';
    opts.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'cb-option-btn';
      btn.textContent = opt.label[lang] || opt.label.en;
      btn.addEventListener('click', () => handleOption(opt));
      container.appendChild(btn);
    });
  }

  function clearOptions() {
    document.getElementById('cb-options').innerHTML = '';
  }

  // ── Conversation flow ──────────────────────────────────
  async function handleOption(opt) {
    clearOptions();
    const currentStep = FLOW[step];

    // Show user's choice as a message
    await addMessage(opt.label[lang] || opt.label.en, 'user');

    // Save to profile
    if (currentStep.key) {
      profile[currentStep.key] = opt.value;
      if (opt.numeric !== undefined) profile.income_numeric = opt.numeric;
    }

    // Advance
    step++;
    if (step < FLOW.length) {
      await nextStep();
    } else {
      await showResults();
    }
  }

  async function nextStep() {
    showTyping();
    await new Promise(r => setTimeout(r, 600));
    hideTyping();

    const current = FLOW[step];
    const msg     = current.message[lang] || current.message.en;
    await addMessage(msg, 'bot');
    showOptions(current.options);
  }

  async function showResults() {
    showTyping();
    await new Promise(r => setTimeout(r, 900));
    hideTyping();

    const results = recommend(profile, allSchemes);
    const noResult = {
      en: "😕 I couldn't find exact matches for your profile. Try browsing all schemes or adjusting your filters on the main page.",
      hi: "😕 मुझे आपके प्रोफ़ाइल के लिए सटीक मिलान नहीं मिला। मुख्य पृष्ठ पर सभी योजनाएं देखें।",
      bn: "😕 আমি আপনার প্রোফাইলের জন্য সঠিক মিল খুঁজে পাইনি। মূল পাতায় সব প্রকল্প দেখুন।"
    };

    if (results.length === 0) {
      await addMessage(noResult[lang] || noResult.en, 'bot');
      return;
    }

    const intro = {
      en: `🎉 Great news! Based on your profile, here are <strong>${results.length} schemes</strong> you may be eligible for:`,
      hi: `🎉 बधाई! आपके प्रोफ़ाइल के आधार पर, यहां <strong>${results.length} योजनाएं</strong> हैं जिनके लिए आप पात्र हो सकते हैं:`,
      bn: `🎉 দারুণ! আপনার প্রোফাইলের ভিত্তিতে, এখানে <strong>${results.length}টি প্রকল্প</strong> যেগুলিতে আপনি যোগ্য হতে পারেন:`
    };
    await addMessage(intro[lang] || intro.en, 'bot');

    // Render result cards
    const msgs = document.getElementById('cb-messages');
    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'cb-results';
    resultsDiv.innerHTML = results.map(s => `
      <div class="cb-result-card" data-id="${s.id}">
        <div class="cb-result-icon" style="color:${s.color}"><i class="${s.icon}"></i></div>
        <div class="cb-result-info">
          <div class="cb-result-name">${lang === 'hi' ? s.nameHi : lang === 'bn' ? s.nameBn : s.name}</div>
          <div class="cb-result-desc">${s.shortDesc}</div>
        </div>
        <button class="cb-result-view" data-id="${s.id}">
          ${lang === 'hi' ? 'देखें' : lang === 'bn' ? 'দেখুন' : 'View'}
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    `).join('');

    msgs.appendChild(resultsDiv);
    msgs.scrollTop = msgs.scrollHeight;

    // Bind view buttons → open modal on main page
    resultsDiv.querySelectorAll('.cb-result-view').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        close();
        if (typeof openSchemeModal === 'function') openSchemeModal(id);
      });
    });

    const outro = {
      en: "Click any scheme to see the full guide, document checklist, and official apply link. Good luck! 🙏",
      hi: "पूरी गाइड, दस्तावेज़ चेकलिस्ट और आधिकारिक आवेदन लिंक देखने के लिए किसी भी योजना पर क्लिक करें। शुभकामनाएं! 🙏",
      bn: "সম্পূর্ণ গাইড, নথি চেকলিস্ট এবং সরকারি আবেদন লিঙ্ক দেখতে যেকোনো প্রকল্পে ক্লিক করুন। শুভকামনা! 🙏"
    };
    await addMessage(outro[lang] || outro.en, 'bot', 600);
  }

  // ── Open / Close / Toggle ──────────────────────────────
  function open() {
    isOpen = true;
    document.getElementById('cb-window').classList.add('open');
    document.getElementById('cb-window').setAttribute('aria-hidden', 'false');
    document.getElementById('cb-trigger').setAttribute('aria-expanded', 'true');
    if (step === 0) nextStep();
  }

  function close() {
    isOpen = false;
    document.getElementById('cb-window').classList.remove('open');
    document.getElementById('cb-window').setAttribute('aria-hidden', 'true');
    document.getElementById('cb-trigger').setAttribute('aria-expanded', 'false');
  }

  function toggle() {
    isOpen ? close() : open();
  }

  function restart() {
    step    = 0;
    profile = {};
    document.getElementById('cb-messages').innerHTML = '';
    clearOptions();
    nextStep();
  }

  // ── Init ───────────────────────────────────────────────
  function init(schemes) {
    allSchemes = schemes || [];
    lang = Translator?.lang || localStorage.getItem('ys_lang') || 'en';
    buildUI();
  }

  return { init, open, close, toggle, restart };
})();
