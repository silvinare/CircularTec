# KPI Definition — CircularTec

## 1. Objetivo de este documento
Definir las métricas e indicadores clave del MVP de CircularTec para asegurar que el dashboard y los reportes reflejen valor real de negocio y trazabilidad, no solo conteos técnicos.

Este documento busca evitar:
- dashboards sobrecargados
- métricas sin utilidad
- indicadores inconsistentes con el modelo de datos
- confusión entre actividad operativa y valor de negocio

---

## 2. Principio general
En esta etapa del MVP, los KPIs deben responder preguntas concretas sobre:

- actividad del sistema
- estado del flujo operativo
- trazabilidad lograda
- certificación emitida
- nivel de avance de operaciones

No es prioridad construir analítica compleja ni BI avanzada.

Regla:
- pocos indicadores
- claros
- trazables
- fáciles de explicar

---

## 3. Qué debe medir el MVP
El dashboard del MVP debe ayudar a responder preguntas como:

- cuántos lotes fueron registrados
- cuántos están disponibles
- cuántos fueron retirados
- cuántos llegaron a cierre
- cuántos certificados se emitieron
- cuántas operaciones tienen evidencia
- cuánto del flujo está completo y cuánto está pendiente

Estas preguntas están alineadas con el núcleo real del producto.

---

## 4. Categorías de KPIs
Para el MVP, conviene agrupar los indicadores en cinco categorías:

1. Actividad general
2. Estado del flujo
3. Trazabilidad y evidencia
4. Certificación
5. Indicadores por rol o actor

---

## 5. KPIs de actividad general
### 5.1 Total de lotes registrados
**Pregunta que responde:**  
¿Cuántos lotes fueron creados en el sistema?

**Definición:**  
Cantidad total de lotes creados en el período seleccionado.

**Utilidad:**  
Mide adopción básica del flujo por parte de generadores.

---

### 5.2 Total de lotes activos
**Pregunta que responde:**  
¿Cuántos lotes siguen abiertos o en proceso?

**Definición:**  
Cantidad de lotes que no llegaron a estado final (`closed` o `certified`, según modelo adoptado).

**Utilidad:**  
Permite ver carga operativa pendiente.

---

### 5.3 Total de operaciones iniciadas
**Pregunta que responde:**  
¿Cuántos lotes avanzaron realmente al flujo operativo?

**Definición:**  
Cantidad de operaciones creadas o iniciadas en el período.

**Utilidad:**  
Distingue publicación de ejecución real.

---

## 6. KPIs de estado del flujo
### 6.1 Lotes disponibles
**Pregunta que responde:**  
¿Cuántos lotes están listos para ser tomados o asignados?

**Definición:**  
Cantidad de lotes en estado `available`.

**Utilidad:**  
Mide volumen pendiente de gestión operativa.

---

### 6.2 Lotes asignados
**Pregunta que responde:**  
¿Cuántos lotes ya tienen responsable operativo?

**Definición:**  
Cantidad de lotes en estado `assigned` o equivalente.

**Utilidad:**  
Mide avance inicial del flujo.

---

### 6.3 Lotes retirados
**Pregunta que responde:**  
¿Cuántos lotes ya tuvieron retiro registrado?

**Definición:**  
Cantidad de lotes en estado `collected` o con operación en `pickup_registered`.

**Utilidad:**  
Mide ejecución efectiva, no solo intención.

---

### 6.4 Operaciones cerradas
**Pregunta que responde:**  
¿Cuántas operaciones llegaron a cierre?

**Definición:**  
Cantidad de operaciones en estado `closed`.

**Utilidad:**  
Mide completitud operativa.

---

## 7. KPIs de trazabilidad y evidencia
### 7.1 Operaciones con evidencia
**Pregunta que responde:**  
¿Cuántas operaciones cuentan con evidencia registrada?

**Definición:**  
Cantidad de operaciones que tienen al menos una evidencia asociada.

**Utilidad:**  
Mide respaldo verificable del flujo.

---

### 7.2 Porcentaje de operaciones con evidencia
**Pregunta que responde:**  
¿Qué proporción de operaciones tiene respaldo documental?

**Definición:**  
(Operaciones con evidencia / total de operaciones relevantes) × 100

**Utilidad:**  
Mide calidad de trazabilidad.

---

### 7.3 Operaciones pendientes de evidencia
**Pregunta que responde:**  
¿Cuántas operaciones deberían tener evidencia y aún no la tienen?

**Definición:**  
Cantidad de operaciones en un estado donde se espera evidencia, pero sin evidencia registrada.

**Utilidad:**  
Detecta brechas operativas o de trazabilidad.

---

## 8. KPIs de certificación
### 8.1 Certificados emitidos
**Pregunta que responde:**  
¿Cuántos certificados verificables fueron emitidos?

**Definición:**  
Cantidad total de certificados generados en el período.

**Utilidad:**  
Mide resultado final validado del sistema.

---

### 8.2 Tasa de certificación
**Pregunta que responde:**  
¿Qué proporción de operaciones cerradas terminó en certificado?

