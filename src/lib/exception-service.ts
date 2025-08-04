/**
 * Exception Service - Gestiona excepciones de usuario desde la base de datos
 */

import prisma from '@/prisma/database';
import type { UserException, DomainException, ExceptionAccessLevel } from '@prisma/client';

// Cache para excepciones (5 minutos)
const CACHE_DURATION = 5 * 60 * 1000;
const userExceptionCache = new Map<string, { data: UserException | null; timestamp: number }>();
const domainExceptionCache = new Map<string, { data: DomainException | null; timestamp: number }>();

/**
 * Obtiene excepción de usuario por email con cache
 */
export async function getUserException(email: string): Promise<UserException | null> {
  const cached = userExceptionCache.get(email);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const exception = await prisma.userException.findUnique({
      where: { 
        email,
        isActive: true
      }
    });

    // Verificar si la excepción ha expirado
    const validException = exception && isExceptionValid(exception) ? exception : null;
    
    userExceptionCache.set(email, {
      data: validException,
      timestamp: Date.now()
    });

    return validException;
  } catch (error) {
    console.error('Error fetching user exception:', error);
    return null;
  }
}

/**
 * Obtiene excepción de dominio con cache
 */
export async function getDomainException(domain: string): Promise<DomainException | null> {
  const cached = domainExceptionCache.get(domain);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const exception = await prisma.domainException.findUnique({
      where: { 
        domain,
        isActive: true
      }
    });

    domainExceptionCache.set(domain, {
      data: exception,
      timestamp: Date.now()
    });

    return exception;
  } catch (error) {
    console.error('Error fetching domain exception:', error);
    return null;
  }
}

/**
 * Verifica si una excepción de usuario es válida (no expirada, horarios correctos)
 */
export function isExceptionValid(exception: UserException): boolean {
  const now = new Date();

  // Verificar fechas de validez
  if (exception.startDate && now < exception.startDate) {
    return false;
  }

  if (exception.endDate && now > exception.endDate) {
    return false;
  }

  // Verificar días de la semana
  if (exception.daysOfWeek && exception.daysOfWeek.length > 0) {
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    if (!exception.daysOfWeek.includes(currentDay)) {
      return false;
    }
  }

  // Verificar horarios
  if (exception.startTime || exception.endTime) {
    const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
    
    if (exception.startTime && currentTime < exception.startTime) {
      return false;
    }
    
    if (exception.endTime && currentTime > exception.endTime) {
      return false;
    }
  }

  return true;
}

/**
 * Convierte ExceptionAccessLevel a roles compatibles con el route guard
 */
export function mapExceptionLevelToRole(level: ExceptionAccessLevel): string {
  const mapping = {
    [ExceptionAccessLevel.READONLY]: 'user',
    [ExceptionAccessLevel.EDITOR]: 'editor',
    [ExceptionAccessLevel.ADMIN]: 'admin',
    [ExceptionAccessLevel.SUPER_ADMIN]: 'super-admin',
    [ExceptionAccessLevel.CUSTOM]: 'user' // Para CUSTOM usamos allowedRoutes
  };

  return mapping[level] || 'user';
}

/**
 * Obtiene rutas permitidas para una excepción
 */
export function getExceptionAllowedRoutes(exception: UserException): string[] {
  if (exception.accessLevel === ExceptionAccessLevel.CUSTOM) {
    return exception.allowedRoutes;
  }

  // Para otros niveles, definir rutas por defecto
  const routesByLevel = {
    [ExceptionAccessLevel.READONLY]: ['/[lang]/profile'],
    [ExceptionAccessLevel.EDITOR]: ['/[lang]/profile', '/[lang]/admin/pages', '/[lang]/admin/menu'],
    [ExceptionAccessLevel.ADMIN]: ['/[lang]/admin/*'],
    [ExceptionAccessLevel.SUPER_ADMIN]: ['*']
  };

  return routesByLevel[exception.accessLevel] || [];
}

/**
 * Registra el uso de una excepción
 */
export async function recordExceptionUsage(email: string): Promise<void> {
  try {
    await prisma.userException.updateMany({
      where: { 
        email,
        isActive: true
      },
      data: {
        lastUsed: new Date(),
        useCount: { increment: 1 }
      }
    });
  } catch (error) {
    console.error('Error recording exception usage:', error);
  }
}

/**
 * Limpia excepciones expiradas automáticamente
 */
export async function cleanupExpiredExceptions(): Promise<number> {
  try {
    const result = await prisma.userException.updateMany({
      where: {
        isTemporary: true,
        endDate: {
          lt: new Date()
        },
        isActive: true
      },
      data: {
        isActive: false
      }
    });

    return result.count;
  } catch (error) {
    console.error('Error cleaning up expired exceptions:', error);
    return 0;
  }
}

/**
 * Limpia cache de excepciones
 */
export function clearExceptionCache(): void {
  userExceptionCache.clear();
  domainExceptionCache.clear();
}

/**
 * Obtiene estadísticas de excepciones
 */
export async function getExceptionStats() {
  try {
    const [totalExceptions, activeExceptions, expiredExceptions, usageStats] = await Promise.all([
      prisma.userException.count(),
      prisma.userException.count({ where: { isActive: true } }),
      prisma.userException.count({ 
        where: { 
          isTemporary: true,
          endDate: { lt: new Date() }
        }
      }),
      prisma.userException.aggregate({
        _sum: { useCount: true },
        _avg: { useCount: true }
      })
    ]);

    return {
      total: totalExceptions,
      active: activeExceptions,
      expired: expiredExceptions,
      totalUsage: usageStats._sum.useCount || 0,
      averageUsage: usageStats._avg.useCount || 0
    };
  } catch (error) {
    console.error('Error fetching exception stats:', error);
    return null;
  }
}