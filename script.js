// Utilitários
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* =========================================
   Navegação mobile com backdrop e acessibilidade
========================================= */
(function navToggle() {
  const btn = $('.nav-toggle');
  const menu = $('#menu-principal');
  const backdrop = $('#backdrop');

  const openMenu = () => {
    menu.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    backdrop.hidden = false;
    backdrop.classList.add('show');
    document.documentElement.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    backdrop.classList.remove('show');
    setTimeout(() => { backdrop.hidden = true; }, 200);
    document.documentElement.style.overflow = '';
  };

  btn.addEventListener('click', () => {
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });

  backdrop.addEventListener('click', closeMenu);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  $$('#menu-principal a').forEach(a => a.addEventListener('click', closeMenu));
})();

/* =========================================
   Ano no rodapé
========================================= */
(function yearFooter() {
  const el = $('#ano-atual');
  if (el) el.textContent = String(new Date().getFullYear());
})();

/* =========================================
   Captura de UTM (utm_source, utm_medium, utm_campaign, utm_content)
========================================= */
(function utmCapture() {
  const params = new URLSearchParams(window.location.search);
  const setVal = (id, key) => {
    const el = document.getElementById(id);
  };
  setVal('utm_source', 'utm_source');
  setVal('utm_medium', 'utm_medium');
  setVal('utm_campaign', 'utm_campaign');
  setVal('utm_content', 'utm_content');
})();

/* =========================================
   Máscara simples de telefone (não intrusiva)
========================================= */
(function phoneMask() {
  const tel = $('#telefone');
  if (!tel) return;
  tel.addEventListener('input', () => {
    let v = tel.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) {
      tel.value = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    } else if (v.length > 2) {
      tel.value = `(${v.slice(0,2)}) ${v.slice(2)}`;
    } else {
      tel.value = v;
    }
  });
})();

/* =========================================
   Validação de formulário e submissão (localStorage)
========================================= */
(function formHandler() {
  const form = $('#lead-form');
  if (!form) return;

  const feedback = $('#form-feedback');
  const hp = $('#website');
  const nome = $('#nome');
  const email = $('#email');
  const telefone = $('#telefone');
  const cidade = $('#cidade');
  const conclusao = $('#conclusao');
  const lgpd = $('#lgpd');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    ['erro-nome','erro-email','erro-lgpd'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
    [nome, email, lgpd].forEach(el => el && el.setAttribute('aria-invalid', 'false'));

    if (hp && hp.value.trim() !== '') return;

    let ok = true;

    if (!nome.value.trim()) {
      ok = false;
      const e1 = $('#erro-nome'); if (e1) e1.textContent = 'Informe seu nome completo.';
      nome.setAttribute('aria-invalid', 'true');
      nome.focus();
    }

      ok = false;
      const e2 = $('#erro-email'); if (e2) e2.textContent = 'Informe um e-mail válido.';
      email.setAttribute('aria-invalid', 'true');
      if (ok) email.focus();
    }

    if (!lgpd.checked) {
      ok = false;
      const e3 = $('#erro-lgpd'); if (e3) e3.textContent = 'É necessário autorizar o uso dos dados para contato.';
      lgpd.setAttribute('aria-invalid', 'true');
      if (ok) lgpd.focus();
    }

    if (!ok) return;

    const interesses = Array.from(document.querySelectorAll('input[name="interesses"]:checked')).map(i => i.value);

    const utm = {
    };

    const payload = {
      nome: nome.value.trim(),
      email: email.value.trim(),
      telefone: telefone.value.trim(),
      cidade: cidade.value.trim(),
      conclusao: conclusao.value.trim(),
      interesses,
      lgpd: true,
      event: 'lead_submit',
      ...utm,
      timestamp: new Date().toISOString()
    };

    try {
      leads.push(payload);
      localStorage.setItem('leads_ifto_admin', JSON.stringify(leads));
    } catch (err) {
      // Ignorar em ambientes que bloqueiam localStorage
    }

    if (feedback) {
      feedback.hidden = false;
      feedback.textContent = 'Cadastro recebido com sucesso. Você receberá nosso e-mail de boas-vindas em breve.';
    }

    // Mensuração do submit (genérico)
    trackEvent('form_submit', { form: 'lead_form' });

    form.reset();
  });
})();

/* =========================================
   Mensuração básica (sem serviços externos)
   - Você pode substituir por GA/Tag Manager no futuro.
========================================= */
function trackEvent(action, params = {}) {
  // 1) Registro no console (visualização rápida)
  // 2) Persistência simples no localStorage (histórico local)
  try {
    console.log('[trackEvent]', action, params);
    logs.push({ action, params, ts: Date.now() });
    localStorage.setItem('metrics_logs', JSON.stringify(logs));
  } catch(_) {}
}

// Clique em CTAs (Hero, Menu, Form)
(function trackCTAs() {
  $$('[data-track]').forEach(el => {
    el.addEventListener('click', () => {
    });
  });
})();

// Abertura de FAQ (útil para saber o que gera mais dúvidas)
(function trackFAQ() {
  $$('#faq .faq-item > summary').forEach(s => {
    s.addEventListener('click', () => {
      const question = s.textContent.trim();
      const isOpen = s.parentElement?.open === true; // estado pós-clique no next tick
      // Pequeno delay para capturar o estado correto
      setTimeout(() => {
        trackEvent('faq_toggle', { question, open: s.parentElement?.open === true });
      }, 0);
    });
  });
})();

/* =========================================
   Acessibilidade: foco ao "Pular para o conteúdo"
========================================= */
(function focusMainOnSkip() {
  const main = document.getElementById('conteudo-principal');
  if (!main) return;
  window.addEventListener('hashchange', () => {
    if (location.hash === '#conteudo-principal') main.focus();
  });
})();
