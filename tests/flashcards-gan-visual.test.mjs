import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const omniCode = fs.readFileSync("public/claude-export/omnistudy-ai.js", "utf8");
const omniCss = fs.readFileSync("public/claude-export/omnistudy-ai.css", "utf8");
const serverCode = fs.readFileSync("src/lib/omnistudy-ai.js", "utf8");
const shellHtml = fs.readFileSync("src/components/qb/study-shell.html", "utf8");
const detailCss = fs.readFileSync("public/claude-export/study-detail.css", "utf8");

test("Backend suporta geração de flashcards GAN com subsídios do Mapa Mental, Cornell e Mecanismos Cebraspe", () => {
  // 1. Schema do OmniStudyInput aceita sourceType, mapa, cornellNotes e targetNodeId
  assert.match(serverCode, /task: z\.literal\("generate-flashcards"\)/);
  assert.match(serverCode, /sourceType: z\.enum\(\["mindmap", "cornell", "text", "auto"\]\)/);
  assert.match(serverCode, /cornellNotes: z\.string\(\)/);

  // 2. Processo GAN possui Gerador e Discriminador Cebraspe
  assert.match(serverCode, /ARQUITETURA GAN DE FLASHCARDS — ETAPA 1: GERADOR/);
  assert.match(serverCode, /ARQUITETURA GAN DE FLASHCARDS — ETAPA 2: DISCRIMINADOR ADVERSÁRIO/);
  assert.match(serverCode, /mnemonicHint/);
  assert.match(serverCode, /mecanismo/);
  assert.match(serverCode, /vacina/);
  assert.match(serverCode, /legalRef/);
  assert.match(serverCode, /scoreRealismo/);
});

test("Interface do OmniStudy implementa seleção de subsídios, processo GAN e Cartão 3D de alta fidelidade", () => {
  const elements = new Map();
  const listeners = new Map();

  const fakeElement = (id = "", className = "") => {
    const el = {
      id,
      className,
      value: "",
      html: "",
      style: {},
      files: [],
      classList: {
        add: c => { el.className += " " + c; },
        remove: c => { el.className = el.className.replace(c, "").trim(); },
        toggle: (c, val) => {
          if (val) el.classList.add(c);
          else el.classList.remove(c);
        },
        contains: c => el.className.includes(c),
      },
      set innerHTML(val) {
        this.html = val;
        // Parse simple ids and data attributes
        for (const m of val.matchAll(/id="([^"]+)"/g)) {
          if (!elements.has("#" + m[1])) elements.set("#" + m[1], fakeElement(m[1]));
        }
      },
      get innerHTML() { return this.html; },
      querySelector(sel) { return elements.get(sel) || null; },
      querySelectorAll(sel) {
        return sel.startsWith("[data-") ? [] : [];
      },
      addEventListener(evt, fn) {
        listeners.set(evt, fn);
      },
    };
    return el;
  };

  const bodyEl = fakeElement("omni-drawer-body");
  const backdropEl = fakeElement("omni-drawer-backdrop");
  elements.set("omni-drawer-body", bodyEl);
  elements.set("omni-drawer-backdrop", backdropEl);
  elements.set("#omni-drawer-body", bodyEl);
  elements.set("#omni-drawer-backdrop", backdropEl);

  const sandbox = {
    window: {},
    document: {
      getElementById: id => elements.get(id) || elements.get("#" + id) || null,
      querySelector: sel => elements.get(sel) || elements.get(sel.replace("#", "")) || null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
      readyState: "complete",
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
    },
    console,
    Math,
    Date,
    String,
    Array,
    Object,
  };

  vm.runInNewContext(omniCode, sandbox);
  const omni = sandbox.window.QBOmniStudy;
  assert.ok(omni, "QBOmniStudy deve ser exportado");

  // Definir estado com cartão semente rico em dados GAN
  omni.state.activeTab = "flashcards";
  omni.state.decks = [
    {
      id: "deck-1",
      title: "Processo Legislativo ARR",
      cards: [
        {
          id: "c1",
          question: "Qual o quórum de aprovação de Lei Complementar vs Lei Ordinária?",
          answer: "Lei Complementar exige maioria ABSOLUTA (art. 69 CF). Lei Ordinária exige maioria SIMPLES (relativa).",
          category: "Espécies Normativas",
          mnemonicHint: "LC = Maioria Absoluta | LO = Maioria Simples",
          mecanismo: "F3 · Troca de Quórum",
          vacina: "Verifique se a CF/88 exige expressamente LC para a matéria.",
          legalRef: "Art. 47 e 69 da CF/88",
          discriminatorScore: 95,
        },
      ],
    },
  ];

  // Disparar renderização da aba flashcards chamando openStudio
  omni.openStudio("flashcards");
  const html = bodyEl.innerHTML;

  // 1. Deve conter abas de fontes de subsídios (Mapa Mental, Cornell, Texto, Scanner)
  assert.match(html, /data-fc-source="mindmap"/);
  assert.match(html, /data-fc-source="cornell"/);
  assert.match(html, /data-fc-source="text"/);
  assert.match(html, /data-fc-source="camera"/);

  // 2. Deve conter botão de geração com arquitetura GAN
  assert.match(html, /Gerar Flashcards com Arquitetura GAN/);

  // 3. Deve renderizar a estrutura 3D do cartão com Face Frontal e Face Traseira
  assert.match(html, /omni-fc-face front/);
  assert.match(html, /omni-fc-face back/);
  assert.match(html, /Qual o quórum de aprovação/);
  assert.match(html, /Lei Complementar exige maioria ABSOLUTA/);

  // 4. Deve conter os blocos de fundamentação Cebraspe (Mnemônico, Mecanismo e Base Normativa)
  assert.match(html, /Gatilho Mnemônico \/ Par de Contraste/);
  assert.match(html, /LC = Maioria Absoluta \| LO = Maioria Simples/);
  assert.match(html, /Mecanismo da Banca/);
  assert.match(html, /F3 · Troca de Quórum/);
  assert.match(html, /Art\. 47 e 69 da CF\/88/);
  assert.match(html, /Rigor GAN 95%/);

  // 5. Deve conter controles SRS com atalhos [1], [2], [3], [4]
  assert.match(html, /data-srs-rate="again"/);
  assert.match(html, /data-srs-rate="hard"/);
  assert.match(html, /data-srs-rate="good"/);
  assert.match(html, /data-srs-rate="easy"/);
});

test("Apresentação visual nos arquivos CSS suporta rotação 3D realista e realce de fundamentação", () => {
  // 1. Estilos 3D do OmniStudy
  assert.match(omniCss, /perspective:\s*1200px/);
  assert.match(omniCss, /transform-style:\s*preserve-3d/);
  assert.match(omniCss, /backface-visibility:\s*hidden/);
  assert.match(omniCss, /\.omni-fc-face\.front/);
  assert.match(omniCss, /\.omni-fc-face\.back/);
  assert.match(omniCss, /\.omni-srs-btn\.again/);
  assert.match(omniCss, /\.omni-srs-btn\.good/);

  // 2. Estilos no ambiente geral de estudo (study-detail.css)
  assert.match(detailCss, /\.qb-flash-mnem/);
  assert.match(detailCss, /\.qb-flash-mec/);
  assert.match(shellHtml, /function flashAnswer/);
  assert.match(shellHtml, /qb-flash-mnem/);
  assert.match(shellHtml, /qb-flash-mec/);
});
