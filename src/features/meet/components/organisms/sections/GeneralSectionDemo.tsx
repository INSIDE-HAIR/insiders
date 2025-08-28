import React, { useState } from "react";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { SectionHeader } from "../../molecules/layout/SectionHeader";
import { FieldGroup } from "../../molecules/forms/FieldGroup";
import { FieldLabel } from "../../atoms/text/FieldLabel";
import { StatusBadge } from "../../atoms/badges/StatusBadge";
import { CloseSessionButton } from "../../atoms/buttons/CloseSessionButton";
import { DateTimePicker } from "@/src/components/ui/date-picker";
import { InformationCircleIcon, CalendarIcon, CheckIcon } from "@heroicons/react/24/outline";

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
  // Campos opcionales de fechas
  startDate?: string;
  endDate?: string;
}

export interface GeneralSectionDemoProps {
  data: GeneralSectionDemoData;
  onCopy?: (value: string) => void;
  onExternal?: (value: string) => void;
  onCloseSession?: () => void;
  onStartDateChange?: (date: Date | undefined) => void;
  onEndDateChange?: (date: Date | undefined) => void;
  isUpdatingStartDate?: boolean;
  isUpdatingEndDate?: boolean;
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
  onStartDateChange,
  onEndDateChange,
  isUpdatingStartDate = false,
  isUpdatingEndDate = false,
  className
}) => {
  // Estados locales para las fechas temporales
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(
    data.startDate ? new Date(data.startDate) : undefined
  );
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(
    data.endDate ? new Date(data.endDate) : undefined
  );

  // Estados para detectar cambios
  const hasStartDateChanged = React.useMemo(() => {
    const tempTime = tempStartDate?.getTime();
    const originalTime = data.startDate ? new Date(data.startDate).getTime() : undefined;
    return tempTime !== originalTime;
  }, [tempStartDate, data.startDate]);
  
  const hasEndDateChanged = React.useMemo(() => {
    const tempTime = tempEndDate?.getTime();
    const originalTime = data.endDate ? new Date(data.endDate).getTime() : undefined;
    return tempTime !== originalTime;
  }, [tempEndDate, data.endDate]);
  
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

  const handleUpdateStartDate = () => {
    onStartDateChange?.(tempStartDate);
  };

  const handleUpdateEndDate = () => {
    onEndDateChange?.(tempEndDate);
  };

  // Sincronizar estados cuando cambian los datos externos
  React.useEffect(() => {
    setTempStartDate(data.startDate ? new Date(data.startDate) : undefined);
  }, [data.startDate]);

  React.useEffect(() => {
    setTempEndDate(data.endDate ? new Date(data.endDate) : undefined);
  }, [data.endDate]);


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

        {/* Fechas opcionales - date pickers editables con botones de actualización */}
        <div className="space-y-3 pt-2 border-t">
          {/* Fecha de Inicio */}
          <div>
            <FieldLabel>Fecha de Inicio</FieldLabel>
            <div className="mt-1 space-y-2">
              <DateTimePicker
                value={tempStartDate}
                onChange={setTempStartDate}
                placeholder="Sin fecha de inicio (disponible inmediatamente)"
                granularity="day"
                hourCycle={24}
                className="w-full"
                disabled={isUpdatingStartDate}
              />
              {hasStartDateChanged && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleUpdateStartDate}
                    disabled={isUpdatingStartDate}
                    className="h-7 text-xs"
                  >
                    {isUpdatingStartDate ? (
                      <div className="flex items-center gap-1">
                        <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full" />
                        <span>Actualizando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <CheckIcon className="h-3 w-3" />
                        <span>Actualizar</span>
                      </div>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTempStartDate(data.startDate ? new Date(data.startDate) : undefined)}
                    disabled={isUpdatingStartDate}
                    className="h-7 text-xs"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Fecha de Fin */}
          <div>
            <FieldLabel>Fecha de Fin</FieldLabel>
            <div className="mt-1 space-y-2">
              <DateTimePicker
                value={tempEndDate}
                onChange={setTempEndDate}
                placeholder="Sin fecha límite (siempre disponible)"
                granularity="day"
                hourCycle={24}
                className="w-full"
                disabled={isUpdatingEndDate}
              />
              {hasEndDateChanged && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleUpdateEndDate}
                    disabled={isUpdatingEndDate}
                    className="h-7 text-xs"
                  >
                    {isUpdatingEndDate ? (
                      <div className="flex items-center gap-1">
                        <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full" />
                        <span>Actualizando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <CheckIcon className="h-3 w-3" />
                        <span>Actualizar</span>
                      </div>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTempEndDate(data.endDate ? new Date(data.endDate) : undefined)}
                    disabled={isUpdatingEndDate}
                    className="h-7 text-xs"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
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