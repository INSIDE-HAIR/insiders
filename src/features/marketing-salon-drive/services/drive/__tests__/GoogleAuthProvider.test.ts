import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GoogleAuthProvider } from "../GoogleAuthProvider";
import { google } from "googleapis";

// Mock de google
vi.mock("googleapis", () => {
  return {
    google: {
      auth: {
        GoogleAuth: vi.fn().mockImplementation(() => ({
          // Mock del cliente de autenticación
        })),
      },
      drive: vi.fn().mockReturnValue({ version: "v3" }),
    },
  };
});

describe("GoogleAuthProvider", () => {
  // Variables de entorno originales
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Guardar variables de entorno originales
    originalEnv = { ...process.env };

    // Configurar variables de entorno para pruebas
    process.env.GOOGLE_DRIVE_CLIENT_EMAIL = "test@example.com";
    process.env.GOOGLE_DRIVE_PRIVATE_KEY = "test-key";
    process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID = "test-folder-id";
  });

  afterEach(() => {
    // Restaurar variables de entorno originales
    process.env = originalEnv;

    // Limpiar mocks
    vi.clearAllMocks();
  });

  it("debería crear un cliente de Drive correctamente", () => {
    // Ejecutar
    const drive = GoogleAuthProvider.createDriveClient();

    // Verificar
    expect(google.auth.GoogleAuth).toHaveBeenCalledTimes(1);
    expect(google.auth.GoogleAuth).toHaveBeenCalledWith({
      credentials: {
        client_email: "test@example.com",
        private_key: "test-key",
        project_id: "",
        client_id: "",
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    expect(google.drive).toHaveBeenCalledTimes(1);
    expect(drive).toBeDefined();
  });

  it("debería lanzar error si falta GOOGLE_DRIVE_CLIENT_EMAIL", () => {
    // Eliminar variable de entorno necesaria
    delete process.env.GOOGLE_DRIVE_CLIENT_EMAIL;

    // Verificar que se lanza un error
    expect(() => GoogleAuthProvider.createDriveClient()).toThrow(
      "GOOGLE_DRIVE_CLIENT_EMAIL environment variable is not defined"
    );
  });

  it("debería lanzar error si falta GOOGLE_DRIVE_PRIVATE_KEY", () => {
    // Eliminar variable de entorno necesaria
    delete process.env.GOOGLE_DRIVE_PRIVATE_KEY;

    // Verificar que se lanza un error
    expect(() => GoogleAuthProvider.createDriveClient()).toThrow(
      "GOOGLE_DRIVE_PRIVATE_KEY environment variable is not defined"
    );
  });

  it("debería lanzar error si falta GOOGLE_DRIVE_ROOT_FOLDER_ID", () => {
    // Eliminar variable de entorno necesaria
    delete process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

    // Verificar que se lanza un error
    expect(() => GoogleAuthProvider.createDriveClient()).toThrow(
      "GOOGLE_DRIVE_ROOT_FOLDER_ID environment variable is not defined"
    );
  });
});
