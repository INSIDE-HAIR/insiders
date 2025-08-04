import prisma from '@/src/lib/prisma';
import { ResourceType, AccessLevel, SubjectType, AccessControl, EvaluationStrategy } from '@prisma/client';
import { evaluateComplexAccess, EvaluationContext } from './rule-engine/complex-rule-evaluator';

// Cache para controles de acceso (5 minutos)
const ACCESS_CONTROL_CACHE = new Map<string, {
  data: AccessControl & {
    rules: any[];
    ipRestrictions: any[];
    geoRestrictions: any[];
    deviceRestrictions: any[];
  };
  timestamp: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Tipos para los controles de acceso
export interface AccessControlRule {
  subjectType: SubjectType;
  subjectValue: string;
  accessLevel: AccessLevel;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  daysOfWeek: string[];
}

export interface UserSession {
  id: string;
  email: string;
  role: string;
  teams?: string[];
  domain?: string;
  groups?: string[];
  tags?: string[];
  resources?: string[];
  services?: string[];
  status?: 'active' | 'inactive' | 'suspended';
  deactivation_date?: Date;
  subscription_end_date?: Date;
  last_login?: Date;
}

export interface AccessCheckRequest {
  route: string;
  user: UserSession | null;
  ip?: string;
  userAgent?: string;
  geo?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

export interface AccessCheckResult {
  allowed: boolean;
  reason: string;
  accessLevel?: AccessLevel;
  restrictions?: string[];
  source: 'database' | 'config' | 'default';
  evaluationTrace?: string[];
  executionTimeMs?: number;
}

/**
 * Obtiene los controles de acceso para una página específica desde la DB
 */
export async function getPageAccessControl(route: string): Promise<AccessControl | null> {
  const cacheKey = `page:${route}`;
  
  // Verificar cache
  const cached = ACCESS_CONTROL_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // Buscar control de acceso para esta página específica
    const pageId = generatePageId(route);
    
    const accessControl = await prisma.accessControl.findFirst({
      where: {
        resourceType: ResourceType.PAGE,
        resourceId: pageId,
        isEnabled: true,
      },
      include: {
        rules: true,
        ipRestrictions: true,
        geoRestrictions: true,
        deviceRestrictions: true,
      },
    });

    // Guardar en cache
    if (accessControl) {
      ACCESS_CONTROL_CACHE.set(cacheKey, {
        data: accessControl,
        timestamp: Date.now(),
      });
    }

    return accessControl;
  } catch (error) {
    console.error('Error obteniendo control de acceso de DB:', error);
    return null;
  }
}

/**
 * Verifica el acceso basado en los controles de la base de datos
 */
export async function checkDatabaseAccess(request: AccessCheckRequest): Promise<AccessCheckResult | null> {
  const accessControl = await getPageAccessControl(request.route);
  
  if (!accessControl) {
    return null; // No hay control específico en DB, usar fallback
  }

  // Verificar si el control está activo
  if (!accessControl.isEnabled) {
    return {
      allowed: false,
      reason: 'Control de acceso deshabilitado',
      source: 'database',
    };
  }

  // NUEVA LÓGICA: Verificar si usa evaluación compleja
  if (accessControl.evaluationStrategy === EvaluationStrategy.COMPLEX) {
    return await handleComplexEvaluation(request, accessControl);
  }

  // LÓGICA EXISTENTE: Evaluación simple (compatibilidad hacia atrás)
  return await handleSimpleEvaluation(request, accessControl);
}

/**
 * Maneja evaluación compleja con motor OR/AND
 */
async function handleComplexEvaluation(request: AccessCheckRequest, accessControl: any): Promise<AccessCheckResult | null> {
  try {
    // Crear contexto de evaluación para el motor complejo
    const context: EvaluationContext = {
      user: request.user ? {
        id: request.user.id,
        email: request.user.email,
        role: request.user.role,
        groups: request.user.groups || [],
        tags: request.user.tags || [],
        services: request.user.services || [],
        status: request.user.status || 'active',
        deactivation_date: request.user.deactivation_date,
        subscription_end_date: request.user.subscription_end_date,
        last_login: request.user.last_login,
      } : null,
      current_date: new Date(),
      current_time: new Date().toTimeString().slice(0, 5), // HH:mm
      current_day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      request: {
        ip: request.ip || 'unknown',
        user_agent: request.userAgent || '',
        geo: request.geo || {},
      },
      resource: {
        id: request.route,
        type: 'page',
      },
    };

    // Evaluar usando motor complejo
    const complexResult = await evaluateComplexAccess(generatePageId(request.route), context);
    
    if (!complexResult) {
      // Fallback al sistema simple si falla evaluación compleja
      console.warn('Complex evaluation failed, falling back to simple evaluation');
      return await handleSimpleEvaluation(request, accessControl);
    }

    // Convertir resultado complejo a formato compatible
    return {
      allowed: complexResult.allowed,
      reason: complexResult.reason,
      accessLevel: complexResult.accessLevel,
      source: 'database',
      evaluationTrace: complexResult.evaluationTrace,
      executionTimeMs: complexResult.executionTimeMs,
    };

  } catch (error) {
    console.error('Error en evaluación compleja:', error);
    // Fallback al sistema simple
    return await handleSimpleEvaluation(request, accessControl);
  }
}

/**
 * Maneja evaluación simple (sistema original)
 */
async function handleSimpleEvaluation(request: AccessCheckRequest, accessControl: any): Promise<AccessCheckResult | null> {
  // Verificar restricciones de tiempo global
  const timeResult = checkTimeRestrictions(accessControl);
  if (!timeResult.allowed) {
    return timeResult;
  }

  // Verificar restricciones de IP
  const ipResult = checkIPRestrictions(accessControl, request.ip);
  if (!ipResult.allowed) {
    return ipResult;
  }

  // Verificar restricciones geográficas
  const geoResult = checkGeoRestrictions(accessControl, request.geo);
  if (!geoResult.allowed) {
    return geoResult;
  }

  // Verificar restricciones de dispositivo
  const deviceResult = checkDeviceRestrictions(accessControl, request.userAgent);
  if (!deviceResult.allowed) {
    return deviceResult;
  }

  // Verificar reglas de acceso específicas
  const rulesResult = checkAccessRules(accessControl, request.user);
  return rulesResult;
}

/**
 * Verifica las reglas de acceso específicas del usuario
 */
function checkAccessRules(accessControl: AccessControl & { rules: any[] }, user: UserSession | null): AccessCheckResult {
  if (!user) {
    return {
      allowed: false,
      reason: 'Autenticación requerida',
      source: 'database',
    };
  }

  // Si no hay reglas específicas, permitir acceso por defecto
  if (!accessControl.rules || accessControl.rules.length === 0) {
    return {
      allowed: true,
      reason: 'Sin restricciones específicas',
      accessLevel: AccessLevel.READ,
      source: 'database',
    };
  }

  // Verificar cada regla
  for (const rule of accessControl.rules) {
    const ruleResult = evaluateRule(rule, user);
    if (ruleResult.allowed) {
      return ruleResult;
    }
  }

  return {
    allowed: false,
    reason: 'No se encontraron reglas que permitan el acceso',
    source: 'database',
  };
}

/**
 * Evalúa una regla específica contra el usuario
 */
function evaluateRule(rule: AccessControlRule, user: UserSession): AccessCheckResult {
  let matches = false;

  switch (rule.subjectType) {
    case SubjectType.USER:
      matches = user.email === rule.subjectValue;
      break;
    case SubjectType.ROLE:
      matches = user.role === rule.subjectValue;
      break;
    case SubjectType.GROUP:
      matches = user.groups?.includes(rule.subjectValue) || false;
      break;
    case SubjectType.TAG:
      matches = user.tags?.includes(rule.subjectValue) || false;
      break;
  }

  if (!matches) {
    return {
      allowed: false,
      reason: `No coincide con ${rule.subjectType}: ${rule.subjectValue}`,
      source: 'database',
    };
  }

  // Verificar restricciones de tiempo específicas de la regla
  const timeResult = checkRuleTimeRestrictions(rule);
  if (!timeResult.allowed) {
    return timeResult;
  }

  return {
    allowed: true,
    reason: `Acceso permitido por regla ${rule.subjectType}: ${rule.subjectValue}`,
    accessLevel: rule.accessLevel,
    source: 'database',
  };
}

/**
 * Verifica restricciones de tiempo globales del control
 */
function checkTimeRestrictions(accessControl: AccessControl): AccessCheckResult {
  const now = new Date();

  // Verificar fechas de validez
  if (accessControl.startDate && now < accessControl.startDate) {
    return {
      allowed: false,
      reason: `Acceso no válido hasta ${accessControl.startDate.toLocaleDateString()}`,
      source: 'database',
    };
  }

  if (accessControl.endDate && now > accessControl.endDate) {
    return {
      allowed: false,
      reason: `Acceso expirado el ${accessControl.endDate.toLocaleDateString()}`,
      source: 'database',
    };
  }

  // Verificar horarios
  if (accessControl.startTime || accessControl.endTime) {
    const currentTime = now.toTimeString().slice(0, 5); // HH:mm format
    
    if (accessControl.startTime && currentTime < accessControl.startTime) {
      return {
        allowed: false,
        reason: `Acceso permitido desde ${accessControl.startTime}`,
        source: 'database',
      };
    }

    if (accessControl.endTime && currentTime > accessControl.endTime) {
      return {
        allowed: false,
        reason: `Acceso permitido hasta ${accessControl.endTime}`,
        source: 'database',
      };
    }
  }

  // Verificar días de la semana
  if (accessControl.daysOfWeek && accessControl.daysOfWeek.length > 0) {
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    if (!accessControl.daysOfWeek.includes(currentDay)) {
      return {
        allowed: false,
        reason: `Acceso permitido solo los: ${accessControl.daysOfWeek.join(', ')}`,
        source: 'database',
      };
    }
  }

  return { allowed: true, reason: 'Restricciones de tiempo válidas', source: 'database' };
}

/**
 * Verifica restricciones de tiempo específicas de una regla
 */
function checkRuleTimeRestrictions(rule: AccessControlRule): AccessCheckResult {
  const now = new Date();

  // Verificar fechas de validez de la regla
  if (rule.startDate && now < rule.startDate) {
    return {
      allowed: false,
      reason: `Regla no válida hasta ${rule.startDate.toLocaleDateString()}`,
      source: 'database',
    };
  }

  if (rule.endDate && now > rule.endDate) {
    return {
      allowed: false,
      reason: `Regla expirada el ${rule.endDate.toLocaleDateString()}`,
      source: 'database',
    };
  }

  // Verificar horarios de la regla
  if (rule.startTime || rule.endTime) {
    const currentTime = now.toTimeString().slice(0, 5);
    
    if (rule.startTime && currentTime < rule.startTime) {
      return {
        allowed: false,
        reason: `Regla activa desde ${rule.startTime}`,
        source: 'database',
      };
    }

    if (rule.endTime && currentTime > rule.endTime) {
      return {
        allowed: false,
        reason: `Regla activa hasta ${rule.endTime}`,
        source: 'database',
      };
    }
  }

  // Verificar días de la semana de la regla
  if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    if (!rule.daysOfWeek.includes(currentDay)) {
      return {
        allowed: false,
        reason: `Regla activa solo los: ${rule.daysOfWeek.join(', ')}`,
        source: 'database',
      };
    }
  }

  return { allowed: true, reason: 'Restricciones de tiempo de regla válidas', source: 'database' };
}

