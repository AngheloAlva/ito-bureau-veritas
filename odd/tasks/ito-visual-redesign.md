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
- [ ] 2. Data and copy: varied responsible people, remove "(ficticio)" suffixes, consolidate defensive microcopy, single demo-data notice.
- [ ] 3. Overview: KPI tiles, finding lifecycle flow, real-data charts, animated counters, H-001 easy to locate.
- [ ] 4. Analysis: scanning animation, staggered results, per-finding specific reasons, project × specialty heatmap.
- [ ] 5. Finding detail + header: lifecycle stepper hero with primary action on top; visible demo role switcher.
- [ ] 6. Technical SVG line illustrations for projects and empty states.
- [ ] 7. Browser verification of the demo script and docs update.

## Evidence

(commit ids recorded per task)

- Task 1: typecheck clean, 44/44 tests, `rounded-none` count 0, overview screenshot checked. Commit: see `feat(ui): near-square radius, mono codes, brand accents`.
