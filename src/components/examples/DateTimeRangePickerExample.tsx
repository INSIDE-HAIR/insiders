"use client";

import React, { useState } from "react";
import { DateTimeRangePicker } from "@/src/components/ui/date-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const DateTimeRangePickerExample: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const handleReset = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleSetToday = () => {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59);
    
    setStartDate(now);
    setEndDate(endOfDay);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Selector de Rango de Fecha/Hora</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DateTimeRangePicker
          startValue={startDate}
          endValue={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
          hourCycle={24}
          granularity="minute"
          locale={es}
          startPlaceholder="Selecciona fecha de inicio"
          endPlaceholder="Selecciona fecha de fin"
        />
        
        <div className="flex gap-2">
          <Button onClick={handleSetToday} variant="outline" size="sm">
            Hoy
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            Limpiar
          </Button>
        </div>

        {(startDate || endDate) && (
          <div className="space-y-2 p-3 bg-muted rounded-md">
            <h4 className="font-medium text-sm">Valores seleccionados:</h4>
            {startDate && (
              <p className="text-sm">
                <strong>Inicio:</strong> {format(startDate, "PPpp", { locale: es })}
              </p>
            )}
            {endDate && (
              <p className="text-sm">
                <strong>Fin:</strong> {format(endDate, "PPpp", { locale: es })}
              </p>
            )}
            {startDate && endDate && (
              <p className="text-sm text-muted-foreground">
                Duración: {Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))} minutos
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};