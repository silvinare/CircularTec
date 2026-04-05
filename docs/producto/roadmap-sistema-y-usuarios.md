# Roadmap del sistema y mapa de usuarios

## 1. Estado actual del proyecto

Hoy el sistema ya tiene una base funcional de MVP:

- autenticación JWT para usuarios demo
- gestión de lotes
- asignación de lotes a recolectores
- registro de recolección
- carga de evidencias
- cierre de operación
- emisión de certificado verificable
- dashboard básico con KPI
- verificación pública de certificados

Esto alcanza para demostrar el flujo principal, pero todavía no alcanza para una operación piloto robusta con varios actores trabajando de forma sostenida.

## 2. Componentes del sistema

### 2.1 Gestión de usuarios y organizaciones

Objetivo:
ordenar quién entra al sistema, a qué organización pertenece y qué permisos tiene.

Incluye:
- login y sesión
- alta de organizaciones
- alta de usuarios
- roles y permisos
- activación/desactivación de cuentas

Estado:
- base implementada
- falta ABM real de usuarios y organizaciones desde interfaz

### 2.2 Catálogo de residuos

Objetivo:
normalizar los tipos de residuos para que los datos sean comparables.

Incluye:
- tipo de residuo
- código interno
- unidad de medida
- activación/desactivación

Estado:
- base implementada
- falta administración desde interfaz

### 2.3 Gestión de lotes

Objetivo:
registrar la oferta de residuos generada por empresas, instituciones o municipios.

Incluye:
- alta de lote
- estado del lote
- cantidad estimada
- ubicación
- ventana de retiro
- notas
- filtros y paginación
- detalle completo del lote

Estado:
- implementado en API
- UI inicial disponible
- falta interfaz de trabajo más completa

### 2.4 Asignación y operación de retiro

Objetivo:
coordinar quién toma el lote y registrar la operación real de retiro.

Incluye:
- asignación de lote a recolector
- registro de cantidad retirada
- fecha/hora de retiro
- cambio de estados operativos
- detalle de operación

Estado:
- implementado
- falta mejorar experiencia operativa y validaciones finas

### 2.5 Evidencias

Objetivo:
guardar respaldo visual o documental de la operación.

Incluye:
- carga de imágenes o documentos
- almacenamiento local
- consulta desde detalle
- miniatura para fotos

Estado:
- implementado en local disk
- pendiente migración a storage tipo S3/R2

### 2.6 Certificados y trazabilidad

Objetivo:
emitir comprobantes verificables de gestión del residuo.

Incluye:
- generación de código público
- consulta pública del certificado
- estructura para hash y anclaje blockchain

Estado:
- verificación pública implementada
- blockchain todavía simulada
- falta PDF real y listado administrativo de certificados

### 2.7 Dashboard y analítica

Objetivo:
dar visibilidad operativa y ambiental a municipios y administradores.

Incluye:
- operaciones registradas
- kg / toneladas gestionadas
- actores activos
- distribución por tipo de residuo
- filtros por fecha

Estado:
- dashboard básico implementado
- falta tablero más completo y exportes

### 2.8 Auditoría

Objetivo:
dejar trazabilidad interna de eventos críticos del sistema.

Incluye:
- publicación de lote
- asignación
- recolección
- cierre
- emisión de certificado

Estado:
- eventos auditados en backend
- falta interfaz administrativa para consultar auditoría

## 3. Roadmap recomendado

### Fase A. Consolidación del MVP operativo

Objetivo:
pasar de demo técnica a herramienta usable por un piloto real.

Entregables:
- ABM real de organizaciones y usuarios
- interfaz de listado de lotes con filtros y paginación
- detalle de lote y detalle de operación
- logout y control de sesión robusto
- validaciones de evidencias y mensajes de error más claros

Resultado esperado:
un municipio o equipo piloto puede operar el flujo sin depender del equipo técnico para cada paso.

### Fase B. Capa administrativa

Objetivo:
dar capacidad de gestión real a quien administra el sistema.

Entregables:
- panel de administración de usuarios
- gestión de residuos habilitados
- gestión de lotes cancelados / liberados
- consulta de certificados emitidos
- consulta de auditoría

Resultado esperado:
el sistema deja de ser solo operativo y pasa a ser administrable.

### Fase C. Capa de confianza y cumplimiento

Objetivo:
fortalecer integridad, trazabilidad y valor institucional del sistema.

