"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  X,
  Upload,
  Plus,
  Edit2,
  Save,
  XCircle,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Trash2,
  File,
  Image,
  Video,
  Music,
  Archive,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Progress } from "@/src/components/ui/progress";
import { cn } from "@/src/lib/utils";

import type { UploadFileItem, UploadStatus } from "./EnhancedDropZone";

interface DirectUploadDropZoneProps {
  folderId: string;
  folderName: string;
  className?: string;
  disabled?: boolean;
  onUploadComplete?: (files: UploadFileItem[]) => void;
}

// Large file warning threshold (50MB)
const WARN_FILE_SIZE = 50 * 1024 * 1024;

// Google Drive API configuration
const GOOGLE_DRIVE_API_URL = "https://www.googleapis.com/upload/drive/v3/files";

export function DirectUploadDropZone({
  folderId,
  folderName,
  className,
  disabled = false,
  onUploadComplete,
}: DirectUploadDropZoneProps) {
  const [files, setFiles] = useState<UploadFileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [uploadController, setUploadController] =
    useState<AbortController | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get file type icon
  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith("image/")) return <Image className='w-4 h-4' />;
    if (type.startsWith("video/")) return <Video className='w-4 h-4' />;
    if (type.startsWith("audio/")) return <Music className='w-4 h-4' />;
    if (
      type.includes("zip") ||
      type.includes("rar") ||
      type.includes("archive")
    )
      return <Archive className='w-4 h-4' />;
    return <File className='w-4 h-4' />;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get access token for Google Drive API
  const getAccessToken = async (): Promise<string> => {
    const response = await fetch("/api/drive/auth/token");
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("No estás autenticado. Por favor inicia sesión.");
      } else if (response.status === 403) {
        throw new Error(
          "Se requieren permisos de administrador para uploads directos."
        );
      } else {
        const error = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          `Error de autenticación: ${error.error || response.statusText}`
        );
      }
    }
    const { accessToken } = await response.json();
    return accessToken;
  };

  // Direct upload to Google Drive using resumable upload
  const uploadToGoogleDrive = async (
    file: File,
    fileName: string,
    accessToken: string,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<{ id: string; name: string; webViewLink: string }> => {
    const metadata = {
      name: fileName,
      parents: [folderId],
      description: `Uploaded via Direct Upload on ${new Date().toISOString()}`,
    };

    // For files larger than 5MB, use resumable upload
    if (file.size > 5 * 1024 * 1024) {
      return uploadResumable(file, metadata, accessToken, onProgress, signal);
    } else {
      return uploadSimple(file, metadata, accessToken, onProgress, signal);
    }
  };

  // Simple upload for small files
  const uploadSimple = async (
    file: File,
    metadata: any,
    accessToken: string,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<{ id: string; name: string; webViewLink: string }> => {
    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    form.append("file", file);

    if (onProgress) onProgress(10);

    const response = await fetch(
      `${GOOGLE_DRIVE_API_URL}?uploadType=multipart&fields=id,name,webViewLink`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
        signal,
      }
    );

    if (onProgress) onProgress(90);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    if (onProgress) onProgress(100);

    return result;
  };

  // Resumable upload for large files
  const uploadResumable = async (
    file: File,
    metadata: any,
    accessToken: string,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<{ id: string; name: string; webViewLink: string }> => {
    // Step 1: Initiate resumable upload
    if (onProgress) onProgress(5);

    const initResponse = await fetch(
      `${GOOGLE_DRIVE_API_URL}?uploadType=resumable&fields=id,name,webViewLink`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
        signal,
      }
    );

    if (!initResponse.ok) {
      throw new Error(`Failed to initiate upload: ${initResponse.status}`);
    }

    const uploadUrl = initResponse.headers.get("Location");
    if (!uploadUrl) {
      throw new Error("No upload URL received");
    }

    if (onProgress) onProgress(10);

    // Step 2: Upload file in chunks
    const chunkSize = 256 * 1024 * 1024; // 256MB chunks
    let uploadedBytes = 0;

    while (uploadedBytes < file.size) {
      if (signal?.aborted) throw new Error("Upload cancelled");

      const chunk = file.slice(uploadedBytes, uploadedBytes + chunkSize);
      const chunkEnd = Math.min(uploadedBytes + chunkSize - 1, file.size - 1);

      const chunkResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Length": chunk.size.toString(),
          "Content-Range": `bytes ${uploadedBytes}-${chunkEnd}/${file.size}`,
        },
        body: chunk,
        signal,
      });

      if (chunkResponse.status === 308) {
        // Continue uploading
        const rangeHeader = chunkResponse.headers.get("Range");
        if (rangeHeader) {
          const match = rangeHeader.match(/bytes=0-(\d+)/);
          if (match) {
            uploadedBytes = parseInt(match[1]) + 1;
          } else {
            uploadedBytes += chunk.size;
          }
        } else {
          uploadedBytes += chunk.size;
        }

        if (onProgress) {
          const progress = 10 + (uploadedBytes / file.size) * 85;
          onProgress(Math.min(progress, 95));
        }
      } else if (chunkResponse.status === 200 || chunkResponse.status === 201) {
        // Upload complete
        if (onProgress) onProgress(100);
        return await chunkResponse.json();
      } else {
        const errorText = await chunkResponse.text();
        throw new Error(
          `Chunk upload failed: ${chunkResponse.status} ${errorText}`
        );
      }
    }

    throw new Error("Upload completed but no final response received");
  };

  // Update progress for a specific file
  const updateProgress = (fileId: string, progress: number) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, progress: Math.min(progress, 100) } : f
      )
    );
  };

  // Upload single file
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

      updateProgress(fileItem.id, 5);

      if (signal.aborted) throw new Error("Upload cancelled");

      // Get access token
      const accessToken = await getAccessToken();
      updateProgress(fileItem.id, 10);

      if (signal.aborted) throw new Error("Upload cancelled");

      if (!fileItem.newName.trim()) {
        throw new Error("File name is required");
      }

      // Upload directly to Google Drive
      const uploadedFile = await uploadToGoogleDrive(
        fileItem.file,
        fileItem.newName.trim(),
        accessToken,
        (progress) => updateProgress(fileItem.id, progress),
        signal
      );

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                status: "completed" as UploadStatus,
                progress: 100,
                driveFileId: uploadedFile.id,
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

  // Handle file input
  const handleFileInput = useCallback(
    (inputFiles: FileList | null) => {
      if (!inputFiles || disabled) return;

      const newFiles: UploadFileItem[] = Array.from(inputFiles).map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        originalName: file.name,
        newName: file.name,
        status: "pending" as UploadStatus,
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...newFiles]);
    },
    [disabled]
  );

  // Drag and drop handlers
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (!disabled) {
        handleFileInput(e.dataTransfer.files);
      }
    },
    [disabled, handleFileInput]
  );

  // Start upload
  const startUpload = async () => {
    const pendingFiles = files.filter(
      (f) => f.status === "pending" || f.status === "error"
    );

    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    const controller = new AbortController();
    setUploadController(controller);

    try {
      // Upload files sequentially to avoid overwhelming the API
      for (const file of pendingFiles) {
        if (controller.signal.aborted) break;
        await uploadSingleFile(file, controller.signal);
      }

      // Notify completion
      const completedFiles = files.filter((f) => f.status === "completed");
      if (onUploadComplete && completedFiles.length > 0) {
        onUploadComplete(completedFiles);
      }
    } finally {
      setIsUploading(false);
      setUploadController(null);
    }
  };

  // Cancel upload
  const cancelUpload = () => {
    if (uploadController) {
      uploadController.abort();
      setUploadController(null);
    }
    setIsUploading(false);
  };

  // Edit file name
  const startEditing = (file: UploadFileItem) => {
    setEditingId(file.id);
    setEditingName(file.newName);
  };

  const saveEdit = () => {
    if (editingId && editingName.trim()) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === editingId ? { ...f, newName: editingName.trim() } : f
        )
      );
    }
    setEditingId(null);
    setEditingName("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  // Remove file
  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Clear all files
  const clearAllFiles = () => {
    setFiles([]);
    setEditingId(null);
    setEditingName("");
  };

  // Retry failed upload
  const retryFile = (fileId: string) => {
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
  };

  // Statistics
  const stats = {
    total: files.length,
    pending: files.filter((f) => f.status === "pending").length,
    uploading: files.filter((f) => f.status === "uploading").length,
    completed: files.filter((f) => f.status === "completed").length,
    error: files.filter((f) => f.status === "error").length,
    totalSize: files.reduce((sum, f) => sum + f.file.size, 0),
  };

  const hasLargeFiles = files.some((f) => f.file.size > WARN_FILE_SIZE);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
          files.length > 0 && "border-green-500 bg-green-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {files.length === 0 ? (
          <>
            <Upload className='mx-auto h-12 w-12 text-gray-400 mb-4' />
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Subir archivos a {folderName}
            </h3>
            <p className='text-gray-600 mb-4'>
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              variant='outline'
            >
              Seleccionar archivos
            </Button>
          </>
        ) : (
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>
                Archivos seleccionados ({stats.total})
              </h3>
              <div className='flex gap-2'>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || isUploading}
                  variant='outline'
                  size='sm'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Añadir más
                </Button>
                <Button
                  onClick={clearAllFiles}
                  disabled={disabled || isUploading}
                  variant='outline'
                  size='sm'
                >
                  <Trash2 className='w-4 h-4 mr-2' />
                  Limpiar todo
                </Button>
              </div>
            </div>

            {/* File List */}
            <div className='space-y-2 max-h-64 overflow-y-auto'>
              {files.map((file) => (
                <div
                  key={file.id}
                  className='flex items-center gap-3 p-3 bg-white border rounded-lg'
                >
                  <div className='shrink-0'>{getFileIcon(file.file)}</div>

                  <div className='flex-1 min-w-0'>
                    {editingId === file.id ? (
                      <div className='flex items-center gap-2'>
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className='flex-1'
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit();
                            if (e.key === "Escape") cancelEdit();
                          }}
                          autoFocus
                        />
                        <Button onClick={saveEdit} size='sm' variant='outline'>
                          <Save className='w-4 h-4' />
                        </Button>
                        <Button
                          onClick={cancelEdit}
                          size='sm'
                          variant='outline'
                        >
                          <XCircle className='w-4 h-4' />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium truncate'>
                            {file.newName}
                          </span>
                          <Badge
                            variant={
                              file.status === "completed"
                                ? "default"
                                : file.status === "uploading"
                                ? "secondary"
                                : file.status === "error"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {file.status === "pending" && "Pendiente"}
                            {file.status === "uploading" && "Subiendo"}
                            {file.status === "completed" && "Completado"}
                            {file.status === "error" && "Error"}
                          </Badge>
                        </div>
                        <div className='text-sm text-gray-500'>
                          {formatFileSize(file.file.size)}
                          {file.file.size > WARN_FILE_SIZE && (
                            <span className='text-orange-600 ml-2'>
                              ⚠️ Archivo grande
                            </span>
                          )}
                        </div>
                        {file.status === "uploading" && (
                          <Progress value={file.progress} className='mt-1' />
                        )}
                        {file.error && (
                          <div className='text-sm text-red-600 mt-1'>
                            {file.error}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className='flex items-center gap-1'>
                    {file.status === "pending" && (
                      <Button
                        onClick={() => startEditing(file)}
                        size='sm'
                        variant='ghost'
                        disabled={isUploading}
                      >
                        <Edit2 className='w-4 h-4' />
                      </Button>
                    )}
                    {file.status === "error" && (
                      <Button
                        onClick={() => retryFile(file.id)}
                        size='sm'
                        variant='ghost'
                        disabled={isUploading}
                      >
                        <RotateCcw className='w-4 h-4' />
                      </Button>
                    )}
                    {file.status === "completed" && (
                      <CheckCircle className='w-4 h-4 text-green-600' />
                    )}
                    <Button
                      onClick={() => removeFile(file.id)}
                      size='sm'
                      variant='ghost'
                      disabled={isUploading && file.status === "uploading"}
                    >
                      <X className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Controls */}
            <div className='flex items-center justify-between pt-4 border-t'>
              <div className='text-sm text-gray-600'>
                Total: {formatFileSize(stats.totalSize)} •
                {stats.completed > 0 && ` ✅ ${stats.completed} completado(s)`}
                {stats.error > 0 && ` ❌ ${stats.error} error(es)`}
                {stats.pending > 0 && ` ⏳ ${stats.pending} pendiente(s)`}
              </div>
              <div className='flex gap-2'>
                {isUploading ? (
                  <Button
                    onClick={cancelUpload}
                    variant='destructive'
                    size='sm'
                  >
                    Cancelar subida
                  </Button>
                ) : (
                  <Button
                    onClick={startUpload}
                    disabled={stats.pending === 0 && stats.error === 0}
                    size='sm'
                  >
                    Subir archivos ({stats.pending + stats.error})
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Warnings and Info */}
      {hasLargeFiles && (
        <Alert>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>
            <strong>Archivos grandes detectados:</strong> Los archivos mayores a{" "}
            {formatFileSize(WARN_FILE_SIZE)}
            se subirán usando transferencia resumible directa a Google Drive,
            evitando los límites del servidor.
          </AlertDescription>
        </Alert>
      )}

      {stats.total > 0 && (
        <Alert>
          <CheckCircle className='h-4 w-4' />
          <AlertDescription>
            <strong>Subida directa:</strong> Los archivos se transfieren
            directamente a Google Drive sin pasar por el servidor, sin límites
            de tamaño.
          </AlertDescription>
        </Alert>
      )}

      <input
        ref={fileInputRef}
        type='file'
        multiple
        className='hidden'
        onChange={(e) => handleFileInput(e.target.files)}
        disabled={disabled}
      />
    </div>
  );
}
