# Backend Checklist — CircularTec

## 1. Objetivo de este documento
Definir una checklist práctica para revisar cualquier cambio en backend dentro de CircularTec.

Esta checklist busca reducir el riesgo de:
- romper flujos existentes
- introducir inconsistencias en trazabilidad
- exponer datos incorrectos
- degradar contratos de la API
- mezclar responsabilidades

Debe usarse antes de considerar una tarea de backend como terminada.

---

## 2. Principio general
Todo cambio en backend debe cumplir dos condiciones:

1. resolver un problema concreto
2. no romper la coherencia del MVP

Si un cambio mejora una parte pero pone en riesgo auth, trazabilidad o contratos, no está listo.

---

## 3. Checklist general
Antes de cerrar una tarea de backend, verificar:

- [ ] el cambio tiene un objetivo claro
- [ ] el alcance está controlado
- [ ] no modifica módulos no relacionados sin necesidad
- [ ] no introduce abstracciones innecesarias
- [ ] no agrega dependencias innecesarias

---

## 4. Checklist de arquitectura
Verificar:

- [ ] la lógica de negocio sigue en backend
- [ ] el frontend no absorbe lógica que debería vivir en API
- [ ] no se mezclan responsabilidades entre rutas, servicios y acceso a datos
- [ ] el cambio respeta `docs/api-boundaries.md`

Preguntas guía:
- ¿esta decisión pertenece realmente al backend?
- ¿estoy moviendo lógica a otra capa por conveniencia?

---

## 5. Checklist de dominio y modelo de datos
Verificar:

- [ ] el cambio respeta el modelo definido en `docs/data-model.md`
- [ ] no duplica responsabilidades entre entidades
- [ ] no crea relaciones ambiguas
- [ ] no rompe coherencia entre lote, operación, evidencia y certificado
- [ ] no introduce estados difíciles de interpretar

Preguntas guía:
- ¿esta información pertenece a esta entidad?
- ¿estoy guardando en lote algo que debería estar en operación?
- ¿estoy generando acoplamiento innecesario?

---

## 6. Checklist de estados y trazabilidad
Verificar:

- [ ] las transiciones de estado siguen siendo válidas
- [ ] no hay saltos de estado incoherentes
- [ ] el cambio respeta `docs/state-model.md`
- [ ] el cambio respeta `docs/traceability-rules.md`
- [ ] cada evento importante sigue siendo reconstruible
- [ ] la evidencia sigue asociada al evento correcto
- [ ] no se puede emitir certificado en condiciones inconsistentes

Preguntas guía:
- ¿qué evento dispara este cambio?
- ¿quién lo ejecuta?
- ¿queda registro suficiente?
- ¿el flujo sigue siendo auditable?

---

## 7. Checklist de permisos y seguridad
Verificar:

- [ ] JWT sigue siendo la base de autenticación
- [ ] no se reintroducen mocks en rutas privadas
- [ ] los permisos se validan en backend
- [ ] un usuario no puede acceder a datos de otro sin permiso
- [ ] las rutas sensibles validan rol y contexto organizacional
- [ ] no se exponen datos innecesarios en responses

Preguntas guía:
- ¿qué pasa si este endpoint lo llama otro rol?
- ¿estoy confiando demasiado en el frontend?
- ¿puede filtrarse información de otra organización?

---

## 8. Checklist de endpoints y contratos API
Verificar:

- [ ] el endpoint sigue siendo consistente con el contrato esperado
- [ ] no se cambió estructura de respuesta sin justificación
- [ ] se preservan filtros y paginación cuando corresponda
- [ ] los errores se manejan de forma clara
- [ ] los nombres y formatos son consistentes con endpoints similares

Preguntas guía:
- ¿rompe algo en frontend?
- ¿este response sigue siendo estable?
- ¿el cambio debería estar documentado?

---

## 9. Checklist de validaciones
Verificar:

- [ ] inputs críticos se validan en backend
- [ ] se manejan datos faltantes o inválidos
- [ ] no se permiten transiciones inválidas por omisión
- [ ] no se aceptan datos fuera de contexto
- [ ] el manejo de errores es razonable para el MVP

Preguntas guía:
- ¿qué pasa si falta un dato clave?
- ¿qué pasa si llega un estado inválido?
- ¿qué pasa si el recurso no pertenece al usuario?

---

## 10. Checklist de auditoría
Verificar:

- [ ] eventos críticos siguen siendo auditables
- [ ] los cambios de estado relevantes pueden reconstruirse
- [ ] el actor de la acción es identificable
- [ ] los timestamps son coherentes
- [ ] no se pierden eventos importantes del flujo

Preguntas guía:
- ¿podría explicar después qué pasó con este lote?
- ¿podría rastrear quién hizo esta acción?

---

## 11. Checklist de evidencias y certificados
Verificar:

- [ ] las evidencias siguen vinculadas a una operación o evento claro
- [ ] el cambio no deja evidencias “sueltas”
- [ ] el certificado sigue dependiendo de una operación válida
- [ ] el flujo evidencia → cierre → certificado mantiene coherencia
- [ ] no se crea certificación sin respaldo suficiente

Preguntas guía:
- ¿la evidencia está asociada al momento correcto?
- ¿el certificado sigue siendo trazable?

---

## 12. Checklist de impacto en roles
Verificar:

- [ ] el cambio no mezcla experiencias de roles
- [ ] el Generador sigue viendo solo sus datos
- [ ] el backend no devuelve datos de otros perfiles por error
- [ ] las acciones habilitadas siguen correspondiendo al rol correcto

Preguntas guía:
- ¿esto afecta al Generador?
- ¿esto cambia algo para Recolector?
- ¿estoy devolviendo más información de la necesaria?

---

## 13. Checklist de simplicidad MVP
Verificar:

- [ ] el cambio resuelve una necesidad real
- [ ] no anticipa complejidad futura innecesaria
- [ ] no convierte el MVP en un sistema enterprise
- [ ] la solución elegida es simple y entendible

Preguntas guía:
- ¿esto es realmente necesario ahora?
- ¿hay una solución más simple?
- ¿estoy sobre-diseñando?

---

## 14. Checklist antes de implementar
Antes de tocar código, confirmar:

- [ ] entendí el problema
- [ ] entendí el módulo afectado
- [ ] revisé el impacto en trazabilidad
- [ ] revisé el impacto en auth/permisos
- [ ] revisé el impacto en contratos API
- [ ] el cambio es incremental

---

## 15. Checklist antes de dar por terminada una tarea
Antes de considerar finalizada una tarea de backend, confirmar:

- [ ] el problema pedido quedó resuelto
- [ ] no se rompió auth
- [ ] no se rompieron permisos
- [ ] no se rompió trazabilidad
- [ ] no se rompió el modelo de estados
- [ ] no se rompieron contratos consumidos por frontend
- [ ] el cambio sigue siendo entendible
- [ ] el alcance fue controlado

---

## 16. Regla de decisión final
Si un cambio:
- mejora el flujo
- mantiene trazabilidad
- respeta permisos
- no rompe contratos
- y sigue siendo simple

entonces probablemente es correcto.

Si para funcionar necesita:
- excepciones raras
- parches en frontend
- lógica duplicada
- estados ambiguos
- respuestas inconsistentes

entonces probablemente no está listo.

---

## 17. Resumen operativo
El backend de CircularTec debe proteger el núcleo del MVP:

- auth
- permisos
- estados
- trazabilidad
- evidencias
- certificados
- contratos API

Esta checklist existe para asegurar que cada cambio preserve ese núcleo.