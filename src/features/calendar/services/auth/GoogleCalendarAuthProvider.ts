/**
 * GoogleCalendarAuthProvider
 *
 * Servicio para manejar la autenticación con Google Calendar API
 * usando OAuth2 y refresh tokens
 */

import { google } from "googleapis";
import { Logger } from "../../utils/logger";
import { getGoogleCalendarConfig, validateGoogleCalendarConfig, logGoogleCalendarConfig, type GoogleCalendarConfig } from "@/src/config/google-calendar.config";

const logger = new Logger("GoogleCalendarAuthProvider");

export interface CalendarAuthConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  redirectUri: string;
}

export class GoogleCalendarAuthProvider {
  private oauth2Client: any;
  private config: CalendarAuthConfig;
  private fullConfig: GoogleCalendarConfig;
  private accessToken: string | null = null;
  private tokenExpiryTime: number | null = null;

  constructor(config?: Partial<CalendarAuthConfig>) {
    // Usar configuración centralizada como base
    this.fullConfig = getGoogleCalendarConfig();
    
    // Override con configuración específica si se proporciona
    this.config = {
      clientId: config?.clientId || this.fullConfig.clientId,
      clientSecret: config?.clientSecret || this.fullConfig.clientSecret,
      refreshToken: config?.refreshToken || this.fullConfig.refreshToken || "",
      redirectUri: config?.redirectUri || this.fullConfig.redirectUri
    };

    // Log de configuración para debugging
    if (process.env.NODE_ENV === 'development') {
      logGoogleCalendarConfig();
    }

    this.validateConfig();
    this.initializeOAuth2Client();
  }

  /**
   * Valida que todas las configuraciones necesarias estén presentes
   */
  private validateConfig(): void {
    // Usar validación centralizada
    const validation = validateGoogleCalendarConfig(this.fullConfig);
    
    if (!validation.isValid) {
      logger.error("Missing required Calendar auth configuration:", validation.missingFields);
      throw new Error(`Missing required Calendar auth configuration: ${validation.missingFields.join(', ')}`);
    }

    // Advertencias no bloquean pero se registran
    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warning => logger.warn(warning));
    }

    logger.info("Calendar auth configuration validated successfully");
  }

  /**
   * Inicializa el cliente OAuth2
   */
  private initializeOAuth2Client(): void {
    try {
      this.oauth2Client = new google.auth.OAuth2(
        this.config.clientId,
        this.config.clientSecret,
        this.config.redirectUri
      );

      // Establecer el refresh token
      this.oauth2Client.setCredentials({
        refresh_token: this.config.refreshToken
      });

      logger.info("OAuth2 client initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize OAuth2 client", error);
      throw error;
    }
  }

  /**
   * Obtiene un token de acceso válido, renovándolo si es necesario
   */
  public async getAccessToken(): Promise<string> {
    try {
      // Si ya tenemos un token válido, lo retornamos
      if (this.accessToken && this.tokenExpiryTime && Date.now() < this.tokenExpiryTime) {
        return this.accessToken;
      }

      logger.info("Refreshing Calendar access token...");

      // Renovar el token de acceso
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      if (!credentials.access_token) {
        throw new Error("No access token received from Google Calendar");
      }

      this.accessToken = credentials.access_token;
      
      // Calcular tiempo de expiración (con 5 minutos de margen)
      if (credentials.expiry_date) {
        this.tokenExpiryTime = credentials.expiry_date - (5 * 60 * 1000);
      }

      logger.info("Calendar access token refreshed successfully");
      return this.accessToken!;
    } catch (error) {
      logger.error("Failed to get Calendar access token", error);
      throw new Error("Failed to authenticate with Google Calendar API");
    }
  }

  /**
   * Obtiene el cliente OAuth2 configurado
   */
  public async getOAuth2Client(): Promise<any> {
    // Asegurar que tenemos un token válido
    await this.getAccessToken();
    return this.oauth2Client;
  }

  /**
   * Verifica si la autenticación está configurada correctamente
   */
  public async verifyAuthentication(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch (error) {
      logger.error("Calendar authentication verification failed", error);
      return false;
    }
  }

  /**
   * Revoca el token de acceso actual
   */
  public async revokeToken(): Promise<void> {
    try {
      if (this.accessToken) {
        await this.oauth2Client.revokeToken(this.accessToken);
        this.accessToken = null;
        this.tokenExpiryTime = null;
        logger.info("Calendar access token revoked successfully");
      }
    } catch (error) {
      logger.error("Failed to revoke Calendar access token", error);
      throw error;
    }
  }

  /**
   * Obtiene la URL de autorización para el flujo OAuth2
   * (útil para configuración inicial)
   */
  public getAuthUrl(scopes?: string[]): string {
    // Usar scopes de la configuración por defecto si no se proporcionan
    const authScopes = scopes || this.fullConfig.scopes;
    
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: authScopes,
      prompt: 'consent'
    });
  }

  /**
   * Intercambia un código de autorización por tokens
   * (útil para configuración inicial)
   */
  public async getTokensFromCode(code: string): Promise<any> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      logger.error("Failed to exchange code for tokens", error);
      throw error;
    }
  }

  /**
   * Obtiene el calendar ID por defecto de la configuración
   */
  public getDefaultCalendarId(): string {
    return this.fullConfig.defaultCalendarId;
  }

  /**
   * Obtiene la timezone por defecto de la configuración
   */
  public getDefaultTimezone(): string {
    return this.fullConfig.defaultTimezone;
  }

  /**
   * Obtiene todos los scopes configurados
   */
  public getConfiguredScopes(): string[] {
    return [...this.fullConfig.scopes];
  }

  /**
   * Obtiene la configuración completa (para debugging)
   */
  public getFullConfig(): GoogleCalendarConfig {
    return { ...this.fullConfig };
  }

  /**
   * Obtiene información del token actual
   */
  public getTokenInfo(): { hasToken: boolean; expiresAt: Date | null } {
    return {
      hasToken: !!this.accessToken,
      expiresAt: this.tokenExpiryTime ? new Date(this.tokenExpiryTime) : null
    };
  }
}