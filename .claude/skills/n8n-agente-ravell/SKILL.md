---
name: n8n-agente-ravell
description: Usa esta skill cada vez que construyas, modifiques o depures un workflow de n8n (agente) para Ravell PH. Aplica siempre que el usuario pida crear un agente nuevo, ajustar uno existente, o trabaje con archivos .json de n8n en este proyecto.
---

# Construcción de agentes n8n — Ravell PH

## Convención de estructura (todos los agentes siguen este patrón)

1. **Trigger** — qué dispara el workflow (email, schedule, webhook).
2. **Extracción/Lectura** — obtener el dato crudo (PDF, texto, HTML).
3. **Procesamiento con IA** — un nodo OpenAI que devuelve JSON estructurado, nunca texto libre. El prompt del sistema siempre pide "SOLO JSON, sin texto adicional" y define cada campo explícitamente, con `null` si no aplica.
4. **Persistencia** — Google Sheets (registro) y/o Google Drive (archivos), nunca solo en memoria del workflow.
5. **Notificación** — email o WhatsApp a Yenny con resumen corto de lo que se hizo.

## Convenciones de nombres

- Nombre del workflow: `Ravell PH - Agente N - [nombre corto]`
- IDs de nodos: numéricos secuenciales como string ("1", "2", "3"...)
- Credenciales: siempre usar `"id": "PENDIENTE"` y un `"name"` descriptivo — nunca inventar IDs de credenciales reales.
- Todo el texto visible para Yenny (nombres de nodos, mensajes de notificación) va en español.

## Antes de generar un JSON nuevo

- Lee `agente_facturas_reportes.json` (Agente 1, ya construido) como plantilla de referencia — mantener la misma estructura de `connections`, `settings`, y formato de nodos.
- Verificar el roadmap de agentes en `CLAUDE.md` para confirmar cuál sigue en prioridad antes de construir uno nuevo fuera de orden.

## Al terminar un agente

- Validar el JSON con `python3 -c "import json; json.load(open('archivo.json'))"` antes de darlo por terminado.
- Listar en el chat, en 3-5 líneas máximo, qué credenciales quedan pendientes de configurar (no repetir explicaciones largas ya dadas en agentes anteriores).
- Actualizar la sección "Roadmap de agentes" del `CLAUDE.md` marcando el agente como construido, con un `str_replace` puntual — no reescribir el archivo completo.

## Estilo de respuesta

- Directo, sin preámbulos largos ni repetir contexto que ya está en CLAUDE.md.
- No volver a explicar qué es n8n o cómo importar un workflow salvo que el usuario lo pida — eso ya se explicó una vez.
