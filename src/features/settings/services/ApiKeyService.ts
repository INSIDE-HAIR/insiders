import { 
  ApiKey, 
  CreateApiKeyRequest,
  CreateApiKeyRequestInput, 
  UpdateApiKeyRequest, 
  ApiKeysResponse, 
  CreateApiKeyResponse,
  ApiKeyQueryParams,
  ApiKeyStats
} from '../types';
import { validateApiKeyFormat } from '../validations/api-keys';

export class ApiKeyService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  /**
   * Obtener lista de API Keys
   */
  async getApiKeys(params?: Partial<ApiKeyQueryParams>): Promise<ApiKeysResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);

    const response = await fetch(`${this.baseUrl}/admin/api-keys?${searchParams.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch API keys');
    }

    return response.json();
  }

  /**
   * Obtener detalles de una API Key específica
   */
  async getApiKeyDetails(keyId: string): Promise<ApiKey> {
    const response = await fetch(`${this.baseUrl}/admin/api-keys/${keyId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch API key details');
    }

    const data = await response.json();
    return data.apiKey;
  }

  /**
   * Crear nueva API Key
   */
  async createApiKey(data: CreateApiKeyRequestInput): Promise<CreateApiKeyResponse> {
    const response = await fetch(`${this.baseUrl}/admin/api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create API key');
    }

    return response.json();
  }

  /**
   * Actualizar API Key existente
   */
  async updateApiKey(keyId: string, data: UpdateApiKeyRequest): Promise<ApiKey> {
    const response = await fetch(`${this.baseUrl}/admin/api-keys/${keyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update API key');
    }

    const result = await response.json();
    return result.apiKey;
  }

  /**
   * Revocar API Key específica (cambiar estado a REVOKED)
   */
  async revokeApiKey(keyId: string): Promise<ApiKey> {
    const response = await fetch(`${this.baseUrl}/admin/api-keys/${keyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'REVOKED' })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to revoke API key');
    }

    const result = await response.json();
    return result.apiKey;
  }

  /**
   * Eliminar API Key permanentemente (solo claves revocadas)
   */
  async deleteApiKey(keyId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/admin/api-keys/${keyId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to permanently delete API key');
    }
  }

  /**
   * Revocar múltiples API Keys
   */
  async revokeMultipleApiKeys(keyIds: string[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/admin/api-keys`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ keyIds })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to revoke API keys');
    }
  }

  /**
   * Reactivar API Key (cambiar estado de REVOKED a ACTIVE)
   */
  async reactivateApiKey(keyId: string): Promise<ApiKey> {
    const response = await fetch(`${this.baseUrl}/admin/api-keys/${keyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'ACTIVE' })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reactivate API key');
    }

    const result = await response.json();
    return result.apiKey;
  }

  /**
   * Obtener estadísticas globales de API Keys
   */
  async getApiKeyStats(): Promise<ApiKeyStats> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/api-keys/stats`);
      
      if (!response.ok) {
        // Intentar parsear el error del servidor
        let errorMessage = 'Failed to fetch API key statistics';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch (parseError) {
          // Si no se puede parsear, usar el status
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      // Si es un error de red o fetch, proporcionar un mensaje más claro
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server');
      }
      // Re-throw otros errores
      throw error;
    }
  }

  /**
   * Validar formato de API Key
   */
  static isValidApiKey(key: string): boolean {
    return validateApiKeyFormat(key);
  }

  /**
   * Validar formato de IP
   */
  static isValidIp(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * Validar formato de dominio
   */
  static isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,})+$/;
    return domainRegex.test(domain);
  }

  /**
   * Formatear fecha para inputs datetime-local
   */
  static formatDateForInput(date: Date): string {
    return date.toISOString().slice(0, 16);
  }

  /**
   * Calcular cuando expira un rate limit
   */
  static calculateRateLimitReset(type: string): Date {
    const now = new Date();
    switch (type) {
      case 'REQUESTS_PER_MINUTE':
        return new Date(now.getTime() + 60 * 1000);
      case 'REQUESTS_PER_HOUR':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case 'REQUESTS_PER_DAY':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'REQUESTS_PER_MONTH':
        const nextMonth = new Date(now);
        nextMonth.setMonth(now.getMonth() + 1);
        return nextMonth;
      default:
        return new Date(now.getTime() + 60 * 60 * 1000);
    }
  }
}