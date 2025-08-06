"use client";

import React, { useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Plus,
  Upload,
  X,
  AlertTriangle,
  Edit2,
  Save,
  Check,
  FileText,
  Image,
  Video,
  Music,
  File,
  Trash2,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Progress } from "@/src/components/ui/progress";
import { Badge } from "@/src/components/ui/badge";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { cn } from "@/src/lib/utils";

// Types
export type UploadStatus = "pending" | "uploading" | "completed" | "error";

export interface UploadFileItem {
  id: string;
  file: File;
  originalName: string;
  newName: string;
  status: UploadStatus;
  progress: number;
  error?: string;
  driveFileId?: string;
}

interface EnhancedDropZoneProps {
  folderId: string;
  folderName: string;
  className?: string;
  disabled?: boolean;
  onUploadComplete?: (files: UploadFileItem[]) => void;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const WARN_FILE_SIZE = 2 * 1024 * 1024; // 2MB - advertencia para archivos grandes
const RESUMABLE_THRESHOLD = 5 * 1024 * 1024; // 5MB - límite oficial de Google Drive API para simple upload

// Utility functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(file: File) {
  const type = file.type.toLowerCase();
  if (type.startsWith("image/")) return <Image className='w-4 h-4' />;
  if (type.startsWith("video/")) return <Video className='w-4 h-4' />;
  if (type.startsWith("audio/")) return <Music className='w-4 h-4' />;
  if (type.includes("pdf") || type.includes("document"))
    return <FileText className='w-4 h-4' />;
  return <File className='w-4 h-4' />;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] || '';
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

