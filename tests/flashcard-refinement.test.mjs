import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const shell = fs.readFileSync("src/components/qb/study-shell.html", "utf8");
function fn(name) {
  const i = shell.indexOf("function " + name + "(");
  assert.ok(i >= 0, "função " + name + " não encontrada");
  return shell.slice(i, shell.indexOf("\nfunction ", i + 10));
}

test("iniciarFocoTopico monta sessão focada cartão a cartão do tópico", () => {
  assert.match(shell, /function iniciarFocoTopico\(id\)/);
  const f = fn("iniciarFocoTopico");
  assert.match(f, /modo:'topico',topicoId:id/);
  assert.match(f, /S\.cmix=\{fila,idx:0,tot:fila\.length/);
  assert.match(shell, /data-cart-foco=/);
});

test("viewCartoes oferece modo foco e barra de retenção visual do baralho", () => {
  const vc = fn("viewCartoes");
  assert.match(vc, /data-cart-foco=/);
  assert.match(vc, /qb-flash-retention-bar/);
  assert.match(vc, /cs0\.firmes/);
});

test("viewCmix distingue modo tópico e exibe progresso com badges", () => {
  const vcmix = fn("viewCmix");
  assert.match(vcmix, /isTopico\?`Baralho · \$\{esc\(topicoDoc\?\.titulo\|\|m\.topicoId\)\}`:'Sessão intercalada/);
  assert.match(vcmix, /data-cmix-next="1"/);
});

test("atalhos de teclado de flashcards: espaço/enter vira e avança, 1-4 avaliam SRS", () => {
  assert.match(shell, /if\(S\.view==='cartoes'\)/);
  assert.match(shell, /const mapa=\{ '1':'n', '2':'d', '3':'b', '4':'f' \};/);
  assert.match(shell, /salvarAval\(k, mapa\[e\.key\]\)/);
  assert.match(shell, /m\.idx\+\+; S\.cartRated\.delete\(k\); S\.cartAbertos\.delete\(k\);/);
});
