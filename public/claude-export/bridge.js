/* Quebrando a Banca: adapter do runtime Claude para os dados privados do Base44.
 * Apenas a página autenticada /estudar responde a este iframe.
 * Nenhum histórico pessoal é incluído em arquivos públicos.
 */
(() => {
  "use strict";
  const FLAG = "__qb44_bridge_v1__";
  // A sandboxed preview has an opaque origin, but resolves relative assets
  // against the embedding document's base URL.
  const origin = window.origin === "null" ? new URL(document.baseURI).origin : window.origin;
  let seq = 0;
  const pending = new Map();
  const listeners = new Map();
  const updating = new Set();

  window.addEventListener("message", event => {
    if (event.origin !== origin || event.source !== window.parent) return;
    const msg = event.data;
    if (!msg || msg.flag !== FLAG) return;
    if (msg.streamOf) {
      pending.get(msg.streamOf)?.onDelta?.(String(msg.delta || ""));
      return;
    }
    if (!msg.responseTo) return;
    const p = pending.get(msg.responseTo);
    if (!p) return;
    pending.delete(msg.responseTo);
    clearTimeout(p.timer);
    if (msg.ok) p.resolve(msg.value);
    else p.reject(new Error(msg.error || "Erro ao acessar o Base44."));
  });

  function ask(action, args, { onDelta } = {}) {
    if (!window.parent || window.parent === window) {
      return Promise.reject(new Error("Abra o aplicativo por /estudar, após entrar em sua conta."));
    }
    return new Promise((resolve, reject) => {
      const id = `req-${Date.now()}-${++seq}`;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error("Não houve resposta do Base44. Recarregue a página Estudar."));
      }, action === "generateStudyTopic" ? 300000 : 90000);
      pending.set(id, { resolve, reject, timer, onDelta });
      window.parent.postMessage({ flag: FLAG, id, action, args }, origin);
    });
  }

  async function refresh(collection) {
    if (updating.has(collection)) return;
    const subs = listeners.get(collection);
    if (!subs?.size) return;
    updating.add(collection);
    try {
      for (const entry of subs) {
        const docs = await ask("list", {
          collection,
          order: entry.order,
          direction: entry.direction,
          limit: entry.max,
        });
        entry.callback({ docs: docs.map(item => ({
          id: item.id,
          data: () => item,
        })) });
      }
    } catch (error) {
      for (const entry of subs) if (entry.onError) entry.onError(error);
    } finally {
      updating.delete(collection);
    }
  }

  function collectionApi(name, sort = null, direction = "asc", max = null) {
    return {
      orderBy(field, dir = "asc") { return collectionApi(name, field, dir, max); },
      limit(n) { return collectionApi(name, sort, direction, n); },
      onSnapshot(callback, onError) {
        const entry = { callback, onError, order: sort, direction, max };
        if (!listeners.has(name)) listeners.set(name, new Set());
        listeners.get(name).add(entry);
        ask("list", { collection: name, order: sort, direction, limit: max })
          .then(docs => callback({ docs: docs.map(item => ({ id: item.id, data: () => item })) }))
          .catch(error => { if (onError) onError(error); else console.error("Base44", error); });
        return () => listeners.get(name)?.delete(entry);
      },
    };
  }

  const db = {
    collection: name => collectionApi(name),
    doc(path) {
      return {
        async set(value) {
          const result = await ask("write", { path, operation: "set", value });
          void refresh(String(path).split("/")[0]);
          return result;
        },
        async update(value) {
          const result = await ask("write", { path, operation: "update", value });
          void refresh(String(path).split("/")[0]);
          return result;
        },
      };
    },
  };

  window.QBBridge = { ask, refresh };

  window.claude = {
    use: async feature => {
      if (feature === "db") return db;
      if (feature === "sample") {
        throw new Error("Correção por IA desligada para evitar consumo de créditos; use a autocorreção manual.");
      }
      return null;
    },
  };
})();
