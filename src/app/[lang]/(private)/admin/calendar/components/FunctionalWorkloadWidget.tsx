"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

interface WorkloadSummary {
  totalConsultants: number;
  totalSessions: number;
  totalHours: number;
  avgHoursPerConsultant: number;
}

interface ConsultantData {
  consultantEmail: string;
  consultantName: string;
  totalSessions: number;
  totalHours: number;
  acceptedSessions: number;
}

const FunctionalWorkloadWidget: React.FC = () => {
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
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<WorkloadSummary>({
    totalConsultants: 0,
    totalSessions: 0,
    totalHours: 0,
    avgHoursPerConsultant: 0
  });
  const [consultants, setConsultants] = useState<ConsultantData[]>([]);

  const loadWorkloadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        startDate,
        endDate
      });

      const response = await fetch(`/api/admin/consultant-workload?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error loading workload data');
      }

      const data = await response.json();
      
      if (data.success) {
        setSummary(data.data.summary);
        setConsultants(data.data.consultants || []);
      } else {
        throw new Error(data.error || 'Error loading workload data');
      }
    } catch (error: any) {
      setError(error.message || 'Error loading workload data');
      setSummary({
        totalConsultants: 0,
        totalSessions: 0,
        totalHours: 0,
        avgHoursPerConsultant: 0
      });
      setConsultants([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkloadData();
  }, [startDate, endDate]);

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
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
            onClick={loadWorkloadData}
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
            <div className="text-2xl font-bold text-blue-900">{summary.totalConsultants}</div>
            <div className="text-sm text-blue-700">Consultores Activos</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-900">{summary.totalSessions}</div>
            <div className="text-sm text-green-700">Sesiones Aceptadas</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-purple-900">{formatHours(summary.totalHours)}</div>
            <div className="text-sm text-purple-700">Horas Confirmadas</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-orange-900">{formatHours(summary.avgHoursPerConsultant)}</div>
            <div className="text-sm text-orange-700">Promedio por Consultor</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            ❌ {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2">
              <span className="animate-spin">🔄</span>
              <span className="text-sm text-gray-600">Cargando datos...</span>
            </div>
          </div>
        ) : consultants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>📅 No se encontraron sesiones de consultoría en el rango de fechas seleccionado</p>
            <p className="text-sm mt-2">Rango: {startDate} - {endDate}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Detalle por Consultor ({consultants.length})
            </h3>
            
            {consultants.map((consultant) => (
              <div key={consultant.consultantEmail} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      👤
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {consultant.consultantName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {consultant.consultantEmail}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatHours(consultant.totalHours)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {consultant.acceptedSessions} de {consultant.totalSessions} sesiones
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${consultant.totalSessions > 0 ? (consultant.acceptedSessions / consultant.totalSessions) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {consultant.totalSessions > 0 ? 
                    `${Math.round((consultant.acceptedSessions / consultant.totalSessions) * 100)}% aceptación` : 
                    'Sin sesiones'
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FunctionalWorkloadWidget;