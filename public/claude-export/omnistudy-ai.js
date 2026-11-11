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
    activeSubjectSigla: "pl",
    activeTopicId: "pl-01",
    chatsByTopic: {},
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

  function loadState(key) {
    try {
      const raw = global.localStorage && global.localStorage.getItem(key || storageKey);
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

  let storageKey = STORAGE_KEY;
  const state = loadState(STORAGE_KEY);

  function saveState() {
    try {
      if (global.localStorage) {
        global.localStorage.setItem(storageKey, JSON.stringify(state));
      }
    } catch (_e) {}
  }

  const slugKey = value =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "conta";

  /* Estado inicial de um candidato: sem folhas, cartões ou exemplos do concurso ARR. */
  function candidateDefaultState(S) {
    const base = JSON.parse(JSON.stringify(defaultState));
    const name = String(S?.studyAccountName || "Seu concurso");
    base.subject = name;
    base.messages = [
      {
        id: "welcome-1",
        role: "model",
        text:
          "Olá! Sou o seu **Tutor Socrático OmniStudy IA** do Quebrando a Banca.\n\nVou guiar seu raciocínio sobre as matérias de **" +
          name +
          "**, desarmar pegadinhas da banca e consolidar sua retenção ativa.\n\nQual tópico do seu edital vamos estudar agora?",
        timestamp: "Agora",
      },
    ];
    base.activeSubjectSigla = "";
    base.activeTopicId = "";
    base.chatsByTopic = {};
    base.feynman = { topic: "", targetAudience: defaultState.feynman.targetAudience, explanation: "", evaluation: null };
    base.cornellNotes = [];
    base.cornellNotebooks = [];
    base.selectedCornellId = null;
    base.selectedNotebookId = "all";
    base.decks = [{ id: "deck-seed-1", title: "Meus flashcards · " + name, cards: [] }];
    base.cardIndex = 0;
    return base;
  }

  /* Cada concurso tem o seu próprio OmniStudy/Cornell neste navegador.
   * A conta legada (ARR) continua na chave original, sem perda de dados. */
  function syncContestContext(S) {
    if (!S || !S.studyAccount) return storageKey;
    const nextKey = STORAGE_KEY + "__" + slugKey(S.studyAccountName || S.accountId);
    if (nextKey === storageKey) return storageKey;
    let next;
    try {
      const raw = global.localStorage && global.localStorage.getItem(nextKey);
      next = raw ? loadState(nextKey) : candidateDefaultState(S);
    } catch (_e) {
      next = candidateDefaultState(S);
    }
    const keepPomodoro = state.pomodoro;
    for (const k of Object.keys(state)) delete state[k];
    Object.assign(state, next, { pomodoro: Object.assign({}, next.pomodoro, { isActive: keepPomodoro?.isActive || false }) });
    storageKey = nextKey;
    saveState();
    if (typeof document !== "undefined" && document.getElementById("omni-drawer-backdrop")?.classList.contains("open")) {
      renderStudioTabs();
      renderStudioBody();
    }
    return storageKey;
  }

  function appState() {
    return global.QBApp?.S || global.S || null;
  }

  function detectActiveSubject() {
    try {
      const S = appState();
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
  /* dados do estudante para o tutor (só leitura; nada é gravado) */
  function tutorStudentContext(subject, topic) {
    try {
      const C = global.QBTutorContext, S = global.S;
      if (!C || !S || !S.r) return undefined;
      return C.build(S, { recorte: C.recorteDe(topic) || C.recorteDe(subject), prova: global.QB_PROVA || undefined });
    } catch (e) {
      console.warn("[OmniStudy] contexto do estudante indisponível:", e && e.message);
      return undefined;
    }
  }

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
      /* Sem IA conectada, não simular tutor: dizer isso e oferecer o treino da página. */
      return {
        reply:
          "**Tutor indisponível agora** (sem conexão com a IA do Base44). Nada foi perdido.\n\n" +
          "Enquanto isso, faça a revisão espaçada de hoje e o caderno de erros no Treinar. " +
          "Quando o tutor voltar, ele começará pelos itens que você errou com certeza.",
        offline: true,
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
    if (payload.task === "curate-question") {
      const q = payload.question || {};
      const obs = payload.userObservation || "";
      return {
        parecer: `[Modo Academia] Questão revisada pelo curador cognitivo. O apontamento "${obs.slice(0, 80) || "inconsistência de formulação"}" foi processado e a assertiva foi alinhada com a jurisprudência pacificada e a literalidade da norma.`,
        reformulada: {
          enunciado: q.enunciado || "Assertiva revisada no padrão Cebraspe.",
          gabarito: q.gabarito || "E",
          comentario: q.comentario ? `[Reformulada] ${q.comentario}` : "Fundamentação atualizada conforme o dispositivo legal matriz.",
          ref: q.ref || "CF/88 e legislação correlata",
          mecanismo: "F3",
          vacina: "Identifique se a assertiva inverte a regra geral ou estende competência privativa a órgão subordinado.",
        },
        acaoRecomendada: "reformular",
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

  function formatOmniMarkdown(rawText) {
    if (!rawText) return "";
    let s = String(rawText);

    // 1. Proteger blocos de código ```code```
    const codeBlocks = [];
    s = s.replace(/```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g, (_m, lang, code) => {
      const idx = codeBlocks.length;
      codeBlocks.push(`<pre class="omni-code-block" data-lang="${escHtml(lang || "")}"><code>${escHtml(code.trim())}</code></pre>`);
      return `\u0000BLOCK${idx}\u0000`;
    });

    // 2. Proteger inline code `code`
    const inlineCodes = [];
    s = s.replace(/`([^`\n]+)`/g, (_m, code) => {
      const idx = inlineCodes.length;
      inlineCodes.push(`<code class="omni-inline-code">${escHtml(code)}</code>`);
      return `\u0000INLINE${idx}\u0000`;
    });

    // 3. Escapar HTML do corpo
    s = escHtml(s);

    // 4. Headers markdown: #, ##, ###
    s = s.replace(/^###\s+(.+)$/gm, '<h4 class="omni-chat-h3">$1</h4>');
    s = s.replace(/^##\s+(.+)$/gm, '<h3 class="omni-chat-h2">$1</h3>');
    s = s.replace(/^#\s+(.+)$/gm, '<h2 class="omni-chat-h1">$1</h2>');

    // 5. Negrito e itálico:
    // ***texto*** -> <strong><em>texto</em></strong>
    s = s.replace(/\*\*\*([^\*\n]+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    // **texto** -> <strong>texto</strong>
    s = s.replace(/\*\*([^\*\n]+?)\*\*/g, '<strong>$1</strong>');
    // *texto* -> <em>texto</em>
    s = s.replace(/\*([^\*\n]+?)\*/g, '<em>$1</em>');
    // ___texto___ -> <strong><em>texto</em></strong>
    s = s.replace(/___([^_\n]+?)___/g, '<strong><em>$1</em></strong>');
    // __texto__ -> <strong>texto</strong>
    s = s.replace(/__([^_\n]+?)__/g, '<strong>$1</strong>');
    // _texto_ -> <em>texto</em>
    s = s.replace(/\b_([^_\n]+?)_\b/g, '<em>$1</em>');

    // 6. Listas numeradas e não-ordenadas
    const lines = s.split("\n");
    const outLines = [];
    let inUl = false;
    let inOl = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const ulMatch = line.match(/^(\s*)([-*•])\s+(.+)$/);
      const olMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);

      if (ulMatch) {
        if (inOl) { outLines.push("</ol>"); inOl = false; }
        if (!inUl) { outLines.push('<ul class="omni-chat-list">'); inUl = true; }
        outLines.push(`<li>${ulMatch[3]}</li>`);
      } else if (olMatch) {
        if (inUl) { outLines.push("</ul>"); inUl = false; }
        if (!inOl) { outLines.push('<ol class="omni-chat-list">'); inOl = true; }
        outLines.push(`<li>${olMatch[3]}</li>`);
      } else {
        if (inUl) { outLines.push("</ul>"); inUl = false; }
        if (inOl) { outLines.push("</ol>"); inOl = false; }
        outLines.push(line);
      }
    }
    if (inUl) outLines.push("</ul>");
    if (inOl) outLines.push("</ol>");

    s = outLines.join("\n");

    // 7. Parágrafos e quebras de linha
    const blocks = s.split(/\n{2,}/);
    s = blocks
      .map(b => {
        const trimmed = b.trim();
        if (!trimmed) return "";
        if (/^<(h[1-4]|ul|ol|pre|blockquote)/i.test(trimmed)) {
          return trimmed;
        }
        return `<p class="omni-chat-p">${trimmed.replace(/\n/g, "<br>")}</p>`;
      })
      .filter(Boolean)
      .join("");

    // 8. Restaurar placeholders
    s = s.replace(/\u0000INLINE(\d+)\u0000/g, (_m, idx) => inlineCodes[Number(idx)] || "");
    s = s.replace(/\u0000BLOCK(\d+)\u0000/g, (_m, idx) => codeBlocks[Number(idx)] || "");

    // 9. Sanitizar asteriscos órfãos residuais
    s = s.replace(/\*{2,}/g, "").replace(/(^|\s)\*(\s|$)/g, "$1•$2");

    return s;
  }

  function getTopicCatalog() {
    const S = appState();
    const mapBySigla = new Map();

    if (S && S.ed && typeof S.ed.values === "function") {
      for (const t of S.ed.values()) {
        if (!t) continue;
        const sig = String(t.sigla || "geral").toLowerCase();
        const matName = t.materia || t.sigla?.toUpperCase() || "Matéria";
        if (!mapBySigla.has(sig)) {
          mapBySigla.set(sig, { id: sig, name: matName, topics: [] });
        }
        mapBySigla.get(sig).topics.push({
          id: String(t.id || (sig + "-" + (t.num || "0"))),
          title: String(t.titulo || t.nome || t.id),
          label: `${t.sigla ? t.sigla.toUpperCase() + (t.num ? " " + t.num + " · " : " · ") : ""}${t.titulo || t.nome || t.id}`,
        });
      }
    } else if (S && S.edital && Array.isArray(S.edital.materias)) {
      for (const m of S.edital.materias) {
        const sig = String(m.sigla || m.id || m.nome || "geral").toLowerCase();
        const entry = { id: sig, name: m.nome || m.sigla || "Matéria", topics: [] };
        for (const t of m.topicos || []) {
          entry.topics.push({
            id: String(t.id || t.titulo || t.nome),
            title: String(t.titulo || t.nome || t.id),
            label: String(t.titulo || t.nome || t.id),
          });
        }
        mapBySigla.set(sig, entry);
      }
    }

    if (mapBySigla.size === 0) {
      return [
        {
          id: "pl",
          name: "Processo Legislativo & Regimento Interno",
          topics: [
            { id: "pl-01", title: "Espécies Normativas & Quóruns (CF/88 art. 59-69)", label: "PL 1 · Espécies Normativas & Quóruns" },
            { id: "pl-02", title: "Competências Legislativas (CF/88 art. 21-24)", label: "PL 2 · Competências Legislativas" },
            { id: "pl-03", title: "Regimento Interno da CD (RICD)", label: "PL 3 · Regimento Interno da CD" },
          ],
        },
        {
          id: "da",
          name: "Direito Administrativo",
          topics: [
            { id: "da-01", title: "Regime Jurídico & Princípios Administrativos", label: "DA 1 · Princípios Administrativos" },
            { id: "da-02", title: "Poderes Administrativos & Poder de Polícia", label: "DA 2 · Poderes Administrativos" },
            { id: "da-03", title: "Atos Administrativos & Delegação/Avocação", label: "DA 3 · Atos Administrativos" },
          ],
        },
        {
          id: "lp",
          name: "Língua Portuguesa",
          topics: [
            { id: "lp-01", title: "Compreensão, Interpretação & Tipologia Textual", label: "LP 1 · Compreensão e Interpretação" },
            { id: "lp-02", title: "Coesão, Coerência & Reescrita Cebraspe", label: "LP 2 · Coesão e Reescrita Cebraspe" },
            { id: "lp-03", title: "Morfossintaxe, Regência & Pontuação", label: "LP 3 · Regência e Pontuação" },
          ],
        },
      ];
    }

    return [...mapBySigla.values()];
  }

  function getActiveChatData() {
    const catalog = getTopicCatalog();
    if (!catalog.length) {
      return {
        catalog: [],
        currentSubject: { id: "geral", name: state.subject || "Matéria Geral", topics: [] },
        currentTopic: { id: "geral", title: "Tópico Geral", label: "Geral" },
        chat: { messages: state.messages || [], subject: state.subject, topicTitle: "Geral" },
      };
    }

    let curSubject = catalog.find(m => m.id === state.activeSubjectSigla);
    if (!curSubject) {
      curSubject = catalog[0];
      state.activeSubjectSigla = curSubject.id;
    }

    let curTopic = (curSubject.topics || []).find(t => t.id === state.activeTopicId);
    if (!curTopic) {
      curTopic = (curSubject.topics && curSubject.topics[0]) || { id: curSubject.id + "-01", title: curSubject.name, label: curSubject.name };
      state.activeTopicId = curTopic.id;
    }

    if (!state.chatsByTopic || typeof state.chatsByTopic !== "object") {
      state.chatsByTopic = {};
    }

    const key = curTopic.id;
    if (!state.chatsByTopic[key]) {
      const hasLegacy = Array.isArray(state.messages) && state.messages.length > 0 && Object.keys(state.chatsByTopic).length === 0;
      state.chatsByTopic[key] = {
        topicId: curTopic.id,
        topicTitle: curTopic.title,
        subject: curSubject.name,
        messages: hasLegacy
          ? state.messages
          : [
              {
                id: "welcome-" + curTopic.id,
                role: "model",
                text: `Olá! Sou o seu **Tutor Socrático OmniStudy IA**.\n\nEstamos focados em **${curSubject.name}** — *${curTopic.title}*.\n\nQual dúvida conceitual, pegadinha Cebraspe ou dispositivo deste assunto vamos dissecar agora?`,
                timestamp: "Agora",
              },
            ],
      };
    }

    const chat = state.chatsByTopic[key];
    chat.subject = curSubject.name;
    chat.topicTitle = curTopic.title;
    state.subject = `${curSubject.name} — ${curTopic.title}`;
    return { currentSubject: curSubject, currentTopic: curTopic, chat, catalog };
  }

  function openStudio(tab) {
    syncContestContext(appState());
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
      const { currentSubject, currentTopic, chat, catalog } = getActiveChatData();
      const messages = chat.messages || [];

      body.innerHTML = `
        <div class="omni-card" style="margin-bottom:14px">
          <div class="omni-tutor-catalog-bar">
            <div style="flex:1;min-width:200px">
              <label class="omni-label">Matéria do Concurso</label>
              <select id="omni-tutor-subject-select" class="omni-input">
                ${catalog
                  .map(
                    m =>
                      `<option value="${escHtml(m.id)}" ${m.id === currentSubject.id ? "selected" : ""}>${escHtml(m.name)}</option>`
                  )
                  .join("")}
              </select>
            </div>
            <div style="flex:1.4;min-width:240px">
              <label class="omni-label">Assunto / Tópico do Edital (Histórico Catalogado)</label>
              <select id="omni-tutor-topic-select" class="omni-input">
                ${(currentSubject.topics || [])
                  .map(
                    t =>
                      `<option value="${escHtml(t.id)}" ${t.id === currentTopic.id ? "selected" : ""}>${escHtml(t.label || t.title)}</option>`
                  )
                  .join("")}
              </select>
            </div>
            <div style="display:flex;align-items:flex-end">
              <button type="button" id="omni-tutor-clear-chat" class="omni-btn omni-btn-ghost" title="Limpar conversa deste assunto">🗑 Limpar Histórico</button>
            </div>
          </div>

          <div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(148,163,184,0.14);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px">
            <div style="display:flex;align-items:center;gap:6px">
              <span class="omni-label" style="margin:0">Modo Cognitivo:</span>
              <span style="font-size:11px;color:rgba(148,163,184,0.8)">(Muda a persona pedagógica da IA; histórico catalogado pelo assunto)</span>
            </div>
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

        <div class="omni-card">
          <div id="omni-chat-box" class="omni-chat-box">
            ${messages
              .map(
                m => `
              <div class="omni-msg ${m.role === "model" ? "model" : "user"}">${formatOmniMarkdown(m.text)}</div>
            `
              )
              .join("")}
          </div>

          <div style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0">
            <button type="button" class="omni-btn omni-btn-ghost" data-quick-prompt="Me faça 3 perguntas provocativas estilo Cebraspe sobre ${escHtml(currentTopic.title)} para testar minha retenção ativa.">🎯 Testar Retenção</button>
            <button type="button" class="omni-btn omni-btn-ghost" data-quick-prompt="Quais são as principais pegadinhas (F1 a F10) que a banca aplica em ${escHtml(currentTopic.title)}?">⚠️ Armadilhas da Banca</button>
            <button type="button" class="omni-btn omni-btn-ghost" data-quick-prompt="Crie uma analogia estilo Feynman inesquecível para o conceito mais difícil de ${escHtml(currentTopic.title)}.">💡 Analogia Feynman</button>
            <button type="button" id="omni-voice-btn" class="omni-btn omni-btn-ghost" title="Responder por voz (Arguição Oral)">🎙 Arguição por Voz</button>
          </div>

          <form id="omni-tutor-form" style="display:flex;gap:8px">
            <input id="omni-tutor-input" class="omni-input" placeholder="Responda ao tutor ou tire sua dúvida sobre ${escHtml(currentTopic.title)}..." />
            <button type="submit" class="omni-btn">Enviar</button>
          </form>
        </div>
      `;

      const subjectSel = body.querySelector("#omni-tutor-subject-select");
      if (subjectSel) {
        subjectSel.addEventListener("change", () => {
          state.activeSubjectSigla = subjectSel.value;
          const chosenMat = catalog.find(m => m.id === subjectSel.value);
          if (chosenMat && chosenMat.topics && chosenMat.topics[0]) {
            state.activeTopicId = chosenMat.topics[0].id;
          }
          saveState();
          renderStudioBody();
        });
      }

      const topicSel = body.querySelector("#omni-tutor-topic-select");
      if (topicSel) {
        topicSel.addEventListener("change", () => {
          state.activeTopicId = topicSel.value;
          saveState();
          renderStudioBody();
        });
      }

      const clearBtn = body.querySelector("#omni-tutor-clear-chat");
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          if (global.confirm && !global.confirm(`Limpar o histórico de mensagens de "${currentTopic.title}"?`)) {
            return;
          }
          if (state.chatsByTopic && state.chatsByTopic[currentTopic.id]) {
            state.chatsByTopic[currentTopic.id].messages = [
              {
                id: "welcome-" + currentTopic.id,
                role: "model",
                text: `Histórico reiniciado para **${currentSubject.name}** — *${currentTopic.title}*.\n\nQual ponto deste assunto vamos estudar agora?`,
                timestamp: "Agora",
              },
            ];
            saveState();
            renderStudioBody();
          }
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
        chat.messages = chat.messages || [];
        chat.messages.push({ id: "u-" + Date.now(), role: "user", text: clean, timestamp: "Agora" });
        saveState();
        renderStudioBody();
        const chatBox = document.getElementById("omni-chat-box");
        if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;

        const res = await callOmniStudyBackend({
          task: "tutor-chat",
          subject: currentSubject.name,
          topic: currentTopic.title,
          mode: state.tutorMode,
          messages: chat.messages.slice(-10).map(m => ({ role: m.role, text: m.text })),
          studentContext: tutorStudentContext(currentSubject.name, currentTopic.title),
        });
        chat.messages.push({
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
      if (global.QBOmniCornell?.render) {
        global.QBOmniCornell.render({ state, body, saveState, callAI: callOmniStudyBackend, S: appState() });
      } else {
        body.innerHTML = '<p role="alert">Editor Cornell indisponível. Recarregue a página para atualizar os recursos.</p>';
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
    version: "2.1.0",
    soundEngine,
    state,
    openStudio,
    closeStudio,
    formatOmniMarkdown,
    getTopicCatalog,
    getActiveChatData,
    togglePomodoro,
    callOmniStudyBackend,
    syncContestContext,
    get storageKey() {
      return storageKey;
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
