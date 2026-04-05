# Flujo del sistema - CircularTec

## 1. Flujo de negocio

CircularTec organiza el circuito en seis pasos:

1. Un generador publica un lote de residuo.
2. Un recolector o cooperativa toma ese lote.
3. Se ejecuta el retiro y se registra la cantidad efectivamente recolectada.
4. Se cargan evidencias de la operación.
5. La operación se cierra y se emite un certificado.
6. El certificado puede verificarse públicamente.

## 2. Actores involucrados

- `Generador`: crea el lote y describe el residuo.
- `Recolector`: toma el lote y registra el retiro.
- `Administrador municipal`: supervisa el circuito y consulta métricas.
- `Tercero verificador`: consulta un certificado mediante código público.

## 3. Estados principales

### Lote

- `PUBLISHED`: lote publicado y disponible
- `ASSIGNED`: lote asignado a un recolector
- `COLLECTED`: retiro registrado
- `CLOSED`: operación cerrada y certificada
- `CANCELLED`: lote cancelado

### Operación

- `PENDING_CONFIRMATION`: recolección registrada
- `CONFIRMED`: estado reservado para confirmación intermedia
- `CLOSED`: operación finalizada

### Certificado

- `ISSUED`: emitido
- `ANCHORED`: anclado
- `VERIFIED`: verificable
- `ERROR`: con fallo de emisión o anclaje

## 4. Flujo operativo detallado

### Paso 1. Publicación del lote

El generador informa:

- tipo de residuo
- cantidad estimada
- dirección
- ventana de retiro
- notas opcionales

Salida del sistema:

- se crea el lote
- se asigna un código público
- el lote queda en estado `PUBLISHED`

### Paso 2. Asignación

Un recolector toma el lote disponible.

Salida del sistema:

- se registra la asignación
- el lote cambia a `ASSIGNED`
- queda trazabilidad del actor que tomó la operación

### Paso 3. Registro de recolección

El recolector informa:

- cantidad efectivamente retirada
- fecha y hora del retiro

Salida del sistema:

- se crea la operación
- el lote cambia a `COLLECTED`
- la operación queda lista para completar evidencia y cierre

### Paso 4. Carga de evidencias

Se pueden adjuntar:

- fotos
- documentos

Salida del sistema:

- las evidencias quedan vinculadas a la operación
- el retiro gana respaldo documental y visual

### Paso 5. Cierre y certificado

Cuando la operación se cierra:

- se registra el cierre
- se genera el certificado
- se produce el código público de verificación
- se deja preparada la traza para hash/anclaje

### Paso 6. Verificación pública

Un tercero consulta el código del certificado.

Salida del sistema:

- el sistema devuelve estado del certificado
- muestra datos trazables de la operación
- refuerza confianza institucional

## 5. Flujo técnico resumido

```text
Web / Cliente
    ↓
API REST
    ↓
Servicios de dominio
    ↓
Prisma
    ↓
PostgreSQL

Evidencias → almacenamiento local
Certificados → registro y código público
Dashboard → agregaciones sobre operaciones
```

## 6. Endpoints más relevantes por etapa

### Autenticación

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Lotes

- `POST /api/v1/lots`
- `GET /api/v1/lots`
- `POST /api/v1/lots/:id/assign`

### Operaciones

- `POST /api/v1/operations/:lotId/collect`
- `POST /api/v1/operations/:operationId/evidences`
- `POST /api/v1/operations/:operationId/evidences/upload`
- `POST /api/v1/operations/:lotId/close`

### Certificados y métricas

- `GET /api/v1/certificates/verify/:publicCode`
- `GET /api/v1/dashboard/summary`

## 7. Qué demuestra el MVP

El MVP ya demuestra que CircularTec puede:

- registrar el circuito completo
- asignar responsabilidades por actor
- guardar evidencia de campo
- emitir certificados verificables
- generar métricas operativas básicas

## 8. Qué falta para una operación institucional robusta

- storage externo para evidencias
- administración completa de usuarios y organizaciones
- PDF más robusto de certificados
- blockchain real en lugar de anclaje simulado
- trazabilidad administrativa más visible en UI
