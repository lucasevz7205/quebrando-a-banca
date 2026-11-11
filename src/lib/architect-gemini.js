/* Integração opcional do Arquiteto com a API oficial do Google Gemini.
 * Credencial exclusivamente no servidor. Nunca fazer fallback silencioso
 * para outro provedor que possa gerar cobrança inesperada.
 */
export const ARCHITECT_GEMINI_MODEL = "gemini-3.5-flash";
export function buildGeminiRequest({prompt,response_json_schema}){
  const input=String(prompt||"").slice(0,36000);
  if(!input.trim())throw new Error("Prompt vazio para o Gemini.");
  return {
    contents:[{role:"user",parts:[{text:input}]}],
    generationConfig:{
      maxOutputTokens:8192,
      ...(response_json_schema?{responseMimeType:"application/json"}:{})
    }
  };
}
export function extractGeminiResponse(raw){
  if(raw?.error)throw new Error("Gemini retornou erro: "+String(raw.error.message||"resposta inválida").slice(0,250));
  const text=(raw?.candidates?.[0]?.content?.parts||[]).filter(x=>typeof x.text==="string").map(x=>x.text).join("").trim();
  if(!text)throw new Error("Gemini não retornou texto. Confira cotas, permissões e o modelo configurado.");
  return text;
}
export async function requestGemini({key,prompt,response_json_schema,fetcher=fetch,model=ARCHITECT_GEMINI_MODEL}){
  if(!key||typeof key!=="string")throw new Error("Gemini não conectado. Configure a credencial GEMINI_API_KEY nos Secrets do Base44.");
  if(!/^[a-z0-9.-]{3,64}$/.test(model))throw new Error("Modelo Gemini inválido.");
  const timeout=AbortSignal.timeout(40000);
  const response=await fetcher("https://generativelanguage.googleapis.com/v1beta/models/"+model+":generateContent",{
    method:"POST",
    headers:{"Content-Type":"application/json","x-goog-api-key":key},
    body:JSON.stringify(buildGeminiRequest({prompt,response_json_schema})),
    signal:timeout
  });
  if(!response.ok){
    const body=await response.json().catch(()=>({}));
    // Evite exibir payload ou credenciais em erros.
    const code=response.status;
    const reason=code===401||code===403?"Credencial Gemini inválida ou sem permissão.":
      code===429?"Cota Gemini excedida. Confira limites e faturamento.": 
      code===404?"Modelo Gemini indisponível no seu projeto.": 
      "Falha do serviço Gemini (HTTP "+code+").";
    throw new Error(reason+(body?.error?.status?" ["+String(body.error.status).slice(0,35)+"]":""));
  }
  return extractGeminiResponse(await response.json());
}
