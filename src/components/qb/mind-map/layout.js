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
  function visit(node, depth, a, b, branchAngle, siblingIndex = 0, siblings = 1) {
    const angle = (a + b) / 2;
    // Wide, stable radial bands. Each level occupies its own navigable ring.
    const radius = 4.7 + (depth - 1) * 3.35 + Math.pow(Math.max(0, depth - 1), 1.15) * .23;
    // Dense sibling groups also fan out in depth, so nodes do not share
    // nearly identical mouse hit areas when the angular sector is narrow.
    const siblingSpread = Math.min(11, Math.max(2.4, siblings * .95));
    const siblingZ = siblings > 1 ? (siblingIndex / (siblings - 1) - .5) * siblingSpread : 0;
    const branchZ = Math.sin(branchAngle * 1.35 + depth * .45) * Math.min(2.4, radius * .24);
    positions.push({ ...node, depth, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius,
      z: branchZ + siblingZ });
    let start = a;
    const children = tree.get(node.path), total = children.reduce((sum, child) => sum + weights.get(child.path), 0);
    for (const [index,child] of children.entries()) {
      const end = start + (b - a) * weights.get(child.path) / total;
      visit(child, depth + 1, start, end, branchAngle, index, children.length);
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
