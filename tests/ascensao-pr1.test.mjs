import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const previewRoot = path.join(root, "public", "qb-ascensao-preview");

test("PR1 Ascensão: estrutura da prévia e documentação existem", () => {
  const required = [
    "docs/ascensao/README.md",
    "public/qb-ascensao-preview/styles.css",
    "public/qb-ascensao-preview/_ds_bundle.js",
    "public/qb-ascensao-preview/ui_kits/app/index.html",
    "public/qb-ascensao-preview/ui_kits/app/data.js",
    "public/qb-ascensao-preview/assets/logo/mark-q-sword-transparent.png",
    "public/qb-ascensao-preview/tokens/colors.css",
    "public/qb-ascensao-preview/tokens/effects.css",
    "public/qb-ascensao-preview/components/components.css"
  ];
  for (const rel of required) {
    assert.equal(fs.existsSync(path.join(root, rel)), true, `Arquivo obrigatório ausente: ${rel}`);
  }
});

test("PR1 Ascensão: identidade visual mantém Quebrando a Banca sem subtítulo 'A Ascensão' no logo/cabeçalho", () => {
  const brandLogo = fs.readFileSync(path.join(previewRoot, "components", "brand", "BrandLogo.jsx"), "utf8");
  const brandHeader = fs.readFileSync(path.join(previewRoot, "components", "navigation", "BrandHeader.jsx"), "utf8");
  const bundle = fs.readFileSync(path.join(previewRoot, "_ds_bundle.js"), "utf8");

  assert.doesNotMatch(brandLogo, /A Ascensão|A ASCENSÃO/);
  assert.doesNotMatch(brandHeader, /A Ascensão|A ASCENSÃO/);
  assert.match(brandLogo, /qb-mark-q-sword/);
  assert.match(brandHeader, /mark="q-sword"/);

  // No bundle compilado, BrandLogo e BrandHeader também não devem exibir subtítulo no cabeçalho/logotipo
  const headerSlice = bundle.slice(bundle.indexOf("// components/navigation/BrandHeader.jsx"), bundle.indexOf("// components/navigation/RadialNavigation.jsx"));
  assert.doesNotMatch(headerSlice, /A Ascens\\xE3o|A Ascensão/);
});

test("PR1 Ascensão: prévia isolada sem chamadas à Base44 nem importação no app principal", () => {
  const indexHtml = fs.readFileSync(path.join(previewRoot, "ui_kits", "app", "index.html"), "utf8");
  const previewData = fs.readFileSync(path.join(previewRoot, "ui_kits", "app", "data.js"), "utf8");
  const rootCss = fs.readFileSync(path.join(root, "src", "index.css"), "utf8");

  assert.doesNotMatch(indexHtml + previewData, /ClaudeDocument|base44\.com|base44Client/);
  assert.doesNotMatch(rootCss, /qb-ascensao-preview/);
});

test("PR1 Ascensão: acessibilidade (focus-visible e prefers-reduced-motion) presente nos estilos", () => {
  const effectsCss = fs.readFileSync(path.join(previewRoot, "tokens", "effects.css"), "utf8");
  const componentsCss = fs.readFileSync(path.join(previewRoot, "components", "components.css"), "utf8");

  assert.match(effectsCss, /prefers-reduced-motion:\s*reduce/);
  assert.match(componentsCss, /:focus-visible/);
  assert.match(componentsCss, /--ring-focus/);
});
