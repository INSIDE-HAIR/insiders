import React, { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import {
  PencilIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  VideoCameraIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { AccessTypeBadge } from "../../atoms/badges/AccessTypeBadge";
import { RoomStatusBadge } from "../../atoms/badges/RoomStatusBadge";
import { cn } from "@/src/lib/utils";

export interface RoomData {
  name: string;
  meetingUri?: string;
  meetingCode?: string;
  config?: {
    accessType?: "OPEN" | "TRUSTED" | "RESTRICTED";
  };
  activeConference?: {
    conferenceRecord?: string;
  };
  _metadata?: {
    localId?: string;
    displayName?: string;
    createdAt?: Date;
    createdBy?: string;
    lastSyncAt?: Date;
    source?: string;
  };
}

export interface GeneralSectionProps {
  room: RoomData;
  onUpdateName?: (newName: string) => Promise<void>;
  onDeleteRoom?: () => Promise<void>;
  onEndConference?: () => Promise<void>;
  loading?: boolean;
  className?: string;
}

/**
 * Sección general con información básica de la sala
 * Incluye edición de nombre, enlaces, códigos y acciones principales
 */
export const GeneralSection: React.FC<GeneralSectionProps> = ({
  room,
  onUpdateName,
  onDeleteRoom,
  onEndConference,
  loading = false,
  className,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [nameLoading, setNameLoading] = useState(false);

  const spaceId = room.name?.split("/").pop();
  const displayName = room._metadata?.displayName || room.name || "Sala sin nombre";
  const isActive = !!room.activeConference?.conferenceRecord;

  const handleStartEdit = () => {
    setEditName(displayName);
    setIsEditingName(true);
  };

  const handleCancelEdit = () => {
    setEditName("");
    setIsEditingName(false);
  };

  const handleSaveName = async () => {
    if (!editName.trim() || !onUpdateName) return;
    
    try {
      setNameLoading(true);
      await onUpdateName(editName.trim());
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating name:", error);
    } finally {
      setNameLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // TODO: Add toast notification
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return "Desconocida";
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Información principal */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              {isEditingName ? (
                <div className="space-y-2">
                  <Label htmlFor="room-name">Nombre de la Sala</Label>
                  <div className="flex gap-2">
                    <Input
                      id="room-name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Nombre de la sala"
                      disabled={nameLoading}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handleSaveName();
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveName}
                      disabled={!editName.trim() || nameLoading}
                    >
                      {nameLoading ? "..." : "Guardar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={nameLoading}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <CardTitle className="text-xl flex items-center gap-2">
                  <VideoCameraIcon className="h-5 w-5 text-primary" />
                  {displayName}
                  {onUpdateName && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleStartEdit}
                      disabled={loading}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <RoomStatusBadge isActive={isActive} />
              {room.config?.accessType && (
                <AccessTypeBadge type={room.config.accessType} />
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Códigos y enlaces */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {room.meetingCode && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Código de Reunión</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded font-mono text-sm">
                    {room.meetingCode}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(room.meetingCode!)}
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {room.meetingUri && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Enlace de Reunión</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-sm truncate">
                    {room.meetingUri}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(room.meetingUri!)}
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Metadatos */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-medium">Información de la Sala</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID de la Sala:</span>
                  <code className="text-xs">{spaceId}</code>
                </div>
                
                {room._metadata?.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Creada:</span>
                    <span>{formatDate(room._metadata.createdAt)}</span>
                  </div>
                )}
                
                {room._metadata?.createdBy && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Creada por:</span>
                    <span>{room._metadata.createdBy}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                {room._metadata?.lastSyncAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Última sync:</span>
                    <span>{formatDate(room._metadata.lastSyncAt)}</span>
                  </div>
                )}
                
                {room._metadata?.source && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fuente:</span>
                    <Badge variant="outline">{room._metadata.source}</Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conferencia activa */}
      {isActive && (
        <Alert className="border-green-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="animate-pulse text-green-500">●</span>
              <span className="text-green-800 font-medium">
                Hay una conferencia activa en curso
              </span>
            </div>
            {onEndConference && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEndConference}
                disabled={loading}
                className="border-green-300 hover:bg-green-100"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Terminar Conferencia
              </Button>
            )}
          </div>
        </Alert>
      )}

      {/* Acciones peligrosas */}
      {onDeleteRoom && (
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5" />
              Zona de Peligro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Eliminar Sala</p>
                <p className="text-sm text-muted-foreground">
                  Esta acción no se puede deshacer. La sala será eliminada permanentemente.
                </p>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={loading || isActive}>
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Eliminar Sala
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará permanentemente la sala "{displayName}" y
                      todos sus datos asociados. Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDeleteRoom}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Sí, eliminar sala
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            
            {isActive && (
              <Alert className="mt-4">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription>
                  No se puede eliminar la sala mientras haya una conferencia activa.
                  Termina la conferencia primero.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};