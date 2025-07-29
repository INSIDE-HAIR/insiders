"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

const SimpleWorkloadWidget: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          Carga Horaria por Consultor (Prueba)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          Widget de prueba funcionando correctamente
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleWorkloadWidget;