# API MVP (borrador v1)

Base path: `/api/v1`

## 1. Auth

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

## 2. Organizaciones y usuarios

- `POST /organizations`
- `GET /organizations/:id`
- `PATCH /organizations/:id`
- `POST /organizations/:id/members`
- `GET /organizations/:id/members`

## 3. Catálogo de residuos

- `GET /waste-types`
- `POST /waste-types` (admin)
- `PATCH /waste-types/:id` (admin)

## 4. Lotes

- `POST /lots` (generador)
- `GET /lots` (filtros: `status`, `wasteTypeId`, `generatorOrgId`, `collectorOrgId`, `from`, `to`, `page`, `pageSize`)
- `GET /lots/:id`
- `GET /lots/:id/traceability`
- `POST /lots/:id/assign` (recolector)
- `POST /lots/:id/release` (recolector/admin)
- `POST /lots/:id/cancel` (generador/admin)

## 5. Operaciones

- `POST /operations/:lotId/collect` (recolector)
- `POST /operations/:lotId/confirm` (generador/admin)
- `POST /operations/:lotId/close` (admin o regla)
- `POST /operations/:operationId/evidences` (multipart)
- `GET /operations/by-lot/:lotId`
- `GET /operations/:id`

## 6. Certificados y verificación

- `GET /certificates/:id`
- `GET /certificates/verify/:publicCode` (público)
- `POST /certificates/:id/reissue` (admin)

## 7. Dashboard

- `GET /dashboard/summary?from=...&to=...`
- `GET /dashboard/by-waste-type?from=...&to=...`
- `GET /dashboard/active-actors?from=...&to=...`

## 8. Códigos de error estándar

- `400` validación.
- `401` no autenticado.
- `403` sin permisos de rol.
- `404` recurso inexistente.
- `409` conflicto de estado/transición.
- `422` datos incompletos para cierre o certificación.
- `500` error interno.

## 9. Eventos asíncronos internos

- `operation.closed` -> `certificate.issue`
- `certificate.issued` -> `blockchain.anchor`
- `blockchain.anchored` -> `certificate.mark_verified`

## 10. Flujo de trazabilidad

- Lote: `PUBLISHED` -> `ASSIGNED` -> `COLLECTED` -> `CLOSED`
- Operación: `NOT_CREATED` -> `PENDING_CONFIRMATION` -> `CONFIRMED` -> `CLOSED`
- Certificado: `NOT_CREATED` -> `ISSUED` -> `ANCHORED` -> `VERIFIED`
- Cada transición válida genera un evento de auditoría con `fromStatus`, `toStatus`, actor y payload contextual.
- `GET /lots/:id` devuelve el lote completo junto con la sección `traceability`.
- `GET /lots/:id/traceability` devuelve sólo el snapshot y la línea de tiempo auditada del flujo.

## 11. Definición de Done (API)

- Contratos versionados y documentados (OpenAPI).
- Tests de integración de flujo principal:
  - publicar lote
  - asignar
  - recolectar
  - cerrar
  - emitir certificado
  - anclar hash
- Cobertura mínima de rutas críticas > 70%.
