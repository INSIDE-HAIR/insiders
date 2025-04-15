export const langCodes = {
  "01": "ES",
  "02": "CA",
  // más códigos según sea necesario
};

export const filesCodes = {
  "0000": "Vinilo Puerta",
  "0080": "Cartel 80x120cm",
  "0050": "Cartel 50x70cm",
  "0004": "Cartel A4 21x29,7cm",
  "0005": "Cartel A5 14,8x21cm",
  "0085": "Tarjeta",
  "0048": "Díptico/Tríptico",
  "0010": "Test Peluquero",
  "0011": "Test Cliente",
  "0012": "Test Salón",
  "0100": "Revista",
  "0360": "Escaparatismo",
  "0300": "Pop Up",
  "0090": "GMB",
  "0216": "Móvil", // Video Móvil
  "0217": "Televisión", // Video TV
  "1111": "Lista de Control de Manager",
  "1112": "Lista de Control de Colaborador",
  "1080": "Post", // Post de Acción
  "0192": "Post", // Post Mensual
  "1920": "Story", // Story de Acción
  "0129": "Story", // Story Mensual
  "0002": "Guía",
  "0500": "Filtro de Instagram",
  "6969": "SMS/WhatsApp",
  "0009": "Logotipo para Camiseta y Bolsa",
  "0003": "Presentación",
  "1602": "Cartel Animado",
  "0087": "Escaparate",
  "0057": "Horizontal", //Josep Pons
  "0330": "Pegatina",
  "0014": "Cartel A4 21x29,7cm",
  "0015": "Cartel A5 14,8x21cm",
  "0024": "Cartel A4 21x29,7cm",
  "0025": "Cartel A5 14,8x21cm",
  "0248": "Díptico",
  "0348": "Tríptico",
  "0249": "Díptico Transparente",
  "1109": "Semana 1", // Stories Semanales 1
  "2109": "Semana 2", // Stories Semanales 2
  "3109": "Semana 3", // Stories Semanales 3
  "4109": "Semana 4", // Stories Semanales 4
  "1600": "Cartel 1200x600",
  "1500": "Cartel 1500x1000",
  "0032": "Plan de Color",
  "0880": "Porta Tarjetas",
  "0420": "Guía de visagismo",
};

export const clientsCodes = {
  A: "insiders",
  B: "salon-toro",
  C: "toni-and-guy",
  D: "ah-peluqueros",
  E: "josep-pons",
  F: "latam",
  G: "ritape",
  // más códigos según sea necesario
};

export const campaignCodes = {
  A: "campaign",
  B: "primelady",
  C: "start-marketing",
  // más códigos según sea necesario
};

export interface DecodedFile {
  client: string;
  campaign: string;
  category: string;
  lang: string;
  version: string;
  fullName: string;
  year: string;
  month: string;
}

export function decodeFileName(fileName: string): DecodedFile | null {
  // Eliminar "Copia de " si existe
  const cleanName = fileName.replace(/^Copia de /, "");

  // Intentar extraer el código del formato A-A-2503-0002-01-00-01.pdf
  const regex =
    /([A-Z])-([A-Z])-(\d{4})-(\d{4})-(\d{2})-(\d{2})-(\d{2})(?:-P\d+)?/;
  const match = cleanName.match(regex);

  if (!match) return null;

  const [
    ,
    clientsCode,
    campaignCode,
    yearMonthCode,
    fileCode,
    langCode,
    ,
    version,
  ] = match;

  const client =
    clientsCodes[clientsCode as keyof typeof clientsCodes] || "Desconocido";
  const campaign =
    campaignCodes[campaignCode as keyof typeof campaignCodes] || "Desconocido";
  const category =
    filesCodes[fileCode.substring(0, 4) as keyof typeof filesCodes] ||
    "Desconocido";
  const lang = langCodes[langCode as keyof typeof langCodes] || "Desconocido";

  // Extraer año y mes del código
  const year = "20" + yearMonthCode.substring(0, 2);
  const month = yearMonthCode.substring(2, 4);

  // Nombres de los meses para mostrar
  const monthNames = {
    "01": "Enero",
    "02": "Febrero",
    "03": "Marzo",
    "04": "Abril",
    "05": "Mayo",
    "06": "Junio",
    "07": "Julio",
    "08": "Agosto",
    "09": "Septiembre",
    "10": "Octubre",
    "11": "Noviembre",
    "12": "Diciembre",
  };

  const monthName = monthNames[month as keyof typeof monthNames] || month;

  // Extraer la extensión del archivo original
  const extension = fileName.split(".").pop() || "";

  // Crear un nombre de archivo más descriptivo para la descarga
  const downloadName = `${category}-${lang}-v${version}${
    extension ? "." + extension : ""
  }`;

  return {
    client,
    campaign,
    category,
    lang,
    version,
    fullName: downloadName,
    year,
    month: monthName,
  };
}
