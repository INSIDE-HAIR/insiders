/**
 * Factory para servicios de Meet
 * Implementa patrón Factory para crear instancias de servicios
 * Permite configurar diferentes implementaciones según el entorno
 */

import { IMeetService } from "./interfaces/IMeetService";
import { IAnalyticsService } from "./interfaces/IAnalyticsService";
import { GoogleMeetService } from "./implementations/GoogleMeetService";
import { MeetAnalyticsService } from "./implementations/MeetAnalyticsService";

export type ServiceEnvironment = "production" | "development" | "test";

export interface ServiceConfig {
  environment: ServiceEnvironment;
  apiBaseUrl?: string;
  enableAnalytics?: boolean;
  enableCaching?: boolean;
  debugMode?: boolean;
}

/**
 * Factory para crear servicios de Meet
 * Centraliza la creación de servicios y permite configuración flexible
 */
export class MeetServiceFactory {
  private static instance: MeetServiceFactory;
  private config: ServiceConfig;
  private meetService: IMeetService | null = null;
  private analyticsService: IAnalyticsService | null = null;

  private constructor(config: ServiceConfig) {
    this.config = config;
  }

  /**
   * Obtiene la instancia singleton del factory
   */
  public static getInstance(config?: ServiceConfig): MeetServiceFactory {
    if (!MeetServiceFactory.instance) {
      const defaultConfig: ServiceConfig = {
        environment: "production",
        enableAnalytics: true,
        enableCaching: true,
        debugMode: false,
      };
      MeetServiceFactory.instance = new MeetServiceFactory(config || defaultConfig);
    }
    return MeetServiceFactory.instance;
  }

  /**
   * Configura el factory con nuevos parámetros
   */
  public configure(config: Partial<ServiceConfig>): void {
    this.config = { ...this.config, ...config };
    // Reset services to recreate with new config
    this.meetService = null;
    this.analyticsService = null;
  }

  /**
   * Crea o retorna la instancia del servicio Meet
   */
  public createMeetService(): IMeetService {
    if (!this.meetService) {
      this.meetService = this.createMeetServiceInstance();
    }
    return this.meetService;
  }

  /**
   * Crea o retorna la instancia del servicio Analytics
   */
  public createAnalyticsService(): IAnalyticsService {
    if (!this.analyticsService) {
      this.analyticsService = this.createAnalyticsServiceInstance();
    }
    return this.analyticsService;
  }

  /**
   * Crea una nueva instancia del servicio Meet
   */
  private createMeetServiceInstance(): IMeetService {
    switch (this.config.environment) {
      case "production":
        return new GoogleMeetService();
      
      case "development":
        // Could return a mock service or development-specific implementation
        return new GoogleMeetService();
      
      case "test":
        // Could return a mock service for testing
        return new GoogleMeetService();
      
      default:
        return new GoogleMeetService();
    }
  }

  /**
   * Crea una nueva instancia del servicio Analytics
   */
  private createAnalyticsServiceInstance(): IAnalyticsService {
    if (!this.config.enableAnalytics) {
      // Return a no-op analytics service for environments that don't need analytics
      return new NoOpAnalyticsService();
    }

    switch (this.config.environment) {
      case "production":
        return new MeetAnalyticsService();
      
      case "development":
        return new MeetAnalyticsService();
      
      case "test":
        // Could return a mock analytics service
        return new MeetAnalyticsService();
      
      default:
        return new MeetAnalyticsService();
    }
  }

  /**
   * Obtiene la configuración actual
   */
  public getConfig(): ServiceConfig {
    return { ...this.config };
  }

  /**
   * Limpia las instancias de servicios (útil para testing)
   */
  public reset(): void {
    this.meetService = null;
    this.analyticsService = null;
  }
}

/**
 * Implementación no-op del servicio de analytics para entornos que no lo necesitan
 */
class NoOpAnalyticsService implements IAnalyticsService {
  async getRoomAnalytics(): Promise<any> {
    return Promise.resolve({});
  }

  async getRoomConferences(): Promise<any[]> {
    return Promise.resolve([]);
  }

  async getRoomParticipants(): Promise<any[]> {
    return Promise.resolve([]);
  }

  async getGlobalAnalytics(): Promise<any> {
    return Promise.resolve({});
  }

  async getRoomComparison(): Promise<any[]> {
    return Promise.resolve([]);
  }

  async getConferenceTrends(): Promise<any[]> {
    return Promise.resolve([]);
  }

  async getParticipantTrends(): Promise<any[]> {
    return Promise.resolve([]);
  }

  async getUsagePeaks(): Promise<any[]> {
    return Promise.resolve([]);
  }

  async getEngagementMetrics(): Promise<any> {
    return Promise.resolve({});
  }

  async getAudienceInsights(): Promise<any> {
    return Promise.resolve({});
  }

  async getRecordingAnalytics(): Promise<any> {
    return Promise.resolve({});
  }

  async getTranscriptAnalytics(): Promise<any> {
    return Promise.resolve({});
  }

  async exportAnalytics(): Promise<Blob> {
    return Promise.resolve(new Blob());
  }

  async generateReport(): Promise<string> {
    return Promise.resolve("");
  }

  async scheduleReport(): Promise<string> {
    return Promise.resolve("");
  }

  async getLiveRoomStats(): Promise<any> {
    return Promise.resolve({});
  }

  subscribeToLiveUpdates(): () => void {
    return () => {};
  }

  async predictRoomUsage(): Promise<any[]> {
    return Promise.resolve([]);
  }

  async getRecommendations(): Promise<any[]> {
    return Promise.resolve([]);
  }
}

// Export convenience functions
export const createMeetService = (config?: ServiceConfig): IMeetService => {
  return MeetServiceFactory.getInstance(config).createMeetService();
};

export const createAnalyticsService = (config?: ServiceConfig): IAnalyticsService => {
  return MeetServiceFactory.getInstance(config).createAnalyticsService();
};

// Export singleton instances for common use
export const meetService = createMeetService();
export const analyticsService = createAnalyticsService();