Entregables:
- generación de PDF de certificado
- adapter real para blockchain
- storage externo para evidencias
- políticas de backup
- endurecimiento de seguridad

Resultado esperado:
el sistema puede sostener reportes, auditoría externa y uso institucional serio.

### Fase D. Inteligencia y valorización

Objetivo:
convertir datos operativos en decisiones y oportunidades productivas.

Entregables:
- dashboards por tipo de residuo
- series temporales
- concentración geográfica
- reportes por actor
- insumos para detectar masa crítica y valorización

Resultado esperado:
el sistema deja de ser solo gestor de retiros y empieza a producir información estratégica.

### Fase E. Escalamiento

Objetivo:
replicar el modelo en más territorios y organizaciones.

Entregables:
- multi-municipio
- configuración por territorio
- onboarding más simple
- observabilidad y soporte
- documentación de despliegue

Resultado esperado:
la plataforma queda lista para crecer sin rediseñar todo.

## 4. Qué debería ver y completar cada tipo de usuario

### 4.1 Generador

Qué debería ver:
- sus lotes creados
- estado de cada lote
- historial de retiros
- certificados emitidos
- evidencia asociada a operaciones cerradas

Qué debería completar:
- tipo de residuo
- cantidad estimada
- dirección de retiro
- ventana horaria
- observaciones del lote
- eventualmente confirmación del retiro

Qué necesita como prioridad:
- simplicidad
- pocos campos
- visibilidad clara del estado del lote

### 4.2 Recolector / cooperativa

Qué debería ver:
- lotes disponibles para tomar
- lotes ya asignados a su organización
- detalle del retiro
- evidencia cargada
- historial de operaciones realizadas

Qué debería completar:
- aceptación/toma del lote
- cantidad retirada
- fecha y hora efectiva
- evidencia fotográfica o documental
- observaciones operativas

Qué necesita como prioridad:
- interfaz móvil y rápida
- carga simple en terreno
- estados claros para no duplicar trabajo

### 4.3 Administración municipal / administrador del sistema

Qué debería ver:
- dashboard general
- lotes por estado
- operaciones cerradas
- generadores activos
- recolectores activos
- residuos por tipo
- certificados emitidos
- auditoría de eventos

Qué debería completar o gestionar:
- alta y baja de organizaciones
- alta y baja de usuarios
- catálogo de residuos
- revisión de operaciones conflictivas
- cierre administrativo cuando corresponda

Qué necesita como prioridad:
- visión global
- filtros
- trazabilidad
- capacidad de corregir o intervenir

### 4.4 Usuario público / tercero verificador

Qué debería ver:
- validación de certificado por código
- estado del certificado
- tipo de residuo
- volumen gestionado
- fecha de emisión
- identificador de trazabilidad

Qué debería completar:
- solo el código público del certificado

Qué necesita como prioridad:
- acceso simple
- confianza
- claridad de que el certificado es válido o no

## 5. Pantallas mínimas recomendadas por usuario

### Generador
- login
- mis lotes
- nuevo lote
- detalle de lote
- certificados

### Recolector
- login
- lotes disponibles
- mis retiros
- detalle operativo
- carga de evidencia

### Administración
- login
- dashboard
- lotes
- organizaciones
- usuarios
- certificados
- auditoría

### Público
- verificación de certificado

## 6. Próximos pasos concretos recomendados

1. Cerrar el flujo de interfaz para generador, recolector y admin usando la API ya estabilizada.
2. Agregar ABM real de usuarios y organizaciones.
3. Completar módulo administrativo de certificados y auditoría.
4. Recién después pasar a blockchain real y storage externo.

## 7. Pantallas priorizadas para diseñar e implementar

### Prioridad 1. Flujo operativo mínimo

Estas pantallas son las que hacen usable el piloto.

- `Login`
- `Dashboard admin inicial`
- `Mis lotes` para generador
- `Nuevo lote`
- `Lotes disponibles` para recolector
- `Detalle de lote`
- `Detalle de operación`
- `Verificación pública de certificado`

### Prioridad 2. Operación diaria real

Estas pantallas reducen fricción operativa y soporte manual.

- `Mis retiros` para recolector
- `Historial de certificados` para generador
- `Listado general de lotes` para administración
- `Listado general de operaciones`
- `Carga de evidencias mejorada`
- `Filtros avanzados por fecha / estado / residuo`

