# Drive Final - Sistema de exploración y visualización de Google Drive

## Estado actual

El proyecto actual implementa un sistema moderno para interactuar con Google Drive, con un enfoque en la creación de interfaces jerárquicas basadas en convenciones de nomenclatura.

### Tecnologías y Configuración

#### Componentes UI

- **shadcn/ui**: Componentes base accesibles y personalizables
- **Radix UI**: Componentes primitivos accesibles
- **Tailwind CSS**: Estilos y diseño responsive
- **Heroicons**: Iconografía consistente

#### Configuración de Importaciones

El proyecto utiliza los siguientes alias para simplificar las importaciones:

```typescript
// Alias configurados en tsconfig.json, vite.config.ts y vitest.config.ts
{
  "@/*": "./*",
  "@src/*": "./src/*",
  "@drive/*": "./src/features/drive/*",
  "@drive-components/*": "./src/app/[lang]/(marketing)/drive/components/*",
  "@ui/*": "./src/components/ui/*"
}
```

#### Estructura de Directorios Actual

```
/src/
  ├── app/
  │   └── [lang]/
  │       └── (marketing)/
  │           └── drive/
  │               ├── page.tsx
  │               └── components/
  │                   ├── HierarchyViewer.tsx
  │                   ├── preview/
  │                   ├── ui/
  │                   ├── factory/
  │                   ├── elements/
  │                   ├── hierarchy/
  │                   └── explorer/
  └── features/
      └── drive/
          ├── services/
          │   ├── auth/
          │   │   └── GoogleAuthProvider.ts
          │   ├── drive/
          │   │   ├── GoogleDriveService.ts
          │   │   └── GoogleDriveExplorer.ts
          │   └── hierarchy/
          │       └── HierarchyService.ts
          ├── utils/
          │   ├── file/
          │   │   ├── fileUtils.ts
          │   │   └── fileAnalyzer.ts
          │   ├── folder/
          │   │   ├── folderUtils.ts
          │   │   └── pathUtils.ts
          │   └── hierarchy/
          │       └── hierarchyUtils.ts
          ├── types/
          │   ├── drive.d.ts
          │   ├── component.d.ts
          │   ├── hierarchy.d.ts
          │   └── response.d.ts
          └── hooks/
              └── useHierarchy.ts
```

### Componentes Principales

1. **Servicios de Drive**

   - `GoogleDriveService`: Fachada para interactuar con Google Drive
   - `GoogleDriveExplorer`: Explorador recursivo de carpetas y archivos
   - `GoogleAuthProvider`: Proveedor de autenticación para Google API

2. **Utilidades**

   - `hierarchyUtils`: Construcción de estructuras jerárquicas
   - `folderUtils`: Organización de archivos en carpetas
   - `fileUtils`: Transformación de enlaces y análisis de archivos
   - `pathUtils`: Navegación por rutas de carpetas

3. **Componentes UI**
   - `HierarchyViewer`: Visualizador principal de la estructura jerárquica
   - `Notifications`: Sistema de notificaciones usando sonner
   - `FilePreview`: Visualizador de archivos
   - Componentes de shadcn/ui para la interfaz base

### Sistema de Pruebas

- **Vitest**: Framework principal de testing
- **React Testing Library**: Pruebas de componentes
- **MSW**: Mocking de API
- **Jest DOM**: Matchers adicionales para DOM

### Estado Actual

1. **Implementado**:

   - Sistema base de navegación por carpetas
   - Visualización jerárquica básica
   - Sistema de notificaciones
   - Autenticación con Google Drive
   - Pruebas unitarias para componentes principales

2. **En Desarrollo**:

   - Mejoras en la visualización jerárquica
   - Optimización de rendimiento
   - Sistema de caché
   - Documentación completa

3. **Pendiente**:
   - Pruebas end-to-end
   - Optimización de rendimiento para estructuras grandes
   - Sistema de plugins
   - Documentación de API

### Próximos Pasos

1. **Corto Plazo**:

   - Completar la implementación de componentes UI faltantes
   - Mejorar la cobertura de pruebas
   - Optimizar el rendimiento de la visualización jerárquica

