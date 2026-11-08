import markup from "@/components/qb/study-shell.html?raw";

const legacyMarkup = markup.replace(/<!-- QB_LEGACY_(?:BEGIN|END) -->|\/\* QB_LEGACY_(?:BEGIN|END) \*\//g, "");
const candidateMarkup = markup
  .replace(/<!-- QB_LEGACY_BEGIN -->[\s\S]*?<!-- QB_LEGACY_END -->/g,
    '<div class="eyebrow qb-header-kicker"></div>')
  .replace(/\/\* QB_LEGACY_BEGIN \*\/const SIM_DEF=[\s\S]*?\/\* QB_LEGACY_END \*\//,
    "const SIM_DEF={obj:{blocos:[]},disc:{min:180}};\nconst SIM_DISC=[];\n")
  .replace(/\/\* QB_LEGACY_BEGIN \*\/[\s\S]*?\/\* QB_LEGACY_END \*\//g, "");

export function studyShell(legacy) {
  return legacy ? legacyMarkup : candidateMarkup;
}
