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

test("Folha Dividida Cornell, Cadernos por Matéria no Dashboard Esquerdo e Artefatos Remissivos de Material", () => {
  const { studio, cornell, S, writtenDocs } = createSandbox();
  S.mat = new Map();
  S.abertos = new Set();

  const state = {
    subject: "Processo Legislativo (PL)",
    cornellNotes: [
      {
        id: "cornell-pl-1",
        title: "Regime de Urgência Constitucional (Art. 64 CF)",
        subject: "Processo Legislativo (PL)",
        topicId: "pl-1",
        date: "11/11/2026",
        cues: ["Qual o prazo de cada Casa na urgência constitucional?", "Recesso parlamentar suspende o prazo?"],
        notes: "Cada Casa tem 45 dias para apreciar; sobrestando-se as demais deliberações.\nOs prazos não correm no recesso do Congresso Nacional.",
        summary: "Urgência constitucional: 45 dias por Casa, suspenso no recesso.",
        referenceText: "Art. 64, §§ 1º a 4º, CF/88.",
      },
    ],
    selectedCornellId: "cornell-pl-1",
  };

  // 1. Cadernos divididos por matéria: adicionar, personalizar, selecionar e excluir via dashboard esquerdo
  const notebooks = cornell.ensureNotebooks(state, S);
  assert.ok(notebooks.length >= 2);

  const customNb = cornell.addNotebook(state, {
    name: "Regimento Interno CD",
    sigla: "RICD",
    color: "#f472b6",
  });
  assert.ok(customNb.id);
  assert.equal(state.selectedNotebookId, customNb.id);

  // Criar folha dentro do caderno selecionado
  const newSheet = cornell.newManual(state);
  assert.equal(newSheet.notebookId, customNb.id);
  assert.equal(newSheet.subject, "Regimento Interno CD");

  // Personalizar o caderno atualiza o nome e propaga para as folhas vinculadas
  cornell.updateNotebook(state, customNb.id, {
    name: "Regimento Interno da Câmara (RICD)",
    sigla: "RICD",
    color: "#34d399",
  });
  assert.equal(newSheet.subject, "Regimento Interno da Câmara (RICD)");

  // Selecionar caderno filtra as folhas exibidas
  cornell.selectNotebook(state, customNb.id);
  assert.equal(cornell.getVisibleNotes(state).length, 1);

  // Excluir folha manual e excluir caderno preservando notas anteriores
  assert.equal(cornell.deleteNote(state, newSheet.id, S), true);
  assert.equal(cornell.deleteNotebook(state, customNb.id), true);

  // 2. Renderização da Folha Dividida Real do Método Cornell (Cabeçalho + 30% Pistas | 70% Notas + 100% Rodapé Síntese)
  const bodyStub = {
    innerHTML: "",
    querySelector: () => null,
    querySelectorAll: () => [],
  };
  cornell.render({
    state,
    body: bodyStub,
    saveState: () => {},
    callAI: async () => ({}),
    S,
  });
  assert.match(bodyStub.innerHTML, /omni-cornell-divided-page/);
  assert.match(bodyStub.innerHTML, /omni-cornell-page-header/);
  assert.match(bodyStub.innerHTML, /omni-cornell-page-body/);
  assert.match(bodyStub.innerHTML, /omni-cornell-col-cues/);
  assert.match(bodyStub.innerHTML, /omni-cornell-col-notes/);
  assert.match(bodyStub.innerHTML, /omni-cornell-page-footer/);
  assert.match(bodyStub.innerHTML, /Cadernos por Matéria/);

  // 3. Transformação remissiva da Folha Cornell em Artefato de Material (S.mat / materiais/<id>)
  const artifact = cornell.publishNoteAsMaterial(state.cornellNotes[0], S);
  assert.ok(artifact.id.startsWith("mat-cornell-"));
  assert.equal(artifact.origemArtefato, "cornell");
  assert.equal(artifact.cornellNoteId, "cornell-pl-1");
  assert.deepEqual([...artifact.topicos], ["pl-1"]);
  assert.ok(S.mat.has(artifact.id));
  assert.ok(writtenDocs.has("materiais/" + artifact.id));

  // 4. Uso do Artefato/Material como Subsídio direto para criação do Mapa Mental
  const fromMat = studio.openFromMaterial(artifact.id, { S, topicId: "pl-1" });
  assert.equal(fromMat.topicId, "pl-1");
  assert.equal(fromMat.mapa.origemMaterial.materialId, artifact.id);
  assert.equal(fromMat.mapa.origemMaterial.cornellNoteId, "cornell-pl-1");
  assert.ok(fromMat.mapa.ramos.length >= 3);
  assert.match(shellCode, /data-open-cornell-note/);
  assert.match(shellCode, /data-material-to-map/);
});