/**
 * Verifica restricciones de IP
 */
function checkIPRestrictions(accessControl: AccessControl & { ipRestrictions: any[] }, ip?: string): AccessCheckResult {
  if (!accessControl.ipRestrictions || accessControl.ipRestrictions.length === 0) {
    return { allowed: true, reason: 'Sin restricciones de IP', source: 'database' };
  }

  if (!ip) {
    return {
      allowed: false,
      reason: 'IP requerida para verificación',
      source: 'database',
    };
  }

  for (const restriction of accessControl.ipRestrictions) {
    if (isIPInRange(ip, restriction.startIP, restriction.endIP)) {
      return {
        allowed: true,
        reason: 'IP permitida',
        source: 'database',
      };
    }
  }

  return {
    allowed: false,
    reason: 'IP no autorizada',
    source: 'database',
  };
}

/**
 * Verifica restricciones geográficas
 */
function checkGeoRestrictions(accessControl: AccessControl & { geoRestrictions: any[] }, geo?: { country?: string; region?: string; city?: string }): AccessCheckResult {
  if (!accessControl.geoRestrictions || accessControl.geoRestrictions.length === 0) {
    return { allowed: true, reason: 'Sin restricciones geográficas', source: 'database' };
  }

  if (!geo) {
    return {
      allowed: false,
      reason: 'Información geográfica requerida',
      source: 'database',
    };
  }

  for (const restriction of accessControl.geoRestrictions) {
    let matches = true;

    if (restriction.country && geo.country !== restriction.country) {
      matches = false;
    }
    if (restriction.region && geo.region !== restriction.region) {
      matches = false;
    }
    if (restriction.city && geo.city !== restriction.city) {
      matches = false;
    }

    if (matches) {
      return {
        allowed: true,
        reason: 'Ubicación permitida',
        source: 'database',
      };
    }
  }

  return {
    allowed: false,
    reason: 'Ubicación no autorizada',
    source: 'database',
  };
}

