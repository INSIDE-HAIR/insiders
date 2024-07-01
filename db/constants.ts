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

export type FieldType = "selection" | "date" | "text" | "number";

export type Field = {
  id: string;
  es: string;
  en: string;
  type: FieldType;
  options?: string[];
};

export const dataBaseTranslation: {
  salesFields: Record<string, Field>;
  clientFields: Record<string, Field>;
  servicesFields: Record<string, Record<string, Field>>;
  creativityFields: Record<string, Record<string, Field>>;
} = {
  salesFields: {
    VENTASMesDeCreacionDelContacto: {
      id: "VENTASMesDeCreacionDelContacto",
      es: "Mes de Creación del Contacto",
      en: "Month of Contact Creation",
      type: "selection",
      options: [
        "ENERO",
        "FEBRERO",
        "MARZO",
        "ABRIL",
        "MAYO",
        "JUNIO",
        "JULIO",
        "AGOSTO",
        "SEPTIEMBRE",
        "OCTUBRE",
        "NOVIEMBRE",
        "DICIEMBRE",
      ],
    },
    VENTASAnoDeCreacionDelContacto: {
      id: "VENTASAnoDeCreacionDelContacto",
      es: "Año de Creación del Contacto",
      en: "Year of Contact Creation",
      type: "selection",
      options: ["2021", "2022", "2023", "2024"],
    },
    VENTASOrigenDelLead: {
      id: "VENTASOrigenDelLead",
      es: "Origen del Lead",
      en: "Lead Source",
      type: "selection",
      options: [
        "Instagram",
        "Facebook",
        "Youtube",
        "TikTok",
        "Webinar",
        "Referencia de Cliente",
        "Referencia de Proveedor",
        "Referencia de otros contactos del sector",
        "Webinar Automático",
        "Sorteo",
        "Ads",
        "Google",
        "Web",
        "Schwarzkopf",
      ],
    },
    VENTASResponsablePrimerContacto: {
      id: "VENTASResponsablePrimerContacto",
      es: "Responsable Primer Contacto",
      en: "First Contact Responsible",
      type: "selection",
      options: ["JORGE", "GUILLERMO", "PABLO", "PATRICIA"],
    },
    VENTASResponsableDeSesionEstrategicaInicial: {
      id: "VENTASResponsableDeSesionEstrategicaInicial",
      es: "Responsable de Sesión Estratégica Inicial",
      en: "Initial Strategic Session Responsible",
      type: "selection",
      options: ["JORGE", "GUILLERMO", "PABLO", "PATRICIA"],
    },
    VENTASPlanDeCrecimiento360: {
      id: "VENTASPlanDeCrecimiento360",
      es: "Plan de Crecimiento 360",
      en: "360 Growth Plan",
      type: "selection",
      options: ["START", "STEP", "GROW", "SUCCESS", "SCALE", "EXPANDING"],
    },
    VENTASResponsableDeSesionDeBienvenida: {
      id: "VENTASResponsableDeSesionDeBienvenida",
      es: "Responsable de Sesión de Bienvenida",
      en: "Welcome Session Responsible",
      type: "selection",
      options: ["PATRICIA", "GUILLERMO", "JORGE", "PAULA"],
    },
  },
  clientFields: {
    CLIENTESEstadoDelCliente: {
      id: "CLIENTESEstadoDelCliente",
      es: "Estado del Cliente",
      en: "Client Status",
      type: "selection",
      options: ["ACTIVO", "BAJA", "STANDBY", "PRODUCTO ACTIVO"],
    },
    CLIENTESEtapaDelManager: {
      id: "CLIENTESEtapaDelManager",
      es: "Etapa del Manager",
      en: "Manager Stage",
      type: "selection",
      options: [
        "Principiante",
        "Avanzado",
        "Especialista",
        "Experto",
        "Master",
        "Embajador",
      ],
    },
    CLIENTESEtapaDelSalon: {
      id: "CLIENTESEtapaDelSalon",
      es: "Etapa del Salón",
      en: "Salon Stage",
      type: "selection",
      options: [
        "START UP",
        "STEP UP",
        "GROW UP",
        "SCALE UP",
        "EXPANDING",
        "SALÓN NUEVO",
        "VALLE DE LA MUERTE",
      ],
    },
    CLIENTESNumeroDeColaboradores: {
      id: "CLIENTESNumeroDeColaboradores",
      es: "Número de Colaboradores",
      en: "Number of Collaborators",
      type: "selection",
      options: [
        "1",
        "1.5",
        "2",
        "2.5",
        "3",
        "3.5",
        "4",
        "4.5",
        "5",
        "5.5",
        "6",
        "6.5",
        "7",
        "7.5",
        "8",
        "8.5",
        "9",
        "9.5",
        "10",
        "10-50",
        "50-250",
        ">250",
      ],
    },
    CLIENTESNumeroDeSalones: {
      id: "CLIENTESNumeroDeSalones",
      es: "Número de Salones",
      en: "Number of Salons",
      type: "selection",
      options: [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "10-20",
        ">20",
      ],
    },
    CLIENTESFacturacionPromedioMensual: {
      id: "CLIENTESFacturacionPromedioMensual",
      es: "Facturación Promedio Mensual",
      en: "Average Monthly Billing",
      type: "selection",
      options: [
        "0-4K",
        "4K-8K",
        "8K-12K",
        "12K-16K",
        "16K-20K",
        "20K-30K",
        "30K-40K",
        "40K-50K",
        "50K-60K",
        "60K-100K",
        "100K-150K",
        "150K-200K",
        ">200K",
      ],
    },
    CLIENTESFechaDeAlta: {
      id: "CLIENTESFechaDeAlta",
      es: "Fecha de Alta",
      en: "Start Date",
      type: "date",
    },
    CLIENTESFechaDeBaja: {
      id: "CLIENTESFechaDeBaja",
      es: "Fecha de Baja",
      en: "End Date",
      type: "date",
    },
    CLIENTESInsidersID: {
      id: "CLIENTESInsidersID",
      es: "Insiders ID",
      en: "Insiders ID",
      type: "text",
    },
    CLIENTESFechaDeStandby: {
      id: "CLIENTESFechaDeStandby",
      es: "Fecha de Standby",
      en: "Standby Date",
      type: "date",
    },
    CLIENTESFechaDeFinDeServiciosActivos: {
      id: "CLIENTESFechaDeFinDeServiciosActivos",
      es: "Fecha de Fin de Servicios Activos",
      en: "End Date of Active Services",
      type: "date",
    },
  },
  servicesFields: {
    consultoriaMentoring: {
      MENTORINGResponsable: {
        id: "MENTORINGResponsable",
        es: "MENTORING - Responsable",
        en: "MENTORING - Responsible",
        type: "selection",
        options: ["LORENA", "PEDRO", "AINHOA", "OIHANE", "JESÚS", "PABLO"],
      },
      MENTORINGFechaDeAlta: {
        id: "MENTORINGFechaDeAlta",
        es: "MENTORING - Fecha de Alta",
        en: "MENTORING - Start Date",
        type: "date",
      },
      MENTORINGFechaDeBaja: {
        id: "MENTORINGFechaDeBaja",
        es: "MENTORING - Fecha de Baja",
        en: "MENTORING - End Date",
        type: "date",
      },
      MENTORINGEXTRANumeroContratado: {
        id: "MENTORINGEXTRANumeroContratado",
        es: "MENTORING EXTRA - Nº Contratado",
        en: "MENTORING EXTRA - Contracted Nº",
        type: "number",
      },
      MENTORINGEXTRANumeroRealizado: {
        id: "MENTORINGEXTRANumeroRealizado",
        es: "MENTORING EXTRA - Nº Realizado",
        en: "MENTORING EXTRA - Realized Nº",
        type: "number",
      },
      MENTORINGEXTRAResponsable: {
        id: "MENTORINGEXTRAResponsable",
        es: "MENTORING EXTRA - Responsable",
        en: "MENTORING EXTRA - Responsible",
        type: "selection",
        options: ["LORENA", "PEDRO", "AINHOA", "OIHANE", "JESÚS", "PABLO"],
      },
      CMResponsable: {
        id: "CMResponsable",
        es: "CM - Responsable",
        en: "CM - Responsible",
        type: "selection",
        options: ["LORENA", "PEDRO", "AINHOA", "OIHANE", "JESÚS", "PABLO"],
      },
      CMFechaDeAlta: {
        id: "CMFechaDeAlta",
        es: "CM - Fecha de Alta",
        en: "CM - Start Date",
        type: "date",
      },
      CMFechaDeBaja: {
        id: "CMFechaDeBaja",
        es: "CM - Fecha de Baja",
        en: "CM - End Date",
        type: "date",
      },
    },
    formaciones: {
      FORMACIONINPEdicion: {
        id: "FORMACIONINPEdicion",
        es: "FORMACIÓN INP - Edición",
        en: "INP TRAINING - Edition",
        type: "selection",
        options: [
          "ED01 JUL24",
          "ED02 SEP24",
          "ED03 OCT24",
          "ED04 NOV24",
          "ED00 ANTIGUOS",
        ],
      },
      INSIDECLUBFechaDeInicio: {
        id: "INSIDECLUBFechaDeInicio",
        es: "INSIDE CLUB - Fecha de Inicio",
        en: "INSIDE CLUB - Start Date",
        type: "date",
      },
      INSIDECLUBFechaDeFin: {
        id: "INSIDECLUBFechaDeFin",
        es: "INSIDE CLUB - Fecha de Fin",
        en: "INSIDE CLUB - End Date",
        type: "date",
      },
      INSIDECLUBNivel: {
        id: "INSIDECLUBNivel",
        es: "INSIDE CLUB - Nivel",
        en: "INSIDE CLUB - Level",
        type: "selection",
        options: ["Nivel 1", "Nivel 2", "Nivel 3"],
      },
      GESTIONDIRECTIVAFechaDeInicio: {
        id: "GESTIONDIRECTIVAFechaDeInicio",
        es: "GESTIÓN DIRECTIVA - Fecha de Inicio",
        en: "DIRECTIVE MANAGEMENT - Start Date",
        type: "date",
      },
      GESTIONDIRECTIVAFechaDeFin: {
        id: "GESTIONDIRECTIVAFechaDeFin",
        es: "GESTIÓN DIRECTIVA - Fecha de Fin",
        en: "DIRECTIVE MANAGEMENT - End Date",
        type: "date",
      },
      GESTIONDIRECTIVALevel: {
        id: "GESTIONDIRECTIVALevel",
        es: "GESTIÓN DIRECTIVA - Nivel",
        en: "DIRECTIVE MANAGEMENT - Level",
        type: "selection",
        options: ["Nivel 1", "Nivel 2", "Nivel 3"],
      },
      SALONHIPERVENTASEdicion: {
        id: "SALONHIPERVENTASEdicion",
        es: "SALÓN HIPERVENTAS - Edición",
        en: "HYPERSALES SALON - Edition",
        type: "selection",
        options: [
          "ED01 FEB24",
          "ED02 MAR24",
          "ED03 ABR24",
          "ED04 MAY-SEP24",
          "ED05 JUN-OCT24",
          "ED06 JUL-NOV24",
          "ED07 SEP24-ENE25",
          "ED08 OCT24-FEB25",
          "ED09 NOV24-MAR25",
        ],
      },
      IBMedicion: {
        id: "IBMedicion",
        es: "IBM - Edición",
        en: "IBM - Edition",
        type: "selection",
        options: [
          "ED01 ENE-ABR21",
          "ED02 ENE-ABR22",
          "ED03 ABR-JUL22",
          "ED04 SEP-DIC22",
          "ED05 ENE-MAR23",
          "ED06 ABR-JUL23",
          "ED07 SEP-DIC23",
          "ED08 ENE-MAR24",
          "ED09 SEP-DIC24",
        ],
      },
      STARCLUBEdicion: {
        id: "STARCLUBEdicion",
        es: "STAR CLUB - Edición",
        en: "STAR CLUB - Edition",
        type: "selection",
        options: [
          "ED01 SEP-DIC21",
          "ED02 ENE-ABR22",
          "ED03 SEP-DIC23",
          "ED04 SEP-DIC24",
        ],
      },
      SALONEXPERIENCEEdicion: {
        id: "SALONEXPERIENCEEdicion",
        es: "SALÓN EXPERIENCE - Edición",
        en: "SALON EXPERIENCE - Edition",
        type: "selection",
        options: [
          "ED01 SEP-DIC21",
          "ED02 ENE-MAY23",
          "ED03 ENE-MAY24",
          "ED04 ENE-MAY25",
        ],
      },
      SCALINGSEdicion: {
        id: "SCALINGSEdicion",
        es: "SCALING-S - Edición",
        en: "SCALING-S - Edition",
        type: "selection",
        options: [
          "ED01 ENE-MAR24",
          "ED02 ABR-MAY24",
          "ED03 MAY-JUN24",
          "ED04 JUN-JUL24",
          "ED05 SEP-OCT24",
        ],
      },
      MENUSERVICIOSEdicion: {
        id: "MENUSERVICIOSEdicion",
        es: "MENÚ DE SERVICIOS - Edición",
        en: "SERVICES MENU - Edition",
        type: "selection",
        options: ["ED01 2023", "ED02 ENE24", "ED03 MAR24", "ED04 JUN24"],
      },
    },
    consultoria360: {
      CONSULTORIA360Edicion: {
        id: "CONSULTORIA360Edicion",
        es: "CONSULTORÍA 360º - Edición",
        en: "CONSULTING 360º - Edition",
        type: "selection",
        options: ["ED1 MAR-MAY24", "ED2 ABR-MAY24", "ED3 MAY-JUN24"],
      },
    },
  },
  creativityFields: {
    brandCreation: {
      CREACIONDEMARCAFechaDeInicio: {
        id: "CREACIONDEMARCAFechaDeInicio",
        es: "CREACIÓN DE MARCA - Fecha de Inicio",
        en: "BRAND CREATION - Start Date",
        type: "date",
      },
      DISENODEMARCAFechaDeInicio: {
        id: "DISENODEMARCAFechaDeInicio",
        es: "DISEÑO DE MARCA - Fecha de Inicio",
        en: "BRAND DESIGN - Start Date",
        type: "date",
      },
      DESARROLLODEMARCAFechaDeInicio: {
        id: "DESARROLLODEMARCAFechaDeInicio",
        es: "DESARROLLO DE MARCA - Fecha de Inicio",
        en: "BRAND DEVELOPMENT - Start Date",
        type: "date",
      },
      CREACIONDELOGOTIPOFechaDeInicio: {
        id: "CREACIONDELOGOTIPOFechaDeInicio",
        es: "CREACIÓN DE LOGOTIPO - Fecha de Inicio",
        en: "LOGO CREATION - Start Date",
        type: "date",
      },
      DISENODEFACHADAFechaDeInicio: {
        id: "DISENODEFACHADAFechaDeInicio",
        es: "DISEÑO DE FACHADA - Fecha de Inicio",
        en: "FACADE DESIGN - Start Date",
        type: "date",
      },
      DISENODEINTERIORISMOFechaDeInicio: {
        id: "DISENODEINTERIORISMOFechaDeInicio",
        es: "DISEÑO DE INTERIORISMO - Fecha de Inicio",
        en: "INTERIOR DESIGN - Start Date",
        type: "date",
      },
      DISENOWEBFechaDeInicio: {
        id: "DISENOWEBFechaDeInicio",
        es: "DISEÑO WEB - Fecha de Inicio",
        en: "WEB DESIGN - Start Date",
        type: "date",
      },
    },
  },
};
