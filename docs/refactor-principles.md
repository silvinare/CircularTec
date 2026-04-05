# Refactor Principles — CircularTec

## 1. Objetivo
Definir cuándo y cómo se deben hacer refactors en el proyecto.

---

## 2. Principio general
Refactorizar solo cuando:

- mejora claridad
- reduce riesgo
- elimina duplicación real

---

## 3. No refactorizar si:
- es solo “más elegante”
- no resuelve un problema real
- rompe contratos
- complica el MVP

---

## 4. Reglas
- cambios pequeños
- cambios controlados
- no mezclar refactor con features
- no tocar múltiples módulos sin necesidad

---

## 5. Refactor válido
✔ eliminar duplicación  
✔ simplificar lógica  
✔ mejorar nombres  
✔ ordenar estructura  

---

## 6. Refactor peligroso
❌ cambiar modelo sin necesidad  
❌ mover lógica entre capas  
❌ rediseñar arquitectura  
❌ cambiar contratos API  

---

## 7. Regla final
Si el refactor no mejora directamente el MVP actual, no hacerlo ahora.