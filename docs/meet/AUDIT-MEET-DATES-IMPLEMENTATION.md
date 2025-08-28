# 🔍 Auditoría Completa: Implementación de Fechas en Meet Rooms

## 📋 Resumen Ejecutivo

Este documento detalla todos los cambios necesarios para implementar fechas opcionales de inicio y fin en las salas de Meet, con filtros avanzados por fecha, búsqueda por nombre y selectores de estado temporal.

### 🎯 Objetivos
1. Añadir campos opcionales `startDate` y `endDate` a las salas de Meet
2. Implementar filtros por fecha (Próximos, Pasados, Hoy, Esta semana, Este mes)
3. Añadir búsqueda por nombre de sala
4. Mostrar estado de sala basado en fechas (Abierta, Cerrada/Archivada, Por abrir)

## 📁 Arquitectura Actual

### Estructura de Base de Datos
- **Modelo**: `MeetSpace` en `/prisma/schema/meet.prisma`
- **Campos actuales**: `id`, `spaceId`, `displayName`, `createdAt`, `createdBy`, `lastSyncAt`
- **Relaciones**: Con `MeetTag` y `MeetGroup` para organización

### Stack Tecnológico
- **Backend**: Next.js API Routes, Prisma ORM
- **Frontend**: React con TypeScript, Tailwind CSS
- **Servicios**: Google Meet API v2, servicios modulares en `/src/features/meet/services/`

## 🔧 Cambios Requeridos

### 1. Base de Datos (Prisma Schema)

**Archivo**: `/prisma/schema/meet.prisma`

#### Cambios en modelo MeetSpace:
```prisma
model MeetSpace {
  // Campos existentes...
  
  // NUEVOS CAMPOS
  startDate   DateTime?  // Fecha opcional de inicio
  endDate     DateTime?  // Fecha opcional de fin
  
  // Campo calculado para estado (no en BD, calculado en runtime)
  // status: 'open' | 'closed' | 'upcoming' | 'always_open'
  
  // Índices adicionales para búsquedas eficientes
  @@index([startDate])
  @@index([endDate])
  @@index([displayName])
}
```

### 2. Types e Interfaces

**Archivos a crear/modificar**:

#### `/src/features/meet/types/room-dates.types.ts` (NUEVO)
```typescript
// Estados de sala basados en fechas
export enum RoomStatus {
  ALWAYS_OPEN = 'always_open',  // Sin fecha de fin
  OPEN = 'open',                 // Entre startDate y endDate
  CLOSED = 'closed',             // Pasó endDate
  UPCOMING = 'upcoming'          // No ha llegado startDate
}

// Filtros de fecha predefinidos
export enum DateFilter {
  ALL = 'all',
  UPCOMING = 'upcoming',
  PAST = 'past',
  TODAY = 'today',
  THIS_WEEK = 'this_week',
  THIS_MONTH = 'this_month'
}

// Interface para filtros de búsqueda
export interface RoomFilters {
  search?: string;
  dateFilter?: DateFilter;
  customDateRange?: {
    start?: Date;
    end?: Date;
  };
  tags?: string[];
  groups?: string[];
}

// Interface extendida para MeetSpace con fechas
export interface MeetSpaceWithDates extends MeetSpace {
  startDate?: Date | null;
  endDate?: Date | null;
  status?: RoomStatus;
}
```

### 3. Validaciones (Zod Schemas)

**Archivo**: `/src/features/meet/validations/SpaceConfigSchema.ts`

#### Añadir validaciones:
```typescript
export const SpaceDatesSchema = z.object({
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.endDate > data.startDate;
    }
    return true;
  },
  {
    message: "La fecha de fin debe ser posterior a la fecha de inicio",
    path: ["endDate"],
  }
);

// Actualizar CreateSpaceSchema
export const CreateSpaceSchema = existingSchema.extend({
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
});
```

### 4. Servicios Backend

#### `/src/features/meet/services/MeetStorageService.ts`

