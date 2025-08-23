import { OAuth2Client } from "google-auth-library";
import { MemberRole } from "../validations/SpaceConfigSchema";

// Utilidad para reintentos automáticos en errores temporales
async function retryOnServerError<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      // Verificar si es un error temporal del servidor (502, 503, 504)
      const isServerError =
        error.message?.includes("502") ||
        error.message?.includes("503") ||
        error.message?.includes("504") ||
        error.message?.includes("Bad Gateway") ||
        error.message?.includes("Service Unavailable") ||
        error.message?.includes("Gateway Timeout");

      // Si es el último intento o no es un error del servidor, lanzar el error
      if (attempt === maxRetries || !isServerError) {
        throw error;
      }

      // Esperar antes del siguiente intento (exponential backoff)
      const delay = delayMs * Math.pow(2, attempt - 1);
      console.log(
        `⏱️ Reintentando en ${delay}ms debido a error del servidor (intento ${attempt}/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Maximum retries exceeded");
}

export interface MeetMember {
  name: string; // Full resource name (spaces/{space}/members/{member})
  email?: string; // Email address (v2beta API field)
  user?: {
    name?: string; // User resource name
    displayName?: string;
    email?: string; // Email in user object (v2 stable fallback)
  };
  anonymousUser?: {
    displayName?: string;
  };
  phoneUser?: {
    displayName?: string;
  };
  role: MemberRole; // ROLE_UNSPECIFIED, COHOST
  createTime?: string; // RFC3339 timestamp
}

export interface CreateMemberRequest {
  email: string;
  role?: MemberRole;
  displayName?: string;
}

export interface ListMembersOptions {
  pageSize?: number; // 1-100, default 25
  pageToken?: string;
  fields?: string; // Field mask for response filtering
}

export interface ListMembersResponse {
  members: MeetMember[];
  nextPageToken?: string;
}

export class MeetMembersService {
  private auth: OAuth2Client;
  private baseUrl = "https://meet.googleapis.com/v2beta";
  private stableUrl = "https://meet.googleapis.com/v2";

  constructor(auth: OAuth2Client) {
    this.auth = auth;
  }

  /**
   * Lista todos los miembros de un espacio de reunión
   * 🔄 Intenta v2 estable primero, luego fallback a v2beta
   */
  async listMembers(
    spaceId: string,
    options: ListMembersOptions = {}
  ): Promise<ListMembersResponse> {
    try {
      const token = await this.auth.getAccessToken();
      if (!token.token) {
        throw new Error("No access token available");
      }

      const searchParams = new URLSearchParams();
      if (options.pageSize)
        searchParams.set("pageSize", options.pageSize.toString());
      if (options.pageToken) searchParams.set("pageToken", options.pageToken);

      console.log(`📋 Listing members for space ${spaceId}`);

      // 🔄 ESTRATEGIA: Intentar v2 estable primero, luego v2beta
      const urlsToTry = [
        {
          url: `${this.stableUrl}/spaces/${spaceId}/members?${searchParams.toString()}`,
          version: "v2-stable",
        },
        {
          url: `${this.baseUrl}/spaces/${spaceId}/members?${searchParams.toString()}`,
          version: "v2beta",
        },
      ];

      let lastError: any;

      for (const { url, version } of urlsToTry) {
        console.log(`🔗 Trying ${version}: ${url}`);

        try {
          const response = await fetch(url, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token.token}`,
              Accept: "application/json",
            },
          });

          if (!response.ok) {
            const errorText = await response.text();

            // Si v2 no tiene el endpoint, probar v2beta
            if (response.status === 404 && version === "v2-stable") {
              console.log(`⚠️ ${version} endpoint not found, trying v2beta...`);
              lastError = new Error(
                `${version}: ${response.status} ${errorText}`
              );
              continue;
            }

            // Si v2beta también falla con 404, es limitación de Developer Preview
            if (
              response.status === 404 &&
              version === "v2beta" &&
              errorText.includes("Method not found")
            ) {
              console.log(
                `⚠️ Both v2 and v2beta Members endpoints not available`
              );
              return {
                members: [],
                _limitation:
                  "Members endpoints not available. v2: not found, v2beta: requires Developer Preview access",
                _link: "https://developers.google.com/workspace/preview",
                _apiVersionTried: "v2+v2beta",
              } as any;
            }

            if (response.status === 404) {
              console.log(
                `📝 Space ${spaceId} not found or has no members (404) - ${version}`
              );
              return { members: [] };
            }

            if (response.status === 403) {
              console.log(
                `🚫 No permission to access space ${spaceId} members (403) - ${version}`
              );
              return { members: [] };
            }

            throw new Error(
              `Failed to list members (${version}): ${response.status} ${response.statusText} - ${errorText}`
            );
          }

          // ✅ Éxito!
          const data = await response.json();
          console.log(
            `✅ Retrieved ${data.members?.length || 0} members for space ${spaceId} using ${version}`
          );

          return {
            members: data.members || [],
            nextPageToken: data.nextPageToken,
            _apiVersion: version,
          } as any;
        } catch (error) {
          lastError = error;
          if (version === "v2beta") {
            // Si v2beta también falla, lanzar el error
            throw error;
          }
          // Si v2 falla, continuar con v2beta
          console.log(`⚠️ ${version} failed, trying next version...`);
        }
      }

      throw lastError;
    } catch (error) {
      console.error(`💥 Error listing members for space ${spaceId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene información de un miembro específico
   * Requiere scope: meetings.space.readonly o meetings.space.created
   */
  async getMember(
    spaceId: string,
    memberId: string,
    fields?: string
  ): Promise<MeetMember> {
    try {
      const token = await this.auth.getAccessToken();
      if (!token.token) {
        throw new Error("No access token available");
      }

      const searchParams = new URLSearchParams();
      if (fields) searchParams.set("fields", fields);

      const url = `${this.baseUrl}/spaces/${spaceId}/members/${memberId}?${searchParams.toString()}`;

      console.log(`👤 Getting member ${memberId} for space ${spaceId}`);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to get member: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const member = await response.json();
      console.log(`✅ Retrieved member ${memberId}`);

      return member;
    } catch (error) {
      console.error(
        `💥 Error getting member ${memberId} for space ${spaceId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Crea un nuevo miembro en un espacio de reunión
   * 🔄 Intenta v2 estable primero, luego fallback a v2beta
   */
  async createMember(
    spaceId: string,
    memberData: CreateMemberRequest,
    fields?: string
  ): Promise<MeetMember> {
    try {
      const token = await this.auth.getAccessToken();
      if (!token.token) {
        throw new Error("No access token available");
      }

      const searchParams = new URLSearchParams();
      if (fields) searchParams.set("fields", fields);

      // Request body contiene Member object según documentación
      const requestBody = {
        email: memberData.email,
        role: memberData.role || "ROLE_UNSPECIFIED",
      };

      console.log(
        `👤➕ Creating member ${memberData.email} in space ${spaceId} with role ${requestBody.role}`
      );
      console.log("🔧 Request body:", JSON.stringify(requestBody, null, 2));

      // 🔄 ESTRATEGIA: Intentar v2 estable primero, luego v2beta
      const urlsToTry = [
        {
          url: `${this.stableUrl}/spaces/${spaceId}/members?${searchParams.toString()}`,
          version: "v2-stable",
        },
        {
          url: `${this.baseUrl}/spaces/${spaceId}/members?${searchParams.toString()}`,
          version: "v2beta",
        },
      ];

      let lastError: any;

      for (const { url, version } of urlsToTry) {
        console.log(`🔗 Trying ${version}: ${url}`);

        try {
          // Envolver la operación fetch en la función de reintento automático
          const response = await retryOnServerError(
            async () => {
              const res = await fetch(url, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token.token}`,
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
              });

              // Si es un error 502, 503, o 504, lanzar error para activar el reintento
              if (
                res.status === 502 ||
                res.status === 503 ||
                res.status === 504
              ) {
                const errorText = await res
                  .text()
                  .catch(() => "Unknown server error");
                throw new Error(
                  `${res.status} ${res.statusText} - ${errorText}`
                );
              }

              return res;
            },
            3,
            2000
          ); // 3 reintentos con 2 segundos base

          if (!response.ok) {
            const errorText = await response.text();

            // Si v2 no tiene el endpoint, probar v2beta
            if (response.status === 404 && version === "v2-stable") {
              console.log(`⚠️ ${version} endpoint not found, trying v2beta...`);
              lastError = new Error(
                `${version}: ${response.status} ${errorText}`
              );
              continue;
            }

            // Si v2beta también falla con 404, es limitación de Developer Preview
            if (
              response.status === 404 &&
              version === "v2beta" &&
              errorText.includes("Method not found")
            ) {
              throw new Error(
                `Google Meet API Members endpoints not available. v2 stable: not found, v2beta: requires Developer Preview access. ` +
                  `Apply at: https://developers.google.com/workspace/preview`
              );
            }

            // Otros errores
            if (response.status === 400) {
              throw new Error(`Invalid member data (${version}): ${errorText}`);
            }

            if (response.status === 403) {
              throw new Error(
                `Permission denied (${version}). Host must approve app access: ${errorText}`
              );
            }

            if (response.status === 409) {
              throw new Error(
                `Member already exists (${version}): ${errorText}`
              );
            }

            throw new Error(
              `Failed to create member (${version}): ${response.status} ${response.statusText} - ${errorText}`
            );
          }

          // ✅ Éxito!
          const member = await response.json();
          console.log(
            `✅ Created member ${memberData.email} with ${version} - ID: ${member.name}`
          );

          // Agregar metadata de versión usada
          (member as any)._apiVersion = version;

          return member;
        } catch (error) {
          lastError = error;
          if (version === "v2beta") {
            // Si v2beta también falla, lanzar el error
            throw error;
          }
          // Si v2 falla, continuar con v2beta
          console.log(`⚠️ ${version} failed, trying next version...`);
        }
      }

      throw lastError;
    } catch (error) {
      console.error(
        `💥 Error creating member ${memberData.email} for space ${spaceId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Elimina un miembro de un espacio de reunión
   * Requiere scope: meetings.space.created
   */
  async deleteMember(spaceId: string, memberId: string): Promise<void> {
    try {
      const token = await this.auth.getAccessToken();
      if (!token.token) {
        throw new Error("No access token available");
      }

      const url = `${this.baseUrl}/spaces/${spaceId}/members/${memberId}`;

      console.log(`👤❌ Deleting member ${memberId} from space ${spaceId}`);

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token.token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();

        if (response.status === 404) {
          console.log(
            `👤 Member ${memberId} not found in space ${spaceId} (404)`
          );
          return; // Ya no existe, objetivo cumplido
        }

        throw new Error(
          `Failed to delete member: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      console.log(`✅ Deleted member ${memberId} from space ${spaceId}`);
    } catch (error) {
      console.error(
        `💥 Error deleting member ${memberId} from space ${spaceId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Actualiza el rol de un miembro existente
   * Requiere scope: meetings.space.created
   */
  async updateMemberRole(
    spaceId: string,
    memberId: string,
    newRole: MemberRole,
    fields?: string
  ): Promise<MeetMember> {
    try {
      console.log(
        `👤🔄 Updating member ${memberId} role to ${newRole} in space ${spaceId} via delete+recreate`
      );

      // ESTRATEGIA: Google Meet API v2beta NO soporta PATCH de roles
      // Necesitamos eliminar el miembro y volver a agregarlo con el nuevo rol

      // 1. Obtener información completa del miembro antes de eliminarlo
      const memberInfo = await this.getMemberById(spaceId, memberId);
      if (!memberInfo || !memberInfo.email) {
        throw new Error(`Cannot retrieve member information for ${memberId}`);
      }

      const memberEmail = memberInfo.email;
      console.log(`👤📧 Member email retrieved: ${memberEmail}`);

      // 2. Eliminar el miembro actual
      console.log(`👤❌ Deleting member ${memberEmail} to change role...`);
      await this.deleteMember(spaceId, memberId);

      // 3. Volver a agregar el miembro con el nuevo rol
      console.log(`👤➕ Re-adding member ${memberEmail} with role ${newRole}...`);
      const recreatedMember = await this.createMember(
        spaceId,
        { email: memberEmail, role: newRole },
        fields || 'name,email,role'
      );

      console.log(`✅ Member role updated successfully: ${memberEmail} -> ${newRole}`);
      return recreatedMember;

    } catch (error: any) {
      // Si falla, intentar el método PATCH original por si acaso
      console.log(`⚠️ Delete+recreate failed, trying direct PATCH as fallback...`);
      
      try {
        const token = await this.auth.getAccessToken();
        if (!token.token) {
          throw new Error("No access token available");
        }

        const searchParams = new URLSearchParams();
        if (fields) searchParams.set("fields", fields);
        searchParams.set("updateMask", "role");

        const url = `${this.baseUrl}/spaces/${spaceId}/members/${memberId}?${searchParams.toString()}`;

        const requestBody = {
          role: newRole,
        };

        const response = await fetch(url, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token.token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to update member role: ${response.status} ${response.statusText} - ${errorText}`
          );
        }

        const updatedMember = await response.json();
        console.log(`✅ Updated member ${memberId} role to ${newRole} (via PATCH)`);
        return updatedMember;

      } catch (patchError: any) {
        console.error(`💥 Both delete+recreate and PATCH methods failed:`, patchError);
        throw new Error(
          `Unable to update member role. Google Meet API v2beta may not support role updates. ` +
          `Original error: ${error.message}. PATCH fallback error: ${patchError.message}`
        );
      }
    }
  }

  /**
   * Obtiene información completa de un miembro por su ID
   */
  async getMemberById(spaceId: string, memberId: string): Promise<MeetMember | null> {
    try {
      const token = await this.auth.getAccessToken();
      if (!token.token) {
        throw new Error("No access token available");
      }

      // Intentar con v2 stable primero
      let url = `https://meet.googleapis.com/v2/spaces/${spaceId}/members/${memberId}`;
      
      console.log(`👤🔍 Getting member ${memberId} info from space ${spaceId}`);

      let response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.token}`,
          Accept: "application/json",
        },
      });

      // Si v2 no funciona, intentar v2beta
      if (!response.ok && response.status === 404) {
        console.log(`⚠️ v2-stable endpoint not found, trying v2beta...`);
        url = `https://meet.googleapis.com/v2beta/spaces/${spaceId}/members/${memberId}`;
        
        response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token.token}`,
            Accept: "application/json",
          },
        });
      }

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`👤❌ Member ${memberId} not found in space ${spaceId}`);
          return null;
        }
        
        const errorText = await response.text();
        throw new Error(
          `Failed to get member ${memberId}: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const member = await response.json();
      console.log(`✅ Retrieved member ${memberId} info from space ${spaceId}`);
      
      return member;

    } catch (error: any) {
      console.error(`💥 Error getting member ${memberId} from space ${spaceId}:`, error);
      throw error;
    }
  }

  /**
   * Busca un miembro por email en un espacio
   * Utilidad para encontrar el member ID dado un email
   */
  async findMemberByEmail(
    spaceId: string,
    email: string
  ): Promise<MeetMember | null> {
    try {
      const response = await this.listMembers(spaceId);

      // 🐛 DEBUG: Logging detallado de la estructura de miembros
      console.log(
        `🔍 DEBUG: Buscando email '${email}' entre ${response.members.length} miembros:`
      );
      response.members.forEach((m, index) => {
        console.log(`🔍 DEBUG: Member ${index + 1}:`, {
          name: m.name,
          role: m.role,
          user: m.user,
          anonymousUser: m.anonymousUser,
          phoneUser: m.phoneUser,
          createTime: m.createTime,
          fullObject: JSON.stringify(m, null, 2),
        });
      });

      // Buscar por email directo (v2beta) o en user.email (fallback v2)
      const member = response.members.find((m) => {
        // v2beta: email está directamente en el objeto member
        if ((m as any).email === email) return true;

        // Fallback para v2 estable o estructuras diferentes
        if (m.user?.email === email) return true;
        if (m.anonymousUser?.displayName === email) return true;
        if (m.phoneUser?.displayName === email) return true;

        return false;
      });

      if (member) {
        console.log(`🔍 Found member ${email} with ID: ${member.name}`);
        return member;
      } else {
        console.log(`🔍 Member ${email} not found in space ${spaceId}`);
        console.log(`🔍 DEBUG: Comparaciones realizadas:`);
        response.members.forEach((m, index) => {
          console.log(
            `   Member ${index + 1}: email='${(m as any).email}' === '${email}' ? ${(m as any).email === email}`
          );
          console.log(
            `   Member ${index + 1}: user.email='${m.user?.email}' === '${email}' ? ${m.user?.email === email}`
          );
          console.log(
            `   Member ${index + 1}: anonymousUser.displayName='${m.anonymousUser?.displayName}' === '${email}' ? ${m.anonymousUser?.displayName === email}`
          );
          console.log(
            `   Member ${index + 1}: phoneUser.displayName='${m.phoneUser?.displayName}' === '${email}' ? ${m.phoneUser?.displayName === email}`
          );
        });
        return null;
      }
    } catch (error) {
      console.error(
        `💥 Error finding member ${email} in space ${spaceId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Operaciones en lote para múltiples miembros
   * Agrega múltiples miembros secuencialmente para evitar rate limits
   */
  async bulkCreateMembers(
    spaceId: string,
    members: CreateMemberRequest[],
    options?: {
      batchDelay?: number; // ms between requests
      continueOnError?: boolean;
      fields?: string;
    }
  ): Promise<{
    successes: MeetMember[];
    failures: Array<{ member: CreateMemberRequest; error: string }>;
  }> {
    const successes: MeetMember[] = [];
    const failures: Array<{ member: CreateMemberRequest; error: string }> = [];
    const batchDelay = options?.batchDelay || 200; // 200ms default delay

    console.log(
      `👥➕ Starting bulk creation of ${members.length} members for space ${spaceId}`
    );

    for (const member of members) {
      try {
        const createdMember = await this.createMember(
          spaceId,
          member,
          options?.fields
        );
        successes.push(createdMember);

        // Delay between requests to avoid rate limits
        if (members.length > 1 && batchDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, batchDelay));
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        failures.push({ member, error: errorMessage });

        console.error(
          `❌ Failed to create member ${member.email}:`,
          errorMessage
        );

        if (!options?.continueOnError) {
          console.log(`🛑 Stopping bulk creation due to error`);
          break;
        }
      }
    }

    console.log(
      `✅ Bulk creation completed: ${successes.length} successes, ${failures.length} failures`
    );

    return { successes, failures };
  }

  /**
   * Extrae el member ID de un nombre de recurso completo
   * Ej: "spaces/abc123/members/def456" -> "def456"
   */
  extractMemberId(resourceName: string): string | null {
    const match = resourceName.match(/members\/([^\/]+)$/);
    return match?.[1] || null;
  }

  /**
   * Extrae el space ID de un nombre de recurso completo
   * Ej: "spaces/abc123/members/def456" -> "abc123"
   */
  extractSpaceId(resourceName: string): string | null {
    const match = resourceName.match(/spaces\/([^\/]+)\/members/);
    return match?.[1] || null;
  }
}
