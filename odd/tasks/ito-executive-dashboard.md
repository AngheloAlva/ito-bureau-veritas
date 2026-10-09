# ODD feature: ITO executive dashboard (beyond Power BI)

Locator: `odd/tasks/ito-executive-dashboard.md` · Engram mirror `odd/ito-executive-dashboard/tasks`
Branch: `feat/executive-dashboard` (from `feat/visual-redesign` @ 28b06f0)

## Objective
Make the demo win the tender impression: friendlier visual identity (away from BV web look), an executive
dashboard for managers who visit monthly (summary first, drill down on demand), milestones/Gantt
(bases: "1.3 Hitos", "Programa de trabajo", "Sistema de control de avances", §8.1.1 dashboard strategic→operational,
§9.2.10 dashboards/alerts/consultation), AI assistant with chat + generated charts, interactive illustrated diagram.

## Constraints
- Internal showing today (~2.5 h from 2026-10-09 ~12:00); official showing Monday. Today: T1–T3 (+T4 if time).
- UI copy neutral Spanish (usted); code/commits English. Keep official BV logo. Fictitious data, "Simulado" labels stay.
- No new runtime dependencies today (custom SVG/CSS charts). Next.js 16: read node_modules/next/dist/docs when touching Next APIs.
- Parallel writers approved by user for disjoint files (T1 visual, T2 data).
- Portfolio data is static deterministic (not persisted) and composes with live repository data.

## Tasks
- [x] T1 Visual language refresh: friendly "light engineering" (navy ink + copper accent, warm neutrals, larger radius,
      soft shadows, rich status color system for finding states, severities, project and milestone states).
- [x] T2 Portfolio data: clients (mandantes), ~42 projects (incl. p1–p3), milestones with planned/actual dates,
      status, responsible; pure analytics selectors (KPIs, decomposition tree, buckets, clients, problem projects, cross-filter) + tests.
- [ ] T3 Executive dashboard `/tablero`: KPIs, interactive horizontal decomposition tree, donut, histogram, client bars,
      problem projects table; global cross-filter in URL with chips; drill-through links; nav entry.
- [ ] T4 Programa: portfolio Gantt (planned dashed vs actual solid, today line, tooltip) + project milestone line on project detail.
- [ ] T5 AI assistant: visible project picker, simulated chat with suggested prompts, answers with generated charts, pin to dashboard.
- [ ] T6 Chart builder (metric × dimension × chart type) + saved views on dashboard.
- [ ] T7 Interactive illustrated site diagram (pumping station / gallery / water pipeline) with critical points + side panel.
- [ ] T8 Remove header scope selector (page-level scope), polish, docs (README, guion), full verification.

## Acceptance / checks
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build` pass; browser screenshots at 1440×900 per new view.
- Clicking any chart element filters every other visual; filters visible as removable chips and in URL.

## Progress / evidence
- T1 done: commit c763972. Tokens: --tone-<name>-fg|bg|solid, --chart-1..8, --copper, shadow-card; src/lib/tones.ts maps. Checks: typecheck/lint clean in T1 files; pre-existing lint error src/components/layout/status.tsx:18 (set-state-in-effect) → fix in T8. Screenshot /tmp/p-home.png reviewed.
- T2 done: commit db9310b. RED (module not found) → GREEN 77/77, typecheck clean. 42 projects 24/13/5, 274 milestones; late situations thin (Atraso>30 d = 1) → consider tuning in T8.
- T3 (/tablero) and T4 (/programa + project milestone line) running in parallel on disjoint surfaces; parent adds /programa nav entry after T3.
- Native RDD review deferred until after the internal showing (workspace held parallel in-progress files).

## Next step
Launch T1 and T2 in parallel.
