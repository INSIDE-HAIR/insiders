import React from "react";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { cn } from "@/src/lib/utils";
import { SectionHeader } from "../../molecules/layout/SectionHeader";
import { FieldGroup } from "../../molecules/forms/FieldGroup";
import { FieldLabel } from "../../atoms/text/FieldLabel";
import { StatusBadge } from "../../atoms/badges/StatusBadge";
import { CloseSessionButton } from "../../atoms/buttons/CloseSessionButton";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export interface GeneralSectionDemoData {
  roomId: string;
  meetingCode: string;
  meetingLink: string;
  accessType: {
    type: string;
    label: string;
    className: string;
  };
  status: {
    type: string;
    label: string;
    animated: boolean;
    showCloseButton: boolean;
  };
  alert: {
    message: string;
  };
}

export interface GeneralSectionDemoProps {
  data: GeneralSectionDemoData;
  onCopy?: (value: string) => void;
  onExternal?: (value: string) => void;
  onCloseSession?: () => void;
  className?: string;
}

/**
 * Sección General Demo que replica exactamente ResponsiveModalDemo
 * Usando componentes atómicos creados para lograr apariencia idéntica
 * 
 * @example
 * <GeneralSectionDemo 
 *   data={modalDummyData.roomInfo} 
 *   onCopy={(value) => console.log('Copied:', value)}
 *   onCloseSession={() => alert('Cerrando sesión...')}
 * />
 */
export const GeneralSectionDemo: React.FC<GeneralSectionDemoProps> = ({
  data,
  onCopy,
  onExternal, 
  onCloseSession,
  className
}) => {
  
  const handleCopy = (value: string) => {
    onCopy?.(value);
    // Mantener la funcionalidad original del demo
    navigator.clipboard.writeText(value);
  };

  const handleExternal = (value: string) => {
    onExternal?.(value);
    // Mantener la funcionalidad original del demo  
    window.open(value, '_blank');
  };

  const handleCloseSession = () => {
    onCloseSession?.();
    // Mantener la funcionalidad original del demo
    alert('Cerrando sesión...');
  };

  return (
    <div className={cn("space-y-4", className)}>
      
      {/* Header de sección - exacto al ResponsiveModalDemo */}
      <SectionHeader icon="information" title="Información General" />
      
      {/* Campos de información - usando FieldGroup molecular */}
      <div className="space-y-3">
        
        <FieldGroup
          label="ID de la Sala"
          value={data.roomId}
          variant="code"
          showCopy={true}
          onCopy={handleCopy}
        />
        
        <FieldGroup
          label="Código de Reunión"
          value={data.meetingCode}
          variant="code"
          showCopy={true}
          onCopy={handleCopy}
        />
        
        <FieldGroup
          label="Enlace de Reunión"
          value={data.meetingLink}
          variant="input"
          showCopy={true}
          showExternal={true}
          onCopy={handleCopy}
          onExternal={handleExternal}
        />
        
        {/* Tipo de Acceso - badge manual para mantener styling exacto */}
        <div>
          <FieldLabel>Tipo de Acceso</FieldLabel>
          <div className="mt-1">
            <div className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
              data.accessType.className
            )}>
              <svg className="h-4 w-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              {data.accessType.label}
            </div>
          </div>
        </div>
        
        {/* Estado de la Sala - usando StatusBadge + CloseSessionButton */}
        <div>
          <FieldLabel>Estado de la Sala</FieldLabel>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge 
              status="active" 
              animated={data.status.animated}
            >
              {data.status.label}
            </StatusBadge>
            
            {data.status.showCloseButton && (
              <CloseSessionButton onClick={handleCloseSession} />
            )}
          </div>
        </div>
        
      </div>

      {/* Alert informativo - exacto al ResponsiveModalDemo */}
      <Alert>
        <InformationCircleIcon className="h-4 w-4" />
        <AlertDescription>
          {data.alert.message}
        </AlertDescription>
      </Alert>
      
    </div>
  );
};