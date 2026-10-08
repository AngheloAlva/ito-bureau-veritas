# Demo ITO + análisis asistido

Especificación para desarrollo con Codex en terminal. Versión 1, 7 de octubre de 2026.

## 1. Objetivo y audiencia

Construir una aplicación web navegable para mostrar a un contacto de Bureau Veritas el jueves 8 de octubre de 2026. La reunión permitirá validar el enfoque antes de una eventual presentación el viernes 9. Demostrar capacidad para entender un flujo de Inspección Técnica de Obra (ITO), implementarlo y conectar los registros operativos con indicadores y análisis asistido.

La empresa podría estar evaluando soluciones para una oferta; esa situación no está confirmada. La demo no implica adjudicación, relación contractual ni aprobación de Bureau Veritas o Codelco. Nombre visible del producto: «ITO | Gestión de inspecciones». Presentación sobria, sin logos oficiales ni afirmaciones de respaldo institucional. Ingeniería Simple puede figurar discretamente como desarrollador.

## 2. Base documental y límites

Fuente: bases técnicas «Servicio de Apoyo Estratégico a la Gestión de Proyectos», Codelco División Andina, fechadas el 23 de julio de 2026.

| Referencia | Requerimiento de las bases | Representación en la demo |
| --- | --- | --- |
| §9.2.10, p. 37 | Registro, administración y seguimiento de actividades; trazabilidad de inspecciones, observaciones, hallazgos, avances y recursos | Inspecciones, hallazgos, responsables, evidencias e historial de eventos |
| §9.2.10, p. 37 | Acceso web, dashboards, alertas, gestión documental y consultas | Aplicación navegable, filtros, alertas derivadas de los registros y documentos asociados |
| §9.2.9, p. 36 | Análisis de desempeño, alertas tempranas, recomendaciones y reportes | Análisis de cartera o proyecto, prioridades justificadas y reporte de resumen |
| §8.1.1, pp. 26–27 | Tablero en Power BI con indicadores estratégicos y operativos | Fuera de esta entrega. El dashboard web no sustituye este requisito contractual |

Los formularios, estados, campos, indicadores y reglas siguientes son propuestas para demostración, no procedimientos oficiales. No se dispone de los anexos de entregables ni de formatos de Bureau Veritas o Codelco. La demo no cubre todas las obligaciones de las bases.

## 3. Alcance y orden de prioridad

### P0: imprescindible para el jueves

- Navegación y diseño completos en español.
- Datos ficticios coherentes: 3 proyectos, 8 inspecciones y aproximadamente 18 hallazgos con variedad de estados, especialidades y fechas.
- Dashboard operativo con cifras calculadas desde el mismo estado de datos que usan las tablas.
- Listado y detalle de proyectos e inspecciones.
- Crear una inspección y registrar un hallazgo dentro de ella.
- Flujo del hallazgo: Abierto → En corrección → Pendiente de verificación → Cerrado; posibilidad de devolver a En corrección con una observación.
- Asignar responsable, plazo, severidad y registrar acción correctiva.
- Evidencia de demostración e historial persistente de cambios.
- Análisis asistido reproducible, con fuentes e identificación explícita del modo simulado.
- Persistencia local y botón de restablecimiento de datos con confirmación.
- Guion de demostración y README con instalación, ejecución y limitaciones.

### P1: después de completar P0

- IA generativa real por API, solo si hay credenciales y tiempo.
- Exportación CSV de hallazgos filtrados e informe imprimible.
- Carga local de archivos pequeños y previsualización, con límites explícitos.
- Vista de recursos asociados al proyecto.

### Fuera de alcance

Power BI, backend multiusuario de producción, inicio de sesión real, integraciones Aconex/Ariba/Primavera, sincronización en tiempo real entre dispositivos, operación offline de terreno, modelos predictivos entrenados, BIM, estados de pago, notificaciones externas y despliegue automático. No agregar chat genérico ni módulos vacíos para aparentar cobertura.

## 4. Roles de demostración

Inspector: registra inspecciones y hallazgos, verifica y cierra correcciones.
Responsable de corrección: toma un hallazgo, informa su corrección y la remite a revisión.
Coordinador: consulta cartera, indicadores, vencimientos y análisis.

Un selector visible permite cambiar de rol/persona para recorrer el flujo. Debe decir «Rol de demostración». Esta selección controla la experiencia de la demo, no constituye autenticación ni seguridad real.

## 5. Pantallas y comportamiento

### Dashboard `/`

