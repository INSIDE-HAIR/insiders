/**
 * API Route: /api/marketing-salon-drive/folders
 *
 * Propósito: Esta API devuelve la estructura de carpetas disponibles
 * en Google Drive para el módulo Marketing Salon Drive. Permite a los componentes
 * del frontend obtener una visión de las carpetas disponibles.
 *
 * Respuesta:
 * - success: Indica si la operación fue exitosa
 * - data: Contiene la estructura de carpetas
 *   - folders: Lista de carpetas disponibles
 * - metadata: Información adicional sobre la respuesta
 *
 * Parámetros:
 * - folder: ID o ruta del folder a utilizar (opcional, usa la raíz por defecto)
 * - type: Tipo de carpetas a devolver (year, client, campaign)
 *
 * Notas adicionales:
 * - Las carpetas pueden tener prefijos como "01_", "02_client_", etc. que se usan para
 *   ordenación y categorización.
 * - Las carpetas con sufijo "_hidden" son procesadas normalmente por el backend, pero
 *   el frontend puede decidir si mostrarlas o no.
 */

import { NextResponse } from "next/server";
import { google } from "googleapis";

// Define interfaces locally to avoid import issues
interface Folder {
  id: string;
  name: string;
  path: string;
  parents?: string[];
  level?: number;
  type?: string;
}

interface FolderWithChildren extends Folder {
  children?: FolderWithChildren[];
}

/**
 * Función para ordenar las carpetas basándose en sus prefijos numéricos
 * Esto garantiza que las carpetas se muestren en el orden adecuado sin
 * importar cómo las devuelve Google Drive.
 */
function sortFoldersByPrefix(folders: Folder[]): Folder[] {
  return [...folders].sort((a, b) => {
    // Extrae el prefijo numérico si existe
    const prefixA = a.name.match(/^(\d+)_/);
    const prefixB = b.name.match(/^(\d+)_/);

    // Si ambos tienen prefijo numérico, compara por número
    if (prefixA && prefixB) {
      return parseInt(prefixA[1]) - parseInt(prefixB[1]);
    }

    // Si solo uno tiene prefijo, ese va primero
    if (prefixA) return -1;
    if (prefixB) return 1;

    // Si ninguno tiene prefijo, ordenar alfabéticamente
    return a.name.localeCompare(b.name);
  });
}

/**
 * GET route handler for marketing salon drive folders
 */
export async function GET(request: Request) {
  // Obtener parámetros de la solicitud
  const { searchParams } = new URL(request.url);
  const folderType = searchParams.get("type") as
    | "year"
    | "client"
    | "campaign"
    | null;
  const folderParam = searchParams.get("folder");

  // Capturar parámetros adicionales (solo IDs)
  const yearId = searchParams.get("yearId");
  const clientId = searchParams.get("clientId");
  const campaignId = searchParams.get("campaignId");

  console.log("API de Google Drive - Params:", {
    folderType,
    folderParam,
    yearId,
    clientId,
    campaignId,
  });

  // Object to store results
  const results: {
    folders: Folder[];
    yearFolders?: Folder[];
    clientFolders?: Folder[];
    campaignFolders?: Folder[];
    hierarchyComplete?: boolean;
  } = {
    folders: [],
    hierarchyComplete: false,
  };

  // Accessing Google Drive API
  console.log("Accessing Google Drive API...");

  // Añadir información de depuración sobre las variables de entorno
  console.log(
    "Verificando variables de entorno:",
    process.env.GOOGLE_DRIVE_CLIENT_EMAIL ? "✓" : "✗",
    process.env.GOOGLE_DRIVE_PRIVATE_KEY ? "✓" : "✗",
    process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID ? "✓" : "✗"
  );

  try {
    // Determinar la ruta o ID a utilizar
    const rootFolderId =
      process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID ||
      "19wn0b3uaOT81NVxQARXLht8Nbukn-0u_"; // ID conocido de la carpeta raíz
    let folderPath = folderParam || rootFolderId;
    console.log(`Usando ID de carpeta: ${folderPath}`);

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

    // Si tenemos todos los IDs (campaignId, clientId, yearId), podemos devolver una respuesta optimizada
    if (campaignId && clientId && yearId) {
      console.log("Optimizando la consulta usando IDs directos");

      // Solo devolvemos información básica sin consultar el drive
      return NextResponse.json({
        success: true,
        data: {
          folders: [],
        },
        metadata: {
          folderCount: 0,
          timestamp: new Date().toISOString(),
          params: {
            folderPath: campaignId,
            yearId,
            clientId,
            campaignId,
            isOptimized: true,
          },
        },
      });
    }

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
    // Ordenar las carpetas por su prefijo numérico
    const yearFolders = sortFoldersByPrefix(
      rootFolders.map((folder: any) => ({
        id: folder.id || "",
        name: folder.name || "",
        path: `/${folder.name}`,
        type: "year" as const,
        level: 0,
      }))
    );

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

      // Mapear y ordenar por prefijo numérico
      const clientsForYear = sortFoldersByPrefix(
        (clientResponse.data.files || []).map((folder: any) => ({
          id: folder.id || "",
          name: folder.name || "",
          path: `/${yearFolder.name}/${folder.name}`,
          parents: [yearFolder.id],
          type: "client" as const,
          level: 1,
        }))
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

      // Mapear y ordenar por prefijo numérico
      const campaignsForClient = sortFoldersByPrefix(
        (campaignResponse.data.files || []).map((folder: any) => ({
          id: folder.id || "",
          name: folder.name || "",
          path: `/${clientFolder.path}/${folder.name}`.replace("//", "/"),
          parents: [clientFolder.id],
          type: "campaign" as const,
          level: 2,
        }))
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
              (f: Folder) => f.parents && f.parents.includes(folderParam)
            );
          } else {
            results.folders = clientFolders;
          }
          break;
        case "campaign":
          if (folderParam) {
            results.folders = campaignFolders.filter(
              (f: Folder) => f.parents && f.parents.includes(folderParam)
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

      const isYear = yearFolders.some((f: Folder) => f.id === folderParam);
      if (isYear) {
        console.log(
          `La carpeta ${folderParam} es de tipo 'año', devolviendo sus clientes`
        );
        results.folders = clientFolders.filter(
          (f: Folder) => f.parents && f.parents.includes(folderParam)
        );
        console.log(
          `Se encontraron ${results.folders.length} clientes para este año`
        );
      } else {
        const isClient = clientFolders.some(
          (f: Folder) => f.id === folderParam
        );
        if (isClient) {
          console.log(
            `La carpeta ${folderParam} es de tipo 'cliente', devolviendo sus campañas`
          );
          results.folders = campaignFolders.filter(
            (f: Folder) => f.parents && f.parents.includes(folderParam)
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

            // Ordenar las carpetas por prefijo numérico
            results.folders = sortFoldersByPrefix(
              (folderContentsResponse.data.files || []).map((folder: any) => ({
                id: folder.id || "",
                name: folder.name || "",
                path: `/${folder.name}`,
                parents: [folderParam],
                type: "unknown" as const,
                level: -1,
              }))
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

    // Preparar metadatos para la respuesta
    const metadata = {
      folderCount: results.folders.length,
      yearCount: yearFolders.length,
      clientCount: clientFolders.length,
      campaignCount: campaignFolders.length,
      timestamp: new Date().toISOString(),
      params: {
        folderPath,
        folderType,
        // Incluir los parámetros adicionales en los metadatos
        yearId,
        clientId,
        campaignId,
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
