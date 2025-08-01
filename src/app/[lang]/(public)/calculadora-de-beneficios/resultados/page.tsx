"use client";

import { useCalculatorStore, stepToPathMap } from "@/src/store/calculator-store";
import { Button } from "@/src/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const CURRENT_PAGE_STEP = 4;

export default function ResultadosPage() {
  const router = useRouter();
  const pathname = usePathname();

  const {
    currentStep,
    full_name,
    email,
    phone_number,
    country_code,
    total_expenses_no_vat,
    total_team_hours,
    total_income_no_vat,
    expenses_per_hour,
    income_per_hour,
    profit_percentage,
    resetCalculator,
    initializeStepFromPath,
  } = useCalculatorStore();

  const [isCurrentPageStep, setIsCurrentPageStep] = useState(false);

  useEffect(() => {
    initializeStepFromPath(pathname);
  }, [pathname, initializeStepFromPath]);

  useEffect(() => {
    const expectedPath = stepToPathMap[currentStep];
    if (pathname !== expectedPath && expectedPath) {
      console.log(
        `[ResultadosPage] Path mismatch. Current: ${pathname}, Expected for step ${currentStep}: ${expectedPath}. Redirecting...`
      );
      router.push(expectedPath);
    } else if (currentStep === CURRENT_PAGE_STEP) {
      setIsCurrentPageStep(true);
      console.log("[ResultadosPage] Current step is correct for this page.");
    } else if (
      currentStep !== CURRENT_PAGE_STEP &&
      !expectedPath &&
      pathname === stepToPathMap[CURRENT_PAGE_STEP]
    ) {
      // This case might happen if store is reset but user is on results page.
      // Or if store step is somehow desynced and invalid.
      console.warn(
        `[ResultadosPage] Store step ${currentStep} is not ${CURRENT_PAGE_STEP} and no valid path in map. Forcing to step 1.`
      );
      router.push(stepToPathMap[1]);
    } else {
      setIsCurrentPageStep(false);
    }
  }, [currentStep, pathname, router]);


  const handleReset = () => {
    resetCalculator(router);
  };

  const getProfitColor = () => {
    if (
      profit_percentage === null ||
      profit_percentage === undefined ||
      !Number.isFinite(profit_percentage)
    )
      return "text-brand-white";
    return profit_percentage < 10 ? "text-red-500" : "text-green-500";
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || !Number.isFinite(value))
      return "Calculando...";
    return `${value.toFixed(2)} €`;
  };

  const formatPercentage = (value: number | undefined | null) => {
    if (value === undefined || value === null) return "Calculando...";
    if (value === Number.POSITIVE_INFINITY) return "∞ %";
    if (!Number.isFinite(value)) return "N/A %";
    return `${value.toFixed(2)} %`;
  };

  if (!isCurrentPageStep) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-brand-white bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-brand-cta-accent mb-4" />
        Cargando y redirigiendo si es necesario...
      </div>
    );
  }

  if (
    total_expenses_no_vat === undefined ||
    total_team_hours === undefined ||
    total_income_no_vat === undefined
  ) {
    return (
      <div className="w-full max-w-xl p-6 sm:p-8 space-y-6 bg-black rounded-lg shadow-xl text-brand-white text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">Datos incompletos</h2>
        <p className="text-gray-300">
          Parece que faltan algunos datos para calcular tus resultados. Por
          favor, comienza la calculadora desde el principio.
        </p>
        <Button
          onClick={handleReset}
          className="mt-4 bg-brand-cta-accent text-black hover:bg-opacity-80"
        >
          Ir al Inicio de la Calculadora
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl p-6 sm:p-8 space-y-6 bg-black rounded-lg shadow-xl text-brand-white">
      <h2 className="text-2xl sm:text-3xl font-bold text-center">
        {full_name
          ? `${full_name}, estos son tus resultados:`
          : "Tus Resultados de Rentabilidad"}
      </h2>

      <p className="text-center text-gray-300 text-sm sm:text-base">
        Estos son tus resultados de rentabilidad. Aquí puedes ver si tu
        peluquería está generando los márgenes esperados.
      </p>


      <div className="space-y-4 pt-4">
        <div className="p-4 bg-brand-gray-dark rounded-md">
          <h3 className="text-lg font-semibold text-gray-300">
            Tus Gastos/Hora:
          </h3>
          <p className="text-2xl font-bold text-brand-cta-accent">
            {formatCurrency(expenses_per_hour)}
          </p>
        </div>
        <div className="p-4 bg-brand-gray-dark rounded-md">
          <h3 className="text-lg font-semibold text-gray-300">
            Tus Ingresos/Hora:
          </h3>
          <p className="text-2xl font-bold text-brand-cta-accent">
            {formatCurrency(income_per_hour)}
          </p>
        </div>
        <div className="p-4 bg-brand-gray-dark rounded-md">
          <h3 className="text-lg font-semibold text-gray-300">
            Tus Beneficios:
          </h3>
          <p className={`text-2xl font-bold ${getProfitColor()}`}>
            {formatPercentage(profit_percentage)}
          </p>
        </div>
      </div>

      <p className="text-sm text-center text-gray-400 pt-4">
        Estos cálculos son estimaciones. Para un análisis financiero detallado,
        y profesional, puedes acceder a nuestra consultoría gratuita.
      </p>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
        <Button
          onClick={handleReset}
          variant="outline"
          className="w-full sm:w-auto border-brand-cta-accent text-brand-cta-accent hover:bg-brand-cta-accent hover:text-black"
        >
          Calcular de Nuevo
        </Button>
        <Button
          asChild
          className="w-full sm:w-auto bg-brand-cta-accent text-black hover:bg-opacity-80"
        >
          <Link
            href="https://calendly.com/equipo-insidesalons/sesion-de-consultoria-gratis"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ir a cita para analizar resultados con un consultor
          </Link>
        </Button>
      </div>
    </div>
  );
}
