# ITO Bureau Veritas UI redesign

## Objective
Integrate user preset b1oVykTo with --pointer into existing Next application, replace native controls with shadcn primitives and reorganize presentation into maintainable components, visually based on https://www.bureauveritas.cl/es with explicitly requested logo.

## Scope and constraints
Spanish UI; pnpm only, preserve domain/persistence and 13-test baseline; no new project, Zustand, backend, real AI, deployment or commits. Existing user dev server must remain untouched. User explicitly requested BV logo: keep demo/fictitious notice, no assertion of institutional endorsement. Use CLI-recommended Base UI (preset does not encode base), Sera/Geist/Phosphor/neutral preset. Brand blue #00049e / graphite #333 / white. Geist locally bundled if possible to preserve visual font without Google-network build requirement. Never overwrite provider/analysis-store nesting. CSS legacy element selectors must not leak into generated primitives.

## Tasks
- [x] T1 (done): Prepare Tailwind CSS; initialize existing project with preset/--pointer and Base UI; add needed shadcn source components; local official logo/provenance and font; verify integration.
- [x] T2 (done): Rebuild shell/shared records/dashboard/projects/analysis using coherent brand tokens, accessible cards/tables/navigation and maintainable component boundaries.
- [x] T3 (done): Split large inspection/finding/form modules; replace native selects/inputs/date/checkbox/confirm controls with shadcn; retain field serialization, role permissions, required validation and timezone-safe dates.
- [x] T4 (done): Independent browser regression/desktop-mobile-keyboard review; three scoped visual corrections verified and final docs read back.

## Acceptance
Preset recorded in components.json, pointer buttons, no native select/date visible where requested custom equivalents. All routes and H001 workflow still work, persisted user records preserved, dates/overdue confirmation correct, selectors/date picker/reset dialog keyboard accessible. Brand asset original local SVG attributed to official site, explicit demo notice. Desktop/mobile intentional readable hierarchy and no overflow. Tests/typecheck/lint/build and independent functional browser verification.

## Evidence and design brief
Preflight shadcn4.21.3: Tailwind v4 package present but tailwindCss:null (missing @import). Init --pointer boolean; no image argument. Official site inspected /tmp/ito-brand-home.png. White SVG from .site-logo--inner CSS, viewBox0 0 111 138, SHA256 bb5155a179faa68add95415a2757373cf9f796a2c1094c48923db946cc9c3090. Interface domain: visits, findings, evidence, verification, commitments, traceability. Signature: visit-to-closure chronology and overdue work queue, not marketing hero. Palette: official blue actions, graphite brand rail, white paper-like content, gray dividers and restrained semantic status tokens. Reject oversized decorative hero, templated uniform card-only dashboard and broad ad-hoc CSS. Prefer compact controls with operational focal queue, 4px spacing rhythm and restrained surface borders.

## Next step
Delivery complete; user can review the running local demo. No commit or deployment performed per explicit constraint. Comprehensive accessibility/cross-browser/physical print pagination remain optional follow-up checks, not claimed passes.

T1 evidence: actual shadcn4.21.3 init --preset b1oVykTo --base base --pointer; 21 official components added, local Geist1.7.2, exact logo hash matched. 13/13 tests, typecheck/lint/build pass; generated mobile hook lint/focus ref corrected. Ordinary passive integration checks (not fabricated RED). Legacy CSS temporarily isolated with @scope; remove reliance after migration. Browser pending.

T2 evidence: modular layout/records/overview/projects/analysis, Base Select context and AlertDialog reset; 13/13 tests/types/lint/build pass. Domain/AnalysisStore/scope/hydration retained. Visual/browser not yet verified. Legacy forms left for T3.

T3 evidence: modular inspection/finding/forms plus custom Select/Date/Check fields, pure date/validation utils observed RED missing modules->GREEN18 tests including DST; typecheck/lint/build pass. Legacy bridge/body class removed; domain/data untouched. Browser T4 pending.

## T4 final evidence
Initial independent verifier muyr3zdx-f-llkk observed tests18/18/types/lint/build pass and all5 navigation/scopes/details, creation validation/focus/value preservation, Spanish Calendar/Select/Sheet/reset keyboard, I009/H019 persisted2026-10-07, date-change overdue-confirmation reset, detection evidence attribution/resource/history and visit-completion independence. H001 full correction→pending→return→resubmit→close persisted actor/comments/evidence/history;14active6overdue pending,13/5closed. Stale analysis/regeneration/source/report and confirmed reset seed18findings8visits0inspectionEvents passed. Migration/corrupt-data protection existing tests+source; not exhaustively browser-repeated in this phase.

Initial visual rejection prompted bounded writer muyrikua-g-nnll: ordinary responsive identity grid removes inline-size containment collapse at1024/1440; Base UI --available-width popup cap and wrapping removes5px overflow at320/390; separated analysis workspace and no-print session notices preserve report-only output. Writer observed18/18/types/lint/build pass. Computed browser-layout RED was observed by verifier; no applicable deterministic Node layout test, no invented TDD.

Independent retest muyrkxo6-h-ri20 PASS: identity triggers246px at1440/1024,350px390,280px320; document width equals viewport. Calendar288px, right328 at390/right315 at320, no overflow; keyboard/focus/date2026-10-07 passed. Report-only print retains nonempty text, reference/source/disclaimer AND DESACTUALIZADO after data change; normal screen retains controls. Role/person/Sheet/reset/data-persistence smoke passed. Final tests18/18/types/lint pass; reused writer production build rather than rebuilding. Full H001 cycle not repeated after purely presentation fixes. Existing Node module-type warnings unchanged.92localhost requests no4xx/5xx, local font/logo200/304, finalconsole0errors/warnings (earlier mobile unused-logo-preload warning not reproduced).

Screenshot images actually read by verifier in /tmp/ito-brand-ui-verify and /tmp/ito-brand-ui-retest (identity1440/1024/390/320,calendar390/320,print-report,print-report-stale,analysis-screen-stale); temporary artifacts, not durable repository captures. Browsers closed and confirmed own production processes terminated;4173refused, user dev untouched.

Documentation worker muyrp89r-i-1fka updated README.md and docs/verificacion.md; parent read back delivery/result/limitations and matching anchor. No source/domain changes during documentation; passive structural check only. Native inspect/assess blocked unrelated IngSimple nested repository under ancestor Git /Users/anghelo/Dev; no authority created or native approval claimed; independent verification completed, no ancestor changes. Physical print pagination, comprehensive WCAG/screenreader, cross-browser/physical devices not verified. No commits or publication per explicit user constraint; original specification preserved.
