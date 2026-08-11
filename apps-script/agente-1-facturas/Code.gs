/**
 * Ravell PH - Agente 1 - Facturas y Reportes (Google Apps Script)
 *
 * Qué hace: revisa Gmail buscando facturas/cuentas de cobro con PDF adjunto,
 * usa IA para extraer los datos, los registra en Google Sheets, guarda el PDF
 * en Drive organizado por mes, y notifica a Yenny por correo.
 *
 * Configuración inicial (ver README.md en esta misma carpeta):
 * 1. Reemplazar los valores "PENDIENTE_..." en CONFIG más abajo.
 * 2. En el editor de Apps Script: Servicios (ícono +) → agregar "Drive API".
 * 3. En Configuración del proyecto → Propiedades del script → agregar
 *    OPENAI_API_KEY con tu API key de OpenAI.
 * 4. Crear un trigger de tiempo para revisarFacturasNuevas() cada 15 minutos
 *    (Activadores → Añadir activador).
 */

var CONFIG = {
  SHEET_ID: 'PENDIENTE_ID_HOJA_GASTOS_TERRA93',
  SHEET_NAME: 'Gastos Terra 93',
  DRIVE_FOLDER_ID: 'PENDIENTE_ID_CARPETA_DRIVE_TERRA93',
  EMAIL_NOTIFICACION: 'PENDIENTE_EMAIL_YENNY',
  GMAIL_LABEL_PROCESADA: 'FacturasProcesadas',
  GMAIL_QUERY: 'subject:(factura OR "cuenta de cobro" OR recibo) has:attachment -label:FacturasProcesadas'
};

function revisarFacturasNuevas() {
  var label = getOrCreateLabel_(CONFIG.GMAIL_LABEL_PROCESADA);
  var threads = GmailApp.search(CONFIG.GMAIL_QUERY, 0, 20);

  threads.forEach(function (thread) {
    thread.getMessages().forEach(function (message) {
      message.getAttachments().forEach(function (attachment) {
        if (attachment.getContentType() !== 'application/pdf') return;

        try {
          var texto = extraerTextoPDF_(attachment);
          var datos = extraerDatosFacturaIA_(texto);
          registrarEnSheets_(datos);
          guardarPDFEnDrive_(attachment, datos);
          notificarPorEmail_(datos);
        } catch (err) {
          Logger.log('Error procesando adjunto de "' + message.getSubject() + '": ' + err);
          MailApp.sendEmail(CONFIG.EMAIL_NOTIFICACION,
            'Error procesando factura',
            'Hubo un error procesando el correo "' + message.getSubject() + '":\n\n' + err);
        }
      });
    });
    thread.addLabel(label);
  });
}

function extraerTextoPDF_(attachment) {
  var resource = { title: 'temp_ocr_' + new Date().getTime(), mimeType: MimeType.GOOGLE_DOCS };
  var file = Drive.Files.insert(resource, attachment.copyBlob(), { ocr: true, ocrLanguage: 'es' });
  var doc = DocumentApp.openById(file.id);
  var texto = doc.getBody().getText();
  Drive.Files.remove(file.id);
  return texto;
}

function extraerDatosFacturaIA_(texto) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  if (!apiKey) throw new Error('Falta configurar OPENAI_API_KEY en las Propiedades del script.');

  var prompt = 'Eres un asistente contable de Ravell PH. Recibes el texto de una factura o ' +
    'cuenta de cobro y debes extraer SOLO estos campos en JSON, sin texto adicional: proveedor, ' +
    'nit_proveedor, concepto, valor_total (solo número, sin puntos ni símbolos), fecha_factura ' +
    '(formato YYYY-MM-DD), numero_factura. Si un campo no aparece, pon null.';

  var payload = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: texto }
    ],
    response_format: { type: 'json_object' }
  };

  var response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + apiKey },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var cuerpo = JSON.parse(response.getContentText());
  if (!cuerpo.choices) throw new Error('Respuesta inesperada de OpenAI: ' + response.getContentText());
  return JSON.parse(cuerpo.choices[0].message.content);
}

function registrarEnSheets_(datos) {
  var sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAME);
  sheet.appendRow([
    Utilities.formatDate(new Date(), 'America/Bogota', 'yyyy-MM-dd HH:mm'),
    datos.proveedor,
    datos.nit_proveedor,
    datos.concepto,
    datos.valor_total,
    datos.fecha_factura,
    datos.numero_factura,
    'Pendiente de revisión'
  ]);
}

function guardarPDFEnDrive_(attachment, datos) {
  var folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  var mes = datos.fecha_factura ? datos.fecha_factura.substring(0, 7) : 'sin-fecha';
  var subfolder = getOrCreateSubfolder_(folder, mes);
  var nombre = (datos.fecha_factura || 'sin-fecha') + '_' + (datos.proveedor || 'proveedor') + '.pdf';
  subfolder.createFile(attachment.copyBlob().setName(nombre));
}

function getOrCreateSubfolder_(parent, nombre) {
  var folders = parent.getFoldersByName(nombre);
  return folders.hasNext() ? folders.next() : parent.createFolder(nombre);
}

function notificarPorEmail_(datos) {
  var asunto = '✅ Factura registrada automáticamente - ' + datos.proveedor;
  var cuerpo = 'Proveedor: ' + datos.proveedor +
    '\nValor: $' + datos.valor_total +
    '\nConcepto: ' + datos.concepto +
    '\nFecha: ' + datos.fecha_factura +
    '\n\nQuedó guardada en Sheets y en Drive.';
  MailApp.sendEmail(CONFIG.EMAIL_NOTIFICACION, asunto, cuerpo);
}

function getOrCreateLabel_(nombre) {
  return GmailApp.getUserLabelByName(nombre) || GmailApp.createLabel(nombre);
}
