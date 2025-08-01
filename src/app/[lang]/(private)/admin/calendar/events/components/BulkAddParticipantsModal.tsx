"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { 
  UserPlusIcon, 
  XMarkIcon, 
  CheckIcon,
  ExclamationTriangleIcon 
} from "@heroicons/react/24/outline";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
import { toast } from "@/src/components/ui/use-toast";

interface BulkAddParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEvents: GoogleCalendarEvent[];
  onConfirm: (participants: string[], message?: string) => Promise<void>;
}

interface Participant {
  email: string;
  id: string;
}

export const BulkAddParticipantsModal: React.FC<BulkAddParticipantsModalProps> = ({
  isOpen,
  onClose,
  selectedEvents,
  onConfirm,
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addParticipant = () => {
    const email = emailInput.trim().toLowerCase();
    
    if (!email) return;
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Verificar si ya existe
    if (participants.some(p => p.email === email)) {
      toast({
        title: "Participante duplicado",
        description: "Este email ya está en la lista",
        variant: "destructive", 
        duration: 3000,
      });
      return;
    }

    const newParticipant: Participant = {
      email,
      id: `${Date.now()}-${Math.random()}`,
    };

    setParticipants(prev => [...prev, newParticipant]);
    setEmailInput("");
  };

  const removeParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addParticipant();
    }
  };

  const handleConfirm = async () => {
    if (participants.length === 0) {
      toast({
        title: "Sin participantes",
        description: "Debes agregar al menos un participante",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const emails = participants.map(p => p.email);
      await onConfirm(emails, message.trim() || undefined);
      
      // Reset form
      setParticipants([]);
      setEmailInput("");
      setMessage("");
      onClose();
      
      toast({
        title: "Participantes agregados",
        description: `Se agregaron participantes a ${selectedEvents.length} evento${selectedEvents.length !== 1 ? 's' : ''}`,
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al agregar participantes",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setParticipants([]);
      setEmailInput("");
      setMessage("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlusIcon className="h-5 w-5 text-green-600" />
            Agregar Participantes a Eventos
          </DialogTitle>
          <DialogDescription>
            Agrega uno o varios participantes a {selectedEvents.length} evento{selectedEvents.length !== 1 ? 's' : ''} seleccionado{selectedEvents.length !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lista de eventos seleccionados */}
          <div>
            <Label className="text-sm font-medium">Eventos seleccionados:</Label>
            <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
              {selectedEvents.slice(0, 3).map((event, index) => (
                <div key={event.id} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  • {event.summary || 'Sin título'}
                </div>
              ))}
              {selectedEvents.length > 3 && (
                <div className="text-sm text-gray-500 italic">
                  +{selectedEvents.length - 3} evento{selectedEvents.length - 3 !== 1 ? 's' : ''} más...
                </div>
              )}
            </div>
          </div>

          {/* Input para agregar participantes */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Agregar participante por email:
            </Label>
            <div className="mt-1 flex gap-2">
              <Input
                id="email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="usuario@ejemplo.com"
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="button"
                onClick={addParticipant}
                disabled={!emailInput.trim() || isLoading}
                size="sm"
              >
                <UserPlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Lista de participantes agregados */}
          {participants.length > 0 && (
            <div>
              <Label className="text-sm font-medium">
                Participantes a agregar ({participants.length}):
              </Label>
              <div className="mt-2 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {participants.map((participant) => (
                  <Badge
                    key={participant.id}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    <span className="text-xs">{participant.email}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParticipant(participant.id)}
                      className="h-4 w-4 p-0 hover:bg-red-100"
                      disabled={isLoading}
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje opcional */}
          <div>
            <Label htmlFor="message" className="text-sm font-medium">
              Mensaje opcional para la invitación:
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mensaje opcional que se enviará con la invitación..."
              className="mt-1 min-h-[60px]"
              disabled={isLoading}
            />
          </div>

          {/* Advertencia */}
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Importante:</p>
              <p>Los participantes recibirán invitaciones para todos los eventos seleccionados.</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={participants.length === 0 || isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Agregando...
              </>
            ) : (
              <>
                <CheckIcon className="mr-2 h-4 w-4" />
                Agregar a {selectedEvents.length} Evento{selectedEvents.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};