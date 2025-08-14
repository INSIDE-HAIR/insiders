# Integración de Google Meet Members en la Tabla de Eventos del Calendario

## Resumen Ejecutivo

Sí, es posible mostrar los miembros de Google Meet en la tabla de eventos del calendario, pero con consideraciones importantes sobre la arquitectura y limitaciones de las APIs.

## Análisis de Viabilidad

### ✅ Factible
La integración es técnicamente posible utilizando:
- **Google Calendar API v3**: Para obtener eventos y URLs de Meet
- **Google Meet API v2 Beta**: Para obtener información de espacios y miembros

### ⚠️ Consideraciones Importantes

1. **Diferencia entre Meeting IDs**:
   - Los IDs de Meet generados desde Calendar (`conferenceData.conferenceId`) NO son compatibles directamente con la API de Meet v2
   - Necesitamos extraer el `space_id` de la URL de Meet

2. **Limitaciones de la API**:
   - La API de Meet v2 Beta requiere permisos específicos
   - Los miembros solo están disponibles para espacios creados con la API de Meet (no para meetings ad-hoc)

## Arquitectura de la Solución

### Flujo de Datos

```
1. Calendar API → Obtener eventos con URLs de Meet
2. Extraer space_id de la URL → meet.google.com/xxx-yyyy-zzz
3. Meet API v2 Beta → Obtener miembros del espacio
4. Mostrar en tabla → Nueva columna "Members"
```

### APIs y Endpoints Necesarios

#### 1. Google Calendar API v3
```
GET /calendar/v3/calendars/{calendarId}/events
→ Obtiene eventos con conferenceData.entryPoints[].uri
```

#### 2. Google Meet API v2 Beta
```
GET /v2beta/spaces/{spaceId}/members
→ Lista los miembros configurados en el espacio
```

## Plan de Implementación

### Paso 1: Configurar Permisos y Scopes

```typescript
// Nuevos scopes necesarios
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/meetings.space.created',
  'https://www.googleapis.com/auth/meetings.space.readonly'
];
```

### Paso 2: Crear Servicio de Google Meet

