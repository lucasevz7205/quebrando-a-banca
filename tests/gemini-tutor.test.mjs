import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { invokeGeminiTutor, DEFAULT_TUTOR_GEMINI_MODEL } from "../src/lib/gemini-tutor.js";

test("Gemini: API externa recebe o prompt, modelo e chave somente no header", async () => {
  let seen;
  const result = await invokeGeminiTutor({
    apiKey: "test-secret-not-real",
    prompt: "Pergunta socrática",
    fetchImpl: async (url, opts) => {
      seen = { url, opts };
      return new Response(JSON.stringify({
        candidates: [{ content: { parts: [{ text: "Qual é a regra geral?" }] } }],
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    },
  });
  assert.equal(result.reply, "Qual é a regra geral?");
  assert.equal(result.provider, "gemini");
  assert.match(seen.url, /models\/gemini-3\.5-flash-lite:generateContent$/);
  assert.equal(seen.opts.headers["x-goog-api-key"], "test-secret-not-real");
  assert.ok(!seen.url.includes("test-secret-not-real"));
  assert.ok(!seen.opts.body.includes("test-secret-not-real"));
  assert.equal(JSON.parse(seen.opts.body).contents[0].parts[0].text, "Pergunta socrática");
  assert.equal(DEFAULT_TUTOR_GEMINI_MODEL, "gemini-3.5-flash-lite");
});

test("Gemini: sem chave, não chama qualquer serviço externo", async () => {
  let calls = 0;
  await assert.rejects(invokeGeminiTutor({
    apiKey: "",
    prompt: "teste",
    fetchImpl: async () => { calls++; },
  }), /Chave Gemini ausente/);
  assert.equal(calls, 0);
});

test("Gemini: modelo inválido é recusado sem acesso remoto", async () => {
  let calls = 0;
  await assert.rejects(invokeGeminiTutor({
    apiKey: "teste",
    prompt: "teste",
    model: "../unsafe",
    fetchImpl: async () => { calls++; },
  }), /Modelo Gemini inválido/);
  assert.equal(calls, 0);
});

test("Gemini: limite 429 é erro explícito, sem cobrança via fallback", async () => {
  let calls = 0;
  await assert.rejects(invokeGeminiTutor({
    apiKey: "teste",
    prompt: "teste",
    fetchImpl: async () => { calls++; return new Response("rate limit", { status: 429 }); },
  }), /Limite de uso/);
  assert.equal(calls, 1);
});

test("Gemini: recusa resposta vazia ou bloqueada sem fabricar tutor", async () => {
  await assert.rejects(invokeGeminiTutor({
    apiKey: "teste",
    prompt: "teste",
    fetchImpl: async () => new Response(JSON.stringify({ candidates: [] }), { status: 200 }),
  }), /não retornou texto/);
});

test("Gemini: aborta requisição demorada", async () => {
  await assert.rejects(invokeGeminiTutor({
    apiKey: "teste",
    prompt: "teste",
    timeoutMs: 5,
    fetchImpl: async (_url, opts) => new Promise((_resolve, reject) => {
      opts.signal.addEventListener("abort", () => reject(new Error("AbortError")), { once: true });
    }),
  }), /Tempo limite/);
});

test("Arquiteto preserva regras pedagógicas e modo Base44 por padrão", () => {
  const source = readFileSync(new URL("../src/lib/omnistudy-ai.js", import.meta.url), "utf8");
  assert.match(source, /TUTOR_RULES/);
  for (const mode of ["socratic", "exam", "simple", "challenge"]) assert.match(source, new RegExp(mode + ":"));
  assert.match(source, /secrets\.get\("QB_TUTOR_PROVIDER"\) === "gemini"/);
  assert.match(source, /const reply = await core\.InvokeLLM\(\{ prompt \}\)/);
  assert.match(source, /return invokeGeminiTutor/);
});
