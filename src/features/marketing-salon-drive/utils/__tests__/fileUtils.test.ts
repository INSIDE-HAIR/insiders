import { describe, it, expect, vi, beforeEach } from "vitest";
import { FileUtils } from "../fileUtils";

describe("FileUtils", () => {
  // Mock del cliente de Drive
  let mockDrive: any;

  beforeEach(() => {
    // Crear mock del cliente de Drive
    mockDrive = {
      files: {
        get: vi.fn(),
      },
    };
  });

  describe("convertGoogleDriveLink", () => {
    it("debería generar enlaces para imágenes correctamente", async () => {
      // Configurar mock para devolver un tipo MIME de imagen
      mockDrive.files.get.mockResolvedValueOnce({
        data: {
          id: "image-id",
          name: "test-image.jpg",
          mimeType: "image/jpeg",
        },
      });

      // Ejecutar
      const result = await FileUtils.convertGoogleDriveLink(
        mockDrive,
        "image-id"
      );

      // Verificar
      expect(mockDrive.files.get).toHaveBeenCalledWith({
        fileId: "image-id",
        fields: "id,name,mimeType",
        supportsAllDrives: true,
      });

      expect(result.previewUrl).toBe(
        "https://drive.google.com/uc?export=view&id=image-id"
      );
      expect(result.downloadUrl).toBe(
        "https://drive.google.com/uc?export=download&id=image-id"
      );
    });

    it("debería generar enlaces para PDFs correctamente", async () => {
      // Configurar mock para devolver un tipo MIME de PDF
      mockDrive.files.get.mockResolvedValueOnce({
        data: {
          id: "pdf-id",
          name: "test-document.pdf",
          mimeType: "application/pdf",
        },
      });

      // Ejecutar
      const result = await FileUtils.convertGoogleDriveLink(
        mockDrive,
        "pdf-id"
      );

      // Verificar
      expect(result.previewUrl).toBe(
        "https://drive.google.com/file/d/pdf-id/preview"
      );
      expect(result.downloadUrl).toBe(
        "https://drive.google.com/uc?export=download&id=pdf-id"
      );
    });

    it("debería generar enlaces para documentos de Google correctamente", async () => {
      // Configurar mock para devolver un tipo MIME de documento de Google
      mockDrive.files.get.mockResolvedValueOnce({
        data: {
          id: "doc-id",
          name: "test-doc",
          mimeType: "application/vnd.google-apps.document",
        },
      });

      // Ejecutar
      const result = await FileUtils.convertGoogleDriveLink(
        mockDrive,
        "doc-id"
      );

      // Verificar
      expect(result.previewUrl).toBe(
        "https://drive.google.com/file/d/doc-id/preview"
      );
      expect(result.downloadUrl).toBe(
        "https://drive.google.com/uc?export=download&id=doc-id"
      );
    });

    it("debería generar enlaces para otros tipos de archivo correctamente", async () => {
      // Configurar mock para devolver otro tipo MIME
      mockDrive.files.get.mockResolvedValueOnce({
        data: {
          id: "file-id",
          name: "test-file.txt",
          mimeType: "text/plain",
        },
      });

      // Ejecutar
      const result = await FileUtils.convertGoogleDriveLink(
        mockDrive,
        "file-id"
      );

      // Verificar
      expect(result.previewUrl).toBe(
        "https://drive.google.com/file/d/file-id/view"
      );
      expect(result.downloadUrl).toBe(
        "https://drive.google.com/uc?export=download&id=file-id"
      );
    });

    it("debería manejar errores adecuadamente", async () => {
      // Configurar mock para lanzar un error
      mockDrive.files.get.mockRejectedValueOnce(new Error("API error"));

      // Verificar que el error se propaga
      await expect(
        FileUtils.convertGoogleDriveLink(mockDrive, "file-id")
      ).rejects.toThrow("Failed to convert link: API error");
    });
  });
});
