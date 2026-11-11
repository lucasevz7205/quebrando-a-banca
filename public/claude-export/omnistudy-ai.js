(function (global) {
  "use strict";

  const STORAGE_KEY = "qb_omnistudy_state_v2";

  /* ========================================================================
     1. PROCEDURAL WEB AUDIO SYNTHESIZER (TASK-05 · No External MP3s)
     ======================================================================== */
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.currentSource = null;
      this.gainNode = null;
      this.isPlaying = false;
      this.currentType = null;
    }

    initContext() {
      if (!this.ctx && typeof global !== "undefined") {
        const AudioCtx = global.AudioContext || global.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    }

    playChime() {
      try {
        this.initContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        freqs.forEach((freq, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + i * 0.12);
          gain.gain.setValueAtTime(0, now + i * 0.12);
          gain.gain.linearRampToValueAtTime(0.15, now + i * 0.12 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 1.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 1.3);
        });
      } catch (_e) {}
    }

    playAmbient(type, volume) {
      const vol = typeof volume === "number" ? volume : 0.25;
      try {
        this.stopAmbient();
        this.initContext();
        if (!this.ctx) return;

        const masterGain = this.ctx.createGain();
        masterGain.gain.setValueAtTime(vol, this.ctx.currentTime);
        masterGain.connect(this.ctx.destination);
        this.gainNode = masterGain;

        if (type === "rain" || type === "whitenoise") {
          const bufferSize = this.ctx.sampleRate * 2;
          const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          let lastOut = 0.0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            if (type === "rain") {
              lastOut = (lastOut + 0.02 * white) / 1.02;
              output[i] = lastOut * 3.5;
            } else {
              output[i] = white * 0.4;
            }
          }
          const whiteNoise = this.ctx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          whiteNoise.loop = true;

          if (type === "rain") {
            const filter = this.ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(800, this.ctx.currentTime);
            whiteNoise.connect(filter);
            filter.connect(masterGain);
          } else {
            whiteNoise.connect(masterGain);
          }
          whiteNoise.start();
          this.currentSource = whiteNoise;
        } else if (type === "binaural") {
          // 196Hz + 206Hz = 10Hz Alpha difference for sustained calm focus
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          osc1.type = "sine";
          osc2.type = "sine";
          osc1.frequency.setValueAtTime(196, this.ctx.currentTime);
          osc2.frequency.setValueAtTime(206, this.ctx.currentTime);
          const filter = this.ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(300, this.ctx.currentTime);
          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(masterGain);
          osc1.start();
          osc2.start();
          this.currentSource = {
            stop() {
              try { osc1.stop(); osc2.stop(); } catch (_e) {}
            },
            disconnect() {
              try { osc1.disconnect(); osc2.disconnect(); } catch (_e) {}
            },
          };
        }
        this.isPlaying = true;
        this.currentType = type;
      } catch (_e) {}
    }

    setVolume(volume) {
      if (this.gainNode && this.ctx) {
        const v = Math.max(0, Math.min(1, Number(volume) || 0));
        this.gainNode.gain.setValueAtTime(v, this.ctx.currentTime);
      }
    }

    stopAmbient() {
      try {
        if (this.currentSource) {
          if (typeof this.currentSource.stop === "function") this.currentSource.stop();
          if (typeof this.currentSource.disconnect === "function") this.currentSource.disconnect();
          this.currentSource = null;
        }
        this.isPlaying = false;
        this.currentType = null;
      } catch (_e) {}
    }
  }

  const soundEngine = new SoundEngine();

  /* ========================================================================
     2. STATE & PERSISTENCE
     ======================================================================== */
  const defaultState = {
    activeTab: "tutor",
    subject: "Processo Legislativo & Regimento Interno (CD - ARR)",
    tutorMode: "socratic",
    messages: [
      {
        id: "welcome-1",
        role: "model",
        text: "Olá! Sou o seu **Tutor Socrático OmniStudy IA** integrado ao Quebrando a Banca.\n\nMeu papel é guiar seu raciocínio, desarmar pegadinhas Cebraspe (F1–F10) e consolidar sua retenção ativa.\n\nQual tópico do edital ou questão vamos dissecar agora?",
        timestamp: "Agora",
      },
    ],
    feynman: {
      topic: "Diferença entre Delegação e Avocação de Competência (Lei 9.784/1999)",
      targetAudience: "uma banca avaliadora Cebraspe, mas explicando sem jargão vazio",
      explanation:
        "A delegação transfere apenas o exercício (e não a titularidade) para subordinado ou não, salvo atos exclusivos, decisão de recurso e matérias normativas. Já a avocação é excepcional, temporária e só cabe para órgão hierarquicamente inferior.",
      evaluation: {
        score: 92,
        verdict: "Excelente precisão técnica! Distinguiu titularidade de exercício e cravou as três vedações do art. 13.",
        strengths: [
          "Separou transferência do exercício vs. irrenunciabilidade da titularidade",
          "Listou a tríade clássica vedada à delegação (CEN: Competência exclusiva, Edição de atos normativos, Decisão de recursos)",
          "Destacou o caráter excepcional, temporário e vertical (subordinado) da avocação",
        ],
        gapsAndJargon: [
          "Vale explicitar que a delegação pode ser parcial e revogada a qualquer tempo pelo delegante",
          "Lembrar que ambos exigem publicação do ato no meio oficial",
        ],
        feynmanSimplified:
          "Imagine que o diretor de um hospital é dono do carimbo principal (titularidade). Na delegação, ele empresta uma cópia do carimbo para outro médico assinar plantões — até de outro setor — mas nunca para fazer leis do hospital ou julgar recursos. Na avocação, ele puxa de volta, por pouco tempo e por motivo grave, uma tarefa que era de um médico subordinado a ele.",
        memorableAnalogy: "Delegação = emprestar o carimbo (horizontal ou vertical); Avocação = puxar a pasta da mesa do subordinado (sempre vertical e temporária).",
        reflectiveQuestions: [
          "Item Cebraspe: É vedada a delegação de competência a órgão que não seja hierarquicamente subordinado ao delegante. Certo ou Errado?",
          "Se a autoridade delegante quiser praticar o ato que delegou, ela precisa revogar a delegação antes?",
          "Cabe avocação quando a competência é exclusiva do subordinado?",
        ],
      },
    },
    cornellNotes: [
      {
        id: "cornell-seed-1",
        title: "Espécies Normativas & Quóruns (Art. 59 a 69 CF/88)",
        subject: "Processo Legislativo (PL)",
        date: "Hoje",
        cues: [
          "Qual o quórum da Lei Complementar vs. Lei Ordinária?",
          "Qual a diferença entre Medida Provisória e Lei Delegada?",
          "Quem promulga Emenda Constitucional?",
          "Pegadinha F3 clássica em Decreto Legislativo",
        ],
        notes:
          "• Lei Complementar: exige maioria ABSOLUTA (art. 69 CF) e matéria taxativamente prevista na Constituição.\n• Lei Ordinária: exige maioria SIMPLES (relativa), presente a maioria absoluta dos membros.\n• Emenda Constitucional: 2 turnos em cada Casa, 3/5 dos votos; promulgada pelas Mesas da Câmara e do Senado (não há sanção/veto presidencial!).\n• Decreto Legislativo e Resolução: não vão à sanção presidencial.",
        summary:
          "O quórum e a fase de sanção/veto são os alvos nº 1 de inversão (F3/F4) pelo Cebraspe. EC, Decreto Legislativo e Resolução dispensam sanção presidencial.",
        actionItems: [
          "Cobrir a coluna da direita e responder às 4 pistas em voz alta",
          "Resolver 10 itens C/E de Processo Legislativo com confiança 1–3",
        ],
      },
    ],
    selectedCornellId: "cornell-seed-1",
    coverCornellNotes: false,
    decks: [
      {
        id: "deck-seed-1",
        title: "Pegadinhas Cebraspe · Alta Incidência ARR",
        cards: [
          {
            id: "fc-1",
            question: "A Emenda Constitucional está sujeita a sanção ou veto do Presidente da República?",
            answer: "NÃO. A EC é promulgada diretamente pelas Mesas da Câmara dos Deputados e do Senado Federal, com o respectivo número de ordem (art. 60, § 3º, CF).",
            category: "Processo Legislativo",
            mnemonicHint: "Mesas da CD + SF promulgam (E NÃO o Presidente!)",
            difficulty: "good",
            reviewsCount: 1,
          },
          {
            id: "fc-2",
            question: "Qual a diferença entre Delegação e Avocação quanto à hierarquia (Lei 9.784/1999)?",
            answer: "Delegação cabe COM ou SEM subordinação hierárquica. Avocação exige SEMPRE subordinação hierárquica (órgão inferior) e caráter excepcional/temporário.",
            category: "Direito Administrativo",
            mnemonicHint: "Delegação = Lados e Abaixo | Avocação = Só de Baixo",
            difficulty: "good",
            reviewsCount: 1,
          },
        ],
      },
    ],
    cardIndex: 0,
    cardFlipped: false,
    pomodoro: {
      mode: "focus",
      secondsLeft: 25 * 60,
      isActive: false,
      cyclesCompleted: 0,
      ambientSound: "off",
      volume: 0.25,
      sprintTasks: [
        { id: "st-1", text: "Bloco de 20 itens C/E com marcação de confiança (1, 2, 3)", done: false },
        { id: "st-2", text: "Explicar 1 conceito difícil no Laboratório Feynman", done: false },
        { id: "st-3", text: "Revisar cartões pendentes na aba Revisão", done: false },
      ],
    },
  };

  function loadState() {
    try {
      const raw = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(defaultState));
      const parsed = JSON.parse(raw);
      return Object.assign({}, defaultState, parsed, {
        feynman: Object.assign({}, defaultState.feynman, parsed.feynman || {}),
        pomodoro: Object.assign({}, defaultState.pomodoro, parsed.pomodoro || {}, { isActive: false }),
      });
    } catch (_e) {
      return JSON.parse(JSON.stringify(defaultState));
    }
  }

  const state = loadState();

  function saveState() {
    try {
      if (global.localStorage) {
        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch (_e) {}
  }

  function detectActiveSubject() {
    try {
      const S = global.S;
      if (S && S.edital && Array.isArray(S.edital.materias)) {
        for (const m of S.edital.materias) {
          for (const t of m.topicos || []) {
            if (t.status === "estudando") {
              return `${m.nome} — ${t.titulo || t.nome || ""}`.trim();
            }
          }
        }
      }
    } catch (_e) {}
    return state.subject;
  }

  /* ========================================================================
     3. AI BRIDGE CALLER (Uses Base44 QBBridge + Smart Local Fallback)
     ======================================================================== */
  async function callOmniStudyBackend(payload) {
    if (global.QBBridge && typeof global.QBBridge.ask === "function") {
      try {
        return await global.QBBridge.ask("omniStudyAI", payload);
      } catch (err) {
        // Cornell exige resposta da IA real: não simular conferência factual offline.
        if (payload.task === "review-cornell" || payload.task === "summarize-cornell")
          throw new Error("IA Cornell indisponível: " + (err?.message || "verifique a conexão."));
        console.warn("[OmniStudy] Fallback local ativado:", err && err.message);
      }
    }
    if (payload.task === "review-cornell" || payload.task === "summarize-cornell")
      throw new Error("IA Cornell exige conexão com o Base44; suas anotações manuais continuam salvas.");
    // Offline / Modo Academia deterministic cognitive fallback
    if (payload.task === "tutor-chat") {
      const last = (payload.messages || [])[payload.messages.length - 1]?.text || "";
      return {
        reply:
          `🧠 **[Modo Academia · Raciocínio Socrático Ativo sobre ${payload.subject || "o tópico"}]**\n\n` +
          `Analisando seu ponto: *"${last.slice(0, 140)}"*\n\n` +
          `Para blindar esse ponto contra as pegadinhas F3 (Troca de Conceito) e F4 (Extrapolação) do Cebraspe, divida a análise em 3 degraus:\n` +
          `1. **Qual é a regra geral expressa na fonte?**\n` +
          `2. **Existe exceção taxativa (salvo / exceto / vedado)?**\n` +
          `3. **Quem detém a competência exclusiva?**\n\n` +
          `👉 **Desafio de Evocação Ativa:** Sem consultar o material, como você formularia a exceção principal dessa regra em uma única frase?`,
      };
    }
    if (payload.task === "feynman-evaluate") {
      const words = String(payload.explanation || "").trim().split(/\s+/).filter(Boolean);
      const hasContrast = /mas|porém|salvo|exceto|enquanto|não|diferente/i.test(payload.explanation || "");
      const score = Math.min(96, Math.max(62, Math.round(58 + Math.min(words.length, 45) * 0.65 + (hasContrast ? 10 : 0))));
      return {
        score,
        verdict:
          score >= 80
            ? "Boa clareza estrutural e contraste entre regra e exceção!"
            : "Explicação inicial registrada; explicite melhor o contraste 'X (e não Y)'.",
        strengths: [
          "Formulou o conceito com as próprias palavras (evocação ativa real)",
          hasContrast ? "Incluiu marcador de contraste/exceção essencial para o Cebraspe" : "Sintetizou a ideia nuclear de forma direta",
        ],
        gapsAndJargon: [
          "Explicite o par de contraste 'X (e não Y)' para evitar erro por interferência",
          "Cite o dispositivo ou condição-limite que a banca usa para inverter o item",
        ],
        feynmanSimplified: `Em termos simples: ${payload.topic} funciona como uma trava de segurança em dois níveis — primeiro aplica-se a regra geral, mas diante da condição especial, a exceção prevalece.`,
        memorableAnalogy: "Regra geral = faixa livre na via principal; Exceção legal = pedágio obrigatório com placa expressa.",
        reflectiveQuestions: [
          `Qual termo o Cebraspe trocaria em "${payload.topic}" para fabricar um item ERRADO com cara de CERTO?`,
          "Qual é a diferença entre este instituto e o conceito vizinho mais parecido do edital?",
          "Em que hipótese prática essa regra NÃO se aplica?",
        ],
      };
    }
    if (payload.task === "summarize-cornell") {
      const lines = String(payload.rawNotes || "")
        .split(/\n+/)
        .map(l => l.trim())
        .filter(Boolean);
      return {
        topic: payload.topic || "Nota Estruturada Cornell",
        cues: [
          `Qual o conceito nuclear de ${payload.topic || "este tema"}?`,
          "Quais são as exceções ou vedações expressas?",
          "Qual o par de contraste 'X (e não Y)'?",
          "Como o Cebraspe cobra isso em itens C/E?",
        ],
        notes: lines.map(l => (l.startsWith("•") ? l : `• ${l}`)).join("\n"),
        summary: lines.slice(0, 2).join(" ") || "Síntese executiva estruturada pelo método Cornell.",
        actionItems: [
          "Cobrir a coluna de notas e responder às 4 pistas sem olhar",
          "Criar 1 cartão de contraste para o ponto mais sujeito a confusão",
        ],
      };
    }
    if (payload.task === "generate-flashcards" || payload.task === "scan-note") {
      const t = payload.topic || "Tópico do Edital";
      return {
        topic: t,
        cues: [`Regra geral de ${t}`, `Exceção principal de ${t}`, "Armadilha Cebraspe (F3/F4)"],
        notes: payload.text || payload.extractedText || `• Resumo estruturado de ${t}.`,
        summary: `Síntese ativa gerada para ${t}.`,
        flashcards: [
          {
            question: `Qual é a regra central e a principal exceção em ${t}?`,
            answer: payload.text
              ? String(payload.text).slice(0, 220)
              : `Verifique o dispositivo matriz de ${t} e destaque o contraste 'X (e não Y)'.`,
            category: t,
            mnemonicHint: "Foque no verbo de competência e nas palavras 'salvo/vedado'",
          },
        ],
      };
    }
    return {};
  }

  /* ========================================================================
     4. POMODORO TIMER ENGINE
     ======================================================================== */
  const MODE_SECONDS = { focus: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };
  let pomoInterval = null;

  function formatMMSS(sec) {
    const s = Math.max(0, Math.floor(sec || 0));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m < 10 ? "0" : ""}${m}:${r < 10 ? "0" : ""}${r}`;
  }

  function updateTopBarPill() {
    if (typeof document === "undefined") return;
    const pill = document.getElementById("omni-pomo-pill");
    if (!pill) return;
    const timeEl = pill.querySelector(".omni-pomo-time");
    const soundBadge = pill.querySelector(".omni-pomo-sound");
    if (timeEl) timeEl.textContent = formatMMSS(state.pomodoro.secondsLeft);
    pill.classList.toggle("is-running", Boolean(state.pomodoro.isActive));
    if (soundBadge) {
      const map = { off: "", rain: "🌧", whitenoise: "📻", binaural: "🎧10Hz" };
      soundBadge.textContent = map[state.pomodoro.ambientSound] || "";
    }
  }

  function togglePomodoro() {
    state.pomodoro.isActive = !state.pomodoro.isActive;
    if (state.pomodoro.isActive && !pomoInterval) {
      pomoInterval = setInterval(() => {
        if (!state.pomodoro.isActive) return;
        if (state.pomodoro.secondsLeft > 0) {
          state.pomodoro.secondsLeft -= 1;
          updateTopBarPill();
          const modalClock = typeof document !== "undefined" && document.getElementById("omni-modal-clock");
          if (modalClock) modalClock.textContent = formatMMSS(state.pomodoro.secondsLeft);
        } else {
          soundEngine.playChime();
          if (state.pomodoro.mode === "focus") {
            state.pomodoro.cyclesCompleted += 1;
            state.pomodoro.mode = state.pomodoro.cyclesCompleted % 4 === 0 ? "longBreak" : "shortBreak";
          } else {
            state.pomodoro.mode = "focus";
          }
          state.pomodoro.secondsLeft = MODE_SECONDS[state.pomodoro.mode];
          state.pomodoro.isActive = false;
          saveState();
          updateTopBarPill();
          renderStudioBody();
        }
      }, 1000);
    }
    updateTopBarPill();
    saveState();
    renderStudioBody();
  }

  /* ========================================================================
     5. UI INJECTION & DRAWER RENDERING
     ======================================================================== */
  function escHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function openStudio(tab) {
    if (tab) state.activeTab = tab;
    const detected = detectActiveSubject();
    if (detected) state.subject = detected;
    const backdrop = document.getElementById("omni-drawer-backdrop");
    if (backdrop) {
      backdrop.classList.add("open");
      renderStudioTabs();
      renderStudioBody();
    }
  }

  function closeStudio() {
    const backdrop = document.getElementById("omni-drawer-backdrop");
    if (backdrop) backdrop.classList.remove("open");
  }

  function renderStudioTabs() {
    const nav = document.getElementById("omni-tabs-bar");
    if (!nav) return;
    const tabs = [
      { id: "tutor", label: "🤖 Tutor Socrático" },
      { id: "feynman", label: "🧠 Lab Feynman" },
      { id: "cornell", label: "📓 Caderno Cornell IA" },
      { id: "flashcards", label: "🗂 Flashcards 3D & Scanner" },
      { id: "pomodoro", label: "⏱ Pomodoro & Áudio Alfa" },
    ];
    nav.innerHTML = tabs
      .map(
        t =>
          `<button type="button" class="omni-tab-btn ${state.activeTab === t.id ? "active" : ""}" data-omni-tab="${t.id}">${t.label}</button>`
      )
      .join("");
    nav.querySelectorAll("[data-omni-tab]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.activeTab = btn.getAttribute("data-omni-tab");
        saveState();
        renderStudioTabs();
        renderStudioBody();
      });
    });
  }

  function renderStudioBody() {
    const body = document.getElementById("omni-drawer-body");
    if (!body) return;

    if (state.activeTab === "tutor") {
      body.innerHTML = `
        <div class="omni-card" style="margin-bottom:14px">
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between">
            <div style="flex:1;min-width:220px">
              <label class="omni-label">Tópico / Disciplina em Foco</label>
              <input id="omni-tutor-subject" class="omni-input" value="${escHtml(state.subject)}" />
            </div>
            <div>
              <label class="omni-label">Modo Cognitivo</label>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                ${[
                  ["socratic", "Socrático"],
                  ["simple", "Feynman"],
                  ["exam", "Banca Cebraspe"],
                  ["challenge", "Arguição Oral"],
                ]
                  .map(
                    ([id, label]) =>
                      `<button type="button" class="omni-tab-btn ${state.tutorMode === id ? "active" : ""}" data-tutor-mode="${id}">${label}</button>`
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </div>

        <div class="omni-card">
          <div id="omni-chat-box" class="omni-chat-box">
            ${state.messages
              .map(
                m => `
              <div class="omni-msg ${m.role === "model" ? "model" : "user"}">${escHtml(m.text)}</div>
            `
              )
              .join("")}
          </div>

          <div style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0">
            <button type="button" class="omni-btn omni-btn-ghost" data-quick-prompt="Me faça 3 perguntas provocativas estilo Cebraspe sobre ${escHtml(state.subject)} para testar minha retenção ativa.">🎯 Testar Retenção</button>
            <button type="button" class="omni-btn omni-btn-ghost" data-quick-prompt="Quais são as principais pegadinhas (F1 a F10) que o Cebraspe aplica em ${escHtml(state.subject)}?">⚠️ Armadilhas da Banca</button>
            <button type="button" class="omni-btn omni-btn-ghost" data-quick-prompt="Crie uma analogia estilo Feynman inesquecível para o conceito mais difícil de ${escHtml(state.subject)}.">💡 Analogia Feynman</button>
            <button type="button" id="omni-voice-btn" class="omni-btn omni-btn-ghost" title="Responder por voz (Arguição Oral)">🎙 Arguição por Voz</button>
          </div>

          <form id="omni-tutor-form" style="display:flex;gap:8px">
            <input id="omni-tutor-input" class="omni-input" placeholder="Responda ao tutor ou tire sua dúvida..." />
            <button type="submit" class="omni-btn">Enviar</button>
          </form>
        </div>
      `;

      const subjInput = body.querySelector("#omni-tutor-subject");
      if (subjInput) {
        subjInput.addEventListener("change", () => {
          state.subject = subjInput.value.trim() || state.subject;
          saveState();
        });
      }
      body.querySelectorAll("[data-tutor-mode]").forEach(b => {
        b.addEventListener("click", () => {
          state.tutorMode = b.getAttribute("data-tutor-mode");
          saveState();
          renderStudioBody();
        });
      });

      const sendMsg = async text => {
        const clean = String(text || "").trim();
        if (!clean) return;
        state.messages.push({ id: "u-" + Date.now(), role: "user", text: clean, timestamp: "Agora" });
        saveState();
        renderStudioBody();
        const chatBox = document.getElementById("omni-chat-box");
        if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;

        const res = await callOmniStudyBackend({
          task: "tutor-chat",
          subject: state.subject,
          mode: state.tutorMode,
          messages: state.messages.slice(-10).map(m => ({ role: m.role, text: m.text })),
        });
        state.messages.push({
          id: "m-" + Date.now(),
          role: "model",
          text: res.reply || "Como você explicaria esse ponto com suas próprias palavras?",
          timestamp: "Agora",
        });
        saveState();
        renderStudioBody();
        const box2 = document.getElementById("omni-chat-box");
        if (box2) box2.scrollTop = box2.scrollHeight;
      };

      body.querySelectorAll("[data-quick-prompt]").forEach(b => {
        b.addEventListener("click", () => sendMsg(b.getAttribute("data-quick-prompt")));
      });

      const voiceBtn = body.querySelector("#omni-voice-btn");
      if (voiceBtn) {
        voiceBtn.addEventListener("click", () => {
          const SR = global.SpeechRecognition || global.webkitSpeechRecognition;
          if (!SR) {
            const inp = body.querySelector("#omni-tutor-input");
            if (inp) inp.focus();
            return;
          }
          const rec = new SR();
          rec.lang = "pt-BR";
          voiceBtn.textContent = "🔴 Ouvindo...";
          rec.onresult = ev => {
            const transcript = ev.results?.[0]?.[0]?.transcript || "";
            const inp = body.querySelector("#omni-tutor-input");
            if (inp) inp.value = transcript;
            voiceBtn.textContent = "🎙 Arguição por Voz";
          };
          rec.onerror = () => { voiceBtn.textContent = "🎙 Arguição por Voz"; };
          rec.onend = () => { voiceBtn.textContent = "🎙 Arguição por Voz"; };
          rec.start();
        });
      }

      const form = body.querySelector("#omni-tutor-form");
      if (form) {
        form.addEventListener("submit", ev => {
          ev.preventDefault();
          const inp = body.querySelector("#omni-tutor-input");
          if (inp && inp.value.trim()) {
            const val = inp.value;
            inp.value = "";
            sendMsg(val);
          }
        });
      }
      return;
    }

    if (state.activeTab === "feynman") {
      const ev = state.feynman.evaluation;
      body.innerHTML = `
        <div class="omni-grid-2">
          <form id="omni-feynman-form" class="omni-card" style="display:flex;flex-direction:column;gap:12px">
            <div>
              <label class="omni-label">Conceito ou Dispositivo para Explicar</label>
              <input id="omni-feynman-topic" class="omni-input" value="${escHtml(state.feynman.topic)}" required />
            </div>
            <div>
              <label class="omni-label">Público-Alvo do Teste Feynman</label>
              <select id="omni-feynman-aud" class="omni-select">
                <option value="uma criança curiosa de 10 anos">Uma criança de 10 anos (Simplicidade Máxima)</option>
                <option value="uma banca avaliadora Cebraspe, mas explicando sem jargão vazio" selected>Banca Cebraspe (Precisão sem prolixidade)</option>
                <option value="um colega de estudo iniciante">Um colega iniciante (Clareza didática)</option>
              </select>
            </div>
            <div>
              <label class="omni-label">Sua Explicação com Próprias Palavras (Sem consultar!)</label>
              <textarea id="omni-feynman-exp" class="omni-textarea" rows="6" required>${escHtml(state.feynman.explanation)}</textarea>
            </div>
            <button type="submit" id="omni-feynman-submit" class="omni-btn">✨ Avaliar Compreensão com IA</button>
          </form>

          <div class="omni-card">
            ${
              ev
                ? `
              <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px;margin-bottom:12px">
                <div>
                  <span class="omni-label" style="margin:0">Diagnóstico Feynman</span>
                  <div style="font-size:16px;font-weight:800;color:#fff;margin-top:2px">${escHtml(state.feynman.topic)}</div>
                </div>
                <div style="text-align:right">
                  <span style="font-size:24px;font-weight:900;color:#a78bfa">${Number(ev.score) || 0}/100</span>
                </div>
              </div>
              <div style="padding:10px 12px;border-radius:10px;background:rgba(139,92,246,0.14);border:1px solid rgba(139,92,246,0.3);font-size:12px;margin-bottom:12px">
                💡 ${escHtml(ev.verdict)}
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
                <div style="padding:10px;border-radius:10px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);font-size:12px">
                  <strong style="color:#34d399;display:block;margin-bottom:4px">✓ Pontos Fortes</strong>
                  ${(ev.strengths || []).map(s => `<div>• ${escHtml(s)}</div>`).join("")}
                </div>
                <div style="padding:10px;border-radius:10px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);font-size:12px">
                  <strong style="color:#fbbf24;display:block;margin-bottom:4px">⚠ Lacunas & Jargões</strong>
                  ${(ev.gapsAndJargon || []).map(s => `<div>• ${escHtml(s)}</div>`).join("")}
                </div>
              </div>
              <div style="padding:10px;border-radius:10px;background:rgba(7,10,19,0.8);border:1px solid rgba(255,255,255,0.07);font-size:12px;margin-bottom:10px">
                <strong style="color:#818cf8;display:block;margin-bottom:4px">✨ Versão Ultra Didática (Feynman):</strong>
                <div style="font-style:italic;color:#cbd5e1">"${escHtml(ev.feynmanSimplified)}"</div>
                <strong style="color:#38bdf8;display:block;margin:8px 0 4px">🎯 Analogia Memorável:</strong>
                <div>${escHtml(ev.memorableAnalogy)}</div>
              </div>
              <div style="font-size:12px">
                <strong style="color:#e2e8f0;display:block;margin-bottom:6px">3 Perguntas Socráticas de Fixação:</strong>
                ${(ev.reflectiveQuestions || []).map((q, i) => `<div style="margin-bottom:4px"><strong>${i + 1}.</strong> ${escHtml(q)}</div>`).join("")}
              </div>
            `
                : `<div style="padding:30px;text-align:center;color:#94a3b8">Escreva sua explicação ao lado para receber o diagnóstico Feynman.</div>`
            }
          </div>
        </div>
      `;

      const form = body.querySelector("#omni-feynman-form");
      if (form) {
        form.addEventListener("submit", async e => {
          e.preventDefault();
          const btn = body.querySelector("#omni-feynman-submit");
          state.feynman.topic = body.querySelector("#omni-feynman-topic").value.trim();
          state.feynman.targetAudience = body.querySelector("#omni-feynman-aud").value;
          state.feynman.explanation = body.querySelector("#omni-feynman-exp").value.trim();
          if (btn) {
            btn.disabled = true;
            btn.textContent = "Avaliando compreensão...";
          }
          const result = await callOmniStudyBackend({
            task: "feynman-evaluate",
            topic: state.feynman.topic,
            explanation: state.feynman.explanation,
            targetAudience: state.feynman.targetAudience,
          });
          state.feynman.evaluation = result;
          saveState();
          renderStudioBody();
        });
      }
      return;
    }

    if (state.activeTab === "cornell") {
      const current =
        state.cornellNotes.find(n => n.id === state.selectedCornellId) || state.cornellNotes[0];
      body.innerHTML = `
        <div class="omni-grid-2">
          <div class="omni-card" style="display:flex;flex-direction:column;gap:12px">
            <span class="omni-label">Estruturar Rascunho / Aula com Método Cornell IA</span>
            <input id="omni-cornell-topic" class="omni-input" placeholder="Tópico (ex: Poder de Polícia, Coesão Referencial...)" value="${escHtml(state.subject)}" />
            <textarea id="omni-cornell-raw" class="omni-textarea" rows="5" placeholder="Cole aqui suas anotações brutas, trechos de lei ou resumo da aula..."></textarea>
            <button type="button" id="omni-cornell-gen" class="omni-btn">📓 Transformar em Folha Cornell</button>

            <hr style="border:0;border-top:1px solid rgba(255,255,255,0.08);margin:4px 0" />
            <span class="omni-label">Folhas Cornell Salvas (${state.cornellNotes.length})</span>
            <div style="display:flex;flex-direction:column;gap:6px;max-height:190px;overflow-y:auto">
              ${state.cornellNotes
                .map(
                  n => `
                <button type="button" class="omni-tab-btn ${current && current.id === n.id ? "active" : ""}" data-cornell-select="${n.id}" style="justify-content:space-between">
                  <span style="overflow:hidden;text-overflow:ellipsis">${escHtml(n.title)}</span>
                  <span style="font-size:10px;opacity:0.75">${escHtml(n.date)}</span>
                </button>
              `
                )
                .join("")}
            </div>
          </div>

          <div>
            ${
              current
                ? `
              <div class="omni-cornell-sheet">
                <div style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;gap:8px">
                  <div>
                    <div style="font-size:10px;color:#a78bfa;font-weight:700;text-transform:uppercase">${escHtml(current.subject)} • ${escHtml(current.date)}</div>
                    <div style="font-size:15px;font-weight:800;color:#fff">${escHtml(current.title)}</div>
                  </div>
                  <button type="button" id="omni-cornell-cover" class="omni-btn omni-btn-ghost" style="padding:5px 10px;font-size:11px">
                    ${state.coverCornellNotes ? "👁 Revelar Notas (70%)" : "🙈 Cobrir Notas para Evocação"}
                  </button>
                </div>
                <div class="omni-cornell-grid">
                  <div class="omni-cornell-cues">
                    <span class="omni-label" style="color:#38bdf8">Pistas & Perguntas (30%)</span>
                    <div style="display:flex;flex-direction:column;gap:6px">
                      ${(current.cues || []).map(c => `<div style="padding:7px;border-radius:8px;background:rgba(15,23,42,0.85);font-size:12px;color:#bae6fd">• ${escHtml(c)}</div>`).join("")}
                    </div>
                  </div>
                  <div class="omni-cornell-notes ${state.coverCornellNotes ? "is-covered" : ""}">
                    <span class="omni-label" style="color:#c4b5fd">Notas Hierárquicas (70%)</span>
                    <div>${escHtml(current.notes)}</div>
                  </div>
                </div>
                <div class="omni-cornell-summary">
                  <span class="omni-label" style="color:#34d399;margin-bottom:3px">Síntese Executiva (Rodapé Cornell)</span>
                  <div style="font-size:12px;font-style:italic;color:#e2e8f0">"${escHtml(current.summary)}"</div>
                </div>
              </div>
            `
                : ""
            }
          </div>
        </div>
      `;

      body.querySelectorAll("[data-cornell-select]").forEach(b => {
        b.addEventListener("click", () => {
          state.selectedCornellId = b.getAttribute("data-cornell-select");
          saveState();
          renderStudioBody();
        });
      });

      const coverBtn = body.querySelector("#omni-cornell-cover");
      if (coverBtn) {
        coverBtn.addEventListener("click", () => {
          state.coverCornellNotes = !state.coverCornellNotes;
          renderStudioBody();
        });
      }

      const genBtn = body.querySelector("#omni-cornell-gen");
      if (genBtn) {
        genBtn.addEventListener("click", async () => {
          const topic = body.querySelector("#omni-cornell-topic").value.trim() || state.subject;
          const rawNotes = body.querySelector("#omni-cornell-raw").value.trim();
          if (!rawNotes) return;
          genBtn.disabled = true;
          genBtn.textContent = "Estruturando folha Cornell...";
          const res = await callOmniStudyBackend({ task: "summarize-cornell", topic, rawNotes });
          const note = {
            id: "cornell-" + Date.now(),
            title: res.topic || topic,
            subject: topic,
            date: "Hoje",
            cues: res.cues || ["Ideia central"],
            notes: res.notes || rawNotes,
            summary: res.summary || "",
            actionItems: res.actionItems || [],
          };
          state.cornellNotes.unshift(note);
          state.selectedCornellId = note.id;
          saveState();
          try {
            if (global.A && typeof global.A.set === "function") {
              global.A.set("caderno_cornell", note.id, note);
            }
          } catch (_e) {}
          renderStudioBody();
        });
      }
      return;
    }

    if (state.activeTab === "flashcards") {
      const deck = state.decks[0] || { title: "Baralho SRS", cards: [] };
      const card = deck.cards[state.cardIndex] || deck.cards[0];
      body.innerHTML = `
        <div class="omni-grid-2">
          <div class="omni-card" style="display:flex;flex-direction:column;gap:10px">
            <span class="omni-label">Gerador de Flashcards SRS & Scanner Multimodal (TASK-03 / TASK-06)</span>
            <input id="omni-fc-topic" class="omni-input" value="${escHtml(state.subject)}" placeholder="Tema do baralho..." />
            <textarea id="omni-fc-text" class="omni-textarea" rows="4" placeholder="Opcional: cole artigo de lei, resumo ou envie foto da apostila abaixo..."></textarea>
            <div>
              <label class="omni-label">📷 Digitalizar Foto de Caderno / Apostila (Opcional)</label>
              <input type="file" id="omni-scan-file" accept="image/*" class="omni-input" style="padding:6px" />
            </div>
            <button type="button" id="omni-fc-generate" class="omni-btn">⚡ Gerar Cartões SRS & Nota Cornell</button>
          </div>

          <div class="omni-card">
            ${
              card
                ? `
              <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-bottom:8px">
                <span>Cartão <strong>${state.cardIndex + 1}</strong> de ${deck.cards.length}</span>
                <span>${escHtml(card.category || deck.title)}</span>
              </div>
              <div id="omni-fc-stage" class="omni-flashcard-stage">
                <div class="omni-flashcard-inner ${state.cardFlipped ? "is-flipped" : ""}">
                  <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:${state.cardFlipped ? "#34d399" : "#818cf8"}">
                    ${state.cardFlipped ? "✓ Resposta & Fundamentação" : "❓ Pergunta de Evocação Ativa (Clique para virar)"}
                  </div>
                  <div style="font-size:15px;font-weight:700;text-align:center;margin:18px 0;line-height:1.5">
                    ${escHtml(state.cardFlipped ? card.answer : card.question)}
                  </div>
                  ${
                    card.mnemonicHint
                      ? `<div style="font-size:11px;padding:7px 10px;border-radius:8px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);color:#fde68a">💡 <strong>Gatilho Mnemônico:</strong> ${escHtml(card.mnemonicHint)}</div>`
                      : `<div></div>`
                  }
                </div>
              </div>
              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px">
                <button type="button" class="omni-btn omni-btn-ghost" data-srs-rate="again">Errei (1d)</button>
                <button type="button" class="omni-btn omni-btn-ghost" data-srs-rate="hard">Difícil (3d)</button>
                <button type="button" class="omni-btn omni-btn-ghost" data-srs-rate="good">Bom (7d)</button>
                <button type="button" class="omni-btn omni-btn-ghost" data-srs-rate="easy">Fácil (14d)</button>
              </div>
            `
                : `<div>Nenhum cartão disponível.</div>`
            }
          </div>
        </div>
      `;

      const stage = body.querySelector("#omni-fc-stage");
      if (stage) {
        stage.addEventListener("click", () => {
          state.cardFlipped = !state.cardFlipped;
          renderStudioBody();
        });
      }
      body.querySelectorAll("[data-srs-rate]").forEach(b => {
        b.addEventListener("click", () => {
          state.cardFlipped = false;
          state.cardIndex = (state.cardIndex + 1) % Math.max(1, deck.cards.length);
          saveState();
          renderStudioBody();
        });
      });

      const genBtn = body.querySelector("#omni-fc-generate");
      if (genBtn) {
        genBtn.addEventListener("click", async () => {
          const topic = body.querySelector("#omni-fc-topic").value.trim() || state.subject;
          const text = body.querySelector("#omni-fc-text").value.trim();
          const fileInput = body.querySelector("#omni-scan-file");
          const file = fileInput && fileInput.files && fileInput.files[0];

          genBtn.disabled = true;
          genBtn.textContent = "Processando com IA...";

          let imageDataUrl = undefined;
          if (file) {
            imageDataUrl = await new Promise(resolve => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result || ""));
              reader.onerror = () => resolve(undefined);
              reader.readAsDataURL(file);
            });
          }

          const res = await callOmniStudyBackend(
            imageDataUrl
              ? { task: "scan-note", topic, extractedText: text, imageDataUrl }
              : { task: "generate-flashcards", topic, text, count: 5 }
          );

          const cards = (res.flashcards || []).map((c, idx) => ({
            id: "fc-ai-" + Date.now() + "-" + idx,
            question: c.question,
            answer: c.answer,
            category: c.category || topic,
            mnemonicHint: c.mnemonicHint || "",
            difficulty: "good",
            reviewsCount: 0,
          }));

          if (cards.length) {
            state.decks[0].cards = cards.concat(state.decks[0].cards);
            state.cardIndex = 0;
            state.cardFlipped = false;
          }
          if (res.notes && Array.isArray(res.cues)) {
            state.cornellNotes.unshift({
              id: "cornell-scan-" + Date.now(),
              title: res.topic || topic,
              subject: topic,
              date: "Digitalizado Hoje",
              cues: res.cues,
              notes: res.notes,
              summary: res.summary || "",
              actionItems: [],
            });
          }
          saveState();
          renderStudioBody();
        });
      }
      return;
    }

    if (state.activeTab === "pomodoro") {
      const p = state.pomodoro;
      body.innerHTML = `
        <div class="omni-grid-2">
          <div class="omni-card" style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:14px">
            <span class="omni-label">Ritmo Ultraniano & Síntese Web Audio Procedural</span>
            <div style="display:flex;gap:6px">
              ${[
                ["focus", "Foco (25m)"],
                ["shortBreak", "Pausa Curta (5m)"],
                ["longBreak", "Pausa Longa (15m)"],
              ]
                .map(
                  ([m, lbl]) =>
                    `<button type="button" class="omni-tab-btn ${p.mode === m ? "active" : ""}" data-pomo-mode="${m}">${lbl}</button>`
                )
                .join("")}
            </div>

            <div id="omni-modal-clock" style="font-size:54px;font-weight:900;font-family:var(--mono,monospace);letter-spacing:0.04em;color:#fff;margin:8px 0">
              ${formatMMSS(p.secondsLeft)}
            </div>

            <div style="display:flex;gap:10px">
              <button type="button" id="omni-pomo-toggle" class="omni-btn">
                ${p.isActive ? "⏸ Pausar Ciclo" : "▶ Iniciar Foco"}
              </button>
              <button type="button" id="omni-pomo-reset" class="omni-btn omni-btn-ghost">↺ Reiniciar</button>
            </div>

            <div style="width:100%;border-top:1px solid rgba(255,255,255,0.08);padding-top:12px;margin-top:4px">
              <span class="omni-label">Gerador Acústico Procedural (Zero MP3 Externo)</span>
              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
                ${[
                  ["off", "🔇 Silêncio"],
                  ["rain", "🌧 Chuva 800Hz"],
                  ["whitenoise", "📻 Ruído Branco"],
                  ["binaural", "🎧 Alfa 10Hz"],
                ]
                  .map(
                    ([id, lbl]) =>
                      `<button type="button" class="omni-tab-btn ${p.ambientSound === id ? "active" : ""}" data-omni-sound="${id}" style="justify-content:center">${lbl}</button>`
                  )
                  .join("")}
              </div>
              <div style="display:flex;align-items:center;gap:10px;margin-top:10px">
                <span style="font-size:11px;color:#94a3b8">Volume</span>
                <input type="range" id="omni-sound-vol" min="0.05" max="0.8" step="0.05" value="${p.volume}" style="flex:1" />
                <span style="font-size:11px;color:#cbd5e1">${Math.round(p.volume * 100)}%</span>
              </div>
            </div>
          </div>

          <div class="omni-card" style="display:flex;flex-direction:column;justify-content:space-between">
            <div>
              <span class="omni-label">Metas do Sprint Atual (${p.cyclesCompleted} pomodoros concluídos)</span>
              <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">
                ${(p.sprintTasks || [])
                  .map(
                    t => `
                  <label style="display:flex;align-items:center;gap:8px;padding:9px 11px;border-radius:10px;background:rgba(7,10,19,0.75);border:1px solid rgba(255,255,255,0.07);cursor:pointer;font-size:12px;${t.done ? "text-decoration:line-through;opacity:0.55" : ""}">
                    <input type="checkbox" data-sprint-toggle="${t.id}" ${t.done ? "checked" : ""} />
                    <span>${escHtml(t.text)}</span>
                  </label>
                `
                  )
                  .join("")}
              </div>
            </div>
            <form id="omni-sprint-form" style="display:flex;gap:8px;margin-top:12px">
              <input id="omni-sprint-input" class="omni-input" placeholder="Nova meta para os próximos 25 min..." />
              <button type="submit" class="omni-btn">+ Meta</button>
            </form>
          </div>
        </div>
      `;

      body.querySelectorAll("[data-pomo-mode]").forEach(b => {
        b.addEventListener("click", () => {
          const m = b.getAttribute("data-pomo-mode");
          p.mode = m;
          p.isActive = false;
          p.secondsLeft = MODE_SECONDS[m] || 1500;
          saveState();
          updateTopBarPill();
          renderStudioBody();
        });
      });

      const toggleBtn = body.querySelector("#omni-pomo-toggle");
      if (toggleBtn) toggleBtn.addEventListener("click", togglePomodoro);

      const resetBtn = body.querySelector("#omni-pomo-reset");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          p.isActive = false;
          p.secondsLeft = MODE_SECONDS[p.mode] || 1500;
          saveState();
          updateTopBarPill();
          renderStudioBody();
        });
      }

      body.querySelectorAll("[data-omni-sound]").forEach(b => {
        b.addEventListener("click", () => {
          const type = b.getAttribute("data-omni-sound");
          p.ambientSound = type;
          if (type === "off") soundEngine.stopAmbient();
          else soundEngine.playAmbient(type, p.volume);
          saveState();
          updateTopBarPill();
          renderStudioBody();
        });
      });

      const volSlider = body.querySelector("#omni-sound-vol");
      if (volSlider) {
        volSlider.addEventListener("input", () => {
          p.volume = parseFloat(volSlider.value) || 0.25;
          soundEngine.setVolume(p.volume);
          saveState();
        });
      }

      body.querySelectorAll("[data-sprint-toggle]").forEach(cb => {
        cb.addEventListener("change", () => {
          const id = cb.getAttribute("data-sprint-toggle");
          const item = (p.sprintTasks || []).find(x => x.id === id);
          if (item) item.done = !item.done;
          saveState();
          renderStudioBody();
        });
      });

      const sprintForm = body.querySelector("#omni-sprint-form");
      if (sprintForm) {
        sprintForm.addEventListener("submit", e => {
          e.preventDefault();
          const inp = body.querySelector("#omni-sprint-input");
          if (inp && inp.value.trim()) {
            p.sprintTasks.push({ id: "st-" + Date.now(), text: inp.value.trim(), done: false });
            inp.value = "";
            saveState();
            renderStudioBody();
          }
        });
      }
    }
  }

  function mountOmniStudyUI() {
    if (typeof document === "undefined" || !document.body) return;
    if (document.getElementById("omni-drawer-backdrop")) return;

    // Cabeçalho AXON atual usa .qb-header-utilities; .top-actions fica como fallback legado.
    const topActions = document.querySelector(".qb-header-utilities, .top-actions");
    if (topActions) {
      const pomoPill = document.createElement("button");
      pomoPill.type = "button";
      pomoPill.id = "omni-pomo-pill";
      pomoPill.className = "omni-pomo-pill";
      pomoPill.title = "Pomodoro Ultraniano & Áudio Procedural (Clique para abrir, Duplo-clique para Play/Pause)";
      pomoPill.innerHTML = `<span class="omni-pomo-dot"></span><span>⏱</span><span class="omni-pomo-time">${formatMMSS(
        state.pomodoro.secondsLeft
      )}</span><span class="omni-pomo-sound"></span>`;
      pomoPill.addEventListener("click", () => openStudio("pomodoro"));
      pomoPill.addEventListener("dblclick", e => {
        e.stopPropagation();
        togglePomodoro();
      });

      const studioBtn = document.createElement("button");
      studioBtn.type = "button";
      studioBtn.id = "omni-studio-trigger";
      studioBtn.className = "omni-studio-trigger";
      studioBtn.title = "Abrir Estúdio Cognitivo OmniStudy IA (Alt+O)";
      studioBtn.innerHTML = `<span>⚡ OmniStudy IA</span>`;
      studioBtn.addEventListener("click", () => openStudio());

      topActions.insertBefore(studioBtn, topActions.firstChild);
      topActions.insertBefore(pomoPill, studioBtn);
    }

    const backdrop = document.createElement("div");
    backdrop.id = "omni-drawer-backdrop";
    backdrop.className = "omni-drawer-backdrop";
    backdrop.innerHTML = `
      <aside class="omni-drawer" role="dialog" aria-label="Estúdio Cognitivo OmniStudy IA">
        <header class="omni-drawer-header">
          <div class="omni-drawer-title">
            <span class="omni-badge">OmniStudy AI 2.0</span>
            <div>
              <div style="font-size:15px;font-weight:800;color:#fff">Estúdio de Aprendizagem Ativa · Quebrando a Banca</div>
              <div style="font-size:11px;color:#94a3b8">Tutor Socrático • Técnica Feynman • Caderno Cornell • SRS 3D • Web Audio Procedural</div>
            </div>
          </div>
          <button type="button" id="omni-drawer-close" class="omni-btn omni-btn-ghost" style="padding:6px 12px">✕ Fechar (Esc)</button>
        </header>
        <nav id="omni-tabs-bar" class="omni-tabs"></nav>
        <div id="omni-drawer-body" class="omni-body"></div>
      </aside>
    `;

    backdrop.addEventListener("click", e => {
      if (e.target === backdrop) closeStudio();
    });
    document.body.appendChild(backdrop);

    const closeBtn = document.getElementById("omni-drawer-close");
    if (closeBtn) closeBtn.addEventListener("click", closeStudio);

    global.addEventListener("keydown", e => {
      if (e.altKey && (e.key === "o" || e.key === "O")) {
        e.preventDefault();
        const isOpen = backdrop.classList.contains("open");
        if (isOpen) closeStudio();
        else openStudio();
      } else if (e.key === "Escape" && backdrop.classList.contains("open")) {
        closeStudio();
      }
    });
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mountOmniStudyUI);
    } else {
      mountOmniStudyUI();
    }
  }

  global.QBOmniStudy = {
    version: "2.0.0",
    soundEngine,
    state,
    openStudio,
    closeStudio,
    togglePomodoro,
    callOmniStudyBackend,
  };
})(typeof window !== "undefined" ? window : globalThis);
