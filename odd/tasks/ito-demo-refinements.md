# ITO demo refinements

Branch: `feat/visual-redesign` (baseline `5d6ce1c`). Goal: remove friction found while rehearsing — role switching, tall tables without pagination, and a finding detail split into too many small cards.

## Decisions

- Single demo identity with every permission: remove the "Viendo como" switcher and the role/persona selects; the user menu keeps only "Restablecer demo". Business rules stay (corrective action + correction evidence to submit; comment to close/return). The timeline keeps the role each step represents.
- Finding detail: description moves into the hero; the "Siguiente paso" card disappears and its primary action plus correction/verification forms live in the hero under the stepper. Below: Evidencias (main) and Responsable y plazo + Cronología (side).
- Tables: one-line compact rows, visit origin in its own column, horizontal scroll with column min-widths, more header filters (project, responsible/inspector), client-side pagination (10 per page) with result totals. Applies to findings and visits tables.
- Baseline: 14 test files, `pnpm test`.

## Tasks

- [x] 1. Single demo identity: domain permissions, demo provider/controls, hero action without role switching, tests updated.
- [x] 2. Finding detail consolidation: description in hero, workflow actions/forms in hero, remove "Siguiente paso" card.
- [x] 3. Tables: compact rows, origin column, horizontal scroll, extra header filters, pagination.
- [ ] 4. Browser verification of the H-001 script and docs update (docs/guion-demo.md).

## Evidence

(commit ids recorded per task)

- Task 1: role gates removed in domain/UI, `asRole` attribution (correction → assigned responsible, verification/assignment/creation → Inspector); 63/63 tests, typecheck clean; lint has 1 pre-existing error in `src/components/layout/status.tsx` (untouched). RED not observed separately (old role assertions failed before rewrite). Commit `76a2b60`; native review `review-62435d33aff52f48` approved and acknowledged. Follow-up: docs/guion-demo.md lines 5/19/25 still describe role switching (task 4).
- Task 2: description in hero, inline correction (on demand) and verification forms in hero, Detection/Workflow cards removed, 2-column grid; 63/63 tests, typecheck clean; screenshots open/correction at 1440/390 checked. Commit `2c6a4e8`; native review `review-8c47ea7d9ed138ba` approved and acknowledged. Advisory R3-verification-state-leak (hero.tsx Verification without key) fixed in task 3 commit.
- Task 3: compact 44px one-line rows (code/title/origin columns, sticky code), horizontal scroll, header filters project/responsible (findings) and project/inspector/specialty (visits), 10-row pagination (URL `page` on list views, local state embedded); RED (paginate module missing) → GREEN 67/67; typecheck clean; screenshots /hallazgos 1440 + filter checked. Commit `d97d89b`; native review `review-8ef4855b6a16bbed` approved and acknowledged. Advisory R3-url-pagination-coverage (no test for page reset in updateListFilters). Not visually checked: embedded tables in project/visit detail, mobile pager after fix (task 4).
