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
  public prisma: PrismaClient;

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

  /**
   * TAGS MANAGEMENT
   */
  
  /**
   * Crea un nuevo tag con jerarquía
   */
  async createTag(data: {
    name: string;
    slug: string;
    description?: string;
    color?: string;
    icon?: string;
    parentId?: string;
    createdBy?: string;
  }): Promise<any> {
    try {
      // Calcular path y level basado en parent
      let path = `/${data.slug}`;
      let level = 0;
      
      if (data.parentId) {
        const parent = await this.prisma.meetTag.findUnique({
          where: { id: data.parentId }
        });
        if (parent) {
          path = `${parent.path}/${data.slug}`;
          level = parent.level + 1;
        }
      }
      
      const tag = await this.prisma.meetTag.create({
        data: {
          ...data,
          parentId: data.parentId || null, // Ensure empty string becomes null
          path,
          level
        }
      });
      
      console.log(`🏷️ Tag created: ${tag.name} (${tag.path})`);
      return tag;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  }
  
  /**
   * GROUPS MANAGEMENT
   */
  
  /**
   * Obtiene tags con filtros opcionales
   */
  async getTags(where?: any, include?: any, orderBy?: any): Promise<any[]> {
    try {
      const tags = await this.prisma.meetTag.findMany({
        where,
        include,
        orderBy
      });
      return tags;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  }

  /**
   * Obtiene un tag por slug
   */
  async getTagBySlug(slug: string): Promise<any> {
    try {
      const tag = await this.prisma.meetTag.findUnique({
        where: { slug }
      });
      return tag;
    } catch (error) {
      console.error('Error fetching tag by slug:', error);
      throw error;
    }
  }

  /**
   * Obtiene grupos con filtros opcionales
   */
  async getGroups(where?: any, include?: any, orderBy?: any): Promise<any[]> {
    try {
      const groups = await this.prisma.meetGroup.findMany({
        where,
        include,
        orderBy
      });
      return groups;
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  }

  /**
   * Obtiene un grupo por slug
   */
  async getGroupBySlug(slug: string): Promise<any> {
    try {
      const group = await this.prisma.meetGroup.findUnique({
        where: { slug }
      });
      return group;
    } catch (error) {
      console.error('Error fetching group by slug:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo grupo con jerarquía
   */
  async createGroup(data: {
    name: string;
    slug: string;
    description?: string;
    color?: string;
    parentId?: string;
    createdBy?: string;
  }): Promise<any> {
    try {
      // Calcular path y level basado en parent
      let path = `/${data.slug}`;
      let level = 0;
      
      if (data.parentId) {
        const parent = await this.prisma.meetGroup.findUnique({
          where: { id: data.parentId }
        });
        if (parent) {
          path = `${parent.path}/${data.slug}`;
          level = parent.level + 1;
        }
      }
      
      const group = await this.prisma.meetGroup.create({
        data: {
          ...data,
          parentId: data.parentId || null, // Ensure empty string becomes null
          path,
          level
        }
      });
      
      console.log(`📁 Group created: ${group.name} (${group.path})`);
      return group;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }
  
  /**
   * SPACE-TAG-GROUP ASSIGNMENT
   */
  
  /**
   * Asigna tags a un space
   */
  async assignTagsToSpace(spaceId: string, tagIds: string[], assignedBy?: string): Promise<void> {
    try {
      const space = await this.prisma.meetSpace.findFirst({
        where: { spaceId }
      });
      
      if (!space) {
        throw new Error(`Space ${spaceId} not found`);
      }
      
      // Crear asignaciones
      await this.prisma.meetSpaceTag.createMany({
        data: tagIds.map(tagId => ({
          spaceId: space.id,
          tagId,
          createdBy: assignedBy
        }))
      });
      
      console.log(`🏷️ Assigned ${tagIds.length} tags to space ${spaceId}`);
    } catch (error) {
      console.error('Error assigning tags:', error);
      throw error;
    }
  }
  
  /**
   * Asigna grupos a un space
   */
  async assignGroupsToSpace(spaceId: string, groupIds: string[], assignedBy?: string): Promise<void> {
    try {
      const space = await this.prisma.meetSpace.findFirst({
        where: { spaceId }
      });
      
      if (!space) {
        throw new Error(`Space ${spaceId} not found`);
      }
      
      // Crear asignaciones
      await this.prisma.meetSpaceGroup.createMany({
        data: groupIds.map(groupId => ({
          spaceId: space.id,
          groupId,
          createdBy: assignedBy
        }))
      });
      
      // Aplicar tags por defecto del grupo
      for (const groupId of groupIds) {
        const defaultTags = await this.prisma.meetGroupDefaultTag.findMany({
          where: { groupId }
        });
        
        if (defaultTags.length > 0) {
          await this.prisma.meetSpaceTag.createMany({
            data: defaultTags.map(dt => ({
              spaceId: space.id,
              tagId: dt.tagId,
              createdBy: assignedBy,
              isAutoAssigned: true
            }))
          });
          
          console.log(`🏷️ Auto-assigned ${defaultTags.length} default tags from group`);
        }
      }
      
      console.log(`📁 Assigned ${groupIds.length} groups to space ${spaceId}`);
    } catch (error) {
      console.error('Error assigning groups:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}