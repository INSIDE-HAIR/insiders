import React from "react";
import { GeneralSectionDemo } from "../organisms/sections/GeneralSectionDemo";
import modalDummyData from "../data/modal-dummy-data.json";

/**
 * Ejemplo de uso del GeneralSectionDemo con datos JSON
 * Demuestra la apariencia idéntica al ResponsiveModalDemo original
 * 
 * Este componente muestra:
 * 1. Uso de datos JSON estructurados
 * 2. Componentes atómicos funcionando en conjunto
 * 3. Apariencia pixel-perfect del original
 */
export const GeneralSectionDemoExample: React.FC = () => {
  
  const handleCopy = (value: string) => {
    console.log('✅ Copiado:', value);
  };

  const handleExternal = (value: string) => {
    console.log('🔗 Abriendo enlace externo:', value);
  };

  const handleCloseSession = () => {
    console.log('🚪 Cerrando sesión...');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">General Section Demo - Atomic Design</h1>
        <p className="text-muted-foreground">
          Replica exacta del ResponsiveModalDemo usando componentes atómicos y datos JSON
        </p>
      </div>
      
      {/* Sección General usando atomic components */}
      <GeneralSectionDemo
        data={modalDummyData.roomInfo}
        onCopy={handleCopy}
        onExternal={handleExternal}
        onCloseSession={handleCloseSession}
      />
      
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">🎯 Componentes Atómicos Utilizados:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>SectionHeader</strong> - Header con icono y título</li>
          <li>• <strong>FieldGroup</strong> - Molécula label + display + botones</li>
          <li>• <strong>CopyButton</strong> - Botones de copiar/enlace externo</li>
          <li>• <strong>CodeDisplay</strong> - Display para código e inputs</li>
          <li>• <strong>FieldLabel</strong> - Labels consistentes</li>
          <li>• <strong>StatusBadge</strong> - Badge animado de estado</li>
          <li>• <strong>CloseSessionButton</strong> - Botón destructivo</li>
        </ul>
      </div>
    </div>
  );
};