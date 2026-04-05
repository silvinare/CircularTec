# State Model — CircularTec

## 1. Objetivo de este documento
Definir un modelo claro de estados para CircularTec, evitando ambigüedades entre:

- estado del lote
- estado de la operación
- hitos visibles para cada rol
- transiciones válidas del flujo

Este documento sirve para alinear:
- backend
- frontend
- trazabilidad
- modelo de datos

---

## 2. Principio general
En CircularTec, el flujo principal debe poder leerse de forma clara desde dos niveles:

1. **Lote** → qué situación general tiene el material publicado
2. **Operación** → qué está ocurriendo operativamente con ese lote

Regla clave:
- el **lote** expresa el estado general del caso
- la **operación** expresa el estado de ejecución del flujo

No deben competir entre sí ni duplicar significado innecesariamente.

---

## 3. Flujo principal de referencia
El flujo base del MVP es:

1. Generador crea lote
2. Lote queda disponible
3. Recolector toma o recibe asignación
4. Se registra retiro
5. Se carga evidencia
6. Se cierra operación
7. Se emite certificado

Este flujo debe reflejarse de forma consistente en los estados.

---

## 4. Estado del lote
## Propósito
Representa la situación general del lote dentro del sistema desde la perspectiva de negocio.

## Estados conceptuales sugeridos
- `created`
- `available`
- `assigned`
- `collected`
- `closed`
- `certified`

### Interpretación
- `created`: lote recién creado, todavía no necesariamente publicado o listo
- `available`: lote disponible para ser tomado/asignado
- `assigned`: lote ya fue tomado o asignado a un recolector
- `collected`: el retiro fue efectivamente registrado
- `closed`: la operación terminó correctamente
- `certified`: ya existe certificado verificable asociado

## Regla
El estado del lote debe ser fácil de entender para el Generador y para consultas generales del sistema.

---

## 5. Estado de la operación
## Propósito
Representa el avance operativo de la ejecución sobre un lote.

## Estados conceptuales sugeridos
- `pending`
- `assigned`
- `pickup_registered`
- `evidence_attached`
- `closed`
- `certified`

### Interpretación
- `pending`: existe estructura operativa pero todavía no se ejecutó acción material
- `assigned`: el lote ya tiene responsable operativo
- `pickup_registered`: el retiro fue registrado
- `evidence_attached`: ya existe evidencia asociada al evento relevante
- `closed`: operación finalizada
- `certified`: de esa operación surgió certificado

## Regla
El estado de operación debe reflejar el flujo real de ejecución, no solo una conveniencia visual.

---

## 6. Diferencia entre lote y operación
### El lote responde:
- ¿en qué situación general está este material?

### La operación responde:
- ¿qué pasó concretamente en la ejecución?

## Ejemplo
Un lote puede estar en `assigned`, mientras la operación está en `assigned` o `pending`.

Después del retiro:
- lote: `collected`
- operación: `pickup_registered`

Después del cierre:
- lote: `closed`
- operación: `closed`

Después del certificado:
- lote: `certified`
- operación: `certified`

---

## 7. Regla de no duplicación
No todos los hitos tienen que vivir como estado explícito en ambos lados.

Regla:
- el lote debe tener estados simples y legibles
- la operación puede tener más granularidad si hace falta
- evitar duplicar información si una ya puede inferirse claramente desde la otra

Si hay dos estados que dicen casi lo mismo en dos entidades distintas, revisar si uno sobra.

---

## 8. Transiciones válidas del lote
Las transiciones válidas sugeridas son:

- `created` → `available`
- `available` → `assigned`
- `assigned` → `collected`
- `collected` → `closed`
- `closed` → `certified`

## Restricciones
- no pasar de `available` a `closed` sin retiro
- no pasar a `certified` sin cierre previo
- no retroceder estados sin evento explícito y justificado

---

## 9. Transiciones válidas de la operación
Las transiciones válidas sugeridas son:

- `pending` → `assigned`
- `assigned` → `pickup_registered`
- `pickup_registered` → `evidence_attached`
- `evidence_attached` → `closed`
- `closed` → `certified`

## Flexibilidad controlada
Si el MVP requiere permitir cierre con evidencia opcional en algunos casos, debe quedar documentado explícitamente.

Pero la regla general debería ser:
- retiro antes que evidencia
- evidencia antes que cierre
- cierre antes que certificado

---

## 10. Eventos que disparan transiciones
Cada cambio de estado debe corresponder a un evento claro.

### Eventos típicos
- creación de lote
- publicación/disponibilización
- asignación o toma
- registro de retiro
- carga de evidencia
- cierre de operación
- emisión de certificado

## Regla
No debe haber cambios de estado “mágicos” o implícitos sin evento claro.

---

## 11. Visibilidad de estados por rol
## Generador
Debe ver estados simples y entendibles:
- Disponible
- Asignado
- Retirado
- Cerrado
- Certificado

No necesita ver granularidad técnica interna innecesaria.

## Recolector
Debe ver estados más operativos:
- Asignado
- Retiro pendiente
- Evidencia pendiente
- Listo para cierre
- Cerrado

## Administrador
Puede ver ambos niveles:
- estado del lote
- estado de operación
- historial completo

---

## 12. Relación con trazabilidad
Los estados no son solo etiquetas visuales; son parte del sistema de trazabilidad.

Cada estado debe poder responder:
- qué pasó
- quién lo hizo
- cuándo ocurrió
- qué evidencia lo respalda, si aplica

Si un estado no puede explicarse con un evento concreto, está mal definido.

---

## 13. Relación con auditoría
Toda transición importante debería reflejarse en auditoría.

Ejemplos:
- lote creado
- lote asignado
- retiro registrado
- evidencia cargada
- operación cerrada
- certificado emitido

## Regla
La auditoría no reemplaza al estado, pero debe permitir explicar por qué se llegó a ese estado.

---

## 14. Reglas para frontend
El frontend:
- muestra estados
- habilita acciones según estado
- no decide transiciones reales

Ejemplo:
- si el backend indica `assigned`, el frontend puede mostrar “Registrar retiro”
- si el backend indica `pickup_registered`, puede mostrar “Cargar evidencia”

## Regla
La lógica de transición vive en backend, no en frontend.

---

## 15. Reglas para backend
El backend:
- define estados válidos
- valida transiciones
- impide secuencias incoherentes
- registra eventos y auditoría

## Regla
El backend es la fuente de verdad del modelo de estados.

---

## 16. Errores a evitar
Evitar especialmente:

- estados redundantes entre lote y operación
- estados ambiguos
- transiciones sin evento
- saltos de estado sin validación
- frontend que interpreta estados de forma distinta a backend
- estados pensados solo para UI y no para dominio

---

## 17. Criterio para agregar nuevos estados
Solo agregar un nuevo estado si:

- representa una situación realmente distinta
- mejora trazabilidad
- simplifica decisiones del sistema
- evita ambigüedad

No agregar estados por:
- conveniencia momentánea
- necesidad visual aislada
- sobreingeniería

---

## 18. Recomendación práctica para el MVP
Para esta etapa, conviene:
- mantener pocos estados
- usar nombres claros
- privilegiar transiciones simples
- documentar bien qué significa cada estado

Es mejor un modelo de estados corto y sólido que uno muy detallado y confuso.

---

## 19. Resumen operativo
En CircularTec:
- el **lote** muestra la situación general
- la **operación** muestra la ejecución real
- las transiciones deben ser claras
- el backend controla el flujo
- el frontend refleja el estado
- la auditoría explica cómo se llegó ahí

La calidad del MVP depende en gran parte de que este modelo sea consistente.