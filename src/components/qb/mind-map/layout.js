// Partition each branch into angular slots according to its descendant leaves.
export function placeMap(graph) {
  const tree = new Map([["root", []]]);
  for (const node of graph.nodes) tree.set(node.path, []);
  for (const node of graph.nodes) tree.get(node.parent)?.push(node);
  const roots = tree.get("root");
  const positions = [{ path: "root", title: graph.title, branch: -1, depth: 0, x: 0, y: 0, z: 0 }];
  const weights = new Map();
  function weight(node) {
    const n = tree.get(node.path).reduce((sum, child) => sum + weight(child), 0) || 1;
    weights.set(node.path, n);
    return n;
  }
  function visit(node, depth, a, b, branchAngle) {
    const angle = (a + b) / 2;
    const radius = 2.8 + (depth - 1) * 1.62;
    positions.push({ ...node, depth, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius,
      z: Math.sin(branchAngle * 1.5 + depth * .72) * Math.min(2.8, radius * .34) });
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