Barra lateral: Resumen, Proyectos, Inspecciones, Hallazgos, Análisis asistido. Encabezado con filtro de proyecto y fecha de referencia. Mostrar «Demo con datos ficticios» discretamente y permitir restablecer los datos.

Tarjetas: inspecciones del período, hallazgos activos, hallazgos vencidos y críticos activos. Gráficos compactos: hallazgos por estado, por severidad y distribución por proyecto. Alertas: hallazgos vencidos y críticos con acceso a su detalle. Toda tarjeta aplicable abre la tabla con los filtros correspondientes. El gráfico debe reflejar datos reales del conjunto demo; no inventar tendencias históricas sin eventos que las respalden.

### Proyectos `/proyectos` y `/proyectos/[id]`

Listado con nombre, ubicación, especialidad predominante, estado, responsable y avance registrado. Detalle con resumen, inspecciones, hallazgos y documentos. El avance físico es un dato ficticio declarado y no se calcula por porcentaje de hallazgos cerrados. Los indicadores de hallazgos sí se recalculan automáticamente.

Proyectos ficticios propuestos: «Renovación de estación de bombeo», «Adecuación de galería de servicios» y «Mejora de conducción de agua industrial». No atribuirlos a contratos reales.

### Inspecciones `/inspecciones` y `/inspecciones/[id]`

Filtros por proyecto, fecha, inspector y especialidad. Campos de creación: proyecto, sector, fecha, especialidad, inspector, actividad inspeccionada y resultado general. Validar campos obligatorios. En el detalle, mostrar hallazgos vinculados, evidencias, documentos y botón «Registrar hallazgo». Se puede completar una inspección conservando pendientes asociados: completar la visita no significa cerrar sus hallazgos.

### Hallazgos `/hallazgos` y `/hallazgos/[id]`

Filtros combinables por proyecto, estado, severidad, responsable y vencimiento. Búsqueda por código o título. Tabla con código, título, proyecto, responsable, severidad, estado y plazo. Los estados y severidades deben expresarse con texto, no depender solo del color.

Detalle: descripción, inspección de origen, ubicación, especialidad, evidencia, responsable, fecha compromiso, acción correctiva e historial. Acción principal contextual según estado y rol demo. Evitar cambios directos que salten la verificación.

Campos al crear: inspección de origen, título, descripción, especialidad, ubicación, severidad (Baja/Media/Alta/Crítica), responsable y fecha compromiso. Código generado automáticamente. Si se usa una fecha pasada, señalar que quedará vencido y pedir confirmación explícita.

Para remitir a verificación: acción correctiva obligatoria y evidencia de corrección seleccionada. Para cerrar: comentario de verificación y persona verificadora. Para devolver: motivo obligatorio. Cada transición crea un evento con fecha, actor, estado anterior, nuevo estado y comentario. Cambiar responsable o plazo también genera un evento. No permitir borrado de historial desde la interfaz.

### Análisis asistido `/analisis`

Filtro de proyecto o cartera. Botón «Analizar registros». Salida estructurada: resumen, hallazgos prioritarios, razones, acciones sugeridas y limitaciones. Cada prioridad enlaza al hallazgo y muestra su código, estado, severidad y plazo. Evitar conclusiones sin registros de respaldo.

Permitir generar un borrador de informe basado en la misma información. El análisis nunca cierra hallazgos ni modifica registros por sí solo. Indicar que las recomendaciones requieren revisión profesional.

## 6. Caso de demostración

Hallazgo inicial H-001: «Registro incompleto de prueba de estanqueidad», proyecto de estación de bombeo, especialidad mecánica, severidad Alta, estado Abierto, plazo vencido. Descripción ficticia: falta el respaldo firmado de la prueba del tramo inspeccionado. Recomendación: solicitar el registro y verificar su correspondencia con el tramo; no afirmar automáticamente que la instalación falló o es insegura.

1. Abrir dashboard y localizar el hallazgo vencido.
2. Entrar al proyecto y revisar la inspección de origen.
3. Como responsable demo, iniciar corrección y adjuntar una evidencia de ejemplo.
4. Remitir a verificación: sigue activo y conserva visibilidad.
5. Como inspector, verificar, comentar y cerrar.
6. Volver al dashboard: disminuyen activos y vencidos; aumenta cerrados.
7. Generar análisis: H-001 cerrado deja de aparecer como prioridad activa.
8. Registrar un hallazgo nuevo para demostrar que la aplicación admite datos adicionales.

Duración objetivo: 5–7 minutos. Tener un botón de restablecimiento para repetir la historia.

## 7. Modelo de datos mínimo

