# NEXO — foundation / 24-11-2026

Status: private development branch, no deployment or integration.
Base checkpoint: 6b05c2693191406c46d757fc (main version 61565cc9901398258b7bddfd1f1208fb9afa71a9).
Branch: nexo-v1-foundation.
AXON remains the existing visual motion naming. PACIFIC remains out of scope.
Arquiteto: content and visual representations. Navegador: evidence-based study guidance.

## Initial audit
- TanStack Start, React 19, JavaScript, Zod, Three.js and Recharts already installed. No new dependencies needed for the core.
- src/routes/_authed/estudar.jsx, src/lib/study-shell.server.js and src/components/qb/study-shell.html: legacy study shell integration.
- src/lib/ascensao-study.js: existing answer records and SRS intervals [1,3,7,15,30]; retain current schedule as authority.
- src/lib/mindmap-text-structure.js, src/components/qb/mind-map/: existing hierarchy, map layout and scene.
- src/lib/flashcard-support.js: existing map-origin resolution; preserve remissions.
- src/lib/omnistudy-ai.js: tutor and recall normalization; src/lib/ai.server.js: AI gateway.
- base44/entities/StudyAccount.jsonc and StudyDocument/StudyDocumentPart: inspect ownership and data shape before integration.
- docs/ascensao and src/components/qb/qb.css: actual DS references. No UI changes in this branch unit.

## Foundation
src/lib/nexo/core.js is a pure reference engine derived from the NEXO v1 package, with strict replay matching, free recall counted separately and bounded suggestions. Graph source references are required but not fact-checked by code; only curators may approve relationships. Inputs and state are assumed trusted here; authentication, grading, transactional persistence, schema bounds and authorization must be implemented on the server before exposure. No direct mastery credit for neighbors. Parameters are experimental engineering choices, not validated neurological constants.

Run: node --test tests/nexo-core.test.mjs

## Next gates
1. Inspect actual user ownership, learning event persistence, stable concept identifiers, map remissions and the legacy shell bridge before adding adapters.
2. Build four source-curated pilots (legislative process, administrative acts, charts, OSI), no fake legal facts.
3. Audit Anatomy and Knowledge Spaces licenses and templates. Anatomy is an authoring skill, not a runtime API. Preserve structured visuals, never execute arbitrary generated JS.
4. Shadow mode: log only assessed evidence, suggestions do not write to the scheduler. No client-supplied grading or student ID.
5. Add NEXO lens to maps and visual lab to Arquiteto after DS inspection; Scanner removal only after exclusive dependencies verified.
6. Add Navegador and explanation of uncertainty. Base44 workflow primary, Gemini fallback, server-side only. No live AI in this unit.
7. Test retention and transfer, keep existing review engine until explicit approval. No merge or deploy without user approval.