/**
 * Verifica restricciones de dispositivo
 */
function checkDeviceRestrictions(accessControl: AccessControl & { deviceRestrictions: any[] }, userAgent?: string): AccessCheckResult {
  if (!accessControl.deviceRestrictions || accessControl.deviceRestrictions.length === 0) {
    return { allowed: true, reason: 'Sin restricciones de dispositivo', source: 'database' };
  }

  if (!userAgent) {
    return {
      allowed: false,
      reason: 'Información de dispositivo requerida',
      source: 'database',
    };
  }

  const deviceInfo = parseUserAgent(userAgent);

  for (const restriction of accessControl.deviceRestrictions) {
    let matches = true;

    if (restriction.deviceType && deviceInfo.deviceType !== restriction.deviceType) {
      matches = false;
    }

    if (restriction.operatingSystems && restriction.operatingSystems.length > 0) {
      if (!restriction.operatingSystems.includes(deviceInfo.os)) {
        matches = false;
      }
    }

    if (matches) {
      return {
        allowed: true,
        reason: 'Dispositivo permitido',
        source: 'database',
      };
    }
  }

  return {
    allowed: false,
    reason: 'Dispositivo no autorizado',
    source: 'database',
  };
}

/**
 * Limpia el cache de controles de acceso
 */
export function clearAccessControlCache(route?: string) {
  if (route) {
    ACCESS_CONTROL_CACHE.delete(`page:${route}`);
  } else {
    ACCESS_CONTROL_CACHE.clear();
  }
}

