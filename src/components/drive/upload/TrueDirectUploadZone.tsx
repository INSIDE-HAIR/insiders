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
import type { UploadFileItem, UploadStatus } from "./EnhancedDropZone";

// Extended status for true direct upload
type ExtendedUploadStatus = UploadStatus | "initializing";

// Extended file item with additional status
interface ExtendedUploadFileItem extends Omit<UploadFileItem, "status"> {
  status: ExtendedUploadStatus;
}

interface TrueDirectUploadZoneProps {
  folderId: string;
  folderName: string;
  className?: string;
  disabled?: boolean;
  onUploadComplete?: (files: UploadFileItem[]) => void;
}

export function TrueDirectUploadZone({
  folderId,
  folderName,
  className,
  disabled = false,
  onUploadComplete,
}: TrueDirectUploadZoneProps) {
  const [files, setFiles] = useState<ExtendedUploadFileItem[]>([]);
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

  // Update status for a specific file
  const updateStatus = (
    fileId: string,
    status: ExtendedUploadStatus,
    error?: string
  ) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, status, error } : f))
    );
  };

  // Step 1: Initialize resumable upload session via server
  const initializeUploadSession = async (
    file: File,
    fileName: string
  ): Promise<string> => {
    console.log("🔄 Step 1: Initializing upload session via server...");

    const requestData = {
      fileName: fileName,
      fileSize: file.size,
      mimeType: file.type || "application/octet-stream",
      folderId: folderId,
      description: `Uploaded via True Direct Upload on ${new Date().toISOString()}`,
    };

    console.log("Sending init request with data:", requestData);

    // Request resumable URI from our server
    const initResponse = await fetch("/api/drive/upload/init-resumable", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    console.log("Server init response:", {
      status: initResponse.status,
      statusText: initResponse.statusText,
      ok: initResponse.ok,
    });

    if (!initResponse.ok) {
      const errorText = await initResponse.text();
      console.log("❌ Server failed to initialize upload:", errorText);
      throw new Error(`Failed to initialize upload: ${errorText}`);
    }

    const result = await initResponse.json();
    console.log("Server init result:", result);

    if (!result.success || !result.resumableURI) {
      throw new Error("Server did not return a valid resumable URI");
    }

    console.log(
      "✅ Upload session initialized via server, URI:",
      result.resumableURI.substring(0, 100) + "..."
    );
    return result.resumableURI;
  };

  // Step 2: Upload file in chunks via server proxy
  const uploadFileInChunks = async (
    file: File,
    resumableURI: string,
    fileId: string,
    signal: AbortSignal
  ): Promise<any> => {
    console.log("🔄 Step 2: Starting chunked upload via server proxy...");
    console.log(
      "🆔 PROXY VERSION: TrueDirectUploadZone v2.0 - Using /api/drive/upload/resumable-chunk"
    );

    const chunkSize = 4 * 1024 * 1024; // 4MB chunks to stay under Vercel's 4.5MB limit
    let uploadedBytes = 0;

    for (let start = 0; start < file.size; start += chunkSize) {
      if (signal.aborted) {
        throw new Error("Upload cancelled");
      }

      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      console.log(
        `📤 Uploading chunk via proxy: ${start}-${end - 1}/${
          file.size
        } (${formatFileSize(chunk.size)})`
      );

      // Use our proxy endpoint instead of direct Google Drive call
      const proxyURL = `/api/drive/upload/resumable-chunk?resumableURI=${encodeURIComponent(
        resumableURI
      )}`;

      console.log("🔀 PROXY URL:", proxyURL);
      console.log("📤 Using PROXY instead of direct Google Drive!");

      const chunkResponse = await fetch(proxyURL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Range": `bytes ${start}-${end - 1}/${file.size}`,
        },
        body: chunk,
        signal,
      });

      console.log(`Proxy response for chunk:`, {
        status: chunkResponse.status,
        statusText: chunkResponse.statusText,
        ok: chunkResponse.ok,
      });

      // Update progress
      uploadedBytes = end;
      const progress = (uploadedBytes / file.size) * 100;
      updateProgress(fileId, progress);

      if (chunkResponse.status === 200 || chunkResponse.status === 201) {
        // Upload completed
        console.log("✅ Upload completed successfully via proxy");
        const proxyResult = await chunkResponse.json();
        console.log("Proxy result:", proxyResult);

        // Extract the actual Google Drive response from our proxy response
        if (proxyResult.success && proxyResult.body) {
          try {
            const driveResult = JSON.parse(proxyResult.body);
            console.log("Google Drive result:", driveResult);
            return driveResult;
          } catch (e) {
            console.log(
              "Could not parse Google Drive response, but upload successful"
            );
            return { id: "unknown", name: file.name };
          }
        }
        return proxyResult;
      } else if (chunkResponse.status === 308) {
        // Continue uploading - this is expected for chunks
        console.log(`✅ Chunk uploaded via proxy, continuing...`);
        continue;
      } else {
        // Error
        const errorText = await chunkResponse.text();
        console.log("❌ Proxy upload error:", errorText);
        throw new Error(
          `Upload failed with status ${chunkResponse.status}: ${errorText}`
        );
      }
    }

    throw new Error("Upload completed but no final response received");
  };

  // Upload single file using true direct upload
  const uploadSingleFile = async (
    fileItem: ExtendedUploadFileItem,
    signal: AbortSignal
  ): Promise<void> => {
    console.log("=== TRUE DIRECT UPLOAD START ===");
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
      // Update to initializing
      updateStatus(fileItem.id, "initializing");
      updateProgress(fileItem.id, 0);

      if (!fileItem.newName.trim()) {
        throw new Error("File name is required");
      }

      // Step 1: Initialize upload session
      const resumableURI = await initializeUploadSession(
        fileItem.file,
        fileItem.newName.trim()
      );
      updateProgress(fileItem.id, 5);

      // Update to uploading
      updateStatus(fileItem.id, "uploading");

      // Step 2: Upload file in chunks directly to Google Drive
      const result = await uploadFileInChunks(
        fileItem.file,
        resumableURI,
        fileItem.id,
        signal
      );

      // Update to completed
      updateStatus(fileItem.id, "completed");
      updateProgress(fileItem.id, 100);

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                driveFileId: result.id,
              }
            : f
        )
      );

      console.log("✅ TRUE DIRECT UPLOAD SUCCESS:", {
        id: result.id,
        name: result.name,
        size: result.size,
      });
    } catch (error) {
      console.log("=== TRUE DIRECT UPLOAD ERROR ===");
      console.error("❌ Upload failed:", error);

      updateStatus(
        fileItem.id,
        "error",
        error instanceof Error ? error.message : "Unknown error"
      );
      updateProgress(fileItem.id, 0);

      throw error;
    }
  };

  // Add files to upload queue
  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const filesArray = Array.from(newFiles);
    const uploadItems: ExtendedUploadFileItem[] = filesArray.map((file) => ({
      id: Math.random().toString(36).substring(2, 15),
      file,
      originalName: file.name,
      newName: file.name,
      status: "pending" as ExtendedUploadStatus,
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...uploadItems]);
  }, []);

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
  };

  // Handle drag and drop
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);

      const droppedFiles = Array.from(event.dataTransfer.files);
      if (droppedFiles.length > 0) {
        addFiles(droppedFiles);
      }
    },
    [addFiles]
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  // Start upload process
  const startUpload = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    const controller = new AbortController();
    setUploadController(controller);

    try {
      console.log(
        `🚀 Starting upload of ${pendingFiles.length} files using TRUE DIRECT UPLOAD`
      );

      // Upload files sequentially to avoid overwhelming the API
      for (const file of pendingFiles) {
        if (controller.signal.aborted) break;

        try {
          await uploadSingleFile(file, controller.signal);
        } catch (error) {
          console.error(`❌ Failed to upload ${file.originalName}:`, error);
          // Continue with next file even if one fails
        }
      }

      const successfulFiles = files.filter((f) => f.status === "completed");
      if (successfulFiles.length > 0 && onUploadComplete) {
        // Convert extended files back to regular UploadFileItem for the callback
        const regularFiles: UploadFileItem[] = successfulFiles.map((file) => ({
          ...file,
          status: file.status as UploadStatus, // Safe since "completed" exists in both types
        }));
        onUploadComplete(regularFiles);
      }
    } catch (error) {
      console.error("❌ Upload process failed:", error);
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
  const startEditing = (file: ExtendedUploadFileItem) => {
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

  // Remove file from queue
  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Clear all files
  const clearAllFiles = () => {
    if (!isUploading) {
      setFiles([]);
    }
  };

  // Retry failed upload
  const retryFile = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? { ...f, status: "pending", progress: 0, error: undefined }
          : f
      )
    );
  };

  const getStatusIcon = (status: ExtendedUploadStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className='w-4 h-4 text-green-600' />;
      case "error":
        return <AlertCircle className='w-4 h-4 text-red-600' />;
      case "uploading":
      case "initializing":
        return (
          <div className='w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status: ExtendedUploadStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "uploading":
        return "bg-blue-100 text-blue-800";
      case "initializing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: ExtendedUploadStatus) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "initializing":
        return "Inicializando...";
      case "uploading":
        return "Subiendo...";
      case "completed":
        return "Completado";
      case "error":
        return "Error";
      default:
        return "Desconocido";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold flex items-center gap-2 text-zinc-900'>
            <Cloud className='w-5 h-5 text-black' />
            Subida Directa
          </h3>
          <p className='text-sm text-zinc-600'>
            {folderName} • Sin límites de tamaño • Bypass total de Vercel
          </p>
        </div>
        <Badge variant='secondary' className='bg-inside text-black font-medium'>
          <Cloud className='w-3 h-3 mr-1' />
          Directo
        </Badge>
      </div>

      {/* Drop Zone */}
      <Card
        className={`border-2 border-dashed transition-all duration-300 ${
          isDragOver
            ? "border-inside bg-inside/15 shadow-lg border-solid"
            : disabled
            ? "border-zinc-300 bg-zinc-50"
            : "border-zinc-400 hover:border-inside hover:bg-inside/8 hover:shadow-md"
        }`}
      >
        <CardContent
          className='flex flex-col items-center justify-center py-16 cursor-pointer'
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div
            className={`p-6 rounded-full mb-6 transition-all duration-300 ${
              isDragOver
                ? "bg-inside text-black scale-110 shadow-lg"
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
          >
            <Cloud className='w-10 h-10' />
          </div>
          <h4 className='text-xl font-bold text-zinc-900 mb-3 text-center'>
            {isDragOver ? "¡Suelta los archivos aquí!" : "Subir Archivos"}
          </h4>
          <p className='text-base font-medium text-zinc-700 text-center max-w-md mb-4 leading-relaxed'>
            {isDragOver
              ? "Listo para recibir tus archivos"
              : "Arrastra archivos aquí o haz clic para seleccionar"}
          </p>
          <div className='bg-zinc-100 rounded-lg px-4 py-2 mb-2'>
            <p className='text-sm font-semibold text-zinc-800 text-center'>
              📁 Subida directa a Google Drive • Sin límites de tamaño
            </p>
          </div>
          <div className='text-xs font-medium text-zinc-600 flex items-center gap-2'>
            <span className='bg-inside/10 px-2 py-1 rounded text-zinc-800'>
              🚀 Optimizado para archivos grandes (chunks de 4MB)
            </span>
          </div>
          <input
            ref={fileInputRef}
            type='file'
            multiple
            onChange={handleFileChange}
            className='hidden'
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* Files List */}
      {files.length > 0 && (
        <Card className='border-zinc-300 shadow-sm'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h4 className='text-lg font-bold text-zinc-900 flex items-center gap-3'>
                <div className='p-2 rounded-lg bg-inside/10'>
                  <Upload className='w-5 h-5 text-zinc-800' />
                </div>
                <span>Archivos Seleccionados ({files.length})</span>
              </h4>
              <div className='flex gap-3'>
                {!isUploading && (
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={clearAllFiles}
                    disabled={disabled}
                    className='border-zinc-400 text-zinc-700 hover:bg-zinc-100 font-medium'
                  >
                    <Trash2 className='w-4 h-4 mr-2' />
                    Limpiar Todo
                  </Button>
                )}
                {files.some((f) => f.status === "pending") && (
                  <Button
                    size='sm'
                    onClick={startUpload}
                    disabled={disabled || isUploading}
                    className='bg-inside text-black hover:bg-inside/90 border-inside font-semibold shadow-sm'
                  >
                    <Upload className='w-4 h-4 mr-2' />
                    {isUploading ? "Subiendo..." : "Subir Archivos"}
                  </Button>
                )}
                {isUploading && (
                  <Button
                    size='sm'
                    variant='destructive'
                    onClick={cancelUpload}
                    className='bg-red-600 hover:bg-red-700 font-medium'
                  >
                    <X className='w-4 h-4 mr-2' />
                    Cancelar
                  </Button>
                )}
              </div>
            </div>

            <div className='space-y-4'>
              {files.map((file) => (
                <div
                  key={file.id}
                  className='flex items-center gap-4 p-4 border rounded-xl bg-white border-zinc-300 hover:border-inside/50 hover:bg-inside/5 hover:shadow-sm transition-all duration-200'
                >
                  <div className='flex-shrink-0 p-2 rounded-lg bg-zinc-100'>
                    <div className='text-zinc-700'>
                      {getFileIcon(file.file)}
                    </div>
                  </div>

                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-3 mb-2'>
                      {editingId === file.id ? (
                        <div className='flex items-center gap-2 flex-1'>
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className='flex-1 h-8 border-inside focus:border-inside focus:ring-inside/20 font-medium'
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit();
                              if (e.key === "Escape") cancelEdit();
                            }}
                          />
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={saveEdit}
                            className='h-8 w-8 p-0 text-inside hover:bg-inside/15 hover:text-black'
                          >
                            <Save className='w-4 h-4' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={cancelEdit}
                            className='h-8 w-8 p-0 text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100'
                          >
                            <X className='w-4 h-4' />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className='font-semibold text-base truncate text-zinc-900'>
                            {file.newName}
                          </span>
                          {file.status === "pending" && (
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() => startEditing(file)}
                              className='h-7 w-7 p-0 text-zinc-500 hover:text-inside hover:bg-inside/15'
                              disabled={disabled || isUploading}
                            >
                              <Edit2 className='w-4 h-4' />
                            </Button>
                          )}
                        </>
                      )}
                    </div>

                    <div className='flex items-center gap-3 text-sm font-medium text-zinc-600 mb-2'>
                      <span className='bg-zinc-100 px-2 py-1 rounded'>
                        {formatFileSize(file.file.size)}
                      </span>
                      <span>•</span>
                      <span>{file.file.type || "Tipo desconocido"}</span>
                    </div>

                    {file.status === "uploading" && (
                      <div className='mt-3'>
                        <div className='flex justify-between items-center mb-2'>
                          <span className='text-sm font-semibold text-zinc-800'>
                            Subiendo...
                          </span>
                          <span className='text-sm font-bold text-inside'>
                            {file.progress.toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={file.progress}
                          className='h-3 bg-zinc-200'
                        />
                      </div>
                    )}

                    {file.error && (
                      <div className='mt-2 text-sm font-medium text-red-700 bg-red-100 px-3 py-2 rounded-lg border border-red-200'>
                        ⚠️ Error: {file.error}
                      </div>
                    )}
                  </div>

                  <div className='flex items-center gap-3'>
                    <Badge
                      variant='secondary'
                      className={`text-sm font-medium ${getStatusColor(
                        file.status
                      )}`}
                    >
                      {getStatusIcon(file.status)}
                      {getStatusText(file.status)}
                    </Badge>

                    {file.status === "error" && (
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => retryFile(file.id)}
                        className='h-8 w-8 p-0 text-inside border-inside hover:bg-inside hover:text-black'
                        disabled={disabled || isUploading}
                      >
                        <RotateCcw className='w-4 h-4' />
                      </Button>
                    )}

                    {file.status === "pending" && (
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => removeFile(file.id)}
                        className='h-8 w-8 p-0 text-zinc-500 hover:text-red-600 hover:bg-red-50 hover:border-red-300'
                        disabled={disabled || isUploading}
                      >
                        <X className='w-4 h-4' />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Info */}
      <div className='bg-gradient-to-r from-zinc-50 to-zinc-100 rounded-xl p-5 border border-zinc-300'>
        <h5 className='text-sm font-bold text-zinc-900 mb-3 flex items-center gap-2'>
          Información Técnica
        </h5>
        <div className='text-sm text-zinc-700 space-y-2 font-medium'>
          <div className='flex items-start gap-3'>
            <span className='text-inside text-base'>🔧</span>
            <span>
              <strong className='text-zinc-900'>Tecnología:</strong> Servidor
              inicializa + proxy chunked upload
            </span>
          </div>
          <div className='flex items-start gap-3'>
            <span className='text-inside text-base'>📦</span>
            <span>
              <strong className='text-zinc-900'>Chunking:</strong> Archivos
              grandes se dividen en chunks de 4MB
            </span>
          </div>
          <div className='flex items-start gap-3'>
            <span className='text-inside text-base'>🚀</span>
            <span>
              <strong className='text-zinc-900'>Performance:</strong> Evita
              límites CORS • Resumable upload completo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
