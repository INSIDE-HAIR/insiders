# Drive New Final - Sistema de Exploración y Visualización de Google Drive

## Visión General

Este proyecto implementa un sistema moderno y flexible para acceder, explorar y visualizar el contenido de Google Drive, con especial enfoque en la creación de interfaces jerárquicas basadas en convenciones de nomenclatura. El sistema interpreta prefijos y sufijos en los nombres de archivos y carpetas para determinar su representación visual y comportamiento dentro de una interfaz de usuario dinámica.

## Características Principales

- **Exploración jerárquica** de contenido de Google Drive con profundidad ilimitada
- **Sistema de componentes dinámicos** basado en prefijos y sufijos en nombres
- **Renderizado recursivo** de elementos UI anidados (tabs, secciones, acordeones)
- **Gestión automática** de metadatos asociados a archivos
- **Visualización optimizada** según tipos de archivos (imágenes, documentos, vídeos)
- **Interfaz moderna** con gestión de estados de carga y manejo de errores

## Fundamentos Técnicos

### Tipos de Drive vs Tipos de Componentes

El sistema distingue claramente entre dos conceptos:

1. **DriveType**: Naturaleza fundamental del elemento en Google Drive

   - `FILE`: Representa un archivo
   - `FOLDER`: Representa una carpeta

2. **Prefijos y Sufijos**: Determinan la visualización y comportamiento UI
   - Prefijos como `tabs_`, `section_`, `accordion_` para comportamiento estructural
   - Sufijos como `_hidden`, `_dark`, `_copy` para modificadores de comportamiento

### Principios de Diseño

- **Enfoque de Factory**: Componentes UI creados dinámicamente según prefijos/sufijos
- **Arquitectura recursiva**: Soporte para anidamiento ilimitado de componentes
- **Diseño extensible**: Nuevos tipos de componentes sin modificar el código base
- **Separación clara**: Backend para datos y transformación, Frontend para visualización

## Plan de Acción y Tickets

> **NOTA IMPORTANTE**: Debes de seguir la estructura del proyecto actual, pero sin mantener ninguna retrocompatibilidad con algo que este de este servicio anteriormente.

### Fase 1: Fundamentos y Configuración

#### Ticket 1.1: Definición de Tipos Core

- [✅] Crear directorio de tipos en `/src/features/drive/types/`
- [✅] Implementar `drive.d.ts` con tipos básicos (DriveType enum, interfaces base)
- [✅] Implementar `hierarchy.d.ts` con interfaces jerárquicas
- [✅] Crear enums para Prefix y Suffix
- [✅] **Tests**: Validación con TypeScript compiler (`tsc --noEmit`)
- [✅] **Frontend**: No hay entregables visuales en esta fase

#### Ticket 1.2: Configuración de Autenticación

- [✅] Implementar `GoogleAuthProvider.ts` para autenticación
- [✅] Configurar variables de entorno para credenciales
- [✅] Implementar manejo de errores de autenticación
- [✅] **Tests**: Probar conexión a la API de Google Drive
- [✅] **Frontend**: No hay entregables visuales en esta fase

#### Ticket 1.3: Estructura Base del Proyecto

- [✅] Crear estructura de directorios según la arquitectura
- [✅] Implementar configuración de linting (ESLint)
- [✅] Configurar sistema de logging centralizado
- [✅] **Tests**: Validación de estructura con linters
- [✅] **Frontend**: No hay entregables visuales en esta fase

### Fase 2: Capa de Acceso a Datos

#### Ticket 2.1: Explorador de Google Drive

- [✅] Implementar `GoogleDriveExplorer.ts` para exploración recursiva
- [✅] Desarrollar algoritmo de detección de profundidades
- [✅] Añadir soporte para carpetas vacías
- [✅] **Tests**: Exploración recursiva y detección de profundidades
- [✅] **Frontend**: No hay entregables visuales en esta fase

#### Ticket 2.2: Servicio Principal de Drive

- [✅] Implementar `GoogleDriveService.ts` como fachada
- [✅] Desarrollar métodos para listar carpetas y obtener archivos
- [✅] Implementar transformación de enlaces de Drive
- [✅] **Tests**: Listado y transformación de enlaces
- [✅] **Frontend**: No hay entregables visuales en esta fase

#### Ticket 2.3: Analizador de Archivos

- [✅] Implementar `fileAnalyzer.ts` para extraer metadatos
- [✅] Desarrollar algoritmo de extracción de prefijos/sufijos
- [✅] Implementar detección de tipos de contenido especiales
- [✅] **Tests**: Extracción de metadatos y análisis de nombres
- [✅] **Frontend**: No hay entregables visuales en esta fase