/**
 * Funciones auxiliares
 */

function generatePageId(route: string): string {
  // Convertir ruta a ID estable
  return route.replace(/\[lang\]/g, 'lang').replace(/\//g, '_').replace(/^_/, '');
}

function isIPInRange(ip: string, startIP: string, endIP?: string): boolean {
  if (!endIP) {
    return ip === startIP;
  }
  
  // Implementación básica - en producción usar librería especializada
  const ipNum = ipToNumber(ip);
  const startNum = ipToNumber(startIP);
  const endNum = ipToNumber(endIP);
  
  return ipNum >= startNum && ipNum <= endNum;
}

function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => acc * 256 + parseInt(octet), 0);
}

function parseUserAgent(userAgent: string): { deviceType: string; os: string } {
  // Implementación básica - en producción usar librería especializada
  let deviceType = 'desktop';
  let os = 'unknown';
  
  if (/Mobile|Android|iPhone|iPad/i.test(userAgent)) {
    deviceType = 'mobile';
  } else if (/Tablet|iPad/i.test(userAgent)) {
    deviceType = 'tablet';
  }
  
  if (/Windows/i.test(userAgent)) {
    os = 'Windows';
  } else if (/Mac/i.test(userAgent)) {
    os = 'macOS';
  } else if (/Android/i.test(userAgent)) {
    os = 'Android';
  } else if (/iPhone|iPad/i.test(userAgent)) {
    os = 'iOS';
  } else if (/Linux/i.test(userAgent)) {
    os = 'Linux';
  }
  
  return { deviceType, os };
}