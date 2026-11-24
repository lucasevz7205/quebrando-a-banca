// Offline shadow adapter for QBAsc's legacy respostas/<qid>. No I/O.
// The caller must supply an independently curated, versioned catalog and an authorized
// account snapshot. Legacy attempt data is self-reported; regrading is not proof of
// independent recall or attempt authenticity. Never expose this directly as an API.
import { newState, record, suggest, validateGraph } from './core.js';
import { resolveMapOrigin } from '../flashcard-support.js';

const validId = v => typeof v === 'string' && v.trim() && v.length <= 200;
const fail = message => { throw new Error(message); };
const key = (...parts) => JSON.stringify(parts);
function questionChoices(question) {
  if (Array.isArray(question.alternativas) && question.alternativas.length >= 4) {
    const letters = question.alternativas.map(o => o?.letra);
    if (letters.some(l => !['A','B','C','D','E'].includes(l)) || new Set(letters).size !== letters.length) return null;
    return {letters,blank:'-'};
  }
  return {letters:['C','E'],blank:'B'};
}
function uniqueIndex(values, getKey, label) {
  const index = new Map();
  for (const value of values) {
    const k = getKey(value);
    if (index.has(k)) fail('Duplicate '+label);
    index.set(k,value);
  }
  return index;
}
// The map identifier is part of the concept mapping. A path alone is unstable
// across map edits; a lexical match is not an assessed remissão.
export function exactConcept({question, map, binding, graphVersion}) {
  if (!binding || binding.graphVersion !== graphVersion ||
      binding.questionId !== question.id || !validId(binding.mapNodeId) ||
      !validId(binding.mapId) || !validId(binding.mapVersion) ||
      map?.id !== binding.mapId || map.version !== binding.mapVersion) return null;
  const explicit = question.mapaNoId ?? question.mapNodeId ?? question.mapaNodeId;
  if (explicit !== binding.mapNodeId) return null;
  if (!Array.isArray(map.mapa?.ramos)) return null;
  let matches = 0;
  const visit = n => {
    if (!n || typeof n !== 'object') return;
    if (n.id === explicit) matches++;
    if (Array.isArray(n.f)) n.f.forEach(visit);
  };
  map.mapa.ramos.forEach(visit);
  if (matches !== 1) return null;
  const origin = resolveMapOrigin(map.mapa, {mapaNoId:explicit});
  return origin.status === 'exact' && origin.nodeId === explicit ? binding.conceptId : null;
}

// A complete catalog entry is a curator-reviewed snapshot; we do not silently
// upgrade a current mutable question to the version used for a historical attempt.
export function replayShadow({graph, account, catalog, responses, preview=false, options={}}) {
  if (preview) return {status:'disabled-preview', state:null, recommendations:[], rejected:[]};
  if (!validId(account?.studentId) || !validId(account?.accountId)) fail('Missing authorized scope');
  if (catalog?.graphVersion !== graph?.version || !validId(catalog?.version)) fail('Catalog version mismatch');
  if (!Array.isArray(responses) || responses.length > 10000 ||
      !Array.isArray(catalog.entries) || catalog.entries.length > 10000) fail('Invalid replay bounds');
  const {nodes} = validateGraph(graph);
  const entries = uniqueIndex(catalog.entries, e => e.question?.id, 'question');
  const records = uniqueIndex(responses, r => r?.qid, 'response');
  const rejected = [], candidates = [];
  const reject = (qid,reason) => rejected.push({questionId:qid ?? null,reason});
  for (const [qid,r] of records) {
    const entry = entries.get(qid);
    if (!entry || entry.status !== 'approved' || !validId(entry.version) ||
        !validId(entry.question?.id) || entry.question.statusEditorial === 'aguardando-revisao-humana') {
      reject(qid,'unapproved-or-unmapped-question'); continue;
    }
    // Historical records do not normally carry a question revision. Such records
    // are intentionally excluded from evidence; no guessing the old answer key.
    if (r.questionVersion !== entry.version) {reject(qid,'unverified-question-version');continue;}
    const conceptId = exactConcept({question:entry.question,map:entry.map,binding:entry.binding,graphVersion:graph.version});
    if (!nodes.has(conceptId)) {reject(qid,'non-exact-concept');continue;}
    const choices = questionChoices(entry.question);
    if (!choices || !choices.letters.includes(entry.question.gabarito)) {reject(qid,'invalid-answer-key');continue;}
    if (!Array.isArray(r.hist) || r.hist.length > 8) {reject(qid,'invalid-history');continue;}
    const seen = new Set();
    for (const h of r.hist) {
      if (!h || typeof h.em !== 'string' || !Number.isFinite(Date.parse(h.em))) {reject(qid,'invalid-timestamp');continue;}
      const canonicalTime = new Date(h.em).toISOString();
      if (seen.has(canonicalTime)) {reject(qid,'duplicate-attempt-time');continue;}
      seen.add(canonicalTime);
      if (h.m === choices.blank) {reject(qid,'blank-not-evidence');continue;}
      if (!choices.letters.includes(h.m)) {reject(qid,'invalid-mark');continue;}
      if (h.c === 1 || h.loc === false) {reject(qid,'low-confidence-or-unlocated');continue;}
      candidates.push({at:canonicalTime,event:{
        id:key(account.accountId,catalog.version,entry.version,qid,canonicalTime),
        studentId:account.studentId,graphVersion:graph.version,nodeId:conceptId,
        activityId:qid,assessmentRef:key('legacy-regraded',catalog.version,entry.version,qid),
        modality:'recognition',correct:h.m === entry.question.gabarito
      }});
    }
  }
  candidates.sort((a,b)=>a.at.localeCompare(b.at)||a.event.id.localeCompare(b.event.id));
  // Scope includes account as well as identity, so one student's exams cannot mix.
  // The returned state is explicitly provisional; never commit it to mastery or SRS.
  let state = newState(account.studentId,graph.version);
  const latest = new Map();
  for (const {event} of candidates) {
    state = record(graph,state,event);
    latest.set(event.nodeId,event);
  }
  const recommendations = new Map();
  for (const event of latest.values()) {
    for (const s of suggest(graph,state,event,options)) {
      const prev = recommendations.get(s.nodeId);
      if (!prev || s.priority > prev.priority) recommendations.set(s.nodeId,{...s,evidenceQuality:'legacy-regraded',effect:'diagnostic-only'});
    }
  }
  return {status:'shadow-only',accountId:account.accountId,catalogVersion:catalog.version,
    state,rejected,recommendations:[...recommendations.values()].sort((a,b)=>b.priority-a.priority||a.nodeId.localeCompare(b.nodeId)).slice(0,5)};
}
