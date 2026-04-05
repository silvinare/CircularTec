# AGENTS.md — CircularTec

## Propósito del proyecto
CircularTec es una plataforma MVP de economía circular orientada a gestionar la recolección, trazabilidad y certificación de residuos o materiales recuperables.

El sistema conecta generadores con recolectores/operadores, permitiendo:
- publicar lotes
- asignar o tomar lotes
- registrar retiros
- adjuntar evidencias
- cerrar operaciones
- emitir certificados verificables

## Estado actual del producto
Este repositorio corresponde a un **MVP piloto**, no a un producto final enterprise.

Prioridades actuales:
1. estabilidad funcional
2. claridad de arquitectura
3. consistencia de flujos
4. separación de experiencias por rol
5. trazabilidad auditable

Evitar sobreingeniería.

---

## Arquitectura del repositorio
Estructura actual:

- `apps/api` → backend / API
- `apps/web` → frontend / UI
- `packages/db` → Prisma + PostgreSQL

Base de datos:
- PostgreSQL
- entorno local con Docker

Autenticación:
- JWT real
- no usar headers mock para rutas privadas

---

## Dominio principal
Las entidades centrales del sistema son:

- organizaciones
- usuarios
- membresías / roles
- tipos de residuo
- lotes
- asignaciones
- operaciones
- evidencias
- certificados
- auditoría

Toda decisión debe respetar este modelo de dominio o proponer mejoras incrementales y justificadas.

---

## Flujo operativo principal
Flujo principal del MVP:

1. Generador publica lote
2. Recolector toma o recibe asignación
3. Se registra retiro
4. Se adjunta evidencia
5. Se cierra operación
6. Se emite certificado verificable

Toda modificación debe preservar la coherencia de este flujo.

---

## Roles del sistema
Roles actuales:
- admin
- generador
- recolector

Regla clave:
- cada rol debe tener una experiencia separada y clara dentro de la misma app
- no mezclar experiencias de distintos perfiles en una misma interfaz
- no exponer controles técnicos internos al Generador

Orden estratégico de desarrollo:
1. Generador
2. Recolector
3. Administrador
4. Público

---

## Reglas de negocio clave
- El Generador solo debe ver sus propios datos.
- El Generador debe poder acceder al menos a:
  - Mis lotes
  - Nuevo lote
  - Detalle de lote
  - Certificados
  - Mi cuenta
- Los certificados deben derivar de operaciones válidas y cerradas.
- La trazabilidad debe ser auditable.
- La evidencia debe asociarse a eventos reales del flujo operativo.
- Para el MVP, la certificación se resuelve con hash y anclaje blockchain simulado.
- Para el MVP, los uploads se almacenan localmente en `uploads/`.

---

## Principios de trabajo para Codex
Al trabajar en este repositorio:

- no reescribir grandes partes sin necesidad
- no cambiar el stack tecnológico
- no agregar dependencias innecesarias
- no introducir abstracciones prematuras
- priorizar cambios pequeños, seguros y reversibles
- explicar primero los cambios grandes antes de aplicarlos
- respetar el dominio y el flujo operativo del producto

Siempre preferir:
- simplicidad
- claridad
- consistencia
- mantenibilidad

---

## Qué hacer antes de cambiar código
Antes de implementar cambios importantes:

1. entender el módulo afectado
2. identificar impacto en backend, frontend y datos
3. verificar si la decisión afecta roles o trazabilidad
4. revisar si existen flujos ya definidos para ese módulo
5. proponer primero el plan si el cambio no es trivial

Si el pedido del usuario es ambiguo, no inventar arquitectura nueva: trabajar con lo ya definido.

---

## Reglas para backend
Al trabajar en `apps/api`:

- mantener consistencia de endpoints
- validar permisos por rol
- evitar lógica duplicada
- validar inputs en endpoints críticos
- preservar filtros y paginación donde ya existan
- no exponer datos de un usuario a otro
- revisar impacto en trazabilidad y auditoría ante cambios de estado

