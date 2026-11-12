import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const curatorCode = fs.readFileSync("public/claude-export/question-curator.js", "utf8");
const shellHtml = fs.readFileSync("src/components/qb/study-shell.html", "utf8");
const swCode = fs.readFileSync("public/sw.js", "utf8");
const serverCode = fs.readFileSync("src/lib/omnistudy-ai.js", "utf8");

function loadCurator(customGlobal = {}) {
  const win = {
    confirm: () => true,
    toast: () => {},
    render: () => {},
    enqueue: fn => fn(),
    ...customGlobal,
  };
  const sandbox = {
    window: win,
    document: {
      createElement: () => ({
        id: "",
        className: "",
        appendChild: () => {},
        addEventListener: () => {},
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        querySelector: () => null,
        querySelectorAll: () => [],
      }),
      getElementById: () => null,
      body: { appendChild: () => {} },
    },
    confirm: win.confirm,
    toast: win.toast,
    render: win.render,
    enqueue: win.enqueue,
    console,
    Math,
    Date,
    String,
    Array,
    Object,
    ...customGlobal,
  };
  vm.runInNewContext(curatorCode, sandbox);
  return sandbox.window.QBQuestionCurator;
}

test("Exclusão de questão remove do banco, da memória e ajusta rodada ativa sem penalizar aluno", () => {
  const deletes = [];
  const fakeDb = {
    doc(path) {
      return {
        delete: async () => deletes.push(path),
        update: async data => deletes.push({ path, update: data }),
      };
    },
  };

  const q1 = { id: "q-101", ordem: 1, cap: "PL-01", enunciado: "Assertiva 1" };
  const q2 = { id: "q-102", ordem: 2, cap: "PL-01", enunciado: "Assertiva 2 malfeita" };
  const q3 = { id: "q-103", ordem: 3, cap: "PL-01", enunciado: "Assertiva 3" };

  const S = {
    db: fakeDb,
    q: new Map([
      ["q-101", q1],
      ["q-102", q2],
      ["q-103", q3],
    ]),
    r: new Map([
      ["q-102", { qid: "q-102", noCaderno: true }],
    ]),
    round: {
      fila: ["q-101", "q-102", "q-103"],
      idx: 1, // exatamente na questão malfeita
      atual: { marcada: "C", acertou: false },
      pend: null,
    },
  };

  let rendered = 0;
  const curator = loadCurator({
    confirm: () => true,
    render: () => { rendered++; },
  });

  const deleted = curator.deleteQuestion("q-102", { S });
  assert.equal(deleted, true);

  // 1. Deve ter chamado delete no banco
  assert.ok(deletes.includes("questoes/q-102"));

  // 2. Deve ter removido de S.q
  assert.equal(S.q.has("q-102"), false);
  assert.equal(S.q.size, 2);

  // 3. Fila da rodada ativa deve ter removido q-102 e resetado estado atual
  assert.deepEqual(S.round.fila, ["q-101", "q-103"]);
  assert.equal(S.round.atual, null);

  // 4. Caderno de erros desmarcou a questão
  assert.equal(S.r.get("q-102").noCaderno, false);

  // 5. Interface re-renderizada
  assert.ok(rendered >= 1);
});