### Fase 3: Motor de Jerarquías

#### Ticket 3.1: Servicio de Construcción de Jerarquías

- [✅] Implementar `HierarchyService.ts` para construir árboles jerárquicos
- [✅] Desarrollar algoritmo de asignación padre-hijo
- [✅] Implementar ordenamiento basado en prefijos numéricos
- [✅] **Tests**: Construcción y ordenamiento de jerarquías
- [✅] **Frontend**: No hay entregables visuales en esta fase

#### Ticket 3.2: Procesador de Metadatos

- [✅] Implementar procesamiento de archivos con sufijo `_copy`
- [✅] Desarrollar extractor de información de archivos auxiliares
- [✅] Integrar metadatos a elementos principales
- [✅] **Tests**: Procesamiento de metadatos y archivos asociados
- [✅] **Frontend**: No hay entregables visuales en esta fase

#### Ticket 3.3: Validador de Jerarquías

- [✅] Implementar validador de reglas de anidamiento
- [✅] Desarrollar sistema de verificación de restricciones
- [✅] Crear generador de informes de problemas
- [✅] **Tests**: Validación de reglas y estructura
- [✅] **Frontend**: No hay entregables visuales en esta fase

### Fase 4: REST API y Rutas

#### Ticket 4.1: API de Carpetas

- [✅] Implementar endpoint para listar carpetas en `/api/drive/folders`
- [✅] Añadir endpoint para buscar carpetas en `/api/drive/folders/search`
- [✅] Implementar obtención de detalles en `/api/drive/folders/[id]`
- [✅] **Tests**: Endpoints de carpetas y búsqueda
- [✅] **Frontend**: No hay entregables visuales en esta fase

#### Ticket 4.2: API de Archivos

- [✅] Implementar endpoint para detalles de archivo en `/api/drive/files/[id]`
- [✅] Añadir transformación de enlaces en `/api/drive/files/transform/[id]`
- [✅] Desarrollar soporte para previsualización
- [✅] **Tests**: Endpoints de archivos y transformación
- [✅] **Frontend**: No hay entregables visuales en esta fase

#### Ticket 4.3: API de Jerarquías

- [✅] Implementar endpoint para obtener jerarquía en `/api/drive/hierarchy/[id]`
- [✅] Añadir optimizaciones para estructuras grandes
- [✅] Implementar caché para mejorar rendimiento
- [✅] **Tests**: Endpoints de jerarquía y caché
- [✅] **Frontend**: No hay entregables visuales en esta fase

### Fase 5: Componentes UI

#### Ticket 5.1: Fábrica de Componentes

- [✅] Implementar `ComponentFactory.tsx` para crear componentes dinámicamente
- [✅] Desarrollar sistema de registro de tipos de componentes
- [✅] Añadir soporte para extensibilidad
- [✅] **Tests**: Selección correcta de componentes según prefijos
- [✅] **Frontend**: Visualización básica de componentes dinámicos

#### Ticket 5.2: Componentes Base

- [✅] Implementar componentes para tabs, secciones y acordeones
- [✅] Desarrollar componentes para visualización de archivos
- [✅] Añadir soporte para temas (claro/oscuro)
- [✅] **Tests**: Renderizado correcto de componentes
- [✅] **Frontend**: Visualización de tabs y secciones funcionando

#### Ticket 5.3: Componentes Avanzados

- [✅] Implementar visualización modal y embebida
- [✅] Desarrollar soporte para archivos de Google Workspace
- [✅] Añadir previsualización avanzada de multimedia
- [✅] **Tests**: Funcionamiento correcto de todas las interacciones
- [✅] **Frontend**: Modales y previsualización funcionando

### Fase 6: Páginas Principales

#### Ticket 6.1: Explorador de Carpetas

- [🔄] Implementar página principal en `(marketing)/drive`

  - [x] Configuración base de la ruta
  - [🔄] Implementación del layout principal
  - [🔄] Integración con GoogleDriveService
  - [ ] Implementar paginación y carga infinita
  - [ ] Añadir filtros por tipo de contenido

- [🔄] Desarrollar sistema de búsqueda y filtrado

  - [x] Implementar búsqueda básica por nombre
  - [🔄] Añadir filtros avanzados (tipo, fecha, tamaño)
  - [ ] Implementar búsqueda recursiva en subcarpetas
  - [ ] Añadir historial de búsquedas recientes

- [🔄] Añadir navegación por carpetas

  - [x] Implementar breadcrumbs
  - [🔄] Añadir vista de árbol de carpetas
  - [ ] Implementar drag & drop para reorganizar
  - [ ] Añadir atajos de teclado

