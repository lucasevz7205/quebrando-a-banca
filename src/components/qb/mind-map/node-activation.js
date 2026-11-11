/* Seleção e abertura de conceitos (11/11/2026).
 * 1º toque/clique: seleciona. Tocar de novo no conceito JÁ selecionado abre a
 * explicação (ou a evocação), sem depender de tempo: funciona no celular com
 * toques lentos. O duplo clique rápido do mouse continua valendo.
 * Ativação por teclado (detail 0) só seleciona; o botão "Evocar/Expandir
 * conceito" continua como alternativa acessível.
 */
export const DOUBLE_CLICK_MS = 350;
export function createNodeActivation(onSelect,{doubleClickMs=DOUBLE_CLICK_MS}={}){
  let previousPath=null, previousAt=-Infinity, selectedPath=null;
  return function activate(path,event){
    const clicks=Number(event?.detail)||0;
    const now=Number.isFinite(event?.timeStamp)?event.timeStamp:0;
    const quick=previousPath===path && now>previousAt && now-previousAt<doubleClickMs;
    const again=clicks>0 && selectedPath===path;
    const double=clicks>=2 || (clicks>0 && quick) || again;
    if(clicks>0) {
      previousPath=double?null:path;
      previousAt=now;
    } else {
      previousPath=null;
      previousAt=-Infinity;
    }
    // depois de abrir, o próximo toque volta a só selecionar; teclado não arma o 'tocar de novo'
    selectedPath=double||clicks===0?null:path;
    onSelect(path,true,double);
    return double;
  };
}
