/**
 * GoogleAuthProvider
 *
 * Servicio para manejar la autenticación con Google y obtener acceso a Google Drive
 */

import { Logger } from "../../utils/logger";

export interface GoogleAuthConfig {
  clientId: string;
  apiKey: string;
  scopes: string[];
  discoveryDocs?: string[];
}

export interface GoogleAuthUser {
  id: string;
  email: string;
  name: string;
  imageUrl?: string;
  accessToken: string;
  expiresAt: number;
}

export interface GoogleAuthState {
  isSignedIn: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  user: GoogleAuthUser | null;
  error: Error | null;
}

const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
];

const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
];

/**
 * Proveedor de autenticación para Google
 */
export class GoogleAuthProvider {
  private authConfig: GoogleAuthConfig;
  private authState: GoogleAuthState;
  private logger: Logger;
  private authInstance: any = null;
  private listeners: ((state: GoogleAuthState) => void)[] = [];

  /**
   * Constructor del proveedor de autenticación
   * @param config Configuración para la autenticación
   */
  constructor(config?: Partial<GoogleAuthConfig>) {
    this.logger = new Logger("GoogleAuthProvider");

    // Configuración por defecto
    this.authConfig = {
      clientId: config?.clientId || process.env.GOOGLE_CLIENT_ID || "",
      apiKey: config?.apiKey || process.env.GOOGLE_API_KEY || "",
      scopes: config?.scopes || SCOPES,
      discoveryDocs: config?.discoveryDocs || DISCOVERY_DOCS,
    };

    // Estado inicial
    this.authState = {
      isSignedIn: false,
      isInitialized: false,
      isLoading: false,
      user: null,
      error: null,
    };

    this.logger.info("GoogleAuthProvider inicializado");
  }

