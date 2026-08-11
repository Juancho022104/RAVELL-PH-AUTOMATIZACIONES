# Agente 2 - Convocatorias 24/7 (Google Apps Script)

Cada 6 horas revisa RedPH, Revista PH Colombia y Ley de Propiedad Horizontal
buscando edificios que cambian de administrador, cruza contra la lista de 60
edificios objetivo, registra todo en Sheets y avisa a Yenny por correo solo
cuando hay coincidencia.

## Configuración paso a paso

1. **Crear la hoja de cálculo** (puede ser la misma que se use luego para el
   CRM de prospección) con dos pestañas:
   - `60 Edificios Objetivo` — columnas: `Edificio | Zona | ...` (los datos
     de los 60 edificios ya identificados).
   - `Convocatorias Detectadas` — columnas en la fila 1: `Fecha detección |
     Edificio detectado | Zona/Dirección | Fecha publicación | Fuente |
     Link | ¿Coincide con lista objetivo? | Edificio objetivo | Estado`.
2. **Abrir el editor de Apps Script**: desde la hoja de cálculo, ve a
   `Extensiones → Apps Script`.
3. **Pegar el código**: borra el contenido de `Code.gs` por defecto y pega
   el de `Code.gs` en esta carpeta.
4. **Agregar el manifiesto**: ⚙️ Configuración del proyecto → marca "Mostrar
   archivo appsscript.json" → reemplaza su contenido con el de este
   `appsscript.json`.
5. **Configurar los valores pendientes** en el bloque `CONFIG` de `Code.gs`:
   - `SHEET_ID` → ID de tu hoja de cálculo (parte de la URL entre `/d/` y
     `/edit`).
   - `EMAIL_NOTIFICACION` → el correo de Yenny.
6. **Guardar tu API key de OpenAI**: ⚙️ Configuración del proyecto →
   Propiedades del script → Añadir propiedad → nombre `OPENAI_API_KEY`,
   valor tu API key.
7. **Autorizar el script**: selecciona `monitorearConvocatorias` en el menú
   desplegable → "Ejecutar" → acepta los permisos (Sheets, red externa,
   correo).
8. **Crear el trigger automático**: ícono de reloj ⏰ (Activadores) →
   "Añadir activador" → función `monitorearConvocatorias` → Basado en
   tiempo → "Cada 6 horas" → Guardar.

## Pendiente de verificar

Los selectores de cada sitio (RedPH, Revista PH Colombia, Ley de Propiedad
Horizontal) todavía no están confirmados — el script extrae el texto
genérico de toda la página (`limpiarHtml_`) como punto de partida. Si algún
sitio no muestra resultados o la IA se equivoca mucho, hay que revisar el
HTML real de esa página y ajustar la extracción.