### Prioridad 3. Administración

Estas pantallas permiten que el sistema se sostenga sin depender del equipo técnico.

- `Usuarios`
- `Organizaciones`
- `Catálogo de residuos`
- `Certificados emitidos`
- `Auditoría`
- `Incidencias o revisión manual`

### Prioridad 4. Inteligencia y expansión

- `Dashboard avanzado`
- `Reportes por actor`
- `Reportes por residuo`
- `Exportes`
- `Configuración multi-territorio`

## 8. Qué debe tener cada pantalla mínima

### 8.1 Login

Debe mostrar:
- email
- contraseña
- mensaje de error claro

Debe resolver:
- ingreso al sistema
- recuperación simple de contexto del usuario

### 8.2 Mis lotes

Debe mostrar:
- código de lote
- residuo
- cantidad estimada
- estado
- fecha de creación
- acceso a detalle

Debe permitir:
- filtrar por estado
- crear lote nuevo

### 8.3 Nuevo lote

Debe incluir solo lo esencial:
- tipo de residuo
- cantidad estimada
- dirección de retiro
- fecha/hora o ventana de retiro
- observaciones

### 8.4 Lotes disponibles

Debe mostrar:
- código de lote
- residuo
- cantidad estimada
- ubicación
- disponibilidad

Debe permitir:
- tomar lote
- abrir detalle

### 8.5 Detalle de lote

Debe mostrar:
- datos del generador
- datos del residuo
- ubicación
- estado actual
- recolector asignado si existe
- operación asociada si existe
- certificados y evidencias si ya cerró

### 8.6 Detalle de operación

Debe mostrar:
- cantidad retirada
- fecha de retiro
- evidencias
- estado de operación
- certificado asociado

Debe permitir, según rol:
- cargar evidencia
- cerrar operación
- revisar operación

### 8.7 Dashboard admin inicial

Debe mostrar:
- cantidad de operaciones
- toneladas / kg
- actores activos
- residuos por tipo
- filtros por fecha

## 9. Matriz de campos por usuario y flujo

### 9.1 Campos que completa el generador al crear lote

Campos obligatorios:
- `waste_type_id`
- `estimated_quantity_kg`
- `address`
- `pickup_window_start`
- `pickup_window_end`

Campos opcionales:
- `notes`
- geolocalización automática o manual en una fase posterior

Campos que sería bueno agregar después:
- frecuencia estimada del residuo
- contacto operativo
- condiciones de retiro

### 9.2 Campos que completa el recolector al registrar recolección

Campos obligatorios:
- `collected_quantity_kg`
- `collected_at`
- al menos una evidencia

Campos opcionales:
- observaciones operativas
- incidencia o motivo de diferencia respecto a lo estimado

Campos que sería bueno agregar después:
- firma o conformidad
- geolocalización de retiro

### 9.3 Campos que debería gestionar la administración

En organizaciones:
- razón social
- nombre visible
- tipo de organización
- dirección
- CUIT o identificador fiscal
- estado activa/inactiva

En usuarios:
- nombre completo
- email
- teléfono
- organización
- rol
- estado activa/inactiva

En residuos:
- nombre
- código
- unidad
- estado activo/inactivo

### 9.4 Campos visibles para verificación pública

Debe mostrar:
- código público
- número de certificado
- tipo de residuo
- volumen gestionado
- fecha de emisión
- estado del certificado
- identificador de trazabilidad

No debería mostrar:
- datos personales del operador
- datos sensibles del generador
- información administrativa interna

## 10. Secuencia recomendada de diseño de interfaz

1. Diseñar `Login`.
2. Diseñar `Dashboard admin inicial`.
3. Diseñar `Mis lotes` + `Nuevo lote`.
4. Diseñar `Lotes disponibles` + `Detalle de lote`.
5. Diseñar `Detalle de operación` con carga de evidencia.
6. Diseñar `Certificados` y `Auditoría`.

## 11. Recomendación práctica para no perdernos

La forma más ordenada de avanzar sería esta:

1. elegir un usuario a la vez
2. definir sus 3 a 5 pantallas principales
3. definir exactamente qué ve
4. definir exactamente qué completa
5. recién ahí construir interfaz y ajustar API si hace falta

Mi recomendación:
arrancar por `Generador` y `Administrador`, porque ahí se define gran parte del modelo de información del sistema.
