# Auditoría: Implementación de KPIs de Participantes en Eventos de Calendario

## 📋 Resumen del Requerimiento

Agregar tarjetas de KPI para cada invitado/participante en la parte superior de la página de eventos del calendario. Los KPIs deben mostrar:

1. **Sesiones Planificadas**: Cuántas sesiones están planificadas por cada participante
2. **Respuestas de Asistencia**:
   - Cuántas ha aceptado (sí)
   - Cuántas ha rechazado (no)
   - Cuántas sin respuesta (needsAction)
3. **Estado de Realización**:
   - Sesiones ya realizadas (eventos pasados)
   - Sesiones pendientes (eventos futuros)

## 🔍 Análisis del Estado Actual

### Componentes Existentes
- ✅ **AttendeesFilter**: Ya extrae lista única de invitados con contador de eventos
- ✅ **Calendar Events Page**: Estructura para mostrar y filtrar eventos
- ✅ **CalendarKPIService**: Servicio existente para KPIs generales del calendario
- ✅ **Prisma Schema**: Modelo CalendarKPI para almacenar métricas

### Datos Disponibles
- Lista de eventos con información de attendees
- Estado de respuesta de cada attendee (`responseStatus`)
- Fechas de eventos para determinar si son pasados o futuros
- Filtros activos por invitados

## 📝 Cambios Requeridos

### 1. **Backend - API Endpoint**

#### Nuevo Endpoint: `/api/calendar/events/participant-kpis`
```typescript
// GET /api/calendar/events/participant-kpis
// Query params: 
//   - emails: string[] (lista de emails de participantes)
//   - startDate?: string
//   - endDate?: string
//   - calendarIds?: string[]

// Response:
{
  success: boolean,
  kpis: {
    [email: string]: {
      email: string,
      displayName?: string,
      totalEvents: number,
      acceptedEvents: number,
      declinedEvents: number,
      tentativeEvents: number,
      needsActionEvents: number,
      completedEvents: number,
      upcomingEvents: number,
      participationRate: number,
      responseRate: number
    }
  }
}
```

### 2. **Types & Interfaces**

```typescript
// src/features/calendar/types/participant-kpis.ts
export interface ParticipantKPI {
  email: string;
  displayName?: string;
  totalEvents: number;
  acceptedEvents: number;
  declinedEvents: number;
  tentativeEvents: number;
  needsActionEvents: number;
  completedEvents: number;
  upcomingEvents: number;
  participationRate: number; // % de eventos aceptados
  responseRate: number; // % de eventos con respuesta
}

export interface ParticipantKPIsResponse {
  success: boolean;
  kpis: Record<string, ParticipantKPI>;
}
```

### 3. **Service Layer**

```typescript
// src/features/calendar/services/ParticipantKPIService.ts
export class ParticipantKPIService {
  calculateParticipantKPIs(
    events: GoogleCalendarEvent[], 
    participantEmails: string[]
  ): Record<string, ParticipantKPI>
  
  private calculateEventStatus(
    event: GoogleCalendarEvent,
    participantEmail: string
  ): AttendeeResponseStatus
  
  private isEventCompleted(event: GoogleCalendarEvent): boolean
}
```

### 4. **Frontend Components**

#### 4.1 ParticipantKPICard Component
```typescript
// src/app/[lang]/(private)/admin/calendar/events/components/ParticipantKPICard.tsx
interface ParticipantKPICardProps {
  kpi: ParticipantKPI;
  isLoading?: boolean;
  onRemove?: (email: string) => void;
}
```

Características:
- Diseño compacto con avatar/inicial
- Métricas principales con iconos
- Gráfico circular para tasa de participación
- Badge para estado de respuesta
- Botón X para remover del filtro

#### 4.2 ParticipantKPIGrid Component
```typescript
// src/app/[lang]/(private)/admin/calendar/events/components/ParticipantKPIGrid.tsx
interface ParticipantKPIGridProps {
  selectedAttendees: string[];
  events: GoogleCalendarEvent[];
  onRemoveAttendee: (email: string) => void;
}
```

