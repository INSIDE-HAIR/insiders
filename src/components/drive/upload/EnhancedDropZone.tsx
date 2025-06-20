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
const WARN_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
      const base64 = result.split(",")[1];
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

      // Convert to base64
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
          "border-2 border-dashed rounded-lg transition-all duration-200",
          isDragOver
            ? "border-blue-400 bg-blue-50"
            : files.length > 0
            ? "border-gray-300 bg-gray-50"
            : "border-gray-300 hover:border-gray-400 cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed",
          isUploading && "border-blue-300 bg-blue-25"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={files.length === 0 ? handleClick : undefined}
      >
        {files.length === 0 ? (
          // Empty state
          <div className='p-8 text-center'>
            {isDragOver ? (
              <div className='text-blue-600'>
                <Upload className='h-12 w-12 mx-auto mb-4' />
                <p className='text-lg font-semibold'>
                  Suelta los archivos aquí
                </p>
                <p className='text-sm text-blue-500'>
                  para subir a: {folderName}
                </p>
              </div>
            ) : (
              <div className='text-gray-600'>
                <Plus className='h-12 w-12 mx-auto mb-4' />
                <p className='text-lg font-semibold mb-2'>
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <p className='text-sm text-gray-500 mb-4'>
                  Subir a: <span className='font-medium'>{folderName}</span>
                </p>
                <div className='text-xs text-gray-400 space-y-1'>
                  <p>Máximo 100MB por archivo</p>
                  <p>Formatos: imágenes, videos, audio, documentos</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Files present state
          <div className='p-4'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-2'>
                <Upload className='h-5 w-5 text-gray-600' />
                <h3 className='font-semibold text-gray-900'>
                  Archivos para subir ({totalFiles})
                </h3>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleClick}
                  disabled={isUploading}
                  className='text-blue-600 border-blue-300 hover:bg-blue-50'
                >
                  <Plus className='h-4 w-4 mr-1' />
                  Añadir más
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={clearAllFiles}
                  disabled={isUploading}
                  className='text-red-600 border-red-300 hover:bg-red-50'
                >
                  <Trash2 className='h-4 w-4 mr-1' />
                  Limpiar todo
                </Button>
              </div>
            </div>

            {/* Summary info */}
            <div className='flex items-center justify-between text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg'>
              <div className='flex items-center gap-4'>
                <span>Total: {formatFileSize(totalSize)}</span>
                <span>Destino: {folderName}</span>
              </div>
              <div className='flex items-center gap-2'>
                {pendingFiles > 0 && (
                  <Badge variant='secondary'>{pendingFiles} pendientes</Badge>
                )}
                {uploadingFiles > 0 && (
                  <Badge className='bg-blue-500'>
                    {uploadingFiles} subiendo
                  </Badge>
                )}
                {completedFiles > 0 && (
                  <Badge className='bg-green-500'>
                    {completedFiles} completados
                  </Badge>
                )}
                {errorFiles > 0 && (
                  <Badge variant='destructive'>{errorFiles} con error</Badge>
                )}
              </div>
            </div>

            {/* Warnings */}
            {hasLargeFiles && (
              <Alert className='mb-4'>
                <AlertTriangle className='h-4 w-4' />
                <AlertDescription>
                  Archivos grandes detectados. Pueden tardar más tiempo en
                  subirse.
                </AlertDescription>
              </Alert>
            )}

            {hasErrors && (
              <Alert variant='destructive' className='mb-4'>
                <AlertTriangle className='h-4 w-4' />
                <AlertDescription>
                  {errorFiles} archivo(s) fallaron. Puedes reintentar o
                  eliminarlos.
                </AlertDescription>
              </Alert>
            )}

            {isCompleted && !hasErrors && (
              <Alert className='mb-4'>
                <Check className='h-4 w-4' />
                <AlertDescription>
                  ¡Todos los archivos se subieron correctamente!
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className='space-y-3'>
          <ScrollArea className='max-h-96'>
            <div className='space-y-2'>
              {files.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    "border rounded-lg p-4 transition-all",
                    file.status === "error" && "border-red-200 bg-red-50",
                    file.status === "completed" &&
                      "border-green-200 bg-green-50",
                    file.status === "uploading" && "border-blue-200 bg-blue-50",
                    file.status === "pending" &&
                      "border-gray-200 bg-white hover:bg-gray-50"
                  )}
                >
                  {/* File header */}
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-2 flex-1 min-w-0'>
                      {getFileIcon(file.file)}
                      <span className='font-medium text-sm truncate'>
                        {file.originalName}
                      </span>
                      <span className='text-xs text-gray-500 flex-shrink-0'>
                        ({formatFileSize(file.file.size)})
                      </span>
                      {file.file.size > WARN_FILE_SIZE && (
                        <Badge
                          variant='outline'
                          className='text-amber-600 border-amber-300'
                        >
                          Grande
                        </Badge>
                      )}
                    </div>
                    <div className='flex items-center gap-2'>
                      {getStatusBadge(file.status)}
                      {file.status === "error" && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => retryFile(file.id)}
                          className='text-blue-600 border-blue-300'
                        >
                          <RotateCcw className='h-3 w-3' />
                        </Button>
                      )}
                      {(file.status === "pending" ||
                        file.status === "error") && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => removeFile(file.id)}
                          className='text-red-600 border-red-300'
                        >
                          <X className='h-3 w-3' />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Name editing */}
                  {(file.status === "pending" || file.status === "error") && (
                    <div className='mb-3'>
                      <label className='text-xs font-medium text-gray-600 block mb-1'>
                        Nombre en Drive:
                      </label>
                      {editingFileId === file.id ? (
                        <div className='flex gap-2'>
                          <Input
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className='text-sm'
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
                          >
                            <Save className='w-3 h-3' />
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={cancelEdit}
                          >
                            <X className='w-3 h-3' />
                          </Button>
                        </div>
                      ) : (
                        <div className='flex items-center gap-2'>
                          <Input
                            value={file.newName}
                            readOnly
                            className='text-sm bg-gray-50'
                          />
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => startEditing(file)}
                          >
                            <Edit2 className='w-3 h-3' />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Progress bar */}
                  {file.status === "uploading" && (
                    <div className='mb-3'>
                      <div className='flex justify-between text-xs mb-1'>
                        <span>Subiendo...</span>
                        <span>{file.progress}%</span>
                      </div>
                      <Progress value={file.progress} className='h-2' />
                    </div>
                  )}

                  {/* Error message */}
                  {file.status === "error" && file.error && (
                    <Alert variant='destructive' className='mb-2'>
                      <AlertDescription className='text-xs'>
                        {file.error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Success info */}
                  {file.status === "completed" && file.driveFileId && (
                    <div className='text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200'>
                      Subido exitosamente • ID: {file.driveFileId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Action buttons */}
          <div className='flex justify-between items-center pt-4 border-t bg-gray-50 px-4 py-3 rounded-lg'>
            <div className='text-sm text-gray-600'>
              {isUploading ? (
                <span className='flex items-center gap-2'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Subiendo archivos...
                </span>
              ) : isCompleted ? (
                "¡Carga completada!"
              ) : (
                `${pendingFiles} archivo(s) listos para subir`
              )}
            </div>
            <div className='flex gap-2'>
              {isUploading && (
                <Button variant='destructive' onClick={cancelUpload}>
                  <X className='h-4 w-4 mr-2' />
                  Cancelar
                </Button>
              )}
              {canUpload && (
                <Button
                  onClick={startUpload}
                  className='bg-blue-600 hover:bg-blue-700'
                >
                  <Upload className='h-4 w-4 mr-2' />
                  Subir {pendingFiles} archivo{pendingFiles !== 1 ? "s" : ""}
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
