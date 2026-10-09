# ODD feature: ITO polish round 3 (final details)

Locator: `odd/tasks/ito-polish-round-3.md` · Engram mirror `odd/ito-polish-round-3/tasks`
Branch: `feat/polish-round-3` (from main @ 488b821). Prod auto-deploys from main.

## Objective
Final visual details from the user's review: dashboard canvas feel and chart grids, chart animation on filter change,
and friendlier form controls (white fields with full borders, compact filter popover, rounded tables, aligned dialog actions).

## Tasks
- [x] P1 Dashboard (writer A): dotted canvas background in decomposition tree; grid lines (horizontal/vertical as fits)
      on all dashboard charts like the S-curve; charts animate when filters change (not only on reload).
- [x] P2 Controls (writer B): inputs/selects/textarea/date trigger with full rounded border + white background (no
      underline-only); search input + Filtros button white; compact filter popovers (smaller selects, tighter gaps);
      tables with proper rounded corners (header corner cell); form dialog actions on one row (Cancelar + primary).
- [x] P3 Integrate, verify, merge to main, confirm Vercel.

- [x] P4 Final touches: even vertical gaps in create dialogs; 'Evidencia de corrección' placeholder not selectable; site-map zone cards health badge right-aligned on title row + 2–4px more bottom padding.

## Progress / evidence
- P1 done: root cause = vendored EvilCharts bar/area hard-coded isAnimationActive={false} with mount-only intro; now Recharts tween (450ms) after intro, reduced-motion off. Grid via chart-kit CategoryBars + client bars; dotted tree canvas. Writer: 109/109, typecheck, lint; parent reviewed /tmp/p1-tree.png, /tmp/p1-anim-800.png. No unit RED (presentation-only).

- P2 done: 97a4715 (bordered white controls, compact popovers, rounded tables, FormActions one-row footer) + header alignment fix. Verify (gentle-ai-verify): 109/109, typecheck, lint, build PASS; dialogs/table/H-001/tablero visual checks OK, 0 console errors. Minor follow-ups: uneven dialog row gaps; 'Evidencia de corrección' placeholder selectable.
- P3: merged to main and pushed (Vercel auto-deploy).
- P4 done: field.tsx 16px rows/6px label gaps, select-field excludes required placeholders from list (filter resets kept), start-aligned form grids, map badges on title row + extra bottom padding. Writer: typecheck, lint, 109/109; parent reviewed /tmp/p4-mapa.png, p4-finding-dialog.png, p4-evidence-select.png. Pushed to main; Vercel build serves as production build check.
