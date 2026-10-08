# ITO | Gestión de inspecciones

Demostración navegable en español de visitas, hallazgos, correcciones y análisis simulado. **Datos ficticios**, sin relación contractual ni respaldo institucional de Bureau Veritas o Codelco. No sustituye procedimientos oficiales ni el tablero Power BI de las bases.

## Ejecutar localmente

Requisitos: Node.js 24 y pnpm 11.1.0. Desde la carpeta del proyecto:

```sh
cd /Users/anghelo/Dev/demos/ito-bureau-veritas
pnpm install --frozen-lockfile
pnpm dev
```

Abrir `http://localhost:3000`. No se necesitan claves, variables de entorno ni servicios externos. Si 3000 está ocupado:

```sh
pnpm dev --port 3001
```

Producción local (sin publicación):

```sh
pnpm build
pnpm start
```

Verificación:

```sh
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

Las pruebas usan el soporte TypeScript nativo de Node; puede aparecer un aviso informativo de detección de módulos. La interfaz usa Tailwind v4, shadcn (preset Sera/Base UI), Phosphor, react-day-picker y date-fns; las versiones están en `package.json` y `pnpm-lock.yaml`. Geist se sirve desde el paquete local mediante `next/font/local`, sin descargas de Google Fonts.

## Recorrido

- `/`: indicadores, distribución y alertas calculados desde el mismo estado de los listados.
- `/proyectos` y `/proyectos/[id]`: contexto, avance ficticio registrado, visitas, hallazgos y documentos.
- `/inspecciones` y `/inspecciones/[id]`: filtros, creación, completar visita y registrar hallazgo vinculado.
- `/hallazgos` y `/hallazgos/[id]`: filtros combinables, corrección, respaldo seleccionado, verificación, devolución e historial.
- `/analisis`: reglas deterministas trazables, concentraciones, borrador e impresión con el diálogo nativo.

Seleccione **Rol de demostración** y **Persona de demostración**. Diego Soto es el responsable inicial de H-001; Ana Rojas verifica. Lucía Pérez permite demostrar reasignaciones. No es autenticación ni autorización de producción.

El selector de alcance controla resumen, listados y análisis. Enlaces con filtros especifican su alcance. Las fichas de detalle siempre muestran el proyecto propio del registro y lo declaran, independientemente del selector de cartera.

## Refinamiento previo (T6)

- Cabecera única de 61 px: logo/título horizontal, acceso al panel lateral e identidad en Popover con una sola persona y aviso Demo discreto. Sin atribución IngSimple ni avisos contractuales repetidos en la interfaz; el informe conserva la declaración ficticia y de no respaldo.
- Filtros compactos en Popover y chips removibles vinculados a la URL: proyecto ausente hereda el alcance global; `project=all` lo hace explícito. Cambios usan push y búsqueda replace, preservando hash y parámetros desconocidos duplicados.
- Creación en diálogos y una sola vista previa contextual viva, con regreso finito y enlace a ficha completa. Cerrar conserva URL, desplazamiento y foco; la relación visita–hallazgo es explícita, sin tabla de hallazgos duplicada.
- Hallazgo en composición 2:1 con cronología y asignación; corrección/verificación y evidencia editable prellenada con nombres de referencia local fija, sin carga real de archivos.
- Análisis vacío centrado: cuatro etapas de 800 ms (3,2 s), deterministas, cancelables y protegidas ante cambios de alcance/versión/ruta, desmontaje o sustitución. Caché solo de sesión; recargar la borra. Sin IA externa.

## Controles y estructura

Los formularios usan FieldGroup/Field y controles shadcn: Select personalizado, Input, Textarea, Checkbox y Button. Las fechas se eligen con Calendar en Popover, con meses, días y navegación en español. Tab llega al disparador; Enter o Espacio abre, las flechas recorren días y Escape cierra y devuelve el foco. «Borrar fecha» permite limpiar filtros; una fecha obligatoria vacía bloquea el envío. Las fechas se serializan como `YYYY-MM-DD` desde componentes de calendario local, nunca convirtiendo a UTC. Cambiar un plazo reinicia la confirmación explícita de vencimiento.

La validación señala campos con errores accesibles y enfoca el primero, sin borrar lo escrito. Select no depende de restricciones nativas sobre inputs ocultos. La corrección exige acción y evidencia de corrección; cerrar o devolver exige comentario/motivo y conserva el actor actual. «Restablecer demo» conserva el AlertDialog de confirmación.

`src/features/forms.tsx`, `findings.tsx` e `inspections.tsx` son entradas compatibles; sus subcarpetas separan creación, filtros, detalle, corrección, verificación, asignación, evidencia e historial. Los controles reutilizables están en `src/components/shared/`; fechas y validación puras en `src/lib/`. Véase [sistema de diseño](docs/design-system.md) para tokens, composición, dependencias y procedencia del logo. El logo local fue solicitado para esta demo: no implica autorización de marca ni respaldo institucional.

## Datos y persistencia

El seed incluye 3 proyectos, 8 visitas y 18 hallazgos. Fecha fija: **08/10/2026, America/Santiago**; período del resumen 01–08 octubre. Fechas compromiso son calendario; eventos se muestran en hora de Santiago. Un pendiente de verificación sigue activo. Completar una visita no cierra hallazgos.

El repositorio valida el esquema y las relaciones antes de aceptar cambios. `localStorage` guarda los registros y el historial en `ito-demo:v1`, solo en este navegador y origen. No hay sincronización entre pestañas ni respaldo remoto. La hidratación ocurre después del montaje; fallos de lectura/escritura se comunican y la sesión sigue operativa. «Restablecer demo» pide confirmación y reemplaza los datos y el historial por el seed. Cambios de responsable/plazo y transiciones quedan en la cronología; no hay editor ni borrado de eventos. Las inspecciones nuevas registran creación y completamiento con actor y fecha; las visitas anteriores muestran explícitamente que no existe historial de creación. El esquema de persistencia v2 conserva la clave `ito-demo:v1` y adapta los datos v1 sin borrar registros ni inventar eventos. Si los datos almacenados son ilegibles o de versión desconocida, no se sobrescriben automáticamente; solo el restablecimiento confirmado permite reemplazarlos.

El análisis generado se mantiene al navegar dentro de la sesión, por alcance. Su versión se compara con los datos y se advierte cuando está desactualizado. **No se conserva al recargar**: vuelva a analizar. La generación no altera hallazgos. Al regenerar tras cerrar H-001 deja de priorizarlo.

Documentos/evidencias son archivos de texto reales incluidos en `public/demo/`, claramente ficticios. El inspector puede «Agregar evidencia de detección de ejemplo» a un hallazgo activo, incluidos los nuevos. Durante la corrección se añade y selecciona evidencia de corrección: la evidencia de detección no la sustituye. Estas acciones añaden referencias, no suben archivos de terreno; registran actor, fecha y fase en el historial. La referencia seleccionada para remitir queda en el evento.

## Entrega y límites

El **control operativo T1–T4 está verificado**, tras corregir la densidad inicial: proyecto 3:2 en escritorio, avance físico etiquetado separado del análisis simulado, tablas con filtros de columna sincronizados con URL y cola de tres prioridades ampliable a ocho. La trazabilidad relaciona registros reales de la demo; no es embudo aditivo ni tendencia histórica. El contexto queda en flujo normal: fijar toda la columna izquierda cubriría contenido inferior.

Evidencia acumulativa: **44/44 pruebas, tipos, lint y build PASS**. La línea base independiente y el último escritor compilaron; el retest enfocado reutilizó el build del escritor, sin compilación independiente adicional. Véase [cierre operativo T4](docs/verificacion.md#cierre-operativo-t4). El [cierre previo T6](docs/verificacion.md#cierre-t6--segundo-refinamiento) conserva su historia de 38 pruebas, no la cobertura actual. Falta revisión humana del usuario; no se reclama su aprobación visual ni aprobación nativa.

Véanse [guion de 5–7 minutos](docs/guion-demo.md), [alcance real/simulado/excluido](docs/alcance.md) y la especificación original `ESPECIFICACION_DEMO_ITO_IA.md` (preservada).

Se preservaron dominio, esquema y repositorio; el paso histórico de 37 a 38 pruebas añadió una regresión pura de URL, y el control operativo alcanzó 44. No hubo cambios de dependencias, commit, despliegue ni publicación. Antes de usar datos reales hacen falta requisitos, backend, autenticación, seguridad y procedimientos validados.
