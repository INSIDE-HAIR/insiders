"use client";

import { useState, useCallback, useRef } from "react";
import { UploadFileItem, UploadStatus } from "./UploadProgressModal";

interface UseFileUploadReturn {
  files: UploadFileItem[];
  isUploading: boolean;
  isModalOpen: boolean;
  addFiles: (files: File[], folderId: string) => void;
  updateFileName: (fileId: string, newName: string) => void;
  startUpload: () => void;
  cancelUpload: () => void;
  closeModal: () => void;
  clearFiles: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const [files, setFiles] = useState<UploadFileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string>("");
  const abortController = useRef<AbortController | null>(null);

  const addFiles = useCallback((newFiles: File[], folderId: string) => {
    const uploadFiles: UploadFileItem[] = newFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      originalName: file.name,
      newName: file.name,
      status: "pending" as UploadStatus,
      progress: 0,
    }));

    setFiles(uploadFiles);
    setCurrentFolderId(folderId);
    setIsModalOpen(true);
  }, []);

  const updateFileName = useCallback((fileId: string, newName: string) => {
    setFiles((prev) =>
      prev.map((file) => (file.id === fileId ? { ...file, newName } : file))
    );
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remover el prefijo data:type;base64,
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const updateProgress = (fileId: string, progress: number) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, progress: Math.min(progress, 100) } : f
      )
    );
  };

  const uploadSingleFile = async (
    fileItem: UploadFileItem,
    folderId: string,
    signal: AbortSignal
  ): Promise<void> => {
    try {
      // Actualizar estado a uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? { ...f, status: "uploading" as UploadStatus, progress: 0 }
            : f
        )
      );

      // Progreso inicial
      updateProgress(fileItem.id, 10);

      if (signal.aborted) throw new Error("Upload cancelled");

      console.log(
        `Starting upload of large file: ${fileItem.file.name} (${fileItem.file.size} bytes)`
      );

      // Para archivos grandes (>10MB), mostrar progreso más gradual
      const isLargeFile = fileItem.file.size > 10 * 1024 * 1024;

      if (isLargeFile) {
        console.log("Large file detected, using enhanced progress tracking");
      }

      // Convertir archivo a base64 con progreso
      updateProgress(fileItem.id, 20);
      const base64Data = await fileToBase64(fileItem.file);
      updateProgress(fileItem.id, isLargeFile ? 40 : 60);

      if (signal.aborted) throw new Error("Upload cancelled");

      // Validar datos antes de enviar
      const mimeType = fileItem.file.type || "application/octet-stream";
      const fileSize = Number(fileItem.file.size);

      if (!fileItem.newName.trim()) {
        throw new Error("File name is required");
      }

      if (!base64Data) {
        throw new Error("Failed to convert file to base64");
      }

      if (isNaN(fileSize) || fileSize <= 0) {
        throw new Error("Invalid file size");
      }

      const payload = {
        folderId,
        files: [
          {
            name: fileItem.newName.trim(),
            data: base64Data,
            mimeType: mimeType,
            size: fileSize,
          },
        ],
      };

      console.log("Uploading file:", {
        name: fileItem.newName,
        mimeType,
        size: fileSize,
        base64Length: base64Data.length,
        folderId,
        isLargeFile,
      });

      updateProgress(fileItem.id, isLargeFile ? 50 : 70);

      // Configurar timeout más largo para archivos grandes
      const timeoutMs = isLargeFile ? 300000 : 60000; // 5 min vs 1 min

      // Llamar a la API con timeout extendido para archivos grandes
      const response = await fetch("/api/drive/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal,
      });

      updateProgress(fileItem.id, isLargeFile ? 80 : 90);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = {
            error: `HTTP ${response.status}: ${response.statusText}`,
          };
        }

        console.error("Upload failed - Full response:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: errorData,
          fileSize: fileSize,
          isLargeFile,
        });

        // Proporcionar mensajes de error más específicos
        let errorMessage =
          errorData.error ||
          errorData.details ||
          `HTTP ${response.status}: Upload failed`;

        if (response.status === 413) {
          errorMessage = `Archivo demasiado grande (${(
            fileSize /
            (1024 * 1024)
          ).toFixed(
            1
          )}MB). El servidor tiene un límite de tamaño. Intenta con un archivo más pequeño.`;
        } else if (response.status === 408 || response.status === 504) {
          errorMessage = `Timeout al subir archivo grande (${(
            fileSize /
            (1024 * 1024)
          ).toFixed(1)}MB). Intenta de nuevo.`;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].error);
      }

      const uploadedFile = result.uploadedFiles?.[0]?.file;

      // Completar progreso
      updateProgress(fileItem.id, 100);

      // Actualizar estado a completed
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                status: "completed" as UploadStatus,
                progress: 100,
                driveFileId: uploadedFile?.id,
              }
            : f
        )
      );

      console.log("Upload completed successfully:", {
        fileName: fileItem.newName,
        fileSize: fileSize,
        driveFileId: uploadedFile?.id,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Upload was cancelled
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? { ...f, status: "pending" as UploadStatus, progress: 0 }
              : f
          )
        );
        return;
      }

      // Error en upload
      console.error("Upload error:", {
        error: error instanceof Error ? error.message : "Upload failed",
        fileName: fileItem.newName,
        fileSize: fileItem.file.size,
      });

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                status: "error" as UploadStatus,
                progress: 0,
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : f
        )
      );
    }
  };

  const startUpload = useCallback(async () => {
    const pendingFiles = files.filter((file) => file.status === "pending");
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    abortController.current = new AbortController();

    try {
      // Procesar archivos uno por uno para mejor control
      for (const file of pendingFiles) {
        if (abortController.current.signal.aborted) break;
        await uploadSingleFile(
          file,
          currentFolderId,
          abortController.current.signal
        );
      }
    } catch (error) {
      console.error("Upload batch error:", error);
    } finally {
      setIsUploading(false);
      abortController.current = null;
    }
  }, [files, currentFolderId]);

  const cancelUpload = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
    setIsUploading(false);

    // Reset pending files
    setFiles((prev) =>
      prev.map((file) =>
        file.status === "uploading"
          ? { ...file, status: "pending" as UploadStatus, progress: 0 }
          : file
      )
    );
  }, []);

  const closeModal = useCallback(() => {
    if (!isUploading) {
      setIsModalOpen(false);
      setFiles([]);
      setCurrentFolderId("");
    }
  }, [isUploading]);

  const clearFiles = useCallback(() => {
    if (!isUploading) {
      setFiles([]);
    }
  }, [isUploading]);

  return {
    files,
    isUploading,
    isModalOpen,
    addFiles,
    updateFileName,
    startUpload,
    cancelUpload,
    closeModal,
    clearFiles,
  };
}
