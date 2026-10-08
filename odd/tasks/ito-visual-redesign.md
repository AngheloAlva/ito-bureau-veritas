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
- [ ] 4. Analysis: scanning animation, staggered results, per-finding specific reasons, project × specialty heatmap.
- [ ] 5. Finding detail + header: lifecycle stepper hero with primary action on top; visible demo role switcher.
- [ ] 6. Technical SVG line illustrations for projects and empty states.
- [ ] 7. Browser verification of the demo script and docs update.

## Evidence

(commit ids recorded per task)

- Task 1: typecheck clean, 44/44 tests, `rounded-none` count 0, overview screenshot checked. Commit `10d8b82`; native review `review-625b4607fd5edd3e` approved and acknowledged.
- Task 2: roster of 6 people (H-001 stays with Diego Soto), "(ficticio)" suffixes removed, single sidebar notice "Demo con datos ficticios · sin conexión a sistemas BV"; RED→GREEN on roster/evidence tests; typecheck clean, 45/45 tests. Follow-up: docs/verificacion.md, docs/alcance.md, docs/design-system.md still mention "ficticio" (task 7).
- Task 2 follow-up: seed correction evidence/transitions attributed to the assigned responsible (review advisory R3-seed-correction-attribution); RED→GREEN, 46/46 tests.
- Task 3: KPI tiles with hydration-safe count-up, lifecycle strip with filtered links, severity stacked bar, project active/closed bars, H-001 highlighted "Caso de demostración"; RED→GREEN on overview-charts helpers; typecheck clean, 49/49 tests; screenshots checked.
