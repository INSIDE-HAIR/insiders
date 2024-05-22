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
    tests: ["0010", "0011", "0025"],
    cards: ["0085"],
    extras: ["0360", "0100", "0048", "0300", "0009"],
  },
  digitalContent: {
    actionPosts: ["1080"],
    actionStories: ["1920"],
    monthlyPost: ["0192"],
    monthlyStories: ["0129"],
    smsAndWhatsApp: ["6969"],
    videos: ["0216", "0217"],
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