```typescript
// src/features/calendar/services/GoogleMeetService.ts
import { google } from 'googleapis';

export class GoogleMeetService {
  private meetClient;

  constructor(auth: OAuth2Client) {
    // La API de Meet v2 Beta no está en googleapis estándar
    // Necesitaremos usar REST directo o el SDK beta
    this.meetClient = google.meet('v2beta');
  }

  // Extraer space ID de la URL de Meet
  extractSpaceId(meetUrl: string): string | null {
    const patterns = [
      /meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/,
      /meet\.google\.com\/s\/([a-zA-Z0-9_-]+)/
    ];
    
    for (const pattern of patterns) {
      const match = meetUrl.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  // Obtener miembros del espacio
  async getSpaceMembers(spaceId: string) {
    try {
      const response = await fetch(
        `https://meet.googleapis.com/v2beta/spaces/${spaceId}/members`,
        {
          headers: {
            'Authorization': `Bearer ${await this.getAccessToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch members: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching Meet members:', error);
      return { members: [] };
    }
  }
}
```

### Paso 3: Modificar el Tipo de Evento

```typescript
// src/features/calendar/types/index.ts
export interface GoogleCalendarEventWithMembers extends GoogleCalendarEvent {
  meetMembers?: {
    email: string;
    role: 'ROLE_UNSPECIFIED' | 'COHOST';
    name?: string;
  }[];
}
```

### Paso 4: Actualizar la API de Eventos

```typescript
// src/app/api/calendar/events/route.ts
import { GoogleMeetService } from '@/src/features/calendar/services/GoogleMeetService';

export async function GET(request: Request) {
  // ... código existente ...
  
  const events = await calendarService.listEvents();
  const meetService = new GoogleMeetService(auth);
  
  // Enriquecer eventos con miembros de Meet
  const eventsWithMembers = await Promise.all(
    events.map(async (event) => {
      if (event.conferenceData?.entryPoints?.[0]?.uri) {
        const meetUrl = event.conferenceData.entryPoints[0].uri;
        const spaceId = meetService.extractSpaceId(meetUrl);
        
        if (spaceId) {
          try {
            const membersData = await meetService.getSpaceMembers(spaceId);
            return {
              ...event,
              meetMembers: membersData.members || []
            };
          } catch (error) {
            console.error(`Failed to fetch members for space ${spaceId}:`, error);
          }
        }
      }
      return event;
    })
  );
  
  return NextResponse.json({ events: eventsWithMembers });
}
```

### Paso 5: Agregar Columna de Miembros

```typescript
// src/app/[lang]/(private)/admin/calendar/events/columns.tsx

// Agregar a AVAILABLE_COLUMNS
export const AVAILABLE_COLUMNS = {
  // ... columnas existentes ...
  meetMembers: {
    id: "meetMembers",
    label: "Meet Members",
    category: "meeting",
  },
};

// Nueva columna
{
  id: "meetMembers",
  header: "Meet Members",
  accessorKey: "meetMembers",
  cell: ({ row }) => {
    const members = row.original.meetMembers || [];
    
    if (members.length === 0) {
      return <span className="text-muted-foreground">No members</span>;
    }
    
    return (
      <div className="flex flex-col gap-1">
        {members.slice(0, 3).map((member, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Badge variant={member.role === 'COHOST' ? 'default' : 'secondary'}>
              {member.role === 'COHOST' ? 'Co-host' : 'Member'}
            </Badge>
            <span className="text-sm truncate max-w-[150px]">
              {member.email}
            </span>
          </div>
        ))}
        {members.length > 3 && (
          <span className="text-xs text-muted-foreground">
            +{members.length - 3} more
          </span>
        )}
      </div>
    );
  },
},
```

### Paso 6: Manejo de Cache y Performance

```typescript
// src/features/calendar/services/MeetMembersCache.ts
export class MeetMembersCache {
  private cache = new Map<string, { members: any[], timestamp: number }>();
  private TTL = 5 * 60 * 1000; // 5 minutos

  get(spaceId: string) {
    const cached = this.cache.get(spaceId);
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.members;
    }
    return null;
  }

  set(spaceId: string, members: any[]) {
    this.cache.set(spaceId, { members, timestamp: Date.now() });
  }
}
```

## Limitaciones y Alternativas

### Limitaciones

1. **Solo espacios de Meet**: No funciona con meetings ad-hoc o instantáneos
2. **Permisos**: Requiere que el usuario tenga permisos para ver los miembros
3. **Performance**: Múltiples llamadas a la API pueden ser lentas
4. **API Beta**: La API puede cambiar o tener limitaciones

### Alternativas

1. **Usar attendees de Calendar**: Más simple pero menos preciso
```typescript
// Usar los attendees del evento de calendario
const attendees = event.attendees || [];
```

2. **Lazy Loading**: Cargar miembros solo cuando se expande la fila
3. **Webhook Integration**: Usar webhooks para mantener datos sincronizados

## Configuración de Desarrollo

### 1. Habilitar Meet API v2 Beta
```bash
# En Google Cloud Console
1. Ir a APIs & Services
2. Buscar "Google Meet API"
3. Habilitar la API
4. Agregar los scopes necesarios a OAuth consent screen
```

### 2. Variables de Entorno
```env
GOOGLE_MEET_API_ENABLED=true
GOOGLE_MEET_MEMBERS_CACHE_TTL=300000
```

### 3. Testing
```typescript
// src/features/calendar/services/__tests__/GoogleMeetService.test.ts
describe('GoogleMeetService', () => {
  it('should extract space ID from Meet URL', () => {
    const service = new GoogleMeetService(mockAuth);
    
    expect(service.extractSpaceId('https://meet.google.com/abc-defg-hij'))
      .toBe('abc-defg-hij');
    
    expect(service.extractSpaceId('https://meet.google.com/s/custom-space'))
      .toBe('custom-space');
  });
});
```

## Conclusión

La integración es factible pero requiere:
1. Configuración adicional de APIs
2. Manejo cuidadoso de permisos
3. Optimización de performance
4. Consideración de las limitaciones de la API Beta

Recomiendo empezar con una implementación básica usando los attendees del calendario y luego evolucionar hacia la integración completa con Meet API v2 Beta si es necesario.