- [🔄] **Tests**: Integración con API de carpetas

  - [x] Tests unitarios para componentes
  - [🔄] Tests de integración con GoogleDriveService
  - [ ] Tests de rendimiento para listas grandes
  - [ ] Tests de accesibilidad

- [🔄] **Frontend**: Interfaz de listado de carpetas en desarrollo
  - [x] Implementar grid/list view toggle
  - [🔄] Añadir previsualizaciones de archivos
  - [ ] Implementar ordenamiento personalizado
  - [ ] Añadir modo compacto/detallado

#### Ticket 6.2: Visualizador Jerárquico

- [❌] Implementar página de detalles en `(marketing)/drive/[id]`

  - [ ] Configurar ruta dinámica con parámetros
  - [ ] Implementar layout específico para detalles
  - [ ] Integrar con HierarchyService
  - [ ] Añadir navegación contextual

- [❌] Desarrollar visualización recursiva de componentes

  - [ ] Implementar renderizado de estructura jerárquica
  - [ ] Añadir soporte para diferentes tipos de componentes
  - [ ] Implementar colapso/expansión de niveles
  - [ ] Añadir indicadores de profundidad

- [❌] Añadir navegación interna entre elementos

  - [ ] Implementar sistema de anclas
  - [ ] Añadir navegación por teclado
  - [ ] Implementar breadcrumbs contextuales
  - [ ] Añadir vista previa al hover

- [❌] **Tests**: Integración con API de jerarquías

  - [ ] Tests unitarios para componentes jerárquicos
  - [ ] Tests de integración con HierarchyService
  - [ ] Tests de rendimiento para estructuras profundas
  - [ ] Tests de accesibilidad

- [❌] **Frontend**: Visualización jerárquica pendiente
  - [ ] Implementar diferentes vistas (árbol, lista, grid)
  - [ ] Añadir animaciones de transición
  - [ ] Implementar zoom y pan para estructuras grandes
  - [ ] Añadir modo de presentación

#### Ticket 6.3: Sistema de Carga y Errores

- [❌] Implementar gestión de estados de carga

  - [ ] Añadir indicadores de progreso globales
  - [ ] Implementar estados de carga por componente
  - [ ] Añadir skeleton loaders
  - [ ] Implementar retry automático

- [❌] Desarrollar notificaciones de progreso

  - [x] Integrar sistema de notificaciones con sonner
  - [ ] Añadir notificaciones de progreso detalladas
  - [ ] Implementar cola de notificaciones
  - [ ] Añadir opciones de persistencia

- [❌] Añadir sistema de manejo de errores en UI

  - [ ] Implementar componentes de error específicos
  - [ ] Añadir mensajes de error contextuales
  - [ ] Implementar recuperación de errores
  - [ ] Añadir logging de errores

- [❌] **Tests**: Simulación de operaciones largas y errores

  - [ ] Tests de estados de carga
  - [ ] Tests de manejo de errores
  - [ ] Tests de recuperación
  - [ ] Tests de rendimiento bajo carga

- [❌] **Frontend**: Estados de carga y errores pendientes
  - [ ] Implementar modales de error
  - [ ] Añadir indicadores de estado global
  - [ ] Implementar feedback táctil
  - [ ] Añadir modo offline

### Fase 7: Refinamiento y Entrega

#### Ticket 7.1: Pruebas End-to-End

- [❌] Configurar Cypress para pruebas E2E
- [❌] Implementar escenarios de prueba completos
- [❌] Cubrir casos de borde y recuperación de errores
- [❌] **Tests**: Ejecución exitosa de flujos completos
- [❌] **Frontend**: Validación de experiencia de usuario pendiente

#### Ticket 7.2: Optimización de Rendimiento

- [❌] Implementar estrategias avanzadas de caché
- [❌] Optimizar renderizado para estructuras grandes
- [❌] Añadir lazy loading y code splitting
- [❌] **Tests**: Métricas de rendimiento pendientes
- [❌] **Frontend**: Optimización de rendimiento pendiente

#### Ticket 7.3: Documentación y Finalización

- [🔄] Completar documentación de API con OpenAPI
- [🔄] Desarrollar guía completa de usuario
- [🔄] Crear ejemplos de uso para desarrolladores
- [🔄] **Tests**: Validación de documentación en progreso
- [🔄] **Frontend**: Documentación en desarrollo

## Estructura de Tests

El proyecto sigue una estructura de tests organizada por funcionalidad:

