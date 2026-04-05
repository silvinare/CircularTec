# CircularTec

CircularTec es una plataforma para digitalizar la gestión de residuos valorizables con trazabilidad operativa, certificación verificable y métricas útiles para toma de decisiones.

El proyecto está pensado para tres audiencias al mismo tiempo:

- desarrolladores que necesitan entender y correr el sistema
- inversores que necesitan ver el potencial de escalabilidad y monetización
- municipios que necesitan una herramienta concreta para ordenar operación, trazabilidad e indicadores

## Propuesta de valor

CircularTec conecta a tres actores principales:

- generadores de residuos que publican lotes disponibles
- recolectores o cooperativas que toman y ejecutan el retiro
- municipios o administradores que supervisan, miden y validan el circuito

Sobre ese flujo agrega tres capas de valor:

1. Operación: registro estructurado de lotes, asignaciones, retiros y cierres.
2. Confianza: evidencias, auditoría y certificados verificables.
3. Inteligencia: métricas de volumen, actores activos y composición por tipo de residuo.

## Estado actual del proyecto

Hoy el repositorio implementa un MVP funcional de punta a punta:

- autenticación con JWT
- gestión de lotes
- asignación a recolectores
- registro de recolección
- carga de evidencias
- cierre operativo
- emisión y verificación pública de certificados
- dashboard básico para administración municipal
- datos demo para recorrer el flujo completo

Importante: algunas capacidades de la visión objetivo todavía están en modo MVP o simuladas.

- blockchain: anclaje simulado
- evidencias: almacenamiento local en disco
- certificados: estructura verificable disponible, PDF aún simplificado
- administración avanzada: parcial

## Para quién sirve

### Desarrolladores

CircularTec ya tiene una base técnica clara para extender un piloto real:

- monorepo con `apps/api`, `apps/web` y `packages/db`
- backend REST en TypeScript
- frontend Next.js para demo operativa y visualización
- modelo de datos con Prisma sobre PostgreSQL

### Inversores

El sistema ataca un problema operativo real y frecuente: la trazabilidad confiable del residuo desde la generación hasta su retiro y certificación.

La oportunidad está en:

- digitalizar procesos hoy resueltos con WhatsApp, planillas o papel
- generar evidencia y confianza institucional
- construir datos comparables para valorización, cumplimiento y reporting ESG
- escalar por territorio, por flujo de residuo y por red de actores

### Municipios

CircularTec permite:

- ordenar el circuito de retiro
- tener visibilidad sobre quién genera, quién retira y qué volumen se gestiona
- emitir certificados verificables
- construir indicadores ambientales y operativos sin depender de relevamientos manuales

## Arquitectura actual

La implementación actual responde a una estrategia de MVP simple y extensible:

- `apps/api`: API REST con `Express + TypeScript`
- `apps/web`: frontend con `Next.js`
- `packages/db`: acceso a datos con `Prisma`
- `PostgreSQL`: fuente de verdad transaccional
- `uploads/`: almacenamiento local de evidencias en entorno de desarrollo

Resumen del flujo técnico:

1. Un generador publica un lote.
2. Un recolector toma el lote.
3. El recolector registra la recolección y sube evidencias.
4. La operación se cierra.
5. Se emite un certificado con código público de verificación.
6. El sistema deja trazabilidad auditable del evento.

Documentación ampliada:

- [Arquitectura del sistema](/Users/silvinaregenhardt/codex%20projects/Proyecto%20Circular/docs/tecnica/arquitectura-mvp.md)
- [Flujo del sistema](/Users/silvinaregenhardt/codex%20projects/Proyecto%20Circular/docs/operacion/flujo-del-sistema.md)
- [Modelo de negocio](/Users/silvinaregenhardt/codex%20projects/Proyecto%20Circular/docs/negocio/modelo-de-negocio.md)
- [Roadmap](/Users/silvinaregenhardt/codex%20projects/Proyecto%20Circular/docs/producto/roadmap.md)

## Modelo de negocio en una línea

