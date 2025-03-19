/**
 * Hook para gestionar la carga y manipulación de la jerarquía
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { HierarchyService } from "../services/hierarchy/hierarchyService";
import { HierarchyResponse, HierarchyItem } from "../types/hierarchy";
import { GoogleDriveService } from "../services/drive/GoogleDriveService";
import { FileAnalyzer } from "../services/analyzer/fileAnalyzer";
import { debug, info, error } from "../utils/logger";

interface UseHierarchyProps {
  driveService: GoogleDriveService;
  rootFolderId?: string;
  includeHidden?: boolean;
  autoValidate?: boolean;
  maxDepth?: number;
}

interface UseHierarchyReturn {
  hierarchyData: HierarchyResponse | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  findItemById: (id: string) => HierarchyItem | null;
  findItemsByName: (name: string, exact?: boolean) => HierarchyItem[];
  getPath: (item: HierarchyItem) => HierarchyItem[];
}

/**
 * Hook personalizado para manejar la jerarquía
 */
export function useHierarchy({
  driveService,
  rootFolderId,
  includeHidden = false,
  autoValidate = true,
  maxDepth = 10,
}: UseHierarchyProps): UseHierarchyReturn {
  const [hierarchyData, setHierarchyData] = useState<HierarchyResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  // Crear instancias de servicios necesarios
  const fileAnalyzer = useMemo(() => new FileAnalyzer(), []);
  const hierarchyService = useMemo(
    () => new HierarchyService(driveService, fileAnalyzer),
    [driveService, fileAnalyzer]
  );

  /**
   * Función para cargar la jerarquía
   */
  const loadHierarchy = useCallback(async () => {
    if (!rootFolderId) {
      debug("No root folder ID provided, skipping hierarchy loading");
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      info("Loading hierarchy from root folder", { rootFolderId });

      const options = {
        rootFolderId,
        includeHidden,
        autoValidate,
        maxDepth,
      };

      const result = await hierarchyService.buildHierarchy(options);
      setHierarchyData(result);
      info("Hierarchy loaded successfully", {
        totalItems: result.stats.totalItems,
        maxDepth: result.stats.maxDepth,
      });
    } catch (err) {
      const errorInstance = err instanceof Error ? err : new Error(String(err));
      setLoadError(errorInstance);
      error("Error loading hierarchy", errorInstance);
    } finally {
      setIsLoading(false);
    }
  }, [rootFolderId, includeHidden, autoValidate, maxDepth, hierarchyService]);

  // Cargar la jerarquía cuando cambian las dependencias
  useEffect(() => {
    loadHierarchy();
  }, [loadHierarchy]);

  /**
   * Encuentra un elemento por su ID
   */
  const findItemById = useCallback(
    (id: string): HierarchyItem | null => {
      if (!hierarchyData || !hierarchyData.itemsMap) {
        return null;
      }
      return hierarchyData.itemsMap.get(id) || null;
    },
    [hierarchyData]
  );

  /**
   * Encuentra elementos por nombre
   */
  const findItemsByName = useCallback(
    (name: string, exact: boolean = false): HierarchyItem[] => {
      if (!hierarchyData || !hierarchyData.itemsMap) {
        return [];
      }

      const results: HierarchyItem[] = [];
      hierarchyData.itemsMap.forEach((item) => {
        if (exact) {
          if (item.name === name) {
            results.push(item);
          }
        } else {
          if (item.name.toLowerCase().includes(name.toLowerCase())) {
            results.push(item);
          }
        }
      });

      return results;
    },
    [hierarchyData]
  );

  /**
   * Obtiene la ruta completa a un elemento
   */
  const getPath = useCallback(
    (item: HierarchyItem): HierarchyItem[] => {
      if (!hierarchyData || !hierarchyData.itemsMap) {
        return [item];
      }

      return hierarchyService.getItemPath(item, hierarchyData.itemsMap);
    },
    [hierarchyData, hierarchyService]
  );

  return {
    hierarchyData,
    isLoading,
    error: loadError,
    refresh: loadHierarchy,
    findItemById,
    findItemsByName,
    getPath,
  };
}
