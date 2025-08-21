import { OAuth2Client } from 'google-auth-library';
import { SpaceConfig, MeetingTemplate, generateTemplateConfig } from '../validations/SpaceConfigSchema';

export interface SpaceResource {
  name: string;                    // Resource name: spaces/{space}
  meetingUri?: string;             // Meet URL
  meetingCode?: string;            // Meeting code
  config?: SpaceConfig;            // Space configuration
  activeConference?: {             // Current active conference
    conferenceRecord?: string;
  };
  createTime?: string;             // RFC3339 timestamp
  updateTime?: string;             // RFC3339 timestamp
}

export interface UpdateSpaceRequest {
  displayName?: string;
  config?: Partial<SpaceConfig>;
}

export interface CreateSpaceRequest {
  displayName?: string;
  config?: SpaceConfig;
}

export class MeetSpaceConfigService {
  private auth: OAuth2Client;
  private baseUrl = 'https://meet.googleapis.com/v2beta'; // Using v2beta for advanced configurations

  constructor(auth: OAuth2Client) {
    this.auth = auth;
  }

  /**
   * Crea un nuevo espacio de reunión con configuración completa - API v2beta
   * Implementa fallback para funcionalidades no disponibles
   * Requiere scope: meetings.space.created
   */
  async createSpace(request: CreateSpaceRequest): Promise<SpaceResource> {
    try {
      const token = await this.auth.getAccessToken();
      if (!token.token) {
        throw new Error('No access token available');
      }

      const url = `${this.baseUrl}/spaces`;
      
      console.log('🏗️ Creating new Meet space with v2beta API');
      console.log('📋 Request config:', JSON.stringify(request, null, 2));

      // Intentar crear con configuración completa primero
      let space = await this.attemptSpaceCreation(url, token.token, request.config);
      
      // Agregar displayName como metadata ya que no es parte del esquema oficial de la API
      if (request.displayName) {
        (space as any)._requestedDisplayName = request.displayName;
        console.log('📝 DisplayName stored in metadata:', request.displayName);
      }

      return space;

    } catch (error) {
      console.error('💥 Error creating Meet space:', error);
      throw error;
    }
  }

  /**
   * Intenta crear un espacio con fallback progresivo para funcionalidades no disponibles
   */
  private async attemptSpaceCreation(url: string, token: string, config?: SpaceConfig): Promise<SpaceResource> {
    if (!config) {
      // Si no hay configuración, crear espacio básico
      return this.createBasicSpace(url, token);
    }

    // Lista de funcionalidades que pueden fallar por permisos
    const fallbackStrategies = [
      // Estrategia 1: Configuración completa
      () => this.createSpaceWithConfig(url, token, config),
      
      // Estrategia 2: Sin attendanceReportGenerationType
      () => {
        const configWithoutReports = { ...config };
        delete configWithoutReports.attendanceReportGenerationType;
        console.log('🔄 Retrying without attendance report generation...');
        return this.createSpaceWithConfig(url, token, configWithoutReports);
      },
      
      // Estrategia 3: Sin artefactos automáticos
      () => {
        const configWithoutArtifacts = { ...config };
        delete configWithoutArtifacts.artifactConfig;
        delete configWithoutArtifacts.attendanceReportGenerationType;
        console.log('🔄 Retrying without artifact config...');
        return this.createSpaceWithConfig(url, token, configWithoutArtifacts);
      },
      
      // Estrategia 4: Solo configuración básica
      () => {
        const basicConfig = {
          accessType: config.accessType,
          entryPointAccess: config.entryPointAccess
        };
        console.log('🔄 Retrying with basic config only...');
        return this.createSpaceWithConfig(url, token, basicConfig);
      },
      
      // Estrategia 5: Espacio completamente básico
      () => {
        console.log('🔄 Creating basic space without configuration...');
        return this.createBasicSpace(url, token);
      }
    ];

    for (let i = 0; i < fallbackStrategies.length; i++) {
      try {
        const space = await fallbackStrategies[i]();
        if (i > 0) {
          console.log(`⚠️ Space created with fallback strategy ${i + 1}`);
          (space as any)._configurationIssues = `Some features unavailable - used fallback strategy ${i + 1}`;
        }
        return space;
      } catch (error: any) {
        console.log(`❌ Strategy ${i + 1} failed:`, error.message);
        if (i === fallbackStrategies.length - 1) {
          // Si todas las estrategias fallaron, relanzar el último error
          throw error;
        }
        // Continuar con la siguiente estrategia
      }
    }

    throw new Error('All fallback strategies failed');
  }