Características:
- Grid responsive (1-4 columnas según viewport)
- Skeleton loading states
- Mensaje cuando no hay participantes seleccionados
- Animaciones de entrada/salida

### 5. **State Management (Zustand)**

```typescript
// src/stores/participantKPIStore.ts
interface ParticipantKPIState {
  kpis: Record<string, ParticipantKPI>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchKPIs: (emails: string[], events: GoogleCalendarEvent[]) => Promise<void>;
  updateKPI: (email: string, kpi: Partial<ParticipantKPI>) => void;
  clearKPIs: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
```

### 6. **Integración en Calendar Events Page**

Modificar `/src/app/[lang]/(private)/admin/calendar/events/page.tsx`:

1. Importar nuevo componente `ParticipantKPIGrid`
2. Agregar después del `AttendeesFilter`
3. Pasar `selectedAttendees` y `events` filtrados
4. Conectar con store de Zustand para gestión de estado

## 🎨 Diseño UI/UX

### Layout de KPI Card
```
┌─────────────────────────────────┐
│ 👤 Juan Pérez          [X]      │
│    juan@example.com              │
├─────────────────────────────────┤
│ 📅 15 Sesiones                  │
│                                  │
│ ✅ Aceptadas: 10  (67%)         │
│ ❌ Rechazadas: 2  (13%)         │
│ ❓ Sin respuesta: 3 (20%)       │
│                                  │
│ ✓ Realizadas: 8                 │
│ ⏳ Pendientes: 7                 │
│                                  │
│ 📊 Participación: 67%            │
└─────────────────────────────────┘
```

### Colores y Estados
- Verde: Eventos aceptados/completados
- Rojo: Eventos rechazados
- Amarillo: Eventos tentativos
- Gris: Sin respuesta
- Azul: Eventos pendientes

## 🚀 Plan de Implementación

### Fase 1: Backend (1-2 horas)
1. Crear tipos e interfaces
2. Implementar `ParticipantKPIService`
3. Crear endpoint API `/participant-kpis`
4. Agregar tests unitarios

### Fase 2: Frontend Components (2-3 horas)
1. Crear `ParticipantKPICard` con Tailwind/shadcn
2. Crear `ParticipantKPIGrid` container
3. Implementar loading states y animaciones
4. Agregar responsividad

### Fase 3: State Management (1 hora)
1. Crear store de Zustand
2. Implementar acciones y efectos
3. Conectar con API

### Fase 4: Integración (1 hora)
1. Integrar en página de eventos
2. Conectar con filtros existentes
3. Pruebas de integración
4. Optimizaciones de rendimiento

## 🔄 Consideraciones de Rendimiento

1. **Caché de KPIs**: Almacenar en Zustand para evitar recálculos
2. **Debounce**: Al cambiar filtros, esperar 300ms antes de recalcular
3. **Paginación**: Si hay muchos participantes, mostrar máximo 8 cards con "Ver más"
4. **Lazy Loading**: Cargar KPIs bajo demanda cuando se seleccionan participantes
5. **Memoization**: Usar `useMemo` para cálculos pesados

## 📊 Métricas de Éxito

1. Tiempo de carga de KPIs < 500ms
2. Actualización fluida al cambiar filtros
3. UI responsive en todos los dispositivos
4. Datos precisos y en tiempo real

## 🔒 Seguridad

1. Validar permisos de usuario (solo ADMIN)
2. Sanitizar emails en query params
3. Limitar cantidad de participantes por request (máx. 50)
4. Rate limiting en endpoint

## 📝 Notas Adicionales

- Los KPIs se calculan basándose en los eventos filtrados actuales
- Al cambiar filtros de fecha/calendario, los KPIs se recalculan
- Posibilidad futura de exportar KPIs a Excel/CSV
- Considerar agregar gráficos más complejos en v2