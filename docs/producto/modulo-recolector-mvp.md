# Modulo Recolector MVP

## Objetivo

Definir una experiencia simple para el recolector dentro de CircularTec, alineada con la trazabilidad ya implementada en backend.

El modulo debe permitir:

- tomar lotes
- ver lotes ya asignados
- registrar el retiro
- cargar evidencia del retiro
- seguir el estado de cada operacion sin ambiguedad

No debe incluir en MVP:

- ruteo logistico
- chat
- firma digital avanzada
- incidencias complejas
- edicion posterior libre de retiros cerrados

## 1. Principios de diseno

- Mobile first: el recolector necesita operar rapido desde telefono.
- Una accion principal por estado: evitar menus con demasiadas decisiones.
- La evidencia acompana el retiro: no se diseña como tarea administrativa separada.
- La trazabilidad se muestra, pero no se convierte en una interfaz pesada.
- El recolector solo ve lotes disponibles o propios.

## 2. Estados que condicionan la experiencia

Estados reales existentes en backend:

- Lote: `PUBLISHED` -> `ASSIGNED` -> `COLLECTED` -> `CLOSED`
- Operacion: `PENDING_CONFIRMATION` -> `CONFIRMED` -> `CLOSED`

Traduccion funcional para el recolector:

- `PUBLISHED`: disponible para tomar
- `ASSIGNED`: pendiente de retiro
- `COLLECTED` + operacion `PENDING_CONFIRMATION`: retiro registrado, esperando validacion
- `COLLECTED` + operacion `CONFIRMED`: retiro validado, esperando cierre administrativo
- `CLOSED`: circuito finalizado

## 3. Vistas necesarias

### 3.1 Login

Minimo:

- email
- contrasena
- mensaje de error

Objetivo:

entrar rapido al contexto de la organizacion recolectora.

### 3.2 Inicio recolector

Vista simple con dos bloques:

- `Lotes disponibles`
- `Mis retiros`

Indicadores minimos:

- disponibles para tomar
- asignados pendientes de retiro
- retiros pendientes de confirmacion
- retiros finalizados

No hace falta dashboard analitico completo en MVP.

### 3.3 Lotes disponibles

Lista de lotes en `PUBLISHED`.

Cada tarjeta o fila debe mostrar:

- codigo publico
- tipo de residuo
- cantidad estimada
- direccion
- ventana de retiro
- observaciones breves
- accion `Tomar lote`

Filtros MVP:

- tipo de residuo
- fecha

No hace falta mapa en primera version.

### 3.4 Mis retiros

Lista de lotes vinculados a la organizacion recolectora.

Agrupacion visual recomendada:

- `Pendientes de retiro`
- `Pendientes de validacion`
- `Validados`
- `Finalizados`

Cada item debe mostrar:

- codigo de lote
- estado visible
- direccion
- fecha de retiro programada o efectiva
- cantidad estimada o retirada
- ultima accion esperada

### 3.5 Detalle operativo del lote

Es la vista principal de trabajo.

Debe consolidar:

- datos del lote
- datos del generador
- estado actual
- linea de trazabilidad resumida
- bloque de retiro
- bloque de evidencias

Secciones minimas:

- encabezado con codigo y estado
- datos del retiro: residuo, cantidad estimada, direccion, ventana, notas
- datos del generador: nombre y direccion
- trazabilidad corta: publicado, asignado, retirado, confirmado, cerrado
- evidencias cargadas
- accion principal segun estado

### 3.6 Registrar retiro

Puede ser una vista dedicada o un formulario expandible dentro del detalle.

Campos MVP:

- cantidad retirada en kg
- fecha y hora efectiva

Opcional para MVP corto:

- observacion operativa local en UI, sin persistencia si backend aun no la soporta

Accion principal:

- `Registrar retiro`

Regla de UX:

despues de registrar retiro, redirigir al bloque de evidencias de la misma operacion.

### 3.7 Carga de evidencia

Puede vivir dentro del detalle operativo luego del retiro.

Debe permitir:

- sacar o elegir foto
- adjuntar documento si aplica
- ver listado de evidencias subidas

Estados visibles:

- sin evidencia
- cargando
- cargada correctamente
- error de carga

Acciones:

- `Subir foto`
- `Subir documento`

No hace falta edicion sofisticada. Solo agregar y visualizar.

### 3.8 Estado post retiro

Subestado de la misma vista detalle.

Debe informar con claridad:

- retiro registrado
- evidencias cargadas
- pendiente de confirmacion por generador o admin

Si la operacion ya fue confirmada:

- mostrar `Retiro validado`
- bloquear edicion del retiro
- permitir seguir viendo evidencias

Si el lote ya fue cerrado:

- mostrar cierre completo
- acceso a certificado si existe y el backend lo devuelve

## 4. Flujo completo del recolector

## 4.1 Flujo principal MVP

