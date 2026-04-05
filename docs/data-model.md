# Data Model — CircularTec

## 1. Objetivo de este documento
Describir el modelo de datos principal de CircularTec desde una perspectiva funcional y de dominio.

Este documento sirve para:

- entender qué representa cada entidad
- aclarar relaciones entre entidades
- evitar duplicaciones o ambigüedades
- ayudar a validar cambios en backend, frontend y base de datos
- preservar coherencia con trazabilidad

No reemplaza el schema técnico de Prisma, sino que explica el modelo a nivel conceptual.

---

## 2. Principios del modelo
El modelo de datos de CircularTec debe responder al flujo principal del MVP:

1. un Generador publica un lote
2. un Recolector lo toma o recibe asignación
3. se registra una operación
4. se adjunta evidencia
5. se cierra la operación
6. se emite un certificado

Por lo tanto, el modelo debe priorizar:

- claridad de relaciones
- trazabilidad
- separación por rol
- auditabilidad
- simplicidad de MVP

---

## 3. Entidades principales
Las entidades principales del sistema son:

- organizaciones
- usuarios
- membresías
- tipos de residuo
- lotes
- asignaciones
- operaciones
- evidencias
- certificados
- auditoría

---

## 4. Organizaciones
## Propósito
Representan a los actores institucionales o entidades participantes del sistema.

Ejemplos:
- organización generadora
- organización recolectora
- entidad administradora

## Responsabilidad
- agrupar usuarios
- contextualizar lotes y operaciones
- definir pertenencia organizacional

## Relaciones típicas
- una organización puede tener muchos usuarios
- una organización puede tener muchos lotes
- una organización puede participar en operaciones según su rol

## Regla conceptual
La organización es el contexto principal de pertenencia del usuario y de muchos objetos de negocio.

---

## 5. Usuarios
## Propósito
Representan personas o cuentas que interactúan con el sistema.

## Responsabilidad
- autenticarse
- ejecutar acciones
- quedar asociadas a eventos relevantes

## Relaciones típicas
- un usuario pertenece a una o más organizaciones a través de membresías
- un usuario puede crear lotes, registrar retiros u otras acciones según su rol
- un usuario puede aparecer vinculado a eventos de auditoría

## Regla conceptual
El usuario es el actor individual; la organización representa el contexto institucional.

---

## 6. Membresías
## Propósito
Relacionan usuarios con organizaciones y roles.

## Responsabilidad
- indicar a qué organización pertenece un usuario
- definir qué rol ejerce dentro de esa organización o contexto

## Relaciones típicas
- un usuario puede tener varias membresías
- una organización puede tener varias membresías
- cada membresía define al menos una relación usuario + organización + rol

## Regla conceptual
La membresía evita acoplar directamente usuario y rol de manera rígida.

---

## 7. Tipos de residuo
## Propósito
Clasificar los materiales o residuos publicados en el sistema.

## Responsabilidad
- dar contexto semántico al lote
- facilitar organización y filtrado
- servir de base para reportes y trazabilidad

## Relaciones típicas
- un tipo de residuo puede estar asociado a muchos lotes
- un lote pertenece a un tipo o categoría definida

## Regla conceptual
Esta entidad ayuda a normalizar el dominio material del sistema.

---

## 8. Lotes
## Propósito
Representan la unidad principal publicada por el Generador.

## Responsabilidad
- contener la información base del material o residuo ofrecido
- funcionar como origen del flujo operativo
- ser el punto inicial de la trazabilidad

## Relaciones típicas
- un lote pertenece a una organización generadora
- un lote puede estar vinculado a un usuario creador
- un lote puede tener asignaciones
- un lote puede derivar en una o más operaciones, según el diseño adoptado
- un lote puede relacionarse indirectamente con evidencias y certificados a través de operaciones

## Regla conceptual
El lote es el objeto central visible para el Generador.

## Estado conceptual
El lote puede atravesar estados como:
- creado
- disponible
- asignado/tomado
- retirado
- cerrado
- certificado

No necesariamente todos deben existir como columna explícita, pero el sistema debe poder reconstruir esta evolución.

---

## 9. Asignaciones
## Propósito
Representan la vinculación entre un lote y un Recolector, cuando el flujo requiere explicitación de esa toma o asignación.

## Responsabilidad
- formalizar quién opera un lote
- registrar toma o asignación
- servir como paso previo a la operación efectiva

## Relaciones típicas
- una asignación pertenece a un lote
- una asignación se vincula a un usuario o organización recolectora
- una asignación puede preceder a una operación

## Regla conceptual
La asignación representa la intención o responsabilidad operativa previa al retiro real.

## Nota
Si el flujo real simplifica esta parte, igual debe quedar claro quién asumió el lote y cuándo.

---

## 10. Operaciones
## Propósito
Representan la ejecución operativa del flujo sobre un lote.

## Responsabilidad
- registrar el retiro
- concentrar eventos operativos
- servir de base para evidencia, cierre y certificación

