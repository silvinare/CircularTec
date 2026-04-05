# Product Context — CircularTec

## 1. Visión general
CircularTec es una plataforma digital orientada a la gestión de residuos o materiales recuperables dentro de un modelo de economía circular.

Su propósito es permitir que organizaciones generadoras registren materiales disponibles, que operadores o recolectores gestionen su retiro, y que el sistema preserve trazabilidad verificable de cada operación hasta la emisión de un certificado.

La propuesta combina:
- gestión operativa
- trazabilidad
- evidencia auditable
- certificación verificable
- visualización de actividad e impacto

---

## 2. Problema que busca resolver
En muchos procesos de recuperación o valorización de residuos, la información se encuentra fragmentada, es difícil de auditar y no existe un registro ordenado de lo que ocurrió con cada material.

Problemas frecuentes:
- falta de trazabilidad
- dificultad para demostrar retiro o recuperación
- evidencias dispersas o informales
- baja confianza entre actores
- poca capacidad de generar indicadores confiables
- dificultad para emitir constancias o certificados verificables

CircularTec busca resolver esto con una base digital simple pero robusta.

---

## 3. Objetivo del MVP
El objetivo actual no es construir una solución enterprise completa, sino un **MVP piloto funcional** que permita validar el núcleo del producto.

El MVP debe demostrar que el sistema puede:
- registrar lotes
- asignar o tomar lotes
- registrar retiros
- adjuntar evidencias
- cerrar operaciones
- emitir certificados verificables
- mostrar información útil por rol

El MVP debe priorizar:
- claridad
- estabilidad
- coherencia del flujo
- separación por rol
- trazabilidad auditable

No se busca resolver todos los casos posibles en esta etapa.

---

## 4. Usuarios del sistema
### 4.1 Generador
Es la organización o usuario que publica materiales o residuos disponibles para retiro o aprovechamiento.

Necesidades principales:
- registrar lotes
- consultar estado de sus lotes
- ver evidencia asociada a las operaciones
- acceder a certificados
- confiar en que ve solamente su información

Experiencia mínima definida para el MVP:
- Mis lotes
- Nuevo lote
- Detalle de lote
- Certificados
- Mi cuenta

### 4.2 Recolector
Es quien toma o recibe asignaciones sobre lotes, registra el retiro y adjunta evidencia operativa.

Necesidades principales:
- ver lotes disponibles o asignados
- tomar o gestionar lotes
- registrar retiro
- cargar evidencia
- completar el flujo operativo de manera simple

### 4.3 Administrador
Es el rol interno que supervisa el sistema, controla operaciones y accede a funciones de monitoreo o gestión ampliada.

Necesidades principales:
- ver estado global del sistema
- revisar operaciones
- controlar certificados
- auditar eventos relevantes
- acceder a métricas generales

### 4.4 Público
Es un rol posterior al MVP inicial. Podría orientarse a consulta pública o verificación externa de certificados, sin acceso operativo completo.

---

## 5. Flujo operativo principal
El flujo principal del sistema es:

1. El Generador publica un lote.
2. El Recolector toma o recibe asignación sobre ese lote.
3. Se registra el retiro.
4. Se adjunta evidencia.
5. Se cierra la operación.
6. Se emite un certificado verificable.

Este flujo representa el núcleo funcional de CircularTec.

Toda decisión de producto, backend o frontend debe respetar este recorrido o mejorarlo sin romper su coherencia.

---

## 6. Entidades principales del dominio
El modelo actual gira alrededor de las siguientes entidades:

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

Interpretación funcional:

- **organizaciones**: actores del sistema
- **usuarios / membresías**: identidad y permisos
- **tipos de residuo**: clasificación de materiales
- **lotes**: unidades publicadas por un generador
- **asignaciones**: relación operativa entre lote y recolector
- **operaciones**: ejecución del flujo de retiro/cierre
- **evidencias**: pruebas asociadas a eventos del flujo
- **certificados**: resultado verificable de operaciones válidas
- **auditoría**: historial de eventos relevantes

---

## 7. Trazabilidad como eje del producto
La trazabilidad no es una funcionalidad secundaria: es uno de los pilares de CircularTec.