**Métodos a añadir/modificar**:
- `registerSpace()` - Añadir parámetros startDate y endDate
- `getAllSpaceIds()` - Añadir filtros por fecha
- `searchSpaces()` - NUEVO método para búsqueda y filtrado
- `getSpacesByDateFilter()` - NUEVO método para filtros predefinidos
- `calculateRoomStatus()` - NUEVO método helper para calcular estado

#### `/src/features/meet/services/MeetRoomFilterService.ts` (NUEVO)
```typescript
export class MeetRoomFilterService {
  // Aplicar filtros de fecha
  filterByDateRange(spaces: MeetSpace[], filter: DateFilter): MeetSpace[]
  
  // Búsqueda por nombre
  searchByName(spaces: MeetSpace[], searchTerm: string): MeetSpace[]
  
  // Calcular estado de sala
  calculateStatus(space: MeetSpace): RoomStatus
  
  // Aplicar múltiples filtros
  applyFilters(spaces: MeetSpace[], filters: RoomFilters): MeetSpace[]
}
```

### 5. API Endpoints

#### `/src/app/api/meet/rooms/route.ts`

**Modificar GET**:
```typescript
// Añadir query parameters
- search: string (búsqueda por nombre)
- dateFilter: DateFilter (filtro predefinido)
- startDate: string (fecha personalizada inicio)
- endDate: string (fecha personalizada fin)
- includeStatus: boolean (incluir estado calculado)
```

**Modificar POST**:
```typescript
// Añadir campos en body
- startDate?: string (ISO date)
- endDate?: string (ISO date)
```

#### `/src/app/api/meet/rooms/[id]/route.ts`

**Modificar PATCH**:
```typescript
// Permitir actualización de fechas
- startDate?: string
- endDate?: string
```

### 6. Frontend Components

#### `/src/features/meet/components/filters/RoomDateFilters.tsx` (NUEVO)
```typescript
interface RoomDateFiltersProps {
  onFilterChange: (filter: DateFilter) => void;
  currentFilter: DateFilter;
}

// Componente con selector de filtros predefinidos
// Todos, Próximos, Pasados, Hoy, Esta semana, Este mes
```

#### `/src/features/meet/components/filters/RoomSearchBar.tsx` (NUEVO)
```typescript
interface RoomSearchBarProps {
  onSearchChange: (search: string) => void;
  placeholder?: string;
}

// Barra de búsqueda con debounce
```

#### `/src/features/meet/components/atoms/badges/RoomStatusBadge.tsx`

**Actualizar para mostrar nuevos estados**:
```typescript
// Añadir variantes para:
- always_open: Badge verde "Siempre abierta"
- open: Badge verde "Abierta"
- closed: Badge gris "Cerrada/Archivada"
- upcoming: Badge azul "Por abrir"
```

#### `/src/app/[lang]/(private)/admin/meet/rooms/client-page-simple.tsx`

**Modificaciones necesarias**:
1. Añadir estado para filtros
2. Integrar RoomDateFilters y RoomSearchBar
3. Añadir lógica de filtrado en cliente
4. Mostrar RoomStatusBadge basado en fechas
5. Añadir campos de fecha en CreateRoomModal

### 7. Hooks Personalizados

#### `/src/features/meet/hooks/useRoomFilters.ts` (NUEVO)
```typescript
export function useRoomFilters(initialFilters?: RoomFilters) {
  // Estado de filtros
  // Función para aplicar filtros
  // Debounce para búsqueda
  // Persistencia en URL params
}
```

#### `/src/features/meet/hooks/useRoomStatus.ts` (NUEVO)
```typescript
export function useRoomStatus(space: MeetSpace) {
  // Calcular estado basado en fechas
  // Actualizar cada minuto para cambios en tiempo real
  // Retornar status y metadata
}
```

### 8. Utilidades

