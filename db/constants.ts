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
  holdedFieldName: string;
  es: string;
  en: string;
  type: FieldType;
  options?: string[];
};

export type FieldGroup = {
  id: string;
  es: string;
  en: string;
  fields: Field[];
};

export type CoreGroup = {
  id: string;
  es: string;
  en: string;
  groups: FieldGroup[];
};

export const dataBaseTranslation: CoreGroup[] = [
  {
    id: "salesFields",
    es: "Campos de Ventas",
    en: "Sales Fields",
    groups: [
      {
        id: "sales",
        es: "Ventas",
        en: "Sales",
        fields: [
          {
            holdedFieldName: "VENTAS - Mes de Creación del Contacto",
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
          {
            holdedFieldName: "VENTAS - Año de Creación del Contacto",
            es: "Año de Creación del Contacto",
            en: "Year of Contact Creation",
            type: "selection",
            options: ["2021", "2022", "2023", "2024"],
          },
          {
            holdedFieldName: "VENTAS - Origen del Lead",
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
          {
            holdedFieldName: "VENTAS - Responsable Primer Contacto",
            es: "Responsable Primer Contacto",
            en: "First Contact Responsible",
            type: "selection",
            options: ["JORGE", "GUILLERMO", "PABLO", "PATRICIA"],
          },
          {
            holdedFieldName:
              "VENTAS - Responsable de Sesión Estratégica Inicial",
            es: "Responsable de Sesión Estratégica Inicial",
            en: "Initial Strategic Session Responsible",
            type: "selection",
            options: ["JORGE", "GUILLERMO", "PABLO", "PATRICIA"],
          },
          {
            holdedFieldName: "VENTAS - Plan de Crecimiento 360",
            es: "Plan de Crecimiento 360",
            en: "360 Growth Plan",
            type: "selection",
            options: ["START", "STEP", "GROW", "SUCCESS", "SCALE", "EXPANDING"],
          },
          {
            holdedFieldName: "VENTAS - Responsable de Sesión de Bienvenida",
            es: "Responsable de Sesión de Bienvenida",
            en: "Welcome Session Responsible",
            type: "selection",
            options: ["PATRICIA", "GUILLERMO", "JORGE", "PAULA"],
          },
        ],
      },
    ],
  },
  {
    id: "clientsFields",
    es: "Campos de Clientes",
    en: "Client Fields",
    groups: [
      {
        id: "client",
        es: "Cliente",
        en: "Client",
        fields: [
          {
            holdedFieldName: "CLIENTES - Etapa del Manager",
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
          {
            holdedFieldName: "CLIENTES - Etapa del Salón",
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
          {
            holdedFieldName: "CLIENTES - Número de Colaboradores",
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
          {
            holdedFieldName: "CLIENTES - Número de Salones",
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
          {
            holdedFieldName: "CLIENTES - Facturación Promedio Mensual",
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
        ],
      },
      {
        id: "insiders",
        es: "Insiders",
        en: "Insiders",
        fields: [
          {
            holdedFieldName: "CLIENTES - Estado del Cliente",
            es: "Estado del Cliente",
            en: "Client Status",
            type: "selection",
            options: ["ACTIVO", "BAJA", "STANDBY", "PRODUCTO ACTIVO"],
          },
          {
            holdedFieldName: "CLIENTES - Fecha de Alta",
            es: "Fecha de Alta",
            en: "Start Date",
            type: "date",
          },
          {
            holdedFieldName: "CLIENTES - Fecha de Baja",
            es: "Fecha de Baja",
            en: "End Date",
            type: "date",
          },
          {
            holdedFieldName: "CLIENTES - Insiders ID",
            es: "Insiders ID",
            en: "Insiders ID",
            type: "text",
          },
          {
            holdedFieldName: "CLIENTES - Fecha de Standby",
            es: "Fecha de Standby",
            en: "Standby Date",
            type: "date",
          },
          {
            holdedFieldName: "CLIENTES - Fecha de Fin de Servicios Activos",
            es: "Fecha de Fin de Servicios Activos",
            en: "End Date of Active Services",
            type: "date",
          },
        ],
      },
    ],
  },
  {
    id: "consultingAndMentoringFields",
    es: "Campos de Consultoría y Mentoría",
    en: "Consulting and Mentoring Fields",
    groups: [
      {
        id: "mentoring",
        es: "Mentoría",
        en: "Mentoring",
        fields: [
          {
            holdedFieldName: "MENTORING - Responsable",
            es: "Responsable",
            en: "Responsible",
            type: "selection",
            options: ["LORENA", "PEDRO", "AINHOA", "OIHANE", "JESÚS", "PABLO"],
          },
          {
            holdedFieldName: "MENTORING - Fecha de Alta",
            es: "Fecha de Alta",
            en: "Start Date",
            type: "date",
          },
          {
            holdedFieldName: "MENTORING - Fecha de Baja",
            es: "Fecha de Baja",
            en: "End Date",
            type: "date",
          },
        ],
      },
      {
        id: "mentoringExtra",
        es: "Mentoría Extra",
        en: "Mentoring Extra",
        fields: [
          {
            holdedFieldName: "MENTORING EXTRA - Nº Contratado",
            es: "Nº Contratado",
            en: "Contracted Nº",
            type: "number",
          },
          {
            holdedFieldName: "MENTORING EXTRA - Nº Realizado",
            es: "Nº Realizado",
            en: "Realized Nº",
            type: "number",
          },
          {
            holdedFieldName: "MENTORING EXTRA - Responsable",
            es: "Responsable",
            en: "Responsible",
            type: "selection",
            options: ["LORENA", "PEDRO", "AINHOA", "OIHANE", "JESÚS", "PABLO"],
          },
        ],
      },
      {
        id: "cm",
        es: "Consultoría y Mentoría",
        en: "Consulting and Mentoring",
        fields: [
          {
            holdedFieldName: "CM - Responsable",
            es: "Responsable",
            en: "Responsible",
            type: "selection",
            options: ["LORENA", "PEDRO", "AINHOA", "OIHANE", "JESÚS", "PABLO"],
          },
          {
            holdedFieldName: "CM - Fecha de Alta",
            es: "Fecha de Alta",
            en: "Start Date",
            type: "date",
          },
          {
            holdedFieldName: "CM - Fecha de Baja",
            es: "Fecha de Baja",
            en: "End Date",
            type: "date",
          },
        ],
      },
    ],
  },
  {
    id: "trainingsFields",
    es: "Campos de Capacitación",
    en: "Training Fields",
    groups: [
      {
        id: "consulting360",
        es: "Consultoría 360º",
        en: "Consulting 360º",
        fields: [
          {
            holdedFieldName: "CONSULTORÍA 360º - Edición",
            es: "Edición",
            en: "Edition",
            type: "selection",
            options: ["ED1 MAR-MAY24", "ED2 ABR-MAY24", "ED3 MAY-JUN24"],
          },
        ],
      },
      {
        id: "inpTraining",
        es: "Formación INP",
        en: "INP Training",
        fields: [
          {
            holdedFieldName: "FORMACIÓN INP - Edición",
            es: "Edición",
            en: "Edition",
            type: "selection",
            options: [
              "ED01 JUL24",
              "ED02 SEP24",
              "ED03 OCT24",
              "ED04 NOV24",
              "ED00 ANTIGUOS",
            ],
          },
        ],
      },
      {
        id: "insideClub",
        es: "Inside Club",
        en: "Inside Club",
        fields: [
          {
            holdedFieldName: "INSIDE CLUB - Fecha de Inicio",
            es: "Fecha de Inicio",
            en: "Start Date",
            type: "date",
          },
          {
            holdedFieldName: "INSIDE CLUB - Fecha de Fin",
            es: "Fecha de Fin",
            en: "End Date",
            type: "date",
          },
          {
            holdedFieldName: "INSIDE CLUB - Nivel",
            es: "Nivel",
            en: "Level",
            type: "selection",
            options: ["AVANZADO", "EXPERTO", "EMBAJADOR"],
          },
        ],
      },
      {
        id: "directiveManagement",
        es: "Gestión Directiva",
        en: "Directive Management",
        fields: [
          {
            holdedFieldName: "GESTIÓN DIRECTIVA - Fecha de Inicio",
            es: "Fecha de Inicio",
            en: "Start Date",
            type: "date",
          },
          {
            holdedFieldName: "GESTIÓN DIRECTIVA - Fecha de Fin",
            es: "Fecha de Fin",
            en: "End Date",
            type: "date",
          },
          {
            holdedFieldName: "GESTIÓN DIRECTIVA - Nivel",
            es: "Nivel",
            en: "Level",
            type: "selection",
            options: ["Nivel 1", "Nivel 2", "Nivel 3"],
          },
        ],
      },
      {
        id: "hypersalesSalon",
        es: "Salón Hiperventas",
        en: "Hypersales Salon",
        fields: [
          {
            holdedFieldName: "SALÓN HIPERVENTAS - Edición",
            es: "Edición",
            en: "Edition",
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
        ],
      },
      {
        id: "ibm",
        es: "IBM",
        en: "IBM",
        fields: [
          {
            holdedFieldName: "IBM - Edición",
            es: "Edición",
            en: "Edition",
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
        ],
      },
      {
        id: "starClub",
        es: "Star Club",
        en: "Star Club",
        fields: [
          {
            holdedFieldName: "STAR CLUB - Edición",
            es: "Edición",
            en: "Edition",
            type: "selection",
            options: [
              "ED01 SEP-DIC21",
              "ED02 ENE-ABR22",
              "ED03 SEP-DIC23",
              "ED04 SEP-DIC24",
            ],
          },
        ],
      },
      {
        id: "salonExperience",
        es: "Salón Experience",
        en: "Salon Experience",
        fields: [
          {
            holdedFieldName: "SALÓN EXPERIENCE - Edición",
            es: "Edición",
            en: "Edition",
            type: "selection",
            options: [
              "ED01 SEP-DIC21",
              "ED02 ENE-MAY23",
              "ED03 ENE-MAY24",
              "ED04 ENE-MAY25",
            ],
          },
        ],
      },
      {
        id: "scalingS",
        es: "Scaling-S",
        en: "Scaling-S",
        fields: [
          {
            holdedFieldName: "SCALING-S - Edición",
            es: "Edición",
            en: "Edition",
            type: "selection",
            options: [
              "ED01 ENE-MAR24",
              "ED02 ABR-MAY24",
              "ED03 MAY-JUN24",
              "ED04 JUN-JUL24",
              "ED05 SEP-OCT24",
            ],
          },
        ],
      },
      {
        id: "servicesMenu",
        es: "Menú de Servicios",
        en: "Services Menu",
        fields: [
          {
            holdedFieldName: "MENÚ DE SERVICIOS - Edición",
            es: "Edición",
            en: "Edition",
            type: "selection",
            options: ["ED01 2023", "ED02 ENE24", "ED03 MAR24", "ED04 JUN24"],
          },
        ],
      },
    ],
  },
  {
    id: "marketingFields",
    es: "Campos de Marketing",
    en: "Marketing Fields",
    groups: [
      {
        id: "salonMarketing",
        es: "Marketing Salón",
        en: "Salon Marketing",
        fields: [
          {
            holdedFieldName: "MARKETING SALÓN - Fecha de Inicio",
            es: "Fecha de Inicio",
            en: "Start Date",
            type: "date",
          },
          {
            holdedFieldName: "MARKETING SALÓN - Fecha de Fin",
            es: "Fecha de Fin",
            en: "End Date",
            type: "date",
          },
          {
            holdedFieldName: "MARKETING SALÓN - Nivel",
            es: "Nivel",
            en: "Level",
            type: "selection",
            options: ["Nivel 1", "Nivel 2", "Nivel 3"],
          },
          {
            holdedFieldName: "MARKETING SALÓN - Meses NUEVOS",
            es: "Meses NUEVOS",
            en: "NEW Months",
            type: "selection",
            options: [
              "ENE23",
              "FEB23",
              "MAR23",
              "ABR23",
              "MAY23",
              "JUN23",
              "JUL23",
              "AGO23",
              "SEP23",
              "OCT23",
              "NOV23",
              "DIC23",
              "ENE24",
              "FEB24",
              "MAR24",
              "ABR24",
              "MAY24",
              "JUN24",
              "JUL24",
              "AGO24",
              "SEP24",
              "OCT24",
              "NOV24",
              "DIC24",
              "ENE25",
              "FEB25",
              "MAR25",
              "ABR25",
              "MAY25",
              "JUN25",
              "JUL25",
              "AGO25",
              "SEP25",
              "OCT25",
            ],
          },
          {
            holdedFieldName: "MARKETING SALÓN - Meses JUNIOR",
            es: "Meses JUNIOR",
            en: "JUNIOR Months",
            type: "selection",
            options: [
              "ENE23",
              "FEB23",
              "MAR23",
              "ABR23",
              "MAY23",
              "JUN23",
              "JUL23",
              "AGO23",
              "SEP23",
              "OCT23",
              "NOV23",
              "DIC23",
              "ENE24",
              "FEB24",
              "MAR24",
              "ABR24",
              "MAY24",
              "JUN24",
              "JUL24",
              "AGO24",
              "SEP24",
              "OCT24",
              "NOV24",
              "DIC24",
              "ENE25",
              "FEB25",
              "MAR25",
              "ABR25",
              "MAY25",
              "JUN25",
              "JUL25",
              "AGO25",
              "SEP25",
              "OCT25",
            ],
          },
          {
            holdedFieldName: "MARKETING SALÓN - Meses AVANZADO",
            es: "Meses AVANZADO",
            en: "ADVANCED Months",
            type: "selection",
            options: [
              "ENE23",
              "FEB23",
              "MAR23",
              "ABR23",
              "MAY23",
              "JUN23",
              "JUL23",
              "AGO23",
              "SEP23",
              "OCT23",
              "NOV23",
              "DIC23",
              "ENE24",
              "FEB24",
              "MAR24",
              "ABR24",
              "MAY24",
              "JUN24",
              "JUL24",
              "AGO24",
              "SEP24",
              "OCT24",
              "NOV24",
              "DIC24",
              "ENE25",
              "FEB25",
              "MAR25",
              "ABR25",
              "MAY25",
              "JUN25",
              "JUL25",
              "AGO25",
              "SEP25",
              "OCT25",
            ],
          },
          {
            holdedFieldName: "MARKETING SALÓN - Meses MÁSTER",
            es: "Meses MÁSTER",
            en: "MASTER Months",
            type: "selection",
            options: [
              "ENE23",
              "FEB23",
              "MAR23",
              "ABR23",
              "MAY23",
              "JUN23",
              "JUL23",
              "AGO23",
              "SEP23",
              "OCT23",
              "NOV23",
              "DIC23",
              "ENE24",
              "FEB24",
              "MAR24",
              "ABR24",
              "MAY24",
              "JUN24",
              "JUL24",
              "AGO24",
              "SEP24",
              "OCT24",
              "NOV24",
              "DIC24",
              "ENE25",
              "FEB25",
              "MAR25",
              "ABR25",
              "MAY25",
              "JUN25",
              "JUL25",
              "AGO25",
              "SEP25",
              "OCT25",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "creativitiesFields",
    es: "Campos de Creatividades",
    en: "Creativity Fields",
    groups: [
      {
        id: "brandCreation",
        es: "Creación de Marca",
        en: "Brand Creation",
        fields: [
          {
            holdedFieldName: "CREACIÓN DE MARCA - Fecha de Inicio",
            es: "Fecha de Inicio",
            en: "Start Date",
            type: "date",
          },
        ],
      },
      {
        id: "brandDesign",
        es: "Diseño de Marca",
        en: "Brand Design",
        fields: [
          {
            holdedFieldName: "DISEÑO DE MARCA - Fecha de Inicio",
            es: "Fecha de Inicio",
            en: "Start Date",
            type: "date",
          },
        ],
      },
      {
        id: "brandDevelopment",
        es: "Desarrollo de Marca",
        en: "Brand Development",
        fields: [
          {
            holdedFieldName: "DESARROLLO DE MARCA - Fecha de Inicio",
            es: "Fecha de Inicio",
            en: "Start Date",
            type: "date",
          },
        ],
      },
      {
        id: "logoCreation",
        es: "Creación de Logotipo",
        en: "Logo Creation",
        fields: [
          {
            holdedFieldName: "CREACIÓN DE LOGOTIPO - Fecha de Inicio",
            es: "Fecha de Inicio",
            en: "Start Date",
            type: "date",
          },
        ],
      },
      {
        id: "facadeDesign",
        es: "Diseño de Fachada",
        en: "Facade Design",
        fields: [
          {
            holdedFieldName: "DISEÑO DE FACHADA - Fecha de Inicio",
            es: "Fecha de Inicio",
            en: "Start Date",
            type: "date",
          },
        ],
      },
      {
        id: "interiorDesign",
        es: "Diseño de Interiorismo",
        en: "Interior Design",
        fields: [
          {
            holdedFieldName: "DISEÑO DE INTERIORISMO - Fecha de Inicio",
            es: "Fecha de Inicio",
            en: "Start Date",
            type: "date",
          },
        ],
      },
      {
        id: "webDesign",
        es: "Diseño Web",
        en: "Web Design",
        fields: [
          {
            holdedFieldName: "DISEÑO WEB - Fecha de Inicio",
            es: "Fecha de Inicio",
            en: "Start Date",
            type: "date",
          },
        ],
      },
    ],
  },
];

export const getFieldNames = (groupId: string) => {
  const group = dataBaseTranslation.find((g) => g.id === groupId);
  if (!group) return [];
  return group.groups.flatMap((g) => g.fields.map((f) => f.holdedFieldName));
};

export const salesFields = getFieldNames("salesFields");
export const clientsFields = getFieldNames("clientsFields");
export const consultingAndMentoringFields = getFieldNames(
  "consultingAndMentoringFields"
);
export const trainingsFields = getFieldNames("trainingsFields");
export const marketingFields = getFieldNames("marketingFields");
export const creativitiesFields = getFieldNames("creativitiesFields");
