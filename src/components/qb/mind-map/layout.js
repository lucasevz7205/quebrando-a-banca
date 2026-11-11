/* Profundidade semântica: fixa por status de domínio, nunca aleatória. */
export const STATUS_DEPTH = Object.freeze({
  deficiente: 1.6,
  "bom-sem-retencao": 1.1,
  "em-desenvolvimento": .8,
  "amostra-insuficiente": .3,
  "sem-evidencia": 0,
  forte: -.8,
});
export function statusDepth(status) {
  return STATUS_DEPTH[status] ?? 0;
}

// Partition each branch into angular slots according to its descendant leaves.
export function placeMap(graph) {
  const tree = new Map([["root", []]]);
  for (const node of graph.nodes) tree.set(node.path, []);
  for (const node of graph.nodes) tree.get(node.parent)?.push(node);
  const roots = tree.get("root");
  const positions = [{ path: "root", title: graph.title, branch: -1, status: graph.rootStatus, statusLabel: graph.rootStatusLabel, percentual: graph.rootPercentual, respondidas: graph.rootRespondidas, questoes: graph.rootQuestoes, flashcards: graph.rootFlashcards, flashcardsAvaliados: graph.rootFlashcardsAvaliados, flashcardsLembrados: graph.rootFlashcardsLembrados, depth: 0, x: 0, y: 0, z: 0 }];
  const weights = new Map();
  function weight(node) {
    const n = tree.get(node.path).reduce((sum, child) => sum + weight(child), 0) || 1;
    weights.set(node.path, n);
    return n;
  }
  function visit(node, depth, a, b, branchAngle) {
    const angle = (a + b) / 2;
    // Wide, stable radial bands. Each level occupies its own navigable ring.
    const radius = 4.7 + (depth - 1) * 3.35 + Math.pow(Math.max(0, depth - 1), 1.15) * .23;
    // 2,5D (11/11/2026): o plano XY guarda a estrutura do mapa; a profundidade
    // só codifica o diagnóstico (o que precisa de reforço fica mais perto do estudante).
    positions.push({ ...node, depth, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius,
      z: statusDepth(node.status) });
    let start = a;
    const children = tree.get(node.path), total = children.reduce((sum, child) => sum + weights.get(child.path), 0);
    for (const child of children) {
      const end = start + (b - a) * weights.get(child.path) / total;
      visit(child, depth + 1, start, end, branchAngle);
      start = end;
    }
  }
  const sector = 2 * Math.PI / Math.max(1, roots.length);
  roots.forEach((root, i) => {
    weight(root);
    const middle = Math.PI / 2 - i * sector;
    const span = Math.min(sector * .45, 1.04);
    visit(root, 1, middle - span, middle + span, middle);
  });
  return positions;
}
