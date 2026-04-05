# AGENTS.override.md — Prioridad actual de trabajo

## Contexto de esta etapa
En esta etapa del proyecto CircularTec, la prioridad no es expandir todo el sistema al mismo tiempo, sino consolidar el núcleo del MVP ya avanzado.

Foco actual:
1. estabilizar experiencia del Generador
2. consolidar trazabilidad operativa
3. preservar consistencia del backend existente
4. evitar mezclar perfiles en una misma experiencia
5. preparar base para avanzar luego con Recolector

---

## Prioridad máxima actual
### 1. Generador
El rol Generador es el foco principal en esta etapa.

Experiencia mínima esperada:
- Mis lotes
- Nuevo lote
- Detalle de lote
- Certificados
- Mi cuenta

Reglas:
- el Generador solo debe ver sus propios datos
- no debe ver controles internos
- no debe ver herramientas técnicas o de simulación
- la experiencia debe transmitir claridad y confianza
- toda mejora debe priorizar simplicidad y coherencia

### 2. Trazabilidad
La trazabilidad es el segundo foco principal.

Validar especialmente:
- estados del lote
- asignación o toma por parte del recolector
- registro del retiro
- carga de evidencia
- cierre de operación
- emisión de certificado

Reglas:
- evitar estados ambiguos
- asociar evidencia al evento correcto
- preservar auditoría
- toda operación cerrada debe poder explicarse claramente desde el historial

### 3. Backend estable
El backend actual ya tiene una base funcional que no debe romperse innecesariamente.

Reglas:
- no rediseñar endpoints sin necesidad
- no cambiar contratos existentes salvo justificación clara
- preservar `/lots` con filtros y paginación
- preservar auth JWT real
- no reintroducir mocks en rutas privadas

---

## Qué no priorizar ahora
No dedicar esfuerzo principal, salvo pedido explícito, a:
- features avanzadas para Admin
- experiencia pública
- integraciones externas
- migración a storage cloud
- arquitectura enterprise
- optimizaciones prematuras
- refactors grandes sin impacto directo en el MVP actual

---

## Cómo tomar decisiones en esta etapa
Ante una duda, elegir siempre la opción que mejor cumpla estas condiciones:

1. mejora el flujo del Generador
2. mejora o preserva trazabilidad
3. no rompe backend existente
4. requiere pocos cambios
5. deja la base lista para el módulo Recolector

---

## Reglas de implementación para esta etapa
Cuando trabajes en esta fase:

- hacer cambios pequeños
- evitar tocar módulos no relacionados
- no mezclar mejoras de varios roles en una misma tarea
- si el cambio afecta datos o estados, revisar trazabilidad antes de implementar
- si el cambio es grande, proponer plan antes de editar
- si aparece deuda técnica no crítica, documentarla aparte en vez de resolverla toda junta

---

## Señales de buen resultado en esta etapa
Se considera que el trabajo va en la dirección correcta si:

- la experiencia del Generador queda más clara
- los datos visibles por el Generador están bien aislados
- los estados del flujo operativo son entendibles
- la evidencia queda mejor ubicada en el flujo
- los certificados siguen dependiendo de operaciones válidas
- no se rompe auth ni permisos
- el sistema queda más ordenado sin sobre-diseño