# Module Spec — Generador

## 1. Objetivo del módulo
El módulo Generador representa la experiencia del usuario que publica materiales o residuos disponibles para retiro o aprovechamiento dentro de CircularTec.

Su objetivo es ofrecer una experiencia clara, confiable y simple para que el Generador pueda:

- registrar nuevos lotes
- consultar sus lotes
- ver el estado de cada lote
- revisar certificados asociados
- acceder a su información básica de cuenta

Este módulo es prioritario en la etapa actual del MVP.

---

## 2. Principio rector de este módulo
La experiencia del Generador debe estar enfocada en **claridad, confianza y trazabilidad visible**, sin mezclar funciones internas, controles técnicos o herramientas pensadas para otros roles.

Regla central:
- el Generador solo debe ver sus propios datos
- el Generador no debe ver simulaciones, controles internos o acciones administrativas
- la interfaz debe ser directa y comprensible

---

## 3. Qué necesita resolver el Generador
Desde la perspectiva del usuario, el Generador quiere poder responder preguntas simples como:

- ¿qué lotes publiqué?
- ¿en qué estado está cada lote?
- ¿qué pasó con un lote específico?
- ¿se retiró?
- ¿hay evidencia o registro asociado?
- ¿se emitió un certificado?
- ¿puedo registrar un nuevo lote fácilmente?

El módulo debe priorizar estas necesidades y evitar complejidad innecesaria.

---

## 4. Alcance mínimo definido
Las vistas mínimas del Generador son:

1. Mis lotes
2. Nuevo lote
3. Detalle de lote
4. Certificados
5. Mi cuenta

Estas vistas ya fueron definidas como base del MVP y deben mantenerse como referencia principal.

---

## 5. Reglas funcionales del módulo
### 5.1 Aislamiento de datos
El Generador solo puede acceder a:
- sus propios lotes
- sus propios certificados
- su propia información de cuenta

Nunca debe ver:
- lotes de otros generadores
- certificados de terceros
- datos internos de administración
- controles técnicos de demo
- acciones de otros roles

### 5.2 Lenguaje de interfaz
La UI del Generador debe usar lenguaje claro y orientado a negocio/operación, no a implementación técnica.

Evitar:
- textos internos de desarrollo
- términos técnicos innecesarios
- referencias a mecanismos internos del sistema salvo que aporten confianza al usuario

### 5.3 Experiencia
La experiencia debe transmitir:
- orden
- simplicidad
- transparencia
- control sobre sus propios lotes

---

## 6. Vista: Mis lotes
### Objetivo
Permitir al Generador consultar rápidamente todos sus lotes publicados.

### Debe incluir
- listado de lotes del usuario autenticado
- estado visible de cada lote
- información resumida útil
- acceso al detalle de lote
- posibilidad clara de crear un nuevo lote

### Debe permitir responder
- cuántos lotes tengo
- cuáles siguen abiertos
- cuáles avanzaron en el flujo
- cuáles derivaron en una operación o certificado

### No debería incluir
- filtros o métricas complejas innecesarias para esta etapa
- datos de otros usuarios
- controles administrativos
- simulaciones internas

### Buen criterio UX
El estado del lote debe ser visible y comprensible.
La lista debe servir como punto principal de seguimiento.

---

## 7. Vista: Nuevo lote
### Objetivo
Permitir al Generador registrar un nuevo lote de forma rápida y clara.

### Debe incluir
- formulario simple
- campos mínimos necesarios
- validaciones claras
- feedback de éxito o error
- redirección lógica después de crear

### Principios
- pedir solo información necesaria para el MVP
- no sobrecargar el formulario
- evitar campos ambiguos
- facilitar alta rápida

### La vista debe transmitir
“Puedo registrar un lote sin esfuerzo y entender qué estoy cargando.”

---

## 8. Vista: Detalle de lote
### Objetivo
Mostrar el historial y estado relevante de un lote específico.

### Debe incluir
- información principal del lote
- estado actual
- datos de la operación si existen
- trazabilidad visible en lenguaje claro
- acceso a evidencia o certificado si corresponde

### Debe permitir responder
- qué pasó con este lote
- si fue tomado/asignado
- si fue retirado
- si hay evidencia
- si existe certificado

### Reglas importantes
- evitar mostrar detalles internos innecesarios
- mostrar progreso del flujo de forma entendible
- priorizar claridad sobre volumen de información

---

## 9. Vista: Certificados
### Objetivo
Permitir al Generador consultar los certificados asociados a sus operaciones válidas.

### Debe incluir
- listado autenticado de certificados del usuario
- vínculo claro con el lote u operación correspondiente
- información suficiente para identificar cada certificado
- acceso al detalle o verificación si existe

### Principios
- el certificado debe percibirse como resultado de una operación trazable
- la experiencia debe transmitir verificabilidad y confianza
- nunca deben aparecer certificados ajenos

---

## 10. Vista: Mi cuenta
### Objetivo
Dar acceso a la información básica del usuario o su organización dentro del MVP.

### Debe incluir
- información de identidad relevante
- datos básicos de contexto
- elementos mínimos de cuenta realmente útiles en esta etapa

### No es prioridad ahora
- configuración avanzada
- preferencias complejas
- administración sofisticada de perfil

---

## 11. Navegación del módulo
La navegación del Generador debe ser estable, simple y predecible.

Debe favorecer:
- acceso rápido a Mis lotes
- creación de nuevo lote
- consulta de certificados
- identificación clara de la sección actual

Evitar:
- navegación confusa
- mezclar entradas de otros roles
- exponer atajos internos del sistema

---

## 12. Relación con trazabilidad
Aunque el Generador no ejecuta todos los eventos operativos, sí necesita ver trazabilidad suficiente para confiar en el sistema.

Esto implica que el módulo debe mostrar, de forma simple:
- estado del lote
- hitos relevantes
- evidencia disponible
- existencia de certificado

La trazabilidad visible para el Generador debe ser:
- entendible
- resumida
- confiable
- alineada con el flujo real

No debe requerir conocimiento técnico del backend.

---

## 13. Criterios de calidad del módulo
Se considera que el módulo Generador está bien resuelto si:

- solo muestra datos propios del usuario
- permite registrar lotes sin fricción innecesaria
- permite entender el estado de cada lote
- permite acceder a certificados de forma clara
- mantiene consistencia entre listado, detalle y certificados
- no mezcla controles internos
- transmite confianza y orden

---

## 14. Errores a evitar
Evitar especialmente:

- mezclar UI del Generador con herramientas de demo
- mostrar datos de otros usuarios
- exponer estados técnicos incomprensibles
- mostrar demasiada información irrelevante
- romper coherencia entre “Mis lotes”, “Detalle” y “Certificados”
- usar lenguaje interno o demasiado técnico
- diseñar flujos pensando en Admin en vez de Generador

---

## 15. Criterios para cambios futuros
Ante una propuesta de cambio en este módulo, priorizar siempre:

1. claridad para el usuario
2. aislamiento de datos
3. consistencia con trazabilidad
4. simplicidad de interfaz
5. bajo riesgo técnico

Si una mejora agrega complejidad pero no mejora de forma clara la experiencia del Generador, no debería priorizarse en esta etapa.

---

## 16. Resumen operativo
El módulo Generador es hoy la prioridad del MVP.

Su misión es permitir que el usuario:
- cargue lotes
- siga su evolución
- vea evidencia relevante
- consulte certificados

Todo dentro de una experiencia:
- simple
- enfocada
- separada de otros roles
- alineada con el flujo real del sistema