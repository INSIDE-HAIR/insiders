/**
 * BulkAddParticipantsModal - Organism Component
 * 
 * Modal para agregar participantes masivamente usando Dialog de shadcn
 * Mantiene estética IDÉNTICA con componentes shadcn
 */

"use client";

import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";
import { 
  UserPlusIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  DocumentArrowUpIcon
} from "@heroicons/react/24/outline";
import { SearchInput } from "../../atoms/inputs/SearchInput";
import { CountBadge } from "../../atoms/indicators/CountBadge";
import { cn } from "@/src/lib/utils";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";

interface Participant {
  email: string;
  displayName?: string;
  valid: boolean;
  existing?: boolean;
}

interface BulkAddParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (participants: Participant[], sendNotifications: boolean) => void;
  selectedEventsCount?: number;
  existingParticipants?: string[];
  isLoading?: boolean;
  className?: string;
  // Legacy support
  selectedEvents?: GoogleCalendarEvent[];
  onConfirm?: (participants: string[], message?: string) => Promise<void>;
}

export const BulkAddParticipantsModal: React.FC<BulkAddParticipantsModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  selectedEvents,
  onConfirm,
  selectedEventsCount,
  existingParticipants = [],
  isLoading = false,
  className,
}) => {
  // Determine count from either prop
  const eventsCount = selectedEventsCount || selectedEvents?.length || 0;
  const [emailsText, setEmailsText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [sendNotifications, setSendNotifications] = useState(true);
  const [activeTab, setActiveTab] = useState("input");

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const parseEmails = useCallback((text: string): Participant[] => {
    const lines = text.split('\n');
    const participants: Participant[] = [];
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      // Parse different formats:
      // 1. email@domain.com
      // 2. Name <email@domain.com>
      // 3. Name, email@domain.com
      // 4. email@domain.com, Name
      
      const emailRegex = /([^\s@]+@[^\s@]+\.[^\s@]+)/;
      const nameEmailRegex = /^(.+?)\s*<([^>]+)>$/;
      const commaRegex = /^(.+?),\s*(.+?)$/;
      
      let email = "";
      let displayName = "";
      
      if (nameEmailRegex.test(trimmedLine)) {
        // Format: Name <email@domain.com>
        const match = trimmedLine.match(nameEmailRegex);
        if (match && match[1] && match[2]) {
          displayName = match[1].trim();
          email = match[2].trim();
        }
      } else if (commaRegex.test(trimmedLine)) {
        // Format: Name, email@domain.com or email@domain.com, Name
        const match = trimmedLine.match(commaRegex);
        if (match && match[1] && match[2]) {
          const first = match[1].trim();
          const second = match[2].trim();
          
          if (validateEmail(first)) {
            email = first;
            displayName = second;
          } else if (validateEmail(second)) {
            displayName = first;
            email = second;
          }
        }
      } else if (emailRegex.test(trimmedLine)) {
        // Format: email@domain.com
        email = trimmedLine;
        displayName = "";
      }
      
      if (email) {
        participants.push({
          email: email.toLowerCase(),
          displayName: displayName || undefined,
          valid: validateEmail(email),
          existing: existingParticipants.includes(email.toLowerCase())
        });
      }
    });
    
    // Remove duplicates
    const uniqueParticipants = participants.filter((participant, index, self) =>
      index === self.findIndex(p => p.email === participant.email)
    );
    
    return uniqueParticipants;
  }, [existingParticipants]);

  const handleParseEmails = () => {
    const parsedParticipants = parseEmails(emailsText);
    setParticipants(parsedParticipants);
    setActiveTab("review");
  };

  const handleRemoveParticipant = (emailToRemove: string) => {
    setParticipants(prev => prev.filter(p => p.email !== emailToRemove));
  };

  const handleClearAll = () => {
    setParticipants([]);
    setEmailsText("");
    setActiveTab("input");
  };

  const handleAdd = async () => {
    const validParticipants = participants.filter(p => p.valid && !p.existing);
    
    if (onAdd) {
      // Original callback style
      onAdd(validParticipants, sendNotifications);
    } else if (onConfirm) {
      // Legacy callback style
      const participantEmails = validParticipants.map(p => p.email);
      const message = sendNotifications ? "Notification sent to new participants" : "";
      await onConfirm(participantEmails, message);
    }
    
    handleClearAll();
    onClose();
  };

  const filteredParticipants = participants.filter(participant =>
    participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (participant.displayName && participant.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const validParticipants = participants.filter(p => p.valid && !p.existing);
  const invalidParticipants = participants.filter(p => !p.valid);
  const existingParticipantsFiltered = participants.filter(p => p.existing);

  const sampleFormats = `juan@ejemplo.com
María García <maria.garcia@empresa.com>
pedro.lopez@dominio.com, Pedro López
Ana Martínez, ana.martinez@trabajo.es
carlos@test.com`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-3xl max-h-[90vh]", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlusIcon className="h-5 w-5" />
            Agregar Participantes Masivamente
          </DialogTitle>
          <DialogDescription>
            Agregar múltiples participantes a {eventsCount} evento{eventsCount > 1 ? 's' : ''} seleccionado{eventsCount > 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="input">
              <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
              Ingresar Emails
            </TabsTrigger>
            <TabsTrigger value="review" disabled={participants.length === 0}>
              Revisar ({participants.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="emails-textarea">Lista de Emails</Label>
              <Textarea
                id="emails-textarea"
                placeholder="Ingresa emails, uno por línea..."
                value={emailsText}
                onChange={(e) => setEmailsText(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
              <div className="text-xs text-muted-foreground">
                Puedes usar diferentes formatos: email@dominio.com, Nombre &lt;email@dominio.com&gt;, o Nombre, email@dominio.com
              </div>
            </div>

            <div className="space-y-2">
              <Label>Formatos Soportados</Label>
              <div className="bg-muted p-3 rounded-lg">
                <pre className="text-xs text-muted-foreground whitespace-pre-line font-mono">
                  {sampleFormats}
                </pre>
              </div>
            </div>

            <Button 
              onClick={handleParseEmails}
              disabled={!emailsText.trim() || isLoading}
              className="w-full"
            >
              Procesar Emails
            </Button>
          </TabsContent>

          <TabsContent value="review" className="space-y-4 mt-6">
            {participants.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Buscar participantes..."
                    className="max-w-xs"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAll}
                    >
                      Limpiar todo
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-emerald-600 mb-1">
                      <CheckCircleIcon className="h-4 w-4" />
                      <span className="font-medium">Válidos</span>
                      <CountBadge count={validParticipants.length} />
                    </div>
                    <div className="text-xs text-emerald-600">
                      Se agregarán a los eventos
                    </div>
                  </div>

                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-destructive mb-1">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <span className="font-medium">Inválidos</span>
                      <CountBadge count={invalidParticipants.length} />
                    </div>
                    <div className="text-xs text-destructive">
                      Email formato incorrecto
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-yellow-600 mb-1">
                      <InformationCircleIcon className="h-4 w-4" />
                      <span className="font-medium">Existentes</span>
                      <CountBadge count={existingParticipantsFiltered.length} />
                    </div>
                    <div className="text-xs text-yellow-600">
                      Ya están invitados
                    </div>
                  </div>
                </div>

                <ScrollArea className="h-64 border rounded-lg">
                  <div className="p-2 space-y-1">
                    {filteredParticipants.map((participant, index) => (
                      <div 
                        key={index}
                        className={cn(
                          "flex items-center justify-between p-2 rounded border",
                          !participant.valid && "bg-destructive/10 border-destructive/30",
                          participant.existing && "bg-yellow-500/10 border-yellow-500/30",
                          participant.valid && !participant.existing && "bg-emerald-500/10 border-emerald-500/30"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {participant.displayName || participant.email.split('@')[0]}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {participant.email}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!participant.valid && (
                            <Badge variant="destructive" className="text-xs">
                              Inválido
                            </Badge>
                          )}
                          {participant.existing && (
                            <Badge className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/20">
                              Existente
                            </Badge>
                          )}
                          {participant.valid && !participant.existing && (
                            <Badge className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20">
                              Válido
                            </Badge>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveParticipant(participant.email)}
                            className="h-6 w-6 p-0"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="flex items-center space-x-2">
          <Switch
            id="send-notifications"
            checked={sendNotifications}
            onCheckedChange={setSendNotifications}
          />
          <Label htmlFor="send-notifications" className="text-sm">
            Enviar notificaciones por email a los nuevos participantes
          </Label>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {validParticipants.length > 0 && (
              <>Se agregarán {validParticipants.length} participante{validParticipants.length > 1 ? 's' : ''}</>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAdd}
              disabled={validParticipants.length === 0 || isLoading}
            >
              {isLoading ? 'Agregando...' : 'Agregar Participantes'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

BulkAddParticipantsModal.displayName = "BulkAddParticipantsModal";