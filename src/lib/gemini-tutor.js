/**
 * Adaptador de texto do Tutor Omni para a API Gemini.
 * Sem dependência do SDK Base44, sem efeitos no banco e sem segredo no cliente.
 * Só deve ser invocado a partir de funções autenticadas do servidor.
 */
export const DEFAULT_TUTOR_GEMINI_MODEL = "gemini-3.5-flash-lite";

export async function invokeGeminiTutor({
  apiKey,
  prompt,
  model = DEFAULT_TUTOR_GEMINI_MODEL,
  fetchImpl = fetch,
  timeoutMs = 30000,
}) {
  if (typeof apiKey !== "string" || !apiKey.trim()) {
    throw new Error("Chave Gemini ausente. Confira o segredo Arquiteto (ou ARQUITETO/GEMINI_API_KEY) na Base44.");
  }
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 100000) {
    throw new Error("Contexto do tutor inválido ou excessivamente longo.");
  }
  if (!/^gemini-[a-z0-9.-]{3,60}$/.test(model)) {
    throw new Error("Modelo Gemini inválido. Verifique QB_GEMINI_MODEL.");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1800 },
        }),
        signal: controller.signal,
      }
    );
    // Não repassar payload de erro da API: pode conter conteúdo de solicitação.
    if (!response.ok) {
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        throw new Error("Gemini recusou a requisição. Verifique a chave, o modelo e as permissões do projeto.");
      }
      if (response.status === 429) {
        throw new Error("Limite de uso do Gemini atingido. Tente novamente após conferir as cotas.");
      }
      throw new Error(`Falha na API Gemini (HTTP ${response.status}). A Base44 não será acionada como fallback.`);
    }
    const data = await response.json();
    const reply = (data?.candidates?.[0]?.content?.parts || [])
      .filter(part => typeof part?.text === "string")
      .map(part => part.text)
      .join("\n")
      .trim();
    if (!reply) {
      throw new Error("O Gemini não retornou texto. Nenhum fallback com créditos Base44 foi realizado.");
    }
    return { reply: reply.slice(0, 12000), provider: "gemini" };
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("Tempo limite do Gemini excedido. Nenhum fallback com créditos Base44 foi realizado.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
