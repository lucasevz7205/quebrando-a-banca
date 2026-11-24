# External skills — source inspection and QBAsc adaptation
Scope: selected source files, ten KST skill instructions, schema, licenses, and Anatomy rendering/audit references. Not a complete dependency or security audit; no upstream scripts executed, no vendored source code. Blob SHAs identify inspected files, not pinned whole-repo revisions.
## Knowledge Spaces — Vanderbilt Data Science Institute, MIT
Upstream https://github.com/vanderbilt-data-science/knowledge-spaces
License blob f179a553e0855ec6583252812ee9e7ecdfa7790e.
Ten skill files inspected (under .claude/skills/<name>/SKILL.md):
- extracting-knowledge-items 58b7f51417b83029368003aadfd04151db688377: keep decomposition and stable IDs.
- decomposing-learning-objectives 8a436a287862f2789a519e9da66aab94d702e20b: optional cognitive taxonomy, not mandatory for all nodes.
- mapping-concepts-and-competences 6f532f18d373b2f5196995dac46d2dba7a0650cb: candidate relations only.
- building-surmise-relations f767743562d8d3c7883d8f3bab005f6d53ea0962: distinguish necessary from helpful; AI-as-expert is not sufficient for approval.
- constructing-knowledge-space 51ba446488b053f03c467f54862777d8896f4880: defer global state enumeration; exponential worst case.
- validating-knowledge-structure 13205c9b780a117af4ce8d210baa2e00073972c1: structural cycle and ID validation; heuristic limits not universal science.
- assessing-knowledge-state bba075a327d2d0cdf0a3f41ddad2f404291e7d38: defer BLIM/PoLIM until assessment evidence and calibration.
- generating-learning-materials 457c5bd50d9f0d24806baa43cfd91903ac9f13b4: future Arquiteto/Navegador scaffolding.
- planning-adaptive-instruction 1395d8ff09ee493d025faacf449c633b8b5f255f: group analytics out of scope.
- updating-knowledge-domain 61e03db6d3293b53d278fd66c0a54513a59d05c1: source versioning and impact review.
scripts/kst_utils.py blob 0d0620275b63dcc78e95b4dac6e32a317c9dc5d9: closure, cycle detection, downsets, assessment; Python offline authoring, not a runtime dependency. schemas/knowledge-graph.schema.json blob 3fb2f0c7e5ed2687e5715b99661e34b63ac35cfa: surmise pair prerequisite->target maps to target depends_on prerequisite. Do not automatically promote part_of to prerequisite or closure to sourced facts.
## Anatomy — Ryan, MIT
Upstream https://github.com/wheresryan22/anatomy
License blob aa20733917ffc919b6b04834e6a6e22909df7c76.
Inspected core and interfaces: kit/iso-kit.mjs 248ee01cc00dfaeee9d693f49f63e32913f03115, kit/react/draw.tsx 108cbd405ba8405ee4d4de02d3661cc540656417, kit/react/live.tsx 58c5cf2491836405761edf93b4134f7c42c7ebb3, kit/audit.mjs 7fc329342210e9130f3dcdac2537cb9022c36e56, scripts/capture.mjs 715b644f657b4c6063ae20efff90f35d8cf58fa9, references/react.md 02bc04ead7b6d2dbe7b7318eac865614f9f85fe3, references/verify.md b2cdd2b77509d0557086f04e2cacfc349a029520.
Prefer pure model + static geometry + controlled React motion. Browser capture launches Chromium (offline tooling only). Do not embed arbitrary standalone HTML, do not adopt 40+ parts requirement as a learning law. Defer WebGL and 3D until useful and tested. No automatic external publishing. Future vendoring requires pinned commit, license notice, dependency/security and accessibility checks.
## QBAsc implemented boundaries
src/lib/nexo/skill-adapters.js accepts KST candidates with explicit stable mappings and checks approved prerequisite cycles. Visual manifest accepts only references to a trusted reviewed model and approved claims, exact graph version and accessibility text, no arbitrary code. It does not render models, verify sources, authenticate, or grant editorial approvals. Registry must be server-controlled before production use.
Local authoring wrappers under .claude/skills/nexo-*; not installed in the user's Windows/Obsidian environment. No source facts generated. Tests use synthetic fixtures only. Existing inventory stays candidate-only.
