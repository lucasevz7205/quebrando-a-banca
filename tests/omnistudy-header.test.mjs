import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const code=fs.readFileSync("public/claude-export/omnistudy-ai.js","utf8");
const shell=fs.readFileSync("src/components/qb/study-shell.html","utf8");

test("OmniStudy encontra o cabeçalho AXON atual e monta botão visível",()=>{
  assert.match(shell,/class="row qb-header-utilities"/);
  assert.ok(shell.includes("omnistudy-ai.js?v=3"));
  assert.ok(shell.includes("omnistudy-cornell.js?v=1"));
  const inserted=[],nodes=new Map();
  const header={
    firstChild:null,
    insertBefore(child){
      assert.ok(child.id);
      inserted.push(child);
      nodes.set(child.id,child);
      if(!this.firstChild)this.firstChild=child;
    },
  };
  const newNode=tag=>({
    tagName:tag,
    id:"",
    innerHTML:"",
    className:"",
    title:"",
    classList:{contains:()=>false},
    addEventListener(){},
  });
  const body={appendChild(x){if(x.id)nodes.set(x.id,x);}};
  const doc={
    body,
    readyState:"complete",
    querySelector(sel){
      if(sel===".qb-header-utilities, .top-actions")return header;
      return null;
    },
    getElementById(id){return nodes.get(id)||null;},
    createElement:newNode,
  };
  const win={
    addEventListener(){},
    localStorage:{getItem(){return null;},setItem(){}},
  };
  vm.runInNewContext(code,{document:doc,window:win,Date,Math});
  assert.equal(inserted.length,2);
  assert.ok(nodes.get("omni-studio-trigger"));
  assert.ok(nodes.get("omni-pomo-pill"));
  assert.ok(nodes.get("omni-drawer-backdrop"));
  assert.match(nodes.get("omni-studio-trigger").innerHTML,/O Arquiteto/);
  assert.match(nodes.get("omni-drawer-backdrop").innerHTML,/Quebrando a Banca/);
  assert.equal(win.QBOmniStudy.version,"2.1.0");
  assert.equal(win.QBOmniStudy.name,"O Arquiteto");
  assert.equal(typeof win.QBOmniStudy.openStudio,"function");
});
test("o atalho do teclado permanece Alt+O",()=>{
  assert.ok(code.includes('if (e.altKey && (e.key === "o" || e.key === "O"))'));
  assert.ok(code.includes("Abrir O Arquiteto (Alt+O)"));
});
