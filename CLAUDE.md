# Proyecto: Automatización Ravell PH (n8n)

## Contexto de la empresa

- **RAVELL P.H. S.A.S. Soluciones Integrales** — Bogotá D.C., Colombia. Administración de propiedad horizontal.
- Gerente General: Yenny Ramírez Ramos, 13+ años de experiencia personal en administración de PH.
- **Cliente actual de la empresa: solo Terra 93** (~40 apartamentos, cliente desde 2025). Es el único cliente real — no confundir con la trayectoria personal de la gerente (8 edificios administrados por ella antes/en paralelo, que es su CV, no cartera de la empresa).
- Servicios: administración PH, gestión financiera y contable, suministro de personal operario de aseo.

## Objetivo de negocio

- Conseguir 2 nuevos edificios/clientes en 6 meses.
- Nicho: Bogotá zona norte (Calle 72-100 y alrededores hacia el norte), estrato 6, edificios residenciales/comerciales de 20-100 unidades.
- Orden de trabajo decidido: 1) matriz de tarifas (ya construida), 2) automatizaciones para todos los flujos de la empresa (fase actual), 3) de último, la consecución de los 2 clientes nuevos.

## Estado de la infraestructura técnica

- **n8n: aún no está instalado.** Falta decidir/montar n8n Cloud vs self-hosted (Docker).
- Sin CRM, sin página web, sin presencia en redes aún.

## Roadmap de agentes (prioridad)

1. **Agente de Facturas y Reportes (admin interna)** — EN CONSTRUCCIÓN. Workflow ya diseñado: Gmail (factura entra) → extraer texto del PDF → IA extrae proveedor/valor/concepto/fecha → registra en Google Sheets ("Gastos Terra 93") → guarda PDF en Drive organizado por mes → notifica a Yenny. El archivo `agente_facturas_reportes.json` (importable a n8n) ya está armado; falta configurar credenciales reales (Gmail, OpenAI, Sheets, Drive, y decidir WhatsApp vs email para la notificación final).
2. **Agente de convocatorias 24/7** — EN CONSTRUCCIÓN. Monitorea RedPH, convocatorias.revistaphcolombia.com y leydepropiedadhorizontal.org (cada 6h) buscando edificios que buscan cambiar de administrador; IA extrae convocatorias, cruza contra la lista de 60 edificios objetivo (Google Sheets), registra todo en "Convocatorias Detectadas" y notifica a Yenny solo cuando hay coincidencia. El archivo `agente_convocatorias.json` ya está armado; falta configurar credenciales reales (OpenAI, Sheets, WhatsApp), crear el spreadsheet con las hojas "60 Edificios Objetivo" y "Convocatorias Detectadas", y verificar los selectores CSS reales de cada sitio (el JSON extrae texto genérico del `body` como punto de partida).
3. Recordatorios de cartera Terra 93.
4. CRM de prospección para los 60 edificios objetivo (ya identificados, con columna "Administrador actual" pendiente de llenar vía RUA — https://tramite.gobiernobogota.gov.co/registro-unico-administradores/, requiere NIT/cédula/matrícula, no se puede scrapear por robots.txt).
5. Agente de contenido/redes sociales.

## Preferencias de trabajo

- Yenny está empezando a programar — explicar pasos técnicos con claridad, sin asumir experiencia previa.
- Prioriza automatización de administración interna antes que crecimiento comercial.
- Todo el contenido de negocio (cartas, matrices, brochures) se maneja en español.