```
/src/
  ├── app/
  │   └── [lang]/
  │       └── (marketing)/
  │           └── drive/
  │               └── components/
  │                   └── __tests__/
  │                       ├── FilePreview.test.tsx
  │                       ├── Modal.test.tsx
  │                       └── ...
  └── features/
      └── drive/
          ├── services/
          │   ├── analyzer/
          │   │   └── __tests__/
          │   │       └── metadataProcessor.test.ts
          │   └── hierarchy/
          │       └── __tests__/
          │           └── hierarchyService.test.ts
          └── utils/
              └── hierarchy/
                  └── __tests__/
                      └── hierarchyValidator.test.ts
```

### Estado Actual de Tests

- ✅ Tests unitarios para servicios y utilidades
- ✅ Tests de componentes UI básicos
- ✅ Tests de integración para API
- 🔄 Tests de componentes avanzados en desarrollo
- ❌ Tests E2E pendientes

## Criterios de Finalización

El proyecto se considerará completamente finalizado cuando cumpla con:

### 1. Funcionalidad Completa

- [ ] Todos los tickets de las 7 fases están completados
- [ ] La exploración de carpetas funciona sin errores
- [ ] La visualización jerárquica es correcta para todos los tipos
- [ ] Los componentes se generan correctamente según prefijos/sufijos

### 2. Calidad del Código

- [ ] Cobertura de pruebas superior al 80%
- [ ] Cero errores de linting críticos
- [ ] Documentación completa para todos los componentes/servicios
- [ ] Código optimizado y siguiendo mejores prácticas

### 3. Experiencia de Usuario

- [ ] Tiempos de carga menores a 2 segundos para casos típicos
- [ ] Navegación fluida entre diferentes niveles jerárquicos
- [ ] Mensajes de error informativos y accionables
- [ ] Interfaz completamente responsiva

### 4. Documentación

- [ ] API documentada con OpenAPI/Swagger
- [ ] Guía de usuario completa con ejemplos
- [ ] Documentación técnica para desarrolladores
- [ ] Guía de resolución de problemas

## Tecnologías y Patrones

### Tecnologías Principales

- TypeScript para tipado estático
- React para componentes de UI
- Next.js para el framework de aplicación
- Google Drive API para acceso a datos
- Vitest para pruebas unitarias e integración
- Cypress para pruebas end-to-end

### Patrones de Diseño

- Factory Pattern para creación dinámica de componentes
- Strategy Pattern para algoritmos intercambiables
- Observer Pattern para notificaciones de estado
- Repository Pattern para acceso a datos
- Adapter Pattern para integración con APIs externas

## Mantenibilidad Futura

El sistema está diseñado para ser fácilmente extensible mediante:

1. Adición de nuevos prefijos/sufijos en los enums correspondientes
2. Registro de nuevos componentes en la fábrica de componentes
3. Implementación de nuevos adaptadores para tipos de archivos adicionales
4. Extensión de la API REST manteniendo la estructura de rutas

### Nueva arquitectura

#### Alias de Importación

El proyecto utiliza los siguientes alias para simplificar las importaciones:

```typescript
// Alias para componentes UI
import { HierarchyViewer } from "@drive-components/HierarchyViewer";
import { FilePreview } from "@drive-components/preview/FilePreview";

// Alias para lógica de negocio
import { GoogleDriveService } from "@drive/services/drive/GoogleDriveService";
import { useHierarchy } from "@drive/hooks/useHierarchy";
import { DriveItem } from "@drive/types/drive";
```

Los alias están configurados en:

- `tsconfig.json` para TypeScript
- `vite.config.ts` para Vitest y desarrollo

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
          │   ├── drive.d.ts       // Tipos básicos de Drive
          │   ├── component.d.ts   // Tipos de componentes UI
          │   ├── hierarchy.d.ts   // Estructura jerárquica
          │   └── response.d.ts    // Tipos de respuesta API
          └── hooks/
              └── useHierarchy.ts
```

## Estrategia de pruebas

### 1. Pruebas unitarias

Cada componente del sistema debe tener pruebas unitarias dedicadas:

```
/src/
  ├── app/
  │   └── [lang]/
  │       └── (marketing)/
  │           └── drive/
  │               └── components/
  │                   └── __tests__/
  │                       ├── HierarchyViewer.test.tsx
  │                       ├── preview/
  │                       └── ...
  └── features/
      └── drive/
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
          └── hooks/
              └── __tests__/useHierarchy.test.ts
