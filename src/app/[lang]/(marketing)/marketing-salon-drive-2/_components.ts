import { HierarchyItem } from "@/src/features/marketing-salon-drive/types/drive";

interface DriveResponse {
  success: boolean;
  data?: any;
  hierarchyMap?: HierarchyItem;
  marketingCards?: any;
  error?: string;
}

/**
 * Obtiene los detalles de una carpeta de Google Drive por ID.
 * Incluye la estructura jerárquica organizada según el modelo de tabs y sections.
 * 
 * @param folderId ID de la carpeta a consultar
 * @returns Respuesta con datos de la carpeta y su estructura jerárquica
 */
export async function fetchFolderById(folderId: string): Promise<DriveResponse> {
  try {
    // Realizar la solicitud al endpoint de la API
    const response = await fetch(`/api/marketing-salon-drive/folder/${folderId}/cards`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener datos de la carpeta:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
} 