# Frontend Checklist — CircularTec

## 1. Objetivo de este documento
Definir una checklist práctica para revisar cualquier cambio en frontend dentro de CircularTec.

Esta checklist busca reducir el riesgo de:
- mezclar experiencias de distintos roles
- mostrar datos incorrectos o excesivos
- duplicar lógica de negocio en UI
- romper consistencia entre vistas
- degradar claridad de uso del MVP

Debe usarse antes de considerar una tarea de frontend como terminada.

---

## 2. Principio general
Todo cambio en frontend debe cumplir dos condiciones:

1. mejorar la experiencia del rol correspondiente
2. respetar la lógica y contratos definidos por backend

Si una UI se ve bien pero rompe claridad, mezcla perfiles o depende de lógica improvisada, no está lista.

---

## 3. Checklist general
Antes de cerrar una tarea de frontend, verificar:

- [ ] el cambio tiene un objetivo claro
- [ ] el alcance está controlado
- [ ] no toca módulos no relacionados sin necesidad
- [ ] no introduce componentes innecesariamente complejos
- [ ] no agrega dependencias visuales innecesarias
- [ ] no resuelve con UI un problema que debería corregirse en backend

---

## 4. Checklist de separación por rol
Verificar:

- [ ] la pantalla pertenece claramente a un rol
- [ ] no mezcla experiencia de Generador con Recolector
- [ ] no mezcla experiencia de usuario final con controles internos
- [ ] las acciones visibles corresponden al rol autenticado
- [ ] el lenguaje de la interfaz está alineado con ese perfil

Preguntas guía:
- ¿esta pantalla está pensada para un único rol?
- ¿hay acciones o textos que pertenecen a otro perfil?
- ¿estoy dejando rastros de UI de demo o admin?

---

## 5. Checklist de claridad del flujo
Verificar:

- [ ] el usuario entiende qué está viendo
- [ ] el usuario entiende qué puede hacer
- [ ] el siguiente paso es visible o inferible
- [ ] los estados mostrados son comprensibles
- [ ] no hay ambigüedad entre listado, detalle y acciones

Preguntas guía:
- ¿esta pantalla ayuda a avanzar el flujo?
- ¿el usuario entiende en qué etapa está?
- ¿la interfaz explica el estado sin requerir conocimiento técnico?

---

## 6. Checklist de contratos con backend
Verificar:

- [ ] la UI usa los datos devueltos por la API sin reinterpretar lógica crítica
- [ ] no se inventan estados en frontend
- [ ] no se hacen supuestos frágiles sobre responses
- [ ] no se parchea en frontend un problema estructural de backend
- [ ] el cambio respeta `docs/api-boundaries.md`

Preguntas guía:
- ¿esto lo debería decidir realmente el backend?
- ¿la UI está mostrando un dato o calculando negocio?
- ¿si cambia el contrato, esta pantalla colapsa fácilmente?

---

## 7. Checklist de datos visibles
Verificar:

- [ ] solo se muestran datos necesarios
- [ ] no se muestran datos de otros usuarios por error
- [ ] no se exponen campos internos irrelevantes
- [ ] la información mostrada está alineada con el rol
- [ ] no hay ruido visual innecesario

Preguntas guía:
- ¿el usuario necesita ver esto?
- ¿esto aporta confianza o solo agrega complejidad?
- ¿estoy mostrando más de lo necesario?

---

## 8. Checklist de estados y acciones
Verificar:

- [ ] las acciones visibles corresponden al estado actual
- [ ] no se muestran acciones inválidas
- [ ] no se ofrecen botones incompatibles entre sí
- [ ] los estados visibles son consistentes con `docs/state-model.md`
- [ ] el frontend refleja el flujo real sin inventar transiciones

Preguntas guía:
- ¿qué puede hacer el usuario en este estado?
- ¿hay acciones habilitadas fuera de secuencia?
- ¿la UI podría inducir a un error operativo?

---

## 9. Checklist de trazabilidad visible
Verificar:

- [ ] la UI muestra hitos relevantes del flujo
- [ ] el usuario puede entender qué pasó con su lote u operación
- [ ] evidencia y certificados aparecen donde tienen sentido
- [ ] la trazabilidad visible es simple pero confiable
- [ ] no se ocultan hitos clave del proceso

Preguntas guía:
- ¿esta pantalla ayuda a entender el historial?
- ¿el usuario puede confiar en lo que ve?
- ¿la evidencia o el certificado aparecen con contexto claro?

---

## 10. Checklist de UX del Generador
Aplicar especialmente cuando se trabaje el módulo Generador.

