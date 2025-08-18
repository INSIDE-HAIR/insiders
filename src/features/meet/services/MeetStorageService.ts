import { PrismaClient } from '@prisma/client';

// SIMPLIFICADO: Solo IDs y metadatos básicos
export interface StoredMeetSpace {
  id: string;
  spaceId: string;
  displayName?: string;
  createdAt: Date;
  createdBy?: string;
  lastSyncAt?: Date;
}

export class MeetStorageService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Registra un space ID recién creado (solo el ID, no los datos)
   */
  async registerSpace(spaceId: string, displayName?: string, createdById?: string): Promise<StoredMeetSpace> {
    try {
      const savedSpace = await this.prisma.meetSpace.create({
        data: {
          spaceId: spaceId,
          displayName: displayName || null,
          createdBy: createdById || null,
          lastSyncAt: new Date(),
        }
      });

      // Log de la operación
      await this.logOperation('create_space', spaceId, true, 201, null, createdById);

      console.log(`💾 Space ID registered: ${spaceId}`);
      return this.transformToStoredSpace(savedSpace);
    } catch (error) {
      console.error('Error registering Meet space ID:', error);
      throw error;
    }
  }

  /**
   * Actualiza la fecha de última sincronización de un space
   */
  async updateSyncTime(spaceId: string): Promise<void> {
    try {
      await this.prisma.meetSpace.updateMany({
        where: { spaceId: spaceId },
        data: { lastSyncAt: new Date() }
      });
    } catch (error) {
      console.error(`Error updating sync time for ${spaceId}:`, error);
    }
  }

  /**
   * Obtiene solo los IDs de spaces registrados (para hacer llamadas frescas a API)
   */
  async getAllSpaceIds(): Promise<StoredMeetSpace[]> {
    try {
      const spaces = await this.prisma.meetSpace.findMany({
        orderBy: { createdAt: 'desc' }
      });

      return spaces.map(space => this.transformToStoredSpace(space));
    } catch (error) {
      console.error('Error fetching space IDs:', error);
      return [];
    }
  }

  /**
   * Verifica si un space ID está registrado
   */
  async isSpaceRegistered(spaceId: string): Promise<boolean> {
    try {
      const space = await this.prisma.meetSpace.findFirst({
        where: { spaceId: spaceId }
      });
      return !!space;
    } catch (error) {
      console.error(`Error checking space ${spaceId}:`, error);
      return false;
    }
  }

  /**
   * Actualiza solo el displayName de un space (para UX)
   */
  async updateSpaceDisplayName(spaceId: string, displayName?: string): Promise<void> {
    try {
      await this.prisma.meetSpace.updateMany({
        where: { spaceId: spaceId },
        data: { 
          displayName: displayName,
          lastSyncAt: new Date()
        }
      });
    } catch (error) {
      console.error(`Error updating display name for ${spaceId}:`, error);
    }
  }

  /**
   * Elimina un space ID del registro local
   */
  async unregisterSpace(spaceId: string, deletedById?: string): Promise<boolean> {
    try {
      const result = await this.prisma.meetSpace.deleteMany({
        where: { spaceId: spaceId }
      });

      if (result.count > 0) {
        await this.logOperation('delete_space', spaceId, true, 200, null, deletedById);
        console.log(`🗑️ Space ID unregistered: ${spaceId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error unregistering space ${spaceId}:`, error);
      return false;
    }
  }


  /**
   * Log simplificado de operaciones
   */
  async logOperation(
    operation: string,
    spaceId: string | null,
    success: boolean,
    statusCode: number,
    errorMsg?: string | null,
    userId?: string
  ): Promise<void> {
    try {
      await this.prisma.meetApiLog.create({
        data: {
          operation,
          spaceId,
          success,
          statusCode,
          errorMsg,
          userId: userId || null,
        }
      });
    } catch (error) {
      console.error('Error logging operation:', error);
    }
  }

  /**
   * Estadísticas simplificadas
   */
  async getStats(): Promise<{
    totalSpaces: number;
    apiCallsToday: number;
    lastSyncCount: number;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [totalSpaces, apiCallsToday, lastSyncCount] = await Promise.all([
        this.prisma.meetSpace.count(),
        this.prisma.meetApiLog.count({ where: { createdAt: { gte: today } } }),
        this.prisma.meetSpace.count({ where: { lastSyncAt: { gte: today } } })
      ]);

      return {
        totalSpaces,
        apiCallsToday,
        lastSyncCount
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalSpaces: 0,
        apiCallsToday: 0,
        lastSyncCount: 0
      };
    }
  }

  // Transformación simplificada
  private transformToStoredSpace(space: any): StoredMeetSpace {
    return {
      id: space.id,
      spaceId: space.spaceId,
      displayName: space.displayName,
      createdAt: space.createdAt,
      createdBy: space.createdBy,
      lastSyncAt: space.lastSyncAt,
    };
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}