import markup from "@/components/qb/study-shell.html?raw";

const legacyMarkup = markup.replace(/<!-- QB_LEGACY_(?:BEGIN|END) -->|\/\* QB_LEGACY_(?:BEGIN|END) \*\//g, "");
const candidateMarkup = markup
  .replace(/<!-- QB_LEGACY_BEGIN -->[\s\S]*?<!-- QB_LEGACY_END -->/g,
    '<div class="eyebrow qb-header-kicker"></div>')
  .replace(/\/\* QB_LEGACY_BEGIN \*\/[\s\S]*?\/\* QB_LEGACY_END \*\//g, "");

export function studyShell(legacy) {
  return legacy ? legacyMarkup : candidateMarkup;
}
