# Alcance honesto de la demo

## Real y funcional en esta aplicación

- Rutas Next App Router en español; controles HTML nativos, foco visible, formularios adaptables y tablas desplazables en móvil.
- Un solo estado compartido validado: proyectos, inspecciones, hallazgos, usuarios ficticios, documentos, evidencias e historial.
- Creación de visitas/hallazgos; completar una visita independientemente de sus hallazgos.
- Transiciones por rol/persona: solo responsable asignado corrige, inspector verifica/cierra o devuelve con motivo. No se puede cerrar directamente desde Abierto.
- Acción obligatoria y respaldo seleccionado para remitir; comentario y actor inspector para cierre. Cambios de asignación/plazo dejan eventos. Fecha vencida nueva requiere confirmación.
- Filtros combinables de hallazgos, búsqueda de código/título, filtros de visitas y enlaces de tarjetas/gráficos con alcance.
- Indicadores y alertas calculados con fecha fija 08/10/2026; cerrados excluidos de activos y vencidos.
- Persistencia local versionada, validación de datos, mensajes de fallo y reset confirmado. Sin garantía de respaldo, colaboración o sincronización entre pestañas.
- Análisis determinista por alcance con fuentes y concentraciones. Se mantiene durante la navegación; al cambiar datos se advierte versión desactualizada. Se pierde al recargar. Regenerar excluye cerrados.
- Borrador de informe y diálogo de impresión nativo; no generación de PDF en servidor.
- Pruebas de dominio/repositorio; validación TypeScript, ESLint y build. No confundirlas con revisión visual, ensayo de navegador o certificación WCAG.

## Simulado o ficticio

| Elemento | Qué significa |
| --- | --- |
| Proyectos, usuarios y observaciones | No son contratos, personas ni inspecciones reales. |
| Avance físico | Dato ficticio registrado, no calculado desde cierre de hallazgos. |
| Rol/persona | Selector de experiencia demo, no autenticación ni seguridad real. |
| Análisis asistido | Reglas: críticos activos, altos vencidos, otros vencidos; sin modelo generativo/predictivo. |
| Documentos/evidencias | Archivos de texto incluidos, no actas oficiales, firmas reales ni fotos de terreno. |
| Agregar evidencia | Añade referencia a un ejemplo local; no carga un archivo del dispositivo. |
| Verificación | Trazabilidad de una acción demo, no acreditación técnica de una instalación. |

La falta de un registro no prueba una falla de la instalación. Recomendaciones requieren revisión profesional. No hay respaldo institucional de Bureau Veritas/Codelco ni promesa de cumplimiento integral de bases.

## Excluido

IA real, API externa, secretos, backend de producción, login real, permisos corporativos, base de datos multiusuario, auditoría inviolable de servidor, sincronización, trabajo offline de terreno, carga de archivos, exportación CSV, recursos del proyecto, notificaciones externas, integraciones Aconex/Ariba/Primavera, BIM, estados de pago y publicación automática. El tablero web **no sustituye Power BI** requerido en las bases.

## Posible extensión futura: LLM de servidor

Solo tras validar P0 y requisitos. Un proveedor intercambiable exclusivamente en servidor recibiría registros ficticios del alcance mínimo. Credencial fuera del cliente/repositorio/logs; salida estructurada validada y referencias cotejadas con IDs existentes; documentos/descripciones tratados como datos, no instrucciones. Timeout, límites, manejo de fallos y fallback simulado claramente identificado. La IA nunca cambia ni cierra hallazgos automáticamente. Sin RAG documental en esta versión.

Antes de datos reales: confirmar formatos y procesos, seguridad, retención, autenticación, backend, alojamiento y obligaciones contractuales. Esta entrega no implementa esa extensión.
