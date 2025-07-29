/**
 * GoogleCalendarAuthProvider
 *
 * Servicio para manejar la autenticación con Google Calendar API
 * usando OAuth2 y refresh tokens
 */

import { google } from "googleapis";
import { Logger } from "../../utils/logger";

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
  private accessToken: string | null = null;
  private tokenExpiryTime: number | null = null;

  constructor(config?: Partial<CalendarAuthConfig>) {
    this.config = {
      clientId: config?.clientId || process.env.GOOGLE_CALENDAR_CLIENT_ID || "",
      clientSecret: config?.clientSecret || process.env.GOOGLE_CALENDAR_CLIENT_SECRET || "",
      refreshToken: config?.refreshToken || process.env.GOOGLE_CALENDAR_REFRESH_TOKEN || "",
      redirectUri: config?.redirectUri || process.env.GOOGLE_CALENDAR_REDIRECT_URI || ""
    };

    this.validateConfig();
    this.initializeOAuth2Client();
  }

  /**
   * Valida que todas las configuraciones necesarias estén presentes
   */
  private validateConfig(): void {
    const requiredFields = ['clientId', 'clientSecret', 'refreshToken', 'redirectUri'];
    const missingFields = requiredFields.filter(field => !this.config[field as keyof CalendarAuthConfig]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required Calendar auth configuration: ${missingFields.join(', ')}`);
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
      return this.accessToken;
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
  public getAuthUrl(scopes: string[] = ['https://www.googleapis.com/auth/calendar']): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
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
   * Obtiene información del token actual
   */
  public getTokenInfo(): { hasToken: boolean; expiresAt: Date | null } {
    return {
      hasToken: !!this.accessToken,
      expiresAt: this.tokenExpiryTime ? new Date(this.tokenExpiryTime) : null
    };
  }
}