2. **Medio Plazo**:

   - Implementar sistema de caché
   - Desarrollar pruebas end-to-end
   - Mejorar la documentación

3. **Largo Plazo**:
   - Sistema de plugins
   - Optimizaciones avanzadas
   - Herramientas de desarrollo

## Visión para Drive New Final

### Rutas principales

1. **`/drive-new-and-final`**

   - Interfaz para buscar carpetas en Google Drive
   - Mostrar solo metadatos básicos (nombre, ID) sin archivos contenidos
   - Búsqueda recursiva opcional

2. **`/drive-new-final/[id]`**
   - Visualización completa del árbol jerárquico desde una carpeta específica
   - Mostrar archivos y carpetas con todos sus metadatos
   - Generación automática de estructura jerárquica con profundidades correctas

### Características clave

1. **Análisis de nombres**

   - Prefijos numéricos (01*, 02*) para ordenamiento
   - Prefijos de componentes (\_embed, \_text, \_section, \_tabs, etc.)
   - Sufijos especiales (\_hidden, \_admin, \_dark, \_light)

2. **Tipos de archivos especiales**

   - Google Workspace: Sheets, Slides, Forms, Docs
   - Tipos incrustables (\_embed) vs. referencias (\_button)
   - Manejo de PDF, imágenes, audio y video

3. **Propiedades personalizadas**

   - Archivos `.txt` con el mismo nombre que otro archivo + sufijo \_copy
   - Metadatos adicionales extraídos de archivos auxiliares

4. **Comportamientos específicos**
   - Descarga disponible para todos los archivos excepto \_noDownloadable
   - Incrustación de contenido cuando corresponda (\_embed)

## Flujo de datos y transformación

### 1. Datos iniciales de Google Drive

Los datos que recibimos inicialmente de la API de Google Drive tienen esta estructura:

```typescript
// Datos iniciales de Google Drive (simplificados)
interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  webViewLink?: string;
  thumbnailLink?: string;
}

interface GoogleDriveFolder {
  id: string;
  name: string;
  mimeType: "application/vnd.google-apps.folder";
  parents?: string[];
}
```

### 2. Procesamiento primario (DriveFile/DriveFolder)

El primer nivel de procesamiento enriquece los datos con información de estructura:

```typescript
// Después del procesamiento primario
interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  webViewLink?: string;
  thumbnailLink?: string;
  // Campos agregados
  depth: number; // Profundidad en la jerarquía
  folder?: string; // Carpeta nivel 1
  subFolder?: string; // Carpeta nivel 2
  prefixes: string[]; // Prefijos identificados en el nombre (ej: "01_", "tab_")
  suffixes: string[]; // Sufijos identificados en el nombre (ej: "_hidden", "_copy")
  transformedUrl?: {
    // URLs procesadas
    preview: string;
    download: string;
    embed?: string;
  };
}

interface DriveFolder {
  id: string;
  name: string;
  mimeType: "application/vnd.google-apps.folder";
  parents?: string[];
  // Campos agregados
  depth: number; // Profundidad en la jerarquía
  prefixes: string[]; // Prefijos identificados en el nombre (ej: "01_", "tab_")
  suffixes: string[]; // Sufijos identificados en el nombre (ej: "_hidden", "_copy")
  children?: string[]; // IDs de elementos hijos (archivos o carpetas)
}
```

### 3. Transformación jerárquica (Interfaces consolidadas)

El segundo nivel transforma los datos en una estructura jerárquica recursiva con una clara separación entre tipo de drive y tipo de componente:

