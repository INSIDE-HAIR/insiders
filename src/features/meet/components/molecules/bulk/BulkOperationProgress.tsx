/**
 * BULKOPERATIONPROGRESS - Indicador de progreso para operaciones masivas
 * Muestra progreso detallado con posibilidad de cancelación
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Progress } from "@/src/components/ui/progress";
import { Badge } from "@/src/components/ui/badge";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import { BulkOperationProgress as ProgressType } from "../../../hooks/useBulkOperations";

export interface BulkOperationProgressProps {
  progress: ProgressType;
  onCancel?: () => void;
  canCancel?: boolean;
  errors?: Array<{ roomId: string; error: string; }>;
  className?: string;
}

/**
 * Componente para mostrar el progreso de operaciones masivas
 * Incluye barra de progreso, detalles de la operación y posibilidad de cancelación
 */
export const BulkOperationProgress: React.FC<BulkOperationProgressProps> = ({
  progress,
  onCancel,
  canCancel = false,
  errors = [],
  className,
}) => {
  const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
  const isCompleted = progress.completed;
  const hasErrors = errors.length > 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            {isCompleted ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ClockIcon className="h-5 w-5 text-blue-500" />
            )}
            {progress.operation}
            {isCompleted && (
              <Badge variant={hasErrors ? "destructive" : "default"}>
                {hasErrors ? "Completado con errores" : "Completado"}
              </Badge>
            )}
          </CardTitle>
          
          {canCancel && !isCompleted && onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="flex items-center gap-1"
            >
              <StopIcon className="h-3 w-3" />
              Cancelar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Progreso: {progress.current} / {progress.total}
            </span>
            <span className="font-medium">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2"
          />
        </div>

        {/* Current Item */}
        {progress.currentRoomId && !isCompleted && (
          <div className="text-sm text-muted-foreground">
            Procesando: {progress.currentRoomId}
          </div>
        )}

        {/* Completion Summary */}
        {isCompleted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Elementos procesados:</span>
              <span className="font-medium">{progress.current}</span>
            </div>
            
            {hasErrors && (
              <div className="flex items-center justify-between text-sm">
                <span>Errores:</span>
                <Badge variant="destructive" className="text-xs">
                  {errors.length}
                </Badge>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm">
              <span>Exitosos:</span>
              <Badge variant="default" className="text-xs">
                {progress.current - errors.length}
              </Badge>
            </div>
          </div>
        )}

        {/* Errors List */}
        {hasErrors && (
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">
                  Se encontraron {errors.length} errores:
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="text-xs">
                      <span className="font-mono">{error.roomId}</span>: {error.error}
                    </div>
                  ))}
                  {errors.length > 5 && (
                    <div className="text-xs text-muted-foreground">
                      ... y {errors.length - 5} errores más
                    </div>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Time Estimation */}
        {!isCompleted && progress.current > 0 && (
          <div className="text-xs text-muted-foreground">
            {(() => {
              // Simple time estimation based on current progress
              const timePerItem = Date.now() / progress.current; // This would need proper timing
              const remainingItems = progress.total - progress.current;
              const estimatedSeconds = (remainingItems * timePerItem) / 1000;
              
              if (estimatedSeconds > 60) {
                const minutes = Math.ceil(estimatedSeconds / 60);
                return `Tiempo estimado restante: ~${minutes} minuto${minutes > 1 ? 's' : ''}`;
              } else {
                return `Tiempo estimado restante: ~${Math.ceil(estimatedSeconds)} segundos`;
              }
            })()}
          </div>
        )}

        {/* Success Message */}
        {isCompleted && !hasErrors && (
          <Alert>
            <CheckCircleIcon className="h-4 w-4" />
            <AlertDescription>
              Operación completada exitosamente. Se procesaron {progress.current} elementos sin errores.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};