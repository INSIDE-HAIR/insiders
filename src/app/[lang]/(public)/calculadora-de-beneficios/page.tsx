"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { useCalculatorStore, stepToPathMap } from "@/src/store/calculator-store";
import { shallow } from "zustand/shallow";

const CURRENT_PAGE_STEP = 1;

export default function CalculadoraDeBeneficiosPage() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    nextStep,
    currentStep,
    initializeStepFromPath,
  } = useCalculatorStore(
    (state) => ({
      nextStep: state.nextStep,
      currentStep: state.currentStep,
      initializeStepFromPath: state.initializeStepFromPath,
    }),
    shallow
  );

  useEffect(() => {
    initializeStepFromPath(pathname);
  }, [pathname, initializeStepFromPath]);

  useEffect(() => {
    const expectedPathForStoreStep = stepToPathMap[currentStep];
    if (expectedPathForStoreStep && pathname !== expectedPathForStoreStep) {
      console.log(
        `[CalculadoraPage] Store step (${currentStep}) changed. Redirecting from ${pathname} to ${expectedPathForStoreStep}.`
      );
      router.push(expectedPathForStoreStep);
    }
  }, [currentStep, pathname, router]);

  const handleNext = () => {
    nextStep(router);
  };

  if (pathname !== stepToPathMap[CURRENT_PAGE_STEP]) {
    return <div className="text-center p-6">Cargando...</div>;
  }

  return (
    <div className="w-full max-w-2xl p-8 space-y-8 bg-brand-gray-dark rounded-lg shadow-xl">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-brand-white">
          Calculadora de Beneficios
        </h1>
        <p className="text-xl text-gray-300">
          Descubre la rentabilidad real de tu salón de belleza
        </p>
        <p className="text-gray-400">
          Una herramienta gratuita para analizar tus números y mejorar tu negocio
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-brand-white mb-4">
            ¿Qué descubrirás?
          </h2>
          <ul className="space-y-2 text-gray-300">
            <li>• Tu margen de beneficio real</li>
            <li>• Coste por hora de trabajo</li>
            <li>• Rentabilidad por empleado</li>
            <li>• Recomendaciones personalizadas</li>
          </ul>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-brand-white mb-4">
            Proceso simple en 3 pasos:
          </h2>
          <ol className="space-y-2 text-gray-300">
            <li>1. Completa tus datos básicos</li>
            <li>2. Introduce los números de tu salón</li>
            <li>3. Recibe tu análisis personalizado</li>
          </ol>
        </div>
      </div>

      <div className="flex justify-center pt-6">
        <Button
          onClick={handleNext}
          className="bg-brand-accent text-brand-black hover:bg-opacity-80"
          size="lg"
        >
          Comenzar Cálculo
        </Button>
      </div>
    </div>
  );
}