```typescript
// Tipos fundamentales
// Tipos de elementos de Google Drive (solo 2 posibilidades reales)
enum DriveType {
  FILE = "file",
  FOLDER = "folder",
}

// Prefijos de componentes (extensible)
enum Prefix {
  ORDER = "order", // Prefijo numérico para ordenamiento (01_, 02_, etc.)
  TABS = "tabs", // Contenedor de tabs (tabs_)
  TAB = "tab", // Tab individual (tab_)
  SECTION = "section", // Sección (section_)
  ACCORDION = "accordion", // Acordeón (accordion_)
  EMBED = "embed", // Contenido embebido (embed_)
  BUTTON = "button", // Botón (button_)
  MODAL = "modal", // Modal (modal_)
  // Se pueden añadir más prefijos sin modificar el código base
}

// Sufijos de comportamiento (extensible)
enum Suffix {
  HIDDEN = "hidden", // Elemento oculto (_hidden)
  COPY = "copy", // Texto asociado a otro elemento (_copy)
  DARK = "dark", // Variante oscura (_dark)
  LIGHT = "light", // Variante clara (_light)
  DRAFT = "draft", // Borrador (_draft)
  ADMIN = "admin", // Solo para administradores (_admin)
  NO_DOWNLOAD = "nodownload", // No permitir descarga (_nodownload)
  // Se pueden añadir más sufijos sin modificar el código base
}

// Base común para cualquier elemento de la jerarquía
interface BaseItem {
  id: string; // ID original (de Google Drive o generado)
  name: string; // Nombre completo (incluye prefijos/sufijos)
  originalName: string; // Nombre original sin procesar
  displayName: string; // Nombre para mostrar (sin prefijos de orden/tipo)

  // Atributos clave
  driveType: DriveType; // Tipo fundamental: file o folder

  // Metadatos de jerarquía
  depth: number; // Profundidad en la estructura
  order: number; // Orden extraído del prefijo numérico

  // Prefijos y sufijos que determinan comportamiento
  prefixes: string[]; // Lista de prefijos detectados
  suffixes: string[]; // Lista de sufijos detectados

  // Estructura jerárquica
  children: HierarchyItem[]; // Elementos hijos (recursivo)
  parentId?: string; // ID del elemento padre

  // Metadatos adicionales
  metadata?: Record<string, any>; // Metadatos adicionales
}

// Extensión para archivos
interface FileItem extends BaseItem {
  driveType: DriveType.FILE;
  mimeType: string;
  thumbnailLink?: string;
  transformedUrl?: {
    preview: string;
    download: string;
    embed?: string;
  };
  size?: string;
  modifiedTime?: string;
}

// Extensión para carpetas
interface FolderItem extends BaseItem {
  driveType: DriveType.FOLDER;
  // No necesita campos adicionales específicos
}

// Unión de tipos posibles para usar en la jerarquía
type HierarchyItem = FileItem | FolderItem;
```

### 4. Algoritmo de análisis de nombres

```typescript
// Algoritmo para extraer prefijos/sufijos
function extractPrefixesAndSuffixes(name: string): {
  prefixes: string[];
  suffixes: string[];
  displayName: string;
  order: number;
} {
  const prefixes = [];
  const suffixes = [];
  let displayName = name;
  let order = 0;

  // Detectar prefijos numéricos (01_, 02_, etc.)
  const orderMatch = name.match(/^(\d+)_/);
  if (orderMatch) {
    order = parseInt(orderMatch[1], 10);
    prefixes.push(Prefix.ORDER);
    displayName = displayName.replace(/^\d+_/, "");
  }

  // Detectar prefijos de componente (tabs_, section_, etc.)
  Object.values(Prefix).forEach((prefix) => {
    if (name.includes(`${prefix}_`)) {
      prefixes.push(prefix);
      displayName = displayName.replace(`${prefix}_`, "");
    }
  });

  // Detectar sufijos (_hidden, _copy, etc.)
  Object.values(Suffix).forEach((suffix) => {
    if (name.endsWith(`_${suffix}`)) {
      suffixes.push(suffix);
      displayName = displayName.replace(`_${suffix}`, "");
    }
  });

  return { prefixes, suffixes, displayName, order };
}
```

### 5. Gestión de metadatos especiales

La gestión de archivos con sufijo `_copy` permite asociar metadatos adicionales a archivos existentes:

- Si existe un archivo "imagen.jpg" y otro archivo "imagen_copy.txt", el contenido del archivo .txt se procesa como metadatos para la imagen.
- Los metadatos pueden contener descripciones, atributos personalizados, configuraciones de visualización, etc.
- El procesamiento ocurre después de la detección de archivos pero antes de la construcción de la jerarquía.
- La implementación debe manejar correctamente las codificaciones de texto para soportar contenido multilingüe.

Ejemplo de procesamiento:

