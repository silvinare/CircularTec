# Module Spec — Administrador

## 1. Objetivo
El Administrador es el rol que tiene visibilidad global del sistema.

Su función es:
- monitorear el estado del sistema
- auditar operaciones
- validar trazabilidad
- detectar inconsistencias

---

## 2. Principio
El Admin no ejecuta el flujo operativo principal, lo supervisa.

---

## 3. Qué necesita ver
- estado global de lotes
- operaciones
- evidencias
- certificados
- auditoría

---

## 4. Qué puede hacer
- revisar operaciones
- detectar errores
- acceder a trazabilidad completa

---

## 5. Qué NO debe hacer (en MVP)
- no complicar el flujo
- no introducir lógica adicional innecesaria
- no interferir con la experiencia de Generador/Recollector

---

## 6. Vistas mínimas
- Dashboard global
- Listado de lotes
- Listado de operaciones
- Detalle completo (con trazabilidad)
- Auditoría

---

## 7. Regla clave
El Admin ve más información, pero no debe romper el modelo ni el flujo.