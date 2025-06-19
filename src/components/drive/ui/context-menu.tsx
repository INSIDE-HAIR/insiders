"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/src/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { toast } from "@/src/components/ui/use-toast";
import { Edit, Trash2, Download } from "lucide-react";
import type { HierarchyItem } from "@/src/features/drive/types/index";
import { isFileItem } from "@/src/features/drive/types/index";

interface FileContextMenuProps {
  children: React.ReactNode;
  item: HierarchyItem;
  onFileUpdated?: () => void;
  onFileDeleted?: () => void;
}

export function FileContextMenu({
  children,
  item,
  onFileUpdated,
  onFileDeleted,
}: FileContextMenuProps) {
  const { data: session } = useSession();
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newName, setNewName] = useState(item.displayName || item.name);
  const [isLoading, setIsLoading] = useState(false);

  // Solo admins pueden ver el menú contextual
  const isAdmin = session?.user?.role === "ADMIN";

  if (!isAdmin) {
    return <>{children}</>;
  }

  const isFile = isFileItem(item);
  const isFolder = !isFile;

  const handleRename = async () => {
    if (!newName.trim() || newName === (item.displayName || item.name)) {
      setShowRenameDialog(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/drive/management/rename`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: item.id,
          newName: newName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al renombrar el archivo");
      }

      toast({
        title: "Éxito",
        description: `${
          isFile ? "Archivo" : "Carpeta"
        } renombrado correctamente. Refresca la página para ver los cambios.`,
        action: (
          <Button
            variant='outline'
            size='sm'
            onClick={() => window.location.reload()}
          >
            Refrescar
          </Button>
        ),
      });

      // Refrescar la vista
      if (onFileUpdated) {
        onFileUpdated();
      }

      setShowRenameDialog(false);
    } catch (error) {
      console.error("Error renaming file:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/drive/management/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: item.id,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Manejar específicamente el error 404 para archivos que no existen
        if (response.status === 404 && responseData.alreadyDeleted) {
          toast({
            title: "Elemento no encontrado",
            description: `${
              isFile ? "El archivo" : "La carpeta"
            } ya no existe en Google Drive. Refresca la página para actualizar la vista.`,
            action: (
              <Button
                variant='outline'
                size='sm'
                onClick={() => window.location.reload()}
              >
                Refrescar
              </Button>
            ),
          });

          if (onFileDeleted) {
            onFileDeleted();
          }
          setShowDeleteDialog(false);
          return;
        }

        // Manejar otros tipos de errores
        if (response.status === 429) {
          throw new Error(
            "Límite de API alcanzado. Intenta de nuevo en unos minutos."
          );
        } else if (response.status === 403) {
          throw new Error("No tienes permisos para eliminar este elemento.");
        } else if (response.status === 400) {
          throw new Error(
            responseData.error ||
              "No se puede eliminar esta carpeta porque contiene archivos."
          );
        }
        throw new Error(responseData.error || "Error al eliminar el archivo");
      }

      // Mostrar mensaje apropiado según si el archivo ya estaba eliminado
      const title = responseData.alreadyDeleted
        ? "Movido a la papelera (o ya estaba allí)"
        : "Éxito";
      const description = responseData.alreadyDeleted
        ? `${
            isFile ? "El archivo" : "La carpeta"
          } ya se encontraba en la papelera. Refresca la página para actualizar la vista.`
        : `${
            isFile ? "Archivo" : "Carpeta"
          } movido a la papelera correctamente. Refresca la página para ver los cambios.`;

      toast({
        title,
        description,
        action: (
          <Button
            variant='outline'
            size='sm'
            onClick={() => window.location.reload()}
          >
            Refrescar
          </Button>
        ),
      });

      // Refrescar la vista
      if (onFileDeleted) {
        onFileDeleted();
      }

      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (isFile && item.webViewLink) {
      // Para archivos de Google Drive, convertir la URL de visualización a descarga
      const downloadUrl = item.webViewLink.replace("/view", "/export");
      window.open(downloadUrl, "_blank");
    } else if (isFile && isFileItem(item) && item.transformedUrl?.download) {
      window.open(item.transformedUrl.download, "_blank");
    } else {
      toast({
        title: "Error",
        description: "No se puede descargar este elemento",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent className='w-48'>
          <ContextMenuItem onClick={() => setShowRenameDialog(true)}>
            <Edit className='mr-2 h-4 w-4' />
            Renombrar
          </ContextMenuItem>

          {isFile && (
            <ContextMenuItem onClick={handleDownload}>
              <Download className='mr-2 h-4 w-4' />
              Descargar
            </ContextMenuItem>
          )}

          <ContextMenuSeparator />

          <ContextMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className='text-red-600 focus:text-red-600'
          >
            <Trash2 className='mr-2 h-4 w-4' />
            Eliminar
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Dialog para renombrar */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Renombrar {isFile ? "archivo" : "carpeta"}
            </DialogTitle>
          </DialogHeader>
          <div className='py-4'>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder='Nuevo nombre'
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRename();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowRenameDialog(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleRename} disabled={isLoading}>
              {isLoading ? "Renombrando..." : "Renombrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Mover {isFile ? "archivo" : "carpeta"} a la papelera?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción moverá el elemento a la papelera de Google Drive.
              <strong>{item.displayName || item.name}</strong>
              {isFolder && " y todo su contenido."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className='bg-red-600 hover:bg-red-700'
            >
              {isLoading ? "Moviendo..." : "Mover a la papelera"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