```typescript
function processMetadataFiles(files: DriveFile[]): DriveFile[] {
  const processedFiles = [...files];
  const copyFiles = files.filter((file) => file.suffixes.includes(Suffix.COPY));

  for (const copyFile of copyFiles) {
    // Encontrar el archivo principal al que pertenece este _copy
    const baseName = copyFile.name.replace(`_${Suffix.COPY}`, "");
    const mainFile = files.find((f) => f.name === baseName);

    if (mainFile) {
      // Leer y procesar contenido del archivo _copy
      const metadata = parseMetadataContent(copyFile.content);
      mainFile.metadata = { ...mainFile.metadata, ...metadata };
    }
  }

  return processedFiles;
}
```

## Proceso de transformación de datos (pipeline)

El flujo completo de transformación de datos sigue estos pasos:

1. **Obtención de datos crudos de Google Drive API**

   - Llamada a la API para obtener archivos y carpetas
   - Recepción de datos sin procesar (GoogleDriveFile, GoogleDriveFolder)

2. **Enriquecimiento con metadatos (nivel 1)**

   - Análisis de nombres para extraer prefijos/sufijos
   - Detección de profundidades en la estructura
   - Transformación de URLs para previsualización/descarga
   - Asignación de metadatos básicos (timestamps, tamaños, etc.)

3. **Construcción de estructura jerárquica (nivel 2)**

   - Organización en árbol basado en relaciones padre-hijo
   - Validación de reglas de anidamiento
   - Procesamiento de archivos especiales (\_copy) y extracción de metadatos
   - Ordenamiento basado en prefijos numéricos

4. **Renderizado de componentes (nivel 3)**
   - Uso de ComponentFactory para crear componentes basados en prefijos
   - Aplicación de comportamientos especiales basados en sufijos
   - Renderizado recursivo de la estructura
   - Manejo de interacciones y estados

## Modelo de recursividad de componentes

El sistema de componentes soporta una recursividad ilimitada con estas reglas:

1. **Distinción clave**:

   - `driveType`: Representa la naturaleza fundamental del elemento en Google Drive (archivo o carpeta)
   - `prefixes` y `suffixes`: Determinan cómo se debe renderizar y comportar cada elemento

2. **Reglas de anidamiento basadas en prefijos**:

   - Carpetas con prefijo `tabs_`: Contienen elementos con prefijo `tab_`
   - Elementos con prefijo `tab_`: Siempre dentro de un elemento con prefijo `tabs_`
   - Elementos con prefijo `section_`: Pueden estar en cualquier nivel
   - Elementos con prefijo `accordion_`: Similar a tabs pero con comportamiento diferente

3. **Ejemplo de estructura recursiva**:

   ```
   Root (driveType: FOLDER)
   ├── Section (driveType: FOLDER, prefixes: ["01_", "section_"])
   │   ├── Tabs (driveType: FOLDER, prefixes: ["01_", "tabs_"])
   │   │   ├── Tab 1 (driveType: FOLDER, prefixes: ["01_", "tab_"])
   │   │   │   ├── Section (driveType: FOLDER, prefixes: ["01_", "section_"])
   │   │   │   │   ├── Documento (driveType: FILE)
   │   │   │   │   └── Imagen (driveType: FILE, suffixes: ["copy"])
   │   │   │   └── Tabs (driveType: FOLDER, prefixes: ["02_", "tabs_"])
   │   │   │       ├── Tab Opción 1 (driveType: FOLDER, prefixes: ["01_", "tab_"])
   │   │   │       │   └── Detalles (driveType: FILE)
   │   │   │       └── Tab Opción 2 (driveType: FOLDER, prefixes: ["02_", "tab_"])
   │   │   │           └── Más info (driveType: FOLDER, prefixes: ["section_"])
   │   │   │               └── Tabs (driveType: FOLDER, prefixes: ["tabs_"])
   │   │   │                   ├── Español (driveType: FOLDER, prefixes: ["01_", "tab_"])
   │   │   │                   └── Inglés (driveType: FOLDER, prefixes: ["02_", "tab_"])
   │   │   └── Tab 2 (driveType: FOLDER, prefixes: ["02_", "tab_"])
   │   └── Instrucciones (driveType: FILE, prefixes: ["02_"], suffixes: ["nodownload"])
   └── Contenido (driveType: FOLDER, prefixes: ["02_", "tabs_"])
       └── Tab General (driveType: FOLDER, prefixes: ["01_", "tab_"])
           └── Contacto (driveType: FOLDER, prefixes: ["01_", "section_"])
   ```

