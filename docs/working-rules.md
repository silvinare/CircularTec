# Working Rules — CircularTec

## 1. Objetivo de estas reglas
Este documento define reglas prácticas para trabajar en el repositorio de CircularTec de forma consistente, segura y enfocada en el MVP.

Estas reglas complementan:
- `AGENTS.md`
- `docs/product-context.md`

---

## 2. Regla general
Toda tarea debe intentar resolver un problema concreto del MVP con el menor cambio posible.

Priorizar:
- cambios pequeños
- cambios comprensibles
- cambios reversibles
- cambios alineados con el flujo real del producto

---

## 3. Cómo abordar una tarea
Antes de implementar:
1. entender el módulo afectado
2. identificar si toca frontend, backend, base de datos o varios
3. revisar si impacta trazabilidad, roles o certificados
4. evitar refactors colaterales no pedidos

Si el cambio es grande:
- primero proponer plan breve
- después implementar por partes

---

## 4. Separación por módulo
Trabajar preferentemente por módulos o conversaciones separadas:

- arquitectura general
- generador
- recolector
- trazabilidad
- backend/api
- evidencias
- auth/roles
- dashboard
- documentación
- debugging

No mezclar varias líneas de trabajo en un mismo cambio si no es necesario.

---

## 5. Reglas de frontend
En `apps/web`:

- mantener experiencias separadas por rol
- no mostrar acciones que el usuario no puede ejecutar
- no mezclar UI de demo con UI productiva
- mantener navegación clara
- evitar sobrecargar pantallas
- priorizar componentes simples y consistentes

Para el Generador:
- mostrar solo sus datos
- enfatizar claridad y confianza
- no exponer controles internos

---

## 6. Reglas de backend
En `apps/api`:

- mantener endpoints consistentes
- validar inputs
- validar permisos por rol
- no devolver datos de otros usuarios
- evitar lógica duplicada
- preservar contratos existentes salvo necesidad justificada

Prestar atención especial a:
- `/lots`
- operaciones
- evidencias
- certificados
- autenticación

---

## 7. Reglas de base de datos
En `packages/db`:

- no agregar tablas o relaciones sin justificación clara
- preservar integridad entre lotes, operaciones, evidencias y certificados
- evitar duplicaciones
- preferir cambios compatibles con el estado actual del MVP

Toda migración debe indicar:
- propósito
- impacto
- compatibilidad esperada

---

## 8. Reglas de trazabilidad
Toda modificación relacionada con:
- estados
- retiros
- evidencias
- cierres
- certificados
- auditoría

debe verificarse también desde la lógica de trazabilidad.

Preguntas mínimas:
- qué evento ocurrió
- quién lo ejecutó
- cuándo ocurrió
- qué evidencia lo respalda
- cómo impacta el estado del flujo

Evitar estados ambiguos o difíciles de auditar.

---

## 9. Reglas para certificados
Los certificados:
- deben derivar de operaciones válidas
- no deben emitirse en estados incompletos
- deben mantener coherencia con evidencias y cierre
- deben respetar el mecanismo actual del MVP

No rediseñar certificación salvo pedido explícito.

---

## 10. Reglas para evidencias
Mientras el MVP use `uploads/`:
- mantener implementación simple
- mejorar robustez sin sobrediseñar
- asociar evidencia al evento correcto del flujo
- preparar el terreno para migración futura, pero sin implementarla todavía

---

## 11. Reglas de autenticación y permisos
- JWT real para rutas privadas
- no usar mocks en rutas protegidas
- validar permisos por rol
- revisar aislamiento de datos por usuario
- no asumir que el frontend protege por sí solo

---

## 12. Estilo de cambios
Cada cambio debería:
- resolver un problema claro
- tocar la menor cantidad de archivos posible
- evitar mezclar mejoras no relacionadas
- dejar el código más entendible que antes

Si aparecen problemas adicionales:
- listarlos aparte
- no resolverlos todos juntos salvo que sea necesario

---

## 13. Checklist antes de dar una tarea por cerrada
Verificar, según aplique:

- el flujo sigue funcionando
- no se rompieron permisos
- no se expusieron datos ajenos
- los estados siguen siendo coherentes
- no se dañó la trazabilidad
- el cambio es entendible
- el alcance fue controlado
- si aplica, actualizar documentación mínima

---

## 14. Qué evitar
Evitar especialmente:
- mezclar perfiles en una misma experiencia
- esconder cambios grandes dentro de un cambio pequeño
- agregar dependencias por comodidad
- abstraer antes de necesitarlo
- rediseñar partes estables sin motivo
- usar lenguaje o estructuras demasiado complejas para este MVP

---

## 15. Criterio final de decisión
Si hay dos opciones técnicamente válidas, elegir:
- la más simple
- la más clara
- la que mejor preserve trazabilidad
- la que menos riesgo agregue al MVP