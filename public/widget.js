/**
 * widget.js — KoivuChat Floating Widget v2
 *
 * Multi-tenant: riittää yksi attribuutti, widget hakee kaiken muun itse.
 *
 * Upotus asiakkaan sivustolle:
 *   <script
 *     src="https://rag-chatbot-api-unq6.onrender.com/widget.js"
 *     data-api="https://rag-chatbot-api-unq6.onrender.com"
 *     data-bot-id="asiakas-123"
 *   ></script>
 *
 * Parametrit:
 *   data-api     — FastAPI-backendin URL (pakollinen)
 *   data-bot-id  — asiakkaan bot-tunniste (oletus: "default")
 *
 * Kaikki muut asetukset (väri, otsikko, welcome-viesti jne.)
 * haetaan automaattisesti GET /config/{bot_id} -endpointista.
 * Niitä ei tarvitse kirjoittaa embed-koodiin lainkaan.
 */

(function () {
  'use strict';

  // ── Lue script-tagi ───────────────────────────────────────────────────
  const script = document.currentScript ||
    document.querySelector('script[data-api]');

  const API_BASE = (script?.getAttribute('data-api') || 'http://localhost:8000').replace(/\/$/, '');
  const BOT_ID   = script?.getAttribute('data-bot-id') || 'default';

  // ── Tila ──────────────────────────────────────────────────────────────
  let CONFIG = {
    title:           'AI Assistentti',
    color:           '#14b8a6',
    position:        'right',
    welcome_message: 'Hei! Miten voin auttaa? 👋',
    placeholder:     'Kirjoita kysymyksesi...',
    context:         'general',
    avatar:          '🤖',
  };

  let isOpen         = false;
  let chatHistory    = [];
  let isLoading      = false;
  let initialized    = false;
  let messageCount   = 0;    // seurataan lead-triggeriä varten
  let leadCaptured   = false; // näytetään vain kerran
  // Session ID — generoidaan kerran per sivulatauts, lähetetään /chat:iin
  const SESSION_ID = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

  // ── Hae konfiguraatio API:sta ─────────────────────────────────────────
  // Widget hakee asetuksensa palvelimelta → asiakkaan embed-koodi ei muutu
  // kun admin muuttaa väriä tai otsikkoa hallintapaneelista.
  async function loadConfig() {
    try {
      const res = await fetch(`${API_BASE}/config/${BOT_ID}`);
      if (res.ok) {
        const data = await res.json();
        CONFIG = { ...CONFIG, ...data };
      }
    } catch (_) {
      // Käytetään defaultteja jos API ei vastaa
    }
    init();
  }

  // ── Rakenna widget DOM:iin ─────────────────────────────────────────────
  function init() {
    if (initialized) return;
    initialized = true;

    // Injektoi CSS
    const style = document.createElement('style');
    style.textContent = buildCSS();
    document.head.appendChild(style);

    // Luo napit ja ikkuna
    const btn = document.createElement('button');
    btn.id = 'rag-widget-btn';
    btn.setAttribute('aria-label', 'Avaa chat');
    btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
    </svg>`;

    const bubble = document.createElement('div');
    bubble.id = 'rag-widget-bubble';
    bubble.setAttribute('role', 'dialog');
    bubble.setAttribute('aria-label', CONFIG.title);
    bubble.innerHTML = `
      <div class="rag-header">
        <div class="rag-header-dot"></div>
        <div class="rag-header-title">${CONFIG.title}</div>
        <button class="rag-header-close" id="rag-close" aria-label="Sulje">✕</button>
      </div>
      <div class="rag-messages" id="rag-messages" role="log" aria-live="polite"></div>
      <div class="rag-quick-replies" id="rag-quick-replies"></div>
      <div class="rag-input-area">
        <textarea
          class="rag-input" id="rag-input" rows="1"
          placeholder="${CONFIG.placeholder}"
          aria-label="Kirjoita viesti"
        ></textarea>
        <button class="rag-send" id="rag-send" aria-label="Lähetä">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
      <div class="rag-footer">Powered by <a href="https://koivulabs.com" target="_blank" rel="noopener">KoivuLabs</a></div>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(bubble);

    // Elementtiviittaukset
    const messagesEl = document.getElementById('rag-messages');
    const inputEl    = document.getElementById('rag-input');
    const sendEl     = document.getElementById('rag-send');

    // ── Avaa / sulje ───────────────────────────────────────────────────
    function toggle() {
      isOpen = !isOpen;
      bubble.classList.toggle('open', isOpen);
      btn.classList.toggle('open', isOpen);
      btn.setAttribute('aria-expanded', isOpen);
      if (isOpen && messagesEl.children.length === 0) {
        addMsg('bot', CONFIG.welcome_message);
        renderQuickReplies();
      }
      if (isOpen) setTimeout(() => inputEl.focus(), 300);
    }

    btn.addEventListener('click', toggle);
    document.getElementById('rag-close').addEventListener('click', toggle);

    // ── Quick replies ──────────────────────────────────────────────────
    // Näytetään napit ennen ensimmäistä käyttäjäviestiä.
    // Klikattu nappi lähettää kysymyksen automaattisesti ja napit katoavat.
    const quickRepliesEl = document.getElementById('rag-quick-replies');

    function renderQuickReplies() {
      const replies = CONFIG.quick_replies || [];
      if (!replies.length) return;
      quickRepliesEl.innerHTML = replies.map(q =>
        `<button class="rag-qr-btn" data-q="${q.replace(/"/g, '&quot;')}">${q}</button>`
      ).join('');
      quickRepliesEl.classList.add('visible');
    }

    function hideQuickReplies() {
      quickRepliesEl.classList.remove('visible');
      quickRepliesEl.innerHTML = '';
    }

    quickRepliesEl.addEventListener('click', e => {
      const btn = e.target.closest('.rag-qr-btn');
      if (!btn) return;
      const question = btn.getAttribute('data-q');
      hideQuickReplies();
      inputEl.value = question;
      send();
    });

    // ESC sulkee widgetin
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) toggle();
    });

    // ── Viestien renderöinti ───────────────────────────────────────────
    function addMsg(role, text, sources = [], found = true) {
      const div = document.createElement('div');
      div.className = `rag-msg ${role}`;

      const avatarContent = role === 'bot' ? CONFIG.avatar : '▸';
      const formatted = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

      const bubbleClass = !found ? 'rag-bubble rag-not-found' : 'rag-bubble';
      const sourcesHtml = sources.length
        ? `<div class="rag-sources">📚 ${sources.map(s =>
            s.startsWith('http') ? `<a href="${s}" target="_blank" rel="noopener">${new URL(s).hostname}</a>` : s
          ).join(' · ')}</div>`
        : '';

      div.innerHTML = `
        <div class="rag-avatar">${avatarContent}</div>
        <div>
          <div class="${bubbleClass}">${formatted}</div>
          ${sourcesHtml}
        </div>
      `;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return div;
    }

    function addTyping() {
      const div = document.createElement('div');
      div.className = 'rag-msg bot';
      div.id = 'rag-typing';
      div.innerHTML = `
        <div class="rag-avatar">${CONFIG.avatar}</div>
        <div class="rag-bubble">
          <div class="rag-typing">
            <div class="rag-dot"></div>
            <div class="rag-dot"></div>
            <div class="rag-dot"></div>
          </div>
        </div>
      `;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return div;
    }

    // ── Lähetä viesti ──────────────────────────────────────────────────
    async function send() {
      const question = inputEl.value.trim();
      if (!question || isLoading) return;

      inputEl.value = '';
      inputEl.style.height = 'auto';
      isLoading = true;
      sendEl.disabled = true;

      hideQuickReplies();   // piilota quick replies ensimmäisen viestin jälkeen
      addMsg('user', question);
      chatHistory.push({ role: 'user', content: question });

      const typing = addTyping();

      try {
        const res = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            context:      CONFIG.context,
            bot_id:       BOT_ID,
            chat_history: chatHistory.slice(-6, -1),
            session_id:   SESSION_ID,
          })
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        typing.remove();
        addMsg('bot', data.answer, data.sources || [], data.found);
        chatHistory.push({ role: 'assistant', content: data.answer });
        messageCount++;

        // Unanswered: jos botti ei löytänyt tietoa → näytä ilmoitusnappi
        if (!data.found) {
          addUnansweredPrompt(question);
        }

        // Lead capture trigger
        checkLeadTrigger();

      } catch (err) {
        typing.remove();
        addMsg('bot', `Yhteysvirhe: ${err.message}`, [], false);
      }

      isLoading = false;
      sendEl.disabled = false;
      inputEl.focus();
    }

    sendEl.addEventListener('click', send);
    inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });
    inputEl.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 80) + 'px';
    });
  }

  // ── Unanswered questions ──────────────────────────────────────────────
  function addUnansweredPrompt(question) {
    const div = document.createElement('div');
    div.className = 'rag-unanswered-prompt';
    div.innerHTML = `
      <span>Haluatko ilmoittaa tästä puuttuvasta tiedosta ylläpidolle?</span>
      <button class="rag-ua-yes">📬 Ilmoita</button>
      <button class="rag-ua-no">✕</button>
    `;
    div.querySelector('.rag-ua-yes').addEventListener('click', async () => {
      div.innerHTML = '<span style="color:#94a3b8;font-size:12px">Kiitos ilmoituksesta! Lisäämme tiedon.</span>';
      try {
        await fetch(`${API_BASE}/unanswered`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bot_id: BOT_ID, question, context: CONFIG.context }),
        });
      } catch (_) {}
      setTimeout(() => div.remove(), 3000);
    });
    div.querySelector('.rag-ua-no').addEventListener('click', () => div.remove());
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ── Lead capture ───────────────────────────────────────────────────────
  function checkLeadTrigger() {
    if (leadCaptured) return;
    const cfg = CONFIG.lead_config || {};
    if (!cfg.enabled) return;
    const trigger = cfg.trigger || 'on_not_found';
    if (trigger === 'always' && messageCount === 1) showLeadForm();
    if (trigger === 'after_3_messages' && messageCount === 3) showLeadForm();
    // on_not_found: käsitellään addUnansweredPrompt:n sijasta erikseen vain jos lead on enabled
  }

  function showLeadForm() {
    if (leadCaptured) return;
    leadCaptured = true;
    const cfg = CONFIG.lead_config || {};
    const div = document.createElement('div');
    div.className = 'rag-lead-form';
    div.innerHTML = `
      <div class="rag-lead-title">${cfg.question || 'Jätä yhteystietosi, niin olemme sinuun yhteydessä.'}</div>
      <input class="rag-lead-input" id="rag-lead-name" placeholder="Nimesi (vapaaehtoinen)" />
      <input class="rag-lead-input" id="rag-lead-email" type="email" placeholder="Sähköpostisi *" required />
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="rag-lead-submit">Lähetä</button>
        <button class="rag-lead-skip">Ohita</button>
      </div>
    `;
    div.querySelector('.rag-lead-submit').addEventListener('click', async () => {
      const email = div.querySelector('#rag-lead-email').value.trim();
      const name  = div.querySelector('#rag-lead-name').value.trim();
      if (!email) { div.querySelector('#rag-lead-email').style.borderColor = 'red'; return; }
      div.innerHTML = '<div style="color:#94a3b8;font-size:13px;padding:4px 0">✓ Kiitos! Olemme sinuun pian yhteydessä.</div>';
      try {
        const lastQuestion = chatHistory.slice(-2).find(m => m.role === 'user')?.content || '';
        await fetch(`${API_BASE}/lead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bot_id: BOT_ID, name, email, question: lastQuestion, context: CONFIG.context }),
        });
      } catch (_) {}
      setTimeout(() => div.remove(), 4000);
    });
    div.querySelector('.rag-lead-skip').addEventListener('click', () => div.remove());
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ── CSS-generaattori ──────────────────────────────────────────────────
  // Rakennetaan configin pohjalta → väri, asento jne. tulee API:sta
  function buildCSS() {
    const c = CONFIG.color;
    const p = CONFIG.position;
    return `
    #rag-widget-btn {
      position: fixed; bottom: 24px; ${p}: 24px;
      width: 56px; height: 56px; border-radius: 50%;
      background: ${c}; border: none; cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
      display: flex; align-items: center; justify-content: center;
      z-index: 99998; transition: transform 0.2s, box-shadow 0.2s;
    }
    #rag-widget-btn:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(0,0,0,0.3); }
    #rag-widget-btn svg { transition: transform 0.3s; }
    #rag-widget-btn.open svg { transform: rotate(45deg); }

    #rag-widget-bubble {
      position: fixed; bottom: 92px; ${p}: 24px;
      width: 370px; height: 520px;
      background: #0f172a; border: 1px solid rgba(51,65,85,0.6);
      border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.4);
      display: flex; flex-direction: column;
      z-index: 99999; overflow: hidden;
      transform: scale(0.9) translateY(12px); opacity: 0; pointer-events: none;
      transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), opacity 0.2s;
    }
    #rag-widget-bubble.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }
    @media (max-width: 420px) {
      #rag-widget-bubble { width: calc(100vw - 24px); ${p}: 12px; bottom: 84px; height: 60vh; }
    }
    .rag-header {
      padding: 14px 16px;
      background: linear-gradient(135deg, ${c}22, transparent);
      border-bottom: 1px solid rgba(51,65,85,0.5);
      display: flex; align-items: center; gap: 10px;
    }
    .rag-header-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: ${c}; box-shadow: 0 0 8px ${c};
      animation: ragPulse 2s infinite;
    }
    @keyframes ragPulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
    .rag-header-title { font-weight: 700; font-size: 14px; color: #f1f5f9; flex: 1; font-family: system-ui,-apple-system,sans-serif; }
    .rag-header-close { background: none; border: none; cursor: pointer; color: #64748b; font-size: 18px; line-height: 1; padding: 2px 4px; border-radius: 4px; transition: color 0.2s; }
    .rag-header-close:hover { color: #94a3b8; }
    .rag-messages { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; scroll-behavior: smooth; }
    .rag-messages::-webkit-scrollbar { width: 3px; }
    .rag-messages::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
    .rag-msg { display: flex; gap: 8px; animation: ragMsgIn 0.2s ease; }
    @keyframes ragMsgIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
    .rag-msg.user { flex-direction: row-reverse; }
    .rag-avatar { width: 26px; height: 26px; border-radius: 7px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 13px; }
    .rag-msg.bot  .rag-avatar { background: ${c}22; color: ${c}; border: 1px solid ${c}33; }
    .rag-msg.user .rag-avatar { background: rgba(59,130,246,0.15); color: #60a5fa; font-size: 10px; font-weight: 700; }
    .rag-bubble { max-width: 80%; padding: 9px 12px; border-radius: 11px; font-size: 13px; line-height: 1.55; font-family: system-ui,-apple-system,sans-serif; }
    .rag-msg.bot  .rag-bubble { background: #1e293b; color: #cbd5e1; border: 1px solid #334155; border-radius: 2px 11px 11px 11px; }
    .rag-msg.user .rag-bubble { background: ${c}1a; color: #e2e8f0; border: 1px solid ${c}33; border-radius: 11px 2px 11px 11px; }
    .rag-not-found { background: rgba(234,179,8,0.08)!important; border: 1px solid rgba(234,179,8,0.2)!important; border-left: 3px solid rgba(234,179,8,0.5)!important; color: #fcd34d!important; }
    .rag-sources { font-size: 10px; color: #475569; margin-top: 5px; }
    .rag-sources a { color: #475569; }
    .rag-typing { display: flex; gap: 4px; align-items: center; padding: 2px 0; }
    .rag-dot { width: 5px; height: 5px; border-radius: 50%; background: ${c}; animation: ragDot 1.2s infinite; }
    .rag-dot:nth-child(2) { animation-delay: 0.2s; }
    .rag-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes ragDot { 0%,60%,100% { transform:translateY(0); opacity:0.4; } 30% { transform:translateY(-4px); opacity:1; } }
    .rag-quick-replies { display: none; flex-wrap: wrap; gap: 6px; padding: 8px 12px 0; }
    .rag-quick-replies.visible { display: flex; }
    .rag-qr-btn { background: transparent; border: 1px solid ${c}55; color: ${c}; border-radius: 16px; padding: 5px 12px; font-size: 12px; cursor: pointer; font-family: system-ui,-apple-system,sans-serif; transition: background 0.15s, border-color 0.15s; white-space: nowrap; }
    .rag-qr-btn:hover { background: ${c}22; border-color: ${c}; }
    .rag-input-area { padding: 10px 12px; border-top: 1px solid rgba(51,65,85,0.4); display: flex; gap: 8px; }
    .rag-input { flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #e2e8f0; font-size: 13px; font-family: system-ui,-apple-system,sans-serif; outline: none; resize: none; max-height: 80px; line-height: 1.4; transition: border-color 0.2s; }
    .rag-input:focus { border-color: ${c}; }
    .rag-input::placeholder { color: #475569; }
    .rag-send { width: 36px; height: 36px; border-radius: 8px; background: ${c}; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; align-self: flex-end; transition: background 0.2s, transform 0.1s; }
    .rag-send:hover { background: ${c}cc; transform: scale(1.05); }
    .rag-send:disabled { background: #334155; cursor: not-allowed; transform: none; }
    .rag-footer { text-align: center; padding: 4px; font-size: 9px; color: #334155; font-family: system-ui; letter-spacing: 0.05em; }
    .rag-footer a { color: ${c}; text-decoration: none; opacity: 0.7; }
    .rag-unanswered-prompt { display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding:8px 12px; background:rgba(234,179,8,0.06); border-top:1px solid rgba(234,179,8,0.15); font-size:12px; color:#94a3b8; font-family:system-ui,-apple-system,sans-serif; }
    .rag-ua-yes { background:rgba(234,179,8,0.15); border:1px solid rgba(234,179,8,0.3); color:#fcd34d; border-radius:12px; padding:3px 10px; font-size:11px; cursor:pointer; }
    .rag-ua-no  { background:transparent; border:none; color:#64748b; font-size:14px; cursor:pointer; padding:2px 4px; }
    .rag-lead-form { margin:8px 12px; background:#1e293b; border:1px solid ${c}33; border-radius:10px; padding:12px; font-family:system-ui,-apple-system,sans-serif; }
    .rag-lead-title { font-size:13px; color:#cbd5e1; margin-bottom:10px; line-height:1.4; }
    .rag-lead-input { width:100%; box-sizing:border-box; background:#0f172a; border:1px solid #334155; border-radius:7px; padding:7px 10px; color:#e2e8f0; font-size:13px; margin-bottom:6px; outline:none; }
    .rag-lead-input:focus { border-color:${c}; }
    .rag-lead-submit { background:${c}; border:none; color:white; border-radius:7px; padding:7px 16px; font-size:13px; cursor:pointer; font-family:system-ui; }
    .rag-lead-skip   { background:transparent; border:1px solid #334155; color:#64748b; border-radius:7px; padding:7px 12px; font-size:13px; cursor:pointer; }
  `;
  }

  // ── Käynnistä ─────────────────────────────────────────────────────────
  // Hae config API:sta, sitten rakenna widget
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadConfig);
  } else {
    loadConfig();
  }

})();
