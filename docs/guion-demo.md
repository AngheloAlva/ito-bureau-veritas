# Guion de demostración · 5–7 minutos

## Preparación

Ejecutar `pnpm dev`, abrir localhost y restablecer con el menú de identidad (icono de persona, arriba a la derecha) → «Restablecer demo». Elegir «Cartera completa» como alcance. En «Viendo como» (en móvil es un selector) elegir Inspector / Ana Rojas. Usar solo datos de ejemplo. Ensayar también en móvil y con teclado antes de la reunión; este documento no declara que el ensayo haya ocurrido.

## 0:00–0:45 · Contexto y prioridades

«Es una demostración con datos de ejemplo, no un sistema de producción ni un procedimiento oficial. La fecha de referencia es el 8 de octubre de 2026.»

En el Resumen mostrar los indicadores «Hallazgos activos», «Hallazgos vencidos», «Críticos activos» e «Inspecciones del período», y la franja «Ciclo de vida del hallazgo». Abrir «Hallazgos vencidos»: la tabla combina alcance y vencimiento. Volver. En «Atención prioritaria» abrir H-001, marcado «Caso de demostración · empezar aquí».

## 0:45–1:30 · Trazabilidad de origen

Leer «Registro incompleto de prueba de estanqueidad». Aclarar que falta respaldo: **no significa que la instalación falló**. Abrir el proyecto P-001 y la inspección I-001 desde los enlaces. Mostrar resultado, fecha, hallazgos asociados y el documento de ejemplo. Volver a H-001.

## 1:30–2:45 · Corrección por el responsable

El botón principal del hallazgo indica qué rol puede actuar: pulsar «Cambiar a Responsable de corrección» (o usar «Viendo como») para ser Diego Soto. Pulsar «Iniciar corrección». Luego «Preparar corrección», escribir: «Se solicitó el registro firmado y se contrastará con el tramo inspeccionado», seleccionar la evidencia de corrección (o «Adjuntar respaldo de corrección» para crear una referencia de ejemplo; queda seleccionada) y pulsar «Remitir a verificación».

Mostrar que sigue activo y vencido; el responsable no recibe botón de cierre. Abrir la cronología: actor, fecha, transición, acción y evidencia seleccionada.

## 2:45–3:45 · Verificación independiente

Pulsar «Cambiar a Inspector». Con «Revisar corrección» se ven la acción registrada y la evidencia seleccionada, la persona verificadora y el comentario obligatorio. Para el flujo corto, escribir «Se revisó el ejemplo y su correspondencia con el tramo 1» y pulsar «Verificar y cerrar».

Si hay tiempo, primero «Devolver a corrección» con «Falta identificar el tramo en el respaldo», repetir la remisión como Diego y cerrar como Ana. Nunca se saltan estados.

## 3:45–4:45 · Cifras y análisis

Volver al Resumen: activos y vencidos bajan en uno y los cerrados suben en uno. Abrir Análisis asistido, elegir cartera o P-001 y pulsar «Analizar registros»; se muestran los pasos del análisis. H-001 ya no es prioridad activa. Abrir una fuente (enlace interno, misma pestaña). Mostrar «Concentración de pendientes»: el punto crítico es P-002 × Civil. Revisar razones y límites. «Es simulado: reglas deterministas, no IA generativa». Pulsar «Generar borrador de informe» e imprimir si hay tiempo.

Para mostrar la advertencia, crear un registro después del análisis y volver: aparece «Análisis desactualizado»; «Analizar registros» lo actualiza. Recargar la página descarta el análisis.

## 4:45–6:15 · Datos nuevos y visita independiente

Como Ana, crear una inspección en P-001 con fecha 08/10/2026, sector, especialidad, actividad y resultado general. Se abre su detalle como Programada. Registrar un hallazgo con descripción, ubicación, severidad, Diego y plazo 09/10/2026; el código es automático. Con 07/10/2026 hay que confirmar que nace vencido.

En la inspección nueva pulsar «Completar visita»: el hallazgo sigue abierto. Abrir P-001 o el Resumen: cifras y listados incluyen el nuevo registro. En un hallazgo abierto se puede mostrar la reasignación a Lucía y el cambio de plazo en la cronología.

## 6:15–7:00 · Cierre y validación del enfoque

Recargar un detalle para mostrar que los cambios persisten solo en este navegador. «Restablecer demo» pide confirmación y permite repetir el relato.

Preguntar qué nomenclatura, documentos, roles y estados conviene validar. Solicitar un formato vacío o anonimizado y confirmar quién asistirá a la siguiente presentación. Backend, autenticación, IA real, integraciones y Power BI requieren un alcance posterior.