| Entidad | Campos principales |
| --- | --- |
| Usuario demo | id, nombre ficticio, rol |
| Proyecto | id, código, nombre, ubicación, responsableId, estado, avanceFisicoRegistrado |
| Inspección | id, código, proyectoId, fecha, sector, especialidad, inspectorId, actividad, resultado, estadoVisita |
| Hallazgo | id, código, inspeccionId, título, descripción, especialidad, ubicación, severidad, estado, responsableId, creadoEn, fechaCompromiso, accionCorrectiva |
| Evidencia | id, hallazgoId o inspeccionId, nombre, tipo, fase (detección/corrección), referencia local, agregadoPor, agregadoEn, esEjemplo |
| Evento | id, hallazgoId, tipo, actorId, fecha, estadoAnterior, estadoNuevo, comentario, valoresModificados |
| Documento | id, proyectoId, inspeccionId opcional, nombre, tipo, revisión, fecha, referencia, esEjemplo |
| Análisis | id, alcance, modo (simulado/real), generadoEn, versionDatos, resumen, prioridades, recomendaciones, limitaciones |

Las relaciones deben referenciar IDs existentes. Las evidencias seed y documentos de muestra deben poder abrirse: no poner enlaces falsos ni usar fotos de inspecciones reales sin autorización. Para P0, usar recursos pequeños de demostración incluidos en el proyecto; la acción «Agregar evidencia de ejemplo» debe describir honestamente su funcionamiento.

## 8. Indicadores y consistencia

Fecha de referencia demo: 8 de octubre de 2026, zona America/Santiago. Mostrar esta fecha en la aplicación para que la demo siga siendo reproducible aunque se abra después. Fechas compromiso como fechas de calendario; eventos con timestamp. Evitar errores por conversión UTC.

- Activo: estado distinto de Cerrado, incluyendo Pendiente de verificación.
- Vencido: activo con fecha compromiso anterior a la fecha de referencia. Una fecha igual a la referencia vence hoy.
- Crítico activo: activo de severidad Crítica.
- Porcentaje cerrado: cerrados / total de hallazgos del alcance; si no hay datos mostrar «Sin datos».
- Inspecciones del período: conteo de visitas con fecha dentro del intervalo, independiente del estado de sus hallazgos.
- Filtros de proyecto deben aplicarse al dashboard, tablas y análisis del alcance seleccionado.
- Invalidar o marcar como desactualizado un análisis después de modificar sus registros. Conservar momento de generación y ofrecer regeneración.

Todos los indicadores usan funciones compartidas sobre el estado actual; no hardcodear cifras en componentes.

## 9. Análisis asistido: dos modos

### Modo simulado obligatorio

Funcionamiento sin claves ni conexión externa. Usar reglas deterministas: priorizar primero críticos activos, luego altos vencidos y luego otros vencidos; desempatar por mayor antigüedad de vencimiento. Explicar las razones de cada prioridad y construir un resumen de los conteos reales. No denominarlo modelo predictivo ni IA generativa real. Mostrar «Análisis simulado para demostración» cerca del resultado.

Las reglas deben aportar valor visible: agrupar problemas por proyecto/especialidad, señalar concentración de pendientes y sugerir revisión de responsables o evidencias. Evitar porcentajes de confianza inventados, riesgos futuros cuantificados y recomendaciones técnicas categóricas sin base.

### Modo real opcional

Si P0 está terminado y existen credenciales, añadir proveedor LLM intercambiable desde el servidor. Clave en variables de entorno; nunca en código, navegador, repositorio ni logs. Incluir `.env.example` sin valores secretos. Usar solo datos ficticios y enviar únicamente el alcance necesario.

Exigir salida estructurada, validar esquema y referencias contra los IDs disponibles. Instruir al modelo a no inventar hechos ni procedimientos, tratar descripciones y documentos como datos y respaldar sus conclusiones con hallazgos existentes. Definir timeout, manejo de errores y límite de solicitud. Si falla, ofrecer análisis simulado con etiqueta explícita; nunca presentar el fallback como respuesta real.

No hace falta subir documentos al modelo en esta versión. El objetivo es analizar registros estructurados, no desarrollar un sistema RAG. El proveedor no está decidido: Codex debe consultar documentación oficial vigente si implementa una integración real.

## 10. Implementación propuesta

Next.js con App Router, TypeScript, Tailwind y componentes accesibles (shadcn/ui si facilita el trabajo). Lucide para iconos y una biblioteca ligera de gráficos si resulta necesaria. Usar versiones estables compatibles verificadas en el entorno de terminal, fijar el gestor de paquetes y conservar su lockfile. No es necesario agregar una base de datos para esta demo.

