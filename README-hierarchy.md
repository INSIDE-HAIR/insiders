# Sistema Jerárquico Recursivo para Visualización de Contenido

Este sistema proporciona una arquitectura flexible y recursiva para visualizar estructuras jerárquicas complejas de archivos y carpetas, especialmente optimizado para contenidos organizados en pestañas, secciones y carpetas.

## Características Principales

- **Recursividad Nativa**: Permite cualquier nivel de anidamiento en la estructura jerárquica
- **Distinción Automática**: Detecta automáticamente tipos de elementos basados en convenciones de nomenclatura
- **Modo Acordeón**: Soporta expansión/colapso en cualquier nivel de la jerarquía
- **Componentes Especializados**: Visualización optimizada para cada tipo de elemento
- **Control de Profundidad**: Indentación visual que refleja la estructura jerárquica
- **Soporte para Archivos**: Muestra archivos con iconos específicos según su tipo MIME

## Estructura del Proyecto

```
src/
├── components/
│   └── shared/
│       ├── hierarchy-components-selector/
│       │   ├── hierarchy-components-selector.tsx  # Componente principal recursivo
│       │   ├── hierarchy-tree-view.tsx           # Visualización en árbol
│       │   ├── tabs/
│       │   │   ├── tabs-container.tsx            # Contenedor para tabs
│       │   │   └── tab-content.tsx               # Contenido individual de tab
│       │   ├── sections/
│       │   │   └── section-content.tsx           # Contenido de sección
│       │   ├── folders/
│       │   │   └── folder-content.tsx            # Visualización de carpeta
│       │   └── files/
│       │       └── file-content.tsx              # Visualización de archivo
│       └── ui/
│           ├── loading-indicator.tsx             # Indicador de carga
│           └── error-display.tsx                 # Visualización de errores
└── features/
    └── marketing-salon-drive/
        └── utils/
            ├── hierarchyUtils.ts                 # Funciones utilitarias
            ├── mockData.ts                       # Datos de ejemplo
            └── __tests__/
                └── hierarchyUtils.test.ts        # Pruebas unitarias
```

## Conceptos Clave

### Reglas de Nomenclatura

El sistema identifica diferentes tipos de elementos basándose en convenciones de nomenclatura:

- **Contenedores de Tabs**: Contienen `_tabs` en su nombre pero no `_tab_`
- **Tabs Individuales**: Contienen `_tab_` en su nombre
- **Secciones**: Contienen `_section_` en su nombre
- **Carpetas**: Elementos con `driveType: "folder"` que no son tabs ni secciones
- **Archivos**: Elementos con `driveType: "file"`

### Modelo de Datos

Todos los elementos en la jerarquía implementan la interfaz `HierarchyItem`:

```typescript
interface HierarchyItem {
  /** Identificador único del elemento */
  id: string;
  /** Nombre del elemento */
  name: string;
  /** Tipo de elemento en Google Drive: 'file' o 'folder' */
  driveType: "file" | "folder";
  /** Elementos hijos (archivos o subcarpetas) */
  childrens: HierarchyItem[];
  /** Orden numérico extraído del prefijo (menor número = mayor prioridad) */
  order?: number;
  /** Nivel de profundidad en la jerarquía (0 para la raíz, aumenta con cada nivel) */
  depth: number;
}
```

## Cómo Funciona la Recursión

El componente principal `HierarchyComponentsSelector` implementa la recursión mediante:

1. **Auto-invocación**: Se llama a sí mismo para renderizar los elementos hijos
2. **Control de Profundidad**: Incrementa el nivel de profundidad en cada llamada recursiva
3. **Renderizado Condicional**: Elige el componente adecuado según el tipo de elemento

Ejemplo simplificado:

```tsx
// Renderizar hijos recursivamente
{
  item.childrens &&
    item.childrens.map((child) => (
      <HierarchyComponentsSelector
        key={child.id}
        item={child}
        depth={depth + 1}
        // ...otros props
        accordionMode={accordionMode}
      />
    ));
}
```

## Uso del Sistema

### Componente Principal

```tsx
import HierarchyComponentsSelector from "@/src/components/shared/hierarchy-components-selector/hierarchy-components-selector";
import { HierarchyItem } from "@/src/features/marketing-salon-drive/utils/hierarchyUtils";

function MiComponente() {
  // Obtener datos jerárquicos (desde API o datos estáticos)
  const [hierarchyData, setHierarchyData] = useState<HierarchyItem | null>(
    null
  );
  const [marketingCards, setMarketingCards] = useState<any>(null);

  // Función para navegar a un elemento
  const handleNavigate = (itemId: string) => {
    // Implementar navegación
  };

  return (
    <div>
      {hierarchyData && (
        <HierarchyComponentsSelector
          item={hierarchyData}
          marketingCards={marketingCards}
          onNavigate={handleNavigate}
          accordionMode={true} // Activar modo acordeón
        />
      )}
    </div>
  );
}
```

### Visualización Alternativa en Árbol

```tsx
import HierarchyTreeView from "@/src/components/shared/hierarchy-components-selector/hierarchy-tree-view";

function TreeViewer() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleToggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  return (
    <HierarchyTreeView
      item={hierarchyData}
      expandedItems={expandedItems}
      onToggleExpand={handleToggleExpand}
    />
  );
}
```

## Creación de Jerarquías

El sistema incluye utilidades para crear jerarquías a partir de listas planas de archivos:

```tsx
import { createHierarchyMap } from "@/src/features/marketing-salon-drive/utils/hierarchyUtils";

// Crear una jerarquía desde una lista de archivos
const hierarchy = createHierarchyMap(files, rootFolderId, rootFolderName);
```

## Funciones Utilitarias

- `generateSafeId`: Genera IDs seguros para uso en rutas y URLs
- `extractItemInfo`: Extrae información como orden y nombre de visualización
- `createHierarchyMap`: Construye la estructura jerárquica completa

## Convenciones de Nombres para Elementos

Para aprovechar al máximo el sistema jerárquico, siga estas convenciones:

- **Prefijos de Orden**: `01_`, `02_`, etc. para establecer el orden de visualización
- **Identificadores de Tipo**:
  - `_tabs_`: Contenedores de múltiples tabs
  - `_tab_`: Tab individual
  - `_section_`: Sección dentro de un tab

Por ejemplo:

- `01_tabs_Principal` - Contenedor de tabs principal (orden 1)
- `01_tab_Introducción` - Primer tab del contenedor
- `01_section_Básica` - Primera sección dentro del tab

## Beneficios vs. Enfoque Tradicional

Comparado con un enfoque tradicional no recursivo:

1. **Flexibilidad**: Soporta cualquier nivel de anidamiento
2. **Mantenibilidad**: Componentes especializados con responsabilidades claras
3. **Escalabilidad**: Fácil extensión para nuevos tipos de elementos
4. **UX Mejorada**: Navegación intuitiva con indentación visual correspondiente a la estructura

## Demostración

Explore la implementación en acción:

- **Vista de Demostración**: `/hierarchy-demo`
- **Comparación de Enfoques**: `/comparison`

## Pruebas

El sistema incluye pruebas exhaustivas para validar:

- Generación correcta de IDs seguros
- Extracción de información de elementos
- Construcción apropiada de jerarquías
- Manejo de caracteres especiales y múltiples niveles de anidamiento
- Distinción entre tipos de elementos por convenciones de nomenclatura

Para ejecutar las pruebas:

```
npm run test
```
