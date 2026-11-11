import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {
  cornellToMindMapStructure,
  normalizeMindMapTree,
  normalizeGanConfrontation,
} from "../src/lib/mindmap-gan-ai.js";

const studioCode = fs.readFileSync("public/claude-export/mindmap-studio.js", "utf8");
const cornellCode = fs.readFileSync("public/claude-export/omnistudy-cornell.js", "utf8");
const serverCode = fs.readFileSync("src/lib/omnistudy-ai.js", "utf8");
const shellCode = fs.readFileSync("src/components/qb/study-shell.html", "utf8");

function createSandbox() {
  const storage = new Map();
  const writtenDocs = new Map();
  const window = {
    localStorage: {
      getItem: k => storage.get(k) || null,
      setItem: (k, v) => storage.set(k, String(v)),
    },
    Date,
    Math,
  };
  window.window = window;
  vm.runInNewContext(studioCode, window, { filename: "mindmap-studio.js" });
  vm.runInNewContext(cornellCode, window, { filename: "omnistudy-cornell.js" });

  const S = {
    view: "mapa",
    mapaId: "pl-1",
    ed: new Map([
      ["pl-1", { id: "pl-1", sigla: "pl", num: "1.1", titulo: "Processo Legislativo Constitucional", caps: ["PL-01"] }],
      ["da-2", { id: "da-2", sigla: "da", num: "2.1", titulo: "Atos Administrativos e Competência", caps: [] }],
    ]),
    rv: new Map([
      [
        "pl-1",
        {
          id: "pl-1",
          titulo: "Processo Legislativo Constitucional",
          cartoes: [{ q: "Qual o quórum de LC?", a: ["Maioria absoluta."] }],
          itens: [{ k: "LC", d: "Maioria absoluta (art. 69 CF)" }],
        },
      ],
    ]),
    q: new Map(),
    r: new Map(),
    db: {
      doc(path) {
        return {
          set(val) {
            writtenDocs.set(path, { op: "set", val: JSON.parse(JSON.stringify(val)) });
            return Promise.resolve();
          },
          update(val) {
            writtenDocs.set(path, { op: "update", val: JSON.parse(JSON.stringify(val)) });
            return Promise.resolve();
          },
        };
      },
    },
  };

  return { window, S, writtenDocs, studio: window.QBMindMapStudio, cornell: window.QBOmniCornell };
}

test("Estúdio de Mapas Mentais permite criar mapa do zero, adicionar ramos, subtópicos, rótulos e desfazer preservando revisão existente", () => {
  const { S, writtenDocs, studio } = createSandbox();

  // 1. Cria um mapa do zero para o tópico pl-1 (que tinha apenas cartões/itens, sem mapa)
  const initialDraft = studio.ensureDraft(S, "pl-1");
  assert.equal(initialDraft.centro, "Processo Legislativo Constitucional");
  assert.ok(initialDraft.ramos.length >= 3);

  studio.saveMapToEnvironment(S, "pl-1", initialDraft);
  assert.ok(writtenDocs.has("revisao/pl-1"));
  // Deve preservar cartões e itens já existentes na revisão!
  assert.equal(S.rv.get("pl-1").cartoes.length, 1);
  assert.equal(S.rv.get("pl-1").itens.length, 1);

  // 2. Adiciona novo ramo principal com rótulo personalizado
  const branch = studio.addBranch(S, "pl-1", {
    t: "Medidas Provisórias (Art. 62 CF)",
    rotulo: "Urgência",
    cor: 5,
    caixa: true,
    n: "Prazo de 60 + 60 dias; trancamento no 45º dia.",
    e: "Adotadas pelo Presidente da República em caso de relevância e urgência.",
    trap: "MP não pode tratar de matéria reservada a Lei Complementar.",
  });
  assert.equal(branch.rotulo, "Urgência");
  assert.equal(branch.caixa, true);

  // 3. Cria subtópico aninhado dentro do novo ramo e altera rótulo/título
  const newBranchIndex = String(studio.ensureDraft(S, "pl-1").ramos.length - 1);
  const sub = studio.addSubtopic(S, "pl-1", newBranchIndex, {
    t: "Vedações Materiais às MPs",
    rotulo: "Art. 62 §1º",
    n: "Nacionalidade, cidadania, direito penal, processual penal e civil.",
  });
  assert.ok(sub.id);
  assert.equal(sub.rotulo, "Art. 62 §1º");

  // Cria microtópico de 3º nível dentro do subtópico
  const micro = studio.addSubtopic(S, "pl-1", `${newBranchIndex}.0`, {
    t: "Direito Eleitoral e Partidário",
    rotulo: "Vedação Expressa",
  });
  assert.equal(micro.t, "Direito Eleitoral e Partidário");

  // 4. Edita nó existente e adiciona ligação cruzada
  studio.updateNodeAtPath(S, "pl-1", `${newBranchIndex}.0`, {
    t: "Vedações Materiais Taxativas (Art. 62, § 1º, CF)",
    rotulo: "Cláusula de Barreira MP",
  });
  const firstBranchId = studio.ensureDraft(S, "pl-1").ramos[0].id;
  assert.equal(studio.addCrossLink(S, "pl-1", firstBranchId, branch.id, "Regra Geral → Rito de Urgência"), true);

  studio.saveMapToEnvironment(S, "pl-1", studio.ensureDraft(S, "pl-1"));
  const savedMap = S.rv.get("pl-1").mapa;
  assert.equal(savedMap.ramos.length, 4);
  assert.equal(savedMap.ramos[3].f[0].rotulo, "Cláusula de Barreira MP");
  assert.equal(savedMap.ramos[3].f[0].f[0].t, "Direito Eleitoral e Partidário");
  assert.ok(savedMap.ligacoes.some(l => l[2] === "Regra Geral → Rito de Urgência"));

  // 5. Desfazer restaura a versão anterior
  assert.equal(studio.undoDraft(S, "pl-1"), true);
  assert.equal(S.rv.get("pl-1").mapa.ramos.length, 3);
});

