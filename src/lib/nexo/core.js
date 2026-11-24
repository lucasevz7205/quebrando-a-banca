// NEXO: deterministic, isolated learning evidence engine.
// No persistence, runtime AI, UI imports or scheduler writes.
// Only trusted server-assessed events may enter this engine in a future integration.
const TYPES = new Set(['is_a','part_of','contrasts_with','exception_to','depends_on','causes','precedes','exemplifies','equivalent_to']);
const CRITICAL = new Set(['contrasts_with','exception_to','depends_on']);
const MODES = new Set(['recognition','cued','free']);
const STATUSES = new Set(['approved','draft','retired']);
const id = value => typeof value === 'string' && value.trim().length > 0;
const requireValue = (condition, message) => { if (!condition) throw new Error(message); };
const sourceRefs = refs => Array.isArray(refs) && refs.length > 0 && refs.every(id);
export const defaults = Object.freeze({depth:1, fanOut:7, limit:5, decay:0.5});
export function validateGraph(graph) {
  requireValue(id(graph?.version) && Array.isArray(graph.nodes) && Array.isArray(graph.edges), 'Invalid graph');
  const nodes = new Map();
  const edges = new Map();
  for (const n of graph.nodes) {
    requireValue(id(n.id) && !nodes.has(n.id) && id(n.label) && sourceRefs(n.sourceRefs), 'Invalid node');
    nodes.set(n.id, n);
  }
  for (const e of graph.edges) {
    requireValue(id(e.id) && !edges.has(e.id) && nodes.has(e.from) && nodes.has(e.to) && e.from !== e.to &&
      TYPES.has(e.type) && STATUSES.has(e.status) && id(e.proposition) && sourceRefs(e.sourceRefs) &&
      Number.isFinite(e.weight) && e.weight >= 0 && e.weight <= 1, 'Invalid edge');
    edges.set(e.id, e);
  }
  return {nodes, edges};
}
export function newState(studentId, graphVersion) {
  requireValue(id(studentId) && id(graphVersion), 'Invalid state identity');
  return {studentId, graphVersion, events:[], nodes:[], confusions:[]};
}
function checkScope(graph, state, event) {
  requireValue(state?.graphVersion === graph.version && event?.graphVersion === graph.version &&
    event.studentId === state.studentId, 'Scope mismatch');
}
function assessedSnapshot(event, nodes, edges) {
  requireValue(id(event.id) && id(event.activityId) && id(event.assessmentRef) &&
    nodes.has(event.nodeId) && MODES.has(event.modality) && typeof event.correct === 'boolean', 'Invalid assessed event');
  if (event.edgeId !== undefined) {
    const e = edges.get(event.edgeId);
    requireValue(e?.status === 'approved' && (e.from === event.nodeId || e.to === event.nodeId), 'Invalid event edge');
  }
  if (event.confusedWith !== undefined) {
    requireValue(!event.correct && nodes.has(event.confusedWith) && event.confusedWith !== event.nodeId &&
      event.confusionVerified === true, 'Unverified confusion');
  }
  return {
    id:event.id, studentId:event.studentId, graphVersion:event.graphVersion, nodeId:event.nodeId,
    activityId:event.activityId, assessmentRef:event.assessmentRef, modality:event.modality, correct:event.correct,
    edgeId:event.edgeId ?? null, confusedWith:event.confusedWith ?? null
  };
}
export function record(graph, state, event) {
  const {nodes, edges} = validateGraph(graph);
  checkScope(graph, state, event);
  const snapshot = assessedSnapshot(event, nodes, edges);
  const prior = state.events.find(e => e.id === snapshot.id);
  if (prior) {
    requireValue(JSON.stringify(prior) === JSON.stringify(snapshot), 'Conflicting event replay');
    return state;
  }
  const next = structuredClone(state);
  next.events.push(snapshot);
  let n = next.nodes.find(x => x.nodeId === event.nodeId);
  if (!n) {
    n = {nodeId:event.nodeId, recognition:{correct:0,total:0}, cued:{correct:0,total:0},
      free:{correct:0,total:0}, independentSuccesses:[]};
    next.nodes.push(n);
  }
  n[event.modality].total++;
  if (event.correct) n[event.modality].correct++;
  if (!event.correct) n.independentSuccesses = [];
  else if (event.modality === 'free' && !n.independentSuccesses.includes(event.activityId)) n.independentSuccesses.push(event.activityId);
  if (snapshot.confusedWith) {
    let c = next.confusions.find(x => x.from === event.nodeId && x.to === snapshot.confusedWith);
    if (!c) { c = {from:event.nodeId,to:snapshot.confusedWith,count:0}; next.confusions.push(c); }
    c.count++;
  }
  return next;
}
export function suggest(graph, state, event, options = {}) {
  const {nodes, edges} = validateGraph(graph);
  checkScope(graph, state, event);
  const snapshot = assessedSnapshot(event, nodes, edges);
  const stored = state.events.find(e => e.id === snapshot.id);
  requireValue(stored && JSON.stringify(stored) === JSON.stringify(snapshot), 'Unrecorded or altered event');
  const c = {...defaults, ...options};
  requireValue(Number.isInteger(c.depth) && c.depth >= 1 && c.depth <= 2 &&
    Number.isInteger(c.fanOut) && c.fanOut >= 1 && c.fanOut <= 7 &&
    Number.isInteger(c.limit) && c.limit >= 1 && c.limit <= 5 &&
    Number.isFinite(c.decay) && c.decay > 0 && c.decay <= 1, 'Invalid policy');
  if (stored.correct) return [];
  const best = new Map();
  const queue = [{node:stored.nodeId, depth:0, priority:1, path:[stored.nodeId]}];
  for (let i=0; i<queue.length; i++) {
    const p = queue[i];
    if (p.depth >= c.depth) continue;
    const neighbors = graph.edges.filter(e => e.status === 'approved' && CRITICAL.has(e.type) &&
      (e.from === p.node || (e.type === 'contrasts_with' && e.to === p.node)))
      .map(e => ({e,to:e.from === p.node ? e.to : e.from}))
      .filter(x => x.e.weight > 0 && !p.path.includes(x.to))
      .sort((a,b) => b.e.weight-a.e.weight || a.e.id.localeCompare(b.e.id));
    for (const {e,to} of neighbors.slice(0,c.fanOut)) {
      const priority = p.priority*e.weight*c.decay/Math.sqrt(Math.max(1,neighbors.length));
      const recommendation = {nodeId:to, reasonCode:e.type, priority, depth:p.depth+1,
        eventRef:stored.id, edgeId:e.id, activityType:e.type === 'contrasts_with' ? 'discrimination' : 'diagnostic', status:'suggested'};
      if (!best.has(to) || priority > best.get(to).priority) best.set(to,recommendation);
      queue.push({node:to,depth:p.depth+1,priority,path:[...p.path,to]});
    }
  }
  return [...best.values()].sort((a,b) => b.priority-a.priority || a.nodeId.localeCompare(b.nodeId)).slice(0,c.limit);
}
// Default-off rollout. These flags are a contract, not runtime wiring.
export const rolloutDefaults = Object.freeze({
  events:false, shadow:false, lens:false, visual:false, navigator:false, reviewWrite:false
});