  /**
   * Inicializa la biblioteca de autenticación de Google
   * @returns Promesa que se resuelve cuando la inicialización está completa
   */
  async initialize(): Promise<void> {
    if (this.authState.isInitialized) {
      this.logger.info("La autenticación ya está inicializada");
      return;
    }

    this.updateAuthState({ isLoading: true, error: null });

    try {
      this.logger.info("Cargando biblioteca de autenticación de Google");

      // En una implementación real, aquí cargaríamos la biblioteca desde gapi
      // await loadGoogleAuthLibrary();

      // Simulación de inicialización
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Simulación de inicialización exitosa
      this.authInstance = {
        isSignedIn: {
          get: () => false,
          listen: (callback: (isSignedIn: boolean) => void) => {
            // Simulación de la escucha de cambios en el estado de autenticación
            setTimeout(() => callback(false), 0);
            return () => {}; // Función para eliminar el listener
          },
        },
        signIn: async () => {
          // Simulación de inicio de sesión
          const user = {
            getId: () => "123456789",
            getEmail: () => "usuario@ejemplo.com",
            getName: () => "Usuario Ejemplo",
            getImageUrl: () => "https://ejemplo.com/imagen.jpg",
            getAuthResponse: () => ({
              access_token: "token-simulado",
              expires_at: Date.now() + 3600 * 1000,
            }),
          };

          return user;
        },
        signOut: async () => {
          // Simulación de cierre de sesión
          return true;
        },
      };

      // Configurar escucha de cambios en el estado de autenticación
      this.authInstance.isSignedIn.listen(this.handleAuthChange.bind(this));

      // Establecer estado inicial
      this.updateAuthState({
        isInitialized: true,
        isLoading: false,
        isSignedIn: this.authInstance.isSignedIn.get(),
      });

      // Si el usuario ya está autenticado, actualizar la información del usuario
      if (this.authState.isSignedIn) {
        await this.setUserInfo();
      }

      this.logger.info("Inicialización de autenticación completa");
    } catch (error) {
      this.logger.error("Error al inicializar la autenticación", error);
      this.updateAuthState({
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  /**
   * Inicia sesión con Google
   * @returns Promesa que se resuelve cuando el inicio de sesión está completo
   */
  async signIn(): Promise<GoogleAuthUser | null> {
    if (!this.authState.isInitialized) {
      await this.initialize();
    }

    this.updateAuthState({ isLoading: true, error: null });

    try {
      this.logger.info("Iniciando sesión con Google");

      // Iniciar sesión con Google
      const googleUser = await this.authInstance.signIn();

      // Actualizar estado con la información del usuario
      await this.setUserInfo();

      this.logger.info("Inicio de sesión exitoso");
      return this.authState.user;
    } catch (error) {
      this.logger.error("Error al iniciar sesión", error);
      this.updateAuthState({
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return null;
    }
  }

  /**
   * Cierra sesión
   * @returns Promesa que se resuelve cuando el cierre de sesión está completo
   */
  async signOut(): Promise<void> {
    if (!this.authState.isInitialized || !this.authInstance) {
      this.logger.warn(
        "No se puede cerrar sesión: autenticación no inicializada"
      );
      return;
    }

    this.updateAuthState({ isLoading: true, error: null });

    try {
      this.logger.info("Cerrando sesión");

      // Cerrar sesión en Google
      await this.authInstance.signOut();

      // Actualizar estado
      this.updateAuthState({
        isSignedIn: false,
        isLoading: false,
        user: null,
      });

      this.logger.info("Cierre de sesión exitoso");
    } catch (error) {
      this.logger.error("Error al cerrar sesión", error);
      this.updateAuthState({
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  /**
   * Obtiene el token de acceso actual
   * @returns Token de acceso o null si no hay sesión
   */
  getAccessToken(): string | null {
    return this.authState.user?.accessToken || null;
  }

  /**
   * Obtiene el estado actual de autenticación
   * @returns Estado de autenticación
   */
  getAuthState(): GoogleAuthState {
    return { ...this.authState };
  }

  /**
   * Suscribe una función a los cambios de estado de autenticación
   * @param listener Función a ejecutar cuando cambia el estado
   * @returns Función para cancelar la suscripción
   */
  subscribe(listener: (state: GoogleAuthState) => void): () => void {
    this.listeners.push(listener);

    // Notificar el estado actual inmediatamente
    listener({ ...this.authState });

    // Retornar función para cancelar suscripción
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Maneja los cambios en el estado de autenticación de Google
   * @param isSignedIn Indica si el usuario está autenticado
   */
  private async handleAuthChange(isSignedIn: boolean): Promise<void> {
    this.logger.info(
      `Estado de autenticación cambiado: ${
        isSignedIn ? "conectado" : "desconectado"
      }`
    );

    this.updateAuthState({ isSignedIn });

    if (isSignedIn) {
      await this.setUserInfo();
    } else {
      this.updateAuthState({ user: null });
    }
  }

  /**
   * Extrae y establece la información del usuario a partir del objeto de autenticación
   */
  private async setUserInfo(): Promise<void> {
    if (!this.authInstance) return;

    try {
      const googleUser = this.authInstance.currentUser.get();
      const profile = googleUser.getBasicProfile();
      const authResponse = googleUser.getAuthResponse();

      const user: GoogleAuthUser = {
        id: profile.getId(),
        email: profile.getEmail(),
        name: profile.getName(),
        imageUrl: profile.getImageUrl(),
        accessToken: authResponse.access_token,
        expiresAt: authResponse.expires_at,
      };

      this.updateAuthState({ user });
    } catch (error) {
      this.logger.error("Error al obtener información del usuario", error);
    }
  }

  /**
   * Actualiza el estado de autenticación y notifica a los suscriptores
   * @param newState Cambios a aplicar al estado
   */
  private updateAuthState(newState: Partial<GoogleAuthState>): void {
    this.authState = { ...this.authState, ...newState };

    // Notificar a todos los suscriptores
    this.listeners.forEach((listener) => listener({ ...this.authState }));
  }
}
