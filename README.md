# CircularTec

Herramienta para gestionar recoleccion de residuos y su posterior aprovechamiento, con foco en trazabilidad operativa, certificacion digital e inteligencia para valorizacion.

## Estado
- Documento de vision: `docs/referencia/eco4.html`.
- Arquitectura y plan tecnico: `docs/tecnica/`.
- Monorepo inicial implementado:
  - `apps/api` (API REST MVP)
  - `apps/web` (frontend base)
  - `packages/db` (Prisma + modelo de datos)

## Requisitos
- Node.js 20+
- Docker / Docker Compose

## Configuracion
1. Copiar variables:
   - `cp .env.example .env`
2. Levantar infraestructura:
   - `docker compose up -d`
3. Instalar dependencias:
   - `npm install`
4. Generar cliente Prisma y migrar:
   - `npm run db:generate`
   - `npm run db:migrate`
5. Cargar seed inicial:
   - `npm run db:seed`

## Ejecutar
- API: `npm run dev:api`
- Web: `npm run dev:web`

## Endpoints clave (MVP)
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/lots`
- `GET /api/v1/lots`
- `POST /api/v1/lots/:id/assign`
- `POST /api/v1/operations/:lotId/collect`
- `POST /api/v1/operations/:operationId/evidences`
- `POST /api/v1/operations/:operationId/evidences/upload` (multipart file)
- `POST /api/v1/operations/:lotId/close`
- `GET /api/v1/certificates/verify/:publicCode`

## Notas MVP
- Autenticacion JWT habilitada (`/auth/login`).
- Evidencias con upload local habilitadas (`/uploads/*`), persistidas en disco en la carpeta `uploads/`.
- Blockchain actual: anclaje simulado (`mock_tx_*`) para validar el flujo.
- Siguiente paso: conectar blockchain real.

## Flujo UI demo
- En `http://localhost:3000` tenes una seccion **Operacion Piloto (demo)**.
- Credenciales demo (password para todos: `demo1234`):
  - `admin@circulartec.local`
  - `generador@circulartec.local`
  - `recolector@circulartec.local`
- Permite ejecutar el flujo completo desde la UI:
  1. Crear lote (generador demo).
  2. Asignar lote (recolector demo).
  3. Registrar recoleccion.
  4. Cerrar operacion + emitir certificado.
- Si ya habias corrido seeds viejos, re-ejecuta:
  - `npm run db:seed`