  /**
   * Crea un espacio con configuración específica
   */
  private async createSpaceWithConfig(url: string, token: string, config: any): Promise<SpaceResource> {
    const body = { config };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create space with config: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const space = await response.json();
    console.log('✅ Space created successfully:', space.name);
    return space;
  }

  /**
   * Crea un espacio básico sin configuración
   */
  private async createBasicSpace(url: string, token: string): Promise<SpaceResource> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create basic space: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const space = await response.json();
    console.log('✅ Basic space created successfully:', space.name);
    return space;
  }

  /**
   * Crea un espacio usando una plantilla predefinida
   * NOTA: API v2 ignora toda configuración - solo crea space básico
   * Requiere scope: meetings.space.created
   */
  async createSpaceFromTemplate(
    template: MeetingTemplate, 
    displayName?: string,
    customConfig?: Partial<SpaceConfig>
  ): Promise<SpaceResource> {
    console.log(`📋 Creating space from template: ${template} (template will be ignored by API v2)`);
    
    // Generar configuración desde plantilla (para logging)
    const templateConfig = generateTemplateConfig(template);
    
    // Combinar con configuración personalizada si existe (para logging)
    const finalConfig: SpaceConfig = {
      ...templateConfig,
      ...customConfig
    };

    const request: CreateSpaceRequest = {
      displayName,
      config: finalConfig
    };

    // API v2 ignora toda la configuración pero creamos el space
    const space = await this.createSpace(request);
    
    // Agregar metadata de plantilla al resultado (para referencia)
    (space as any)._template = template;
    (space as any)._requestedConfig = finalConfig;
    (space as any)._requestedDisplayName = displayName;
    (space as any)._templateConfig = templateConfig;
    
    return space;
  }

  /**
   * Obtiene un espacio existente con su configuración
   * Requiere scope: meetings.space.readonly o meetings.space.created
   */
  async getSpace(spaceId: string, fields?: string): Promise<SpaceResource> {
    try {
      const token = await this.auth.getAccessToken();
      if (!token.token) {
        throw new Error('No access token available');
      }

      const searchParams = new URLSearchParams();
      if (fields) searchParams.set('fields', fields);

      const url = `${this.baseUrl}/spaces/${spaceId}?${searchParams.toString()}`;
      
      console.log(`🔍 Getting space ${spaceId}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get space: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const space = await response.json();
      console.log(`✅ Retrieved space ${spaceId}`);

      return space;

    } catch (error) {
      console.error(`💥 Error getting space ${spaceId}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza la configuración de un espacio existente
   * Requiere scope: meetings.space.created o meetings.space.settings (para artefactos)
   */
  async updateSpace(
    spaceId: string, 
    updates: UpdateSpaceRequest,
    updateMask?: string[]
  ): Promise<SpaceResource> {
    try {
      const token = await this.auth.getAccessToken();
      if (!token.token) {
        throw new Error('No access token available');
      }

      const searchParams = new URLSearchParams();
      
      // Generar update mask automáticamente si no se proporciona
      if (!updateMask) {
        updateMask = this.generateUpdateMask(updates);
      }
      
      if (updateMask.length > 0) {
        searchParams.set('updateMask', updateMask.join(','));
      }

      const url = `${this.baseUrl}/spaces/${spaceId}?${searchParams.toString()}`;
      
      console.log(`🔄 Updating space ${spaceId} with mask: [${updateMask.join(', ')}]`);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token.token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update space: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const updatedSpace = await response.json();
      console.log(`✅ Updated space ${spaceId}`);

      return updatedSpace;

    } catch (error) {
      console.error(`💥 Error updating space ${spaceId}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un espacio de reunión
   * Requiere scope: meetings.space.created
   */
  async deleteSpace(spaceId: string): Promise<void> {
    try {
      const token = await this.auth.getAccessToken();
      if (!token.token) {
        throw new Error('No access token available');
      }

      const url = `${this.baseUrl}/spaces/${spaceId}`;
      
      console.log(`🗑️ Deleting space ${spaceId}`);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 404) {
          console.log(`✅ Space ${spaceId} already deleted or not found`);
          return; // Ya no existe
        }
        
        throw new Error(`Failed to delete space: ${response.status} ${response.statusText} - ${errorText}`);
      }

      console.log(`✅ Deleted space ${spaceId}`);

    } catch (error) {
      console.error(`💥 Error deleting space ${spaceId}:`, error);
      throw error;
    }
  }

  /**
   * Aplica una plantilla de configuración a un espacio existente
   * Requiere scope: meetings.space.created o meetings.space.settings
   */
  async applyTemplate(
    spaceId: string,
    template: MeetingTemplate,
    preserveSettings?: string[]  // Lista de configuraciones que no se deben sobrescribir
  ): Promise<SpaceResource> {
    console.log(`📋 Applying template ${template} to space ${spaceId}`);

    // Obtener configuración actual si hay configuraciones a preservar
    let currentConfig: SpaceConfig | undefined;
    if (preserveSettings && preserveSettings.length > 0) {
      const currentSpace = await this.getSpace(spaceId, 'config');
      currentConfig = currentSpace.config;
    }

    // Generar nueva configuración desde plantilla
    const templateConfig = generateTemplateConfig(template);

    // Preservar configuraciones específicas si se requiere
    let finalConfig = templateConfig;
    if (currentConfig && preserveSettings) {
      finalConfig = { ...templateConfig };
      
      preserveSettings.forEach(setting => {
        if (setting in currentConfig!) {
          (finalConfig as any)[setting] = (currentConfig as any)[setting];
        }
      });
    }

    // Actualizar el espacio
    const updatedSpace = await this.updateSpace(spaceId, {
      config: finalConfig
    });

    // Agregar metadata de plantilla
    (updatedSpace as any)._appliedTemplate = template;
    (updatedSpace as any)._templateConfig = templateConfig;

    return updatedSpace;
  }

  /**
   * Habilita o deshabilita artefactos automáticos específicos
   * Requiere scope: meetings.space.settings
   */
  async updateArtifacts(
    spaceId: string,
    artifacts: {
      recording?: boolean;
      transcription?: boolean;
      smartNotes?: boolean;
    }
  ): Promise<SpaceResource> {
    console.log(`🎬 Updating artifacts for space ${spaceId}:`, artifacts);

    const artifactConfig: any = {};

    if (artifacts.recording !== undefined) {
      artifactConfig.recordingConfig = {
        autoRecordingGeneration: artifacts.recording ? 'ON' : 'OFF'
      };
    }

    if (artifacts.transcription !== undefined) {
      artifactConfig.transcriptionConfig = {
        autoTranscriptionGeneration: artifacts.transcription ? 'ON' : 'OFF'
      };
    }

    if (artifacts.smartNotes !== undefined) {
      artifactConfig.smartNotesConfig = {
        autoSmartNotesGeneration: artifacts.smartNotes ? 'ON' : 'OFF'
      };
    }

    return this.updateSpace(spaceId, {
      config: { artifactConfig }
    }, ['config.artifactConfig']);
  }

  /**
   * Configura moderación y restricciones de permisos
   * Requiere scope: meetings.space.created
   */
  async updateModeration(
    spaceId: string,
    moderation: {
      enabled?: boolean;
      chatRestriction?: 'HOSTS_ONLY' | 'NO_RESTRICTION';
      presentRestriction?: 'HOSTS_ONLY' | 'NO_RESTRICTION';
      defaultJoinAsViewer?: boolean;
    }
  ): Promise<SpaceResource> {
    console.log(`👮 Updating moderation for space ${spaceId}:`, moderation);

    const config: any = {};

    if (moderation.enabled !== undefined) {
      config.moderation = moderation.enabled ? 'ON' : 'OFF';
    }

    const moderationRestrictions: any = {};
    let hasRestrictions = false;

    if (moderation.chatRestriction) {
      moderationRestrictions.chatRestriction = moderation.chatRestriction;
      hasRestrictions = true;
    }

    if (moderation.presentRestriction) {
      moderationRestrictions.presentRestriction = moderation.presentRestriction;
      hasRestrictions = true;
    }

    if (moderation.defaultJoinAsViewer !== undefined) {
      moderationRestrictions.defaultJoinAsViewerType = moderation.defaultJoinAsViewer ? 'ON' : 'OFF';
      hasRestrictions = true;
    }

    if (hasRestrictions) {
      config.moderationRestrictions = moderationRestrictions;
    }

    const updateMask = [];
    if (config.moderation) updateMask.push('config.moderation');
    if (config.moderationRestrictions) updateMask.push('config.moderationRestrictions');

    return this.updateSpace(spaceId, { config }, updateMask);
  }

  /**
   * Genera automáticamente el update mask basado en las actualizaciones
   */
  private generateUpdateMask(updates: UpdateSpaceRequest): string[] {
    const mask: string[] = [];

    if (updates.displayName !== undefined) {
      mask.push('displayName');
    }

    if (updates.config) {
      const config = updates.config;
      
      if (config.accessType) mask.push('config.accessType');
      if (config.entryPointAccess) mask.push('config.entryPointAccess');
      if (config.moderation) mask.push('config.moderation');
      if (config.moderationRestrictions) mask.push('config.moderationRestrictions');
      if (config.attendanceReportGenerationType) mask.push('config.attendanceReportGenerationType');
      
      if (config.artifactConfig) {
        if (config.artifactConfig.recordingConfig) mask.push('config.artifactConfig.recordingConfig');
        if (config.artifactConfig.transcriptionConfig) mask.push('config.artifactConfig.transcriptionConfig');
        if (config.artifactConfig.smartNotesConfig) mask.push('config.artifactConfig.smartNotesConfig');
      }
    }

    return mask;
  }

  /**
   * Extrae el space ID de un nombre de recurso completo
   * Ej: "spaces/abc123" -> "abc123"
   */
  extractSpaceId(resourceName: string): string | null {
    const match = resourceName.match(/spaces\/([^\/]+)$/);
    return match?.[1] || null;
  }

  /**
   * Obtiene información resumida sobre las capacidades disponibles
   */
  getAvailableScopes(): {
    scope: string;
    description: string;
    capabilities: string[];
  }[] {
    return [
      {
        scope: 'https://www.googleapis.com/auth/meetings.space.created',
        description: 'Espacios creados por esta aplicación',
        capabilities: ['Crear', 'Leer', 'Actualizar', 'Eliminar', 'Gestionar miembros']
      },
      {
        scope: 'https://www.googleapis.com/auth/meetings.space.readonly',
        description: 'Lectura de espacios y artefactos',
        capabilities: ['Leer espacios', 'Listar miembros', 'Ver artefactos']
      },
      {
        scope: 'https://www.googleapis.com/auth/meetings.space.settings',
        description: 'Configuración avanzada de espacios',
        capabilities: ['Artefactos automáticos', 'Configuración de todos los espacios']
      }
    ];
  }
}