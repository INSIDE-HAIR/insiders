import { describe, it, expect } from "vitest";
import { mockHierarchyData, mockMarketingCards } from "../mockData";
import { HierarchyItem } from "../../types/drive";

describe("Mock Data Tests", () => {
  describe("Structure Validation", () => {
    it("should have a valid root item", () => {
      expect(mockHierarchyData).toHaveProperty(
        "id",
        "1uksAN7jXW_xhNcLhKP2EIBZGDS8QJqmF"
      );
      expect(mockHierarchyData).toHaveProperty(
        "name",
        "Insiders - Materiales Marketing"
      );
      expect(mockHierarchyData).toHaveProperty("driveType", "folder");
      expect(mockHierarchyData).toHaveProperty("depth", 0);
      expect(mockHierarchyData).toHaveProperty("childrens");
      expect(Array.isArray(mockHierarchyData.childrens)).toBe(true);
    });

    it("should have the correct number of top-level folders", () => {
      // Comprobamos que tenemos 5 carpetas principales (sidebar)
      expect(mockHierarchyData.childrens.length).toBe(5);

      // Verificamos que son las carpetas esperadas por su orden
      const sidebarFolders = mockHierarchyData.childrens.map(
        (child) => child.name
      );
      expect(sidebarFolders).toContain("01_sidebar_Plan de Marketing");
      expect(sidebarFolders).toContain("02_sidebar_Guia");
      expect(sidebarFolders).toContain("03_sidebar_Listas de Control");
      expect(sidebarFolders).toContain("04_sidebar_Contenido físico");
      expect(sidebarFolders).toContain("06_sidebar_Comunicación semanal");
    });

    it("should maintain proper depth values throughout the hierarchy", () => {
      // Función recursiva para validar profundidades
      function validateDepth(
        item: HierarchyItem,
        expectedDepth: number
      ): boolean {
        if (item.depth !== expectedDepth) return false;

        return item.childrens.every((child) =>
          validateDepth(child, expectedDepth + 1)
        );
      }

      expect(validateDepth(mockHierarchyData, 0)).toBe(true);
    });

    it("should identify duplicate IDs in the hierarchy if any exist", () => {
      const idsMap = new Map<string, number>();
      const duplicateIds: string[] = [];
      const duplicatesCount: { [key: string]: number } = {};

      // Función recursiva para recolectar todos los IDs y contar ocurrencias
      function collectIds(item: HierarchyItem): void {
        const count = idsMap.get(item.id) || 0;
        idsMap.set(item.id, count + 1);

        if (count > 0) {
          if (!duplicateIds.includes(item.id)) {
            duplicateIds.push(item.id);
          }
          duplicatesCount[item.id] = (duplicatesCount[item.id] || 1) + 1;
        }

        item.childrens.forEach((child) => collectIds(child));
      }

      collectIds(mockHierarchyData);

      // Contamos cuántos elementos totales hay en la jerarquía
      function countItems(item: HierarchyItem): number {
        return (
          1 + item.childrens.reduce((sum, child) => sum + countItems(child), 0)
        );
      }

      const totalItems = countItems(mockHierarchyData);
      const uniqueIds = idsMap.size;

      // Calcular el número total de elementos duplicados (algunos pueden aparecer más de 2 veces)
      const totalDuplicates = duplicateIds.reduce(
        (sum, id) => sum + idsMap.get(id)! - 1,
        0
      );

      console.log(
        `Total items: ${totalItems}, Unique IDs: ${uniqueIds}, Total duplicates: ${totalDuplicates}`
      );
      if (duplicateIds.length > 0) {
        console.log("Duplicate IDs found:", duplicateIds);
        console.log("Occurrences per duplicated ID:");
        duplicateIds.forEach((id) => {
          console.log(`${id}: ${idsMap.get(id)} times`);
        });
      }

      // Verificamos que no hay IDs duplicados
      expect(totalItems).toBe(uniqueIds);
      expect(duplicateIds.length).toBe(0);
    });
  });

  describe("Special Cases", () => {
    it("should contain sections that have tabs inside them", () => {
      // Buscar secciones que contienen tabs (ejemplo específico)
      const listasDeControl = mockHierarchyData.childrens.find(
        (item) => item.id === "1vqGs_32_qSZZ6q_XZUJI94z7PJAeVwc-"
      );

      const colaboradoresSection = listasDeControl?.childrens.find(
        (item) => item.id === "1kGvD3yOQQaYYmCFHI9LjK8BokYr_M7vG"
      );

      const docsAdicionalesTabs = colaboradoresSection?.childrens.find(
        (item) => item.id === "1Dc45ZXGy_tabs_docs_adicionales"
      );

      // Verificar que existe una estructura sección > tabs > tab
      expect(docsAdicionalesTabs).toBeDefined();
      expect(docsAdicionalesTabs?.name).toBe("03_tabs_Documentos Adicionales");
      expect(docsAdicionalesTabs?.driveType).toBe("folder");

      // Verificar que dentro de los tabs hay elementos tab
      expect(docsAdicionalesTabs?.childrens.length).toBeGreaterThan(0);
      expect(docsAdicionalesTabs?.childrens[0].name).toContain("_tab_");
    });

    it("should contain nested tabs (tabs within tabs)", () => {
      // Buscar un caso donde hay tabs dentro de tabs
      const comunicacionSemanal = mockHierarchyData.childrens.find(
        (item) => item.id === "1NiPAKjfGmUAz0LL3pU-fPm5akDCRukuR"
      );

      const outerTabs = comunicacionSemanal?.childrens.find(
        (item) => item.id === "1oquq78uI3XzXlQhkYDH7YYqNO1zOtfNN"
      );

      const postsTab = outerTabs?.childrens.find(
        (item) => item.id === "1ivxAFvSlNs8d6XUKP7C4_3Z8IYupPHzf"
      );

      const innerTabs = postsTab?.childrens.find(
        (item) => item.id === "13gnRjNtlNZAyFvtsxL-tJ3lYIN6boGJL"
      );

      // Verificar que existe una estructura tabs > tab > tabs > tab
      expect(innerTabs).toBeDefined();
      expect(innerTabs?.driveType).toBe("folder");
      expect(innerTabs?.childrens.length).toBeGreaterThan(0);

      // Verificar que los tabs interiores tienen elementos tab
      const innerTab = innerTabs?.childrens[0];
      expect(innerTab?.name).toContain("_tab_");
    });

    it("should contain tabs inside a section inside another tab", () => {
      // Buscar el caso de sección > tabs dentro de otro elemento tab
      const comunicacionSemanal = mockHierarchyData.childrens.find(
        (item) => item.id === "1NiPAKjfGmUAz0LL3pU-fPm5akDCRukuR"
      );

      const storiesContainer = comunicacionSemanal?.childrens[0].childrens.find(
        (item) => item.id === "1609ARV8Xog9lU1csL2Bf_SfxtZJX6lGV"
      );

      const tabsContainer = storiesContainer?.childrens.find(
        (item) => item.id === "18ksNOxGw9dgj_clp1Ll2Oww3JhUVuuIf"
      );

      const semana1 = tabsContainer?.childrens.find(
        (item) => item.id === "1my0BdWzOoV1t11NBw4WfaqHH7CBqrCKL"
      );

      const grupo2 = semana1?.childrens.find(
        (item) => item.id === "1-9OEiWHgdCOeezWb5d1pKTAD0C-IwlbK"
      );

      const variantesTabs = grupo2?.childrens.find(
        (item) => item.id === "1Js87PoQy_tabs_variantes"
      );

      // Verificar estructura tab > tabs > tab > section > tabs
      expect(variantesTabs).toBeDefined();
      expect(variantesTabs?.name).toBe("03_tabs_Variantes");

      // Verificar que estos tabs tienen elementos tab
      expect(variantesTabs?.childrens.length).toBe(2);
      expect(variantesTabs?.childrens[0].name).toContain("_tab_Horizontal");
      expect(variantesTabs?.childrens[1].name).toContain("_tab_Vertical");
    });

    it("should have proper nesting depth up to 9 levels", () => {
      // Encontrar el elemento más profundo (profundidad 9)
      const comunicacionSemanal = mockHierarchyData.childrens.find(
        (item) => item.id === "1NiPAKjfGmUAz0LL3pU-fPm5akDCRukuR"
      );

      // Definir los IDs de los elementos en la ruta al más profundo
      const pathToDeepestElement = [
        "1oquq78uI3XzXlQhkYDH7YYqNO1zOtfNN", // 01_tabs
        "1609ARV8Xog9lU1csL2Bf_SfxtZJX6lGV", // 02_tab_Stories-Semanales
        "18ksNOxGw9dgj_clp1Ll2Oww3JhUVuuIf", // 01_tabs
        "1my0BdWzOoV1t11NBw4WfaqHH7CBqrCKL", // 01_tab_Semana-1
        "1-9OEiWHgdCOeezWb5d1pKTAD0C-IwlbK", // 02_section_Grupo-2
        "1Js87PoQy_tabs_variantes", // 03_tabs_Variantes
        "1Kt98RvZt_tab_horizontal", // 01_tab_Horizontal
        "1Lu09SwXy_horizontal_1", // file-horizontal-1
      ];

      // Navegar recursivamente hasta el elemento más profundo
      let currentItem: HierarchyItem | undefined = comunicacionSemanal;

      for (const elementId of pathToDeepestElement) {
        currentItem = currentItem?.childrens.find(
          (item) => item.id === elementId
        );
        expect(currentItem).toBeDefined();
      }

      // Verificar que el elemento más profundo tiene profundidad 9
      expect(currentItem?.depth).toBe(9);
    });
  });

  describe("Marketing Cards", () => {
    it("should have marketing cards that match files in the hierarchy", () => {
      // Obtener todos los IDs de archivos en la jerarquía
      const fileIds: string[] = [];

      function collectFileIds(item: HierarchyItem): void {
        if (item.driveType === "file") {
          fileIds.push(item.id);
        }
        item.childrens.forEach((child) => collectFileIds(child));
      }

      collectFileIds(mockHierarchyData);

      // Verificar que los archivos en marketingCards existen en la jerarquía
      mockMarketingCards.files.forEach((card) => {
        expect(fileIds).toContain(card.id);
      });
    });

    it("should have proper URL transformations for files", () => {
      mockMarketingCards.files.forEach((card) => {
        expect(card).toHaveProperty("transformedUrl");
        expect(card.transformedUrl).toHaveProperty("preview");
        expect(card.transformedUrl).toHaveProperty("download");
        expect(card.transformedUrl.preview).toContain("https://");
        expect(card.transformedUrl.download).toContain("https://");
      });
    });
  });
});
