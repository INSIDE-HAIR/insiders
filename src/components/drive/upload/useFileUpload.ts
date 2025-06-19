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
            ? { ...f, status: "uploading" as UploadStatus, progress: 10 }
            : f
        )
      );

      // Convertir archivo a base64
      const base64Data = await fileToBase64(fileItem.file);

      // Simular progreso
      setFiles((prev) =>
        prev.map((f) => (f.id === fileItem.id ? { ...f, progress: 50 } : f))
      );

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
      });

      // Llamar a la API (Google Drive real)
      const response = await fetch("/api/drive/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal,
      });

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
        });

        throw new Error(
          errorData.error ||
            errorData.details ||
            `HTTP ${response.status}: Upload failed`
        );
      }

      const result = await response.json();

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].error);
      }

      const uploadedFile = result.uploadedFiles?.[0]?.file;

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
    if (isUploading || !currentFolderId) return;

    setIsUploading(true);
    abortController.current = new AbortController();

    const pendingFiles = files.filter((f) => f.status === "pending");

    // Upload files secuencialmente para evitar sobrecarga
    for (const file of pendingFiles) {
      if (abortController.current.signal.aborted) break;

      await uploadSingleFile(
        file,
        currentFolderId,
        abortController.current.signal
      );
    }

    setIsUploading(false);
  }, [files, isUploading, currentFolderId]);

  const cancelUpload = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
    setIsUploading(false);

    // Reset files in uploading state back to pending
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "uploading"
          ? { ...f, status: "pending" as UploadStatus, progress: 0 }
          : f
      )
    );
  }, []);

  const closeModal = useCallback(() => {
    if (isUploading) {
      cancelUpload();
    }
    setIsModalOpen(false);
    // Clear files after a delay to allow animations
    setTimeout(() => {
      setFiles([]);
      setCurrentFolderId("");
    }, 300);
  }, [isUploading, cancelUpload]);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setCurrentFolderId("");
    setIsModalOpen(false);
  }, []);

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
