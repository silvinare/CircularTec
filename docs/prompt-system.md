# Prompt System — CircularTec

## 1. Objetivo
Definir un sistema simple y reusable de prompts para trabajar con Codex de forma consistente, evitando:

- pérdida de contexto
- mezcla de módulos
- cambios desordenados
- baja calidad en respuestas

Este sistema se basa en 4 tipos de prompts:

1. START → entender contexto
2. FOCUS → acotar problema
3. CHANGE → implementar cambios
4. REVIEW → validar calidad

---

## 2. Principio general
No usar prompts largos todo el tiempo.

Flujo recomendado:
START → FOCUS → CHANGE → REVIEW

---

## 3. START prompts

### Backend