test("Reformulação com IA e salvamento atualiza enunciado, gabarito e comentário no banco", async () => {
  const sets = [];
  const fakeDb = {
    doc(path) {
      return {
        set: async (doc, opts) => sets.push({ path, doc, opts }),
      };
    },
  };

  const q = {
    id: "q-201",
    ordem: 5,
    cap: "DA-02",
    tema: "Poderes",
    enunciado: "O poder de polícia não pode ser delegado a particulares sob nenhuma hipótese.",
    gabarito: "C",
    comentario: "Comentário vago e desatualizado.",
    ref: "Doutrina antiga",
  };

  const S = {
    db: fakeDb,
    q: new Map([["q-201", q]]),
  };

  const curator = loadCurator({
    QBOmniStudy: {
      callOmniStudyBackend: async payload => {
        assert.equal(payload.task, "curate-question");
        assert.equal(payload.question.id, "q-201");
        return {
          parecer: "O STF firmou tese de repercussão geral (Tema 532) admitindo a delegação dos atos de fiscalização e consentimento a estatais de capital majoritariamente público.",
          reformulada: {
            enunciado: "É constitucional a delegação do poder de polícia, por meio de lei, a pessoas jurídicas de direito privado integrantes da administração pública indireta de capital social majoritariamente público que prestem exclusivamente serviço público de atuação própria do Estado e em regime não concorrencial.",
            gabarito: "C",
            comentario: "Tese fixada pelo STF no RE 633.782 (Tema 532). A delegação é válida quanto ao consentimento e fiscalização a estatais não concorrenciais.",
            ref: "STF Tema 532 / RE 633.782",
            mecanismo: "V4",
            vacina: "Distinguir empresa pública não concorrencial de particular puro.",
          },
          acaoRecomendada: "reformular",
        };
      },
    },
  });

  // 1. Simular chamada de IA
  const aiResult = await curator.curateWithAI(q, "legislacao_desatualizada", "O STF mudou o entendimento no tema 532");
  assert.ok(aiResult.reformulada);
  assert.match(aiResult.reformulada.enunciado, /constitucional a delegação/);

  // 2. Salvar questão reformulada
  const updated = curator.saveCuratedQuestion("q-201", {
    enunciado: aiResult.reformulada.enunciado,
    gabarito: aiResult.reformulada.gabarito,
    comentario: aiResult.reformulada.comentario,
    ref: aiResult.reformulada.ref,
  }, { S });

  assert.equal(updated, true);
  assert.equal(sets.length, 1);
  assert.equal(sets[0].path, "questoes/q-201");
  assert.equal(S.q.get("q-201").statusEditorial, "reformulada-curadoria");
  assert.match(S.q.get("q-201").enunciado, /constitucional a delegação/);
  assert.equal(S.q.get("q-201").ref, "STF Tema 532 / RE 633.782");
});

test("Solicitação de revisão editorial registra chamado no banco e marca questão", () => {
  const added = [];
  const updates = [];
  const fakeDb = {
    collection(name) {
      return {
        add: async doc => added.push({ collection: name, doc }),
      };
    },
    doc(path) {
      return {
        update: async doc => updates.push({ path, doc }),
      };
    },
  };

  const q = { id: "q-301", cap: "CF-01", enunciado: "Questão dúbia" };
  const S = {
    db: fakeDb,
    q: new Map([["q-301", q]]),
  };

  const curator = loadCurator();
  const res = curator.requestEditorialReview("q-301", "gabarito_incorreto", "A banca inverteu o artigo da lei", { S });
  assert.equal(res, true);

  assert.equal(added.length, 1);
  assert.equal(added[0].collection, "solicitacoes_correcao");
  assert.equal(added[0].doc.questaoId, "q-301");
  assert.equal(added[0].doc.tipoProblema, "gabarito_incorreto");

  assert.equal(updates.length, 1);
  assert.equal(updates[0].path, "questoes/q-301");
  assert.equal(q.statusEditorial, "aguardando-revisao-humana");
});

test("Ambiente de estudo contém botões de curadoria e exclusão e scripts vinculados", () => {
  // 1. Elementos na interface
  assert.match(shellHtml, /question-curator\.css\?v=1/);
  assert.match(shellHtml, /question-curator\.js\?v=2/);
  assert.match(shellHtml, /data-curate-question=/);
  assert.match(shellHtml, /data-delete-question=/);
  assert.match(shellHtml, /window\.QBQuestionCurator\?\.open/);
  assert.match(shellHtml, /window\.QBQuestionCurator\?\.deleteQuestion/);

  // 2. Precache atualizado no Service Worker
  assert.match(swCode, /question-curator\.css\?v=1/);
  assert.match(swCode, /question-curator\.js\?v=2/);
  assert.match(swCode, /qb-static-axon-v[7-9]/);

  // 3. Schema do servidor suporta task curate-question
  assert.match(serverCode, /task: z\.literal\("curate-question"\)/);
  assert.match(serverCode, /data\.task === "curate-question"/);
});
