# ODD feature: ITO polish round 2 (pre-official review)

Locator: `odd/tasks/ito-polish-round-2.md` · Engram mirror `odd/ito-polish-round-2/tasks`
Branch: `feat/polish-round-2` (from `feat/executive-dashboard` @ 7cae477, == main). Prod: https://ito-bureau-veritas.vercel.app (auto-deploy from main).

## Objective
Refine the demo before the official Monday showing following the user's review: simpler AI area, no redundant
"simulado" pills, consistent and more beautiful executive dashboard (EvilCharts), floating draggable filter panel with
manual filters, remove AI-looking colored side stripes everywhere, fix map card border/badges with status icons.

## Decisions (user, 2026-10-09)
- Keep ONLY the discreet sidebar footer disclaimer; remove every "Simulado · datos ficticios"/"Ilustrativo"/"Simulado" pill.
- EvilCharts with the Recharts engine (shadcn registry @evilcharts/recharts-*), new deps allowed for this.
- Unify "Análisis asistido" + "Asistente IA" as chat-first "Análisis IA": analysis-and-prioritize becomes a chat action
  whose answer contains priorities, concentration heatmap and printable report.
- Filters: floating, draggable, collapsible panel with manual "Agregar filtro".
- Design skills must be loaded by writers: interface-design, better-ui, better-layout, emil-design-eng, frontend-design.
- Site map rationale (for the cousin): built from project plot plans/P&IDs (ACONEX) + equipment TAG list; inspections and
  findings record area/TAG (Finding.location exists) → spatial view of existing records; requirement to state.

## Tasks
- [x] R1 Dashboard (writer A): consistent KPI cards (each with a mini visual), EvilCharts (Recharts) for donut/bars/
      histogram/S-curve/client bars/custom charts preserving cross-filter clicks + highlight, floating draggable collapsible
      filter panel with manual add, remove colored side stripes in tree nodes, remove pills in dashboard.
- [x] R2 AI unification (writer B): single /analisis "Análisis IA" chat-first page, /asistente redirects, nav single item,
      analysis-run as chat action with priorities/heatmap/report artifact, remove pills in these files.
- [x] R3 Global cleanup (writer C): remove pills elsewhere (program, site-map), remove colored side stripes
      (site-map zone cards, chronology, any other), map card border fix, badges padding-x + status icon (shared Badge).
- [x] R4 Integrate, verify (test/typecheck/lint/build + browser), merge to main, confirm Vercel deploy.

## Progress / evidence
- R3 done: 7105d46 (StatusBadge with icon mapping + padding, shared Badge uses it; stripes removed in site-map/chronology; pills removed in program/site-map; map zone cards rebalanced). Writer: tests 109/109, lint 0 errors; typecheck failures only in R1 in-progress files. Parent: eslint clean on R3 files; /tmp/r3-mapa.png and /tmp/r3-hallazgos.png reviewed. Gap: ui/badge.tsx primitive untouched (uppercase) for other callers.
- R2 done: chat-first /analisis 'Análisis IA' (analysis intent RED→GREEN, 109/109), /asistente server redirect keeps scope, single nav item, in-bubble 4-stage run + analysis artifact + printable report; overview link copy fixed. Parent reviewed /tmp/r2-initial.png, /tmp/r2-analysis2.png.
- R1 done: 7e37b76 (EvilCharts recharts 3.10.1 + motion 14.0.0, chart-kit wrapper keeps cross-filter/dimming/keyboard, 6 consistent KPI cards, floating draggable filter dock with manual add, tree stripe removed). Writer used `rm` on unused chart-tooltip.tsx (forbidden; restorable from git; accepted as dead file).
- R4: gentle-ai-verify 109/109, typecheck, lint, build PASS, prod CSS ok, 8 routes 200, /asistente browser redirect OK, curve lines visible (/tmp/v2-curve.png reviewed), legend cross-filter + dock chip OK, analysis artifact OK, 0 console errors. README/guion updated; merged to main and pushed.
