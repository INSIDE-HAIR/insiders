import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { headers } from 'next/headers';
import { validateApiKeyFormat, extractKeyPrefix } from '@/src/features/settings/validations/api-keys';

const prisma = new PrismaClient();

export interface ApiKeyContext {
  keyId: string;
  userId: string;
}

export class ApiKeyAuth {
  
  /**
   * Middleware principal para validar API Keys
   */
  static async validateApiKey(request: NextRequest): Promise<{
    valid: boolean;
    context?: ApiKeyContext;
    error?: string;
    statusCode?: number;
  }> {
    try {
      // Extraer API Key del header
      const apiKey = this.extractApiKey(request);
      if (!apiKey) {
        return {
          valid: false,
          error: 'API Key is required. Include it in Authorization header as "Bearer YOUR_API_KEY" or X-API-Key header.',
          statusCode: 401
        };
      }

      // Validar formato de la clave
      if (!validateApiKeyFormat(apiKey)) {
        return {
          valid: false,
          error: 'Invalid API Key format',
          statusCode: 401
        };
      }

      // Hash de la clave para buscarla en BD
      const keyHash = this.hashApiKey(apiKey);
      const keyPrefix = extractKeyPrefix(apiKey);

      // Buscar en base de datos
      const apiKeyRecord = await prisma.apiKey.findUnique({
        where: { keyHash },
        select: {
          id: true,
          name: true,
          status: true,
          expiresAt: true,
          userId: true,
          totalRequests: true,
          lastUsedAt: true
        }
      });

      if (!apiKeyRecord) {
        await this.logFailedAttempt(apiKey, request, 'KEY_NOT_FOUND');
        return {
          valid: false,
          error: 'Invalid API Key',
          statusCode: 401
        };
      }

      // Verificar estado de la clave
      if (apiKeyRecord.status !== 'ACTIVE') {
        await this.logFailedAttempt(apiKey, request, `KEY_${apiKeyRecord.status}`);
        return {
          valid: false,
          error: `API Key is ${apiKeyRecord.status.toLowerCase()}`,
          statusCode: 401
        };
      }

      // Verificar expiración
      if (apiKeyRecord.expiresAt && new Date() > apiKeyRecord.expiresAt) {
        await this.updateKeyStatus(apiKeyRecord.id, 'EXPIRED');
        await this.logFailedAttempt(apiKey, request, 'KEY_EXPIRED');
        return {
          valid: false,
          error: 'API Key has expired',
          statusCode: 401
        };
      }

      // Simplified version - removed IP, User-Agent, and rate limiting checks
      // These can be added back when needed

      // Actualizar último uso
      await this.updateLastUsed(apiKeyRecord.id);

      // Log de acceso exitoso
      await this.logSuccessfulAccess(apiKeyRecord, request);

      return {
        valid: true,
        context: {
          keyId: apiKeyRecord.id,
          userId: apiKeyRecord.userId,
        }
      };

    } catch (error: any) {
      console.error('API Key validation error:', error);
      return {
        valid: false,
        error: 'Internal server error during authentication',
        statusCode: 500
      };
    }
  }

  /**
   * Extraer API Key de headers
   */
  private static extractApiKey(request: NextRequest): string | null {
    // Opción 1: Authorization Bearer
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Opción 2: X-API-Key header
    const apiKeyHeader = request.headers.get('x-api-key');
    if (apiKeyHeader) {
      return apiKeyHeader;
    }

    // Opción 3: Query parameter (menos seguro)
    const url = new URL(request.url);
    const apiKeyParam = url.searchParams.get('api_key');
    if (apiKeyParam) {
      return apiKeyParam;
    }

    return null;
  }