test("Caderno Cornell serve de base direta para criar e personalizar o Mapa Mental do usuário", () => {
  const { S, studio, cornell } = createSandbox();

  const note = {
    id: "cornell-pl-99",
    title: "Comissões Parlamentares e Poder Conclusivo",
    subject: "Regimento Interno (RICD)",
    topicId: "pl-1",
    cues: [
      "O que é apreciação conclusiva nas comissões?",
      "Quais proposições NÃO admitem poder conclusivo?",
      "Como funciona o recurso ao Plenário?",
    ],
    notes:
      "• Art. 58, § 2º, I, CF e art. 24, II, RICD: dispensa o Plenário para discutir e votar projetos de lei.\n• Exceção: projetos de lei complementar, código, iniciativa popular ou com pareceres divergentes.\n• Recurso de 1/10 dos membros da Casa em 5 sessões.",
    summary: "O poder conclusivo acelera o processo legislativo, mas curva-se ao recurso de 1/10 dos Deputados ou às exceções regimentais.",
    referenceText: "Art. 58, § 2º, I, da Constituição Federal: às comissões cabe discutir e votar projeto de lei que dispensar, na forma do regimento, a competência do Plenário, salvo se houver recurso de um décimo dos membros da Casa.",
  };

  // Conversão estrutural via QBOmniCornell / QBMindMapStudio
  const mapFromCornell = cornell.buildMindMapFromNote(note, { topicId: "pl-1" });
  assert.match(mapFromCornell.centro, /Comissões Parlamentares e Poder Conclusivo/);
  assert.ok(mapFromCornell.ramos.length >= 4); // 3 pistas + ramo de Síntese Executiva
  assert.equal(mapFromCornell.origemCornell.noteId, "cornell-pl-99");

  // Abre diretamente no ambiente de estudo (view 'mapa')
  const opened = studio.openFromCornell(note, { S });
  assert.equal(opened.topicId, "pl-1");
  assert.equal(S.view, "mapa");
  assert.match(S.rv.get("pl-1").mapa.centro, /Comissões Parlamentares/);

  // Também valida a função pura do servidor
  const serverMap = cornellToMindMapStructure(note, { topicId: "pl-1" });
  assert.ok(serverMap.ramos.length >= 4);
  const normalized = normalizeMindMapTree(serverMap, note.title, "pl-1");
  assert.equal(normalized.ramos[0].t, "O que é apreciação conclusiva nas comissões");
});

