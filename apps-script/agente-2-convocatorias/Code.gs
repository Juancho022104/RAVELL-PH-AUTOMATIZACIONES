/**
 * Ravell PH - Agente 2 - Convocatorias 24/7 (Google Apps Script)
 *
 * Qué hace: cada 6 horas revisa RedPH, Revista PH Colombia y Ley de Propiedad
 * Horizontal buscando edificios que cambian de administrador, usa IA para
 * extraer las convocatorias, las cruza contra la lista de 60 edificios
 * objetivo, registra todo en Sheets y notifica a Yenny por correo solo
 * cuando hay coincidencia.
 *
 * Configuración inicial (ver README.md en esta misma carpeta):
 * 1. Reemplazar los valores "PENDIENTE_..." en CONFIG más abajo.
 * 2. En Configuración del proyecto → Propiedades del script → agregar
 *    OPENAI_API_KEY con tu API key de OpenAI.
 * 3. Crear la hoja de cálculo con las pestañas "60 Edificios Objetivo"
 *    (columnas: Edificio, Zona, ...) y "Convocatorias Detectadas" (columnas:
 *    Fecha detección, Edificio detectado, Zona/Dirección, Fecha publicación,
 *    Fuente, Link, ¿Coincide con lista objetivo?, Edificio objetivo, Estado).
 * 4. Crear un trigger de tiempo para monitorearConvocatorias() cada 6 horas
 *    (Activadores → Añadir activador → Basado en tiempo → Cada 6 horas).
 */

var CONFIG = {
  SHEET_ID: 'PENDIENTE_ID_HOJA_CRM_PROSPECCION',
  SHEET_OBJETIVO: '60 Edificios Objetivo',
  SHEET_DETECTADAS: 'Convocatorias Detectadas',
  EMAIL_NOTIFICACION: 'PENDIENTE_EMAIL_YENNY',
  FUENTES: [
    { nombre: 'RedPH', url: 'https://www.redph.com.co/convocatorias' },
    { nombre: 'Revista PH Colombia', url: 'https://convocatorias.revistaphcolombia.com' },
    { nombre: 'Ley de Propiedad Horizontal', url: 'https://leydepropiedadhorizontal.org/convocatorias' }
  ]
};

function monitorearConvocatorias() {
  var objetivo = leerEdificiosObjetivo_();
  var yaRegistrados = leerLinksYaRegistrados_();

  CONFIG.FUENTES.forEach(function (fuente) {
    try {
      var html = UrlFetchApp.fetch(fuente.url, { muteHttpExceptions: true }).getContentText();
      var texto = limpiarHtml_(html);
      var convocatorias = extraerConvocatoriasIA_(texto, fuente);

      convocatorias.forEach(function (c) {
        if (c.link && yaRegistrados.indexOf(c.link) !== -1) return;

        var match = buscarCoincidencia_(c.nombre_edificio, objetivo);
        registrarConvocatoria_(c, match);
        if (match) notificarConvocatoria_(c, match);
        if (c.link) yaRegistrados.push(c.link);
      });
    } catch (err) {
      Logger.log('Error en fuente ' + fuente.nombre + ': ' + err);
    }
  });
}

function limpiarHtml_(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 12000);
}

function extraerConvocatoriasIA_(texto, fuente) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  if (!apiKey) throw new Error('Falta configurar OPENAI_API_KEY en las Propiedades del script.');

  var prompt = 'Eres un asistente de inteligencia comercial para Ravell PH, empresa de ' +
    'administración de propiedad horizontal en Bogotá zona norte (Calle 72-100 y alrededores ' +
    'hacia el norte). Recibes el texto crudo de una página con convocatorias o avisos. Debes ' +
    'identificar SOLO convocatorias donde un edificio o conjunto residencial/comercial busca ' +
    'CAMBIAR o CONTRATAR un nuevo administrador de propiedad horizontal (no avisos de otro ' +
    'tipo). Devuelve SOLO un JSON con este formato, sin texto adicional: {"convocatorias": [ ' +
    '{ "nombre_edificio": string, "zona_o_direccion": string o null, "fecha_publicacion": ' +
    'string en formato YYYY-MM-DD o null, "link": string o null } ] }. Si no encuentras ' +
    'ninguna convocatoria relevante, devuelve {"convocatorias": []}.';

  var payload = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: 'Fuente: ' + fuente.nombre + '\nURL: ' + fuente.url + '\n\nTexto:\n' + texto }
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
  var resultado = JSON.parse(cuerpo.choices[0].message.content);

  return (resultado.convocatorias || []).map(function (c) {
    c.fuente = fuente.nombre;
    return c;
  });
}

function leerEdificiosObjetivo_() {
  var sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_OBJETIVO);
  var filas = sheet.getDataRange().getValues();
  var encabezados = filas.shift();
  var colEdificio = encabezados.indexOf('Edificio');
  var colZona = encabezados.indexOf('Zona');
  return filas
    .map(function (fila) { return { Edificio: fila[colEdificio], Zona: fila[colZona] }; })
    .filter(function (o) { return o.Edificio; });
}

function leerLinksYaRegistrados_() {
  var sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_DETECTADAS);
  var filas = sheet.getDataRange().getValues();
  var encabezados = filas.shift();
  var colLink = encabezados.indexOf('Link');
  if (colLink === -1) return [];
  return filas.map(function (fila) { return fila[colLink]; }).filter(String);
}

function normalizar_(texto) {
  return (texto || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function buscarCoincidencia_(nombreDetectado, objetivo) {
  var normalizado = normalizar_(nombreDetectado);
  if (!normalizado) return null;
  for (var i = 0; i < objetivo.length; i++) {
    var nombreObjetivo = normalizar_(objetivo[i].Edificio);
    if (nombreObjetivo && (normalizado.indexOf(nombreObjetivo) !== -1 || nombreObjetivo.indexOf(normalizado) !== -1)) {
      return objetivo[i];
    }
  }
  return null;
}

function registrarConvocatoria_(c, match) {
  var sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_DETECTADAS);
  sheet.appendRow([
    Utilities.formatDate(new Date(), 'America/Bogota', 'yyyy-MM-dd HH:mm'),
    c.nombre_edificio,
    c.zona_o_direccion,
    c.fecha_publicacion,
    c.fuente,
    c.link,
    match ? true : false,
    match ? match.Edificio : '',
    'Nueva'
  ]);
}

function notificarConvocatoria_(c, match) {
  var asunto = '📢 Nueva convocatoria detectada - ' + c.nombre_edificio;
  var cuerpo = 'Edificio: ' + c.nombre_edificio + ' (coincide con objetivo: ' + match.Edificio + ')' +
    '\nZona: ' + c.zona_o_direccion +
    '\nFuente: ' + c.fuente +
    '\nFecha: ' + c.fecha_publicacion +
    '\nLink: ' + c.link +
    '\n\nRevisar y contactar pronto.';
  MailApp.sendEmail(CONFIG.EMAIL_NOTIFICACION, asunto, cuerpo);
}
