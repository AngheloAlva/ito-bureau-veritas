# ITO visual redesign

Branch: `feat/visual-redesign` (baseline `c46b006`). Goal: make the demo visually compelling and the flow clearer for the Bureau Veritas meeting, without changing domain rules. Keep the official BV logo (explicitly requested). Time is short: highest impact first.

## Decisions

- Full redesign scope; technical line-art SVG illustrations (brand blue, no stock imagery).
- Radius: near-square `rounded-sm` everywhere instead of `rounded-none`.
- Geist Mono for record codes and dates; fewer all-caps labels.
- Consolidate "fictitious/simulated" disclaimers into one discreet place; remove per-name "(ficticio)".
- Baseline checks: 44 tests pass, typecheck clean.

## Tasks

- [x] 1. Foundations: radius tokens, `rounded-none` → `rounded-sm`, Geist Mono for codes/dates, reduce uppercase tracking, stronger brand color use.
- [x] 2. Data and copy: varied responsible people, remove "(ficticio)" suffixes, consolidate defensive microcopy, single demo-data notice.
- [x] 3. Overview: KPI tiles, finding lifecycle flow, real-data charts, animated counters, H-001 easy to locate.
- [x] 3b. User feedback: remove colored accent borders (left/top) everywhere; adopt BV signature short gradient underline (lavender→sky blue) under titles/eyebrows; severity bar with values on segments and color-only legend; load design skills (interface-design, better-ui, better-colors).
- [x] 4. Analysis: scanning animation, staggered results, per-finding specific reasons, project × specialty heatmap.
- [x] 5. Finding detail + header: lifecycle stepper hero with primary action on top; visible demo role switcher.
- [x] 6. Technical SVG line illustrations for projects and empty states.
- [x] 6b. Pending adjustments A (data/logic + tests): seed hotspot for heatmap, H-001 evidence wording, analysis summary from snapshot, findings summary line with 0 results, ProjectIllustration safe lookup, missing tests (heatmap, count-up, hero action).
- [x] 6c. Pending adjustments B (visual + docs): narrow bar segments, stepper connector lines, blueprint grid intensity, remove "ficticio" from docs.
- [x] 7. Browser verification of the demo script and docs update.

## Evidence

(commit ids recorded per task)

