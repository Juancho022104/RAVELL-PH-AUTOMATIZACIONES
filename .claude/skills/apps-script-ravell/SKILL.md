---
name: apps-script-ravell
description: Usa esta skill cada vez que construyas, modifiques o depures un script de Google Apps Script (agente) para Ravell PH, incluyendo cualquier interfaz visual (sidebar, diálogo, web app) dentro de esos scripts. Aplica siempre que el usuario pida crear un agente nuevo, ajustar uno existente, o trabaje con archivos .gs o .html de este proyecto. Reemplaza al enfoque anterior basado en n8n.
---

# Construcción de agentes en Google Apps Script — Ravell PH

## Contexto del cambio

Este proyecto migró de n8n a Google Apps Script (gratis, sin necesitar instalación ni permisos de administrador). Los agentes ahora son scripts `.gs` que corren dentro de la cuenta de Google de Ravell PH, con acceso nativo a Gmail, Sheets y Drive — sin necesitar credenciales OAuth separadas para esos tres servicios. Solo se necesita API Key externa para IA (OpenAI/Gemini) si el agente la usa.

## Convención de estructura (todos los agentes siguen este patrón)

1. **Trigger** — `onFormSubmit`, trigger de tiempo (`ScriptApp.newTrigger`), o `onOpen` para menús.
2. **Lectura/Extracción** — leer Gmail (`GmailApp`), Sheets (`SpreadsheetApp`) o Drive (`DriveApp`).
3. **Procesamiento con IA** (si aplica) — llamada a `UrlFetchApp` contra la API de OpenAI, pidiendo SIEMPRE JSON estructurado en el prompt de sistema, nunca texto libre.
4. **Persistencia** — escribir en Sheets y/o Drive.
5. **Notificación** — `MailApp.sendEmail` o `GmailApp.sendEmail` a Yenny con resumen corto.

## Convenciones de nombres de archivo

- Un archivo `.gs` por agente: `Agente1_FacturasReportes.gs`, `Agente2_Convocatorias.gs`, etc.
- Funciones dentro de cada archivo en español, verbo + sustantivo: `procesarFactura()`, `notificarYenny()`.
- Constantes de configuración (IDs de hojas, carpetas) arriba del archivo, en mayúsculas: `const ID_HOJA_GASTOS = "..."`.

## Parte visual (HtmlService)

- Un archivo `.html` por interfaz: `Dashboard.html`, `SidebarFacturas.html`.
- Paleta de marca Ravell PH: azul marino `#1F3864` y naranja `#E36C0A` (mismos colores usados en la matriz de tarifas y las cartas comerciales — mantener consistencia visual entre todos los documentos y herramientas de la empresa).
- Texto siempre en español, tono directo (mismo estilo que el resto de comunicaciones de Ravell PH: "Su necesidad, nuestra prioridad").
- Para un dashboard standalone (Web App), usar `doGet(e)` que retorna `HtmlService.createTemplateFromFile('Dashboard').evaluate()`.
- Para un sidebar dentro de Sheets, usar `SpreadsheetApp.getUi().showSidebar(...)`, llamado desde un menú personalizado creado en `onOpen()`.

## Antes de generar código nuevo

- Revisar qué agentes ya existen en el proyecto para mantener el mismo estilo y no duplicar funciones (por ejemplo, la función de notificación por correo debería reutilizarse entre agentes, no reescribirse cada vez).
- Verificar el roadmap de agentes en `CLAUDE.md` para confirmar cuál sigue en prioridad.

## Al terminar un agente o interfaz

- Explicar en 3-5 líneas máximo qué pasos manuales le faltan al usuario (pegar el código en script.google.com, autorizar permisos la primera vez, configurar el trigger).
- No repetir explicaciones largas ya dadas en agentes anteriores sobre qué es Apps Script o cómo se abre el editor.
- Actualizar la sección "Roadmap de agentes" del `CLAUDE.md` marcando el agente como construido.

## Estilo de respuesta

- Directo, sin preámbulos largos.
- Yenny está empezando a programar — explicar con claridad dónde pegar cada cosa, sin asumir experiencia previa con Apps Script.
