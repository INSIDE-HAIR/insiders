"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  useCalculatorStore,
  stepToPathMap,
} from "@/src/store/calculator-store";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Info } from "lucide-react";
import { shallow } from "zustand/shallow";

const CURRENT_PAGE_STEP = 3;

export default function CalculadoraPage() {
  const router = useRouter();
  const pathname = usePathname();
  const formData = useCalculatorStore((state) => ({
    total_expenses_no_vat: state.total_expenses_no_vat,
    total_team_hours: state.total_team_hours,
    total_income_no_vat: state.total_income_no_vat,
  }));
  const updateFormData = useCalculatorStore((state) => state.updateFormData);
  const nextStep = useCalculatorStore((state) => state.nextStep);
  const prevStep = useCalculatorStore((state) => state.prevStep);
  const currentStep = useCalculatorStore((state) => state.currentStep);
  const initializeStepFromPath = useCalculatorStore((state) => state.initializeStepFromPath);
  
  const { total_expenses_no_vat, total_team_hours, total_income_no_vat } = formData;

  useEffect(() => {
    if (pathname) {
      initializeStepFromPath(pathname);
    }
  }, [pathname, initializeStepFromPath]);

  useEffect(() => {
    const expectedPathForStoreStep = stepToPathMap[currentStep];
    if (
      expectedPathForStoreStep &&
      pathname &&
      pathname !== expectedPathForStoreStep
    ) {
      console.log(
        `[CalculadoraPage] Store step (${currentStep}) changed. Redirecting from ${pathname} to ${expectedPathForStoreStep}.`
      );
      router.push(expectedPathForStoreStep);
    }
  }, [currentStep, pathname, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = value.replace(/[^0-9.]/g, "");
    updateFormData({
      [name]:
        sanitizedValue === "" ? undefined : Number.parseFloat(sanitizedValue),
    });
  };

  const validateFields = (): boolean => {
    if (total_expenses_no_vat === undefined || total_expenses_no_vat < 0)
      return false;
    if (total_team_hours === undefined || total_team_hours <= 0) return false;
    if (total_income_no_vat === undefined || total_income_no_vat < 0)
      return false;
    return true;
  };

  const handleNext = () => {
    if (validateFields()) {
      nextStep(router);
    } else {
      alert("Por favor, completa todos los campos con valores válidos.");
    }
  };

  const handlePrev = () => {
    prevStep(router);
  };

  // --- CORRECCIÓN: Simplificar la lógica de renderizado ---
  if (!pathname || pathname !== stepToPathMap[CURRENT_PAGE_STEP]) {
    return <div className="text-center p-6">Cargando...</div>;
  }

  return (
    <div className="w-full max-w-lg p-8 space-y-6 bg-brand-gray-dark rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-center text-brand-white">
        Calcula tu Rentabilidad
      </h2>
      <div className="space-y-6">
        <div>
          <Label
            htmlFor="total_expenses_no_vat"
            className="text-sm font-medium text-gray-300"
          >
            Total gastos sin IVA (€)
          </Label>
          <Input
            id="total_expenses_no_vat"
            name="total_expenses_no_vat"
            type="number"
            placeholder="Ej: 2500"
            value={total_expenses_no_vat || ""}
            onChange={handleInputChange}
            className="bg-gray-800 border-gray-700 text-brand-white focus:ring-brand-accent"
            min="0"
            step="0.01"
          />
          <p className="mt-1 text-xs text-gray-400 flex items-start">
            <Info size={14} className="mr-1 mt-0.5 shrink-0" />
            Incluye todos los costos de operación de tu salón sin contar el IVA.
          </p>
        </div>
        <div>
          <Label
            htmlFor="total_team_hours"
            className="text-sm font-medium text-gray-300"
          >
            Total horas de todo el equipo
          </Label>
          <Input
            id="total_team_hours"
            name="total_team_hours"
            type="number"
            placeholder="Ej: 640"
            value={total_team_hours || ""}
            onChange={handleInputChange}
            className="bg-gray-800 border-gray-700 text-brand-white focus:ring-brand-accent"
            min="1"
            step="1"
          />
          <p className="mt-1 text-xs text-gray-400 flex items-start">
            <Info size={14} className="mr-1 mt-0.5 shrink-0" />
            Cantidad total de horas trabajadas por todo el personal en el
            período calculado.
          </p>
        </div>
        <div>
          <Label
            htmlFor="total_income_no_vat"
            className="text-sm font-medium text-gray-300"
          >
            Total ingresos sin IVA (€)
          </Label>
          <Input
            id="total_income_no_vat"
            name="total_income_no_vat"
            type="number"
            placeholder="Ej: 8000"
            value={total_income_no_vat || ""}
            onChange={handleInputChange}
            className="bg-gray-800 border-gray-700 text-brand-white focus:ring-brand-accent"
            min="0"
            step="0.01"
          />
          <p className="mt-1 text-xs text-gray-400 flex items-start">
            <Info size={14} className="mr-1 mt-0.5 shrink-0" />
            Total de ingresos generados por el salón sin contar el IVA.
          </p>
        </div>
      </div>
      <div className="flex justify-between pt-6">
        <Button
          onClick={handlePrev}
          variant="outline"
          className="border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-black"
        >
          Anterior
        </Button>
        <Button
          onClick={handleNext}
          className="bg-brand-accent text-brand-black hover:bg-opacity-80"
        >
          Calcular Resultados
        </Button>
      </div>
    </div>
  );
}
