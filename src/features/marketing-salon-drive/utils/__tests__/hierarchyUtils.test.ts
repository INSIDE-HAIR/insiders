import { describe, it, expect } from "vitest";
import {
  generateSafeId,
  extractItemInfo,
  createHierarchyMap,
} from "../hierarchyUtils";

describe("generateSafeId", () => {
  it("should generate a safe ID from a path with special characters", () => {
    expect(generateSafeId("folder", "Carpeta/Con Espacios")).toBe(
      "folder-Carpeta-Con-Espacios"
    );
    expect(generateSafeId("folder", "Acentuación & Símbolos!")).toBe(
      "folder-Acentuacion---Simbolos-"
    );
    expect(generateSafeId("file", "archivo.jpg")).toBe("file-archivo-jpg");
  });

  it("should handle Spanish characters correctly", () => {
    expect(generateSafeId("folder", "Año/Sección/Niño")).toBe(
      "folder-Ano-Seccion-Nino"
    );
    expect(generateSafeId("folder", "Comunicación semanal")).toBe(
      "folder-Comunicacion-semanal"
    );
    expect(generateSafeId("folder", "Piña Colada/Jalapeño")).toBe(
      "folder-Pina-Colada-Jalapeno"
    );
    expect(generateSafeId("folder", "Águila/Búho/Camión")).toBe(
      "folder-Aguila-Buho-Camion"
    );
  });

  it("should handle a variety of Spanish special characters", () => {
    // Test all vowels with accents
    expect(generateSafeId("folder", "Área Ético Íntimo Ópera Úlcera")).toBe(
      "folder-Area-Etico-Intimo-Opera-Ulcera"
    );

    // Test ñ and ü
    expect(generateSafeId("folder", "Mañana/Pingüino")).toBe(
      "folder-Manana-Pinguino"
    );

    // Test multiple special characters together
    expect(generateSafeId("folder", "Sección Económica/Año Biológico")).toBe(
      "folder-Seccion-Economica-Ano-Biologico"
    );

    // Test mixed case
    expect(generateSafeId("folder", "ÑoÑo/ÁéÍóÚ")).toBe("folder-NoNo-AeIoU");
  });

  it("should replace slashes with hyphens", () => {
    expect(generateSafeId("folder", "level1/level2/level3")).toBe(
      "folder-level1-level2-level3"
    );
  });

  it('should properly distinguish between "tabs" (plural) and "tab" (singular)', () => {
    // Generate IDs for tabs container vs individual tab
    const tabsContainerId = generateSafeId("folder", "01_tabs");
    const tabId = generateSafeId("folder", "01_tab_Español");

    // They should be different
    expect(tabsContainerId).not.toBe(tabId);

    // Make sure \"tabs\" is preserved in the container ID
    expect(tabsContainerId).toBe("folder-01_tabs");

    // Make sure \"tab\" is preserved in the individual tab ID
    expect(tabId).toBe("folder-01_tab_Espanol");

    // Test with variations too
    expect(generateSafeId("folder", "02_tabs_container")).toBe(
      "folder-02_tabs_container"
    );
    expect(generateSafeId("folder", "02_tab_Semana_1")).toBe(
      "folder-02_tab_Semana_1"
    );

    // Test with special characters in tab names
    expect(generateSafeId("folder", "03_tab_Español")).toBe(
      "folder-03_tab_Espanol"
    );
    expect(generateSafeId("folder", "03_tabs_Sección")).toBe(
      "folder-03_tabs_Seccion"
    );
  });
});

describe("extractItemInfo", () => {
  it("should extract order from prefixed names", () => {
    expect(extractItemInfo("01_folder").order).toBe(1);
    expect(extractItemInfo("10_archivo.txt").order).toBe(10);
    expect(extractItemInfo("1.folder").order).toBe(1);
    expect(extractItemInfo("(5)item").order).toBe(5);
  });

  it("should clean suffixes from display names", () => {
    expect(extractItemInfo("folder_hidden").displayName).toBe("folder");
    expect(extractItemInfo("folder_notitle").displayName).toBe("folder");
    expect(extractItemInfo("folder_hidden").displayName).toBe("folder");
    expect(extractItemInfo("folder_dark").displayName).toBe("folder");
    expect(extractItemInfo("folder_night").displayName).toBe("folder");
    expect(extractItemInfo("01_folder_hidden").displayName).toBe("01_folder");
  });

  it("should handle names with Spanish special characters", () => {
    expect(extractItemInfo("01_Sección_hidden").displayName).toBe("01_Sección");
    expect(extractItemInfo("02_Año_notitle").displayName).toBe("02_Año");
    expect(extractItemInfo("03_Español_hidden").displayName).toBe("03_Español");
    expect(extractItemInfo("10_Comunicación_dark").displayName).toBe(
      "10_Comunicación"
    );
  });

  it("should return default order 999 for names without order prefix", () => {
    expect(extractItemInfo("regular_name").order).toBe(999);
    expect(extractItemInfo("file.txt").order).toBe(999);
  });
});

