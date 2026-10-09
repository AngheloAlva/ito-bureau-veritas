# Guion de demostración · 6–8 minutos

## Preparación

Ejecutar `pnpm dev`, abrir localhost y restablecer con el menú de identidad (icono de persona, arriba a la derecha) → «Restablecer demo». La cabecera ya no tiene selector de alcance: cada vista trae sus filtros y parte en cartera completa. La demostración usa una sola identidad con todos los permisos: no hay cambio de rol ni de persona. Usar solo datos de ejemplo. Ensayar también en móvil y con teclado antes de la reunión; este documento no declara que el ensayo haya ocurrido.

## 0:00–1:30 · Tablero ejecutivo (`/tablero`)

Clic: seleccionar un segmento en «Situación de hitos» y observar cómo se recalculan los demás gráficos; mostrar el filtro en la URL; abrir el árbol de descomposición. Decir: «Son 42 proyectos ficticios con fecha de referencia 08/10/2026. Cada clic filtra todo el tablero y queda en el enlace.» Revisar «Proyectos con problemas» y sus días sin cerrar.

## 1:30–2:30 · Programa de trabajo (`/programa`)

Clic: abrir un proyecto atrasado y ver el Gantt. Decir: «Compara plan y real por hito; las barras fuera de plazo se ven de inmediato.»

## 2:30–3:15 · Mapa de faena (`/mapa`)

Clic: elegir una zona y abrir sus proyectos. Decir: «Es una ilustración esquemática que ubica el trabajo por área; no es un plano real.»

## 3:15–4:15 · Análisis IA (`/analisis`)

Clic: formular una consulta sugerida y abrir la vista generada; guardarla. Decir: «Es simulado: reglas deterministas, sin servicios externos. Las vistas guardadas quedan solo en este navegador.»

## 4:15–8:00 · Resumen y hallazgos (flujo operativo, caso H-001)

Ir al Resumen y abrir H-001 («Caso de demostración · empezar aquí»). Decir: «Falta respaldo; eso no significa que la instalación falló.» Clic: «Iniciar corrección» → «Preparar corrección» → remitir con evidencia → «Verificar y cerrar» con comentario. Volver al Resumen: activos y vencidos bajan en uno. Decir: «Los estados no se saltan y todo queda en la cronología.» Cerrar con Análisis IA («Analizar registros y priorizar») si hay tiempo y «Restablecer demo».

## Detalle del flujo operativo (referencia)

### 0:00–0:45 · Contexto y prioridades

«Es una demostración con datos de ejemplo, no un sistema de producción ni un procedimiento oficial. La fecha de referencia es el 8 de octubre de 2026.»

En el Resumen mostrar los indicadores «Hallazgos activos», «Hallazgos vencidos», «Críticos activos» e «Inspecciones del período», y la franja «Ciclo de vida del hallazgo». Abrir «Hallazgos vencidos»: la tabla combina alcance y vencimiento. Volver. En «Atención prioritaria» abrir H-001, marcado «Caso de demostración · empezar aquí».

### 0:45–1:30 · Trazabilidad de origen

Leer «Registro incompleto de prueba de estanqueidad». Aclarar que falta respaldo: **no significa que la instalación falló**. Abrir el proyecto P-001 y la inspección I-001 desde los enlaces. Mostrar resultado, fecha, hallazgos asociados y el documento de ejemplo. Volver a H-001.

### 1:30–2:45 · Corrección por el responsable

Las acciones están en la cabecera del hallazgo, junto a la descripción y al avance por estados. Pulsar «Iniciar corrección»; luego «Preparar corrección», que abre el formulario en la misma cabecera. Escribir: «Se solicitó el registro firmado y se contrastará con el tramo inspeccionado», seleccionar la evidencia de corrección (o «Adjuntar respaldo de corrección» para crear una referencia de ejemplo; queda seleccionada) y pulsar «Remitir a verificación».

Mostrar que sigue activo y vencido, y que el cierre no es posible sin pasar por verificación. Abrir la cronología: actor, fecha, transición, acción y evidencia seleccionada.

### 2:45–3:45 · Verificación independiente

En la misma cabecera, ya en «Pendiente de verificación», se ven la acción registrada y la evidencia seleccionada, y el campo de comentario, obligatorio para cerrar o devolver. Para el flujo corto, escribir «Se revisó el ejemplo y su correspondencia con el tramo 1» y pulsar «Verificar y cerrar».

Si hay tiempo, primero «Devolver a corrección» con «Falta identificar el tramo en el respaldo», repetir la remisión y cerrar. Nunca se saltan estados.

### 3:45–4:45 · Cifras y análisis

Volver al Resumen: activos y vencidos bajan en uno y los cerrados suben en uno. Abrir Análisis IA, elegir cartera o P-001 y pulsar «Analizar registros y priorizar»; se muestran los pasos del análisis. H-001 ya no es prioridad activa. Abrir una fuente (enlace interno, misma pestaña). Mostrar «Concentración de pendientes»: el punto crítico es P-002 × Civil. Revisar razones y límites. «Es simulado: reglas deterministas, no IA generativa». Pulsar «Generar borrador de informe» e imprimir si hay tiempo.

Para mostrar la advertencia, crear un registro después del análisis y volver: aparece «Análisis desactualizado»; «Analizar registros» lo actualiza. Recargar la página descarta el análisis.

### 4:45–6:15 · Datos nuevos y visita independiente

Crear una inspección en P-001 con fecha 08/10/2026, sector, especialidad, actividad y resultado general. Se abre su detalle como Programada. Registrar un hallazgo con descripción, ubicación, severidad, Diego Soto como responsable y plazo 09/10/2026; el código es automático. Con 07/10/2026 hay que confirmar que nace vencido.

En la inspección nueva pulsar «Completar visita»: el hallazgo sigue abierto. Abrir P-001 o el Resumen: cifras y listados incluyen el nuevo registro. En un hallazgo abierto se puede mostrar la reasignación a Lucía y el cambio de plazo en la cronología.

### 6:15–7:00 · Cierre y validación del enfoque

Recargar un detalle para mostrar que los cambios persisten solo en este navegador. «Restablecer demo» pide confirmación y permite repetir el relato.

Preguntar qué nomenclatura, documentos, permisos por rol y estados conviene validar. Solicitar un formato vacío o anonimizado y confirmar quién asistirá a la siguiente presentación. Backend, autenticación, IA real, integraciones y Power BI requieren un alcance posterior.
