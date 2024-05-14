export const langCodes = {
  "01": "ES",
  "02": "CA",
  // más códigos según sea necesario
};

export const filesCodes = {
  "0000": "Vinilos Puerta",
  "0080": "Carteles 80x120cm",
  "0050": "Carteles 50x70cm",
  "0004": "Carteles A4 21x29,7cm",
  "0005": "Carteles A5 14,8x21cm",
  "0085": "Tarjetas",
  "0048": "Dípticos/Trípticos",
  "0010": "Tests",
  "0100": "Revistas",
  "0360": "Escaparatismo",
  "0300": "Pop Ups",
  "0090": "GMB",
  "0216": "Videos",
  "1111": "Listas de Control",
  "1080": "Posts de Acción",
  "0192": "Posts Mensuales",
  "1920": "Stories Acción",
  "0129": "Stories Mensuales",
  "0002": "Guías",
  "0500": "Filtros de Instagram",
  "6969": "SMS/WhatsApp",
  "0009": "Logotipos para Camisetas y Bolsas",
  "0003": "Presentaciones",
  "1602": "Cartel Animado",
  "0087": "Escaparate",
  "0057": "Horizontal Josep Pons",
  "0330": "Pegatinas",
  "0014": "Carteles A4 21x29,7cm",
  "0015": "Carteles A5 14,8x21cm",
  "0024": "Carteles A4 21x29,7cm",
  "0025": "Carteles A5 14,8x21cm"
  // más códigos según sea necesario
};

export const clientsCodes = {
  A: "insiders",
  B: "salon-toro",
  C: "toni-and-guy",
  D: "ah-peluqueros",
  E: "josep-pons",
  // más códigos según sea necesario
};

export const campaignCodes = {
  A: "campaign",
  B: "primelady",
  C: "start-marketing",
  // más códigos según sea necesario
};

export const contentTypes = {
  physicalContent: {
    posters: ["0080", "0050", "0004", "0005"],
    stoppers: ["0000"],
    tests: ["0010", "0025"],
    cards: ["0085"],
    extras: ["0360", "0100", "0048", "0300", "0009"],
  },
  digitalContent: {
    actionPosts: ["1080"],
    actionStories: ["1920"],
    monthlyPost: ["0192"],
    monthlyStories: ["0129"],
    smsAndWhatsApp: ["6969"],
    videos: ["0216"],
    extras: ["0500", "1602"],
  },
  // más códigos según sea necesario
};

export const serviceOptions = [
  {
    id: "marketingServices",
    name: "Marketing",
    order: 1,
    services: [
      { id: "marketingSalon", name: "Marketing Salón", order: 1 },
      { id: "guiaMarketingDigital", name: "Guía Marketing Digital", order: 2 },
      { id: "startMarketing", name: "Start Marketing", order: 3 },
      { id: "teams", name: "Teams", order: 4 },
    ],
  },
  {
    id: "formationServices",
    name: "Formaciones",
    order: 2,
    services: [
      { id: "scalingS", name: "Scaling-S", order: 1 },
      { id: "salonHiperventas", name: "Salón Hiperventas", order: 2 },
      { id: "consultoria360", name: "Consultoría 360º", order: 3 },
      { id: "ibm", name: "IBM", order: 4 },
      { id: "starClub", name: "Star Club", order: 5 },
      { id: "salonExperience", name: "Salón Experience", order: 6 },
    ],
  },
  {
    id: "mentoringServices",
    name: "Consultoría",
    order: 3,
    services: [
      { id: "gestionDirectiva", name: "Gestión Directiva", order: 1 },
      { id: "sesionesIndividuales", name: "Sesiones Individuales", order: 2 },
      { id: "insideClub", name: "INSIDE Club", order: 3 },
      { id: "consultoriasGrupales", name: "Consultorías Grupales", order: 4 },
    ],
  },
  {
    id: "toolsServices",
    name: "Herramientas",
    order: 4,
    services: [{ id: "menuServicios", name: "Menú de Servicios", order: 1 }],
  },
];
