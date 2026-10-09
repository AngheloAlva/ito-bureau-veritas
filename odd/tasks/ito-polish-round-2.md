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
- [ ] R1 Dashboard (writer A): consistent KPI cards (each with a mini visual), EvilCharts (Recharts) for donut/bars/
      histogram/S-curve/client bars/custom charts preserving cross-filter clicks + highlight, floating draggable collapsible
      filter panel with manual add, remove colored side stripes in tree nodes, remove pills in dashboard.
- [ ] R2 AI unification (writer B): single /analisis "Análisis IA" chat-first page, /asistente redirects, nav single item,
      analysis-run as chat action with priorities/heatmap/report artifact, remove pills in these files.
- [ ] R3 Global cleanup (writer C): remove pills elsewhere (program, site-map), remove colored side stripes
      (site-map zone cards, chronology, any other), map card border fix, badges padding-x + status icon (shared Badge).
- [ ] R4 Integrate, verify (test/typecheck/lint/build + browser), merge to main, confirm Vercel deploy.

## Progress / evidence
- (pending)