**Definición:**  
(Certificados emitidos / operaciones cerradas) × 100

**Utilidad:**  
Mide conversión del cierre en resultado verificable.

---

### 8.3 Lotes certificados
**Pregunta que responde:**  
¿Cuántos lotes llegaron al estado final de certificación?

**Definición:**  
Cantidad de lotes en estado `certified`.

**Utilidad:**  
Muestra volumen de casos finalizados completamente.

---

## 9. KPIs por rol o actor
### 9.1 Lotes por generador
**Pregunta que responde:**  
¿Qué generadores están publicando más lotes?

**Definición:**  
Cantidad de lotes agrupados por organización generadora o usuario generador, según modelo.

**Utilidad:**  
Mide adopción por actor.

**Nota:**  
Usar con cuidado en el MVP para no sobrecargar dashboards del usuario final.

---

### 9.2 Operaciones por recolector
**Pregunta que responde:**  
¿Qué recolectores están ejecutando más operaciones?

**Definición:**  
Cantidad de operaciones agrupadas por recolector.

**Utilidad:**  
Mide actividad operativa por actor.

---

### 9.3 Certificados por generador
**Pregunta que responde:**  
¿Qué actores lograron más resultados certificados?

**Definición:**  
Cantidad de certificados agrupados por generador vinculado al lote.

**Utilidad:**  
Mide resultado final por actor.

---

## 10. KPIs recomendados para dashboard MVP
Para un dashboard inicial del MVP, conviene mostrar solo un conjunto reducido.

### Recomendados como KPIs principales
- Total de lotes registrados
- Lotes disponibles
- Lotes retirados
- Operaciones con evidencia
- Certificados emitidos

### Recomendados como visuales complementarios
- evolución de lotes creados por período
- evolución de certificados emitidos por período
- distribución de lotes por estado
- operaciones con/sin evidencia
- top generadores o recolectores, si aporta valor

---

## 11. Indicadores que NO son prioridad ahora
No priorizar en esta etapa:

- métricas financieras complejas
- indicadores derivados demasiado sofisticados
- eficiencia operativa avanzada
- tiempos promedio multietapa complejos
- scorecards de performance avanzados
- benchmarks comparativos

Estas métricas podrían aparecer más adelante, pero no deben complicar el MVP.

---

## 12. Reglas de consistencia para KPIs
Todo KPI debe cumplir estas reglas:

- debe poder explicarse fácilmente
- debe tener una definición unívoca
- debe derivar del modelo real de datos
- no debe duplicar otro indicador
- no debe depender de lógica ambigua
- debe poder reconstruirse desde backend o base de datos

---

## 13. Fuente de verdad por KPI
### Lotes
Fuente principal: entidad `lotes`

### Operaciones
Fuente principal: entidad `operaciones`

### Evidencias
Fuente principal: entidad `evidencias`, asociada a `operaciones`

### Certificados
Fuente principal: entidad `certificados`, asociada a `operaciones`

### Agrupaciones por actor
Fuente principal: relación entre lotes/operaciones y organizaciones/usuarios

Regla:
- evitar calcular KPIs en frontend
- el backend o la base deben ser la fuente de verdad

---

## 14. Riesgos comunes al definir KPIs
Evitar especialmente:

- contar lotes como si fueran operaciones
- mezclar estados de lote y operación sin criterio
- mostrar métricas “bonitas” pero irrelevantes
- usar indicadores que el usuario no entiende
- calcular en frontend lo que debería resolverse en backend
- mostrar números sin contexto temporal o de estado

---

## 15. Criterios para agregar nuevos KPIs
Solo agregar un nuevo KPI si cumple al menos una de estas condiciones:

- responde una pregunta importante del negocio
- mejora el seguimiento del flujo
- ayuda a detectar problemas operativos
- mejora la lectura de trazabilidad
- ayuda a demostrar valor del producto

No agregar un KPI solo porque:
- hay datos disponibles
- queda visualmente bien
- parece más “completo”

---

## 16. Diferencia entre dashboard interno y dashboard por rol
### Dashboard interno / admin
Puede incluir:
- visión global
- métricas agregadas
- comparaciones entre actores
- estados del sistema

### Dashboard del Generador
Debe incluir solo:
- sus lotes
- sus certificados
- estados relevantes de su flujo

### Dashboard del Recolector
Debe incluir solo:
- lotes asignados o tomados
- operaciones pendientes
- evidencia pendiente o cargada

Regla:
- no mezclar indicadores de distintos roles en una misma experiencia

---

## 17. Recomendación práctica para el MVP
Para esta etapa, conviene priorizar un dashboard pequeño pero confiable.

Mejor tener:
- 5 KPIs correctos
- 2 o 3 visuales claros

que:
- 20 números difíciles de interpretar
- gráficos desconectados del valor real del sistema

---

## 18. Resumen operativo
Los KPIs del MVP de CircularTec deben medir principalmente:

- actividad
- avance del flujo
- trazabilidad respaldada
- certificación lograda

El dashboard debe ayudar a demostrar que el sistema funciona y genera valor, no solo que almacena datos.