- Task 1: typecheck clean, 44/44 tests, `rounded-none` count 0, overview screenshot checked. Commit `10d8b82`; native review `review-625b4607fd5edd3e` approved and acknowledged.
- Task 2: roster of 6 people (H-001 stays with Diego Soto), "(ficticio)" suffixes removed, single sidebar notice "Demo con datos ficticios · sin conexión a sistemas BV"; RED→GREEN on roster/evidence tests; typecheck clean, 45/45 tests. Follow-up: docs/verificacion.md, docs/alcance.md, docs/design-system.md still mention "ficticio" (task 7).
- Task 2 follow-up: seed correction evidence/transitions attributed to the assigned responsible (review advisory R3-seed-correction-attribution); RED→GREEN, 46/46 tests.
- Task 3: KPI tiles with hydration-safe count-up, lifecycle strip with filtered links, severity stacked bar, project active/closed bars, H-001 highlighted "Caso de demostración"; RED→GREEN on overview-charts helpers; typecheck clean, 49/49 tests; screenshots checked.
- Task 3 follow-up: count-up interpolates with easeOutCubic (review advisory R3-count-up-rounding); hook has no DOM test runner, verified by typecheck + 49/49 tests.
- Task 3b: accent stripes removed (9→2, remaining are neutral timeline connectors), `.bv-rule` gradient underline + --brand-sky/--brand-lavender tokens, severity/project values over segments with color-only legend; skills interface-design, better-ui, better-colors loaded; 49/49 tests; screenshot checked after dev-server restart (stale CSS).
- Task 3b follow-up: heading rule spans text width via `.bv-title` background gradient (user feedback); screenshot checked.
- Task 4: data-backed reasons/suggestions per priority (explain()), concentration heatmap (concentrationMatrix), 4-step scanning state with live counts, staggered reveal, richer empty state; parent fixes: solid brand-blue CTA, "falta 1 día", lighter heatmap scale with "N vencido(s)" text; RED→GREEN analysis-reasons tests; 51/51 tests; screenshots checked. Note: seed spreads findings evenly so heatmap shows little concentration.
- Task 4 review advisories (follow-up, task 7): R3-stale-summary (summary tiles use live indicators, not the analysis snapshot, after data edits) and R3-matrix-assertions (heatmap test assertions thin).
- Task 5: finding hero with stepper + role-aware primary action (primaryActionFor probes transitionFinding), "Cambiar a <Rol>" via selectUser, visible "Viendo como" segmented role switcher; RED→GREEN finding-actions tests; 55/55; browser-checked H-001 Abierto→En corrección via hero.
- Task 6: inline SVG line illustrations (3 projects + analysis/empty/closed) in src/components/illustrations, used on project cards/detail, analysis empty state, Empty default and empty pending queue; test-first N/A (static decorative SVG), verified by typecheck, 55/55 tests and screenshots. Note: blueprint grid very faint; table empty rows keep text-only message.
- Task 6 review advisory (follow-up): R3-prototype-lookup in ProjectIllustration (use Object.hasOwn / Map).
- Task 6b: hotspot P-002×Civil (4 active, 3 overdue, unique max), Abierto findings no longer claim registered correction evidence, analysis tiles from snapshot counts (fallback to live), data-driven verification summary in findings list, Object.hasOwn illustration lookup, tests for matrix/countUpFrame/state×role; RED→GREEN (hotspot test written after seed change); 60/60.
- Task 6c: proportional bars without min-width (labels only for ≥8% segments), hero stepper connectors, visible blueprint grid (8%/14% major), docs de-"ficticio" + design-system "Lenguaje visual actual"; styling/docs so test-first N/A; 60/60; screenshots checked (hero, heatmap hotspot, projects).
- Task 6c review advisory (follow-up, task 7): R3-hidden-project-counts — tiny project segments show their value only in a title tooltip (not visible/accessible without hover).
- Task 7 (part): project card header compacted (code+status row, title, meta with coordination, full-width progress) per user feedback; screenshot checked.
- Task 7 walkthrough (gentle-ai-verify): full H-001 script passed at 1440/390/1024, no console/hydration errors. Issues to fix: mobile /analisis horizontal overflow (sr-only text in heatmap), wide tables without scroll affordance on 390/1024 (hallazgos, proyectos/p1 visitas), dialog stale validation errors, internal evidence IDs in options, attach hint/order, inspector panel copy for Abierto, duplicated timeline transition text, mixed date formats, "datos vN" internal text, source chips external icon without new tab, plural "1 hallazgos", header scope select clipped at 390, stepper wrap at 1024, sticky status banner, tú/usted copy, spacing; plus guion-demo.md refresh.
- Task 7 fixes: no horizontal overflow at 390 (analisis/hallazgos/home measured), findings as cards below md, scroll shadows on tables, dialog live validation + human evidence labels, state-aware workflow copy, single timeline transition, unified DD/MM/YYYY · HH:MM dates (src/lib/format.ts), pluralize, header wraps at 390, compact stepper below xl, status banner clears on route change, usted copy; guion-demo.md rewritten; RED→GREEN format tests; 64/64; screenshots 390/1024/1440 checked. Remaining: P-001 visits table still needs horizontal scroll at 1440 (scroll shadow shown); H-001 seed sample correction evidence; reset edge cases; free-text specialty.
- Task 7 reviews approved (review-c0b2a0e3a9c7e124, review-4ca5771fc7c27385 covering 09c7323). Advisories (follow-up): mobile finding cards hide header column filters (Filtros button remains); status notice navigation timing heuristic (status.tsx:26).
