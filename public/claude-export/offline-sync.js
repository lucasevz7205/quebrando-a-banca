/* Quebrando a Banca · Modo Academia (Offline-First & Fila Persistente Local)
 * Prioridade: SALVAR LOCALMENTE ANTES DE ENVIAR À NUVEM.
 * Isola dados por escopo de conta, mantém fila idempotente em IndexedDB (com fallback
 * em memória/localStorage) e sincroniza automaticamente ao retomar sinal ou abrir o app.
 */
(function (root) {
  "use strict";

  const DB_NAME = "qb_academia_offline_v1";
  const DB_VERSION = 1;
  const FALLBACK_KEY = "qb_academia_outbox_v1";
  let accountScope = "default";
  let syncing = false;
  let onlineState = typeof navigator !== "undefined" ? navigator.onLine !== false : true;
  let deferredInstallPrompt = null;
  const memorySnapshots = new Map();
  const memoryOutbox = new Map();
  const statusListeners = new Set();

  function safeParse(json, fallback) {
    try { return JSON.parse(json); } catch { return fallback; }
  }

  function loadFallbackOutbox() {
    try {
      const raw = root.localStorage?.getItem(FALLBACK_KEY);
      const list = safeParse(raw, []);
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item && item.key) memoryOutbox.set(item.key, item);
        }
      }
    } catch {}
  }

  function saveFallbackOutbox() {
    try {
      const items = [...memoryOutbox.values()];
      root.localStorage?.setItem(FALLBACK_KEY, JSON.stringify(items.slice(-500)));
    } catch {}
  }

  function openDB() {
    if (!root.indexedDB) return Promise.resolve(null);
    return new Promise(resolve => {
      try {
        const req = root.indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains("outbox")) {
            db.createObjectStore("outbox", { keyPath: "key" });
          }
          if (!db.objectStoreNames.contains("snapshots")) {
            db.createObjectStore("snapshots", { keyPath: "key" });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  async function putOutboxRecord(record) {
    memoryOutbox.set(record.key, record);
    saveFallbackOutbox();
    const db = await openDB();
    if (!db) return record;
    return new Promise(resolve => {
      try {
        const tx = db.transaction("outbox", "readwrite");
        tx.objectStore("outbox").put(record);
        tx.oncomplete = () => resolve(record);
        tx.onerror = () => resolve(record);
      } catch {
        resolve(record);
      }
    });
  }

  async function deleteOutboxRecord(key) {
    memoryOutbox.delete(key);
    saveFallbackOutbox();
    const db = await openDB();
    if (!db) return;
    return new Promise(resolve => {
      try {
        const tx = db.transaction("outbox", "readwrite");
        tx.objectStore("outbox").delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  async function listOutboxRecords(scope = accountScope) {
    const db = await openDB();
    if (db) {
      await new Promise(resolve => {
        try {
          const tx = db.transaction("outbox", "readonly");
          const req = tx.objectStore("outbox").getAll();
          req.onsuccess = () => {
            for (const item of req.result || []) {
              if (item && item.key) memoryOutbox.set(item.key, item);
            }
            resolve();
          };
          req.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    }
    return [...memoryOutbox.values()]
      .filter(item => !scope || item.scope === scope)
      .sort((a, b) => (a.updatedAt || 0) - (b.updatedAt || 0));
  }

  async function putSnapshot(collection, docs, scope = accountScope) {
    const key = `${scope}:${collection}`;
    const record = { key, scope, collection, updatedAt: Date.now(), docs };
    memorySnapshots.set(key, record);
    const db = await openDB();
    if (!db) return;
    return new Promise(resolve => {
      try {
        const tx = db.transaction("snapshots", "readwrite");
        tx.objectStore("snapshots").put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  async function getSnapshot(collection, scope = accountScope) {
    const key = `${scope}:${collection}`;
    const db = await openDB();
    if (db) {
      const fromDb = await new Promise(resolve => {
        try {
          const tx = db.transaction("snapshots", "readonly");
          const req = tx.objectStore("snapshots").get(key);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      });
      if (fromDb && Array.isArray(fromDb.docs)) {
        memorySnapshots.set(key, fromDb);
        return fromDb.docs;
      }
    }
    return memorySnapshots.get(key)?.docs || null;
  }

  function mergePendingIntoCollection(collection, docs, pendingList) {
    const byId = new Map((docs || []).map(d => [d.id, { ...d }]));
    for (const item of pendingList) {
      if (!item || typeof item.path !== "string") continue;
      const slash = item.path.indexOf("/");
      if (slash <= 0) continue;
      const col = item.path.slice(0, slash);
      const id = item.path.slice(slash + 1);
      if (col !== collection || !id) continue;
      if (item.operation === "update") {
        const prev = byId.get(id) || { id };
        byId.set(id, { ...prev, ...(item.value || {}), id });
      } else {
        byId.set(id, { ...(item.value || {}), id });
      }
    }
    return [...byId.values()];
  }

  async function currentState() {
    const pending = await listOutboxRecords(accountScope);
    const count = pending.length;
    let status = "synced";
    let label = "Sincronizado";
    if (syncing) {
      status = "syncing";
      label = count ? `Sincronizando (${count})…` : "Sincronizando…";
    } else if (!onlineState && count > 0) {
      status = "offline-pending";
      label = `Salvo no aparelho (${count})`;
    } else if (!onlineState) {
      status = "offline";
      label = "Modo Academia · Offline";
    } else if (count > 0) {
      status = "pending";
      label = `Sincronização pendente (${count})`;
    }
    return { status, label, pendingCount: count, online: onlineState, syncing };
  }

  async function notifyStatus() {
    const st = await currentState();
    updateBadgeUI(st);
    for (const fn of statusListeners) {
      try { fn(st); } catch {}
    }
    return st;
  }

  function updateBadgeUI(st) {
    if (typeof document === "undefined") return;
    const btn = document.getElementById("qb-sync-status");
    if (!btn) return;
    btn.dataset.syncState = st.status;
    const labelEl = btn.querySelector("[data-sync-label]");
    if (labelEl) labelEl.textContent = st.label;
    else btn.textContent = st.label;
    btn.title = st.pendingCount > 0
      ? `${st.pendingCount} registro(s) salvo(s) neste aparelho. Clique para sincronizar agora.`
      : "Modo Academia ativo: suas respostas são salvas localmente antes de enviar à nuvem.";
  }

  function mergeWriteRecord(prev, operation, value, scope, path) {
    const key = `${scope}:${path}`;
    const now = Date.now();
    if (prev && operation === "update") {
      return {
        key,
        scope,
        path,
        operation: prev.operation === "set" ? "set" : "update",
        value: { ...(prev.value || {}), ...(value || {}) },
        updatedAt: now,
        attempts: prev.attempts || 0
      };
    }
    return {
      key,
      scope,
      path,
      operation,
      value: { ...(value || {}) },
      updatedAt: now,
      attempts: 0
    };
  }

  function installBridgeInterceptor(rawAsk) {
    if (typeof rawAsk !== "function") return null;

    async function flushOutbox() {
      if (syncing) return currentState();
      const queue = await listOutboxRecords(accountScope);
      if (!queue.length) return notifyStatus();
      syncing = true;
      await notifyStatus();
      try {
        for (const item of queue) {
          try {
            await rawAsk("write", {
              path: item.path,
              operation: item.operation,
              value: item.value
            });
            await deleteOutboxRecord(item.key);
            onlineState = true;
          } catch (err) {
            const msg = String(err?.message || "");
            // Se o evento pedagógico já foi gravado anteriormente, considera idempotente e limpa da fila.
            if (/Evento já registrado/i.test(msg)) {
              await deleteOutboxRecord(item.key);
              continue;
            }
            item.attempts = (item.attempts || 0) + 1;
            item.lastError = msg;
            await putOutboxRecord(item);
            break;
          }
        }
      } finally {
        syncing = false;
      }
      return notifyStatus();
    }

    async function wrappedAsk(action, args, options) {
      if (action === "account") {
        try {
          const acc = await rawAsk(action, args, options);
          accountScope = acc?.legacy ? "legacy" : `acc:${acc?.name || "candidate"}`;
          try {
            root.localStorage?.setItem("qb_academia_last_account", JSON.stringify({
              scope: accountScope,
              account: acc
            }));
          } catch {}
          void flushOutbox();
          return acc;
        } catch (err) {
          const cached = safeParse(root.localStorage?.getItem("qb_academia_last_account"), null);
          if (cached?.account) {
            accountScope = cached.scope || "default";
            onlineState = false;
            void notifyStatus();
            return cached.account;
          }
          throw err;
        }
      }

      if (action === "list" && args?.collection) {
        try {
          const docs = await rawAsk(action, args, options);
          onlineState = true;
          if (Array.isArray(docs)) {
            await putSnapshot(args.collection, docs, accountScope);
            const pending = await listOutboxRecords(accountScope);
            void notifyStatus();
            return pending.length
              ? mergePendingIntoCollection(args.collection, docs, pending)
              : docs;
          }
          return docs;
        } catch (err) {
          const cachedDocs = await getSnapshot(args.collection, accountScope);
          if (cachedDocs) {
            onlineState = false;
            const pending = await listOutboxRecords(accountScope);
            void notifyStatus();
            return mergePendingIntoCollection(args.collection, cachedDocs, pending);
          }
          throw err;
        }
      }

      if (action === "write" && args?.path) {
        const key = `${accountScope}:${args.path}`;
        const existing = memoryOutbox.get(key) || null;
        const record = mergeWriteRecord(existing, args.operation, args.value, accountScope, args.path);
        // Fase 1: Grava primeiro na fila local persistente antes de enviar à nuvem!
        await putOutboxRecord(record);
        await notifyStatus();

        if (!onlineState) {
          return {
            ok: true,
            id: String(args.path).split("/")[1] || args.path,
            localQueued: true
          };
        }

        try {
          const res = await rawAsk(action, args, options);
          await deleteOutboxRecord(key);
          onlineState = true;
          // Aproveita conexão estável para drenar eventuais pendências anteriores
          void flushOutbox();
          return res;
        } catch (err) {
          const msg = String(err?.message || "");
          // Erros de validação ou permissão de visualização não devem fingir sucesso
          if (/Visualização somente leitura|Operação inválida|Caminho inválido|Coleção não permitida|Documento inválido/i.test(msg)) {
            await deleteOutboxRecord(key);
            await notifyStatus();
            throw err;
          }
          onlineState = false;
          await notifyStatus();
          return {
            ok: true,
            id: String(args.path).split("/")[1] || args.path,
            localQueued: true
          };
        }
      }

      return rawAsk(action, args, options);
    }

    return { ask: wrappedAsk, flushOutbox };
  }

  function mountUI(flushFn) {
    if (typeof document === "undefined") return;
    const utilities = document.querySelector(".qb-header-utilities");
    if (!utilities || document.getElementById("qb-sync-status")) return;

    const syncBtn = document.createElement("button");
    syncBtn.type = "button";
    syncBtn.id = "qb-sync-status";
    syncBtn.className = "theme-b qb-utility-action qb-sync-pill";
    syncBtn.dataset.syncState = "synced";
    syncBtn.setAttribute("aria-live", "polite");
    syncBtn.innerHTML = '<span class="qb-sync-dot" aria-hidden="true"></span><span data-sync-label>Sincronizado</span>';
    syncBtn.addEventListener("click", () => {
      if (flushFn) void flushFn();
    });

    const installBtn = document.createElement("button");
    installBtn.type = "button";
    installBtn.id = "qb-pwa-install";
    installBtn.className = "theme-b qb-utility-action qb-pwa-install-btn";
    installBtn.hidden = true;
    installBtn.textContent = "Instalar App";
    installBtn.addEventListener("click", async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      try { await deferredInstallPrompt.userChoice; } catch {}
      deferredInstallPrompt = null;
      installBtn.hidden = true;
    });

    const countdown = document.getElementById("countdown");
    if (countdown && countdown.nextSibling) {
      utilities.insertBefore(syncBtn, countdown.nextSibling);
      utilities.insertBefore(installBtn, syncBtn.nextSibling);
    } else {
      utilities.prepend(syncBtn);
    }

    void notifyStatus();
  }

  function registerPWA() {
    if (typeof window === "undefined") return;
    window.addEventListener("beforeinstallprompt", e => {
      e.preventDefault();
      deferredInstallPrompt = e;
      const btn = document.getElementById("qb-pwa-install");
      if (btn) btn.hidden = false;
    });
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      });
    }
  }

  function init() {
    loadFallbackOutbox();
    let controller = null;
    if (root.QBBridge && typeof root.QBBridge.ask === "function" && !root.QBBridge.__academiaWrapped) {
      const originalAsk = root.QBBridge.ask.bind(root.QBBridge);
      controller = installBridgeInterceptor(originalAsk);
      root.QBBridge.ask = controller.ask;
      root.QBBridge.flushOutbox = controller.flushOutbox;
      root.QBBridge.__academiaWrapped = true;
    }

    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        onlineState = true;
        if (controller?.flushOutbox) void controller.flushOutbox();
        else void notifyStatus();
      });
      window.addEventListener("offline", () => {
        onlineState = false;
        void notifyStatus();
      });
    }
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden && onlineState && controller?.flushOutbox) {
          void controller.flushOutbox();
        }
      });
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => mountUI(controller?.flushOutbox));
      } else {
        mountUI(controller?.flushOutbox);
      }
    }
    registerPWA();
    return controller;
  }

  const activeController = init();

  root.QBAcademiaOffline = {
    init,
    installBridgeInterceptor,
    listOutboxRecords,
    putSnapshot,
    getSnapshot,
    mergePendingIntoCollection,
    currentState,
    flushOutbox: () => activeController?.flushOutbox?.() || Promise.resolve(null),
    onStatusChange(fn) {
      statusListeners.add(fn);
      return () => statusListeners.delete(fn);
    },
    setScope(scope) {
      accountScope = String(scope || "default");
    },
    setOnlineForTest(flag) {
      onlineState = Boolean(flag);
    },
    clearAllForTest() {
      memoryOutbox.clear();
      memorySnapshots.clear();
      saveFallbackOutbox();
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
