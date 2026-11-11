import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const shell = fs.readFileSync("src/components/qb/study-shell.html", "utf8");
const rootRoute = fs.readFileSync("src/routes/__root.jsx", "utf8");
const estudiarRoute = fs.readFileSync("src/routes/_authed/estudar.jsx", "utf8");
const manifestRaw = fs.readFileSync("public/manifest.webmanifest", "utf8");
const swCode = fs.readFileSync("public/sw.js", "utf8");
const iconSvg = fs.readFileSync("public/qb-icon.svg", "utf8");
const offlineJs = fs.readFileSync("public/claude-export/offline-sync.js", "utf8");
const offlineCss = fs.readFileSync("public/claude-export/offline-sync.css", "utf8");
const axonJs = fs.readFileSync("public/claude-export/axon-shell.js", "utf8");
const axonCss = fs.readFileSync("public/claude-export/axon-shell.css", "utf8");

test("PWA está configurado com manifesto standalone, ícone vetorial, meta tags iOS e Service Worker seguro", () => {
  const manifest = JSON.parse(manifestRaw);
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/estudar");
  assert.equal(manifest.background_color, "#0E0E10");
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0);
  assert.ok(Array.isArray(manifest.shortcuts) && manifest.shortcuts.length >= 3);
  assert.match(iconSvg, /<svg[\s\S]*QB<\/text>/);
  assert.match(rootRoute, /apple-mobile-web-app-capable/);
  assert.match(rootRoute, /\/manifest\.webmanifest/);
  assert.match(estudiarRoute, /serviceWorker\.register\("\/sw\.js", \{ updateViaCache: "none" \}\)/);
  assert.match(swCode, /isSafeStaticAsset/);
  assert.match(swCode, /url\.pathname\.startsWith\("\/api\/"\)/);
});

test("Modo Academia grava localmente antes de enviar à nuvem, funciona offline e sincroniza ao reconectar", async () => {
  const storageMap = new Map();
  const sandbox = {
    navigator: { onLine: true },
    localStorage: {
      getItem: k => storageMap.get(k) || null,
      setItem: (k, v) => storageMap.set(k, String(v)),
    },
    QBBridge: {
      calls: [],
      failNetwork: false,
      async ask(action, args) {
        this.calls.push({ action, args });
        if (this.failNetwork) throw new Error("Falha de rede simulada na academia");
        if (action === "account") return { legacy: true };
        if (action === "list") return [{ id: "q1", marcada: "C", tentativas: 1 }];
        if (action === "write") return { ok: true, id: args.path.split("/")[1] };
        return null;
      },
    },
  };
  vm.runInNewContext(offlineJs, sandbox, { filename: "offline-sync.js" });
  const api = sandbox.QBAcademiaOffline;
  assert.ok(api);

  // 1. Carrega conta e lista inicial online (salva snapshot local)
  const acc = await sandbox.QBBridge.ask("account");
  assert.equal(acc.legacy, true);
  const initialDocs = await sandbox.QBBridge.ask("list", { collection: "respostas" });
  assert.equal(initialDocs.length, 1);

  // 2. Simula queda de sinal na academia
  sandbox.QBBridge.failNetwork = true;
  api.setOnlineForTest(false);

  // Grava uma resposta em modo offline -> deve salvar na fila local sem lançar erro
  const writeRes = await sandbox.QBBridge.ask("write", {
    path: "respostas/q2",
    operation: "set",
    value: { qid: "q2", ultimaMarcada: "E", tentativas: 1 },
  });
  assert.equal(writeRes.ok, true);
  assert.equal(writeRes.localQueued, true);

  const stOffline = await api.currentState();
  assert.equal(stOffline.pendingCount, 1);
  assert.equal(stOffline.status, "offline-pending");

  // Leitura offline deve retornar o snapshot + o item pendente da fila local!
  const offlineDocs = await sandbox.QBBridge.ask("list", { collection: "respostas" });
  assert.equal(offlineDocs.length, 2);
  assert.equal(offlineDocs.find(d => d.id === "q2")?.ultimaMarcada, "E");

  // 3. Sinal retorna -> flushOutbox envia para a nuvem e zera pendências
  sandbox.QBBridge.failNetwork = false;
  api.setOnlineForTest(true);
  const stSynced = await sandbox.QBBridge.flushOutbox();
  assert.equal(stSynced.pendingCount, 0);
  assert.equal(stSynced.status, "synced");
});

test("Unificação AXON decora abas superiores com micro-anéis, cores de setor, Modo Cockpit e Gaveta Radial", () => {
  assert.match(shell, /offline-sync\.css\?v=1/);
  assert.match(shell, /offline-sync\.js\?v=1/);
  assert.match(shell, /axon-shell\.css\?v=1/);
  assert.match(shell, /axon-shell\.js\?v=1/);

  for (const token of [
    "--axon-painel: #ff9571",
    "--axon-edital: #d998ff",
    "--axon-treinar: #8da2ff",
    "--axon-estudo: #49d7fb",
    "--axon-simulado: #44c5ff",
    "--axon-historico: #b4a2ff",
    ".qb-nav-orb",
    ".qb-nav-flow-canvas",
    "header.top.qb-app-header[data-cockpit=\"true\"]",
    ".qb-quick-radial-backdrop",
    "@media (prefers-reduced-motion: reduce)"
  ]) {
    assert.ok(axonCss.includes(token), token);
  }
  assert.ok(offlineCss.includes(".qb-sync-pill"));

  const sandbox = {};
  vm.runInNewContext(axonJs, sandbox, { filename: "axon-shell.js" });
  assert.ok(sandbox.QBAxonShell);
  assert.equal(Object.keys(sandbox.QBAxonShell.TAB_META).length, 7);
});

test("Estúdio Cognitivo OmniStudy AI 2.0 integra Tutor Socrático, Feynman, Cornell, SRS, Scanner e Web Audio Procedural", async () => {
  const omniJs = fs.readFileSync("public/claude-export/omnistudy-ai.js", "utf8");
  const omniCss = fs.readFileSync("public/claude-export/omnistudy-ai.css", "utf8");
  const omniServer = fs.readFileSync("src/lib/omnistudy-ai.js", "utf8");

  assert.match(shell, /omnistudy-ai\.css\?v=1/);
  assert.match(shell, /omnistudy-ai\.js\?v=1/);
  assert.match(estudiarRoute, /invokeOmniStudyAI/);
  assert.match(omniServer, /middleware\(\[requireUser\]\)/);
  assert.match(omniServer, /tutor-chat/);
  assert.match(omniServer, /feynman-evaluate/);
  assert.match(omniServer, /summarize-cornell/);
  assert.match(omniServer, /scan-note/);
  assert.ok(omniCss.includes(".omni-cornell-sheet"));

  const sandbox = { window: {} };
  vm.runInNewContext(omniJs, sandbox, { filename: "omnistudy-ai.js" });
  const omni = sandbox.QBOmniStudy || sandbox.window.QBOmniStudy;
  assert.ok(omni);
  assert.equal(omni.version, "2.0.0");
  assert.equal(typeof omni.soundEngine.playAmbient, "function");

  const evalFallback = await omni.callOmniStudyBackend({
    task: "feynman-evaluate",
    topic: "Delegação vs Avocação",
    explanation: "Delegação transfere o exercício, mas não a titularidade, salvo atos exclusivos.",
  });
  assert.ok(evalFallback.score >= 60);
  assert.ok(Array.isArray(evalFallback.reflectiveQuestions));
});