4. **Detección de componentes basada en prefijos/sufijos**:

   - El sistema analiza el nombre para extraer prefijos y sufijos
   - Los prefijos determinan el tipo de componente a renderizar
   - Los sufijos determinan comportamientos especiales

5. **Implementación del Factory Pattern**:

   - `ComponentFactory` es el responsable de crear el componente adecuado
   - Decisión basada en los prefijos/sufijos detectados
   - Permite extender con nuevos tipos sin modificar el código base

6. **Reglas de validación de anidamiento**:

   - Tab solo puede existir dentro de un elemento Tabs
   - Todo elemento Tabs debe tener al menos un elemento Tab
   - Un elemento con sufijo `_copy` debe corresponder a un archivo existente (mismo nombre sin el sufijo)
   - Los prefijos de orden (01*, 02*) deben ser números válidos
   - No se permiten prefijos o sufijos duplicados en el mismo elemento

7. **Sistema de navegación jerárquica**:
   - Elementos con prefijo "tabs*" mostrarán sus hijos "tab*" como pestañas horizontales/verticales
   - Al seleccionar una pestaña, se mostrará su contenido
   - Elementos con prefijo "section\_" se mostrarán como secciones colapsables
   - Archivos se mostrarán según su tipo MIME (imágenes como miniaturas, documentos como iconos, etc.)
   - Elementos con sufijo "\_hidden" no se mostrarán en la UI normal (solo en modo admin)
   - Elementos con sufijo "\_modal" se mostrarán en ventanas modales al hacer clic

### Nueva arquitectura

#### API

```
/api/drive/
  ├── folders/
  │   ├── [list] - Listar carpetas disponibles
  │   ├── [search] - Buscar carpetas por nombre
  │   └── [id] - Obtener detalles de una carpeta
  ├── files/
  │   ├── [id] - Obtener detalles de un archivo
  │   └── [transform]/[id] - Transformar enlaces de archivos
  └── hierarchy/
      └── [id] - Obtener estructura jerárquica desde un ID
```

#### Estructura de código

```
/src/features/drive/
  ├── services/
  │   ├── auth/
  │   │   └── GoogleAuthProvider.ts
  │   ├── drive/
  │   │   ├── GoogleDriveService.ts
  │   │   └── GoogleDriveExplorer.ts
  │   └── hierarchy/
  │       └── HierarchyService.ts
  ├── utils/
  │   ├── file/
  │   │   ├── fileUtils.ts
  │   │   └── fileAnalyzer.ts
  │   ├── folder/
  │   │   ├── folderUtils.ts
  │   │   └── pathUtils.ts
  │   └── hierarchy/
  │       └── hierarchyUtils.ts
  ├── types/
  │   ├── drive.d.ts       // Tipos básicos de Drive
  │   ├── component.d.ts   // Tipos de componentes UI
  │   ├── hierarchy.d.ts   // Estructura jerárquica
  │   └── response.d.ts    // Tipos de respuesta API
  └── components/
      ├── explorer/
      │   ├── FolderExplorer.tsx
      │   └── FileExplorer.tsx
      ├── hierarchy/
      │   ├── HierarchyTree.tsx
      │   └── HierarchyViewer.tsx
      ├── factory/
      │   └── ComponentFactory.tsx  // Factory para crear componentes según tipo
      └── elements/
          ├── tabs/
          ├── sections/
          ├── accordions/
          └── etc...
```

## Estrategia de pruebas

### 1. Pruebas unitarias

Cada componente del sistema debe tener pruebas unitarias dedicadas:

