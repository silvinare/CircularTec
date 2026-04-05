# Release Checklist — CircularTec

## 1. Objetivo
Asegurar que cualquier cambio que se integre al proyecto:

- no rompe el MVP
- mantiene coherencia funcional
- respeta trazabilidad
- respeta roles
- es seguro y entendible

---

## 2. Principio general
Antes de considerar un cambio “listo”, debe poder responder:

👉 ¿Esto mejora el sistema sin romper lo existente?

---

## 3. Checklist general
- [ ] el cambio tiene un objetivo claro
- [ ] el alcance está controlado
- [ ] no incluye cambios innecesarios
- [ ] está alineado con el MVP (no sobreingeniería)

---

## 4. Checklist de backend
- [ ] no rompe endpoints existentes
- [ ] mantiene contratos API
- [ ] respeta permisos por rol
- [ ] no expone datos incorrectos
- [ ] mantiene coherencia con modelo de datos
- [ ] respeta estado y trazabilidad

---

## 5. Checklist de frontend
- [ ] no mezcla roles
- [ ] la UI sigue siendo clara
- [ ] no introduce lógica de negocio
- [ ] respeta estados del backend
- [ ] navegación consistente

---

## 6. Checklist de trazabilidad
- [ ] el flujo sigue siendo reconstruible
- [ ] no hay saltos de estado
- [ ] evidencia sigue bien asociada
- [ ] certificado sigue siendo válido

---

## 7. Checklist de seguridad
- [ ] JWT sigue funcionando
- [ ] no hay endpoints expuestos sin validación
- [ ] no hay filtrado de datos entre usuarios

---

## 8. Checklist de UX
- [ ] el cambio mejora claridad
- [ ] no agrega fricción innecesaria
- [ ] no introduce confusión

---

## 9. Checklist de datos
- [ ] no rompe relaciones
- [ ] no duplica información
- [ ] no introduce inconsistencias

---

## 10. Regla final
Si necesitás explicar mucho el cambio para justificarlo, probablemente es demasiado grande para esta etapa.