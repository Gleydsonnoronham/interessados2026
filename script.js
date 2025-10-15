// Utilitários
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Controle de navegação mobile
(function navToggle() {
  const btn = $('.nav-toggle');
  const menu = $('#menu-principal');

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });

  // Fechar ao clicar em link
  $$('#menu-principal a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
})();

// Ano no rodapé
(function yearFooter() {
  const el = $('#ano-atual');
  if (el) el.textContent = String(new Date().getFullYear());
})();

// Captura de UTM e preenchimento de campos ocultos
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

// Máscara simples de telefone (não intrusiva)
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

// Validação de formulário e submissão (sem back-end, armazena localmente)
(function formHandler() {
  const form = $('#lead-form');
  if (!form) return;

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const feedback = $('#form-feedback');
    const hp = $('#website');
    const nome = $('#nome');
    const email = $('#email');
    const telefone = $('#telefone');
    const cidade = $('#cidade');
    const conclusao = $('#conclusao');
    const lgpd = $('#lgpd');

    // Limpa mensagens
    ['erro-nome','erro-email','erro-lgpd'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
    [nome, email, lgpd].forEach(el => el && el.setAttribute('aria-invalid', 'false'));

    // Honeypot: se preenchido, descarta o envio
    if (hp && hp.value.trim() !== '') {
      return; // Bot automatizado
    }

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

    // Coleta interesses
    const interesses = $$('input[name="interesses"]:checked').map(i => i.value);

    // Coleta UTMs
    const utm = {
    };

    // Payload para integração futura (sem dados fictícios)
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

    // Persistência local (substituir por integração real quando necessário)
    try {
      leads.push(payload);
      localStorage.setItem('leads_ifto_admin', JSON.stringify(leads));
    } catch (err) {
      // Em ambientes com restrição a localStorage, ignore silenciosamente
    }

    // Feedback ao usuário
    if (feedback) {
      feedback.hidden = false;
      feedback.textContent = 'Cadastro recebido com sucesso. Você receberá nosso e-mail de boas-vindas em breve.';
    }

    // Reset amigável (mantém UTMs)
    form.reset();
  });
})();

// Acessibilidade: foco ao navegar por âncora do "Pular para o conteúdo"
(function focusMainOnSkip() {
  const main = document.getElementById('conteudo-principal');
  if (!main) return;
  window.addEventListener('hashchange', () => {
    if (location.hash === '#conteudo-principal') main.focus();
  });
})();
