import { z } from "zod";

// Define los tipos básicos que usaremos en nuestro sistema
type UserId = string;
type RoleId = string;
type GroupId = string;
type TagId = string;
type ResourceId = string;

// Enumeración para los niveles de acceso
enum AccessLevel {
  READ = "read",
  WRITE = "write",
  ADMIN = "admin",
}

// Esquema para rangos de tiempo, utilizado en varias partes del control de acceso
const TimeRangeSchema = z.object({
  startDate: z.string().optional(), // Fecha de inicio en formato ISO
  endDate: z.string().optional(),   // Fecha de finalización en formato ISO
  startTime: z.string().optional(), // Hora de inicio en formato HH:MM
  endTime: z.string().optional(),   // Hora de finalización en formato HH:MM
  daysOfWeek: z.array(z.enum([
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ])).optional(), // Días de la semana en los que se aplica
});

// Tipo derivado del esquema TimeRange
type TimeRange = z.infer<typeof TimeRangeSchema>;

// Esquema para resources (productos o servicios)
const ResourceSchema = z.object({
  id: z.string(),
  type: z.enum(['product', 'service']),
  name: z.string(),
  accessLevel: z.nativeEnum(AccessLevel),
  timeRange: TimeRangeSchema.optional(),
});

// Tipo derivado del esquema Resource
type Resource = z.infer<typeof ResourceSchema>;

// Esquema principal de control de acceso
const AccessControlSchema = z.object({
  general: z.object({
    isEnabled: z.boolean().default(true), // Interruptor general para el control de acceso
    timeRange: TimeRangeSchema.optional(),
    maxConcurrentUsers: z.number().optional(), // Límite de usuarios concurrentes
    maxAccessCount: z.number().optional(),     // Límite total de accesos
  }),
  roles: z.array(z.object({
    id: z.string(),
    accessLevel: z.nativeEnum(AccessLevel),
    timeRange: TimeRangeSchema.optional(),
  })),
  users: z.array(z.object({
    id: z.string(),
    accessLevel: z.nativeEnum(AccessLevel),
    timeRange: TimeRangeSchema.optional(),
  })),
  groups: z.array(z.object({
    id: z.string(),
    accessLevel: z.nativeEnum(AccessLevel),
    timeRange: TimeRangeSchema.optional(),
  })),
  tags: z.array(z.object({
    id: z.string(),
    accessLevel: z.nativeEnum(AccessLevel),
    timeRange: TimeRangeSchema.optional(),
  })),
  Resource: z.array(ResourceSchema),
  ipRestrictions: z.array(z.object({
    start: z.string().ip(),
    end: z.string().ip().optional(),
  })).optional(),
  geoRestrictions: z.array(z.object({
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
  })).optional(),
  deviceRestrictions: z.array(z.object({
    type: z.enum(['desktop', 'mobile', 'tablet']),
    os: z.array(z.string()).optional(),
  })).optional(),
  requiredAuthMethods: z.array(z.enum(['password', 'two-factor', 'sso'])).optional(),
});

// Tipo derivado del esquema AccessControl
type AccessControl = z.infer<typeof AccessControlSchema>;

// Interfaz que representa a un usuario en nuestro sistema
interface User {
  id: UserId;
  roles: RoleId[];
  groups: GroupId[];
  tags: TagId[];
  resources: ResourceId[];
  ip: string;
  geoLocation: {
    country?: string;
    region?: string;
    city?: string;
  };
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    os?: string;
  };
  authMethods: Array<'password' | 'two-factor' | 'sso'>;
}

// Función principal para verificar el acceso de un usuario
function hasAccess(user: User, accessControl: AccessControl, currentDate: Date): boolean {
  // Verificar si el control de acceso está habilitado en general
  if (!accessControl.general.isEnabled) return true;

  // Verificar restricciones generales de tiempo
  if (!isWithinTimeRange(currentDate, accessControl.general.timeRange)) return false;

  // Verificar restricciones de IP
  if (accessControl.ipRestrictions && !isIpAllowed(user.ip, accessControl.ipRestrictions)) return false;

  // Verificar restricciones geográficas
  if (accessControl.geoRestrictions && !isGeoAllowed(user.geoLocation, accessControl.geoRestrictions)) return false;

  // Verificar restricciones de dispositivo
  if (accessControl.deviceRestrictions && !isDeviceAllowed(user.device, accessControl.deviceRestrictions)) return false;

  // Verificar métodos de autenticación requeridos
  if (accessControl.requiredAuthMethods && !hasRequiredAuthMethods(user.authMethods, accessControl.requiredAuthMethods)) return false;

  // Verificar acceso basado en roles, grupos, tags y resources
  return (
    hasRoleAccess(user, accessControl.roles, currentDate) ||
    hasGroupAccess(user, accessControl.groups, currentDate) ||
    hasTagAccess(user, accessControl.tags, currentDate) ||
    hasResourceAccess(user, accessControl.resources, currentDate)
  );
}

// Funciones auxiliares para verificar diferentes aspectos del control de acceso

