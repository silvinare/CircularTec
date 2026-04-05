# Rol Generador

## 1. Objetivo del rol

El Generador usa el sistema para:

- publicar lotes de residuos
- seguir el estado de cada lote
- ver cuándo un lote fue tomado o retirado
- consultar certificados emitidos
- revisar evidencias y trazabilidad de operaciones cerradas

La experiencia debe ser:

- simple
- rápida
- con pocos campos
- muy clara en los estados

## 2. Navegación recomendada

Menú principal del Generador:

- `Inicio`
- `Mis lotes`
- `Nuevo lote`
- `Certificados`
- `Mi cuenta`

Secuencia principal de uso:

1. ingresa
2. ve resumen de su operación
3. crea un lote
4. sigue su estado
5. consulta certificado cuando el retiro se cerró

## 3. Pantallas del Generador

### 3.1 Login

Objetivo:
permitir acceso rápido y claro.

Qué muestra:
- logo / nombre del sistema
- email
- contraseña
- botón `Ingresar`
- mensaje de error si las credenciales no son válidas

Qué acciones tiene:
- iniciar sesión
- eventualmente recuperar contraseña en una fase posterior

Wireframe textual:

```text
+--------------------------------------------------+
| CircularTec                                      |
| Ingreso para generadores                         |
|                                                  |
| Email                                            |
| [____________________________]                   |
|                                                  |
| Contraseña                                       |
| [____________________________]                   |
|                                                  |
| [ Ingresar ]                                     |
|                                                  |
| Mensaje de error / ayuda                         |
+--------------------------------------------------+
```

### 3.2 Inicio

Objetivo:
dar una vista simple del estado actual del generador.

Qué muestra:
- cantidad de lotes activos
- cantidad de lotes cerrados
- último certificado emitido
- acceso rápido a `Nuevo lote`
- acceso rápido a `Mis lotes`

Qué acciones tiene:
- crear lote
- ver lotes
- ver certificados

Wireframe textual:

```text
+--------------------------------------------------+
| Hola, Generador Demo                             |
|                                                  |
| [ Lotes activos ] [ Lotes cerrados ] [ Certificados ] |
|                                                  |
| Ultima actividad                                 |
| - LOT-2026-000123 | Cerrado | Certificado listo  |
|                                                  |
| [ Crear nuevo lote ]   [ Ver mis lotes ]         |
+--------------------------------------------------+
```

### 3.3 Mis lotes

Objetivo:
permitir ver y filtrar los lotes del generador.

Qué muestra:
- código de lote
- residuo
- cantidad estimada
- estado
- fecha de creación
- recolector asignado si existe
- acceso a detalle

Qué filtros debería tener:
- estado
- tipo de residuo
- rango de fechas

Qué acciones tiene:
- ver detalle
- crear nuevo lote

Columnas recomendadas:
- `Codigo`
- `Residuo`
- `Cantidad`
- `Estado`
- `Fecha`
- `Recolector`
- `Acciones`

Wireframe textual:

```text
+----------------------------------------------------------------------------------+
| Mis lotes                                                                        |
|                                                                                  |
| Estado [Todos v]  Residuo [Todos v]  Desde [__]  Hasta [__]  [Filtrar]           |
|                                                                                  |
| [ Nuevo lote ]                                                                   |
|                                                                                  |
| Codigo        Residuo       Cantidad   Estado      Fecha       Recolector  Accion|
| LOT-001       PET           120 kg     Publicado   02/04/26    -           Ver   |
| LOT-002       PEBD Film     250 kg     Asignado    01/04/26    Coop X      Ver   |
| LOT-003       PET           90 kg      Cerrado     30/03/26    Coop Y      Ver   |
|                                                                                  |
| [Anterior]                                           Pagina 1 de N   [Siguiente] |
+----------------------------------------------------------------------------------+
```

### 3.4 Nuevo lote

Objetivo:
crear un lote con el menor esfuerzo posible.

Campos obligatorios:
- tipo de residuo
- cantidad estimada
- dirección de retiro
- fecha/hora o ventana de retiro

Campos opcionales:
- observaciones

Reglas UX:
- no más de 5 campos principales visibles al mismo tiempo
- mensajes de error por campo
- confirmación clara al guardar

Qué acciones tiene:
- guardar borrador en una fase posterior
- publicar lote
- cancelar

Wireframe textual:

```text
+--------------------------------------------------------------+
| Nuevo lote                                                   |
|                                                              |
| Tipo de residuo                                              |
| [ PET post-consumo                    v ]                    |
|                                                              |
| Cantidad estimada (kg)                                       |
| [____________________]                                       |
|                                                              |
| Direccion de retiro                                          |
| [______________________________________________]             |
|                                                              |
| Desde                                                        |
| [______/______/______  __:__]                                |
|                                                              |
| Hasta                                                        |
| [______/______/______  __:__]                                |
|                                                              |
| Observaciones                                                |
| [______________________________________________]             |
|                                                              |
| [ Publicar lote ]   [ Cancelar ]                             |
+--------------------------------------------------------------+
```

### 3.5 Detalle de lote

Objetivo:
mostrar toda la información relevante del lote y su estado.