```

# Tickets y Tareas - Drive Final

## Estado Actual

### Completado ✅

1. **Configuración Base**

   - [x] Configuración de shadcn/ui y componentes base
   - [x] Configuración de alias en tsconfig.json, vite.config.ts y vitest.config.ts
   - [x] Sistema de notificaciones con sonner
   - [x] Pruebas unitarias para componentes principales

2. **Componentes UI**

   - [x] HierarchyViewer base
   - [x] Sistema de notificaciones
   - [x] Componentes de shadcn/ui integrados
   - [x] Estructura de directorios para componentes

3. **Servicios**

   - [x] GoogleDriveService
   - [x] GoogleDriveExplorer
   - [x] GoogleAuthProvider
   - [x] HierarchyService

4. **Utilidades**
   - [x] Sistema de construcción de jerarquías
   - [x] Utilidades para archivos y carpetas
   - [x] Sistema de análisis de archivos

### En Progreso 🚧

1. **Optimización de Rendimiento**

   - [ ] Implementación de sistema de caché
   - [ ] Optimización de renderizado de jerarquías grandes
   - [ ] Lazy loading de componentes

2. **Mejoras de UI/UX**

   - [ ] Mejoras en la visualización jerárquica
   - [ ] Animaciones y transiciones
   - [ ] Mejoras en la accesibilidad

3. **Pruebas**
   - [ ] Pruebas end-to-end
   - [ ] Pruebas de rendimiento
   - [ ] Pruebas de accesibilidad

### Pendiente 📝

1. **Funcionalidades Principales**

   - [ ] Sistema de plugins
   - [ ] Exportación de datos
   - [ ] Filtros avanzados

2. **Documentación**

   - [ ] Documentación de API
   - [ ] Guías de desarrollo
   - [ ] Ejemplos de uso

3. **Herramientas de Desarrollo**
   - [ ] Herramientas de debugging
   - [ ] Profiladores de rendimiento
   - [ ] Herramientas de análisis de código

## Próximos Tickets

### Alta Prioridad

1. **Optimización de Rendimiento**

   - Implementar sistema de caché para datos de Drive
   - Optimizar renderizado de jerarquías grandes
   - Implementar virtualización de listas

2. **Mejoras de UI/UX**

   - Mejorar visualización de jerarquías
   - Implementar animaciones suaves
   - Mejorar accesibilidad

3. **Pruebas**
   - Implementar pruebas end-to-end
   - Mejorar cobertura de pruebas unitarias
   - Implementar pruebas de rendimiento

### Media Prioridad

1. **Funcionalidades Adicionales**

   - Sistema de plugins
   - Exportación de datos
   - Filtros avanzados

2. **Documentación**

   - Documentación de API
   - Guías de desarrollo
   - Ejemplos de uso

3. **Herramientas de Desarrollo**
   - Herramientas de debugging
   - Profiladores de rendimiento
   - Herramientas de análisis de código

### Baja Prioridad

1. **Mejoras de UX**

   - Temas personalizables
   - Atajos de teclado
   - Modo oscuro

2. **Integración**

   - Integración con otros servicios de Google
   - Exportación a diferentes formatos
   - Sincronización en tiempo real

3. **Características Avanzadas**
   - Análisis de uso
   - Sugerencias inteligentes
   - Automatización de tareas

## Notas de Desarrollo

### Convenciones de Código

1. **Nombrado**

   - Componentes: PascalCase
   - Hooks: useCamelCase
   - Utilidades: camelCase
   - Tipos: PascalCase
   - Interfaces: IPascalCase

2. **Estructura de Archivos**

   - Un componente por archivo
   - Pruebas junto al componente
   - Tipos en archivos separados
   - Utilidades agrupadas por dominio

3. **Pruebas**
   - Pruebas unitarias para componentes
   - Pruebas de integración para servicios
   - Pruebas end-to-end para flujos críticos

### Mejores Prácticas

1. **Componentes**

   - Usar shadcn/ui como base
   - Mantener componentes pequeños y reutilizables
   - Implementar manejo de errores consistente

2. **Estado**

   - Usar hooks personalizados para lógica compleja
   - Mantener estado local cuando sea posible
   - Implementar caché para datos remotos

3. **Rendimiento**
   - Implementar lazy loading
   - Optimizar re-renders
   - Usar memoización cuando sea necesario

### Herramientas

1. **Desarrollo**

   - Vite para desarrollo
   - Vitest para pruebas
   - ESLint para linting
   - Prettier para formateo

2. **UI**

   - shadcn/ui para componentes
   - Tailwind CSS para estilos
   - Heroicons para iconos

3. **Testing**
   - React Testing Library
   - MSW para mocking
   - Jest DOM para matchers
