"use client";

import { shallow } from "zustand/shallow";
import { redirect } from "next/navigation";
import { useEffect } from "react";

import { useCalculatorStore } from "@/stores/calculator";
import { Steps } from "@/src/components/calculadora-de-beneficios/steps";
import { StepContent } from "@/src/components/calculadora-de-beneficios/step-content";

export default function CalculadoraDeBeneficiosPage({
  searchParams,
}: {
  searchParams: { step?: string };
}) {
  const { nextStep, initializeStepFromPath, currentStep, goToStep } =
    useCalculatorStore(
      // Added goToStep
      (state) => ({
        nextStep: state.nextStep,
        initializeStepFromPath: state.initializeStepFromPath,
        currentStep: state.currentStep,
        goToStep: state.goToStep, // Added goToStep
      }),
      shallow // Add shallow equality checker
    );

  useEffect(() => {
    initializeStepFromPath(searchParams.step);
  }, [searchParams.step, initializeStepFromPath]);

  if (!currentStep) {
    redirect("/calculadora-de-beneficios/1");
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Calculadora de Benefícios{" "}
          <a className="text-blue-600" href="https://nextjs.org">
            {/* Next.js! */}
          </a>
        </h1>

        <Steps currentStep={currentStep} goToStep={goToStep} />

        <div className="w-full">
          <StepContent currentStep={currentStep} nextStep={nextStep} />
        </div>
      </main>
    </div>
  );
}
