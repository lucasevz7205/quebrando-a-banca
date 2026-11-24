// Regenerates a deterministic, non-approved inventory from checked-in sources.
import fs from 'node:fs';
import {URL} from 'node:url';
import process from 'node:process';
import console from 'node:console';
import {createHash} from 'node:crypto';
import {extractEditorialActivities,extractQuestionCandidates} from '../../src/lib/nexo/catalog.js';
const root=new URL('../../',import.meta.url);
function input(path) {
  const bytes=fs.readFileSync(new URL(path,root));
  return {sourceId:path,version:'sha256:'+createHash('sha256').update(bytes).digest('hex'),rows:JSON.parse(bytes)};
}
const editorial=extractEditorialActivities(input('docs/learning-pilot-catalog.json'));
const questions=extractQuestionCandidates(input('src/data/rf-questoes-revisao-2026-11-10.json'));
const result={status:'candidate-only',editorial,questions,approvedEdges:[],approvedConcepts:[]};
const output=JSON.stringify(result,null,2)+'\n';
if(process.argv.includes('--check')) {
  if(fs.readFileSync(new URL('docs/nexo/source-inventory.json',root),'utf8')!==output) throw new Error('Inventory mismatch');
} else fs.writeFileSync(new URL('docs/nexo/source-inventory.json',root),output);
console.log(JSON.stringify({editorial:editorial.candidates.length,editorialExcluded:editorial.excluded.length,questions:questions.candidates.length,questionsExcluded:questions.excluded.length,approvedEdges:0}));
