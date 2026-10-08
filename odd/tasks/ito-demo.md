# ITO demo — P0 tasks

## Objective
Implement ESPECIFICACION_DEMO_ITO_IA.md as a runnable Spanish demonstration, not production compliance software.

## Scope and constraints
3 projects, 8 inspections, approximately 18 findings; deterministic simulated analysis; local browser persistence; fixed reference 2026-10-08 America/Santiago. pnpm only. Preserve original specification. No external integrations, real authentication, publication or deployment. Changes confined to this project inside /Users/anghelo/Dev Git root. No commits without explicit user request.

## Tasks
- [x] T1 (done): Domain, coherent seed, versioned persistence, transitions, indicators and analysis with focused test-first checks.
- [x] T2 (done): Complete Spanish responsive UI, routes, forms, role-specific H-001 lifecycle, opening fictional assets and analysis report.
- [x] T3 (done): Independent functional/browser verification, corrections, README, 5–7 minute script and honest limitations.

## Acceptance
Specification P0 acceptance criteria. Required checks: domain tests, typecheck, lint, build and desktop/mobile browser flow if available. Record actual evidence only.

## Progress and evidence
Environment: Node v24.19.0; pnpm 11.1.0; installed Next 16.4.0 / React 19.3.0. Git root /Users/anghelo/Dev; no mutations outside demo authorized. RDD on globally.

## Next step
Independently verify T3. T2 evidence: pnpm test 7/7, typecheck, lint and build passed. Spanish routes, forms, roles and docs implemented; browser unverified. T1 evidence: pnpm test passed 5 tests after observed RED; pnpm typecheck passed. Build/lint/browser pending. Commit evidence: not requested, not performed.

## Independent verification and correction
7/7 tests, typecheck, lint, build passed independently. Browser H-001 lifecycle, mandatory fields, persistence, analysis freshness, mobile creation, reset/scopes/keyboard verified. Desktop 1440/mobile 390 images inspected with no page overflow. Corrections in progress: instant-unrendered-segment dev errors from experimental navigation configuration; seed correction evidence reused H-001-specific text for other findings. Native review unavailable: ancestor Git root contains unrelated nested repositories; independent verification used instead. Final focused browser retest pending.

## Final verified outcome
Corrections passed RED/GREEN asset regression: 8/8 tests. Writer reran typecheck/lint/build successfully. Independent focused retest: 8/8 tests; 12 linked development pages with zero console errors; actual return/resubmit/close preserved six events after reload; 14/6 active/overdue ->13/5 closed ->14/6 reset. Nine-page production smoke with zero console messages. Desktop 1440/mobile 390 screenshots inspected. Own servers stopped. No deployment/commits. Remaining: no full WCAG/screen-reader/physical-device coverage or complete production lifecycle rerun; analysis session-only (not retained after reload); Node informational module warning; native review blocked by unrelated repos under ancestor Git. Next: run pnpm dev or pnpm build && pnpm start and rehearse docs/guion-demo.md.
