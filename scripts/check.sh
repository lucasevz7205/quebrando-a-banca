#!/usr/bin/env bash
# Validação determinística do Quebrando a Banca (sem IA).
# Uso: scripts/check.sh [arquivos de teste...]   (padrão: todos)
set -u
cd "$(dirname "$0")/.."
status=0

# 1. Sintaxe dos JS alterados em relação ao main (ou todos os de public/claude-export e src/lib)
base=$(git merge-base HEAD origin/main 2>/dev/null || echo HEAD)
mapfile -t js < <(git diff --name-only "$base" -- '*.js' '*.mjs' 2>/dev/null; git ls-files --others --exclude-standard -- '*.js' '*.mjs')
[ ${#js[@]} -eq 0 ] && mapfile -t js < <(ls public/claude-export/*.js src/lib/*.js 2>/dev/null)
bad=0
for f in "${js[@]}"; do
  [ -f "$f" ] || continue
  if ! node --check "$f" >/dev/null 2>&1; then echo "SINTAXE: $f"; node --check "$f" 2>&1 | head -5; bad=1; fi
done
[ $bad -eq 0 ] && echo "sintaxe: ok (${#js[@]} arquivos)" || status=1

# 2. Testes
if [ $# -gt 0 ]; then tests=("$@"); else tests=(tests/*.test.mjs); fi
out=$(node --test "${tests[@]}" 2>&1)
echo "$out" | grep -E "^# (tests|pass|fail)"
fails=$(echo "$out" | grep -E "^not ok" || true)
if [ -n "$fails" ]; then
  # separa falhas de ambiente (pacote não instalado) de falhas reais
  env_fail=0; real_fail=0
  while IFS= read -r line; do
    file=$(echo "$line" | sed -E 's/^not ok [0-9]+ - //')
    if [ -f "$file" ] && node --test "$file" 2>&1 | grep -q "ERR_MODULE_NOT_FOUND"; then
      env_fail=$((env_fail+1)); echo "ambiente (pacote ausente): $file"
    else
      real_fail=$((real_fail+1)); echo "FALHA: $line"
    fi
  done <<< "$fails"
  echo "falhas reais: $real_fail · de ambiente: $env_fail"
  [ $real_fail -gt 0 ] && status=1
fi
exit $status
