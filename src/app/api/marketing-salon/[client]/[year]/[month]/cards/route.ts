import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import {
  campaignCodes,
  clientsCodes,
  filesCodes,
  langCodes,
} from "@/db/constants";

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
  preview?: PreviewItem[];
}

interface BaseObject {
  title: string;
  url: string;
  copy?: string;
  groupTitle?: string;
  buttonTitle?: string;
  preview: PreviewItem[];
  buttons?: Buttons[];
}

interface Buttons {
  title: string;
  url: string;
}

interface TransformedObject extends BaseObject {
  id: string;
  order: number;
  transformedUrl: GoogleDriveLinks;
  category: string;
  lang: string;
  downloadName: string;
  client: string;
  campaign: string;
  year: number;
  month: number;
  groupOrder: number;
  buttons?: Buttons[];
}

function convertGoogleDriveLink(link: string): GoogleDriveLinks {
  const fileIdMatch =
    link.match(/\/d\/(.+?)\//) || link.match(/uc\?id=(.+?)&export=download/);
  const fileId = fileIdMatch ? fileIdMatch[1] : null;

  return {
    preview: `https://drive.google.com/file/d/${fileId}/view?usp=drivesdk`,
    imgEmbed: `https://lh3.googleusercontent.com/d/${fileId}`,
    download: `https://drive.google.com/uc?id=${fileId}&export=download`,
  };
}

function createMarketingCardsList(objects: BaseObject[]): TransformedObject[] {
  const grouped: { [key: string]: TransformedObject } = {};

  // Primera pasada: procesar objetos sin "-P"
  objects.forEach((obj) => {
    if (!obj.title.includes("-P")) {
      const [
        clientsCode,
        campaignCode,
        yearAndMonth,
        fileCode,
        langCode,
        family,
        version,
      ] = obj.title.split(/[-_]/);

      const baseId = obj.title.split('.')[0]; // Asumiendo que el formato es consistente
      const transformedUrl = convertGoogleDriveLink(obj.url);
      
      const client = clientsCodes[clientsCode.substring(0, 4) as keyof typeof clientsCodes] || "Desconocido";
      const campaign = campaignCodes[campaignCode as keyof typeof campaignCodes] || "Desconocido";
      const category = filesCodes[fileCode.substring(0, 4) as keyof typeof filesCodes] || "Desconocido";
      const lang = langCodes[langCode as keyof typeof langCodes] || "Desconocido";
      const downloadName = `${category}-${lang}-${version}`;

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
        buttonTitle: obj.buttonTitle || "",
        preview: [],
        buttons: obj.buttons || [],
      };
    }
  });

  // Segunda pasada: procesar objetos con "-P"
  objects.forEach((obj) => {
    if (obj.title.includes("-P")) {
      const baseId = obj.title.split('-P')[0];
      const orderMatch = obj.title.split("-P")[1].match(/\d+/);
      const order = orderMatch ? Number(orderMatch[0]) : 0;

      if (grouped[baseId]) {
        const previewItem: PreviewItem = {
          id: obj.title.substring(0, 25),
          order: order,
          title: `${grouped[baseId].category}-${grouped[baseId].order}: P-${order}`,
          url: obj.url,
          transformedUrl: convertGoogleDriveLink(obj.url),
        };

        grouped[baseId].preview.push(previewItem);
      }
    }
  });

  // Ordenar las previews de cada objeto
  Object.values(grouped).forEach(item => {
    item.preview.sort((a, b) => a.order - b.order);
  });

  return Object.values(grouped);
}

function filterAndGroupByCategoriesAndLanguages(
  items: any[],
  filesCodes: Record<string, string>,
  langCodes: Record<string, string>
) {
  const categoryCodes = Object.keys(filesCodes);

  const filteredItems = items.filter((item) => {
    const parts = item.id.split("-");
    return categoryCodes.includes(parts[3]);
  });

  const groupedByCategoryAndLanguage = filteredItems.reduce((acc, item) => {
    const parts = item.id.split("-");
    const categoryCode = parts[3];
    const languageCode = parts[4];
    const language = langCodes[languageCode] || "Desconocido";

    if (!acc[categoryCode]) {
      acc[categoryCode] = {};
    }
    if (!acc[categoryCode][language]) {
      acc[categoryCode][language] = [];
    }

    acc[categoryCode][language].push(item);
    return acc;
  }, {});

  return groupedByCategoryAndLanguage;
}

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: { year: string; month: string; client: string };
  }
) {
  const { client, month, year } = params;

  console.log("year", year);
  console.log("month", month);
  console.log("client", client);

  if (!year || !month || !client) {
    return NextResponse.json(
      { message: "Missing query parameters" },
      { status: 400 }
    );
  }

  try {
    const filePath = path.resolve(
      process.cwd(),
      `./db/insiders/services-data/marketing-salon/${year}.json`
    );
    const data = await fs.readFile(filePath, "utf8");
    const jsonData = JSON.parse(data);

    const fullMonthMarketingCards = createMarketingCardsList(
      jsonData[month as string]
    );

    const filteredByCampaignAndClient = fullMonthMarketingCards.filter(
      (card) => {
        const matchesClient = client
          ? card.client.toLowerCase() === client.toLowerCase()
          : true;
        return matchesClient;
      }
    );

    const groupedItemsByCategory = filterAndGroupByCategoriesAndLanguages(
      filteredByCampaignAndClient,
      filesCodes,
      langCodes
    );

    if (groupedItemsByCategory) {
      return NextResponse.json(groupedItemsByCategory, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "Something went wrong" },
        { status: 404 }
      );
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json(
        { message: "Year data not found." },
        { status: 404 }
      );
    } else {
      return NextResponse.json(
        { message: "Error reading file." },
        { status: 500 }
      );
    }
  }
}
