import { campaignCodes, clientsCodes, filesCodes, langCodes } from "@/db/constants";
import fs from "fs/promises";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

interface GoogleDriveLinks {
  preview: string;
  imgEmbed: string;
  download: string;
}

interface PreviewItem {
  id: string;
  order: number;
  title: string;
  url: string;
  transformedUrl: GoogleDriveLinks;
  preview?: PreviewItem[]; // Esta línea es opcional, dependiendo de si PreviewItem realmente necesita contener otros PreviewItems.
}

interface BaseObject {
  title: string;
  url: string;
  copy?: string;
  groupTitle?: string;
  preview: PreviewItem[];
}

interface TransformedObject extends BaseObject {
  id: string;
  order: number;
  transformedUrl: GoogleDriveLinks; // Asegura que esta propiedad es del tipo correcto.
  category: string;
  lang: string;
  downloadName: string;
  client: string;
  campaign: string;
  year: number;
  month: number;
  groupOrder: number;
}

// Función para convertir enlaces de Google Drive
function convertGoogleDriveLink(link:string) {
  const fileIdMatch = link.match(/\/d\/(.+?)\//) || link.match(/uc\?id=(.+?)&export=download/);
  const fileId = fileIdMatch ? fileIdMatch[1] : null;
  
  return {
    preview: `https://drive.google.com/file/d/${fileId}/view?usp=drivesdk`,
    imgEmbed: `https://lh3.googleusercontent.com/d/${fileId}`,
    download: `https://drive.google.com/uc?id=${fileId}&export=download`,
  };
}


// Función para crear una lista de tarjetas (objetos transformados) a partir de los datos originales.
function createMarketingCardsList(objects: BaseObject[]): TransformedObject[] {
  const grouped: { [key: string]: TransformedObject } = {};

  objects.forEach(obj => {
    const baseIdMatch = obj.title.match(/^(.+?)-P\d+/) || obj.title.match(/^(.+?)(\.\w+)$/);
    const baseId = baseIdMatch ? baseIdMatch[1] : obj.title;
    const transformedUrl = convertGoogleDriveLink(obj.url);

    // Extracción de componentes del título para asignación de valores.
    const [clientsCode, campaignCode, yearAndMonth, fileCode, langCode, family, version] = obj.title.split(/[-_]/);
    const client = clientsCodes[clientsCode.substring(0, 4) as keyof typeof clientsCodes] || "Desconocido";
    const campaign = campaignCodes[campaignCode as keyof typeof campaignCodes] || "Desconocido";
    const category = filesCodes[fileCode.substring(0, 4) as keyof typeof filesCodes] || "Desconocido";
    const lang = langCodes[langCode as keyof typeof langCodes] || "Desconocido";
    const downloadName = `${category}-${lang}-${version}`;

    if (!grouped[baseId]) {
      grouped[baseId] = {
        id: baseId,
        order: Number(version?.substring(0, 2)) || Number(version),
        title:  `${category}: ${lang}-${version?.substring(0, 2)}`,
        url: obj.url,
        copy: obj.copy || "",
        transformedUrl: transformedUrl,
        category: category,
        lang: lang,
        downloadName: downloadName,
        client: client,
        campaign: campaign,
        year: Number(yearAndMonth?.substring(0, 2)),
        month: Number(yearAndMonth?.substring(2, 4)),
        groupOrder: Number(family), 
        groupTitle: obj.groupTitle || "",
        preview: [],
      };
    }

    if (obj.title.includes("-P")) {
      const orderMatch = obj.title.split("-P")[1].match(/\d+/);
      const order = orderMatch ? Number(orderMatch[0]) : 0;
      
      let previewItem: PreviewItem = {
        id: obj.title.substring(0, 25),
        order: order,
        title: `${category}-${version?.substring(0, 2)}: P-${order}`,
        url: obj.url,
        transformedUrl: transformedUrl,
      };
      

      if (grouped[baseId]) {
        grouped[baseId].preview.push(previewItem);
      } else {
        grouped[baseId] = {
          id: baseId,
          order: Number(version?.substring(0, 2)) || Number(version),
          title: `${category}: ${lang}-${version?.substring(0, 2)}`,
          url: obj.url,
          copy: obj.copy || "",
          transformedUrl: transformedUrl,
          category: category,
          lang: lang,
          downloadName: downloadName,
          client: client,
          campaign: campaign,
          year: Number(yearAndMonth?.substring(0, 2)),
          month: Number(yearAndMonth?.substring(2, 4)),
          groupOrder: Number(family),
          groupTitle: obj.groupTitle || "",
          preview: [previewItem],
        };
      }
    }
  });

  return Object.values(grouped);
}

// Función para crear una lista de agrupadas por categorias y lenguajes.
function filterAndGroupByCategoriesAndLanguages(items: any[], filesCodes: Record<string, string>, langCodes: Record<string, string>) {
  // Convertir el objeto filesCodes a un array de códigos de categoría válidos
  const categoryCodes = Object.keys(filesCodes);

  // Filtrar items por el cuarto parámetro del ID que esté dentro de los categoryCodes
  const filteredItems = items.filter(item => {
    const parts = item.id.split('-');
    return categoryCodes.includes(parts[3]);
  });

  // Agrupar los items filtrados primero por código de categoría y luego por idioma
  const groupedByCategoryAndLanguage = filteredItems.reduce((acc, item) => {
    const parts = item.id.split('-');
    const categoryCode = parts[3];
    const languageCode = parts[4];
    const language = langCodes[languageCode] || "Desconocido"; // Traducir el código de idioma a su valor textual

    // Asegurarse de que exista la estructura de código de categoría -> idioma
    if (!acc[categoryCode]) {
      acc[categoryCode] = {};
    }
    if (!acc[categoryCode][language]) {
      acc[categoryCode][language] = [];
    }

    // Añadir el item al grupo correspondiente
    acc[categoryCode][language].push(item);
    return acc;
  }, {});

  return groupedByCategoryAndLanguage;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { year, month } = req.query;

  try {
    const filePath = path.resolve(
      "./db/marketing-salon/v2/campaign/marketing-cards/",
      `${year}.json`
    );
    const data = await fs.readFile(filePath, "utf8");
    const jsonData = JSON.parse(data);

    const fullMonthMarketingCards = createMarketingCardsList(
      jsonData[ month as string]
    );
    const groupedItemsByCategory = filterAndGroupByCategoriesAndLanguages(fullMonthMarketingCards, filesCodes, langCodes);
    //console.log(groupedItemsByCategory);
    
    if (groupedItemsByCategory) {
      res.status(200).json(groupedItemsByCategory);
    } else {
      res.status(404).json({ message: "Something went wrong" });
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      res.status(404).json({ message: "Year data not found." });
    } else {
      res.status(500).json({ message: "Error reading file." });
    }
  }
}