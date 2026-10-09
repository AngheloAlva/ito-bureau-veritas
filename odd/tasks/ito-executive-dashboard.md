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
- [x] T3 Executive dashboard `/tablero`: KPIs, interactive horizontal decomposition tree, donut, histogram, client bars,
      problem projects table; global cross-filter in URL with chips; drill-through links; nav entry.
- [x] T4 Programa: portfolio Gantt (planned dashed vs actual solid, today line, tooltip) + project milestone line on project detail.
- [x] T5 AI assistant: visible project picker, simulated chat with suggested prompts, answers with generated charts, pin to dashboard.
- [ ] T6 Chart builder (metric × dimension × chart type) + saved views on dashboard.
- [x] T7 Interactive illustrated site diagram (pumping station / gallery / water pipeline) with critical points + side panel.
- [ ] T8 Remove header scope selector (page-level scope), polish, docs (README, guion), full verification.

## Acceptance / checks
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build` pass; browser screenshots at 1440×900 per new view.
- Clicking any chart element filters every other visual; filters visible as removable chips and in URL.

## Progress / evidence
- T1 done: commit c763972. Tokens: --tone-<name>-fg|bg|solid, --chart-1..8, --copper, shadow-card; src/lib/tones.ts maps. Checks: typecheck/lint clean in T1 files; pre-existing lint error src/components/layout/status.tsx:18 (set-state-in-effect) → fix in T8. Screenshot /tmp/p-home.png reviewed.
- T2 done: commit db9310b. RED (module not found) → GREEN 77/77, typecheck clean. 42 projects 24/13/5, 274 milestones; late situations thin (Atraso>30 d = 1) → consider tuning in T8.
- T3 (/tablero) and T4 (/programa + project milestone line) running in parallel on disjoint surfaces; parent adds /programa nav entry after T3.
- T4 done: commit 82b56dc (/programa Gantt, project 'Hitos del proyecto' stepper + mini-Gantt). Tests 85/85 incl. 4 gantt-scale (no RED captured — writer implemented first; disclosed). Screenshots /tmp/t4-programa.png, /tmp/t4-p2.png reviewed. Pending: /programa nav entry (after T3 frees sidebar), Trimestre scale not screenshotted.
- T3 done: commit b8f517b (/tablero: KPIs, decomposition tree, donut, histogram, situation bars, client bars, S-curve, problem table; URL cross-filter + chips + copy link). RED (chart-geometry module missing) → GREEN. Browser: legend + tree path cross-filter verified by writer; parent reviewed /tmp/p-tab.png. Follow-ups (T8): delay values cluster at 26 d (data tuning), S-curve deviation callout semantics, tree auto-scroll hides root.
- Nav: /programa + /asistente entries added (separate commit).
- T5 done: commit f23484f (/asistente chat: 7 intents, thinking steps, streaming, KPI/bar/donut/line/table/draft artifacts with 'Abrir en el tablero'; /analisis visible scope picker + callout). RED (module missing) → GREEN 94/94. Pin-to-dashboard deferred (T6). Screenshots /tmp/t5-chat.png, /tmp/t5-analisis.png reviewed.
- Verification (gentle-ai-verify, 12:28–12:30): test 94/94, typecheck, lint, build PASS; 11 routes smoke OK (no overlays/console errors); /tablero client cross-filter PASS. status.tsx lint fix committed 32e5d2f. Parent finished /asistente donut + S-curve checks on prod build (:3001).
- Incident: user's ito dev server on :3000 stopped; BIMAKERS dev server took :3000 at 12:30 (untouched). Prod build served stale CSS from .next/cache/turbopack → cache moved to /tmp, rebuilt, CSS verified (copper tokens present). Prod server left running on :3001 for the showing.
- T7 done: commit 8530d31 (/mapa: SVG site diagram, PUNTO CRÍTICO hotspots, layers Hallazgos/Hitos/Flujo, Sheet detail panel). RED (module missing) → GREEN 98/98 per writer; typecheck/lint clean per writer; parent prod rebuild PASS, 6 routes 200, /mapa + /tablero prod screenshots reviewed, 0 console errors. Known: Sheet close sr-only label English; modal sheet blocks clicking other equipment.
- Prod server running on :3001 (rebuilt 12:48) for internal showing.

## Monday backlog (T6, T8)
- T6 chart builder + saved views; assistant 'fijar al tablero'.
- T8: remove header scope selector; tune portfolio delays (values cluster at 26 d, only 1 milestone >30 d); S-curve deviation callout; tree auto-scroll hides root; Sheet sr-only 'Close' → 'Cerrar'; README/guion update; native RDD review of commits c763972..8530d31.
- Native RDD review deferred until after the internal showing (workspace held parallel in-progress files).

## Next step
Internal showing today on :3001; then Monday backlog T6/T8.