test("Geração e estruturação de Mapa Mental fiel aos subsídios no padrão Conceitual Irradiante com rótulos e aprofundamento", () => {
  const { studio, S } = createSandbox();

  // Adiciona questão no banco S.q para testar associação remissiva
  S.q.set("q-pl-lc-01", {
    id: "q-pl-lc-01",
    topicoId: "pl-1",
    materia: "Processo Legislativo Constitucional",
    enunciado: "As leis complementares serão aprovadas por maioria absoluta (art. 69 da CF).",
    gabarito: "C",
  });
  S.q.set("q-pl-mp-02", {
    id: "q-pl-mp-02",
    topicoId: "pl-1",
    materia: "Processo Legislativo Constitucional",
    enunciado: "É expressamente vedada a edição de medida provisória sobre matéria relativa a direito eleitoral.",
    gabarito: "C",
  });

  const subsídioAula = {
    id: "mat-pl-especies",
    titulo: "Espécies Normativas e Procedimentos Especiais",
    materia: "Processo Legislativo Constitucional",
    topicos: ["pl-1"],
    conteudo: `
# Espécies Normativas Constitucionais
## Leis Complementares
Quórum qualificado de maioria absoluta para aprovação (Art. 69 da CF).
- Requisito de aprovação: maioria absoluta dos membros da Câmara e do Senado.
- Matéria reservada: taxativamente prevista na Constituição.
- Diferença para Lei Ordinária: lei ordinária exige maioria simples.

## Medidas Provisórias
Requisitos de relevância e urgência conferidos privativamente ao Presidente da República (Art. 62 da CF).
- Vedações materiais expressas: direito penal, eleitoral e matérias de lei complementar.
- Prazo legal de vigência: 60 dias prorrogáveis uma única vez por igual período.
- Efeito jurídico: força de lei imediata com eficácia resolutiva se rejeitada.

## Emendas Constitucionais
Limitações circunstanciais, temporais e materiais (cláusulas pétreas no Art. 60 da CF).
- Quórum qualificado: três quintos em dois turnos em cada casa.
- Vedação expressa: não pode abolir voto direto, secreto, universal e periódico.
- Exceção taxativa: vedada deliberação na vigência de intervenção federal ou estado de sítio.
    `.trim(),
    resumo: "Síntese dos quóruns, vedações e requisitos das espécies normativas dos arts. 59 a 69 da CF.",
  };

  const mapaGerado = studio.materialToMindMap(subsídioAula, {
    topicId: "pl-1",
    topicTitle: subsídioAula.titulo,
    materia: subsídioAula.materia,
    S,
  });

  assert.match(mapaGerado.centro, /Espécies Normativas/i);
  assert.ok(mapaGerado.ramos.length >= 3);

  // 1. Verifica ausência total de rótulos artificiais genéricos
  const { list: todosNos } = studio.enumerateMapNodes(mapaGerado);
  for (const no of todosNos) {
    assert.doesNotMatch(no.rotulo || "", /^Pista\s*\d+$/i);
    assert.doesNotMatch(no.rotulo || "", /^Sub\s*\d+\.\d+$/i);
    assert.doesNotMatch(no.rotulo || "", /^Seção\s*\d+$/i);
    assert.doesNotMatch(no.rotulo || "", /^Artefato\s*\d+$/i);
    // Todo nó deve ter um rótulo explicativo de primeira vista
    assert.ok(no.rotulo && no.rotulo.length >= 3, `Nó "${no.title}" deve ter rótulo superficial`);
  }

  // 2. Fidelidade aos ramos estruturantes e conceitos
  const ramoLC = mapaGerado.ramos.find(r => /Leis Complementares/i.test(r.t));
  assert.ok(ramoLC, "Deve ter ramo sobre Leis Complementares");
  assert.match(ramoLC.rotulo, /Quórum Qualificado|Regra Geral|Conceito Chave/i);
  assert.ok(ramoLC.f && ramoLC.f.length >= 2, "Ramo deve ramificar em subtópicos");

  const subQuorumLC = ramoLC.f.find(s => /maioria absoluta/i.test(s.t) || /requisito/i.test(s.t));
  assert.ok(subQuorumLC, "Subtópico de maioria absoluta/requisito deve existir");
  assert.match(subQuorumLC.rotulo, /Requisito Legal|Quórum Qualificado|Regra Geral/i);

  // 3. Ramo com vedações expressas e prazos
  const ramoMP = mapaGerado.ramos.find(r => /Medidas Provisórias/i.test(r.t));
  assert.ok(ramoMP, "Deve ter ramo sobre Medidas Provisórias");
  const subVedacao = ramoMP.f.find(s => /vedações/i.test(s.t) || /vedação/i.test(s.rotulo));
  assert.ok(subVedacao, "Subtópico de vedações materiais deve existir");
  assert.match(subVedacao.rotulo, /Vedação Expressa|Requisito Legal/i);

  // 4. Associação de questões de S.q vinculadas ao nó conceitual
  const nosComQuestoes = todosNos.filter(n => n.node?.x?.questaoIds && n.node.x.questaoIds.length > 0);
  assert.ok(nosComQuestoes.length > 0, "Pelo menos um conceito deve associar questões do banco S.q");

  // 5. Teste do gerador backend cornellToMindMapStructure
  const folhaCornell = {
    id: "folha-01",
    title: "Atos Administrativos",
    subject: "Direito Administrativo",
    cues: ["Requisitos do Ato (COMFIFORMOOB)", "Atributos (PATI)", "Desfazimento do Ato"],
    notes: `
Requisitos de Validade: competência, finalidade, forma, motivo e objeto. A competência privativa não admite delegação de caráter normativo.
Atributos do Ato Administrativo: presunção de legitimidade, autoexecutoriedade, tipicidade e imperatividade. A autoexecutoriedade é exceção taxativa em atos punitivos que exijam contraditório prévio.
Desfazimento do Ato: revogação por conveniência e oportunidade; anulação por vício de legalidade insanável com efeito ex tunc.
    `.trim(),
    summary: "Síntese dos elementos essenciais e desfazimento na jurisprudência.",
    referenceText: "Lei 9.784/1999 e doutrina Di Pietro.",
  };

  const estrutura = cornellToMindMapStructure(folhaCornell, "da-2");
  assert.match(estrutura.centro, /Atos Administrativos/);
  assert.ok(estrutura.ramos.length >= 3);

  // Valida rótulos superficiais e ausência de 'Pista 1' na estrutura
  for (const r of estrutura.ramos) {
    assert.doesNotMatch(r.rotulo || "", /^Pista\s*\d+$/i);
    assert.ok(r.rotulo, `Ramo ${r.t} deve conter rótulo deduzido`);
    assert.ok(r.x && r.x.e, `Ramo ${r.t} deve conter explicação profunda x.e`);
    assert.ok(r.x && r.x.trap, `Ramo ${r.t} deve conter pegadinha da banca x.trap`);
  }
});