  /**
   * Hash de API Key para almacenamiento seguro
   */
  private static hashApiKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }


  /**
   * Obtener IP del cliente
   */
  private static getClientIp(request: NextRequest): string {
    // Verificar headers de proxy
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0]?.trim() || 'unknown';
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
      return realIp;
    }

    // IP directa (desarrollo local)
    return '127.0.0.1';
  }

  /**
   * Verificar rate limiting - Simplified version (always allow)
   */
  private static async checkRateLimit(apiKey: any): Promise<{
    allowed: boolean;
    resetTime?: string;
  }> {
    // Simplified: always allow for now
    return { allowed: true };
  }

  /*
   * Old rate limiting method - commented out for simplified version
   * This can be restored when advanced features are needed
   * 
  private static async checkRateLimitOld(apiKey: any): Promise<{
    allowed: boolean;
    resetTime?: string;
  }> {
    const now = new Date();
    let windowStart: Date;
    let windowType: string;

    // Determinar ventana de tiempo basada en el tipo
    switch (apiKey.rateLimitType) {
      case 'REQUESTS_PER_MINUTE':
        windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
        windowType = 'minute';
        break;
      case 'REQUESTS_PER_HOUR':
        windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
        windowType = 'hour';
        break;
      case 'REQUESTS_PER_DAY':
        windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        windowType = 'day';
        break;
      case 'NO_LIMIT':
        return { allowed: true };
      default:
        windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
        windowType = 'hour';
    }

    // Buscar o crear entrada de cache
    let cacheEntry = await prisma.rateLimitCache.findUnique({
      where: {
        keyId_windowStart_windowType: {
          keyId: apiKey.id,
          windowStart,
          windowType
        }
      }
    });

    if (!cacheEntry) {
      // Crear nueva entrada
      cacheEntry = await prisma.rateLimitCache.create({
        data: {
          keyId: apiKey.id,
          windowStart,
          windowType,
          requestCount: 0,
          expiresAt: new Date(windowStart.getTime() + this.getWindowDuration(windowType))
        }
      });
    }

    // Verificar si se excedió el límite
    if (cacheEntry.requestCount >= apiKey.rateLimitValue) {
      const resetTime = new Date(windowStart.getTime() + this.getWindowDuration(windowType));
      const secondsUntilReset = Math.ceil((resetTime.getTime() - now.getTime()) / 1000);
      
      return {
        allowed: false,
        resetTime: `${secondsUntilReset} seconds`
      };
    }

    // Incrementar contador
    await prisma.rateLimitCache.update({
      where: { id: cacheEntry.id },
      data: { requestCount: cacheEntry.requestCount + 1 }
    });

    return { allowed: true };
  }
  */

  /**
   * Obtener duración de ventana en milisegundos
   */
  private static getWindowDuration(windowType: string): number {
    switch (windowType) {
      case 'minute': return 60 * 1000;
      case 'hour': return 60 * 60 * 1000;
      case 'day': return 24 * 60 * 60 * 1000;
      case 'month': return 30 * 24 * 60 * 60 * 1000;
      default: return 60 * 60 * 1000;
    }
  }

  /**
   * Actualizar último uso
   */
  private static async updateLastUsed(keyId: string): Promise<void> {
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { lastUsedAt: new Date() }
    });
  }

  /**
   * Actualizar estado de la clave
   */
  private static async updateKeyStatus(keyId: string, status: string): Promise<void> {
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { status: status as any }
    });
  }

  /**
   * Log de acceso exitoso
   */
  private static async logSuccessfulAccess(apiKey: any, request: NextRequest): Promise<void> {
    const method = request.method;
    const url = new URL(request.url);
    const endpoint = url.pathname;
    
    // Simplified: console log instead of database for now
    console.log('API Key access:', {
      keyId: apiKey.id,
      method,
      endpoint,
      ip: this.getClientIp(request),
      timestamp: new Date()
    });
  }

  /**
   * Log de intento fallido
   */
  private static async logFailedAttempt(apiKey: string, request: NextRequest, reason: string): Promise<void> {
    const method = request.method;
    const url = new URL(request.url);
    const endpoint = url.pathname;
    
    // Para intentos fallidos, no tenemos el ID de la clave, así que creamos un log especial
    console.log('Failed API key attempt:', {
      keyPrefix: extractKeyPrefix(apiKey),
      reason,
      method,
      endpoint,
      ip: this.getClientIp(request),
      timestamp: new Date()
    });
  }

  /**
   * Verificar permisos específicos
   */
  static hasPermission(context: ApiKeyContext, permission: string): boolean {

    return false;
  }

  /**
   * Middleware para Next.js API routes
   */
  static middleware() {
    return async (request: NextRequest) => {
      const validation = await this.validateApiKey(request);
      
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: validation.statusCode || 401 }
        );
      }

      // Agregar contexto a los headers para uso posterior
      const response = NextResponse.next();
      response.headers.set('x-api-key-context', JSON.stringify(validation.context));
      
      return response;
    };
  }
}

/**
 * Hook para usar en API routes
 */
export function useApiKeyContext(request: NextRequest): ApiKeyContext | null {
  const contextHeader = request.headers.get('x-api-key-context');
  if (contextHeader) {
    try {
      return JSON.parse(contextHeader);
    } catch {
      return null;
    }
  }
  return null;
}