## Relaciones típicas
- una operación pertenece a un lote
- una operación puede estar asociada a una asignación
- una operación puede tener muchas evidencias
- una operación puede derivar en un certificado
- una operación puede originar eventos de auditoría

## Regla conceptual
La operación es el núcleo transaccional del sistema.

## Estado conceptual
Puede incluir hitos como:
- iniciada
- retiro registrado
- evidencia cargada
- cerrada
- certificada

La definición concreta debe evitar ambigüedad y duplicación con el estado del lote.

---

## 11. Evidencias
## Propósito
Representan pruebas o respaldos de eventos operativos.

## Responsabilidad
- documentar retiro u otros hitos reales
- aportar verificabilidad
- reforzar la auditabilidad del sistema

## Relaciones típicas
- una evidencia pertenece a una operación
- una evidencia puede vincularse indirectamente a un lote
- una evidencia puede estar asociada a un usuario actor o timestamp relevante

## Regla conceptual
La evidencia no debe existir “suelta”: debe estar asociada a un evento o contexto claro.

## Estado actual
Para el MVP:
- almacenamiento local en `uploads/`

---

## 12. Certificados
## Propósito
Representan el resultado verificable final de una operación válida.

## Responsabilidad
- expresar que un flujo llegó a una conclusión consistente
- vincularse con trazabilidad y evidencia previa
- ofrecer verificabilidad

## Relaciones típicas
- un certificado pertenece a una operación válida
- un certificado se vincula indirectamente a un lote
- un certificado puede incluir hash o referencias verificables

## Regla conceptual
El certificado nunca debe existir como elemento independiente del flujo; siempre debe derivar de una operación consistente.

---

## 13. Auditoría
## Propósito
Registrar eventos relevantes para poder reconstruir el historial del sistema.

## Responsabilidad
- capturar acciones clave
- registrar cambios de estado
- preservar actor y momento de cada evento

## Relaciones típicas
- un evento de auditoría puede referir a un lote, operación, certificado u otra entidad
- puede vincularse a un usuario actor
- puede registrar timestamps, tipo de evento y metadatos

## Regla conceptual
Todo evento crítico del flujo debe poder quedar reflejado en auditoría.

---

## 14. Relaciones clave del modelo
Relación funcional simplificada:

- organización → usuarios (vía membresías)
- organización → lotes
- usuario → membresías → organización + rol
- tipo de residuo → lotes
- lote → asignaciones
- lote → operaciones
- operación → evidencias
- operación → certificado
- lote / operación / certificado → auditoría

---

## 15. Fuente de verdad por concepto
Para evitar duplicaciones, conviene pensar así:

- **organización actual del usuario** → membresías / auth
- **qué es el material** → tipo de residuo + lote
- **qué ocurrió operativamente** → operación
- **quién asumió el lote** → asignación
- **qué prueba respalda el evento** → evidencia
- **qué conclusión verificable existe** → certificado
- **qué pasó y cuándo** → auditoría

---

## 16. Reglas de integridad conceptual
Estas reglas deben cumplirse aunque la implementación técnica pueda variar:

1. no debe haber certificado sin operación válida
2. no debe haber evidencia sin contexto operativo claro
3. no debe haber acceso cruzado entre organizaciones sin permiso
4. no debe haber retiro sin actor identificable
5. no debe haber cambios relevantes sin posibilidad de auditoría
6. la relación entre lote y operación debe ser clara
7. la relación entre operación y certificado debe ser directa o inequívoca

---

## 17. Riesgos comunes del modelo
Problemas a evitar:

- duplicar estados entre lote y operación sin criterio claro
- guardar en lote información que pertenece a operación
- guardar en frontend lógica que depende del modelo
- permitir certificados desconectados del flujo real
- crear evidencias sin vínculo claro
- mezclar pertenencia de usuario y organización de forma rígida o poco trazable

---

## 18. Criterios para agregar nuevas entidades
Solo agregar una nueva entidad si cumple al menos una de estas condiciones:

- representa un concepto de negocio claramente distinto
- evita una sobrecarga importante en una entidad existente
- mejora trazabilidad o auditabilidad
- simplifica el flujo de manera real

No agregar entidades por:
- anticipar necesidades futuras no validadas
- comodidad temporal
- sobreingeniería

---

## 19. Criterios para cambios en el modelo
Antes de modificar el modelo, evaluar:

1. si el cambio mejora el flujo del MVP
2. si mejora o preserva trazabilidad
3. si duplica información existente
4. si rompe contratos del backend
5. si complica innecesariamente el frontend
6. si mantiene separación entre roles, operación y certificación

---

## 20. Resumen operativo
El modelo de datos de CircularTec gira alrededor de cuatro ejes:

- **lote** como unidad publicada
- **operación** como ejecución del flujo
- **evidencia** como respaldo verificable
- **certificado** como conclusión trazable

Las demás entidades existen para dar contexto, permisos, clasificación y auditabilidad.

El modelo debe seguir siendo simple, claro y consistente con el MVP.