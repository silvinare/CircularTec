# Module Spec — Recolector

## 1. Objetivo del módulo
El módulo Recolector representa la experiencia del usuario que toma o recibe asignaciones sobre lotes publicados en CircularTec y ejecuta la parte operativa del flujo vinculada al retiro.

Su objetivo es permitir que el Recolector pueda:

- ver lotes disponibles o asignados
- tomar o gestionar lotes
- registrar el retiro
- adjuntar evidencia
- avanzar el flujo operativo de manera clara y consistente

Este módulo es posterior al Generador en prioridad, pero debe diseñarse desde ahora con coherencia respecto del flujo general del sistema.

---

## 2. Principio rector de este módulo
La experiencia del Recolector debe estar enfocada en **ejecución operativa clara, simple y auditable**.

Reglas centrales:
- el Recolector debe ver solo la información necesaria para operar
- debe tener claridad sobre qué acción le toca realizar
- cada acción debe corresponder a un evento real del flujo
- la interfaz debe ayudar a completar el proceso sin ambigüedad

---

## 3. Qué necesita resolver el Recolector
Desde la perspectiva del usuario, el Recolector quiere poder responder preguntas como:

- ¿qué lotes puedo tomar o tengo asignados?
- ¿qué debo retirar?
- ¿qué lote ya retiré?
- ¿en qué estado está cada operación?
- ¿dónde debo cargar la evidencia?
- ¿qué tareas me faltan para cerrar correctamente una operación?

El módulo debe priorizar estas necesidades y evitar complejidad innecesaria.

---

## 4. Alcance funcional esperado
El módulo Recolector debe cubrir al menos estas capacidades:

1. Ver lotes disponibles o asignados
2. Tomar un lote o gestionar una asignación
3. Ver detalle operativo del lote
4. Registrar retiro
5. Cargar evidencia
6. Confirmar o cerrar su parte del flujo si corresponde

Estas capacidades deben alinearse con la trazabilidad general del sistema.

---

## 5. Reglas funcionales del módulo
### 5.1 Información visible
El Recolector debe ver:
- lotes disponibles para operar, si el flujo lo permite
- lotes asignados a él
- datos operativos necesarios del lote
- estado actual de la operación
- evidencias cargadas o pendientes si corresponde

No debería ver:
- controles administrativos globales
- datos irrelevantes de otros roles
- información interna no necesaria para ejecutar el retiro
- certificados ajenos salvo que su flujo requiera validación puntual

### 5.2 Enfoque de la experiencia
La UI del Recolector debe estar orientada a acción:
- qué lote atender
- qué estado tiene
- qué siguiente paso corresponde
- qué evidencia falta

Debe evitar:
- exceso de texto
- información decorativa innecesaria
- ambigüedad en los estados
- acciones habilitadas fuera de secuencia

---

## 6. Vista: Lotes disponibles / asignados
### Objetivo
Permitir al Recolector identificar rápidamente qué lotes puede operar.

### Debe incluir
- listado de lotes disponibles o asignados, según el modelo implementado
- estado operativo visible
- datos resumidos útiles para decidir acción
- acceso al detalle del lote/operación

### Debe permitir responder
- cuáles puedo tomar
- cuáles ya me corresponden
- cuáles están pendientes de retiro
- cuáles tienen acciones pendientes

### No debería incluir
- métricas globales administrativas
- datos ajenos a la operación
- estados confusos o duplicados

---

## 7. Vista: Detalle operativo del lote
### Objetivo
Mostrar al Recolector toda la información necesaria para ejecutar correctamente el retiro y continuar el flujo.

### Debe incluir
- identificación clara del lote
- datos relevantes para el retiro
- estado actual
- historial o hitos mínimos necesarios
- acciones disponibles según estado
- acceso a registrar retiro o cargar evidencia

### Debe permitir responder
- qué tengo que hacer con este lote
- si ya fue retirado
- si falta evidencia
- si la operación puede cerrarse o no

### Regla importante
Las acciones deben estar habilitadas según el estado real del flujo, no solo según la conveniencia de UI.

---