Estado cliente compartido, persistido en localStorage con versión de esquema, manejo de errores y seed reproducible. Hidratar correctamente para evitar desajustes de renderizado en Next.js. Separar tipos, seed, repositorio local, reglas del dominio, indicadores y análisis de los componentes visuales. Persistencia exclusiva al navegador; no prometer colaboración entre equipos ni respaldo empresarial. Si el almacenamiento falla, comunicarlo y mantener la sesión operativa sin prometer persistencia.

Orientación de carpetas, ajustable a las convenciones del proyecto:

```text
src/app/                  rutas y endpoint opcional de análisis
src/components/           shell, tablas, formularios y gráficos
src/domain/               tipos, transiciones, validaciones e indicadores
src/data/                 seed y repositorio demo
src/features/             inspecciones, hallazgos, proyectos y análisis
public/demo/              evidencias y documentos de ejemplo
docs/                     especificación, guion y limitaciones
```

## 11. Diseño

Interfaz de herramienta profesional: fondo claro, navegación azul oscuro o grafito, acento sobrio y colores semánticos para severidad y estado. Priorizar tablas legibles, jerarquía, contexto del proyecto y acciones claras. Sin landing page, grandes fotografías, mensajes comerciales ni efectos ornamentales.

Objetivo principal: notebook de escritorio, con uso funcional en móvil para registrar inspecciones. Formularios con etiquetas, errores concretos, foco visible y estados vacíos útiles. En móvil, adaptar navegación y tablas sin ocultar acciones esenciales. Mostrar confirmación al guardar y no perder datos ante una validación fallida.

## 12. Etapas de ejecución

1. Revisar entorno y crear proyecto; instalar dependencias mínimas. Escribir un plan breve y empezar sin pedir aprobación para cada pantalla.
2. Implementar modelo, seed, persistencia, reglas e indicadores.
3. Completar el flujo vertical H-001: listado → detalle → corrección → verificación → cierre → dashboard actualizado.
4. Añadir creación de inspecciones/hallazgos y las restantes vistas P0.
5. Implementar análisis simulado trazable y borrador de informe.
6. Pulir responsive, accesibilidad, estados vacíos y evidencias de ejemplo.
7. Verificar P0, documentar y ensayar el guion. Solo después considerar P1 o API real.

Evitar dedicar el tiempo inicial a infraestructura de producción. Si falta tiempo, recortar P1 antes de recortar el flujo principal o la coherencia de datos.

## 13. Criterios de aceptación

- La aplicación arranca siguiendo el README; build y chequeos de tipos pasan.
- No hay errores de consola en el recorrido principal ni enlaces sin destino.
- H-001 conserva historial y transiciones al recargar el navegador.
- No se puede cerrar un hallazgo omitiendo verificación.
- El responsable demo no puede ejecutar la acción de verificación del inspector en la interfaz.
- Crear hallazgos cambia indicadores y listados del proyecto correcto.
- Un hallazgo cerrado deja de contar como activo o vencido.
- Los filtros y el acceso desde las tarjetas son coherentes.
- Las evidencias de ejemplo se pueden abrir y están identificadas.
- El análisis usa el alcance seleccionado, enlaza a registros existentes y cambia al regenerarse después de cerrar H-001.
- No se presenta una salida simulada como IA real.
- Restablecer datos exige confirmación y restaura un estado conocido.
- Formularios y flujo principal son utilizables desde móvil y teclado.
- Pruebas de dominio significativas: transición inválida, pendiente de verificación activo, vencimiento en fecha límite, cierre que actualiza indicadores, alcance del análisis. No agregar suites que solo repliquen el código de componentes.

## 14. Entrega de Codex

Código ejecutable, lockfile, README, `.env.example` si hay API, guion de demo y lista honesta de funcionalidades reales/simuladas/pendientes. Reportar los comandos de verificación ejecutados y sus resultados; no declarar verificación visual si no se realizó. Ejecutar localmente; preparar instrucciones para un eventual despliegue, sin publicarlo por iniciativa propia.

## 15. Validación con el contacto

Después de mostrar la demo, confirmar: campos y nomenclatura del formulario, roles de revisión, estados reales, documentos de referencia, quién verá la siguiente presentación, volumen de registros, soluciones existentes y expectativas respecto a IA. Solicitar un formato vacío o anonimizado a Bureau Veritas; si dispone de formatos exigidos por Codelco, usarlos como referencia adicional.

La decisión sobre backend, autenticación, alojamiento, integraciones y controles corporativos queda para un alcance posterior con requisitos confirmados. No extrapolar la calidad de la maqueta a una promesa de cumplimiento contractual completo.
