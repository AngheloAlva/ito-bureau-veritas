# Verificación

**Entrega actual: control operativo T1–T4 verificado tras una corrección acotada de densidad.** Véase [cierre operativo T4](#cierre-operativo-t4). Las demás secciones, incluido el [cierre previo T6](#cierre-t6--segundo-refinamiento) de 38 pruebas, conservan su alcance histórico; no sustituyen ni amplían la cobertura actual. Siguiente paso: revisión humana del usuario, todavía no acreditada.

## Cierre operativo T4

### Resultado y procedencia

- Acumulativo: `pnpm test` **44/44**, `pnpm typecheck`, `pnpm lint` y `pnpm build` PASS. Compilaron la línea base independiente y el último escritor de la corrección. El retest independiente enfocado repitió pruebas/tipos/lint y **reutilizó el build del escritor**, sin nueva compilación independiente.
- Proyecto 3:2 a 1440 px, avance físico compacto etiquetado y acción de análisis con gradiente independiente. Contexto en flujo normal: aunque el bloque compacto cabe, fijarlo en la misma pila cubriría secciones inferiores; no se implementó sticky. Corrección/verificación por hallazgo y movimientos recientes usan disclosures.
- Tablas diferenciadas, filtros de columna con objetivos de 40 px y sincronización URL/chips/barra: teclado, Escape/foco, atrás/adelante, alcance y recuperación de cero resultados PASS. Balance y distribuciones respetan alcance. Cola inicial de tres prioridades, total ocho y «Mostrar todos» sin duplicados; cohorte trazable con enlaces exactos, no embudo aditivo ni tendencias históricas.

### Corrección visual y retest

La primera verificación funcional pasó, pero la densidad visual falló. Tras la corrección, lectura independiente de capturas y retest: **PASS**, sin atribuir aprobación visual al usuario.

| Medida a 1440 × 900 | Antes | Después |
|---|---:|---:|
| Altura de cola | 1859,75 px | 629,5 px |
| Inicio de trazabilidad (Y) | 2106,75 px | 876,5 px |
| Altura de cronología | 3240,5 px | 1728,5 px |
| Vacío bajo columna izquierda | 2264,25 px | 752,25 px |

Solo el borde superior de la banda llega al primer viewport; **no** toda la banda ni su título quedan sobre el pliegue. Se comprobaron 24 configuraciones predeterminadas/expandidas a 1440/1024/390/320 px, altura corta de 500 px y reflow 720 × 450 equivalente a 200 % (**no zoom nativo**): sin desbordamiento de página, scroll vertical anidado ni etiquetas esenciales recortadas. Summaries de 44–48 px, Enter/Espacio y foco de 2 px PASS; enlaces exactos, sin duplicados, y actor/comentario reales de devolución conservados.

El ciclo completo H-001 de seis eventos persistidos tras recarga, creación/permisos, análisis desactualizado, impresión exclusiva del informe y restablecimiento se observaron en la línea base; **no se repitieron completos en el retest enfocado**. Este comprobó disclosures, alcance, vacío sintético restaurado, enlaces y smoke de filtros/vistas previas/análisis.

### Evidencia y límites

- `/tmp/ito-operational-t4` y `/tmp/ito-operational-t4-retest`: evidencia local temporal, no assets portables del repositorio. En el retest: 747 solicitudes localhost, cero HTTP fallidos/errores de página/mensajes de consola; 150 prefetch RSC cancelados por navegación rápida, sin fallos no-RSC. Avisos de módulos y precarga SVG pertenecen a la línea base; cancelación de prefetch no equivale a fallo de página.
- Servidores y navegadores propios cerrados; puerto 4173 rechazó conexión. Servidor del usuario en 3000, PID 32439, intacto. Sin cambios Git, commit ni despliegue. INSPECT/ASSESS nativo bloqueado por IngSimple bajo el Git ancestral; sin aprobación nativa ni mutaciones para desbloquearlo.
- No acredita WCAG integral/lector de pantalla, otros navegadores, móvil físico, zoom nativo, impresión física ni retest exhaustivo de migración/corrupción. Esta clausura es documental: lectura estructural de enlaces, cifras y claims, sin nuevas pruebas, build, servidor o navegador; no hay RED de comportamiento significativo.

## Evidencia independiente previa a las correcciones

El verificador independiente informó resultados observados, no supuestos:

- `pnpm test`: 7/7; `pnpm typecheck`, `pnpm lint` y `pnpm build`: aprobados.
- H-001: Diego inició corrección y remitió a verificación; inspector cerró; el cierre persistió al recargar. Pendiente de verificación continuó activo.
- Los formularios rechazaron campos obligatorios vacíos.
- El análisis avisó que estaba desactualizado tras cambios y se regeneró.
- En móvil se crearon I-009 y H-019.
- Restablecimiento, navegación por teclado y alcances comprobados.
- Capturas de escritorio (1440 px) y móvil (390 px) leídas: sin desbordamiento de página observado. Esto no constituye auditoría WCAG completa.

## Defectos y correcciones acotadas

1. Consola de desarrollo: `instant-unrendered-segment` en rutas. El log `.playwright-cli/console-2026-10-07T21-51-34-861Z.log`, líneas 3–29, muestra un segmento descartado de `/`. Se retiraron `cacheComponents` y `partialPrefetching` de `next.config.ts`, sin suprimir errores ni modificar la hidratación. Los documentos instalados de Next 16.4 confirman que partial prefetching requiere Cache Components y que este último activa PPR y preservación con Activity; ninguna función es necesaria para la persistencia local de esta demo. Son opciones de primer nivel, no opciones bajo `experimental`. Se conservó `reactCompiler`, independiente de ellas.
2. Las correcciones de H-003, H-006, H-009, H-012 y H-015–H-018 reutilizaban el respaldo de H-001 (P-001 / Tramo 1). Ahora usan una muestra genérica explícitamente no asociada a registros ni firmada. H-001 conserva su respaldo específico. Se revisaron todas las referencias del seed: detección y fichas de proyecto son muestras ficticias genéricas sin atribución a un registro ajeno.

## Validación posterior observada

- RED: la nueva prueba de coherencia falló porque nueve hallazgos referenciaban el respaldo específico, en lugar de solo H-001 (7 aprobadas, 1 fallida).
- GREEN: `pnpm test`, 8/8 aprobadas. La regresión comprueba existencia y carácter ficticio de todos los recursos, correspondencia proyecto/tramo de H-001, exclusividad del respaldo y carácter no-record/no-firmado de las otras correcciones.
- `pnpm typecheck`: aprobado.
- `pnpm lint`: aprobado.
- `pnpm build`: aprobado con Next 16.4.0, rutas estáticas y dinámicas generadas.
- Node muestra el aviso informativo existente `MODULE_TYPELESS_PACKAGE_JSON`; no se cambiaron dependencias.

## Retest independiente posterior

- `pnpm test`: 8/8 aprobadas.
- Desarrollo: servidor nuevo, restablecimiento confirmado y 12 páginas concretas recorridas mediante enlaces; sin errores de consola ni indicador de problemas de navegación instantánea.
- Evidencia de H-012: muestra genérica, no firmada y no asociada a un registro técnico; respaldo específico de H-001 coherente.
- Devolución con motivo, nueva remisión y cierre realizados. Los seis eventos de H-001 persistieron tras recarga. Activos/vencidos: 14/6 durante devolución y remisión, 13/5 al cerrar, 14/6 después de restablecer.
- Producción local: `pnpm start --hostname 127.0.0.1 --port 4174`; nueve páginas recorridas mediante enlaces, sin mensajes de consola ni overlay de desarrollo.
- Capturas inspeccionadas: `/tmp/ito-retest-desktop.png`, `/tmp/ito-retest-mobile-stable.png`, `/tmp/ito-retest-prod-desktop.png`, `/tmp/ito-retest-prod-mobile.png`.
- Transcripciones: `/tmp/ito-retest-{routes,return,production,console,prod-console,final-reset}.txt`. Servidores propios detenidos y sesiones de prueba cerradas.

No se ejecutó auditoría WCAG integral, prueba con lector de pantalla ni dispositivos móviles físicos. La revisión nativa no pudo iniciar por repositorios ajenos anidados en el Git superior `/Users/anghelo/Dev`; se realizó verificación independiente sin modificar esos repositorios.

Los cambios del seed se ven en un origen nuevo o tras «Restablecer demo» (con confirmación y pérdida de cambios locales). La persistencia existente conserva sus referencias anteriores: no se ejecutó una migración ni se borraron datos del navegador.

## Correcciones de trazabilidad — verificación independiente

- `pnpm test`: 13/13; `pnpm typecheck`, `pnpm lint`, `pnpm build`: aprobados.
- Historial de inspecciones: creación y completamiento registran actor real, timestamp y referencia; actor distinto del inspector asignado comprobado. Recarga conserva eventos; completar visita mantiene hallazgos pendientes.
- Evidencia inicial: inspector añade referencia ficticia de detección, abre el recurso y queda historial. Responsable/coordinador no tienen esa acción; detección no sustituye respaldo de corrección. Flujo H-001 sigue funcionando.
- Migración v1: lectura sin sobrescribir bytes, registros/historial conservados y sin inventar eventos anteriores; primera modificación guarda schemaVersion 2 manteniendo clave `ito-demo:v1`. Datos corruptos/versión desconocida no se sobrescriben hasta restablecimiento confirmado.
- Navegador Chromium aislado sobre `pnpm start --hostname 127.0.0.1 --port 4173`: escritorio 1440/móvil390 inspeccionados, sin desbordamiento, foco visible de3px y consola sin mensajes. El intento de servidor dev encontró otro proceso activo; se dejó intacto y no se realizó un nuevo chequeo de consola dev.
- Evidencia: `/tmp/ito-traceability-verify/report.md`, `desktop.png`, `mobile-stable.png`. Servidor propio detenido; servidor del usuario conservado.
- Sin nuevas dependencias, Zustand ni rediseño. No se acredita auditoría WCAG integral ni pruebas en dispositivos físicos. Revisión nativa bloqueada por repositorios ajenos bajo el Git superior; verificación independiente realizada.

## Rediseño T4 — entrega final

**Resultado: aprobado.** La verificación independiente funcional inicial y el retest independiente de las tres correcciones visuales están completos. Esta actualización solo documenta evidencia observada; no añade implementación ni una nueva ejecución de pruebas.

### Validación y cobertura funcional inicial

- Escritor final: `pnpm test` 18/18, `pnpm typecheck`, `pnpm lint` y `pnpm build` aprobados. Retest final independiente: 18/18, tipos y lint aprobados; utilizó el build de producción del escritor, sin repetir el build. Persiste el aviso informativo `MODULE_TYPELESS_PACKAGE_JSON`.
- Navegación, detalles y alcances de las cinco áreas; Select y Calendar personalizados por teclado; Sheet móvil con Escape, Ctrl-B y devolución del foco. La validación obligatoria conserva campos escritos y enfoca el primer error.
- Creación de I-009 y H-019 con fecha local `2026-10-07`; cambiar fechas reinicia la confirmación de vencimiento. H-019 admite evidencia de detección mediante un recurso real ficticio y registra cronología. Completar I-009 no cierra H-019.
- H-001: Diego corrige y remite a pendiente; Ana devuelve; nueva remisión y cierre. Se exigen acción, evidencia de corrección, motivo de devolución y comentario de cierre; detección queda excluida de las opciones de corrección. Indicadores: 14 activos/6 vencidos mientras está pendiente, 13/5 al cerrar. Actores, comentarios y evidencia persisten al recargar. Este ciclo completo se ejecutó antes de las correcciones visuales, no se repitió completo en el retest final.
- Análisis: aviso de desactualización, regeneración, navegación a fuentes e informe. Restablecimiento: cancelación, confirmación y foco; seed de 18 hallazgos, 8 visitas y 0 eventos.
- Migración y protección ante corrupción: evidencia de pruebas existentes y revisión de código; no se repitió exhaustivamente su ensayo de navegador en esta fase.

### Correcciones y retest independiente final

Los tres fallos visuales iniciales quedaron corregidos y se verificaron mediante lectura de imágenes:

- Identidad: ancho de 246 px en escritorio 1440/1024, 350 px en móvil 390 y 280 px en 320; sin solapamiento ni desbordamiento de página.
- Calendario: ancho de 288 px; en 390, x=40/derecha=328 con 380 px disponibles; en 320, x=27/derecha=315 con 310 px disponibles. Sin desbordamiento observado.
- Impresión exclusiva del informe: excluye paneles, sesión y estado operativo; conserva informe no vacío, enlaces a fuentes, referencia y aviso ficticio. Tras un cambio real de datos conserva **DESACTUALIZADO**. La pantalla normal mantiene controles y paneles.
- También se repitieron cambio de rol/persona por teclado, selección por flechas y foco del Calendar con I-009 persistida en `2026-10-07`, Escape/navegación del Sheet y cancelación del restablecimiento sin pérdida de datos.

Imágenes efectivamente leídas en `/tmp/ito-brand-ui-verify` y `/tmp/ito-brand-ui-retest`: `identity-1440.png`, `identity-1024.png`, `identity-390.png`, `identity-320.png`, `calendar-390.png`, `calendar-320.png`, `print-report.png`, `print-report-stale.png` y `analysis-screen-stale.png`. Son localizadores temporales de evidencia, no capturas duraderas incorporadas al repositorio.

La sesión final registró 92 solicitudes, todas a localhost, sin respuestas 4xx/5xx; logo y fuente locales respondieron 200/304. Consola: 0 errores y 0 advertencias; la advertencia móvil anterior de precarga de logo no utilizado no se reprodujo. Se utilizó únicamente producción aislada en el puerto 4173; navegador cerrado y procesos propios detenidos, con conexión posterior rechazada. El servidor de desarrollo del usuario no se modificó ni detuvo.

### Límites de la entrega

No se verificaron WCAG integral, lector de pantalla, otros navegadores, dispositivos móviles físicos ni paginación de impresión física. La revisión nativa `inspect/assess` continúa bloqueada por el repositorio ajeno anidado IngSimple bajo el Git superior `/Users/anghelo/Dev`; no se modificaron Git ni reglas de ignore y no se acredita aprobación nativa. Sí se completó la verificación independiente funcional y visual descrita arriba.

No se realizaron publicación ni commits; no se incorporaron backend, autenticación, IA real ni Zustand.

## Cierre T6 — segundo refinamiento

### Secuencia y chequeos observados

- `/tmp/ito-visual-polish-verify`: FAIL inicial, cinco defectos visuales. `/tmp/ito-visual-polish-retest`: cinco correcciones aprobadas, con P2 pendiente en botones. `/tmp/ito-visual-polish-final`: PASS final del ajuste. Son localizadores temporales, no capturas duraderas del repositorio.
- Último escritor `muyvg1dq-u-0yk4`: `pnpm test` 38/38, `pnpm typecheck`, `pnpm lint` y `pnpm build` PASS. Verificador previo `muyv339n-t-vjaz`: 38/38, tipos y lint PASS independientemente; reutilizó build.
- Retest enfocado `muyvidu4-v-5f8u`: reutilizó el build de las 22:43; **no volvió a ejecutar suites ni build**. Dominio, esquema y repositorio preservados; 37→38 por una prueba pura de URL. Comportamiento determinista con RED/GREEN; CSS visual con RED observado en navegador, no con un RED unitario ficticio.

### Cobertura acumulativa y retest final

- 44 mediciones de botones a 1440/1024/390/320 px: alturas 44–50 px y padding superior/inferior de 8 px; texto completo envuelto, sin desbordamiento. Anchos de formularios de corrección a esos cuatro tamaños: 624/624/326/256 px; contenido/disponible de creación a 390: 358/358, a 320: 288/288; opción larga: 244/244.
- Imágenes efectivamente leídas: corrección/asignación en los cuatro anchos, proyecto a 1440/320, creación a 320 y opción larga a 320. Cancelar/Escape devuelve foco al disparador. H-002: remisión mantiene P estable dentro de la vista previa exterior; Escape vuelve al disparador H-002.
- Ciclo completo H-001 comprobado en la ronda anterior: remitir/devolver/remitir/cerrar, foco, actores, historial, muestras, permisos y barreras PASS; 13 activos, 5 vencidos, 5 cerrados. No se atribuye una repetición completa al retest enfocado.
- Contexto conserva URL y scroll 637→637. Hash, parámetros duplicados, severidad y creación PASS. Avance físico usa teal RGB 40,102,96 y cierre verde 34,96,68, sin confundir ambas métricas.
- Ronda anterior: etapas de análisis, cancelación, alcance, versión, caché de sesión e impresión exclusiva del informe con marcador desactualizado comprobados. Sin IA externa ni persistencia del análisis tras recarga.
- Captura final: 27 solicitudes dinámicas localhost mostradas con 200; 80 estáticas no capturadas. **No es un registro de todas las solicitudes.** Una advertencia final de precarga SVG; aviso de módulos existente en build. Dos desajustes de etiquetas exactas de automatización se recuperaron: no fueron defectos de la aplicación.
- Navegador propio cerrado; procesos propios 2421/2442 ausentes y puerto 4173 rechazó conexión. Procesos del usuario 74429/74438/74444 intactos.

### Bloqueos y exclusiones

INSPECT/ASSESS nativo bloqueado por raíz Git ancestral `/Users/anghelo/Dev` y repositorio ajeno IngSimple anidado. No se reclama aprobación ni receipt nativo; no se manipuló Git. No hubo commit, despliegue ni publicación.

No se acredita WCAG integral, lector de pantalla, otros navegadores, móvil físico, paginación física de impresión ni repetición exhaustiva en navegador de migración/corrupción. La clausura documental no ejecuta suites, build, servidor ni navegador; no tiene RED de comportamiento aplicable. Revisión estructural: enlaces, cifras y separación entre evidencia actual, histórica y no comprobada.
