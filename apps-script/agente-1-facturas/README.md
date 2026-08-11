# Agente 1 - Facturas y Reportes (Google Apps Script)

Revisa Gmail buscando facturas/cuentas de cobro con PDF adjunto, extrae los
datos con IA, los registra en Sheets, guarda el PDF en Drive por mes, y
notifica por correo.

## Configuración paso a paso

1. **Crear la hoja de cálculo**: en Google Sheets crea (o usa una existente)
   con una pestaña llamada exactamente `Gastos Terra 93` con estas columnas
   en la fila 1: `Fecha registro | Proveedor | NIT | Concepto | Valor |
   Fecha factura | N° factura | Estado`.
2. **Crear la carpeta en Drive** donde se guardarán los PDF (ej. "Facturas
   Terra 93"). Copia su ID desde la URL (la parte después de `/folders/`).
3. **Abrir el editor de Apps Script**: desde la hoja de cálculo, ve a
   `Extensiones → Apps Script`.
4. **Pegar el código**: borra el contenido de `Code.gs` que aparece por
   defecto y pega el contenido de `Code.gs` de esta carpeta.
5. **Agregar el manifiesto**: en el editor, activa "Mostrar archivo de
   manifiesto" (ícono de engranaje ⚙️ → Configuración del proyecto → marca
   "Mostrar archivo appsscript.json"), abre `appsscript.json` y reemplaza su
   contenido con el de este `appsscript.json`.
6. **Activar el servicio de Drive**: en el editor, click en el ícono `+`
   junto a "Servicios" → busca "Drive API" → agregar (debe quedar como
   versión v2, que coincide con el manifiesto).
7. **Configurar los valores pendientes**: en `Code.gs`, reemplaza en el
   bloque `CONFIG`:
   - `SHEET_ID` → ID de tu hoja de cálculo (parte de la URL entre `/d/` y
     `/edit`).
   - `DRIVE_FOLDER_ID` → ID de la carpeta de Drive del paso 2.
   - `EMAIL_NOTIFICACION` → el correo de Yenny donde quieres recibir avisos.
8. **Guardar tu API key de OpenAI de forma segura** (nunca en el código):
   ⚙️ Configuración del proyecto → Propiedades del script → Añadir
   propiedad del script → nombre `OPENAI_API_KEY`, valor tu API key
   (la consigues en platform.openai.com/api-keys).
9. **Autorizar el script**: en el editor, selecciona la función
   `revisarFacturasNuevas` en el menú desplegable de arriba y dale a
   "Ejecutar". Google pedirá permisos (Gmail, Sheets, Drive) — acéptalos.
10. **Crear el trigger automático**: ícono de reloj ⏰ (Activadores) →
    "Añadir activador" → función `revisarFacturasNuevas` → Basado en tiempo
    → "Cada 15 minutos" → Guardar.

Listo — desde ese momento, cada vez que llegue un correo con una factura en
PDF, el agente la procesa solo.
