"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Progress } from "@/src/components/ui/progress";
import {
  Cloud,
  Upload,
  X,
  Edit2,
  Save,
  RotateCcw,
  Trash2,
  File,
  Image,
  Video,
  Music,
  Archive,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { UploadFileItem } from "./EnhancedDropZone";

interface ServerDirectUploadZoneProps {
  folderId: string;
  folderName: string;
  className?: string;
  disabled?: boolean;
  onUploadComplete?: (files: UploadFileItem[]) => void;
}

type UploadStatus = "pending" | "uploading" | "completed" | "error";

export function ServerDirectUploadZone({
  folderId,
  folderName,
  className,
  disabled = false,
  onUploadComplete,
}: ServerDirectUploadZoneProps) {
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

  // Update progress for a specific file
  const updateProgress = (fileId: string, progress: number) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, progress: Math.min(progress, 100) } : f
      )
    );
  };

  // Upload single file using server endpoint
  const uploadSingleFile = async (
    fileItem: UploadFileItem,
    signal: AbortSignal
  ): Promise<void> => {
    console.log("=== FRONTEND UPLOAD START ===");
    console.log("Upload details:", {
      fileId: fileItem.id,
      fileName: fileItem.newName,
      originalName: fileItem.originalName,
      fileSize: fileItem.file.size,
      fileType: fileItem.file.type,
      folderId: folderId,
      folderName: folderName,
    });

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

      if (!fileItem.newName.trim()) {
        throw new Error("File name is required");
      }

      // Create form data
      console.log("Creating FormData...");
      const formData = new FormData();
      formData.append("folderId", folderId);
      formData.append("file", fileItem.file, fileItem.newName.trim());
      formData.append(
        "description",
        `Uploaded via Server Direct Upload on ${new Date().toISOString()}`
      );

      console.log("FormData created, contents:", {
        folderId: formData.get("folderId"),
        fileName: (formData.get("file") as File)?.name,
        fileSize: (formData.get("file") as File)?.size,
        description: formData.get("description"),
      });

      updateProgress(fileItem.id, 10);

      // Upload using the new server endpoint
      console.log("Sending request to /api/drive/upload/direct...");
      const response = await fetch("/api/drive/upload/direct", {
        method: "POST",
        body: formData,
        signal,
      });

      console.log("Response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      updateProgress(fileItem.id, 90);

      if (!response.ok) {
        console.log("❌ Response not OK, parsing error...");
        const errorText = await response.text();
        console.log("Raw error response:", errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
          console.log("Parsed error data:", errorData);
        } catch (e) {
          console.log("Failed to parse error as JSON, using raw text");
          errorData = { error: "Upload failed", details: errorText };
        }

        throw new Error(
          errorData.details || errorData.error || "Upload failed"
        );
      }

      console.log("✅ Response OK, parsing result...");
      const result = await response.json();
      console.log("Upload result:", result);
      updateProgress(fileItem.id, 100);

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                status: "completed" as UploadStatus,
                progress: 100,
                driveFileId: result.file.id,
              }
            : f
        )
      );
    } catch (error) {
      console.log("=== FRONTEND UPLOAD ERROR ===");
      console.error("❌ Upload failed:", error);

      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }

      console.error("Full error object:", error);

      if (error instanceof Error && error.name === "AbortError") {
        console.log("Upload was cancelled");
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? { ...f, status: "pending" as UploadStatus, progress: 0 }
              : f
          )
        );
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      console.error("Setting error state with message:", errorMessage);

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                status: "error" as UploadStatus,
                progress: 0,
                error: errorMessage,
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
      // Upload files sequentially to avoid overwhelming the server
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

  return (
    <div className={className}>
      {/* Header */}
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold flex items-center gap-2'>
            <Cloud className='w-5 h-5' />
            Upload Directo al Servidor
          </h3>
          <p className='text-sm text-gray-600'>
            Subida a Google Drive usando el servicio existente (sin límites de
            tamaño)
          </p>
        </div>
        <Badge variant='secondary'>Carpeta: {folderName}</Badge>
      </div>

      {/* Drop Zone */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragOver
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <Cloud className='w-12 h-12 text-gray-400 mb-4' />
          <p className='text-lg font-medium text-gray-700 mb-2'>
            Arrastra archivos aquí o haz clic para seleccionar
          </p>
          <p className='text-sm text-gray-500'>
            Sin límites de tamaño • Usa GoogleDriveService existente
          </p>
          <input
            ref={fileInputRef}
            type='file'
            multiple
            onChange={(e) => handleFileInput(e.target.files)}
            className='hidden'
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card className='mt-4'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between mb-4'>
              <h4 className='font-medium'>Archivos ({stats.total})</h4>
              <div className='flex gap-2'>
                <Badge variant='outline'>
                  {formatFileSize(stats.totalSize)}
                </Badge>
                {stats.completed > 0 && (
                  <Badge variant='default'>{stats.completed} completados</Badge>
                )}
                {stats.error > 0 && (
                  <Badge variant='destructive'>{stats.error} errores</Badge>
                )}
              </div>
            </div>

            <div className='space-y-3'>
              {files.map((file) => (
                <div
                  key={file.id}
                  className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'
                >
                  {/* File Icon */}
                  <div className='flex-shrink-0'>{getFileIcon(file.file)}</div>

                  {/* File Info */}
                  <div className='flex-1 min-w-0'>
                    {editingId === file.id ? (
                      <div className='flex gap-2'>
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className='h-8'
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit();
                            if (e.key === "Escape") cancelEdit();
                          }}
                        />
                        <Button size='sm' onClick={saveEdit}>
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
                      <div>
                        <p className='font-medium truncate'>{file.newName}</p>
                        <p className='text-xs text-gray-500'>
                          {formatFileSize(file.file.size)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className='flex items-center gap-2'>
                    {file.status === "pending" && (
                      <Badge variant='secondary'>Pendiente</Badge>
                    )}
                    {file.status === "uploading" && (
                      <div className='flex items-center gap-2'>
                        <Progress value={file.progress} className='w-20' />
                        <span className='text-xs'>{file.progress}%</span>
                      </div>
                    )}
                    {file.status === "completed" && (
                      <Badge variant='default' className='bg-green-500'>
                        <CheckCircle className='w-3 h-3 mr-1' />
                        Completado
                      </Badge>
                    )}
                    {file.status === "error" && (
                      <Badge variant='destructive'>
                        <AlertCircle className='w-3 h-3 mr-1' />
                        Error
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className='flex gap-1'>
                    {file.status === "pending" && (
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => startEditing(file)}
                      >
                        <Edit2 className='w-3 h-3' />
                      </Button>
                    )}
                    {file.status === "error" && (
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => retryFile(file.id)}
                      >
                        <RotateCcw className='w-3 h-3' />
                      </Button>
                    )}
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => removeFile(file.id)}
                    >
                      <Trash2 className='w-3 h-3' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Error Messages */}
            {files.some((f) => f.error) && (
              <div className='mt-4 space-y-2'>
                {files
                  .filter((f) => f.error)
                  .map((file) => (
                    <div
                      key={file.id}
                      className='text-sm text-red-600 bg-red-50 p-2 rounded'
                    >
                      <strong>{file.newName}:</strong> {file.error}
                    </div>
                  ))}
              </div>
            )}

            {/* Actions */}
            <div className='flex gap-2 mt-4 pt-4 border-t'>
              <Button
                onClick={startUpload}
                disabled={isUploading || stats.pending === 0 || disabled}
                className='flex items-center gap-2'
              >
                <Upload className='w-4 h-4' />
                {isUploading
                  ? "Subiendo..."
                  : `Subir ${stats.pending} archivos`}
              </Button>

              {isUploading && (
                <Button variant='outline' onClick={cancelUpload}>
                  Cancelar
                </Button>
              )}

              <Button
                variant='outline'
                onClick={clearAllFiles}
                disabled={isUploading}
              >
                Limpiar Todo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