```
/src/features/drive/
  ├── services/
  │   ├── auth/
  │   │   └── __tests__/GoogleAuthProvider.test.ts
  │   ├── drive/
  │   │   ├── __tests__/GoogleDriveService.test.ts
  │   │   └── __tests__/GoogleDriveExplorer.test.ts
  │   └── hierarchy/
  │       └── __tests__/HierarchyService.test.ts
  ├── utils/
  │   ├── file/
  │   │   ├── __tests__/fileUtils.test.ts
  │   │   └── __tests__/fileAnalyzer.test.ts
  │   ├── folder/
  │   │   ├── __tests__/folderUtils.test.ts
  │   │   └── __tests__/pathUtils.test.ts
  │   └── hierarchy/
  │       └── __tests__/hierarchyUtils.test.ts
```

#### Casos de prueba clave

1. **GoogleDriveExplorer**:

   - Pruebas de exploración recursiva con diferentes niveles de profundidad
   - Verificación de detección correcta de profundidades
   - Manejo de carpetas vacías
   - Manejo de carpetas ocultas (\_hidden)
   - Análisis correcto de prefijos y sufijos

2. **HierarchyUtils**:

   - Construcción correcta de la jerarquía para todos los casos posibles
   - Verificación de anidamiento de componentes (tab dentro de tabs, tabs dentro de tab, etc.)
   - Inferencia correcta de tipos basados en nombres
   - Preservación de profundidades en toda la estructura

3. **Componentes UI**:
   - Renderizado correcto de cada tipo de componente
   - Manejo adecuado de la recursividad
   - Comportamiento correcto con diferentes niveles de anidamiento

### 2. Pruebas de integración

Verificar el flujo completo desde los datos de Google Drive hasta la renderización UI:

1. **Flujo API completo**:

   - Exploración de Google Drive → Transformación jerárquica → Renderizado UI
   - Verificar preservación de metadatos y estructura

2. **Casos especiales**:
   - Estructura profundamente anidada (>5 niveles)
   - Mezcla de diferentes tipos de componentes
   - Archivos con propiedades personalizadas (\_copy)

### 3. Datos de prueba

Crear conjuntos de datos de prueba que cubran todos los casos:

1. **Mock simple**: Estructura básica con pocos niveles
2. **Mock complejo**: Estructura profundamente anidada con todos los tipos
3. **Mock de casos extremos**: Casos límite y configuraciones inusuales

## Preguntas pendientes

1. ¿Cómo separar claramente el tipo de elemento en Drive (file/folder) y el tipo de componente UI?

   - **Respuesta**: Se utilizan dos propiedades independientes: `driveType` (limitado a FILE/FOLDER) y los arrays de `prefixes`/`suffixes` que determinan el comportamiento y visualización.

2. ¿Cómo reducir la redundancia en las interfaces de tipo?

   - **Respuesta**: Se ha implementado un sistema de interfaces base con extensiones para casos específicos, y se usan arrays de prefijos/sufijos en lugar de propiedades booleanas individuales.

3. ¿Debemos mantener compatibilidad con implementaciones anteriores?

4. ¿Cómo manejar la autenticación y permisos para acceso a Google Drive?

   - **Respuesta**: Se utiliza GoogleAuthProvider con autenticación de cuenta de servicio.

5. ¿Qué estrategia de caché implementar para optimizar el rendimiento?

6. ¿Cómo gestionar los límites de la API de Google Drive (cuotas)?

7. ¿Implementar sistema de notificaciones para operaciones largas?

   - **Respuesta**: Se implementará un sistema de estados de loading para operaciones largas. Cada operación que pueda tomar tiempo mostrará indicadores de progreso apropiados.

8. ¿Cómo manejar la personalización de componentes por parte del usuario final?

   - **Respuesta**: Mediante el uso de sufijos. Los sufijos como "\_dark", "\_light" permiten variantes personalizadas del mismo componente sin modificar la lógica base.

9. ¿Cómo implementar un sistema de plugins para extender los tipos de componentes?

   - **Respuesta**: No es necesario un sistema de plugins independiente. El patrón Factory ya implementado, junto con los enums extensibles de Prefix y Suffix, proporcionan la extensibilidad necesaria. Se puede expandir agregando nuevos valores a los enums y su correspondiente implementación en el Factory.

10. ¿Cómo extender el sistema para soportar nuevos prefijos y sufijos?

    - **Respuesta**: Simplemente añadiendo nuevos valores a los enums `Prefix` y `Suffix` sin modificar la lógica base.