Prestar especial atención a:
- `/lots`
- operaciones
- evidencias
- certificados
- autenticación/autorización

---

## Reglas para frontend
Al trabajar en `apps/web`:

- mantener experiencias separadas por rol
- no mezclar UI de demo con UI productiva
- priorizar UX simple y clara
- evitar pantallas sobrecargadas
- mantener consistencia visual y de navegación
- no mostrar acciones que el rol no puede ejecutar
- reflejar correctamente los estados del flujo operativo

Para el rol Generador:
- enfocarse en claridad, confianza y trazabilidad visible
- no mostrar controles internos o técnicos innecesarios

---

## Reglas para base de datos y Prisma
Al trabajar en `packages/db`:

- preferir cambios compatibles con el estado actual del MVP
- no complejizar el modelo sin necesidad real
- toda entidad nueva debe justificarse por una necesidad concreta del flujo
- preservar integridad entre lotes, operaciones, evidencias, certificados y auditoría
- evitar duplicación de información derivable

Si se propone una migración:
- explicar objetivo
- explicar impacto
- mantener compatibilidad con el MVP si es posible

---

## Trazabilidad y auditoría
La trazabilidad es un eje central del producto.

Toda modificación que afecte:
- estados de lotes
- asignaciones
- retiros
- carga de evidencia
- cierre de operación
- emisión de certificados

debe evaluarse también desde:
- auditabilidad
- consistencia de estados
- integridad temporal del flujo

Evitar estados ambiguos o redundantes.

---

## Evidencias
Estado actual:
- almacenamiento local en `uploads/`

Reglas:
- no migrar todavía a S3/R2 salvo pedido explícito
- mejorar robustez sin sobre-diseñar
- asociar evidencias al momento más coherente del flujo
- preservar capacidad futura de migración a storage cloud

---

## Certificados
Los certificados deben:
- derivar de una operación válida
- tener trazabilidad verificable
- usar el mecanismo actual del MVP basado en hash
- no emitirse en estados inconsistentes

No rediseñar el sistema de certificación salvo pedido explícito.

---

## Seguridad
La seguridad esperada es de nivel MVP sólido.

Requisitos mínimos:
- JWT real para rutas privadas
- sin fallback mock en rutas protegidas
- aislamiento de datos por usuario y rol
- validación básica de inputs
- no exponer información sensible innecesaria

No implementar complejidad enterprise salvo pedido explícito.

---

## Estilo de cambios
Cuando implementes una mejora:

- describí qué problema resolvés
- explicá por qué el cambio es necesario
- indicá qué archivos tocás
- minimizá el alcance del cambio
- evitá refactors colaterales no pedidos

Si encontrás problemas adicionales:
- listalos aparte
- no los mezcles todos en el mismo cambio si no son necesarios

---

## Definición de terminado
Una tarea se considera terminada cuando:

- cumple el objetivo pedido
- respeta la arquitectura actual
- no rompe flujos existentes
- mantiene separación por rol
- preserva trazabilidad y permisos
- maneja errores razonablemente
- el código queda claro y mantenible

Si aplica, también:
- actualizar tipos
- revisar validaciones
- revisar impacto en datos
- actualizar documentación mínima

---

## Qué evitar
Evitar especialmente:

- mezclar perfiles en una misma experiencia
- crear capas abstractas innecesarias
- cambiar nombres o estructuras sin motivo claro
- agregar librerías por comodidad
- rediseñar todo el dominio
- introducir mocks donde ya hay implementación real
- ocultar cambios grandes dentro de modificaciones pequeñas
- priorizar elegancia técnica sobre necesidad del MVP

---

## Forma de responder
Cuando trabajes sobre este repo:

- primero diagnosticar si el cambio es grande
- luego proponer plan breve
- después implementar
- explicar decisiones de forma práctica
- priorizar solución concreta sobre teoría

Si hay varias opciones válidas:
- elegir la más simple para este MVP
- mencionar brevemente las alternativas solo si aportan valor