1. El recolector entra al sistema.
2. Ve lotes disponibles y sus retiros.
3. Toma un lote publicado.
4. El lote pasa a `ASSIGNED` y aparece en `Mis retiros`.
5. Abre el detalle operativo.
6. Registra cantidad retirada y fecha/hora efectiva.
7. El sistema crea o actualiza la operacion y el lote pasa a `COLLECTED`.
8. El recolector carga al menos una evidencia.
9. El sistema deja la operacion en `PENDING_CONFIRMATION`.
10. El generador o admin confirma.
11. El generador o admin cierra.
12. El recolector puede consultar el estado final y la trazabilidad.

## 4.2 Flujo de baja friccion recomendado

Para no partir la experiencia en demasiadas pantallas:

- tomar lote desde lista
- resolver retiro y evidencia dentro del detalle
- usar una sola CTA principal por estado

CTA recomendada por estado:

- `PUBLISHED`: `Tomar lote`
- `ASSIGNED`: `Registrar retiro`
- `COLLECTED` sin evidencia suficiente: `Cargar evidencia`
- `COLLECTED` con evidencia y operacion pendiente: `Esperando validacion`
- `CONFIRMED`: `Retiro validado`
- `CLOSED`: `Operacion cerrada`

## 5. Validacion de la interaccion con lotes

## 5.1 Lo que el recolector puede hacer

- listar lotes publicados
- asignarse un lote publicado
- listar lotes asignados a su organizacion
- ver detalle de lote propio
- registrar retiro sobre lote asignado a su organizacion
- cargar evidencia sobre operacion accesible

## 5.2 Lo que no debe poder hacer

- editar un lote publicado por otro actor
- tomar un lote ya asignado
- registrar retiro sobre lote no asignado a su organizacion
- confirmar o cerrar la operacion
- ver lotes de otros recolectores

## 5.3 Reglas UX alineadas al backend

- Si `POST /lots/:id/assign` devuelve conflicto, refrescar lista y mostrar que el lote ya fue tomado.
- El boton `Registrar retiro` solo aparece para lotes `ASSIGNED`.
- La evidencia se asocia a la `operation`, no al `lot`.
- Si no existe operacion aun, la UI primero debe ejecutar `collect`.
- La lista `Mis retiros` debe alimentarse desde `GET /lots?collectorOrgId=...` o el filtro implicito del rol recolector.

## 6. Puntos de carga de evidencia

## 6.1 Punto principal

El punto principal de carga debe ser inmediatamente despues de registrar el retiro.

Motivo:

- la evidencia prueba el hecho fisico
- coincide con la recomendacion tecnica vigente
- evita depender del cierre administrativo

## 6.2 Punto secundario

Tambien debe poder cargarse evidencia desde el detalle de una operacion ya retirada y aun no cerrada.

Esto cubre:

- conectividad deficiente en terreno
- carga diferida unos minutos u horas despues
- agregado de documento complementario

## 6.3 Minimo obligatorio de MVP

- al menos 1 evidencia antes del cierre
- preferencia por foto
- documento opcional

La UI del recolector debe advertir si todavia no hay evidencia:

- `Falta al menos una evidencia para completar la trazabilidad del retiro`

## 7. Consistencia con backend existente

## 7.1 Endpoints ya alineados

- `GET /lots`
- `GET /lots/:id`
- `GET /lots/:id/traceability`
- `POST /lots/:id/assign`
- `POST /operations/:lotId/collect`
- `GET /operations/by-lot/:lotId`
- `POST /operations/:operationId/evidences/upload`
- `GET /operations/:id`

## 7.2 Decisiones que respetan el modelo actual

- No crear entidad nueva de retiro.
- Mantener evidencia asociada a `operation`.
- Mantener confirmacion y cierre fuera del modulo operativo del recolector.
- Reutilizar la trazabilidad del lote como fuente de timeline.

## 7.3 Ajustes funcionales sugeridos sin romper MVP

- Tratar la evidencia como paso esperado inmediatamente despues de `collect`.
- En UI, considerar incompleto un retiro sin evidencia aunque backend ya permita cargarla luego.
- Priorizar el endpoint `evidences/upload` sobre el endpoint de URL manual.

## 8. Propuesta de estructura de navegacion

- `Inicio`
- `Lotes disponibles`
- `Mis retiros`
- `Detalle de lote / operacion`

Navegacion recomendada:

- barra inferior en mobile o tabs simples
- sin submenus profundos

## 9. Estados vacios y mensajes clave

- Sin lotes disponibles: `No hay lotes publicados para tomar en este momento.`
- Sin retiros propios: `Todavia no tenes lotes asignados.`
- Retiro pendiente de evidencia: `Retiro registrado. Falta cargar evidencia.`
- Retiro pendiente de validacion: `El retiro ya fue registrado y espera confirmacion del generador.`
- Retiro cerrado: `La operacion ya fue cerrada y queda disponible en trazabilidad.`

## 10. MVP cerrado

El modulo recolector queda resuelto si cubre estas cuatro tareas sin friccion:

1. tomar un lote
2. registrar el retiro
3. cargar evidencia
4. seguir el estado hasta cierre

Si una decision de interfaz no mejora alguna de esas cuatro tareas, queda fuera del MVP.
