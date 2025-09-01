/**
 * EditableDateTimeField - Molecular Component
 *
 * Campo editable avanzado de fecha y hora con múltiples modos de actualización
 * Compatible con el sistema legacy y mantiene funcionalidad completa como BulkDateTimeModal
 */

"use client";

import React, { useState } from "react";
import { DateTimePicker } from "@/src/components/ui/date-picker";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import {
  CalendarIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/src/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";

// Legacy compatibility interface (from original usage in columns.tsx)
interface LegacyEditableDateTimeProps {
  dateTimeValue: {
    dateTime?: string;
    date?: string;
  };
  eventId: string;
  calendarId: string;
  field: "start" | "end";
  label: string;
  currentEvent?: any;
  onUpdate: (
    eventId: string,
    calendarId: string,
    field: "start" | "end",
    value: any,
    currentEvent?: any
  ) => Promise<void>;
}

// Modern interface with advanced functionality
interface ModernEditableDateTimeProps {
  value: Date;
  onChange: (value: Date) => void;
  onSave?: (value: Date) => void;
  onCancel?: () => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  timeEnabled?: boolean;
  // Advanced options like BulkDateTimeModal
  showAdvancedOptions?: boolean;
  allowModeSelection?: boolean;
}

type UpdateMode =
  | "move"
  | "reschedule"
  | "adjust-duration"
  | "change-time-only";
type TimeAdjustment = "minutes" | "hours" | "days";

// Union type for backward compatibility
type EditableDateTimeFieldProps =
  | LegacyEditableDateTimeProps
  | ModernEditableDateTimeProps;

// Type guard to check if props are legacy
function isLegacyProps(
  props: EditableDateTimeFieldProps
): props is LegacyEditableDateTimeProps {
  return "dateTimeValue" in props;
}

export const EditableDateTimeField: React.FC<EditableDateTimeFieldProps> = (
  props
) => {
  if (isLegacyProps(props)) {
    return <LegacyEditableDateTimeField {...props} />;
  } else {
    return <ModernEditableDateTimeField {...props} />;
  }
};

// Legacy implementation for backward compatibility
const LegacyEditableDateTimeField: React.FC<LegacyEditableDateTimeProps> = ({
  dateTimeValue,
  eventId,
  calendarId,
  field,
  label,
  currentEvent,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tempValue, setTempValue] = useState<Date | null>(null);

  // Convert dateTimeValue to Date
  const getCurrentDate = () => {
    if (dateTimeValue?.dateTime) {
      return new Date(dateTimeValue.dateTime);
    } else if (dateTimeValue?.date) {
      return new Date(dateTimeValue.date);
    }
    return new Date();
  };

  // Format the display value
  const formatDisplayValue = () => {
    const date = getCurrentDate();
    if (dateTimeValue?.dateTime) {
      return format(date, "dd MMM yyyy HH:mm", { locale: es });
    } else {
      return format(date, "dd MMM yyyy", { locale: es });
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempValue(getCurrentDate());
    setIsEditing(true);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!tempValue) return;

    setIsLoading(true);
    try {
      const newValue = {
        dateTime: dateTimeValue?.dateTime ? tempValue.toISOString() : undefined,
        date: dateTimeValue?.date ? format(tempValue, "yyyy-MM-dd") : undefined,
      };

      await onUpdate(eventId, calendarId, field, newValue, currentEvent);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating date/time:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempValue(null);
    setIsEditing(false);
  };

  if (isLoading) {
    return <Skeleton className='h-8 w-32' />;
  }

  if (isEditing) {
    return (
      <div
        className='flex items-center gap-2'
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <DateTimePicker
          value={tempValue || undefined}
          onChange={(date) => date && setTempValue(date)}
          placeholder={`Seleccionar ${label.toLowerCase()}`}
          className='flex-1 min-w-[200px]'
        />
        <Button
          size='sm'
          variant='ghost'
          onClick={handleSave}
          disabled={!tempValue}
          className='h-8 w-8 p-0'
        >
          <CheckIcon className='h-4 w-4' />
        </Button>
        <Button
          size='sm'
          variant='ghost'
          onClick={handleCancel}
          className='h-8 w-8 p-0'
        >
          <XMarkIcon className='h-4 w-4' />
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={handleEdit}
      className='text-left hover:bg-muted/50 p-2 rounded transition-colors'
      title={`Editar ${label.toLowerCase()}`}
    >
      <div className='flex items-center gap-2'>
        <CalendarIcon className='h-4 w-4 text-muted-foreground' />
        <span className='text-sm'>{formatDisplayValue()}</span>
      </div>
    </button>
  );
};

// Modern implementation with advanced functionality like BulkDateTimeModal
const ModernEditableDateTimeField: React.FC<ModernEditableDateTimeProps> = ({
  value,
  onChange,
  onSave,
  onCancel,
  className,
  disabled = false,
  placeholder = "Seleccionar fecha",
  timeEnabled = true,
  showAdvancedOptions = false,
  allowModeSelection = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [timeValue, setTimeValue] = useState(format(value, "HH:mm"));

  // Advanced options state (like BulkDateTimeModal)
  const [updateMode, setUpdateMode] = useState<UpdateMode>("move");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isAllDay, setIsAllDay] = useState(false);
  const [preserveDuration, setPreserveDuration] = useState(true);
  const [adjustmentValue, setAdjustmentValue] = useState<number>(1);
  const [adjustmentUnit, setAdjustmentUnit] = useState<TimeAdjustment>("hours");
  const [adjustmentDirection, setAdjustmentDirection] = useState<
    "forward" | "backward"
  >("forward");

  // Calculate adjustment milliseconds
  const getAdjustmentMs = () => {
    const multipliers = {
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
    };

    const ms = adjustmentValue * multipliers[adjustmentUnit];
    return adjustmentDirection === "forward" ? ms : -ms;
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();

    let finalDate: Date;

    if (showAdvancedOptions && allowModeSelection) {
      // Use advanced mode logic like BulkDateTimeModal
      const currentStart = value;

      if (updateMode === "move" && selectedDate) {
        finalDate = selectedDate;
      } else if (updateMode === "change-time-only" && selectedDate) {
        const targetHours = selectedDate.getHours();
        const targetMinutes = selectedDate.getMinutes();

        finalDate = new Date(currentStart);
        finalDate.setHours(targetHours, targetMinutes, 0, 0);
      } else if (updateMode === "reschedule") {
        const adjustmentMs = getAdjustmentMs();
        finalDate = new Date(currentStart.getTime() + adjustmentMs);
      } else {
        finalDate = timeEnabled
          ? new Date(`${format(tempValue, "yyyy-MM-dd")}T${timeValue}:00`)
          : tempValue;
      }
    } else {
      // Simple mode
      finalDate = timeEnabled
        ? new Date(`${format(tempValue, "yyyy-MM-dd")}T${timeValue}:00`)
        : tempValue;
    }

    onChange(finalDate);
    onSave?.(finalDate);
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempValue(value);
    setTimeValue(format(value, "HH:mm"));
    setSelectedDate(undefined);
    onCancel?.();
    setIsEditing(false);
  };

  const handleEditMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div
        className={cn(
          "space-y-4 p-4 border rounded-lg bg-background",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Mode Selection (if enabled) */}
        {showAdvancedOptions && allowModeSelection && (
          <div className='space-y-3'>
            <Label className='text-base font-medium'>
              Tipo de actualización:
            </Label>
            <RadioGroup
              value={updateMode}
              onValueChange={(value: UpdateMode) => setUpdateMode(value)}
              className='space-y-2'
            >
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='move' id='move' />
                <Label
                  htmlFor='move'
                  className='flex items-center gap-2 cursor-pointer'
                >
                  <ArrowRightIcon className='h-4 w-4' />
                  Mover a fecha específica
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='reschedule' id='reschedule' />
                <Label
                  htmlFor='reschedule'
                  className='flex items-center gap-2 cursor-pointer'
                >
                  <ClockIcon className='h-4 w-4' />
                  Reprogramar (adelantar/atrasar)
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem
                  value='change-time-only'
                  id='change-time-only'
                />
                <Label
                  htmlFor='change-time-only'
                  className='flex items-center gap-2 cursor-pointer'
                >
                  <ClockIcon className='h-4 w-4' />
                  Cambiar solo la hora (mantener fecha)
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Move to specific date */}
        {showAdvancedOptions && updateMode === "move" && (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label>Nueva fecha y hora:</Label>
              <DateTimePicker
                value={selectedDate}
                onChange={setSelectedDate}
                granularity={isAllDay ? "day" : "minute"}
                placeholder={placeholder}
                disabled={disabled}
              />
            </div>

            <div className='flex items-center space-x-2'>
              <Switch
                id='all-day'
                checked={isAllDay}
                onCheckedChange={setIsAllDay}
              />
              <Label htmlFor='all-day'>Evento de todo el día</Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Switch
                id='preserve-duration'
                checked={preserveDuration}
                onCheckedChange={setPreserveDuration}
              />
              <Label htmlFor='preserve-duration'>
                Preservar duración original
              </Label>
            </div>
          </div>
        )}

        {/* Change Time Only */}
        {showAdvancedOptions && updateMode === "change-time-only" && (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label>Nueva hora (se mantiene la fecha original):</Label>
              <Input
                type='time'
                value={selectedDate ? format(selectedDate, "HH:mm") : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    const [hours, minutes] = e.target.value.split(":");
                    if (hours && minutes) {
                      const newTime = new Date();
                      newTime.setHours(
                        parseInt(hours),
                        parseInt(minutes),
                        0,
                        0
                      );
                      setSelectedDate(newTime);
                    }
                  }
                }}
              />
            </div>

            <div className='flex items-center space-x-2'>
              <Switch
                id='preserve-duration-time-only'
                checked={preserveDuration}
                onCheckedChange={setPreserveDuration}
              />
              <Label htmlFor='preserve-duration-time-only'>
                Preservar duración original
              </Label>
            </div>
          </div>
        )}

        {/* Reschedule */}
        {showAdvancedOptions && updateMode === "reschedule" && (
          <div className='space-y-4'>
            <div className='grid grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label>Cantidad:</Label>
                <Input
                  type='number'
                  min='1'
                  value={adjustmentValue}
                  onChange={(e) => setAdjustmentValue(Number(e.target.value))}
                />
              </div>

              <div className='space-y-2'>
                <Label>Unidad:</Label>
                <Select
                  value={adjustmentUnit}
                  onValueChange={(value: TimeAdjustment) =>
                    setAdjustmentUnit(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='minutes'>Minutos</SelectItem>
                    <SelectItem value='hours'>Horas</SelectItem>
                    <SelectItem value='days'>Días</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label>Dirección:</Label>
                <Select
                  value={adjustmentDirection}
                  onValueChange={(value: "forward" | "backward") =>
                    setAdjustmentDirection(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='forward'>Adelantar</SelectItem>
                    <SelectItem value='backward'>Atrasar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <Switch
                id='preserve-duration-reschedule'
                checked={preserveDuration}
                onCheckedChange={setPreserveDuration}
              />
              <Label htmlFor='preserve-duration-reschedule'>
                Preservar duración original
              </Label>
            </div>
          </div>
        )}

        {/* Simple mode (default) */}
        {!showAdvancedOptions && (
          <div className='flex items-center gap-2'>
            <DateTimePicker
              value={tempValue}
              onChange={(date) => date && setTempValue(date)}
              placeholder={placeholder}
              disabled={disabled}
              className='flex-1'
            />
            {timeEnabled && (
              <Input
                type='time'
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
                className='w-20'
                disabled={disabled}
              />
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className='flex justify-end gap-2 pt-2'>
          <Button
            size='sm'
            variant='ghost'
            onClick={handleCancel}
            disabled={disabled}
          >
            <XMarkIcon className='h-4 w-4 mr-1' />
            Cancelar
          </Button>
          <Button size='sm' onClick={handleSave} disabled={disabled}>
            <CheckIcon className='h-4 w-4 mr-1' />
            Guardar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleEditMode}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 text-left hover:bg-muted/50 p-2 rounded transition-colors",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <CalendarIcon className='h-4 w-4 text-muted-foreground' />
      <span className='text-sm'>
        {timeEnabled
          ? format(value, "dd MMM yyyy HH:mm", { locale: es })
          : format(value, "dd MMM yyyy", { locale: es })}
      </span>
    </button>
  );
};

// Loading skeleton
export const EditableDateTimeFieldSkeleton: React.FC = () => (
  <div className='animate-pulse'>
    <Skeleton className='h-8 w-32' />
  </div>
);

EditableDateTimeField.displayName = "EditableDateTimeField";
