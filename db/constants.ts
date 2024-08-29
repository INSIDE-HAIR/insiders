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
      { id: "salonMarketing", name: "Marketing Salón", order: 1 },
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
  subCategoryId: string;
  type: FieldType;
  options?: string[];
};

export type FieldGroup = {
  id: string;
  fields: Field[];
};

export type CoreGroup = {
  id: string;
  groups: FieldGroup[];
};

export const dataBaseTranslation: CoreGroup[] = [
  {
    id: "salesFields",
    groups: [
      {
        id: "sales",
        fields: [
          {
            holdedFieldName: "VENTAS - Mes de Creación del Contacto",
            subCategoryId: "sales",
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
            subCategoryId: "sales",
            type: "selection",
            options: ["2021", "2022", "2023", "2024"],
          },
          {
            holdedFieldName: "VENTAS - Origen del Lead",
            subCategoryId: "sales",
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
            subCategoryId: "sales",
            type: "selection",
            options: ["JORGE", "GUILLERMO", "PABLO", "PATRICIA"],
          },
          {
            holdedFieldName:
              "VENTAS - Responsable de Sesión Estratégica Inicial",
            subCategoryId: "sales",
            type: "selection",
            options: ["JORGE", "GUILLERMO", "PABLO", "PATRICIA"],
          },
          {
            holdedFieldName: "VENTAS - Plan de Crecimiento 360",
            subCategoryId: "sales",
            type: "selection",
            options: ["START", "STEP", "GROW", "SUCCESS", "SCALE", "EXPANDING"],
          },
          {
            holdedFieldName: "VENTAS - Responsable de Sesión de Bienvenida",
            subCategoryId: "sales",
            type: "selection",
            options: ["PATRICIA", "GUILLERMO", "JORGE", "PAULA"],
          },
        ],
      },
    ],
  },
  {
    id: "clientsFields",
    groups: [
      {
        id: "client",
        fields: [
          {
            holdedFieldName: "CLIENTES - Etapa del Manager",
            subCategoryId: "client",
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
            subCategoryId: "client",
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
            subCategoryId: "client",
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
            subCategoryId: "client",
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
            subCategoryId: "client",
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
        fields: [
          {
            holdedFieldName: "CLIENTES - Estado del Cliente",
            subCategoryId: "insiders",
            type: "selection",
            options: ["ACTIVO", "BAJA", "STANDBY", "PRODUCTO ACTIVO"],
          },
          {
            holdedFieldName: "CLIENTES - Fecha de Alta",
            subCategoryId: "insiders",
            type: "date",
          },
          {
            holdedFieldName: "CLIENTES - Fecha de Baja",
            subCategoryId: "insiders",
            type: "date",
          },
          {
            holdedFieldName: "CLIENTES - Insiders ID",
            subCategoryId: "insiders",
            type: "text",
          },
          {
            holdedFieldName: "CLIENTES - Fecha de Standby",
            subCategoryId: "insiders",
            type: "date",
          },
          {
            holdedFieldName: "CLIENTES - Fecha de Fin de Servicios Activos",
            subCategoryId: "insiders",
            type: "date",
          },
        ],
      },
    ],
  },
  {
    id: "consultingAndMentoringFields",
    groups: [
      {
        id: "mentoring",
        fields: [
          {
            holdedFieldName: "MENTORING - Responsable",
            subCategoryId: "mentoring",
            type: "selection",
            options: ["LORENA", "PEDRO", "AINHOA", "OIHANE", "JESÚS", "PABLO"],
          },
          {
            holdedFieldName: "MENTORING - Fecha de Alta",
            subCategoryId: "mentoring",
            type: "date",
          },
          {
            holdedFieldName: "MENTORING - Fecha de Baja",
            subCategoryId: "mentoring",
            type: "date",
          },
        ],
      },
      {
        id: "extraMentoring",
        fields: [
          {
            holdedFieldName: "MENTORING EXTRA - Nº Contratado",
            subCategoryId: "extraMentoring",
            type: "number",
          },
          {
            holdedFieldName: "MENTORING EXTRA - Nº Realizado",
            subCategoryId: "extraMentoring",
            type: "number",
          },
          {
            holdedFieldName: "MENTORING EXTRA - Responsable",
            subCategoryId: "extraMentoring",
            type: "selection",
            options: ["LORENA", "PEDRO", "AINHOA", "OIHANE", "JESÚS", "PABLO"],
          },
        ],
      },
      {
        id: "cm",
        fields: [
          {
            holdedFieldName: "CM - Responsable",
            subCategoryId: "cm",
            type: "selection",
            options: ["LORENA", "PEDRO", "AINHOA", "OIHANE", "JESÚS", "PABLO"],
          },
          {
            holdedFieldName: "CM - Fecha de Alta",
            subCategoryId: "cm",
            type: "date",
          },
          {
            holdedFieldName: "CM - Fecha de Baja",
            subCategoryId: "cm",
            type: "date",
          },
        ],
      },
    ],
  },
  {
    id: "trainingsFields",
    groups: [
      {
        id: "consulting360",
        fields: [
          {
            holdedFieldName: "CONSULTORÍA 360º - Edición",
            subCategoryId: "consulting360",
            type: "selection",
            options: ["ED1 MAR-MAY24", "ED2 ABR-MAY24", "ED3 MAY-JUN24"],
          },
        ],
      },
      {
        id: "inpTraining",
        fields: [
          {
            holdedFieldName: "FORMACIÓN INP - Edición",
            subCategoryId: "inpTraining",
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
        fields: [
          {
            holdedFieldName: "INSIDE CLUB - Fecha de Inicio",
            subCategoryId: "insideClub",
            type: "date",
          },
          {
            holdedFieldName: "INSIDE CLUB - Fecha de Fin",
            subCategoryId: "insideClub",
            type: "date",
          },
          {
            holdedFieldName: "INSIDE CLUB - Nivel",
            subCategoryId: "insideClub",
            type: "selection",
            options: ["AVANZADO", "EXPERTO", "EMBAJADOR"],
          },
        ],
      },
      {
        id: "directiveManagement",
        fields: [
          {
            holdedFieldName: "GESTIÓN DIRECTIVA - Fecha de Inicio",
            subCategoryId: "directiveManagement",
            type: "date",
          },
          {
            holdedFieldName: "GESTIÓN DIRECTIVA - Fecha de Fin",
            subCategoryId: "directiveManagement",
            type: "date",
          },
          {
            holdedFieldName: "GESTIÓN DIRECTIVA - Nivel",
            subCategoryId: "directiveManagement",
            type: "selection",
            options: ["Nivel 1", "Nivel 2", "Nivel 3"],
          },
        ],
      },
      {
        id: "hypersalesSalon",
        fields: [
          {
            holdedFieldName: "SALÓN HIPERVENTAS - Edición",
            subCategoryId: "hypersalesSalon",
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
        fields: [
          {
            holdedFieldName: "IBM - Edición",
            subCategoryId: "ibm",
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
        fields: [
          {
            holdedFieldName: "STAR CLUB - Edición",
            subCategoryId: "starClub",
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
        fields: [
          {
            holdedFieldName: "SALÓN EXPERIENCE - Edición",
            subCategoryId: "salonExperience",
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
        fields: [
          {
            holdedFieldName: "SCALING-S - Edición",
            subCategoryId: "scalingS",
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
        fields: [
          {
            holdedFieldName: "MENÚ DE SERVICIOS - Edición",
            subCategoryId: "servicesMenu",
            type: "selection",
            options: ["ED01 2023", "ED02 ENE24", "ED03 MAR24", "ED04 JUN24"],
          },
        ],
      },
    ],
  },
  {
    id: "marketingFields",
    groups: [
      {
        id: "salonMarketing",
        fields: [
          {
            holdedFieldName: "MARKETING SALÓN - Fecha de Inicio",
            subCategoryId: "salonMarketing",
            type: "date",
          },
          {
            holdedFieldName: "MARKETING SALÓN - Fecha de Fin",
            subCategoryId: "salonMarketing",
            type: "date",
          },
          {
            holdedFieldName: "MARKETING SALÓN - Nivel",
            subCategoryId: "salonMarketing",
            type: "selection",
            options: ["Nivel 1", "Nivel 2", "Nivel 3"],
          },
          {
            holdedFieldName: "MARKETING SALÓN - Meses NUEVOS",
            subCategoryId: "salonMarketing",
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
            subCategoryId: "salonMarketing",
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
            subCategoryId: "salonMarketing",
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
            subCategoryId: "salonMarketing",
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
    groups: [
      {
        id: "brandCreation",
        fields: [
          {
            holdedFieldName: "CREACIÓN DE MARCA - Fecha de Inicio",
            subCategoryId: "brandCreation",
            type: "date",
          },
        ],
      },
      {
        id: "brandDesign",
        fields: [
          {
            holdedFieldName: "DISEÑO DE MARCA - Fecha de Inicio",
            subCategoryId: "brandDesign",
            type: "date",
          },
        ],
      },
      {
        id: "brandDevelopment",
        fields: [
          {
            holdedFieldName: "DESARROLLO DE MARCA - Fecha de Inicio",
            subCategoryId: "brandDevelopment",
            type: "date",
          },
        ],
      },
      {
        id: "logoCreation",
        fields: [
          {
            holdedFieldName: "CREACIÓN DE LOGOTIPO - Fecha de Inicio",
            subCategoryId: "logoCreation",
            type: "date",
          },
        ],
      },
      {
        id: "facadeDesign",
        fields: [
          {
            holdedFieldName: "DISEÑO DE FACHADA - Fecha de Inicio",
            subCategoryId: "facadeDesign",
            type: "date",
          },
        ],
      },
      {
        id: "interiorDesign",
        fields: [
          {
            holdedFieldName: "DISEÑO DE INTERIORISMO - Fecha de Inicio",
            subCategoryId: "interiorDesign",
            type: "date",
          },
        ],
      },
      {
        id: "webDesign",
        fields: [
          {
            holdedFieldName: "DISEÑO WEB - Fecha de Inicio",
            subCategoryId: "webDesign",
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