## 8. Acción: Tomar o aceptar lote
### Objetivo
Permitir que el Recolector asuma responsabilidad operativa sobre un lote, si ese comportamiento existe en el flujo.

### Requisitos
- debe quedar claro cuándo el lote pasa a estar bajo gestión del Recolector
- la acción debe generar un cambio de estado o evento claro
- debe poder auditarse

### Regla
No debe existir “toma” ambigua o silenciosa del lote.

---

## 9. Acción: Registrar retiro
### Objetivo
Registrar el evento real de retiro del lote.

### Debe implicar
- identificación del lote
- identificación del Recolector
- timestamp claro
- cambio de estado consistente

### Principio
Registrar retiro no es solo “marcar un botón”, sino dejar constancia del evento operativo.

### Regla
No debe poder ejecutarse dos veces de forma inconsistente.
No debe habilitar cierre si el flujo previo no es coherente.

---

## 10. Acción: Cargar evidencia
### Objetivo
Adjuntar prueba o respaldo del evento operativo correspondiente.

### Requisitos
- la evidencia debe asociarse al evento correcto
- debe ser clara su relación con el lote u operación
- debe poder consultarse luego

### Principio
La evidencia idealmente se asocia al momento del retiro o al evento operativo que documenta, no a un cierre artificial si eso rompe coherencia.

### Regla
No debe existir evidencia “suelta” sin contexto operativo.

---

## 11. Acción: Cierre operativo
### Objetivo
Permitir que la operación avance a una instancia cerrada o lista para certificación, según el flujo definido.

### Requisitos
- debe existir consistencia con retiro y evidencia
- no debe cerrar una operación incompleta
- debe quedar claro quién ejecutó el cierre y cuándo

### Regla
El cierre debe ser explícito y auditable.

---

## 12. Relación con trazabilidad
El módulo Recolector está directamente conectado con el corazón trazable del sistema.

Toda acción del Recolector debe poder reconstruirse después en términos de:
- quién actuó
- sobre qué lote
- cuándo actuó
- qué evidencia adjuntó
- cómo cambió el estado del flujo

Si una acción no deja esa huella, hay un problema de trazabilidad.

---

## 13. Relación con otros roles
### Con Generador
El Recolector no debe compartir la misma experiencia del Generador.
Ambos participan en el mismo flujo, pero desde vistas y necesidades diferentes.

### Con Administrador
El Recolector no debería ver controles de supervisión global, auditoría completa o métricas de administración.

### Regla general
La experiencia debe estar separada por perfil aunque el backend comparta el mismo dominio.

---

## 14. Criterios de calidad del módulo
Se considera que el módulo Recolector está bien resuelto si:

- el usuario entiende qué lotes debe operar
- puede registrar el retiro sin ambigüedad
- puede cargar evidencia en el momento correcto
- las acciones disponibles reflejan el estado real
- no se mezclan funciones administrativas
- las operaciones dejan trazabilidad clara
- la experiencia está orientada a ejecución, no a exploración compleja

---

## 15. Errores a evitar
Evitar especialmente:

- mostrar acciones incompatibles con el estado actual
- permitir retiros duplicados o inconsistentes
- cargar evidencia sin relación clara con un evento
- mezclar vistas del Recolector con las del Generador
- exponer controles administrativos
- exigir demasiados pasos manuales para acciones simples
- usar lenguaje técnico innecesario
- ocultar el siguiente paso operativo

---

## 16. Criterios para cambios futuros
Ante una propuesta de mejora en este módulo, priorizar siempre:

1. claridad de la acción a ejecutar
2. consistencia con trazabilidad
3. simplicidad operativa
4. auditabilidad
5. bajo riesgo técnico

Si una mejora complica el flujo del retiro sin aportar trazabilidad o claridad, no debería priorizarse.

---

## 17. Resumen operativo
El módulo Recolector es la capa operativa del MVP.

Su misión es permitir que el usuario:
- tome o gestione lotes
- registre el retiro
- adjunte evidencia
- avance el flujo de forma consistente

Todo dentro de una experiencia:
- clara
- accionable
- auditable
- alineada con trazabilidad