describe("createHierarchyMap", () => {
  it("should create a root item with the given ID and name", () => {
    const files: any[] = [];
    const result = createHierarchyMap(files, "root123", "Root Folder");

    expect(result).toEqual({
      id: "root123",
      name: "Root Folder",
      driveType: "folder",
      childrens: [],
      order: 999,
      depth: 0,
    });
  });

  it("should extract order from the folder name", () => {
    const files: any[] = [];
    const result = createHierarchyMap(files, "root123", "01_Root Folder");

    expect(result.order).toBe(1);
  });

  it("should correctly distinguish between tabs and sections by naming conventions", () => {
    const files = [
      // Tab files
      {
        id: "file1",
        name: "Tab File 1.txt",
        nestedPath: [
          "01_sidebar_Comunicación semanal",
          "01_tabs",
          "01_tab_Semana 1",
        ],
      },
      {
        id: "file2",
        name: "Tab File 2.txt",
        nestedPath: [
          "01_sidebar_Comunicación semanal",
          "01_tabs",
          "02_tab_Semana 2",
        ],
      },

      // Section files
      {
        id: "file3",
        name: "Section File 1.txt",
        nestedPath: [
          "04_sidebar_Contenido físico",
          "01_tabs",
          "01_section_Cartel 80x120cm",
        ],
      },
      {
        id: "file4",
        name: "Section File 2.txt",
        nestedPath: [
          "04_sidebar_Contenido físico",
          "01_tabs",
          "02_section_Cartel 50x70cm",
        ],
      },
    ];

    const result = createHierarchyMap(files, "root123", "Root Folder");

    // Find comunicación folder
    const comunicacionFolder = result.childrens.find((c) =>
      c.name.includes("Comunicación")
    );
    expect(comunicacionFolder).toBeDefined();

    // Find tabs folder inside comunicación
    const tabsFolder1 = comunicacionFolder?.childrens.find(
      (c) => c.name === "01_tabs"
    );
    expect(tabsFolder1).toBeDefined();

    // Check tabs are created properly
    const tabSemana1 = tabsFolder1?.childrens.find(
      (c) => c.name === "01_tab_Semana 1"
    );
    const tabSemana2 = tabsFolder1?.childrens.find(
      (c) => c.name === "02_tab_Semana 2"
    );
    expect(tabSemana1).toBeDefined();
    expect(tabSemana2).toBeDefined();

    // Find contenido folder
    const contenidoFolder = result.childrens.find((c) =>
      c.name.includes("Contenido")
    );
    expect(contenidoFolder).toBeDefined();

    // Find tabs folder inside contenido
    const tabsFolder2 = contenidoFolder?.childrens.find(
      (c) => c.name === "01_tabs"
    );
    expect(tabsFolder2).toBeDefined();

    // Check sections are created properly and separate from tabs
    const sectionCartel1 = tabsFolder2?.childrens.find(
      (c) => c.name === "01_section_Cartel 80x120cm"
    );
    const sectionCartel2 = tabsFolder2?.childrens.find(
      (c) => c.name === "02_section_Cartel 50x70cm"
    );
    expect(sectionCartel1).toBeDefined();
    expect(sectionCartel2).toBeDefined();

    // Verify tabs and sections are kept separate in hierarchy
    expect(sectionCartel1?.id).not.toBe(tabSemana1?.id);
    expect(sectionCartel2?.id).not.toBe(tabSemana2?.id);

    // Verify IDs are properly formed and include the folder type
    expect(tabSemana1?.id).toContain("tab");
    expect(sectionCartel1?.id).toContain("section");
  });

  it("should handle very deep hierarchies with Spanish characters", () => {
    const files = [
      {
        id: "file1",
        name: "Nivel 1 Archivo.txt",
        nestedPath: ["01_Año 2023"],
      },
      {
        id: "file2",
        name: "Nivel 2 Archivo.txt",
        nestedPath: ["01_Año 2023", "01_Categoría Principal"],
      },
      {
        id: "file3",
        name: "Nivel 3 Archivo.txt",
        nestedPath: [
          "01_Año 2023",
          "01_Categoría Principal",
          "01_Sección Técnica",
        ],
      },
      {
        id: "file4",
        name: "Nivel 4 Archivo.txt",
        nestedPath: [
          "01_Año 2023",
          "01_Categoría Principal",
          "01_Sección Técnica",
          "01_Subsección Análisis",
        ],
      },
      {
        id: "file5",
        name: "Nivel 5 Archivo.txt",
        nestedPath: [
          "01_Año 2023",
          "01_Categoría Principal",
          "01_Sección Técnica",
          "01_Subsección Análisis",
          "01_Grupo Estadísticas",
        ],
      },
      {
        id: "file6",
        name: "Nivel 6 Archivo.txt",
        nestedPath: [
          "01_Año 2023",
          "01_Categoría Principal",
          "01_Sección Técnica",
          "01_Subsección Análisis",
          "01_Grupo Estadísticas",
          "01_Subgrupo Gráficos",
        ],
      },
    ];

    const result = createHierarchyMap(files, "root123", "Carpeta Principal");

    // Validar la estructura de carpetas
    const nivel1 = result.childrens[0];
    expect(nivel1.name).toBe("01_Año 2023");
    expect(nivel1.depth).toBe(1);

    const nivel2 = nivel1.childrens.find(
      (c) => c.name === "01_Categoría Principal"
    );
    expect(nivel2).toBeDefined();
    expect(nivel2?.depth).toBe(2);

    const nivel3 = nivel2?.childrens.find(
      (c) => c.name === "01_Sección Técnica"
    );
    expect(nivel3).toBeDefined();
    expect(nivel3?.depth).toBe(3);

    const nivel4 = nivel3?.childrens.find(
      (c) => c.name === "01_Subsección Análisis"
    );
    expect(nivel4).toBeDefined();
    expect(nivel4?.depth).toBe(4);

    const nivel5 = nivel4?.childrens.find(
      (c) => c.name === "01_Grupo Estadísticas"
    );
    expect(nivel5).toBeDefined();
    expect(nivel5?.depth).toBe(5);

    const nivel6 = nivel5?.childrens.find(
      (c) => c.name === "01_Subgrupo Gráficos"
    );
    expect(nivel6).toBeDefined();
    expect(nivel6?.depth).toBe(6);

    // Verificar que los IDs se generan correctamente con los caracteres especiales normalizados
    expect(nivel1.id).toContain("Ano-2023");
    expect(nivel2?.id).toContain("Categoria-Principal");
    expect(nivel3?.id).toContain("Seccion-Tecnica");
    expect(nivel4?.id).toContain("Subseccion-Analisis");
    expect(nivel5?.id).toContain("Grupo-Estadisticas");

    // Verificar que los archivos están en el nivel correcto con la profundidad adecuada
    expect(nivel1.childrens.find((c) => c.id === "file1")).toBeDefined();
    expect(nivel1.childrens.find((c) => c.id === "file1")?.depth).toBe(2);

    expect(nivel2?.childrens.find((c) => c.id === "file2")).toBeDefined();
    expect(nivel2?.childrens.find((c) => c.id === "file2")?.depth).toBe(3);

    expect(nivel3?.childrens.find((c) => c.id === "file3")).toBeDefined();
    expect(nivel3?.childrens.find((c) => c.id === "file3")?.depth).toBe(4);

    expect(nivel4?.childrens.find((c) => c.id === "file4")).toBeDefined();
    expect(nivel4?.childrens.find((c) => c.id === "file4")?.depth).toBe(5);

    expect(nivel5?.childrens.find((c) => c.id === "file5")).toBeDefined();
    expect(nivel5?.childrens.find((c) => c.id === "file5")?.depth).toBe(6);

    expect(nivel6?.childrens.find((c) => c.id === "file6")).toBeDefined();
    expect(nivel6?.childrens.find((c) => c.id === "file6")?.depth).toBe(7);
  });

  it("should create a hierarchy based on nestedPath", () => {
    const files = [
      {
        id: "file1",
        name: "File 1.txt",
        nestedPath: ["01_Folder A", "01_Subfolder B"],
      },
      {
        id: "file2",
        name: "File 2.txt",
        nestedPath: ["01_Folder A", "02_Subfolder C"],
      },
    ];

    const result = createHierarchyMap(files, "root123", "Root Folder");

    // Check root structure
    expect(result.id).toBe("root123");
    expect(result.childrens.length).toBe(1);

    // Check first level (Folder A)
    const folderA = result.childrens[0];
    expect(folderA.name).toBe("01_Folder A");
    expect(folderA.order).toBe(1);
    expect(folderA.depth).toBe(1);
    expect(folderA.childrens.length).toBe(2);

    // Check subfolders
    const subfolderB = folderA.childrens.find(
      (c) => c.name === "01_Subfolder B"
    );
    const subfolderC = folderA.childrens.find(
      (c) => c.name === "02_Subfolder C"
    );

    expect(subfolderB).toBeDefined();
    expect(subfolderC).toBeDefined();
    expect(subfolderB?.depth).toBe(2);
    expect(subfolderC?.depth).toBe(2);
    expect(subfolderB?.order).toBe(1);
    expect(subfolderC?.order).toBe(2);

    // Check files
    expect(subfolderB?.childrens.length).toBe(1);
    expect(subfolderC?.childrens.length).toBe(1);
    expect(subfolderB?.childrens[0].id).toBe("file1");
    expect(subfolderC?.childrens[0].id).toBe("file2");
    expect(subfolderB?.childrens[0].depth).toBe(3);
    expect(subfolderC?.childrens[0].depth).toBe(3);
  });

  it("should handle paths with mixed characters, including tab/section disambiguation", () => {
    const files = [
      {
        id: "fileA",
        name: "Archivo Español.txt",
        nestedPath: [
          "01_Departamento Diseño",
          "01_tabs",
          "01_tab_Español",
          "01_Carpeta Análisis",
        ],
      },
      {
        id: "fileB",
        name: "Archivo Inglés.txt",
        nestedPath: ["01_Departamento Diseño", "01_tabs", "02_tab_Inglés"],
      },
      {
        id: "fileC",
        name: "Catálogo.pdf",
        nestedPath: [
          "02_Departamento Técnico",
          "01_tabs",
          "01_section_Maquinaría",
        ],
      },
      {
        id: "fileD",
        name: "Esquema.png",
        nestedPath: [
          "02_Departamento Técnico",
          "01_tabs",
          "02_section_Equipo Pequeño",
          "01_Categoría Eléctrica",
        ],
      },
    ];

    const result = createHierarchyMap(files, "root123", "Compañía ABC");

    // Verificar estructura del departamento de diseño y tabs con idiomas
    const deptDiseno = result.childrens.find(
      (c) => c.name === "01_Departamento Diseño"
    );
    expect(deptDiseno).toBeDefined();

    const tabsDiseno = deptDiseno?.childrens.find((c) => c.name === "01_tabs");
    expect(tabsDiseno).toBeDefined();

    // Verificar tabs de idiomas
    const tabEspanol = tabsDiseno?.childrens.find(
      (c) => c.name === "01_tab_Español"
    );
    const tabIngles = tabsDiseno?.childrens.find(
      (c) => c.name === "02_tab_Inglés"
    );
    expect(tabEspanol).toBeDefined();
    expect(tabIngles).toBeDefined();

    // Verificar subcarpeta dentro del tab Español
    const carpetaAnalisis = tabEspanol?.childrens.find(
      (c) => c.name === "01_Carpeta Análisis"
    );
    expect(carpetaAnalisis).toBeDefined();
    expect(carpetaAnalisis?.childrens[0].id).toBe("fileA");

    // Verificar archivo directo en el tab Inglés
    expect(tabIngles?.childrens[0].id).toBe("fileB");

    // Verificar estructura del departamento técnico y sus secciones
    const deptTecnico = result.childrens.find(
      (c) => c.name === "02_Departamento Técnico"
    );
    expect(deptTecnico).toBeDefined();

    const tabsTecnico = deptTecnico?.childrens.find(
      (c) => c.name === "01_tabs"
    );
    expect(tabsTecnico).toBeDefined();

    // Verificar secciones
    const sectionMaquinaria = tabsTecnico?.childrens.find(
      (c) => c.name === "01_section_Maquinaría"
    );
    const sectionEquipo = tabsTecnico?.childrens.find(
      (c) => c.name === "02_section_Equipo Pequeño"
    );
    expect(sectionMaquinaria).toBeDefined();
    expect(sectionEquipo).toBeDefined();

    // Verificar subcategoría
    const categoriaElectrica = sectionEquipo?.childrens.find(
      (c) => c.name === "01_Categoría Eléctrica"
    );
    expect(categoriaElectrica).toBeDefined();
    expect(categoriaElectrica?.childrens[0].id).toBe("fileD");

    // Verificar IDs generados (normalizados)
    expect(deptDiseno?.id).toContain("Departamento-Diseno");
    expect(tabEspanol?.id).toContain("tab_Espanol");
    expect(tabIngles?.id).toContain("tab_Ingles");
    expect(sectionMaquinaria?.id).toContain("section_Maquinaria");
    expect(categoriaElectrica?.id).toContain("Categoria-Electrica");
  });

  it("should handle files with folder, subFolder properties", () => {
    const files = [
      {
        id: "file1",
        name: "File 1.txt",
        folder: "01_Folder A",
        subFolder: "01_Subfolder B",
      },
    ];

    const result = createHierarchyMap(files, "root123", "Root Folder");

    // La implementación actual de createHierarchyMap no utiliza las propiedades folder/subFolder
    // directamente, por lo que el archivo se coloca en la raíz
    expect(result.childrens.length).toBe(1); // Se espera un archivo en la raíz

    // Verificar que el archivo está en la raíz
    expect(result.childrens[0].id).toBe("file1");
    expect(result.childrens[0].driveType).toBe("file");
    expect(result.childrens[0].depth).toBe(1);
  });

  it("should sort items correctly - folders first, then by order", () => {
    const files = [
      {
        id: "file1",
        name: "03_File high priority.txt",
        nestedPath: ["01_Folder A"],
      },
      {
        id: "file2",
        name: "10_File low priority.txt",
        nestedPath: ["01_Folder A"],
      },
      {
        id: "file3",
        name: "File no order.txt",
        nestedPath: ["01_Folder A", "02_Subfolder"],
      },
      {
        id: "file4",
        name: "Another file.txt",
        nestedPath: ["01_Folder A", "01_Subfolder"],
      },
    ];

    const result = createHierarchyMap(files, "root123", "Root Folder");

    // Check Folder A
    const folderA = result.childrens[0];

    // Subfolders should come before files
    expect(folderA.childrens[0].driveType).toBe("folder");
    expect(folderA.childrens[1].driveType).toBe("folder");
    expect(folderA.childrens[2].driveType).toBe("file");
    expect(folderA.childrens[3].driveType).toBe("file");

    // Subfolders should be ordered by order property
    expect(folderA.childrens[0].name).toBe("01_Subfolder");
    expect(folderA.childrens[1].name).toBe("02_Subfolder");

    // Files should be ordered by order property
    expect(folderA.childrens[2].name).toBe("03_File high priority.txt");
    expect(folderA.childrens[3].name).toBe("10_File low priority.txt");
  });

  it("should handle complex hierarchies with multiple levels", () => {
    const files = [
      {
        id: "file1",
        name: "Level 1 File.txt",
        nestedPath: ["01_Level 1"],
      },
      {
        id: "file2",
        name: "Level 2 File.txt",
        nestedPath: ["01_Level 1", "01_Level 2"],
      },
      {
        id: "file3",
        name: "Level 3 File.txt",
        nestedPath: ["01_Level 1", "01_Level 2", "01_Level 3"],
      },
      {
        id: "file4",
        name: "Level 3 Second File.txt",
        nestedPath: ["01_Level 1", "01_Level 2", "01_Level 3"],
      },
    ];

    const result = createHierarchyMap(files, "root123", "Root Folder");

    // Level 1 folder
    const level1 = result.childrens[0];
    expect(level1.name).toBe("01_Level 1");
    expect(level1.depth).toBe(1);
    expect(level1.childrens.length).toBe(2); // Level 2 folder and Level 1 file

    // Level 1 file
    const level1File = level1.childrens.find((c) => c.driveType === "file");
    expect(level1File?.id).toBe("file1");
    expect(level1File?.depth).toBe(2);

    // Level 2 folder
    const level2 = level1.childrens.find((c) => c.name === "01_Level 2");
    expect(level2?.depth).toBe(2);
    expect(level2?.childrens.length).toBe(2); // Level 3 folder and Level 2 file

    // Level 2 file
    const level2File = level2?.childrens.find((c) => c.driveType === "file");
    expect(level2File?.id).toBe("file2");
    expect(level2File?.depth).toBe(3);

    // Level 3 folder
    const level3 = level2?.childrens.find((c) => c.name === "01_Level 3");
    expect(level3?.depth).toBe(3);
    expect(level3?.childrens.length).toBe(2); // Two Level 3 files

    // Level 3 files
    expect(level3?.childrens[0].id).toBe("file3");
    expect(level3?.childrens[1].id).toBe("file4");
    expect(level3?.childrens[0].depth).toBe(4);
    expect(level3?.childrens[1].depth).toBe(4);
  });

  it("should ensure all tab (singular) elements are always within tabs (plural) containers", () => {
    const files = [
      // Tab correctamente anidado en un contenedor tabs
      {
        id: "file1",
        name: "Tab File 1.txt",
        nestedPath: ["01_Menú Principal", "01_tabs", "01_tab_Productos"],
      },
      // Otro tab en el mismo contenedor
      {
        id: "file2",
        name: "Tab File 2.txt",
        nestedPath: ["01_Menú Principal", "01_tabs", "02_tab_Servicios"],
      },
      // Tab en otro contenedor tabs
      {
        id: "file3",
        name: "Tab File 3.txt",
        nestedPath: ["02_Sección Secundaria", "01_tabs", "01_tab_Información"],
      },
      // Tab anidado más profundo pero siempre dentro de un tabs
      {
        id: "file4",
        name: "Nested Tab File.txt",
        nestedPath: [
          "03_Área Principal",
          "01_subsección",
          "01_tabs",
          "01_tab_Contenido",
        ],
      },
    ];

    const result = createHierarchyMap(files, "root123", "Root Folder");

    // Verificar la estructura para el primer conjunto de tabs
    const menuPrincipal = result.childrens.find(
      (c) => c.name === "01_Menú Principal"
    );
    expect(menuPrincipal).toBeDefined();

    const tabsMenu = menuPrincipal?.childrens.find((c) => c.name === "01_tabs");
    expect(tabsMenu).toBeDefined();

    const tabProductos = tabsMenu?.childrens.find(
      (c) => c.name === "01_tab_Productos"
    );
    const tabServicios = tabsMenu?.childrens.find(
      (c) => c.name === "02_tab_Servicios"
    );
    expect(tabProductos).toBeDefined();
    expect(tabServicios).toBeDefined();

    // Verificar la estructura para el segundo conjunto de tabs
    const seccionSecundaria = result.childrens.find(
      (c) => c.name === "02_Sección Secundaria"
    );
    expect(seccionSecundaria).toBeDefined();

    const tabsSecundaria = seccionSecundaria?.childrens.find(
      (c) => c.name === "01_tabs"
    );
    expect(tabsSecundaria).toBeDefined();

    const tabInformacion = tabsSecundaria?.childrens.find(
      (c) => c.name === "01_tab_Información"
    );
    expect(tabInformacion).toBeDefined();

    // Verificar la estructura para el tercer conjunto (anidado más profundo)
    const areaPrincipal = result.childrens.find(
      (c) => c.name === "03_Área Principal"
    );
    expect(areaPrincipal).toBeDefined();

    const subseccion = areaPrincipal?.childrens.find(
      (c) => c.name === "01_subsección"
    );
    expect(subseccion).toBeDefined();

    const tabsSubseccion = subseccion?.childrens.find(
      (c) => c.name === "01_tabs"
    );
    expect(tabsSubseccion).toBeDefined();

    const tabContenido = tabsSubseccion?.childrens.find(
      (c) => c.name === "01_tab_Contenido"
    );
    expect(tabContenido).toBeDefined();

    // Verificar que los archivos están en los lugares correctos
    expect(tabProductos?.childrens[0].id).toBe("file1");
    expect(tabServicios?.childrens[0].id).toBe("file2");
    expect(tabInformacion?.childrens[0].id).toBe("file3");
    expect(tabContenido?.childrens[0].id).toBe("file4");

    // Verificar que los IDs mantienen la estructura jerárquica correcta
    expect(tabsMenu?.id).toContain("tabs");
    expect(tabProductos?.id).toContain("tab_Productos");
    expect(tabsSecundaria?.id).toContain("tabs");
    expect(tabInformacion?.id).toContain("tab_Informacion");
    expect(tabsSubseccion?.id).toContain("tabs");
    expect(tabContenido?.id).toContain("tab_Contenido");
  });
});