El sistema debe permitir responder, al menos, estas preguntas:
- quién publicó el lote
- qué lote fue retirado
- quién lo retiró
- cuándo ocurrió
- qué evidencia se registró
- cómo y cuándo se cerró la operación
- qué certificado surgió de esa operación

Toda modificación del sistema debe cuidar:
- secuencia de estados
- integridad del historial
- relación entre evidencia y evento real
- auditabilidad

---

## 8. Certificación verificable
En el MVP, la certificación se implementa mediante:
- generación de hash
- mecanismo de anclaje blockchain simulado

Esto permite validar el concepto de certificado verificable sin incorporar en esta etapa una integración blockchain productiva real.

Principios:
- no debe existir certificado sin operación válida
- el certificado debe derivar de información consistente
- el mecanismo actual es suficiente para el MVP
- no debe complejizarse salvo necesidad explícita

---

## 9. Evidencias
Las evidencias son parte crítica del flujo, porque respaldan eventos operativos.

En la etapa actual:
- se almacenan localmente en `uploads/`
- pueden incluir fotos u otros comprobantes asociados

Decisión funcional importante:
- actualmente la evidencia puede estar asociada al cierre demo
- conceptualmente, es más correcto asociarla al momento del retiro o al evento real que se busca documentar

Toda mejora futura debe preservar:
- claridad de asociación con el evento
- capacidad de auditoría
- posibilidad futura de migración a almacenamiento cloud

---

## 10. Estado actual de la solución
Decisiones ya tomadas:
- arquitectura con `apps/api`, `apps/web`, `packages/db`
- PostgreSQL como base principal
- Docker en entorno local
- JWT real implementado
- eliminación de fallback mock para rutas privadas
- usuarios demo para pruebas rápidas:
  - admin
  - generador
  - recolector
- `GET /lots` estabilizado con filtros y paginación
- detalle real de lote y operación servido desde la API
- dashboard con KPIs reales desde base de datos
- separación de la experiencia del Generador respecto de controles internos de demo
- navegación propia para el rol Generador
- acceso autenticado a certificados del Generador

---

## 11. Estrategia actual de producto
La estrategia actual es dejar de mezclar todos los perfiles dentro de una experiencia única y pasar a una **misma aplicación con experiencias separadas por rol**.

Orden recomendado de construcción:
1. Generador
2. Recolector
3. Administrador
4. Público

Esto implica que toda nueva pantalla o mejora debe pensarse según el perfil al que pertenece, evitando mezclar acciones, lenguaje o controles de otros roles.

---

## 12. Qué significa “éxito” en esta etapa
En esta etapa, el éxito del MVP no se mide por cantidad de features, sino por demostrar que el núcleo funciona bien.

Se considera éxito si el sistema logra:
- flujo claro y usable para el Generador
- trazabilidad consistente
- retiro y evidencia correctamente registrados
- certificados verificables emitidos desde operaciones válidas
- separación adecuada por rol
- métricas básicas confiables
- base técnica ordenada para crecer

---

## 13. Qué no es prioridad ahora
No son prioridad en esta etapa:
- arquitectura enterprise
- automatizaciones avanzadas
- almacenamiento cloud definitivo
- múltiples integraciones externas
- blockchain productiva real
- complejidad innecesaria de permisos
- dashboards avanzados de BI
- optimizaciones prematuras

La consigna es: **MVP robusto, no sistema final completo**.

---

## 14. Criterios para tomar decisiones de producto y desarrollo
Ante dudas, priorizar siempre:

1. claridad del flujo
2. separación por rol
3. trazabilidad auditable
4. simplicidad técnica
5. cambios incrementales
6. mantenibilidad

Evitar decisiones que:
- mezclen perfiles
- rompan el flujo principal
- introduzcan estados ambiguos
- agreguen complejidad sin validar valor
- desvíen el MVP hacia un producto demasiado amplio

---

## 15. Resumen ejecutivo
CircularTec es un MVP de plataforma para gestionar recolección, trazabilidad y certificación de materiales o residuos recuperables.

El núcleo del producto es:
- lote
- operación
- evidencia
- certificado
- auditoría

La prioridad actual es consolidar una experiencia sólida para el Generador, mantener trazabilidad consistente y preparar la base para avanzar luego con Recolector, Administrador y Público.