export function EnhancedDropZone({
  folderId,
  folderName,
  className,
  disabled = false,
  onUploadComplete,
}: EnhancedDropZoneProps) {
  const { data: session } = useSession();
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<UploadFileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortController = useRef<AbortController | null>(null);

  // Validation
  const validateFiles = useCallback((files: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(
          `${file.name} es demasiado grande (${formatFileSize(
            file.size
          )}). Máximo: 100MB.`
        );
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      alert(`Algunos archivos fueron excluidos:\n\n${errors.join("\n")}`);
    }

    return validFiles;
  }, []);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled || isUploading) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(droppedFiles);

      if (validFiles.length > 0) {
        addFiles(validFiles);
      }
    },
    [disabled, isUploading, validateFiles]
  );

  // File input handler
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || isUploading) return;

      const selectedFiles = Array.from(e.target.files || []);
      const validFiles = validateFiles(selectedFiles);

      if (validFiles.length > 0) {
        addFiles(validFiles);
      }
    },
    [disabled, isUploading, validateFiles]
  );

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled, isUploading]);

  // File management
  const addFiles = useCallback((newFiles: File[]) => {
    const uploadFiles: UploadFileItem[] = newFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      originalName: file.name,
      newName: file.name,
      status: "pending" as UploadStatus,
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...uploadFiles]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const removeFile = useCallback(
    (fileId: string) => {
      if (isUploading) return;
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    },
    [isUploading]
  );

  const clearAllFiles = useCallback(() => {
    if (isUploading) return;
    setFiles([]);
  }, [isUploading]);

  const retryFile = useCallback(
    (fileId: string) => {
      if (isUploading) return;
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "pending" as UploadStatus,
                progress: 0,
                error: undefined,
              }
            : f
        )
      );
    },
    [isUploading]
  );

  // Name editing
  const startEditing = useCallback((file: UploadFileItem) => {
    if (file.status === "uploading" || file.status === "completed") return;
    setEditingFileId(file.id);
    setTempName(file.newName);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingFileId || !tempName.trim()) return;

    setFiles((prev) =>
      prev.map((f) =>
        f.id === editingFileId ? { ...f, newName: tempName.trim() } : f
      )
    );
    setEditingFileId(null);
    setTempName("");
  }, [editingFileId, tempName]);

  const cancelEdit = useCallback(() => {
    setEditingFileId(null);
    setTempName("");
  }, []);

  // Upload functionality
  const updateProgress = useCallback((fileId: string, progress: number) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, progress: Math.min(progress, 100) } : f
      )
    );
  }, []);

  const uploadFileResumable = async (
    fileItem: UploadFileItem,
    signal: AbortSignal
  ): Promise<void> => {
    try {
      updateProgress(fileItem.id, 5);

      // Step 1: Initialize resumable upload session
      const initResponse = await fetch("/api/drive/upload/init-resumable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: fileItem.newName.trim(),
          fileSize: fileItem.file.size,
          mimeType: fileItem.file.type || "application/octet-stream",
          folderId: folderId,
        }),
        signal,
      });

      if (!initResponse.ok) {
        throw new Error(`Failed to initialize resumable upload: ${initResponse.statusText}`);
      }

      const { resumableURI } = await initResponse.json();
      updateProgress(fileItem.id, 10);

      // Step 2: Upload file in chunks
      const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
      const totalChunks = Math.ceil(fileItem.file.size / CHUNK_SIZE);
      let uploadedBytes = 0;

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        if (signal.aborted) throw new Error("Upload cancelled");

        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, fileItem.file.size);
        const chunk = fileItem.file.slice(start, end);

        const chunkResponse = await fetch(
          `/api/drive/upload/resumable-chunk?resumableURI=${encodeURIComponent(resumableURI)}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/octet-stream",
              "Content-Range": `bytes ${start}-${end - 1}/${fileItem.file.size}`,
            },
            body: chunk,
            signal,
          }
        );

        if (!chunkResponse.ok && chunkResponse.status !== 308) {
          throw new Error(`Chunk upload failed: ${chunkResponse.statusText}`);
        }

        uploadedBytes += chunk.size;
        const progress = 10 + Math.floor((uploadedBytes / fileItem.file.size) * 85);
        updateProgress(fileItem.id, progress);

        // Check if upload is complete (status 200/201) vs incomplete (308)
        if (chunkResponse.status !== 308) {
          // Upload completed
          break;
        }
      }

      updateProgress(fileItem.id, 100);

      // Update file status to completed
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? { ...f, status: "completed" as UploadStatus, progress: 100 }
            : f
        )
      );

      console.log(`✅ Resumable upload completed: ${fileItem.newName}`);
    } catch (error) {
      console.error(`❌ Resumable upload failed for ${fileItem.newName}:`, error);
      
      // Update file status to error
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? { 
                ...f, 
                status: "error" as UploadStatus, 
                error: error instanceof Error ? error.message : "Upload failed" 
              }
            : f
        )
      );
      throw error;
    }
  };

  const uploadSingleFile = async (
    fileItem: UploadFileItem,
    signal: AbortSignal
  ): Promise<void> => {
    try {
      // Update to uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? { ...f, status: "uploading" as UploadStatus, progress: 0 }
            : f
        )
      );

      updateProgress(fileItem.id, 10);

      if (signal.aborted) throw new Error("Upload cancelled");

      const isLargeFile = fileItem.file.size > WARN_FILE_SIZE;
      const shouldUseResumable = fileItem.file.size > RESUMABLE_THRESHOLD;

      // Use resumable upload for very large files
      if (shouldUseResumable) {
        await uploadFileResumable(fileItem, signal);
        return;
      }

      // Convert to base64 for regular uploads
      updateProgress(fileItem.id, 20);
      const base64Data = await fileToBase64(fileItem.file);
      updateProgress(fileItem.id, isLargeFile ? 40 : 60);

      if (signal.aborted) throw new Error("Upload cancelled");

      const mimeType = fileItem.file.type || "application/octet-stream";
      const fileSize = Number(fileItem.file.size);

      if (!fileItem.newName.trim()) {
        throw new Error("File name is required");
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

      updateProgress(fileItem.id, isLargeFile ? 50 : 70);

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

        let errorMessage =
          errorData.error ||
          errorData.details ||
          `HTTP ${response.status}: Upload failed`;

        if (response.status === 413) {
          errorMessage = `Archivo demasiado grande (${(
            fileSize /
            (1024 * 1024)
          ).toFixed(1)}MB). El servidor tiene un límite de tamaño.`;
        } else if (response.status === 408 || response.status === 504) {
          errorMessage = `Timeout al subir archivo grande. Intenta de nuevo.`;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].error);
      }

      const uploadedFile = result.uploadedFiles?.[0]?.file;

      updateProgress(fileItem.id, 100);

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
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? { ...f, status: "pending" as UploadStatus, progress: 0 }
              : f
          )
        );
        return;
      }

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
      for (const file of pendingFiles) {
        if (abortController.current.signal.aborted) break;
        await uploadSingleFile(file, abortController.current.signal);
      }

      // Call completion callback if provided
      if (onUploadComplete) {
        const completedFiles = files.filter((f) => f.status === "completed");
        onUploadComplete(completedFiles);
      }
    } catch (error) {
      console.error("Upload batch error:", error);
    } finally {
      setIsUploading(false);
      abortController.current = null;
    }
  }, [files, folderId, onUploadComplete]);

  const cancelUpload = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
    setIsUploading(false);

    setFiles((prev) =>
      prev.map((file) =>
        file.status === "uploading"
          ? { ...file, status: "pending" as UploadStatus, progress: 0 }
          : file
      )
    );
  }, []);

  // Status indicators
  const getStatusBadge = (status: UploadStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant='secondary'>Pendiente</Badge>;
      case "uploading":
        return (
          <Badge variant='default' className='bg-blue-500'>
            <Loader2 className='w-3 h-3 mr-1 animate-spin' />
            Subiendo
          </Badge>
        );
      case "completed":
        return (
          <Badge variant='default' className='bg-green-500'>
            <Check className='w-3 h-3 mr-1' />
            Completado
          </Badge>
        );
      case "error":
        return <Badge variant='destructive'>Error</Badge>;
      default:
        return null;
    }
  };

  // Statistics
  const totalFiles = files.length;
  const pendingFiles = files.filter((f) => f.status === "pending").length;
  const completedFiles = files.filter((f) => f.status === "completed").length;
  const errorFiles = files.filter((f) => f.status === "error").length;
  const uploadingFiles = files.filter((f) => f.status === "uploading").length;

  const totalSize = files.reduce((sum, file) => sum + file.file.size, 0);
  const hasLargeFiles = files.some((file) => file.file.size > WARN_FILE_SIZE);
  const hasErrors = errorFiles > 0;
  const canUpload = pendingFiles > 0 && !isUploading;
  const isCompleted = totalFiles > 0 && completedFiles === totalFiles;

  // Check authorization
  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500'>
        <Upload className='h-12 w-12 mx-auto mb-4' />
        <p>Solo los administradores pueden subir archivos</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg transition-all duration-300",
          isDragOver
            ? "border-inside bg-inside/10 shadow-lg"
            : files.length > 0
            ? "border-zinc-300 bg-zinc-50"
            : "border-zinc-300 hover:border-inside/50 hover:bg-inside/5 cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed",
          isUploading && "border-inside/50 bg-inside/5"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={files.length === 0 ? handleClick : undefined}
      >
        {files.length === 0 ? (
          // Empty state
          <div className='p-16 text-center bg-white'>
            {isDragOver ? (
              <div className='text-zinc-900'>
                <div className='p-6 rounded-full bg-inside mx-auto mb-6 w-fit shadow-lg scale-110 transition-all duration-300'>
                  <Upload className='h-10 w-10 text-black' />
                </div>
                <h4 className='text-xl font-bold mb-3'>
                  ¡Suelta los archivos aquí!
                </h4>
                <p className='text-base font-medium text-zinc-700'>
                  Listo para recibir tus archivos en: {folderName}
                </p>
              </div>
            ) : (
              <div className='text-zinc-600'>
                <div className='p-6 rounded-full bg-zinc-800 mx-auto mb-6 w-fit hover:bg-zinc-700 transition-colors duration-300'>
                  <Plus className='h-10 w-10 text-white' />
                </div>
                <h4 className='text-xl font-bold mb-3 text-zinc-900'>
                  Subir Archivos
                </h4>
                <p className='text-base font-medium text-zinc-700 mb-4 leading-relaxed'>
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <div className='bg-zinc-100 rounded-lg px-4 py-2 mb-3 inline-block'>
                  <p className='text-sm font-semibold text-zinc-800'>
                    📁 Destino:{" "}
                    <span className='text-black font-bold'>{folderName}</span>
                  </p>
                </div>
                <div className='text-sm font-medium text-zinc-600 space-y-1'>
                  <div className='bg-inside/10 px-3 py-1 rounded text-zinc-800 inline-block mr-2'>
                    📁 Máximo 100MB por archivo
                  </div>
                  <div className='bg-inside/10 px-3 py-1 rounded text-zinc-800 inline-block mr-2'>
                    🚀 Archivos &gt;5MB usan subida resumible
                  </div>
                  <div className='bg-inside/10 px-3 py-1 rounded text-zinc-800 inline-block'>
                    🎯 Todos los formatos soportados
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Files present state
          <div className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-3'>
                <div className='p-3 rounded-lg bg-inside/10'>
                  <Upload className='h-5 w-5 text-zinc-800' />
                </div>
                <h3 className='text-lg font-bold text-zinc-900'>
                  Archivos para Subir ({totalFiles})
                </h3>
              </div>
              <div className='flex items-center gap-3'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleClick}
                  disabled={isUploading}
                  className='border-inside text-inside hover:bg-inside hover:text-black transition-colors font-medium'
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Añadir Más
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={clearAllFiles}
                  disabled={isUploading}
                  className='text-zinc-700 border-zinc-400 hover:bg-zinc-100 font-medium'
                >
                  <Trash2 className='h-4 w-4 mr-2' />
                  Limpiar Todo
                </Button>
              </div>
            </div>

            {/* Summary info */}
            <div className='flex items-center justify-between text-sm font-medium text-zinc-700 mb-6 p-4 bg-linear-to-r from-zinc-50 to-zinc-100 rounded-lg border border-zinc-300'>
              <div className='flex items-center gap-6'>
                <span className='bg-white px-3 py-1 rounded-md border font-semibold'>
                  <strong className='text-zinc-900'>Total:</strong>{" "}
                  {formatFileSize(totalSize)}
                </span>
                <span className='bg-white px-3 py-1 rounded-md border font-semibold'>
                  <strong className='text-zinc-900'>Destino:</strong>{" "}
                  {folderName}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                {pendingFiles > 0 && (
                  <Badge
                    variant='secondary'
                    className='bg-zinc-200 text-zinc-800 font-medium'
                  >
                    {pendingFiles} pendientes
                  </Badge>
                )}
                {uploadingFiles > 0 && (
                  <Badge className='bg-inside text-black font-medium'>
                    {uploadingFiles} subiendo
                  </Badge>
                )}
                {completedFiles > 0 && (
                  <Badge className='bg-green-600 text-white font-medium'>
                    {completedFiles} completados
                  </Badge>
                )}
                {errorFiles > 0 && (
                  <Badge variant='destructive' className='font-medium'>
                    {errorFiles} con error
                  </Badge>
                )}
              </div>
            </div>

            {/* Warnings */}
            {hasLargeFiles && (
              <Alert className='mb-4 border-amber-300 bg-amber-50'>
                <AlertTriangle className='h-5 w-5 text-amber-600' />
                <AlertDescription className='text-amber-800 font-medium'>
                  <strong>⚠️ Archivos grandes detectados.</strong> Pueden tardar
                  más tiempo en subirse. Considera usar el modo directo para
                  mejor rendimiento.
                </AlertDescription>
              </Alert>
            )}

            {hasErrors && (
              <Alert
                variant='destructive'
                className='mb-4 border-red-300 bg-red-50'
              >
                <AlertTriangle className='h-5 w-5 text-red-600' />
                <AlertDescription className='text-red-800 font-medium'>
                  <strong>❌ {errorFiles} archivo(s) fallaron.</strong> Puedes
                  reintentar o eliminarlos de la lista.
                </AlertDescription>
              </Alert>
            )}

            {isCompleted && !hasErrors && (
              <Alert className='mb-4 border-green-300 bg-green-50'>
                <Check className='h-5 w-5 text-green-600' />
                <AlertDescription className='text-green-800 font-medium'>
                  <strong>
                    ✅ ¡Todos los archivos se subieron correctamente!
                  </strong>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className='space-y-4'>
          <ScrollArea className='max-h-96'>
            <div className='space-y-3'>
              {files.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    "border rounded-xl p-5 transition-all duration-200 shadow-sm",
                    file.status === "error" && "border-red-300 bg-red-50",
                    file.status === "completed" &&
                      "border-green-300 bg-green-50",
                    file.status === "uploading" &&
                      "border-inside/40 bg-inside/8",
                    file.status === "pending" &&
                      "border-zinc-300 bg-white hover:border-inside/40 hover:bg-inside/5 hover:shadow-md"
                  )}
                >
                  {/* File header */}
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-3 flex-1 min-w-0'>
                      <div className='p-2 rounded-lg bg-zinc-100'>
                        <div className='text-zinc-700'>
                          {getFileIcon(file.file)}
                        </div>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <span className='font-semibold text-base truncate text-zinc-900 block'>
                          {file.originalName}
                        </span>
                        <div className='flex items-center gap-3 mt-1'>
                          <span className='text-sm font-medium text-zinc-600 bg-zinc-100 px-2 py-1 rounded'>
                            {formatFileSize(file.file.size)}
                          </span>
                          {file.file.size > RESUMABLE_THRESHOLD && (
                            <Badge
                              variant='outline'
                              className='text-blue-700 border-blue-400 bg-blue-100 font-medium'
                            >
                              🚀 Resumible
                            </Badge>
                          )}
                          {file.file.size > WARN_FILE_SIZE && file.file.size <= RESUMABLE_THRESHOLD && (
                            <Badge
                              variant='outline'
                              className='text-amber-700 border-amber-400 bg-amber-100 font-medium'
                            >
                              📦 Grande
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      {getStatusBadge(file.status)}
                      {file.status === "error" && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => retryFile(file.id)}
                          className='text-inside border-inside hover:bg-inside hover:text-black font-medium'
                        >
                          <RotateCcw className='h-4 w-4 mr-1' />
                          Reintentar
                        </Button>
                      )}
                      {(file.status === "pending" ||
                        file.status === "error") && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => removeFile(file.id)}
                          className='text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 font-medium'
                        >
                          <X className='h-4 w-4 mr-1' />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Name editing */}
                  {(file.status === "pending" || file.status === "error") && (
                    <div className='mb-4'>
                      <label className='text-sm font-semibold text-zinc-800 block mb-2'>
                        📝 Nombre en Google Drive:
                      </label>
                      {editingFileId === file.id ? (
                        <div className='flex gap-2'>
                          <Input
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className='text-sm border-inside focus:border-inside focus:ring-inside/20 font-medium'
                            placeholder='Nombre del archivo'
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit();
                              if (e.key === "Escape") cancelEdit();
                            }}
                            autoFocus
                          />
                          <Button
                            size='sm'
                            onClick={saveEdit}
                            disabled={!tempName.trim()}
                            className='bg-inside text-black hover:bg-inside/90 font-medium'
                          >
                            <Save className='w-4 h-4 mr-1' />
                            Guardar
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={cancelEdit}
                            className='border-zinc-400 text-zinc-700 hover:bg-zinc-100 font-medium'
                          >
                            <X className='w-4 h-4' />
                          </Button>
                        </div>
                      ) : (
                        <div className='flex items-center gap-2'>
                          <Input
                            value={file.newName}
                            readOnly
                            className='text-sm bg-zinc-100 border-zinc-300 font-medium text-zinc-800'
                          />
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => startEditing(file)}
                            className='border-inside text-inside hover:bg-inside hover:text-black font-medium'
                          >
                            <Edit2 className='w-4 h-4 mr-1' />
                            Editar
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Progress bar */}
                  {file.status === "uploading" && (
                    <div className='mb-4'>
                      <div className='flex justify-between text-sm mb-2'>
                        <span className='font-semibold text-zinc-800'>
                          📤 Subiendo archivo...
                        </span>
                        <span className='font-bold text-inside'>
                          {file.progress}%
                        </span>
                      </div>
                      <Progress
                        value={file.progress}
                        className='h-3 bg-zinc-200'
                      />
                    </div>
                  )}

                  {/* Error message */}
                  {file.status === "error" && file.error && (
                    <Alert
                      variant='destructive'
                      className='mb-2 border-red-300 bg-red-100'
                    >
                      <AlertTriangle className='h-4 w-4 text-red-600' />
                      <AlertDescription className='text-sm font-medium text-red-800'>
                        ❌ <strong>Error:</strong> {file.error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Success info */}
                  {file.status === "completed" && file.driveFileId && (
                    <div className='text-sm font-medium text-green-800 bg-green-100 p-3 rounded-lg border border-green-300'>
                      ✅ <strong>Subido exitosamente</strong> • ID:{" "}
                      <code className='bg-green-200 px-1 rounded'>
                        {file.driveFileId}
                      </code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Action buttons */}
          <div className='flex justify-between items-center pt-6 border-t border-zinc-300 bg-linear-to-r from-zinc-50 to-zinc-100 px-6 py-4 rounded-xl'>
            <div className='text-base font-medium text-zinc-700'>
              {isUploading ? (
                <span className='flex items-center gap-3 font-semibold'>
                  <Loader2 className='h-5 w-5 animate-spin text-inside' />
                  <span className='text-zinc-900'>Subiendo archivos...</span>
                </span>
              ) : isCompleted ? (
                <span className='text-green-700 font-bold flex items-center gap-2'>
                  <Check className='h-5 w-5' />
                  ¡Carga completada exitosamente!
                </span>
              ) : (
                <span className='text-zinc-800'>
                  <strong className='text-inside'>{pendingFiles}</strong>{" "}
                  archivo{pendingFiles !== 1 ? "s" : ""} listo
                  {pendingFiles !== 1 ? "s" : ""} para subir
                </span>
              )}
            </div>
            <div className='flex gap-3'>
              {isUploading && (
                <Button
                  variant='destructive'
                  onClick={cancelUpload}
                  className='bg-red-600 hover:bg-red-700 text-white font-semibold'
                >
                  <X className='h-4 w-4 mr-2' />
                  Cancelar Subida
                </Button>
              )}
              {canUpload && (
                <Button
                  onClick={startUpload}
                  className='bg-inside text-black hover:bg-inside/90 border-inside font-semibold shadow-md'
                >
                  <Upload className='h-4 w-4 mr-2' />
                  Subir {pendingFiles} Archivo{pendingFiles !== 1 ? "s" : ""}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type='file'
        multiple
        onChange={handleFileChange}
        className='hidden'
        disabled={disabled}
        accept='image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx'
      />
    </div>
  );
}