Software B2B2G para trazabilidad y certificación de residuos, monetizable por licencias, implementación territorial y servicios de analítica/compliance.

Más detalle:

- [Modelo de negocio](/Users/silvinaregenhardt/codex%20projects/Proyecto%20Circular/docs/negocio/modelo-de-negocio.md)

## Cómo correr el proyecto

### Requisitos

- Node.js 20+
- Docker y Docker Compose
- npm 10+ recomendado

### Configuración inicial

1. Copiar variables de entorno:

```bash
cp .env.example .env
```

2. Levantar infraestructura local:

```bash
docker compose up -d
```

3. Instalar dependencias:

```bash
npm install
```

4. Generar cliente Prisma y aplicar migraciones:

```bash
npm run db:generate
npm run db:migrate
```

5. Cargar datos demo:

```bash
npm run db:seed
```

### Ejecutar en desarrollo

API:

```bash
npm run dev:api
```

Web:

```bash
npm run dev:web
```

URLs por defecto:

- web: `http://localhost:3000`
- api: `http://localhost:4000`
- healthcheck: `http://localhost:4000/health`

## Credenciales demo

Password para todos los usuarios demo: `demo1234`

- `admin@circulartec.local`
- `generador@circulartec.local`
- `recolector@circulartec.local`

## Endpoints clave del MVP

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/waste-types`
- `GET /api/v1/dashboard/summary`
- `POST /api/v1/lots`
- `GET /api/v1/lots`
- `POST /api/v1/lots/:id/assign`
- `POST /api/v1/operations/:lotId/collect`
- `POST /api/v1/operations/:operationId/evidences`
- `POST /api/v1/operations/:operationId/evidences/upload`
- `POST /api/v1/operations/:lotId/close`
- `GET /api/v1/certificates/verify/:publicCode`

## Estructura del repositorio

```text
.
├── apps/
│   ├── api/        # API REST del MVP
│   └── web/        # UI demo y verificación pública
├── packages/
│   └── db/         # Prisma schema, migraciones y seed
├── docs/
│   ├── tecnica/
│   ├── producto/
│   ├── negocio/
│   └── operacion/
└── docker-compose.yml
```

## Roadmap resumido

### Fase 1. Consolidación operativa

- completar pantallas operativas para generadores, recolectores y admin
- robustecer validaciones y manejo de sesión
- mejorar listados y detalle de lotes/operaciones

### Fase 2. Capacidad administrativa

- ABM de usuarios y organizaciones
- administración del catálogo de residuos
- consulta de auditoría y certificados emitidos

### Fase 3. Confianza y cumplimiento

- storage externo para evidencias
- certificados PDF más robustos
- adapter real de blockchain
- backups, seguridad y observabilidad

### Fase 4. Inteligencia y expansión

- dashboards avanzados
- reportes por actor, residuo y territorio
- soporte multi-municipio
- onboarding replicable

Versión ampliada:

- [Roadmap detallado](/Users/silvinaregenhardt/codex%20projects/Proyecto%20Circular/docs/producto/roadmap.md)

## Documentación relacionada

- [Arquitectura técnica MVP](/Users/silvinaregenhardt/codex%20projects/Proyecto%20Circular/docs/tecnica/arquitectura-mvp.md)
- [API MVP](/Users/silvinaregenhardt/codex%20projects/Proyecto%20Circular/docs/tecnica/api-mvp.md)
- [Modelo de datos MVP](/Users/silvinaregenhardt/codex%20projects/Proyecto%20Circular/docs/tecnica/modelo-datos-mvp.md)
- [Plan de implementación MVP](/Users/silvinaregenhardt/codex%20projects/Proyecto%20Circular/docs/tecnica/plan-implementacion-mvp.md)
- [Backlog MVP](/Users/silvinaregenhardt/codex%20projects/Proyecto%20Circular/docs/producto/backlog-mvp.md)
- [Referencia de visión base](/Users/silvinaregenhardt/codex%20projects/Proyecto%20Circular/docs/referencia/eco4.html)
