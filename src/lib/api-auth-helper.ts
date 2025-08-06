import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { ApiKeyAuth, ApiKeyContext } from "@/src/middleware/api-key-auth";

export interface AuthResult {
  authenticated: boolean;
  user?: any;
  apiKeyContext?: ApiKeyContext;
  error?: string;
  statusCode?: number;
}

export interface AuthRequirements {
  apiKeyPermissions?: string[];
  sessionRoles?: string[];
  allowAnonymous?: boolean;
}

/**
 * Universal authentication helper for all API endpoints
 * Supports both API key and session authentication
 */
export class ApiAuthHelper {
  
  /**
   * Authenticate request with flexible requirements
   */
  static async authenticate(
    request: NextRequest, 
    requirements: AuthRequirements = {}
  ): Promise<AuthResult> {
    
    const {
      apiKeyPermissions = [],
      sessionRoles = ['ADMIN'],
      allowAnonymous = false
    } = requirements;

    // Try API key authentication first
    const apiKeyValidation = await ApiKeyAuth.validateApiKey(request);
    
    if (apiKeyValidation.valid && apiKeyValidation.context) {
      // API key authentication successful
      if (apiKeyPermissions.length > 0) {
        const hasAllPermissions = apiKeyPermissions.every(permission => 
          ApiKeyAuth.hasPermission(apiKeyValidation.context!, permission)
        );
        
        if (!hasAllPermissions) {
          return {
            authenticated: false,
            error: `API key missing required permissions: ${apiKeyPermissions.join(', ')}`,
            statusCode: 403
          };
        }
      }
      
      return {
        authenticated: true,
        apiKeyContext: apiKeyValidation.context
      };
    }

    // Fall back to session authentication
    try {
      const session = await auth();
      
      if (!session?.user) {
        if (allowAnonymous) {
          return { authenticated: true };
        }
        
        return {
          authenticated: false,
          error: "Authentication required. Use API key or login session.",
          statusCode: 401
        };
      }

      // Check session role requirements
      if (sessionRoles.length > 0) {
        const userRole = session.user.role || 'CLIENT';
        if (!sessionRoles.includes(userRole)) {
          return {
            authenticated: false,
            error: `Insufficient permissions. Required roles: ${sessionRoles.join(', ')}`,
            statusCode: 403
          };
        }
      }

      return {
        authenticated: true,
        user: session.user
      };

    } catch (error: any) {
      return {
        authenticated: false,
        error: `Authentication error: ${error.message}`,
        statusCode: 500
      };
    }
  }

  /**
   * Create error response for authentication failures
   */
  static createErrorResponse(authResult: AuthResult): NextResponse {
    return NextResponse.json({
      error: authResult.error,
      authenticated: false,
      timestamp: new Date().toISOString()
    }, { status: authResult.statusCode || 401 });
  }

  /**
   * Middleware wrapper for API routes
   */
  static withAuth(requirements: AuthRequirements = {}) {
    return async (
      request: NextRequest,
      handler: (request: NextRequest, authResult: AuthResult) => Promise<NextResponse>
    ): Promise<NextResponse> => {
      
      const authResult = await this.authenticate(request, requirements);
      
      if (!authResult.authenticated) {
        return this.createErrorResponse(authResult);
      }
      
      return handler(request, authResult);
    };
  }

  /**
   * Quick auth functions for common scenarios
   */
  static async adminAuth(request: NextRequest): Promise<AuthResult> {
    return this.authenticate(request, {
      apiKeyPermissions: ['admin'],
      sessionRoles: ['ADMIN']
    });
  }

  static async calendarAuth(request: NextRequest): Promise<AuthResult> {
    return this.authenticate(request, {
      apiKeyPermissions: ['calendar:read', 'calendar:write'],
      sessionRoles: ['ADMIN', 'EMPLOYEE']
    });
  }

  static async driveAuth(request: NextRequest): Promise<AuthResult> {
    return this.authenticate(request, {
      apiKeyPermissions: ['drive:read', 'drive:write'],
      sessionRoles: ['ADMIN']
    });
  }

  static async meetAuth(request: NextRequest): Promise<AuthResult> {
    return this.authenticate(request, {
      apiKeyPermissions: ['meet:read', 'meet:write'],
      sessionRoles: ['ADMIN']
    });
  }

  static async userAuth(request: NextRequest): Promise<AuthResult> {
    return this.authenticate(request, {
      apiKeyPermissions: ['users:read', 'users:write'],
      sessionRoles: ['ADMIN']
    });
  }

  /**
   * Check if request is using API key authentication
   */
  static isApiKeyAuth(authResult: AuthResult): boolean {
    return !!authResult.apiKeyContext;
  }

  /**
   * Check if request is using session authentication
   */
  static isSessionAuth(authResult: AuthResult): boolean {
    return !!authResult.user;
  }

  /**
   * Get authentication context info
   */
  static getAuthInfo(authResult: AuthResult): {
    type: 'api_key' | 'session' | 'anonymous';
    identifier?: string;
    permissions?: string[];
  } {
    if (authResult.apiKeyContext) {
      return {
        type: 'api_key',
        identifier: authResult.apiKeyContext.keyId,
        permissions: []
      };
    }
    
    if (authResult.user) {
      return {
        type: 'session',
        identifier: authResult.user.email || authResult.user.id,
        permissions: [authResult.user.role]
      };
    }
    
    return { type: 'anonymous' };
  }
}

/**
 * Decorator for API route functions
 */
export function requiresAuth(requirements: AuthRequirements = {}) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function(request: NextRequest, ...args: any[]) {
      const authResult = await ApiAuthHelper.authenticate(request, requirements);
      
      if (!authResult.authenticated) {
        return ApiAuthHelper.createErrorResponse(authResult);
      }
      
      return method.apply(this, [request, authResult, ...args]);
    };

    return descriptor;
  };
}