import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleDriveService } from "@drive/services/drive/GoogleDriveService";
import { FileAnalyzer } from "@drive/services/analyzer/fileAnalyzer";
import { HierarchyService } from "@drive/services/hierarchy/hierarchyService";
import {
  HierarchyItem,
  isFileItem,
  isFolderItem,
} from "@drive/types/hierarchy";
import { Logger } from "@drive/utils/logger";

const logger = new Logger("API:HierarchySearch");

/**
 * POST /api/drive/hierarchy/search
 * Busca elementos en una jerarquía existente
 * Body:
 * - hierarchy: Jerarquía en la que buscar (obligatorio)
 * - query: Texto a buscar (obligatorio)
 * - options:
 *   - matchCase: Si es true, considera mayúsculas y minúsculas (opcional, por defecto false)
 *   - searchInContent: Si es true, busca también en el contenido de los archivos (opcional, por defecto false)
 *   - fileTypes: Array de tipos MIME para filtrar resultados (opcional)
 *   - maxResults: Número máximo de resultados (opcional, por defecto 20)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Verificar autenticación
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener datos del cuerpo de la solicitud
    const body = await request.json();
    const { hierarchy, query, options = {} } = body;

    if (!hierarchy) {
      return NextResponse.json(
        { error: "No se proporcionó una jerarquía válida" },
        { status: 400 }
      );
    }

    if (!query || typeof query !== "string" || query.trim() === "") {
      return NextResponse.json(
        { error: "Se requiere un texto de búsqueda válido" },
        { status: 400 }
      );
    }

    // Configurar opciones de búsqueda
    const {
      matchCase = false,
      searchInContent = false,
      fileTypes = [],
      maxResults = 20,
    } = options;

    // Inicializar servicios
    const driveService = new GoogleDriveService();
    await driveService.initialize();
    const fileAnalyzer = new FileAnalyzer();
    const hierarchyService = new HierarchyService(driveService, fileAnalyzer);

    logger.info(
      `Buscando "${query}" en jerarquía con ID raíz: ${hierarchy.id}`
    );

    // Función para buscar elementos que coincidan con la consulta
    const searchInHierarchy = async (
      item: HierarchyItem,
      results: HierarchyItem[] = [],
      currentPath: HierarchyItem[] = []
    ): Promise<HierarchyItem[]> => {
      // Agregar el elemento actual a la ruta
      const path = [...currentPath, item];

      // Buscar en el nombre del elemento
      const itemName = matchCase ? item.name : item.name.toLowerCase();
      const searchQuery = matchCase ? query : query.toLowerCase();

      if (itemName.includes(searchQuery)) {
        // Agregar metadatos de ruta al elemento antes de añadirlo a los resultados
        const result = {
          ...item,
          path: path.map((p) => ({ id: p.id, name: p.name })),
        };
        results.push(result);
      }

      // Si es un archivo y se ha habilitado la búsqueda en contenido
      if (
        searchInContent &&
        isFileItem(item) &&
        results.length < maxResults &&
        (!fileTypes.length || fileTypes.includes(item.mimeType))
      ) {
        try {
          const content = await driveService.getFileContent(item.id);
          if (content) {
            const contentText = matchCase ? content : content.toLowerCase();
            if (contentText.includes(searchQuery)) {
              // Solo añadir si no está ya en los resultados
              if (!results.find((r) => r.id === item.id)) {
                const result = {
                  ...item,
                  path: path.map((p) => ({ id: p.id, name: p.name })),
                };
                results.push(result);
              }
            }
          }
        } catch (error) {
          // Ignorar errores al leer contenido
          logger.warn(`No se pudo leer el contenido de ${item.name}`, error);
        }
      }

      // Si es una carpeta, buscar recursivamente en los hijos
      if (isFolderItem(item) && results.length < maxResults) {
        for (const child of item.children) {
          await searchInHierarchy(child, results, path);
          if (results.length >= maxResults) break;
        }
      }

      return results;
    };

    // Realizar la búsqueda
    const searchResults = await searchInHierarchy(hierarchy);

    logger.info(
      `Búsqueda completada: ${searchResults.length} resultados encontrados`
    );

    return NextResponse.json({
      query,
      results: searchResults.slice(0, maxResults),
      count: searchResults.length,
    });
  } catch (error: any) {
    logger.error("Error en búsqueda de jerarquía", error);
    return NextResponse.json(
      { error: error.message || "Error en búsqueda de jerarquía" },
      { status: 500 }
    );
  }
}