11. ¿Es necesario implementar validación para asegurar que los prefijos/sufijos son usados correctamente?

    - **Respuesta**: Sí, es esencial implementar un validador que verifique reglas como "tab siempre dentro de tabs" o "archivos \_copy deben tener un archivo principal correspondiente".

## TODOs

- [ ] Consolidar interfaces y tipos en archivos únicos
- [ ] Implementar analizador de prefijos/sufijos de nombres
- [ ] Refactorizar GoogleDriveExplorer para mejorar la recursión
- [ ] Implementar sistema unificado de manejo de errores
- [ ] Crear tests unitarios completos para todos los componentes
- [ ] Optimizar el rendimiento para estructuras grandes
- [ ] Implementar caché de resultados para reducir llamadas a la API
- [ ] Crear ComponentFactory basado en prefijos/sufijos
- [ ] Documentar API completa con Swagger/OpenAPI
- [ ] Implementar logger centralizado para diagnóstico
- [ ] Crear sistema de migraciones para datos existentes
- [ ] Desarrollar procesador de archivos asociados (\_copy) para extraer metadatos
- [ ] Implementar estados de loading para operaciones largas
- [ ] Crear validador de estructura jerárquica (reglas de anidamiento)
- [ ] Diseñar componentes UI para indicar visualmente prefijos/sufijos relevantes
- [ ] Implementar mecanismo para la personalización de componentes mediante sufijos

## Mejores prácticas a aplicar

1. **Principios SOLID**:

   - Single Responsibility: Cada clase con responsabilidad única
   - Open/Closed: Extensible sin modificar código existente
   - Liskov Substitution: Subtipos completamente sustituibles
   - Interface Segregation: Interfaces específicas vs. generales
   - Dependency Inversion: Depender de abstracciones, no implementaciones

2. **Patrones de diseño**:

   - Factory para creación de componentes específicos
   - Strategy para algoritmos intercambiables
   - Observer para notificaciones de cambios
   - Adapter para integración con APIs externas
   - Decorator para añadir funcionalidad sin modificar

3. **Arquitectura**:
   - Clean Architecture: Separación de capas de negocio y presentación
   - DDD: Modelado basado en el dominio
   - Repository Pattern: Abstracción de acceso a datos

## Tecnologías y Patrones

### Tecnologías Principales

- TypeScript para tipado estático
- React para componentes de UI
- Next.js para el framework de aplicación
- Google Drive API para acceso a datos
- Vitest para pruebas unitarias e integración
- React Testing Library para pruebas de componentes
- MSW (Mock Service Worker) para mocking de API
- Radix UI para componentes base accesibles
- Heroicons para iconografía
- Tailwind CSS para estilos

### Configuración de Testing

El proyecto utiliza Vitest como framework principal de testing, junto con React Testing Library para pruebas de componentes. La configuración se encuentra en:

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules", ".next", "dist"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});

// setupTests.ts
import "@testing-library/jest-dom";
import { expect } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);
```

### Componentes UI Core

El proyecto utiliza una combinación de componentes personalizados y componentes de Radix UI:

1. **Componentes Base**:

   - `Dialog` y derivados de Radix UI para modales accesibles
   - `Accordion` de Radix UI para secciones colapsables
   - `Tabs` de Radix UI para navegación por pestañas

2. **Componentes Personalizados**:

   - `Modal`: Wrapper sobre Dialog de Radix UI con soporte para descripciones accesibles
   - `FilePreview`: Visualizador de archivos con soporte para diferentes tipos de contenido
   - `GoogleWorkspacePreview`: Visualizador específico para archivos de Google Workspace
   - `MediaPreview`: Visualizador para archivos multimedia (imágenes, video, audio)

3. **Utilidades UI**:
   - Heroicons para iconografía consistente
   - Tailwind CSS para estilos y diseño responsive

### Dependencias Principales

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-accordion": "^1.2.0",
    "@radix-ui/react-tabs": "^2.0.0",
    "@heroicons/react": "^2.2.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^14.0.0",
    "vitest": "^3.0.8",
    "tailwindcss": "^3.0.0"
  }
}
```
