# Traceability Rules — CircularTec

## 1. Objetivo de este documento
Definir las reglas de trazabilidad del sistema CircularTec para garantizar:

- consistencia de estados
- auditabilidad
- integridad del flujo operativo
- claridad en la evolución de cada lote

Este documento es central para backend, frontend y modelo de datos.

---

## 2. Qué significa trazabilidad en CircularTec
La trazabilidad es la capacidad de reconstruir completamente qué ocurrió con un lote desde su creación hasta la emisión del certificado.

El sistema debe poder responder:

- quién creó el lote
- cuándo se creó
- quién lo tomó o fue asignado
- cuándo se retiró
- qué evidencia se registró
- cuándo se cerró la operación
- qué certificado se generó

Si alguna de estas respuestas no es clara, la trazabilidad está incompleta.

---

## 3. Flujo base del sistema
El flujo principal es:

1. Creación del lote (Generador)
2. Asignación o toma del lote (Recolector)
3. Registro del retiro
4. Carga de evidencia
5. Cierre de operación
6. Emisión de certificado

Este flujo no debe romperse ni fragmentarse.

---

## 4. Entidades involucradas
Las principales entidades que participan en la trazabilidad son:

- lotes
- asignaciones
- operaciones
- evidencias
- certificados
- auditoría

Relación conceptual:

lote → asignación → operación → evidencia → cierre → certificado

---

## 5. Estados del flujo (conceptuales)
Para el MVP, los estados deben ser claros, pocos y no ambiguos.

### Estados del lote (ejemplo conceptual)
- creado
- disponible
- asignado / tomado
- en proceso (retiro iniciado)
- retirado
- cerrado
- certificado

No es obligatorio implementar todos explícitamente como enums, pero el flujo debe poder inferirse claramente.

---

## 6. Reglas de transición
Cada transición debe cumplir:

- tener un evento claro
- estar asociada a un actor (usuario/rol)
- registrarse en el sistema (idealmente en auditoría)

Ejemplo:

- “lote creado” → evento del Generador
- “lote asignado” → evento del sistema o admin/recolector
- “retiro registrado” → evento del Recolector
- “operación cerrada” → evento del sistema o actor definido

Nunca debe haber cambios de estado “implícitos” o sin evento asociado.

---

## 7. Registro del retiro
El retiro es un evento crítico.

Debe implicar:
- identificación del lote
- identificación del recolector
- timestamp claro
- inicio de operación real

Este evento marca el paso de “intención” a “ejecución”.

---

## 8. Evidencias
### Regla clave
La evidencia debe asociarse al evento real que busca documentar.

En este sistema:
- conceptualmente corresponde al momento del retiro (o evento equivalente)
- no debería depender del cierre artificial del flujo

### Requisitos
- debe estar vinculada a una operación o evento concreto
- debe tener relación temporal coherente
- debe ser recuperable desde el lote u operación
- debe poder auditarse

### Estado actual
- almacenamiento local en `uploads/`

### Regla para el MVP
- mantener implementación simple
- mejorar coherencia antes que complejidad técnica

---

## 9. Cierre de operación
El cierre de operación implica:

- que el proceso operativo se considera finalizado
- que la información relevante ya fue registrada
- que el sistema puede avanzar a certificación

Reglas:
- no cerrar operación sin datos mínimos completos
- no cerrar operación sin coherencia con evidencia (si aplica)
- el cierre debe ser explícito, no implícito

---

## 10. Certificados
Los certificados son el resultado final de una operación válida.

### Reglas
- no puede existir certificado sin operación válida
- no puede existir certificado sin coherencia con el flujo previo
- debe ser posible rastrear:
  certificado → operación → lote → evidencia

### Implementación actual
- hash + anclaje blockchain simulado

### Principio
El certificado es una “conclusión verificable” del flujo, no un elemento independiente.

---

## 11. Auditoría
La auditoría registra eventos relevantes del sistema.

Debe permitir reconstruir:
- cambios de estado
- acciones de usuarios
- momentos clave del flujo

Eventos típicos:
- creación de lote
- asignación
- registro de retiro
- carga de evidencia
- cierre de operación
- emisión de certificado

### Regla
Todo evento crítico debe poder ser auditado.

---

## 12. Consistencia temporal
El sistema debe respetar una secuencia lógica en el tiempo:

- no puede haber evidencia antes del retiro
- no puede haber cierre antes del retiro
- no puede haber certificado antes del cierre

Si el orden temporal se rompe, la trazabilidad pierde valor.

---

## 13. Visibilidad por rol
La trazabilidad debe adaptarse al rol:

### Generador
Debe ver:
- estado del lote
- hitos relevantes
- evidencia (si aplica)
- certificado

No debe ver:
- detalles técnicos internos
- información de otros usuarios

### Recolector
Debe ver:
- lotes asignados o disponibles
- estado operativo
- acciones necesarias
- carga de evidencia

### Administrador
Debe poder:
- ver todo el flujo completo
- auditar eventos
- detectar inconsistencias

---

## 14. Errores a evitar
Evitar especialmente:

- estados ambiguos o redundantes
- cambios de estado sin evento asociado
- evidencia sin contexto
- certificados sin operación válida
- saltos en el flujo
- duplicación de estados
- lógica diferente en frontend y backend
- trazabilidad implícita (no registrada)

---

## 15. Criterios de calidad de trazabilidad
La trazabilidad es correcta si:

- el flujo es reconstruible de punta a punta
- cada evento tiene actor y momento
- los estados son comprensibles
- la evidencia está bien ubicada
- el certificado refleja una operación real
- no hay contradicciones entre entidades
- el sistema puede explicarse sin ambigüedad

---

## 16. Regla de decisión
Ante cualquier cambio en el sistema:

Si mejora la trazabilidad → probablemente es correcto  
Si la complica o la vuelve ambigua → probablemente es un error

---

## 17. Resumen operativo
CircularTec no es solo un sistema de gestión, es un sistema de trazabilidad.

El valor del producto depende de que cada lote pueda ser seguido de forma clara, consistente y verificable desde su creación hasta su certificación.

Toda decisión técnica o funcional debe respetar este principio.