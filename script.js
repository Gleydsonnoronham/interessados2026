// Utilitários
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* =========================================
   Inicialização segura de armazenamento local
   (correção: leads/logs devem existir)
========================================= */
let leads = [];
let logs = [];
try {
} catch (_) { leads = []; }
try {
} catch (_) { logs = []; }

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
   Captura de UTM (correção: aplicar valores aos campos)
========================================= */
(function utmCapture() {
  const params = new URLSearchParams(window.location.search);
  const setVal = (id, key) => {
    const el = document.getElementById(id);
    if (!el) return;
    const val = params.get(key);
    if (val) el.value = val;
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
   Função para enviar dados ao Google Sheets
========================================= */
async function submitToGoogleSheets(formData) {
  try {
    // 🔴 SUBSTITUA ESTA URL PELA SUA WEB APP URL DO GOOGLE APPS SCRIPT
    const scriptURL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
    
    const response = await fetch(scriptURL, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao enviar para Google Sheets:', error);
    throw error;
  }
}

/* =========================================
   Validação de formulário e submissão (Google Sheets)
   (substitui localStorage pela integração real)
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

    // limpa mensagens anteriores
    ['erro-nome','erro-email','erro-lgpd'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
    [nome, email, lgpd].forEach(el => el && el.setAttribute('aria-invalid', 'false'));

    // honeypot - proteção anti-spam
    if (hp && hp.value.trim() !== '') return;

    let ok = true;

    if (!nome.value.trim()) {
      ok = false;
      const e1 = $('#erro-nome'); if (e1) e1.textContent = 'Informe seu nome completo.';
      nome.setAttribute('aria-invalid', 'true');
      nome.focus();
    }

    if (!validateEmail(email.value.trim())) {
      ok = false;
      const e2 = $('#erro-email'); if (e2) e2.textContent = 'Informe um e-mail válido.';
      email.setAttribute('aria-invalid', 'true');
      if (document.activeElement !== nome) email.focus();
    }

    if (!lgpd.checked) {
      ok = false;
      const e3 = $('#erro-lgpd'); if (e3) e3.textContent = 'É necessário autorizar o uso dos dados para contato.';
      lgpd.setAttribute('aria-invalid', 'true');
      if (document.activeElement !== nome && document.activeElement !== email) lgpd.focus();
    }

    if (!ok) return;

    // Coleta dados dos checkboxes de interesses
    const interesses = Array.from(document.querySelectorAll('input[name="interesses"]:checked')).map(i => i.value);

    // Cria FormData para envio
    const formData = new FormData();
    formData.append('nome', nome.value.trim());
    formData.append('email', email.value.trim());
    formData.append('telefone', telefone.value.trim());
    formData.append('cidade', cidade.value.trim());
    formData.append('conclusao', conclusao.value.trim());
    formData.append('interesses', interesses.join(', '));
    formData.append('lgpd', lgpd.checked ? 'Sim' : 'Não');
    
    // Adiciona parâmetros UTM
    const utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
    utmFields.forEach(field => {
      const input = document.getElementById(field);
      if (input && input.value) {
        formData.append(field, input.value);
      }
    });
    formData.append('event_conversao', 'lead_submit');

    // Atualiza UI para estado de carregamento
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Enviando...';

    try {
      // Envia para Google Sheets
      const result = await submitToGoogleSheets(formData);
      
      if (result.success) {
        // Sucesso!
        if (feedback) {
          feedback.hidden = false;
          feedback.textContent = 'Cadastro recebido com sucesso. Você receberá nosso e-mail de boas-vindas em breve.';
          feedback.className = 'form-feedback success'; // Adiciona classe de sucesso
        }
        
        // Mensuração do submit
        trackEvent('form_submit', { form: 'lead_form' });
        
        // Limpa formulário
        form.reset();
        
      } else {
      }
    } catch (error) {
      console.error('Erro no envio:', error);
      if (feedback) {
        feedback.hidden = false;
        feedback.textContent = 'Ocorreu um erro ao enviar seu cadastro. Por favor, tente novamente mais tarde.';
        feedback.className = 'form-feedback error'; // Adiciona classe de erro
      }
    } finally {
      // Restaura botão original
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      
      // Esconde mensagem após 5 segundos
      if (feedback) {
        setTimeout(() => {
          feedback.hidden = true;
        }, 5000);
      }
    }
  });
})();

/* =========================================
   Mensuração básica (sem serviços externos)
========================================= */
function trackEvent(action, params = {}) {
  try {
    console.log('[trackEvent]', action, params);
    logs.push({ action, params, ts: Date.now() });
    localStorage.setItem('metrics_logs', JSON.stringify(logs));
  } catch(_) {}
}

// Clique em CTAs (Hero, Menu, Form) — correção: preencher handler
(function trackCTAs() {
  $$('[data-track]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.track; // Correção: usar dataset.track
      trackEvent(id, { text: el.textContent?.trim() });
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
