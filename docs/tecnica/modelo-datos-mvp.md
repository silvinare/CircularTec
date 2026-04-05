# Modelo de datos MVP - CircularTec

## 1. Entidades principales

- `users`
- `organizations`
- `organization_members`
- `waste_types`
- `lots`
- `lot_assignments`
- `operations`
- `operation_evidences`
- `certificates`
- `blockchain_anchors`
- `audit_events`

## 2. Definición resumida por tabla

### `users`
- `id` (uuid, pk)
- `email` (unique)
- `password_hash`
- `full_name`
- `phone`
- `status` (`ACTIVE`, `INACTIVE`)
- `created_at`, `updated_at`

### `organizations`
- `id` (uuid, pk)
- `type` (`MUNICIPIO`, `GENERADOR`, `RECOLECTOR`)
- `legal_name`
- `display_name`
- `tax_id` (nullable)
- `address`
- `lat`, `lng` (nullable)
- `status` (`ACTIVE`, `INACTIVE`)
- `created_at`, `updated_at`

### `organization_members`
- `id` (uuid, pk)
- `organization_id` (fk)
- `user_id` (fk)
- `role` (`ADMIN_MUNICIPIO`, `OPERADOR_GENERADOR`, `OPERADOR_RECOLECTOR`)
- unique (`organization_id`, `user_id`)

### `waste_types`
- `id` (uuid, pk)
- `code` (unique, ej. `PET`, `PEBD_FILM`)
- `name`
- `unit` (`KG`, `TON`)
- `active`

### `lots`
- `id` (uuid, pk)
- `public_code` (unique, ej. `LOT-2026-000123`)
- `generator_org_id` (fk organizations)
- `waste_type_id` (fk)
- `estimated_quantity_kg`
- `address`
- `lat`, `lng` (nullable)
- `pickup_window_start`, `pickup_window_end`
- `notes` (nullable)
- `status` (`PUBLISHED`, `ASSIGNED`, `COLLECTED`, `CLOSED`, `CANCELLED`)
- `created_by` (fk users)
- `created_at`, `updated_at`

### `lot_assignments`
- `id` (uuid, pk)
- `lot_id` (fk, unique activo por lote)
- `collector_org_id` (fk organizations)
- `assigned_by` (fk users)
- `assigned_at`
- `status` (`ACTIVE`, `RELEASED`, `COMPLETED`)

### `operations`
- `id` (uuid, pk)
- `lot_id` (fk, unique)
- `collector_org_id` (fk)
- `collected_quantity_kg`
- `collected_at`
- `confirmed_by_generator_user_id` (fk users, nullable)
- `closed_by_user_id` (fk users, nullable)
- `closed_at` (nullable)
- `status` (`PENDING_CONFIRMATION`, `CONFIRMED`, `CLOSED`)
- `created_at`, `updated_at`

### `operation_evidences`
- `id` (uuid, pk)
- `operation_id` (fk)
- `file_url`
- `file_type` (`PHOTO`, `DOCUMENT`)
- `uploaded_by` (fk users)
- `uploaded_at`

### `certificates`
- `id` (uuid, pk)
- `operation_id` (fk, unique)
- `certificate_number` (unique)
- `public_verification_code` (unique)
- `pdf_url`
- `issued_at`
- `status` (`ISSUED`, `ANCHORED`, `VERIFIED`, `ERROR`)

### `blockchain_anchors`
- `id` (uuid, pk)
- `certificate_id` (fk, unique)
- `network` (ej. `POLYGON`)
- `hash_algorithm` (`SHA256`)
- `payload_hash`
- `tx_id` (nullable)
- `anchored_at` (nullable)
- `status` (`PENDING`, `CONFIRMED`, `FAILED`)
- `error_message` (nullable)

### `audit_events`
- `id` (uuid, pk)
- `entity_type` (`LOT`, `OPERATION`, `CERTIFICATE`)
- `entity_id` (uuid)
- `event_type` (ej. `LOT_PUBLISHED`, `LOT_ASSIGNED`, `OPERATION_CLOSED`, `CERTIFICATE_ISSUED`, `HASH_ANCHORED`)
- `payload_json` (jsonb)
- `created_by` (fk users, nullable para eventos sistema)
- `created_at`

## 3. Máquina de estados de lote

- `PUBLISHED` -> `ASSIGNED`
- `ASSIGNED` -> `COLLECTED`
- `COLLECTED` -> `CLOSED`
- `PUBLISHED` -> `CANCELLED`
- `ASSIGNED` -> `CANCELLED` (solo con motivo y auditoría)

Transiciones inválidas deben retornar `409 Conflict`.

## 4. Máquina de estados operativa completa

- Lote: `PUBLISHED` -> `ASSIGNED` -> `COLLECTED` -> `CLOSED`
- Operación: `NOT_CREATED` -> `PENDING_CONFIRMATION` -> `CONFIRMED` -> `CLOSED`
- Certificado: `NOT_CREATED` -> `ISSUED` -> `ANCHORED` -> `VERIFIED`
- Anclaje blockchain: `NOT_CREATED` -> `PENDING` -> `CONFIRMED` o `FAILED`

### Reglas de consistencia entre entidades

- `lots.status = ASSIGNED` implica una asignación activa.
- `lots.status = COLLECTED` implica `operations.status = PENDING_CONFIRMATION`.
- `operations.status = CONFIRMED` implica que el generador o admin validó el retiro.
- `lots.status = CLOSED` implica `operations.status = CLOSED`.
- `certificates.status = ISSUED | ANCHORED | VERIFIED` sólo existe si `operations.status = CLOSED`.
- `certificates.status = VERIFIED` implica `blockchain_anchors.status = CONFIRMED`.

## 5. Reglas de negocio clave

- Solo `GENERADOR` puede crear lote.
- Solo `RECOLECTOR` puede tomar lote `PUBLISHED`.
- Solo 1 asignación activa por lote.
- Para confirmar operación se requiere: lote `COLLECTED` y operación `PENDING_CONFIRMATION`.
- Para cerrar operación se requiere: operación `CONFIRMED`, `collected_quantity_kg`, `collected_at`, al menos 1 evidencia.
- Certificado se emite solo cuando `operations.status = CLOSED`.
- Hash se calcula sobre payload canónico inmutable (orden de campos fijo).
- Toda transición debe registrar auditoría con `fromStatus`, `toStatus`, actor y payload.

## 6. Índices recomendados

- `lots(status, created_at desc)`
- `lots(generator_org_id, created_at desc)`
- `lot_assignments(collector_org_id, assigned_at desc)`
- `operations(status, created_at desc)`
- `audit_events(entity_type, entity_id, created_at desc)`
- `certificates(public_verification_code)`

## 7. Retención y privacidad

- Evidencias: retención mínima 24 meses en piloto.
- Datos personales mínimos (principio de minimización).
- Logs de auditoría no editables, solo anexables.
