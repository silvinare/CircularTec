# Manejo de evidencias en CircularTec

## Objetivo

Definir un manejo de evidencias robusto para el MVP, manteniendo storage local en `uploads/`, evitando sobrediseño y dejando una base clara para migrar luego a cloud storage.

## 1. Estado actual validado

### Modelo

Hoy las evidencias viven en `operation_evidences` y están asociadas a `operations`, no al lote ni a una entidad separada de retiro.

Campos actuales:

- `operation_id`
- `file_url`
- `file_type` (`PHOTO` | `DOCUMENT`)
- `uploaded_by`
- `uploaded_at`

### Flujo real implementado

- El recolector registra el retiro con `POST /operations/:lotId/collect`.
- La evidencia se sube aparte con `POST /operations/:operationId/evidences/upload`.
- El cierre exige al menos 1 evidencia.
- En la UI demo, la evidencia se pide recién al momento de cerrar.

### Desalineación detectada

La documentación funcional y técnica describe que el recolector registra el retiro con peso, fecha y fotos en el momento `COLLECTED`. Sin embargo, la implementación actual obliga la carga en la etapa previa al cierre administrativo.

## 2. Evaluación: ¿retiro o cierre?

### Recomendación

Para el MVP, la evidencia debería cargarse en el retiro, no en el cierre.

### Motivo

- La evidencia prueba el hecho físico: retiro, estado del material, comprobante firmado, foto en sitio.
- El cierre es administrativo y puede ocurrir más tarde por otro actor.
- Si la evidencia se carga recién al cerrar, se mezcla prueba operativa con un paso burocrático posterior.
- También se corre el riesgo de cerrar con archivos subidos fuera de contexto temporal o por un actor distinto al que hizo el retiro.

### Decisión práctica MVP

- Mantener la asociación a `operation`.
- Cambiar el momento esperado de carga a la etapa `collect` / `PENDING_CONFIRMATION`.
- El cierre debe seguir validando que exista al menos una evidencia, pero ya como precondición heredada del retiro, no como una acción de último momento.

No hace falta crear una nueva tabla de `retiros` para resolver esto en MVP.

## 3. Riesgos actuales

### Consistencia

- El archivo se escribe en disco antes de persistir la fila en base. Si falla la escritura en DB, queda archivo huérfano.
- También existe el endpoint `POST /operations/:operationId/evidences` que permite registrar una URL arbitraria; eso rompe la consistencia del criterio "evidencia local en uploads".
- No hay metadatos suficientes para verificar integridad: falta al menos nombre original, MIME real, tamaño y una clave de storage estable.
- `file_url` mezcla referencia de acceso con referencia de almacenamiento. Eso complica migraciones futuras.

### Seguridad

- `app.use('/uploads', express.static(uploadsDir))` expone los archivos de forma pública directa.
- No hay `fileFilter` de `multer`; cualquier archivo entra mientras respete el límite de tamaño.
- La clasificación `PHOTO` vs `DOCUMENT` depende de `mimetype` reportado por el cliente.

### Operación

- No hay mecanismo para detectar faltantes en disco respecto de la DB.
- No hay convención por operación en el filesystem; todo cae en una carpeta plana.
- No hay política explícita de reemplazo, borrado o retención.

## 4. MVP robusto recomendado

## 4.1 Mantener el modelo, endurecer el contrato

Seguir usando `operation_evidences`, pero agregar pocos campos que ordenen el storage:

- `storage_key`: ruta interna relativa, por ejemplo `operations/{operationId}/{uuid}.jpg`
- `original_name`
- `mime_type`
- `size_bytes`

`file_url` puede mantenerse temporalmente por compatibilidad, pero debería pasar a ser derivable desde `storage_key`, no el dato primario.

## 4.2 Cambiar el momento de carga esperado

- Permitir y fomentar la carga apenas se registra el retiro.
- La confirmación del generador revisa esas evidencias.
- El cierre sólo valida que ya exista evidencia obligatoria.

Si se quiere seguir admitiendo un documento adicional al cierre, eso puede convivir más adelante como una segunda categoría, pero no hace falta modelarlo ahora.

## 4.3 Endurecer upload local

- Restringir tipos permitidos: imágenes y PDF.
- Validar por whitelist de MIME y extensión.
- Guardar archivos bajo subdirectorios por operación, no en carpeta plana.
- Si falla la persistencia en DB luego del upload, borrar el archivo recién escrito.

## 4.4 Cerrar exposición pública directa

En MVP local no hace falta storage privado complejo, pero sí conviene dejar de servir `uploads/` como carpeta pública abierta.

Propuesta:

- Guardar sólo `storage_key` en DB.
- Servir descarga o preview mediante endpoint autenticado.
- Reutilizar `ensureOperationReadableByUser` para autorizar acceso.

Eso resuelve seguridad básica y deja el patrón listo para S3/R2 más adelante.

## 4.5 Agregar verificación mínima de integridad

- Script o job simple que compare DB vs disco y reporte:
  - filas sin archivo
  - archivos huérfanos
- Loguear hash opcionalmente más adelante, pero no es requisito MVP.

## 5. Base para migración futura a cloud storage

La clave es desacoplar "dónde está guardado" de "cómo se accede".

Para eso, el MVP debería dejar estos contratos:

- La DB guarda `storage_key`, no una URL final como dato principal.
- La app usa un servicio de storage con interfaz simple:
  - `save(file) -> storageKey`
  - `remove(storageKey)`
  - `getPublicUrl(storageKey)` o `createReadStream(storageKey)`
- El endpoint entrega el archivo sin asumir disco local.

Con eso, migrar a S3/R2 después implica cambiar la implementación del servicio, no rehacer modelo y flujos.

## 6. Decisión sugerida

### Ahora

- Mantener evidencias asociadas a `operation`.
- Cambiar la expectativa funcional: evidencia en retiro.
- Endurecer upload local y acceso autenticado.
- Separar `storage_key` de `file_url`.

### No hacer todavía

- Nueva entidad de retiro.
- Versionado de archivos.
- Hash criptográfico obligatorio por evidencia.
- Migración a S3/R2.
- Workflow documental complejo por tipo de comprobante.

## 7. Orden de implementación recomendado

1. Mover la UX de carga al paso de retiro.
2. Restringir tipos de archivo y ordenar filesystem por operación.
3. Reemplazar acceso público `/uploads/*` por endpoint autenticado.
4. Agregar `storage_key`, `original_name`, `mime_type`, `size_bytes`.
5. Dejar una abstracción mínima de storage para futura migración cloud.
