import { NextResponse } from "next/server";
import { google } from "googleapis";

// Define folder interface
interface Folder {
  id: string;
  name: string;
  path: string;
  type: "year" | "client" | "campaign" | "unknown";
  level: number;
  parents?: string[];
}

/**
 * GET route handler for marketing salon drive folders
 */
export async function GET(request: Request) {
  // Obtener parámetros de la solicitud
  const { searchParams } = new URL(request.url);
  const includeFiles = searchParams.get("includeFiles") === "true";
  const folderType = searchParams.get("type") as
    | "year"
    | "client"
    | "campaign"
    | null;
  const folderParam = searchParams.get("folder");
  const useMockData = searchParams.get("mock") === "true";

  console.log("API de Google Drive - Params:", {
    includeFiles,
    folderType,
    folderParam,
    useMockData,
  });

  // Añadir información de depuración sobre las variables de entorno (sin mostrar valores sensibles completos)
  console.log("Verificando variables de entorno:");
  console.log(
    `GOOGLE_DRIVE_CLIENT_EMAIL: ${
      process.env.GOOGLE_DRIVE_CLIENT_EMAIL
        ? "✓ configurado"
        : "✗ no configurado"
    }`
  );
  console.log(
    `GOOGLE_DRIVE_PRIVATE_KEY: ${
      process.env.GOOGLE_DRIVE_PRIVATE_KEY
        ? "✓ configurado (longitud: " +
          process.env.GOOGLE_DRIVE_PRIVATE_KEY.length +
          ")"
        : "✗ no configurado"
    }`
  );
  console.log(
    `GOOGLE_DRIVE_PROJECT_ID: ${
      process.env.GOOGLE_DRIVE_PROJECT_ID ? "✓ configurado" : "✗ no configurado"
    }`
  );
  console.log(
    `GOOGLE_DRIVE_CLIENT_ID: ${
      process.env.GOOGLE_DRIVE_CLIENT_ID ? "✓ configurado" : "✗ no configurado"
    }`
  );
  console.log(
    `GOOGLE_DRIVE_ROOT_FOLDER_ID: ${
      process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID
        ? "✓ configurado"
        : "✗ no configurado"
    }`
  );

  // Determinar la ruta o ID a utilizar
  const rootFolderId =
    process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID ||
    "19wn0b3uaOT81NVxQARXLht8Nbukn-0u_"; // ID conocido de la carpeta raíz
  let folderPath = folderParam || rootFolderId;
  console.log(`Usando ID de carpeta: ${folderPath}`);

  // Object to store results
  const results: {
    folders: Folder[];
    files?: any[];
    yearFolders?: Folder[];
    clientFolders?: Folder[];
    campaignFolders?: Folder[];
    hierarchyComplete?: boolean;
  } = {
    folders: [],
    hierarchyComplete: false,
  };

  try {
    // Configurar la autenticación de Google Drive
    const drive = google.drive({
      version: "v3",
      auth: new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(
            /\\n/g,
            "\n"
          ),
          project_id: process.env.GOOGLE_DRIVE_PROJECT_ID || "",
          client_id: process.env.GOOGLE_DRIVE_CLIENT_ID || "",
        },
        scopes: ["https://www.googleapis.com/auth/drive.readonly"],
      }),
    });

    // Obtener las carpetas del nivel raíz
    console.log(`Obteniendo carpetas desde: ${rootFolderId}`);
    const rootResponse = await drive.files.list({
      q: `'${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id, name, mimeType)",
      pageSize: 100,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const rootFolders = rootResponse.data.files || [];
    console.log(
      `Encontradas ${rootFolders.length} carpetas en el nivel raíz:`,
      rootFolders
    );

    // Tratar todas las carpetas en el nivel raíz como "años"
    const yearFolders = rootFolders.map((folder: any) => ({
      id: folder.id || "",
      name: folder.name || "",
      path: `/${folder.name}`,
      type: "year" as const,
      level: 0,
    }));

    results.yearFolders = yearFolders;
    results.folders = yearFolders;

    // Para cada "año", obtener sus subcarpetas como "clientes"
    const clientFolders: Folder[] = [];
    for (const yearFolder of yearFolders) {
      const clientResponse = await drive.files.list({
        q: `'${yearFolder.id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: "files(id, name, mimeType)",
        pageSize: 100,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      const clientsForYear = (clientResponse.data.files || []).map(
        (folder: any) => ({
          id: folder.id || "",
          name: folder.name || "",
          path: `/${yearFolder.name}/${folder.name}`,
          parents: [yearFolder.id],
          type: "client" as const,
          level: 1,
        })
      );

      clientFolders.push(...clientsForYear);
      console.log(
        `Encontradas ${clientsForYear.length} carpetas de "cliente" para el año ${yearFolder.name}`
      );
    }

    results.clientFolders = clientFolders;

    // Para cada "cliente", obtener sus subcarpetas como "campañas"
    const campaignFolders: Folder[] = [];
    for (const clientFolder of clientFolders) {
      const campaignResponse = await drive.files.list({
        q: `'${clientFolder.id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: "files(id, name, mimeType)",
        pageSize: 100,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      const campaignsForClient = (campaignResponse.data.files || []).map(
        (folder: any) => ({
          id: folder.id || "",
          name: folder.name || "",
          path: `/${clientFolder.path}/${folder.name}`.replace("//", "/"),
          parents: [clientFolder.id],
          type: "campaign" as const,
          level: 2,
        })
      );

      campaignFolders.push(...campaignsForClient);
      console.log(
        `Encontradas ${campaignsForClient.length} carpetas de "campaña" para el cliente ${clientFolder.name}`
      );
    }

    results.campaignFolders = campaignFolders;

    // Determinar si la jerarquía está completa
    results.hierarchyComplete =
      yearFolders.length > 0 &&
      clientFolders.length > 0 &&
      campaignFolders.length > 0;

    // Decidir qué carpetas devolver según el tipo y folder solicitados
    if (folderType) {
      switch (folderType) {
        case "year":
          results.folders = yearFolders;
          break;
        case "client":
          if (folderParam) {
            results.folders = clientFolders.filter(
              (f) => f.parents && f.parents.includes(folderParam)
            );
          } else {
            results.folders = clientFolders;
          }
          break;
        case "campaign":
          if (folderParam) {
            results.folders = campaignFolders.filter(
              (f) => f.parents && f.parents.includes(folderParam)
            );
          } else {
            results.folders = campaignFolders;
          }
          break;
        default:
          results.folders = yearFolders;
      }
    } else if (folderParam) {
      // Si se especifica un ID de carpeta pero no un tipo
      console.log(`Buscando carpeta con ID: ${folderParam}`);

      const isYear = yearFolders.some((f) => f.id === folderParam);
      if (isYear) {
        console.log(
          `La carpeta ${folderParam} es de tipo 'año', devolviendo sus clientes`
        );
        results.folders = clientFolders.filter(
          (f) => f.parents && f.parents.includes(folderParam)
        );
        console.log(
          `Se encontraron ${results.folders.length} clientes para este año`
        );
      } else {
        const isClient = clientFolders.some((f) => f.id === folderParam);
        if (isClient) {
          console.log(
            `La carpeta ${folderParam} es de tipo 'cliente', devolviendo sus campañas`
          );
          results.folders = campaignFolders.filter(
            (f) => f.parents && f.parents.includes(folderParam)
          );
          console.log(
            `Se encontraron ${results.folders.length} campañas para este cliente`
          );
        } else {
          // Si no es ni año ni cliente, podríamos estar dentro de una campaña o en otra ubicación
          console.log(
            `La carpeta ${folderParam} no es ni año ni cliente, consultando directamente`
          );
          try {
            // Intentar obtener subcarpetas de esa ubicación
            const folderContentsResponse = await drive.files.list({
              q: `'${folderParam}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
              fields: "files(id, name, mimeType)",
              pageSize: 100,
              supportsAllDrives: true,
              includeItemsFromAllDrives: true,
            });

            console.log(
              `Se encontraron ${
                folderContentsResponse.data.files?.length || 0
              } subcarpetas directas`
            );
            results.folders = (folderContentsResponse.data.files || []).map(
              (folder: any) => ({
                id: folder.id || "",
                name: folder.name || "",
                path: `/${folder.name}`,
                parents: [folderParam],
                type: "unknown" as const,
                level: -1,
              })
            );
          } catch (folderError) {
            console.error(
              `Error al obtener subcarpetas para ${folderParam}:`,
              folderError
            );
            results.folders = [];
          }
        }
      }
    } else {
      // Por defecto, devolver años
      results.folders = yearFolders;
    }

    // Obtener archivos si se solicitan
    if (includeFiles) {
      console.log(`Obteniendo archivos para la carpeta: ${folderPath}`);
      try {
        const filesResponse = await drive.files.list({
          q: `'${folderPath}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`,
          fields: "files(id, name, mimeType, webViewLink)",
          pageSize: 100,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
        });

        results.files = filesResponse.data.files || [];
        console.log(
          `Se encontraron ${results.files.length} archivos en la carpeta ${folderPath}`
        );
      } catch (fileError) {
        console.error(
          `Error al obtener archivos: ${
            fileError instanceof Error ? fileError.message : String(fileError)
          }`
        );
        results.files = [];
      }
    }

    // Preparar metadatos para la respuesta
    const metadata = {
      folderCount: results.folders.length,
      fileCount: results.files?.length || 0,
      yearCount: yearFolders.length,
      clientCount: clientFolders.length,
      campaignCount: campaignFolders.length,
      timestamp: new Date().toISOString(),
      params: {
        folderPath,
        includeFiles,
        folderType,
      },
    };

    // Devolver respuesta JSON estructurada
    return NextResponse.json({
      success: true,
      data: results,
      metadata,
    });
  } catch (error) {
    console.error("Error en la API de Google Drive:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