function isWithinTimeRange(currentDate: Date, timeRange?: TimeRange): boolean {
  if (!timeRange) return true;

  const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getDay()];
  
  if (timeRange.daysOfWeek && !timeRange.daysOfWeek.includes(currentDay as any)) return false;

  if (timeRange.startDate && new Date(timeRange.startDate) > currentDate) return false;
  if (timeRange.endDate && new Date(timeRange.endDate) < currentDate) return false;

  if (timeRange.startTime || timeRange.endTime) {
    const currentTime = currentDate.getHours() * 60 + currentDate.getMinutes();
    if (timeRange.startTime) {
      const [startHour, startMinute] = timeRange.startTime.split(':').map(Number);
      if (currentTime < startHour * 60 + startMinute) return false;
    }
    if (timeRange.endTime) {
      const [endHour, endMinute] = timeRange.endTime.split(':').map(Number);
      if (currentTime > endHour * 60 + endMinute) return false;
    }
  }

  return true;
}

function isIpAllowed(userIp: string, ipRestrictions: AccessControl['ipRestrictions']): boolean {
  if (!ipRestrictions) return true;
  return ipRestrictions.some(range => {
    const userIpNum = ipToNumber(userIp);
    const startIpNum = ipToNumber(range.start);
    const endIpNum = range.end ? ipToNumber(range.end) : startIpNum;
    return userIpNum >= startIpNum && userIpNum <= endIpNum;
  });
}

function ipToNumber(ip: string): number {
  return ip.split('.').reduce((total, octet) => (total << 8) + parseInt(octet, 10), 0) >>> 0;
}

function isGeoAllowed(userGeo: User['geoLocation'], geoRestrictions: AccessControl['geoRestrictions']): boolean {
  if (!geoRestrictions) return true;
  return geoRestrictions.some(restriction => {
    return (!restriction.country || restriction.country === userGeo.country) &&
          (!restriction.region || restriction.region === userGeo.region) &&
          (!restriction.city || restriction.city === userGeo.city);
  });
}

function isDeviceAllowed(userDevice: User['device'], deviceRestrictions: AccessControl['deviceRestrictions']): boolean {
  if (!deviceRestrictions) return true;
  return deviceRestrictions.some(restriction => {
    return restriction.type === userDevice.type &&
          (!restriction.os || restriction.os.includes(userDevice.os || ''));
  });
}

function hasRequiredAuthMethods(userMethods: User['authMethods'], requiredMethods: AccessControl['requiredAuthMethods']): boolean {
  if (!requiredMethods) return true;
  return requiredMethods.every(method => userMethods.includes(method));
}

function hasRoleAccess(user: User, roleAccess: AccessControl['roles'], currentDate: Date): boolean {
  return roleAccess.some(role => 
    user.roles.includes(role.id) && isWithinTimeRange(currentDate, role.timeRange)
  );
}

function hasGroupAccess(user: User, groupAccess: AccessControl['groups'], currentDate: Date): boolean {
  return groupAccess.some(group => 
    user.groups.includes(group.id) && isWithinTimeRange(currentDate, group.timeRange)
  );
}

function hasTagAccess(user: User, tagAccess: AccessControl['tags'], currentDate: Date): boolean {
  return tagAccess.some(tag => 
    user.tags.includes(tag.id) && isWithinTimeRange(currentDate, tag.timeRange)
  );
}

function hasResourceAccess(user: User, resources: AccessControl['resources'], currentDate: Date): boolean {
  return resources.some(resource => 
    user.resources.includes(resource.id) && isWithinTimeRange(currentDate, resource.timeRange)
  );
}

// Ejemplo de uso
const exampleAccessControl: AccessControl = {
  general: {
    isEnabled: true,
    timeRange: {
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    },
    maxConcurrentUsers: 100,
  },
  roles: [
    { id: "ADMIN", accessLevel: AccessLevel.ADMIN },
    { 
      id: "EMPLOYEE", 
      accessLevel: AccessLevel.WRITE,
      timeRange: {
        startTime: "09:00",
        endTime: "17:00",
        daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
      }
    },
  ],
  users: [
    { 
      id: "user123", 
      accessLevel: AccessLevel.WRITE,
      timeRange: {
        startDate: "2024-06-01",
        endDate: "2024-08-31"
      }
    },
  ],
  groups: [
    { id: "VIP_CLIENTS", accessLevel: AccessLevel.READ },
  ],
  tags: [
    { id: "BETA_TESTER", accessLevel: AccessLevel.WRITE },
  ],
  resources: [
    { 
      id: "PREMIUM_SERVICE",
      type: "service",
      name: "Premium Support",
      accessLevel: AccessLevel.WRITE,
      timeRange: {
        startDate: "2024-01-01",
        endDate: "2024-12-31"
      }
    },
  ],
  ipRestrictions: [
    { start: "192.168.1.1", end: "192.168.1.255" },
  ],
  geoRestrictions: [
    { country: "ES", region: "Cataluña" },
  ],
  deviceRestrictions: [
    { type: "desktop", os: ["Windows", "macOS"] },
  ],
  requiredAuthMethods: ["password", "two-factor"],
};

const exampleUser: User = {
  id: "user123",
  roles: ["EMPLOYEE"],
  groups: ["VIP_CLIENTS"],
  tags: ["BETA_TESTER"],
  resources: ["PREMIUM_SERVICE"],
  ip: "192.168.1.100",
  geoLocation: {
    country: "ES",
    region: "Cataluña",
    city: "Barcelona"
  },
  device: {
    type: "desktop",
    os: "Windows"
  },
  authMethods: ["password", "two-factor"]
};

const currentDate = new Date("2024-07-15T14:30:00");

console.log("User has access:", hasAccess(exampleUser, exampleAccessControl, currentDate));

// Validación del esquema
try {
  AccessControlSchema.parse(exampleAccessControl);
  console.log("Access control configuration is valid");
} catch (error) {
  console.error("Invalid access control configuration:", error);
}