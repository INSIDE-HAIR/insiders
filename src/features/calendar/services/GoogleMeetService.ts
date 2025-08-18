import { OAuth2Client } from 'google-auth-library';

export interface MeetMember {
  name: string;
  email: string;
  role: 'ROLE_UNSPECIFIED' | 'COHOST';
}

export class GoogleMeetService {
  private auth: OAuth2Client;

  constructor(auth: OAuth2Client) {
    this.auth = auth;
  }

  /**
   * Verifica los scopes del token actual
   */
  async checkTokenScopes(): Promise<void> {
    try {
      const token = await this.auth.getAccessToken();
      if (!token.token) {
        console.error('❌ No access token available for scope check');
        return;
      }

      // Verificar info del token usando Google OAuth2 API
      const tokenInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token.token}`
      );

      if (tokenInfoResponse.ok) {
        const tokenInfo = await tokenInfoResponse.json();
        console.log('🔐 Current token scopes:', tokenInfo.scope);
        
        const requiredScopes = [
          'https://www.googleapis.com/auth/meetings.space.readonly',
          'https://www.googleapis.com/auth/meetings.space.created'
        ];
        
        const hasRequiredScopes = requiredScopes.some(scope => 
          tokenInfo.scope?.includes(scope)
        );
        
        if (!hasRequiredScopes) {
          console.warn('⚠️ Missing required Meet API scopes. Required:', requiredScopes);
          console.warn('📋 Available scopes:', tokenInfo.scope);
        } else {
          console.log('✅ Required Meet API scopes are present');
        }
      } else {
        console.error('❌ Failed to check token info:', tokenInfoResponse.statusText);
      }
    } catch (error) {
      console.error('💥 Error checking token scopes:', error);
    }
  }

  /**
   * Extrae el space ID de una URL de Google Meet
   */
  extractSpaceId(meetUrl: string): string | null {
    if (!meetUrl) return null;
    
    // Patrones comunes de URLs de Meet
    // https://meet.google.com/abc-defg-hij
    // https://meet.google.com/s/custom-space-id
    const patterns = [
      /meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/,
      /meet\.google\.com\/s\/([a-zA-Z0-9_-]+)/,
      /meet\.google\.com\/([a-zA-Z0-9_-]+)$/
    ];
    
    for (const pattern of patterns) {
      const match = meetUrl.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }

  /**
   * Obtiene los miembros de un espacio de Meet
   */
  async getSpaceMembers(spaceId: string): Promise<MeetMember[]> {
    try {
      const token = await this.auth.getAccessToken();
      if (!token.token) {
        console.error('No access token available');
        return [];
      }

      console.log(`🔍 Attempting to fetch members for space: ${spaceId}`);

      // Primero intentar obtener información del espacio para verificar si existe
      const spaceInfoResponse = await fetch(
        `https://meet.googleapis.com/v2/spaces/${spaceId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token.token}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!spaceInfoResponse.ok) {
        if (spaceInfoResponse.status === 404) {
          console.log(`❌ Space ${spaceId} not found (404)`);
          return [];
        }
        if (spaceInfoResponse.status === 403) {
          console.log(`🚫 No permission to access space ${spaceId} (403)`);
          // Intentar con diferentes scopes o permisos
          console.log(`🔍 Current token scopes check needed`);
          return [];
        }
        console.error(`❌ Space info fetch failed: ${spaceInfoResponse.status} ${spaceInfoResponse.statusText}`);
        return [];
      }

      const spaceInfo = await spaceInfoResponse.json();
      console.log(`✅ Space ${spaceId} found:`, spaceInfo);

      // Ahora intentar obtener los miembros
      const membersResponse = await fetch(
        `https://meet.googleapis.com/v2/spaces/${spaceId}/members`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token.token}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!membersResponse.ok) {
        if (membersResponse.status === 404) {
          console.log(`📝 Space ${spaceId} has no members endpoint (404) - this is normal for calendar-generated meets`);
          return [];
        }
        if (membersResponse.status === 403) {
          console.log(`🚫 No permission to access space ${spaceId} members (403)`);
          return [];
        }
        console.error(`❌ Members fetch failed: ${membersResponse.status} ${membersResponse.statusText}`);
        return [];
      }

      const data = await membersResponse.json();
      console.log(`👥 Members data for space ${spaceId}:`, data);
      
      // Mapear la respuesta a nuestro formato
      const members: MeetMember[] = (data.members || []).map((member: any) => ({
        name: member.name || '',
        email: member.email || '',
        role: member.role || 'ROLE_UNSPECIFIED'
      }));

      console.log(`✅ Found ${members.length} members for space ${spaceId}`);
      return members;
    } catch (error) {
      console.error(`💥 Error fetching Meet members for space ${spaceId}:`, error);
      return [];
    }
  }

  /**
   * Obtiene miembros desde la URL de Meet del evento
   */
  async getMembersFromEventMeetUrl(meetUrl: string | undefined): Promise<MeetMember[]> {
    if (!meetUrl) return [];
    
    const spaceId = this.extractSpaceId(meetUrl);
    if (!spaceId) {
      console.log('Could not extract space ID from URL:', meetUrl);
      return [];
    }

    // OPTIMIZACIÓN DESHABILITADA - Llamar API para todos los spaces
    // Nota: Esto hará muchas llamadas API que fallarán con 404
    // const isCalendarGeneratedMeeting = spaceId.match(/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/);
    // if (isCalendarGeneratedMeeting) {
    //   console.log(`📅 Space ${spaceId} appears to be Calendar-generated, skipping API call`);
    //   return [];
    // }

    return this.getSpaceMembers(spaceId);
  }
}