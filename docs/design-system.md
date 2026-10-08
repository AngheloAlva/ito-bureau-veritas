# Sistema de diseño ITO

Control operativo T1–T4 verificado tras corregir densidad; revisión humana del usuario pendiente. Evidencia y límites: [cierre operativo T4](verificacion.md#cierre-operativo-t4). Se conserva debajo la historia previa.

## Control operativo — T1 (verificado)

- Detalle de proyecto: columnas 3:2 desde `xl`, sin ancho fijo de cronología; una columna debajo de ese breakpoint. Contexto compacto con estado y avance físico etiquetado arriba, metadatos agrupados y enlaces de hallazgos en superficie neutra. «Analizar proyecto» es un enlace independiente con el gradiente existente reservado al análisis simulado.
- Tarjetas de cartera: el mismo avance físico arriba y recuentos enlazados subordinados al nombre de obra. Se eliminan notas ficticias repetidas; la declaración Demo global permanece. El avance sigue siendo un dato declarado, no un cálculo de cierre.
- Firma de trazabilidad: cada visita contiene sus hallazgos; cada hallazgo muestra acción correctiva real y última transición registrada desde pendiente de verificación, con fecha, actor y comentario. La ausencia de datos se declara, sin reconstruir historia. Se conservan vistas previas y últimos movimientos.
- Sin sticky: contexto izquierdo en flujo normal. Aunque el bloque compacto cabe, fijarlo en la misma pila cubriría contenido inferior. No hay scroll vertical anidado ni controles clonados.
- Composición sin nuevo helper determinista: excepción de RED unitario para presentación. T4 verificó funcionalidad, densidad, desbordamiento y teclado; no acredita accesibilidad integral.

## Control operativo — T2 (verificado)

- Tablas: superficie `card` delimitada, cabecera `muted/50`, separadores y resaltado de fila tanto por hover como por foco interior. Código/metadatos quedan subordinados al título; fechas y cantidades usan números tabulares, recuentos alineados a la derecha. El contenedor limita su ancho y permite desplazamiento horizontal con foco visible para teclado, sin scroll vertical anidado.
- Filtros: disparador general `sm` con mínimo 40 px. `ColumnFilter` compone Popover y controles existentes, sin motor de tabla: estado, severidad y categorías de vencimiento existentes en hallazgos; desde/hasta y estado de visita en inspecciones. Valores/callbacks tipados opcionales: las tablas de proyecto/ficha no reciben controles. Con filtros y cero resultados se conservan cabeceras para poder recuperarse.
- La URL sigue siendo la única fuente: mismas funciones de cambio, chips y recuento para barra/columnas; elecciones añaden historial, escritura de búsqueda lo reemplaza. `visitState` valida opciones y se elimina al limpiar inspecciones. Se conservan parámetros ajenos duplicados, `new`, fragmento y alcance heredado frente a `project=` explícito. No se añade rango exacto de plazo ni se cambian vistas previas.
- RED observado: el nuevo test de `visitState` obtuvo `undefined` en vez de `Completada`; GREEN: 39/39 tests, tipos y lint pasan. Regresiones cubren valores inválidos/vacíos, limpieza, duplicados y snapshots de historial. Presentación sin RED unitario artificial. T4 comprobó sincronización, teclado, atrás/adelante, alcance, cero resultados, recuperación de foco y vistas previas. Tamaños y límites de reflow en el cierre operativo; servidor del usuario intacto.

## Control operativo — T3 (verificado)

- Mesa de control: la cola ocupa 5:2 frente al balance desde `xl`; debajo se apila sin scroll vertical anidado. Ya no hay cuatro tarjetas KPI iguales ni porcentaje de cierre duplicado. Cola única de vencidos/críticos activos, críticos primero y luego compromiso/código; razón textual, estado, severidad, responsable, fecha y enlaces a ficha y visita de origen. El atraso no se presenta como falla técnica.
- Balance compacto: selectores `indicators` conservados, agregado global/proyecto sin filtro por rol. Vencidos y críticos pueden solaparse, no se suman. Enlaces mantienen filtros existentes; «Cerrado» representa estado, no certificación del respaldo. Distribuciones subordinadas y vacío explícito. Avance físico no se calcula ni se equipara al cierre.
- Banda de trazabilidad: cohorte de visitas del 01–08/10/2026, completadas y programadas separadas; hallazgos relacionados mediante `inspectionId` hasta el corte. Correcciones por verificar requieren estado pendiente, acción y evidencia de corrección disponible al corte. Cierres acreditados requieren además estado Cerrado y transición desde pendiente, actor inspector, comentario y fecha hasta el corte. Datos migrados sin evento no reciben historia inventada. No es embudo aditivo ni medición de trabajo completado durante el período: estados actuales con registros al corte, como indica la interfaz. Cada etapa despliega enlaces individuales al conjunto exacto contado, sin filtros aproximados.
- Superficies y Geist existentes; ritmo 4 px, cola 20 px por fila, banda 24 px entre etapas, acentos danger/success acotados y texto redundante. No se amplía el gradiente de análisis ni se cambian primitives, permisos, dominio o dependencias.
- RED observado: nuevo test falla por módulo de trazabilidad inexistente (39 pasan, 1 falla). GREEN: 44/44 pasan; `pnpm typecheck` y `pnpm lint` pasan. Cinco pruebas cubren alcance, límites inclusivos, estado de visita, relación, fecha de hallazgo/evidencia/evento, acción, rol verificador y vacío. Composición: excepción de RED unitario, sin simulación de evidencia visual. T4 verificó foco/teclado de disclosures, enlaces y jerarquía tras la corrección. Acumulativo: 44/44, tipos/lint/build PASS; retest enfocado reutilizó el build del escritor. Servidor existente intacto.

## Corrección acotada — T4 (retest independiente PASS)

- Cola: tres prioridades iniciales con código, título, razón, estado, severidad y compromiso visibles. El total de hallazgos únicos sigue explícito; «Mostrar todos» despliega los restantes una sola vez, en el mismo orden, sin filtrar ni duplicar registros. Contexto, responsable y siguiente revisión usan disclosure por hallazgo; ficha y visita conservan enlaces independientes.
- Cronología: visitas y código/título/estado/severidad de cada hallazgo siempre visibles. Corrección y última verificación reales se consultan por hallazgo; la ausencia se indica brevemente. Los últimos movimientos están cerrados inicialmente, con cantidad visible y acceso al historial completo mediante los registros de origen.
- Disclosures nativos `details/summary`: área mínima de 44 px, foco visible, texto íntegro y flujo normal. Sin estado React duplicado, sticky, scroll vertical interno ni reducción de tipografía para forzar medidas. Se conserva la banda de trazabilidad después de la composición principal. Seed: tres prioridades iniciales y ocho en total. A 1440 × 900, cola 1859,75→629,5 px y banda Y=2106,75→876,5: solo su borde superior llega al primer viewport, no toda la banda. Cronología 3240,5→1728,5 px; vacío izquierdo 2264,25→752,25 px. Las 24 configuraciones predeterminadas/expandidas pasaron sin overflow, scroll vertical anidado ni etiquetas esenciales recortadas; summaries 44–48 px, Enter/Espacio y foco de 2 px verificados. Reflow equivalente a 200 %, no zoom nativo.

## Refinamiento previo — T6

Se conserva Base UI/shadcn con preset **b1oVykTo**, comportamiento pointer, Geist local y logo original. Los apartados T1–T4 siguientes son documentación histórica de instalación/composición, no una descripción literal de toda la interfaz actual.

- **Jerarquía:** cabecera única compacta de 61 px con logo/título horizontal, icono de panel lateral e identidad en Popover; una sola persona y Demo discreto. Se retiraron atribución IngSimple y avisos contractuales/no respaldo repetidos de la interfaz, no la declaración del informe ni la procedencia documentada del logo.
- **Contexto:** filtros en Popover y chips removibles; CreationDialogs y una única RecordPreview viva contextual, con regreso finito y enlace a ficha completa. Relación visita–hallazgo explícita sin tabla duplicada. Hallazgo organiza contenido principal/cronología/asignación en 2:1; el análisis vacío centrado comunica cuatro etapas deterministas de 800 ms.
- **Controles de formulario/diálogo:** `FormDialogButton` concentra el ajuste de tamaño, sin alterar globalmente todos los Button: mínimo 44 px, altura automática y `py-2` (8 px arriba/abajo). Texto completo con wrapping acotado al ancho disponible, no truncado. Las 44 mediciones finales dieron 44–50 px a 1440/1024/390/320.
- **Contención y foco:** formularios, acciones y opciones largas se mantienen dentro del ancho del diálogo/vista previa. Cerrar conserva URL y scroll; Cancelar/Escape restaura el disparador, con fallback de foco cuando el disparador deja de estar disponible. Así la navegación contextual no deja al usuario sin referencia.
- **Tonos:** azul reservado a marca y acciones. Indicadores operativos usan teal, warning, danger, success y neutral, acompañados de texto, no solo color. Avance físico teal RGB 40,102,96 y cierre verde RGB 34,96,68 distinguen magnitudes distintas; pendiente de verificación sigue activo.

Medidas, imágenes realmente leídas y límites: [verificación T6](verificacion.md#cierre-t6--segundo-refinamiento). No se infiere certificación de accesibilidad de estas comprobaciones.

## Base y composición históricas (T1–T3)

## Installed foundation

Existing Next.js 16.4 app; pnpm 11.1.0 only. Initialized with:

```sh
pnpm dlx shadcn@4.21.3 init --preset b1oVykTo --template next --base base --pointer --no-monorepo --yes
```

`components.json` records `base-sera`, neutral, Phosphor, CSS variables and `@/` aliases. `shadcn info --json` resolves these settings to **b1oVykTo**, without fallbacks: Sera / Geist / neutral / inherited headings. Base UI is the explicit base; preset codes do not encode it. Pointer is the generated global enabled-button cursor rule, not an image option.

Official `@shadcn` CLI source installed: button, input, textarea, label, field, select, checkbox, calendar, popover, card, table, badge, alert, empty, separator, skeleton, sidebar, sheet, alert-dialog, tooltip, progress; sidebar also supplies `use-mobile`. All requested primitives support Base; no substitute registry was needed. CLI documentation URLs under `https://ui.shadcn.com/docs/components/base/<component>` were fetched, and generated source inspected.

Dependencies selected by the registry: `@base-ui/react` ^1.8.0, `@phosphor-icons/react` ^2.1.10, `class-variance-authority` ^0.7.1, `cn` ^0.4.0, `shadcn` ^4.21.3, `tw-animate-css` ^1.4.0, `react-day-picker` ^10.0.2 and `date-fns` ^4.4.0. Exact resolutions remain in `pnpm-lock.yaml`.

## Typography and tokens

Added official Vercel `geist` ^1.7.2. `geist/font/sans` loads its bundled `dist/fonts/geist-sans/Geist-Variable.woff2` via `next/font/local` (100–900, swap, adjusted Arial fallback). No Google font fetch at build or runtime; no remote font download or duplicate public copy. The package includes the SIL Open Font License. Tailwind `--font-sans` and `--font-heading` map to `--font-geist-sans`.

Light-mode primary/ring is brand blue **#00049e**, foreground/navigation graphite **#333333**, and background/card/popover white. Keep preset neutral secondary, muted, border and destructive tokens. Use semantic utilities, component variants and `cn`, not feature-specific hardcoded colors. Graphite sidebar tokens include white foreground/focus ring for contrast. Preset dark tokens are retained but dark mode is not enabled or visually approved in this demo.

Operational direction: visits, findings, evidence, verification, commitments and traceability. The coordinator's first task is to find overdue commitments, then inspect their source records; the inspector needs a readable visit-to-closure trail. White content, graphite navigation and blue links/actions echo BV Chile without recreating its marketing site. There are no photos, decorative hero, fabricated trends or ornamental animation.

Density uses a 4px rhythm: 20px compact Card spacing, 24px section gaps, 20px mobile / 32px large-screen workspace padding. The navigation serves the work in a 208px desktop rail; the original 111×138 white logo renders at 64px wide with automatic height. Uppercase is reserved for eyebrows and Sera section titles; record titles stay sentence case. Body text is 14px, headings 30px, operational counts 36px, with tabular numbers for dates/counts. The canvas is a neutral muted tint, Cards are white, and their original Sera square edges/subtle rings are retained. Blue belongs to actions and obvious underlined record links, not ornament.

App semantic Badge variants carry textual severity/state plus muted neutral, blue informational, amber warning, red critical/overdue and green verified/complete tones. Contrast tokens are centralized in `globals.css` (`warning`, `success`, `destructive`); features contain no raw color literals. A closed finding is not overdue. Pending verification remains active.

## Composition contract

- `Button` variants own visual styles; `className` supplies layout. Phosphor icons use `data-icon="inline-start"` or `inline-end`.
- Base triggers use `render`, not Radix `asChild`; non-button link renderers need `nativeButton={false}` where supported.
- Forms compose `FieldGroup` / `Field` / `FieldLabel` / `FieldDescription` / `FieldError`; invalid fields pair `data-invalid` with control `aria-invalid`.
- Select uses `items`, `SelectGroup` and `SelectItem`; null-value items provide placeholders.
- DateField composes Calendar + Popover with Spanish locale, day/month labels and calendar navigation. It serializes local year/month/day as `YYYY-MM-DD`; no UTC conversion. Empty/invalid values have explicit validation. Calendar captions use labels, not native month selects.
- Cards use header/title/description/content/footer. Tables retain semantic headers and captions. Empty, Alert and Skeleton represent their respective states.
- Sheet/AlertDialog require accessible titles and meaningful Spanish descriptions. The root supplies TooltipProvider. Translate generated English helper labels when those primitives are integrated.
- DemoProvider → AnalysisStore → Suspense → Shell nesting remains unchanged. Domain/persistence/permissions remain untouched; T2 changes presentation composition only. Shell continues to gate feature children on `hydrated`, not merely seed availability.

## CSS boundary

T3 removes the body `legacy-app` class, `@scope`, workflow aliases and all legacy control/layout bridges. Migrated workflows use Tailwind layout utilities and `records/presentation.Panel` directly, preserving T2 shared records. Compatibility classes in the untouched records facade no longer carry CSS behavior. The only feature drawing helper is `.finding-history` and its direct list items/pseudo-elements; there are no broad feature element selectors. Semantic tokens, pointer behavior, reduced-motion and print rules remain unchanged.

The generated mobile hook uses `useSyncExternalStore` with an SSR false snapshot and the 768px breakpoint because its original effect-driven state update failed the project's React lint rule.

## T2 component structure

- `components/shell.tsx` keeps the original export; `layout/workspace.tsx` owns SidebarProvider, skip link, single focusable `main#contenido`, hydration boundary and light canvas. SidebarProvider owns desktop/mobile state and Ctrl/⌘ B behavior.
- `layout/sidebar.tsx` composes Header / Content / Group / GroupContent / Menu / MenuItem / MenuButton / Separator / Footer. All five routes retain their active-page semantics. A controlled shadcn Sheet uses the same Sidebar context on mobile, with Spanish title/description/close action rather than the generated English helper strings. Selecting a route closes the mobile Sheet.
- `layout/header.tsx` retains the exact scope rule: only list routes `/hallazgos`, `/inspecciones`, `/analisis` read and replace `project` in the URL while preserving other query parameters. Project/detail routes keep their own record context. It adds a compact reference date and a disclaimer visible even when navigation is closed.
- `layout/demo-controls.tsx` uses labelled FieldGroup + Base Select for scope/role/person. Role/person lists and selection actions are unchanged. Reset uses AlertDialog, disabled before hydration. The provider exposes the existing confirmed repository reset, never calls `window.confirm`, and checks hydration. Its repository and permission logic are unchanged. The generated Base `AlertDialogAction` is only a Button, so the composition explicitly closes the controlled dialog after confirmation.
- `layout/status.tsx` retains separate operation/storage errors (`role=alert`) and saved notices (`role=status`), and supplies Skeleton with loading status while records hydrate.
- `components/records.tsx` is a compatibility facade for T3 imports. `records/presentation.tsx` owns Heading, semantic Badge, Empty, Panel, date/time formatting. `tables.tsx` uses proper Table headers, visible count captions and obvious source links. `assets.tsx` retains existing local resource URLs and fictitious provenance. `chronology.tsx` owns visit history and a project visit-to-closure trail derived only from stored inspection/finding events; its project preview explicitly limits to eight events and never invents missing history.
- `overview.tsx` keeps the route entry point and domain selectors. `overview/metrics.tsx`, `pending-queue.tsx`, `distributions.tsx` separate KPI links, the focal operational queue, and current-domain counts. The 2:1 queue/support composition replaces the previous equal-weight card grid. Every KPI carries the existing matching filters; closed percentage is calculated by the domain, with no-data explicitly handled.
- `projects.tsx` retains both exports, with `projects/project-card.tsx` and `project-context.tsx` separating portfolio summaries and contextual facts. Detail links, own-project scope, assets, visits/findings and recorded chronology are grouped deliberately. Physical progress remains a declared fictitious value, not a closure calculation.
- `analysis.tsx` retains both public exports. `analysis/store.tsx` preserves session-only per-scope cache at the persistent layout level. `priorities.tsx` owns justified priorities, source links and concentration groups. `report.tsx` owns draft text/source links and fictitious disclaimer. Generation, stale-version warnings, professional limitations and printing retain their existing business rules.

## T3 component structure

- `features/forms.tsx` keeps InspectionForm/FindingForm compatibility exports. `forms/inspection-form.tsx` and `finding-form.tsx` own the existing creation domain calls, original FormData keys/defaults and navigation.
- `features/inspections.tsx` keeps Inspections/InspectionDetail exports. `inspections/list.tsx` owns visit filters and creation visibility; `detail.tsx` retains record-local project context, completion, creation of linked findings and shared history/assets.
- `features/findings.tsx` keeps Findings/FindingDetail exports. `findings/list.tsx` retains combined search/scopes/URL-initialized filters and exact clearing semantics; `detail.tsx` composes contextual evidence, workflow, assignment and immutable history.
- `findings/workflow.tsx` owns state/actor visibility and the read-only step list. `correction.tsx` requires action and selected correction evidence; `verification.tsx` validates both close and return submits with mandatory comment/motive and the actual selected inspector. No direct state skipping is introduced.
- `findings/assignment.tsx` retains atomic assignment/plazo domain calls and explicit overdue confirmation, reset whenever the due date changes. `evidence.tsx` preserves active-inspector detection evidence and resources; `history.tsx` presents stored actor/events/changes without editing or inventing history.
- `components/shared/select-field.tsx` uses installed Base Select with items/SelectGroup, null placeholders where available and exactly one application hidden name/value input. The hidden input is serialization only, never native constraint validation. `date-field.tsx` composes the Spanish date picker and the same serialization boundary. `text-field.tsx` and `check-field.tsx` compose installed Input/Textarea/Checkbox and Field parts; checkbox changes use `checked === true`.
- `shared/validated-form.tsx` validates explicit visible-control metadata, including required selects, dates and confirmations, via the pure `lib/form-validation.ts`. It uses noValidate deliberately, exposes FieldError with description references and paired data-invalid/aria-invalid, focuses the first invalid visible control, and leaves all values mounted. Domain failures receive a visible focused form error. Validation errors remain until the next submission, rather than being silently cleared by another field.
- `lib/date-fields.ts` parses/serializes local calendar components, rejects impossible dates/rollover and formats Spanish dates. `tests/form-fields.test.ts` protects local component round-trips, malformed/empty dates, original trim/serialization and custom required/checkbox behavior. No Tailwind snapshots, new dependencies, Zustand or domain/data edits.

### T3 verification

Strict test-first utility work: `pnpm test` initially failed because the new date/validation modules did not exist (13 existing tests passed). After implementation the suite passed; triangulation added independent Node processes in America/Santiago, Pacific/Kiritimati and America/Los_Angeles, including DST-boundary dates. Final `pnpm test`: 18/18 passing, with existing module-type warnings. `pnpm typecheck`, `pnpm lint` and `pnpm build` pass; production generated all eight static pages plus dynamic detail routes. An initial typecheck exposed React's new SubmitEvent handler type and was corrected in the form adapter. CLI component documentation/example URLs were resolved and fetched before composition, and installed Base sources were inspected. No dependencies/domain/data edits, commits, publication or server restart.

### T4 handoff

T3 is source/unit integration only, with no browser or visual claim. Test Select/date/checkbox keyboard behavior, first-invalid focus and repeated invalid submits, required return motive, changed-overdue confirmation, role changes and persisted detection/correction evidence independently. Shared shell/read views and reset AlertDialog are untouched.

T4 should independently verify desktop/mobile overflow, Sheet focus return/keyboard shortcut, Select labels/options, reset cancel/confirm, H-001 transitions, detail scope isolation, notices, session-lived stale analysis and print output. T2 performed no browser or visual verification and makes no visual-pass claim.

### T2 verification

Presentation composition did not change deterministic domain logic; strict TDD was not activated. `pnpm test`: 13/13 passing, with pre-existing Node module-type warnings. `pnpm typecheck`, `pnpm lint`, `pnpm build`: passed; production build generated all eight routes. Installed Next docs for client boundaries and Link, CLI docs URLs/examples and installed Base component source were consulted before composition. No installs, source commits, publication or server restart.

## Official logo and permitted demo context

Asset: `public/brand/bureau-veritas-chile.svg`, original white fill, 111×138 viewBox. Extracted only the exact `.site-logo--inner` rule's base64 SVG from the official Chile site's stylesheet:

[Authoritative CSS](https://cdn1-www.bureauveritas.cl/sites/g/files/zypfnx806/files/css/css_DmjBXw2knB42iBN2IL1nYCd-mLG0SF5ixzBRbyWmUPk.css?delta=1&language=es&theme=bureauveritasbase&include=eJxFzUEOAiEQRNELETjSpJEKgzYD6WpG5_ZGE-PmL97m52WQdcKaC7MQqerIohv90nbUcBuGVGxN0Sh3eYUpJtVk7vzxX-I65srauKMEupjDHs0339GROkipYOBFR0-fXTgbnkzfxj7KUrwB4eY6MQ)

SHA256: `bb5155a179faa68add95415a2757373cf9f796a2c1094c48923db946cc9c3090` (11,912 bytes). Related sticky/site-specific selectors contain different logos and were not adopted. If refreshing yields a different digest, stop adoption and report; never fabricate or recolor it. Display on graphite/blue, with descriptive alt text and preserved aspect ratio.

Use is explicitly user-requested for this fictitious-data demo, not evidence of trademark permission or Bureau Veritas endorsement. Keep the visible demo/fictitious notice in the future shell. T1 bundles the asset but does not yet insert it into navigation.

## Evidence and next task

`pnpm test`: 13/13 passing (existing Node module-type warnings). `pnpm typecheck`, `pnpm lint`, `pnpm build`: passing. Ordinary foundation verification, not a fabricated RED/GREEN lifecycle. Initial generated-hook lint failure was corrected within scope. Source inspection also found that CalendarDayButton created a focus ref without attaching it; the ref is now passed to Button for the existing focused-day effect. Build uses the local Geist asset successfully.

At this historical handoff, T2 and T3 source composition were implemented and T4 independent desktop/mobile/keyboard review remained. This foundation phase claimed neither browser regression nor dark-mode approval; the existing user dev server was not restarted or stopped. Later observed coverage is recorded in [Verificación](verificacion.md), including the previous T6 closure and the current operational T4 closure.
