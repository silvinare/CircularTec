# API Boundaries — CircularTec

## 1. Objetivo de este documento
Definir los límites claros entre:

- frontend (apps/web)
- backend (apps/api)
- modelo de datos (packages/db)

Este documento busca evitar:
- duplicación de lógica
- inconsistencias entre capas
- cambios peligrosos en contratos
- mezcla de responsabilidades

---

## 2. Principio general
Cada capa del sistema tiene una responsabilidad clara:

### Frontend (apps/web)
- muestra datos
- gestiona interacción del usuario
- consume la API
- refleja estados

### Backend (apps/api)
- contiene lógica de negocio
- define reglas del sistema
- controla permisos
- maneja estados
- expone endpoints

### Base de datos (packages/db)
- almacena información
- mantiene relaciones
- no contiene lógica de negocio compleja

---

## 3. Regla clave
👉 **La lógica de negocio vive en el backend, no en el frontend**

El frontend:
- no decide estados
- no calcula reglas de flujo
- no valida permisos críticos
- no simula lógica del sistema

El backend:
- es la única fuente de verdad del sistema

---

## 4. Contratos API
Los endpoints del backend definen contratos.

Ejemplo:
- GET /lots
- POST /lots
- GET /lots/{id}

Reglas:
- el frontend debe adaptarse al contrato, no al revés
- no cambiar la estructura de respuesta sin justificar
- no romper endpoints existentes sin análisis previo
- mantener consistencia entre endpoints similares

---

## 5. Responsabilidad sobre estados
Los estados del sistema (lote, operación, etc.):

- se definen en backend
- se actualizan en backend
- se validan en backend

El frontend:
- solo los interpreta y muestra

👉 Nunca duplicar lógica de estados en frontend

---

## 6. Validaciones
### Backend
Debe validar:
- permisos por rol
- integridad de datos
- coherencia del flujo
- condiciones para cambios de estado

### Frontend
Puede validar:
- formato de inputs
- UX (campos obligatorios, etc.)

Pero:
👉 nunca confiar en validación del frontend como única validación

---

## 7. Autenticación y permisos
- JWT se valida en backend
- permisos se evalúan en backend
- frontend solo oculta UI, no protege datos

Regla:
👉 si el backend no valida, no es seguro

---

## 8. Datos y filtros
Ejemplo: GET /lots

Backend:
- aplica filtros
- controla paginación
- decide qué datos devuelve

Frontend:
- envía parámetros
- renderiza resultados

👉 no replicar filtros en frontend que deberían vivir en backend

---

## 9. Trazabilidad
Toda lógica de trazabilidad:

- vive en backend
- se persiste en base de datos
- se expone a frontend como resultado

Frontend:
- no debe reconstruir trazabilidad
- no debe inferir estados

---

## 10. Evidencias
Backend:
- gestiona almacenamiento
- vincula evidencia con entidades
- valida contexto

Frontend:
- permite cargar archivos
- muestra evidencia

👉 el frontend no decide a qué evento pertenece una evidencia

---

## 11. Certificados
Backend:
- genera certificados
- asegura coherencia
- vincula con operación

Frontend:
- los muestra
- permite acceder o visualizar

👉 frontend nunca genera certificados

---

## 12. Qué hacer antes de cambiar la API
Antes de modificar endpoints:

1. identificar quién los consume
2. evaluar impacto en frontend
3. verificar impacto en trazabilidad
4. revisar contratos existentes
5. proponer cambio antes de implementarlo

---

## 13. Errores a evitar
Evitar especialmente:

- lógica de negocio en frontend
- duplicación de validaciones críticas
- estados definidos en dos lugares
- endpoints inconsistentes
- respuestas con estructuras cambiantes
- frontend adaptando “parches” a problemas de backend

---

## 14. Criterios de calidad
La separación es correcta si:

- el frontend es “tonto” (solo renderiza y envía acciones)
- el backend concentra la lógica
- los endpoints son claros y consistentes
- no hay duplicación de reglas
- los cambios en una capa no rompen otras sin aviso

---

## 15. Regla de decisión
Ante una duda:

👉 Si es lógica → backend  
👉 Si es visual/interacción → frontend  
👉 Si es persistencia → base de datos  

---

## 16. Resumen operativo
CircularTec debe comportarse como:

- backend = cerebro del sistema  
- frontend = interfaz del usuario  
- base de datos = memoria  

Romper esta separación genera:
- bugs difíciles
- inconsistencias
- deuda técnica

Mantenerla asegura:
- escalabilidad
- claridad
- mantenibilidad