test("Geração de questões a partir do Mapa Mental confronta Gerador × Discriminador Cego (GAN) e vincula questões aos nós", async () => {
  const { S, writtenDocs, studio } = createSandbox();

  // Prepara um mapa rico para o tópico da-2
  const map = studio.createEmptyMap("da-2", "Delegação e Avocação (Lei 9.784/1999)");
  studio.saveMapToEnvironment(S, "da-2", map);
  const firstNodeId = S.rv.get("da-2").mapa.ramos[0].id;

  // 1. Testa o portão determinístico de confronto GAN (unanimidade, refinamento pós-crítica e bloqueio de divergência)
  const generatorItems = [
    {
      mapaNoId: firstNodeId,
      tema: "Delegação de Competência",
      enunciado: "A delegação de competência administrativa admite transferência do exercício mesmo para órgão não hierarquicamente subordinado, ressalvados os atos de caráter normativo, a decisão de recursos e as matérias de competência exclusiva.",
      gabarito: "C",
      mecanismo: "V1",
      comentario: "Art. 12 e 13 da Lei 9.784/1999.",
      teseGerador: "Paráfrase fiel da regra de delegação horizontal/vertical e suas 3 vedações.",
    },
    {
      mapaNoId: firstNodeId,
      tema: "Avocação",
      enunciado: "A avocação sempre será permitida entre órgãos de mesma hierarquia.",
      gabarito: "E",
      mecanismo: "F1",
      comentario: "Art. 15 da Lei 9.784/1999: exige órgão hierarquicamente inferior e caráter excepcional.",
      teseGerador: "Teste de subordinação na avocação.",
    },
    {
      mapaNoId: firstNodeId,
      tema: "Item Ambíguo sem Reconciliação",
      enunciado: "O ato de delegação pode ou não especificar ressalvas conforme o caso concreto.",
      gabarito: "E",
      mecanismo: "F4",
      comentario: "Art. 14, § 1º.",
    },
  ];

  const discriminatorJudgments = [
    {
      index: 0,
      gabaritoDiscriminador: "C",
      scoreRealismo: 95,
      veredicto: "APROVADA",
      criticaAdversaria: "Gabarito C confirmado às cegas. Enunciado preciso e sem pistas artificiais.",
      falhasDetectadas: [],
    },
    {
      index: 1,
      gabaritoDiscriminador: "E",
      scoreRealismo: 62,
      veredicto: "REFINAR",
      criticaAdversaria: "O termo 'sempre' entrega o gabarito artificialmente (tell lexical). Refinado para testar o requisito técnico sem advérbio absoluto.",
      falhasDetectadas: ["Palavra absoluta artificial ('sempre')"],
      itemRefinado: {
        enunciado: "Em razão do princípio da eficiência, admite-se, em caráter temporário e por motivos relevantes devidamente justificados, a avocação de competência atribuída a órgão de mesma hierarquia ou hierarquicamente inferior.",
        gabarito: "E",
        comentario: "ERRADO (F3). A avocação restringe-se exclusivamente a competência atribuída a órgão hierarquicamente INFERIOR (art. 15 da Lei 9.784/1999), não cabendo entre órgãos de mesma hierarquia.",
      },
    },
    {
      index: 2,
      gabaritoDiscriminador: "C", // Divergência de gabarito sem itemRefinado!
      scoreRealismo: 40,
      veredicto: "REJEITADA",
      criticaAdversaria: "Ambiguidade: o Discriminador julgou C enquanto o Gerador pretendia E.",
      falhasDetectadas: ["Divergência de gabarito em revisão cega"],
    },
  ];

  const ganResult = normalizeGanConfrontation(generatorItems, discriminatorJudgments, S.rv.get("da-2").mapa, {
    formato: "ce",
  });

  assert.equal(ganResult.questions.length, 3);
  assert.equal(ganResult.summary.aprovadasDireto, 1);
  assert.equal(ganResult.summary.refinadasPelaGan, 1);
  assert.equal(ganResult.summary.bloqueadasPorDivergencia, 1);

  // O item 1 foi refinado pelo Discriminador para remover a palavra 'sempre'
  assert.equal(ganResult.questions[1].ganConfrontation.statusConfronto, "refinada_gan");
  assert.doesNotMatch(ganResult.questions[1].enunciado, /sempre será permitida/);
  assert.match(ganResult.questions[1].enunciado, /órgão de mesma hierarquia ou hierarquicamente inferior/);

  // O item 2 teve divergência de gabarito bloqueada
  assert.equal(ganResult.questions[2].ganConfrontation.statusConfronto, "divergencia_bloqueada");

  // 2. Executa geração e incorporação no ambiente de estudo: apenas as aprovadas/refinadas entram no banco!
  studio.studioState.ganBatches.set("da-2", ganResult);
  const inc = studio.incorporateGanQuestions(S, "da-2");
  assert.equal(inc.savedCount, 2); // Item bloqueado pela GAN NÃO é incorporado!
  assert.equal(S.q.size, 2);

  // Verifica que o nó do mapa mental recebeu os IDs das questões em node.x.questaoIds
  const updatedNode = S.rv.get("da-2").mapa.ramos[0];
  assert.equal(updatedNode.x.questaoIds.length, 2);
  assert.ok(writtenDocs.has("questoes/" + inc.questionIds[0]));
  assert.ok(writtenDocs.has("edital/da-2"));

  // 3. Confere que o servidor implementa as tarefas cornell-to-mindmap e mindmap-gan-questions com revisão cega
  assert.match(serverCode, /task: z\.literal\("cornell-to-mindmap"\)/);
  assert.match(serverCode, /task: z\.literal\("mindmap-gan-questions"\)/);
  assert.match(serverCode, /ITENS PARA JULGAMENTO CEGO \(SEM GABARITO\)/);
  assert.match(shellCode, /mindmap-studio\.js\?v=1/);
  assert.match(shellCode, /mindmap-studio\.css\?v=1/);
});
