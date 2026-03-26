# Plan de implementación MVP (8-10 semanas)

## Fase 0 - Base técnica (Semana 1)
- Inicializar repositorio con backend/frontend.
- Configurar CI básico (lint, test).
- Configurar PostgreSQL + Prisma.
- Configurar autenticación y RBAC inicial.

## Fase 1 - Flujo operativo (Semanas 2-4)
- ABM de organizaciones y usuarios.
- Catálogo de residuos.
- Publicación y asignación de lotes.
- Registro de recolección + carga de evidencia.
- Cierre de operación con validaciones.

## Fase 2 - Certificación y trazabilidad (Semanas 5-6)
- Generación de certificado PDF.
- Endpoint de verificación pública.
- Hash canónico de operación cerrada.
- Integración blockchain por adaptador (con reintentos).

## Fase 3 - Métricas y piloto (Semanas 7-8)
- Dashboard de KPIs base.
- Auditoría de eventos críticos.
- Ajustes UX para operación en terreno.
- Hardening de seguridad y backups.

## Fase 4 - Estabilización (Semanas 9-10)
- Pruebas end-to-end del flujo completo.
- Corrección de bugs de operación real.
- Checklist de salida a piloto municipal.

## Entregables de salida a piloto
- Flujo extremo a extremo funcionando en staging.
- Manual corto por rol (generador, recolector, admin).
- Monitoreo básico y procedimiento de soporte.