Qué muestra:
- código
- estado actual
- residuo
- cantidad estimada
- dirección
- ventana de retiro
- observaciones
- recolector asignado
- operación asociada
- evidencias si existen
- certificado si existe

Bloques recomendados:
- `Resumen`
- `Estado y seguimiento`
- `Operación`
- `Certificado`

Qué acciones tiene:
- cancelar lote si todavía no fue retirado
- ver certificado si está cerrado
- ver evidencias

Wireframe textual:

```text
+-------------------------------------------------------------------+
| Lote LOT-2026-000123                                              |
| Estado: Asignado                                                  |
|                                                                   |
| Resumen                                                           |
| - Residuo: PET post-consumo                                       |
| - Cantidad estimada: 120 kg                                       |
| - Direccion: Av. Circular 123                                     |
| - Ventana: 02/04/26 09:00 - 02/04/26 14:00                        |
| - Observaciones: material limpio                                  |
|                                                                   |
| Seguimiento                                                       |
| - Publicado                                                       |
| - Tomado por Coop X                                               |
| - Pendiente de retiro                                             |
|                                                                   |
| Operacion                                                         |
| - Sin retiro registrado / o detalle de operación                  |
|                                                                   |
| Certificado                                                       |
| - No disponible / Disponible                                      |
|                                                                   |
| [ Ver certificado ]  [ Ver evidencias ]  [ Cancelar lote ]        |
+-------------------------------------------------------------------+
```

### 3.6 Certificados

Objetivo:
dar acceso rápido a comprobantes emitidos.

Qué muestra:
- número de certificado
- lote asociado
- residuo
- volumen gestionado
- fecha de emisión
- estado
- código de verificación

Qué acciones tiene:
- ver detalle
- abrir verificación pública
- descargar PDF en una fase posterior

Wireframe textual:

```text
+--------------------------------------------------------------------------------+
| Certificados                                                                   |
|                                                                                |
| Numero        Lote         Residuo     Volumen   Fecha       Estado   Accion   |
| CT-2026-123   LOT-001      PET         100 kg    02/04/26    Valido   Ver      |
| CT-2026-124   LOT-003      PEBD        240 kg    01/04/26    Valido   Ver      |
+--------------------------------------------------------------------------------+
```

### 3.7 Mi cuenta

Objetivo:
mostrar datos básicos del usuario y organización.

Qué muestra:
- nombre
- email
- organización
- dirección
- teléfono si existe

Qué acciones tiene:
- editar datos básicos en una fase posterior
- cerrar sesión

## 4. Estados que debe entender el Generador

El Generador no debería ver estados técnicos complejos. Conviene mostrar una versión simple:

- `Publicado`
- `Asignado`
- `Retirado`
- `Cerrado`
- `Cancelado`

Mapeo interno sugerido:

- `PUBLISHED` -> `Publicado`
- `ASSIGNED` -> `Asignado`
- `COLLECTED` -> `Retirado`
- `CLOSED` -> `Cerrado`
- `CANCELLED` -> `Cancelado`

## 5. Acciones permitidas por estado

### Cuando el lote está `Publicado`

El Generador puede:
- ver detalle
- cancelar lote

### Cuando el lote está `Asignado`

El Generador puede:
- ver recolector asignado
- ver detalle
- eventualmente cancelar con reglas específicas

### Cuando el lote está `Retirado`

El Generador puede:
- ver que el retiro fue registrado
- revisar evidencias
- esperar cierre administrativo

### Cuando el lote está `Cerrado`

El Generador puede:
- ver certificado
- ver evidencias
- consultar historial

## 6. Campos mínimos que debe completar el Generador

En `Nuevo lote`:

- `Tipo de residuo`
- `Cantidad estimada`
- `Dirección`
- `Inicio de ventana de retiro`
- `Fin de ventana de retiro`

Opcional:
- `Observaciones`

## 7. Información mínima que siempre debe ver el Generador

En cualquier listado o detalle:

- código del lote
- tipo de residuo
- cantidad estimada
- estado actual
- última actualización

Cuando exista operación:

- recolector
- cantidad retirada
- fecha de retiro

Cuando exista cierre:

- certificado
- código público
- evidencia

## 8. Prioridad de implementación para este rol

### Prioridad 1

- `Login`
- `Mis lotes`
- `Nuevo lote`
- `Detalle de lote`

### Prioridad 2

- `Certificados`
- mejor seguimiento visual de estados
- filtros completos

### Prioridad 3

- edición limitada de lotes no asignados
- notificaciones
- descarga de PDF

## 9. Qué decisiones de interfaz deberíamos tomar después

Antes de diseñar en código conviene cerrar estas decisiones:

1. si `Inicio` existe como pantalla separada o si el usuario entra directo a `Mis lotes`
2. si `Nuevo lote` es página propia o modal
3. si el Generador puede cancelar un lote ya asignado
4. si el Generador debe confirmar explícitamente el retiro o solo visualizarlo

## 10. Recomendación

Para el MVP real, la ruta más simple y sólida sería:

1. el Generador entra a `Mis lotes`
2. desde ahí crea `Nuevo lote`
3. desde ahí entra al `Detalle de lote`
4. cuando el lote se cierra, aparece `Ver certificado`

Eso evita sobrecargar el sistema con demasiadas pantallas al principio y mantiene el flujo entendible.
