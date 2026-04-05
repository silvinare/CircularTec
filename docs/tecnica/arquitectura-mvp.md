# Arquitectura técnica MVP - CircularTec

## 1. Principio de arquitectura

CircularTec está implementado hoy como un monorepo con un backend REST, una interfaz web y un paquete compartido de acceso a datos.

La decisión principal del MVP es pragmática:

- resolver el flujo extremo a extremo antes de distribuir componentes
- mantener una base simple de operar y entender
- dejar preparado el dominio para evolucionar a una arquitectura más robusta

## 2. Arquitectura actual implementada

### Componentes

- `apps/api`: API REST en `Express + TypeScript`
- `apps/web`: frontend en `Next.js`
- `packages/db`: `Prisma` + esquema + migraciones + seed
- `PostgreSQL`: base de datos principal
- `uploads/`: almacenamiento local de evidencias en desarrollo

### Patrón general

- monolito modular a nivel backend
- cliente web separado
- fuente de verdad transaccional en base de datos
- servicios internos para trazabilidad, certificados y auditoría

## 3. Componentes y responsabilidades

### Frontend web

Responsabilidades:

- exponer una demo navegable del flujo operativo
- mostrar KPIs básicos
- permitir verificación pública de certificados

Estado actual:

- implementado como frontend liviano para demo y validación de flujo

### API

Responsabilidades:

- autenticación y contexto de usuario
- validación de reglas de negocio
- gestión de lotes, operaciones, evidencias y certificados
- cálculo de métricas agregadas

Rutas principales:

- `auth`
- `lots`
- `operations`
- `certificates`
- `waste-types`
- `dashboard`

### Base de datos

Responsabilidades:

- persistir organizaciones, usuarios y membresías
- registrar lotes, asignaciones y operaciones
- almacenar evidencias, certificados, anclajes y auditoría

El esquema de datos refleja el flujo real del negocio y ya separa entidades clave para evolucionar sin rehacer el modelo base.

## 4. Modelo de dominio actual

Entidades principales:

- `User`
- `Organization`
- `OrganizationMember`
- `WasteType`
- `Lot`
- `LotAssignment`
- `Operation`
- `OperationEvidence`
- `Certificate`
- `BlockchainAnchor`
- `AuditEvent`

Esto permite modelar:

- múltiples actores por organización
- trazabilidad del lote hasta el certificado
- auditoría de eventos críticos
- verificación pública posterior

## 5. Flujo técnico implementado

1. El generador crea un lote.
2. La API valida datos y guarda el registro en PostgreSQL.
3. Un recolector asigna el lote.
4. El recolector registra la recolección.
5. Se cargan evidencias asociadas a la operación.
6. El cierre operativo emite un certificado.
7. El certificado queda accesible por código público.
8. El dashboard agrega operaciones para producir KPIs.

## 6. Seguridad y control de acceso

El MVP usa autenticación con JWT y control por roles.

Roles implementados:

- `ADMIN_MUNICIPIO`
- `OPERADOR_GENERADOR`
- `OPERADOR_RECOLECTOR`

Ese modelo permite separar:

- administración institucional
- carga de lotes por generadores
- ejecución operativa por recolectores

## 7. Decisiones técnicas acertadas para el MVP

- `Express` reduce fricción para iterar rápido.
- `Prisma` acelera modelado y migraciones.
- `Next.js` permite una UI de validación rápida y extensible.
- almacenamiento local simplifica la demo de evidencias.
- blockchain desacoplada evita sobrediseñar antes de validar uso.

## 8. Límites actuales

Todavía no está resuelto de forma robusta:

- storage externo de evidencias
- jobs asíncronos para tareas pesadas
- blockchain real
- administración completa desde UI
- observabilidad y testing en nivel productivo

## 9. Evolución arquitectónica recomendada

Cuando el MVP valide uso real, la evolución natural es:

- mover evidencias a storage tipo S3/R2
- incorporar cola de jobs para certificados y anclajes
- endurecer observabilidad y trazabilidad técnica
- separar servicios si el volumen o la complejidad lo justifican
- sumar integraciones con sistemas municipales o ERPs

## 10. Criterios para escalar arquitectura

Conviene evolucionar la arquitectura cuando aparezcan estas señales:

- múltiples municipios activos en paralelo
- mayor volumen de operaciones mensuales
- necesidad de SLA formal
- generación intensiva de certificados y evidencias
- integraciones externas recurrentes