test("Ingestão de acervo do GeminiNotebook / NotebookLM gera material remissivo, folha Cornell e mapa mental AXON", () => {
  const { studio, S } = createSandbox();
  S.mat = new Map();

  const notaGemini = {
    title: "Processo Legislativo - Veto Presidencial",
    subject: "Processo Legislativo Constitucional",
    topicId: "pl-1",
    content: `
# Veto Presidencial Constitucional
## Prazos e Características
O Presidente da República dispõe do prazo legal de 15 dias úteis para vetar projeto de lei aprovado.
- Motivos de veto: inconstitucionalidade (veto jurídico) ou contrariedade ao interesse público (veto político).
- Vedação expressa: não cabe veto de palavras isoladas ou de trechos que alterem o sentido.

## Apreciação pelo Congresso Nacional
Sessão conjunta da Câmara e do Senado no prazo de 30 dias contados do recebimento.
- Quórum qualificado de rejeição: maioria absoluta de Deputados e Senadores em votação nominal.
- Efeito jurídico da rejeição: o projeto segue para promulgação obrigatória em 48 horas.

## Síntese e Pontos de Prova Cebraspe
O veto é sempre formal e expresso; silêncio do Presidente no prazo de 15 dias importa sanção tácita.
    `.trim(),
    asMaterial: true,
    asCornell: true,
    asMindMap: true,
  };

  const resultado = studio.ingestGeminiNotebook(notaGemini, S);
  assert.equal(resultado.success, true);

  // 1. Validar Artefato de Material criado
  assert.ok(resultado.material);
  assert.equal(resultado.material.origemArtefato, "gemini-notebook");
  assert.equal(resultado.material.titulo, "Processo Legislativo - Veto Presidencial");
  assert.ok(S.mat.has(resultado.material.id));

  // 2. Validar Folha Cornell gerada
  assert.ok(resultado.cornellNote);
  assert.equal(resultado.cornellNote.title, "Processo Legislativo - Veto Presidencial");
  assert.ok(resultado.cornellNote.cues.length >= 2);

  // 3. Validar Mapa Mental AXON estruturado
  assert.ok(resultado.mapa);
  assert.match(resultado.mapa.centro, /Veto Presidencial/i);
  assert.ok(resultado.mapa.ramos.length >= 2);
  assert.match(resultado.mapa.autor, /GeminiNotebook/i);

  // Verifica que os ramos têm rótulos deduzidos do padrão AXON
  for (const r of resultado.mapa.ramos) {
    assert.doesNotMatch(r.rotulo || "", /^Pista\s*\d+$/i);
    assert.ok(r.rotulo, "Ramo deve possuir rótulo");
    assert.ok(r.x && r.x.e, "Ramo deve possuir explicação técnica x.e");
  }
});

