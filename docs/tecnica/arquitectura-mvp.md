# Arquitectura técnica MVP - CircularTec

## 1. Decisiones de arquitectura

- Patrón: monolito modular con API REST.
- Despliegue: un backend + una base de datos + almacenamiento de archivos + job worker.
- Trazabilidad: base de datos como fuente de verdad; blockchain como capa de anclaje de integridad.
- Multi-actor: control de acceso por roles (`ADMIN_MUNICIPIO`, `GENERADOR`, `RECOLECTOR`).
- Enfoque MVP: resolver flujo operativo extremo a extremo antes de agregar optimizaciones.

## 2. Stack recomendado (MVP)

- Frontend: Next.js (App Router) + TypeScript.
- Backend API: NestJS + TypeScript.
- Base de datos: PostgreSQL.
- ORM: Prisma.
- Auth: JWT con refresh token + hash de contraseña (Argon2).
- Archivos (evidencia fotográfica): S3-compatible (ej. Cloudflare R2/MinIO/S3).
- PDFs de certificado: generación server-side (template HTML a PDF).
- Jobs asíncronos: cola simple (BullMQ + Redis) para emisión de certificado y anclaje blockchain.
- Observabilidad: logs estructurados + trazas básicas + métricas técnicas.

## 3. Módulos funcionales

- `auth`: login, sesiones, permisos por rol.
- `actors`: alta/edición de generadores, recolectores y perfiles municipales.
- `waste_catalog`: catálogo de tipos de residuos y unidades.
- `lots`: publicación de lotes por generadores.
- `matches`: toma de lotes por recolectores.
- `operations`: confirmación de retiro y cierre operativo.
- `certificates`: emisión y consulta de certificados digitales.
- `blockchain_anchor`: hash + registro tx + verificación.
- `dashboard`: KPIs básicos del piloto.
- `audit`: historial de eventos críticos.

## 4. Flujo principal (happy path)

1. Generador crea lote (`PUBLISHED`).
2. Recolector toma lote (`ASSIGNED`).
3. Recolector registra retiro con peso/fecha/fotos (`COLLECTED`).
4. Admin o regla automática valida cierre (`CLOSED`).
5. Job genera certificado PDF + UUID público.
6. Job calcula hash de payload canónico del cierre.
7. Job registra hash en blockchain y guarda `tx_id`.
8. Certificado queda en estado `VERIFIED` con enlace de validación.

## 5. Límites explícitos del MVP

- Sin optimización de rutas.
- Sin integración ERP/sistemas municipales externos.
- Sin pricing dinámico ni subastas.
- Sin analítica predictiva.
- Sin smart contracts complejos (solo anclaje de hash).

## 6. Requisitos no funcionales mínimos

- Seguridad: RBAC, cifrado TLS, secretos fuera de código.
- Integridad: eventos críticos auditables e inmutables vía hash+tx.
- Disponibilidad: objetivo 99.5% mensual en entorno productivo.
- Backups: backup diario de PostgreSQL + política de retención.
- Rendimiento: p95 API < 500 ms para operaciones CRUD.
- Escalabilidad inicial: hasta 100 actores y 1.000 operaciones/mes sin rediseño.

## 7. Estrategia de despliegue

- Ambientes: `dev`, `staging`, `prod`.
- CI: test + lint + migraciones verificadas.
- CD: despliegue automático a `staging`; promoción manual a `prod`.
- Feature flags para activar módulo blockchain por entorno.

## 8. Riesgos técnicos y mitigación

- Complejidad blockchain temprana.
  Mitigación: adaptador desacoplado, reintentos, cola asíncrona, fallback de reintento manual.
- Calidad de datos de campo.
  Mitigación: validaciones estrictas + formularios guiados + datos obligatorios mínimos.
- Baja adopción digital.
  Mitigación: UX móvil primero, flujo corto de carga, capacitación inicial.

## 9. Criterio de arquitectura para pasar de MVP a fase 2

- >70% actores activos mensuales.
- >200 operaciones certificadas sin incidentes críticos.
- Tiempo de cierre a certificado < 15 minutos promedio.
- Al menos 1 municipio adicional listo para onboarding.
