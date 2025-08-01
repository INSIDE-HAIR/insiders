"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Copy, RefreshCw, Video, Link2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface EventMeetInfoProps {
  eventId: string;
  calendarId: string;
}

export function EventMeetInfo({ eventId, calendarId }: EventMeetInfoProps) {
  const [loading, setLoading] = useState(false);
  const [meetInfo, setMeetInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar información de Meet
  const fetchMeetInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/calendar/events/${eventId}/meet-info?calendarId=${calendarId}`
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Error al obtener información de Meet");
      }
      
      setMeetInfo(data);
    } catch (error: any) {
      setError(error.message);
      toast.error("Error al cargar información de Meet");
    } finally {
      setLoading(false);
    }
  };

  // Copiar Meet ID al portapapeles
  const copyMeetId = async () => {
    if (!meetInfo?.meetId) return;
    
    await navigator.clipboard.writeText(meetInfo.meetId);
    toast.success("Meet ID copiado al portapapeles");
  };

  // Copiar URL de Meet al portapapeles
  const copyMeetUrl = async () => {
    if (!meetInfo?.meetUrl) return;
    
    await navigator.clipboard.writeText(meetInfo.meetUrl);
    toast.success("URL de Meet copiada al portapapeles");
  };

  // Regenerar link de Meet
  const regenerateMeet = async () => {
    if (!confirm("¿Estás seguro de regenerar el link de Meet? El link anterior dejará de funcionar.")) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(
        `/api/calendar/events/${eventId}/meet-info?calendarId=${calendarId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "regenerate" })
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Error al regenerar Meet");
      }
      
      toast.success("Link de Meet regenerado exitosamente");
      await fetchMeetInfo(); // Recargar información
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Copiar link a la descripción
  const copyToDescription = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(
        `/api/calendar/events/${eventId}/meet-info?calendarId=${calendarId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "copyToDescription" })
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Error al copiar a descripción");
      }
      
      toast.success("Link de Meet añadido a la descripción del evento");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Información de Google Meet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!meetInfo && !error && (
          <Button 
            onClick={fetchMeetInfo} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Cargando..." : "Cargar información de Meet"}
          </Button>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {meetInfo && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estado:</span>
                <Badge variant={meetInfo.hasGoogleMeet ? "default" : "secondary"}>
                  {meetInfo.hasGoogleMeet ? "Meet habilitado" : "Sin Meet"}
                </Badge>
              </div>

              {meetInfo.meetId && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Meet ID:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {meetInfo.meetId}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={copyMeetId}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">URL:</span>
                    <div className="flex items-center gap-2">
                      <a 
                        href={meetInfo.meetUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Link2 className="h-3 w-3" />
                        Abrir Meet
                      </a>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={copyMeetUrl}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {meetInfo.conferenceType && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tipo:</span>
                      <span className="text-sm">{meetInfo.conferenceType}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {meetInfo.hasGoogleMeet && (
              <div className="flex flex-col gap-2 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={regenerateMeet}
                  disabled={loading}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerar link de Meet
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToDescription}
                  disabled={loading}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar link a descripción
                </Button>
              </div>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={fetchMeetInfo}
              disabled={loading}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar información
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}