Verificar:

- [ ] el Generador ve solo sus lotes
- [ ] el Generador puede identificar estados fácilmente
- [ ] la navegación entre Mis lotes, Detalle y Certificados es coherente
- [ ] la pantalla no muestra controles internos
- [ ] la experiencia transmite claridad y confianza

Preguntas guía:
- ¿esta UI parece realmente pensada para el Generador?
- ¿hay elementos heredados de una vista técnica o demo?
- ¿el Generador entiende qué pasó con su lote?

---

## 11. Checklist de UX del Recolector
Aplicar especialmente cuando se trabaje el módulo Recolector.

Verificar:

- [ ] la interfaz está orientada a acción
- [ ] el Recolector entiende qué lote debe operar
- [ ] registrar retiro y cargar evidencia son pasos claros
- [ ] no hay pasos duplicados o ambiguos
- [ ] las acciones siguen la secuencia operativa correcta

Preguntas guía:
- ¿qué tiene que hacer ahora el Recolector?
- ¿el siguiente paso es evidente?
- ¿la UI acompaña el trabajo operativo real?

---

## 12. Checklist de navegación
Verificar:

- [ ] la navegación es estable
- [ ] la sección actual está clara
- [ ] el usuario puede volver fácilmente a la vista anterior lógica
- [ ] no se mezclan accesos de otros módulos sin necesidad
- [ ] las rutas y entradas mantienen coherencia

Preguntas guía:
- ¿esta navegación acompaña el flujo?
- ¿hay accesos que confunden?
- ¿la estructura es predecible?

---

## 13. Checklist de formularios
Verificar:

- [ ] el formulario pide solo datos necesarios
- [ ] las validaciones básicas son claras
- [ ] los errores son entendibles
- [ ] el feedback de éxito es claro
- [ ] no se sobrecarga la experiencia con demasiados campos

Preguntas guía:
- ¿el usuario entiende qué debe completar?
- ¿el error ayuda a corregir?
- ¿estoy pidiendo información innecesaria para el MVP?

---

## 14. Checklist de mensajes y lenguaje
Verificar:

- [ ] el lenguaje es claro y no técnico
- [ ] los textos no parecen internos o de desarrollo
- [ ] no hay etiquetas ambiguas
- [ ] los estados están expresados de forma comprensible
- [ ] los mensajes de error o éxito son útiles

Preguntas guía:
- ¿un usuario real entendería este texto?
- ¿esto suena a producto o a consola de desarrollo?
- ¿el término elegido transmite confianza?

---

## 15. Checklist visual y de simplicidad
Verificar:

- [ ] la pantalla no está sobrecargada
- [ ] la jerarquía visual es clara
- [ ] las acciones principales se distinguen bien
- [ ] los bloques de información están bien agrupados
- [ ] la UI sigue siendo simple para esta etapa del MVP

Preguntas guía:
- ¿hay demasiadas cosas en pantalla?
- ¿se entiende qué es principal y qué es secundario?
- ¿la UI está creciendo más rápido que el producto?

---

## 16. Checklist antes de implementar
Antes de tocar código de frontend, confirmar:

- [ ] entendí qué rol usa esta pantalla
- [ ] entendí qué necesidad resuelve
- [ ] revisé el contrato con backend
- [ ] revisé si el estado mostrado depende del modelo de estados
- [ ] revisé si afecta trazabilidad visible
- [ ] el cambio es incremental

---

## 17. Checklist antes de dar por terminada una tarea
Antes de considerar finalizada una tarea de frontend, confirmar:

- [ ] el problema pedido quedó resuelto
- [ ] la experiencia es más clara
- [ ] no se mezclaron roles
- [ ] no se rompió navegación
- [ ] no se rompió consistencia entre vistas
- [ ] no se agregó lógica de negocio en UI
- [ ] la interfaz sigue siendo simple y entendible

---

## 18. Regla de decisión final
Si un cambio:
- mejora claridad
- respeta el rol
- refleja correctamente el estado
- usa bien la API
- mantiene simple la experiencia

entonces probablemente es correcto.

Si para funcionar necesita:
- lógica de negocio duplicada
- textos técnicos
- mezclar perfiles
- esconder inconsistencias del backend
- agregar complejidad visual innecesaria

entonces probablemente no está listo.

---

## 19. Resumen operativo
El frontend de CircularTec debe hacer bien estas cosas:

- mostrar datos correctos
- guiar al usuario según su rol
- reflejar el flujo real del sistema
- hacer visible la trazabilidad relevante
- mantener una experiencia simple y confiable

Esta checklist existe para proteger eso.