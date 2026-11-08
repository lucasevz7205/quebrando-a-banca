import {test} from "node:test";
import assert from "node:assert/strict";
import {
  STUDY_CONTENT_COLLECTIONS, assertStudyAdministrator,
  validateStudyAccountDraft, validateStudyContentBatch, canActivateStudyAccount
} from "../src/lib/study-provisioning.js";
import {listDocuments,writeDocument} from "../src/lib/study-documents.js";

test("Only administrators can provision study accounts",()=>{
  assert.throws(()=>assertStudyAdministrator({role:"user"}),/administrador/);
  assert.throws(()=>assertStudyAdministrator(null),/administrador/);
  assert.doesNotThrow(()=>assertStudyAdministrator({role:"admin"}));
});

test("Provisioning never reuses the admin's original account",()=>{
  assert.throws(()=>validateStudyAccountDraft({userId:"admin-1",examName:"Novo edital"},"admin-1"),/administrador mantém/);
  assert.throws(()=>validateStudyAccountDraft({userId:"student-2",examName:"  "},"admin-1"),/nome do concurso/);
  assert.throws(()=>validateStudyAccountDraft({userId:"student-2",examName:"Concurso",examDate:"2026-02-31"},"admin-1"),/Data da prova/);
  assert.deepEqual(validateStudyAccountDraft({userId:"student-2",examName:"SEFAZ DF",examDate:"2027-03-20"},"admin-1"),{
    user_id:"student-2",exam_name:"SEFAZ DF",exam_date:"2027-03-20",active:false
  });
});

test("Import accepts only content; rejects importing another student's history",()=>{
  for(const name of ["respostas","rodadas","cartoes_aval","planejamento","aprendizagem","simulados"]) {
    assert.ok(!STUDY_CONTENT_COLLECTIONS.includes(name));
    assert.throws(()=>validateStudyContentBatch(name,[{id:"private",kind:"attempt"}]),/não permitida/);
  }
  assert.equal(validateStudyContentBatch("questoes",[
    {id:"q1",enunciado:"Julgue o item.",gabarito:"C",comentario:"Fonte oficial"}
  ]).length,1);
  assert.throws(()=>validateStudyContentBatch("questoes",[{id:"q1",enunciado:"Enunciado",gabarito:"D"}]),/C\/E/);
  assert.throws(()=>validateStudyContentBatch("edital",[{id:"e",titulo:"Direito"}]),/capítulos/);
  assert.throws(()=>validateStudyContentBatch("questoes",[
    {id:"q1",enunciado:"a",gabarito:"C"},{id:"q1",enunciado:"b",gabarito:"E"}
  ]),/repetido/);
});

test("Accounts remain inactive until topic and questions are present",()=>{
  assert.equal(canActivateStudyAccount({edital: true, questoes: true}),true);
  assert.equal(canActivateStudyAccount({edital: true, questoes: false}),false);
  assert.equal(canActivateStudyAccount({edital: false, questoes: true}),false);
});

function fakeEntities() {
  const docs=[],parts=[],access=[];
  const entity=table=>({
    filter:async(filter,order,limit=1000,skip=0)=>{
      access.push({...filter});
      return table.filter(r=>Object.entries(filter).every(([k,v])=>r[k]===v)).slice(skip,skip+limit);
    },
    create:async(value)=>{const x={...value,id:"db-"+(table.length+1)};table.push(x);return x;},
    update:async(id,payload)=>Object.assign(table.find(r=>r.id===id),payload)
  });
  return {documents:entity(docs),parts:entity(parts),access};
}

test("Reading and writing same key is partitioned by study_account_id, across all collections",async()=>{
  const db=fakeEntities();
  for(const collection of ["questoes","revisao","edital","respostas","cartoes_aval","aprendizagem"]) {
    const item={name:"from A",...(collection==="aprendizagem"?{kind:"practice",at:"2026-11-08T12:00:00Z"}:{})};
    await writeDocument({...db,scope:{study_account_id:"account-A"}},{
      path:collection+"/same-id",operation:"set",value:item
    });
    const other=await listDocuments({...db,scope:{study_account_id:"account-B"}},{collection});
    assert.equal(other.length,0,"No leakage for "+collection);
  }
  assert.ok(db.access.every(q=>q.study_account_id==="account-A"||q.study_account_id==="account-B"));
});
