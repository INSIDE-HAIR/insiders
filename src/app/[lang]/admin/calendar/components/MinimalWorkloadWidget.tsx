"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

const MinimalWorkloadWidget: React.FC = () => {
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    futureDate.setHours(23, 59, 59, 999);
    return futureDate.toISOString().split('T')[0];
  });

  const [isLoading, setIsLoading] = useState(false);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            📊 Carga Horaria por Consultor
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
          >
            {isLoading ? '🔄' : '↻'} Actualizar
          </Button>
        </div>

        {/* Date Range Selector */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">0</div>
            <div className="text-sm text-blue-700">Consultores Activos</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-900">0</div>
            <div className="text-sm text-green-700">Sesiones Aceptadas</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-purple-900">0h</div>
            <div className="text-sm text-purple-700">Horas Confirmadas</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-orange-900">0h</div>
            <div className="text-sm text-orange-700">Promedio por Consultor</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2">
              <span>🔄</span>
              <span className="text-sm text-gray-600">Cargando datos...</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>✅ Widget funcionando correctamente</p>
            <p className="text-sm mt-2">Rango: {startDate} - {endDate}</p>
            <p className="text-sm mt-1 text-blue-600">
              Próximo: conectar con API para datos reales
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MinimalWorkloadWidget;