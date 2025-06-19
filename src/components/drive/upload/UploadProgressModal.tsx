"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit2,
  Save,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Progress } from "@/src/components/ui/progress";
import { Input } from "@/src/components/ui/input";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";

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

interface UploadProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: UploadFileItem[];
  onUpdateFileName: (fileId: string, newName: string) => void;
  onStartUpload: () => void;
  onCancelUpload: () => void;
  isUploading: boolean;
  folderId: string;
  folderName: string;
}

export function UploadProgressModal({
  isOpen,
  onClose,
  files,
  onUpdateFileName,
  onStartUpload,
  onCancelUpload,
  isUploading,
  folderId,
  folderName,
}: UploadProgressModalProps) {
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");

  const completedFiles = files.filter((f) => f.status === "completed").length;
  const errorFiles = files.filter((f) => f.status === "error").length;
  const totalFiles = files.length;

  // Estadísticas generales
  const overallProgress =
    totalFiles > 0 ? (completedFiles / totalFiles) * 100 : 0;
  const hasErrors = errorFiles > 0;
  const isCompleted = completedFiles === totalFiles && totalFiles > 0;
  const canUpload = files.some((f) => f.status === "pending") && !isUploading;

  const handleStartEdit = (file: UploadFileItem) => {
    setEditingFileId(file.id);
    setTempName(file.newName);
  };

  const handleSaveEdit = () => {
    if (editingFileId && tempName.trim()) {
      onUpdateFileName(editingFileId, tempName.trim());
    }
    setEditingFileId(null);
    setTempName("");
  };

  const handleCancelEdit = () => {
    setEditingFileId(null);
    setTempName("");
  };

  const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case "pending":
        return <FileText className='w-4 h-4 text-gray-400' />;
      case "uploading":
        return <Loader2 className='w-4 h-4 text-blue-500 animate-spin' />;
      case "completed":
        return <CheckCircle className='w-4 h-4 text-green-500' />;
      case "error":
        return <AlertCircle className='w-4 h-4 text-red-500' />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: UploadStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant='secondary'>Pendiente</Badge>;
      case "uploading":
        return (
          <Badge variant='default' className='bg-blue-500'>
            Subiendo
          </Badge>
        );
      case "completed":
        return (
          <Badge variant='default' className='bg-green-500'>
            Completado
          </Badge>
        );
      case "error":
        return <Badge variant='destructive'>Error</Badge>;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[80vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <FileText className='w-5 h-5' />
            Subir archivos a Drive
          </DialogTitle>
          <div className='text-sm text-muted-foreground'>
            Destino: <span className='font-medium'>{folderName}</span>
          </div>
        </DialogHeader>

        {/* Progreso general */}
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span>Progreso general</span>
            <span>
              {completedFiles}/{totalFiles} archivos
            </span>
          </div>
          <Progress value={overallProgress} className='h-2' />

          {hasErrors && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                {errorFiles} archivo(s) fallaron. Revisa los errores abajo.
              </AlertDescription>
            </Alert>
          )}

          {isCompleted && !hasErrors && (
            <Alert>
              <CheckCircle className='h-4 w-4' />
              <AlertDescription>
                ¡Todos los archivos se subieron correctamente!
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Lista de archivos */}
        <ScrollArea className='flex-1 min-h-0 max-h-[50vh]'>
          <div className='space-y-3 pr-4'>
            {files.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "border rounded-lg p-4 space-y-3",
                  file.status === "error" && "border-red-200 bg-red-50",
                  file.status === "completed" && "border-green-200 bg-green-50",
                  file.status === "uploading" && "border-blue-200 bg-blue-50"
                )}
              >
                {/* Header del archivo */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    {getStatusIcon(file.status)}
                    <span className='font-medium text-sm'>
                      {file.originalName}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      ({formatFileSize(file.file.size)})
                    </span>
                  </div>
                  {getStatusBadge(file.status)}
                </div>

                {/* Campo de nombre editable */}
                <div className='space-y-2'>
                  <label className='text-xs font-medium text-muted-foreground'>
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
                          if (e.key === "Enter") handleSaveEdit();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        autoFocus
                      />
                      <Button
                        size='sm'
                        onClick={handleSaveEdit}
                        disabled={!tempName.trim()}
                      >
                        <Save className='w-3 h-3' />
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={handleCancelEdit}
                      >
                        <X className='w-3 h-3' />
                      </Button>
                    </div>
                  ) : (
                    <div className='flex items-center gap-2'>
                      <Input
                        value={file.newName}
                        readOnly
                        className='text-sm bg-muted'
                      />
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleStartEdit(file)}
                        disabled={
                          file.status === "uploading" ||
                          file.status === "completed"
                        }
                      >
                        <Edit2 className='w-3 h-3' />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Barra de progreso individual */}
                {file.status === "uploading" && (
                  <div className='space-y-1'>
                    <div className='flex justify-between text-xs'>
                      <span>Subiendo...</span>
                      <span>{file.progress}%</span>
                    </div>
                    <Progress value={file.progress} className='h-1' />
                  </div>
                )}

                {/* Error mensaje */}
                {file.status === "error" && file.error && (
                  <Alert variant='destructive'>
                    <AlertDescription className='text-xs'>
                      {file.error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* ID de Drive para archivos completados */}
                {file.status === "completed" && file.driveFileId && (
                  <div className='text-xs text-muted-foreground'>
                    ID de Drive: {file.driveFileId}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className='flex gap-2'>
          <Button variant='outline' onClick={onClose} disabled={isUploading}>
            {isCompleted ? "Cerrar" : "Cancelar"}
          </Button>

          {canUpload && (
            <Button onClick={onStartUpload} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Subiendo...
                </>
              ) : (
                `Subir ${
                  files.filter((f) => f.status === "pending").length
                } archivo(s)`
              )}
            </Button>
          )}

          {isUploading && (
            <Button variant='destructive' onClick={onCancelUpload}>
              Cancelar subida
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
