import {test} from 'node:test';
import assert from 'node:assert/strict';
import {writeDocument,listDocuments} from '../src/lib/study-documents.js';
function storage(scope) {
 const rows=[],queries=[];
 const entity={filter:async(filter,_sort,limit=500,skip=0)=>{queries.push(filter);return rows.filter(r=>Object.entries(filter).every(([k,v])=>r[k]===v)).slice(skip,skip+limit)},
 create:async value=>{const row={...value,id:'row-'+rows.length};rows.push(row);return row},
 update:async(id,value)=>Object.assign(rows.find(r=>r.id===id),value)};
 return {documents:entity,parts:entity,scope,rows,queries};
}
test('Append-only event retry returns replay and rejects rewritten answer',async()=>{
 const s=storage({study_account_id:'a'}),e={id:'attempt',kind:'attempt',at:'2026-11-08T12:00:00Z',marked:'C'};
 await writeDocument(s,{path:'aprendizagem/attempt',operation:'set',value:e});
 assert.equal((await writeDocument(s,{path:'aprendizagem/attempt',operation:'set',value:e})).replay,true);
 await assert.rejects(writeDocument(s,{path:'aprendizagem/attempt',operation:'set',value:{...e,marked:'E'}}),/preservada/);
 assert.equal(s.rows.length,1);assert.equal(JSON.parse(s.rows[0].payload_json).marked,'C');
 assert.ok(s.queries.every(q=>q.study_account_id==='a'));
});
test('Weekly choices update but never duplicate; original collections untouched',async()=>{
 const s=storage({study_account_id:'a'});
 for(const text of ['first','edited'])await writeDocument(s,{path:'aprendizagem/week',operation:'set',value:{kind:'weekly',at:'2026-11-08T12:00:00Z',text}});
 assert.equal(s.rows.length,1);assert.equal(JSON.parse(s.rows[0].payload_json).text,'edited');
 assert.equal(s.rows[0].collection,'aprendizagem');
});
test('Account B cannot read account A data through scoped storage',async()=>{
 const a=storage({study_account_id:'a'});
 await writeDocument(a,{path:'aprendizagem/e',operation:'set',value:{kind:'exposure',at:'2026-11-08T12:00:00Z'}});
 const b={...a,scope:{study_account_id:'b'}};
 assert.equal((await listDocuments(b,{collection:'aprendizagem'})).length,0);
});
test('Malformed pedagogical event rejected before writing',async()=>{
 const s=storage({});
 await assert.rejects(writeDocument(s,{path:'aprendizagem/e',operation:'set',value:{kind:'attempt',at:'bad'}}),/inválido/);
 assert.equal(s.rows.length,0);
});