#### `/src/features/meet/utils/date-filters.ts` (NUEVO)
```typescript
// Funciones helper para filtros de fecha
export function isToday(date: Date): boolean
export function isThisWeek(date: Date): boolean
export function isThisMonth(date: Date): boolean
export function isPast(date: Date): boolean
export function isUpcoming(date: Date): boolean
export function calculateRoomStatus(startDate?: Date, endDate?: Date): RoomStatus
```

## 📝 Plan de Implementación

### Fase 1: Backend (Base de Datos y API)
1. ✅ Actualizar Prisma schema con campos de fecha
2. ✅ Ejecutar migración de base de datos
3. ✅ Crear types y enums para fechas y estados
4. ✅ Actualizar validaciones con Zod
5. ✅ Modificar MeetStorageService
6. ✅ Crear MeetRoomFilterService
7. ✅ Actualizar endpoints API con filtros

### Fase 2: Frontend (Componentes y UI)
1. ⏳ Crear componentes de filtros (RoomDateFilters, RoomSearchBar)
2. ⏳ Actualizar RoomStatusBadge con nuevos estados
3. ⏳ Crear hooks personalizados (useRoomFilters, useRoomStatus)
4. ⏳ Integrar filtros en página principal
5. ⏳ Añadir campos de fecha en CreateRoomModal
6. ⏳ Implementar actualización de fechas en RoomDetailsModal

### Fase 3: Testing y Optimización
1. ⏳ Tests unitarios para servicios de filtrado
2. ⏳ Tests de integración para API
3. ⏳ Tests E2E para flujo completo
4. ⏳ Optimización de queries con índices
5. ⏳ Caché de resultados filtrados

## 🔄 Migraciones de Datos

### Script de migración
```sql
-- Añadir columnas opcionales
ALTER TABLE MeetSpace ADD COLUMN startDate DATETIME;
ALTER TABLE MeetSpace ADD COLUMN endDate DATETIME;

-- Crear índices para búsquedas eficientes
CREATE INDEX idx_meet_space_start_date ON MeetSpace(startDate);
CREATE INDEX idx_meet_space_end_date ON MeetSpace(endDate);
CREATE INDEX idx_meet_space_display_name ON MeetSpace(displayName);
```

## 🧪 Casos de Prueba

### Escenarios de Estado
1. **Siempre abierta**: Sin fecha de fin → Estado: `always_open`
2. **Abierta**: Fecha actual entre inicio y fin → Estado: `open`
3. **Cerrada**: Fecha actual después del fin → Estado: `closed`
4. **Por abrir**: Fecha actual antes del inicio → Estado: `upcoming`

### Filtros de Fecha
1. **Hoy**: Salas con fecha actual entre inicio y fin
2. **Esta semana**: Salas activas en los próximos 7 días
3. **Este mes**: Salas activas en el mes actual
4. **Próximas**: Salas con startDate en el futuro
5. **Pasadas**: Salas con endDate en el pasado

## 📊 Impacto en Performance

### Consideraciones
- Índices en campos de fecha para queries eficientes
- Caché de cálculos de estado en frontend
- Paginación para grandes conjuntos de datos
- Lazy loading de detalles de sala

### Optimizaciones Recomendadas
1. Usar proyecciones en queries para campos necesarios
2. Implementar caché Redis para filtros frecuentes
3. Batch processing para actualización de estados
4. Virtual scrolling para listas largas

## ✅ Checklist de Implementación

- [ ] Actualizar schema de Prisma
- [ ] Ejecutar migración de base de datos
- [ ] Crear types y enums
- [ ] Actualizar validaciones
- [ ] Modificar servicios backend
- [ ] Actualizar endpoints API
- [ ] Crear componentes de filtros
- [ ] Actualizar badges de estado
- [ ] Integrar filtros en UI
- [ ] Añadir campos de fecha en modales
- [ ] Crear hooks personalizados
- [ ] Implementar utilidades de fecha
- [ ] Escribir tests
- [ ] Documentar cambios
- [ ] Deploy y verificación

## 🚀 Siguiente Paso

Comenzar con la **Fase 1: Backend** actualizando el schema de Prisma y ejecutando la migración de base de datos.