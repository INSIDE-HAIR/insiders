import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface CalculatorFormData {
  // Step 2: User data
  full_name?: string;
  email?: string;
  phone_number?: string;
  country_code?: string;
  
  // Step 3: Calculator data
  total_expenses_no_vat?: number;
  total_team_hours?: number;
  total_income_no_vat?: number;
  
  // Calculated values
  expenses_per_hour?: number;
  income_per_hour?: number;
  profit_percentage?: number;
}

interface CalculatorStore extends CalculatorFormData {
  currentStep: number;
  updateFormData: (data: Partial<CalculatorFormData>) => void;
  nextStep: (router: AppRouterInstance) => void;
  prevStep: (router: AppRouterInstance) => void;
  goToStep: (step: number, router: AppRouterInstance) => void;
  initializeStepFromPath: (pathname: string) => void;
  reset: () => void;
  resetCalculator: (router: AppRouterInstance) => void;
  calculateResults: () => void;
}

export const stepToPathMap: Record<number, string> = {
  1: '/calculadora-de-beneficios',
  2: '/calculadora-de-beneficios/datos-usuario',
  3: '/calculadora-de-beneficios/calculadora',
  4: '/calculadora-de-beneficios/resultados',
};

const pathToStepMap: Record<string, number> = {
  '/calculadora-de-beneficios': 1,
  '/calculadora-de-beneficios/datos-usuario': 2,
  '/calculadora-de-beneficios/calculadora': 3,
  '/calculadora-de-beneficios/resultados': 4,
};

const getStepFromPath = (pathname: string): number => {
  // Handle language prefixes (e.g., /es/calculadora-de-beneficios or /en/calculadora-de-beneficios)
  const pathWithoutLang = pathname.replace(/^\/[a-z]{2}/, '');
  return pathToStepMap[pathWithoutLang] || 1;
};

export const useCalculatorStore = create<CalculatorStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentStep: 1,
    full_name: undefined,
    email: undefined,
    phone_number: undefined,
    country_code: undefined,
    total_expenses_no_vat: undefined,
    total_team_hours: undefined,
    total_income_no_vat: undefined,
    expenses_per_hour: undefined,
    income_per_hour: undefined,
    profit_percentage: undefined,

    // Actions
    updateFormData: (data: Partial<CalculatorFormData>) => {
      set((state) => ({ ...state, ...data }));
    },

    calculateResults: () => {
      const state = get();
      if (state.total_expenses_no_vat && state.total_team_hours && state.total_income_no_vat) {
        const expenses_per_hour = state.total_expenses_no_vat / state.total_team_hours;
        const income_per_hour = state.total_income_no_vat / state.total_team_hours;
        const profit_margin = state.total_income_no_vat - state.total_expenses_no_vat;
        const profit_percentage = (profit_margin / state.total_income_no_vat) * 100;
        
        set({
          expenses_per_hour,
          income_per_hour,
          profit_percentage,
        });
      }
    },

    nextStep: (router: AppRouterInstance) => {
      const { currentStep, calculateResults } = get();
      
      // If moving from step 3 to 4, calculate results
      if (currentStep === 3) {
        calculateResults();
      }
      
      const nextStep = Math.min(currentStep + 1, 4);
      set({ currentStep: nextStep });
      
      const nextPath = stepToPathMap[nextStep];
      if (nextPath) {
        // Preserve language prefix if present
        const currentPath = window.location.pathname;
        const langMatch = currentPath.match(/^\/[a-z]{2}/);
        const finalPath = langMatch ? `${langMatch[0]}${nextPath}` : nextPath;
        router.push(finalPath);
      }
    },

    prevStep: (router: AppRouterInstance) => {
      const { currentStep } = get();
      const prevStep = Math.max(currentStep - 1, 1);
      set({ currentStep: prevStep });
      
      const prevPath = stepToPathMap[prevStep];
      if (prevPath) {
        // Preserve language prefix if present
        const currentPath = window.location.pathname;
        const langMatch = currentPath.match(/^\/[a-z]{2}/);
        const finalPath = langMatch ? `${langMatch[0]}${prevPath}` : prevPath;
        router.push(finalPath);
      }
    },

    goToStep: (step: number, router: AppRouterInstance) => {
      const targetStep = Math.max(1, Math.min(step, 4));
      set({ currentStep: targetStep });
      
      const targetPath = stepToPathMap[targetStep];
      if (targetPath) {
        // Preserve language prefix if present
        const currentPath = window.location.pathname;
        const langMatch = currentPath.match(/^\/[a-z]{2}/);
        const finalPath = langMatch ? `${langMatch[0]}${targetPath}` : targetPath;
        router.push(finalPath);
      }
    },

    initializeStepFromPath: (pathname: string) => {
      const stepFromPath = getStepFromPath(pathname);
      const { currentStep } = get();
      
      if (stepFromPath !== currentStep) {
        set({ currentStep: stepFromPath });
      }
    },

    reset: () => {
      set({
        currentStep: 1,
        full_name: undefined,
        email: undefined,
        phone_number: undefined,
        country_code: undefined,
        total_expenses_no_vat: undefined,
        total_team_hours: undefined,
        total_income_no_vat: undefined,
        expenses_per_hour: undefined,
        income_per_hour: undefined,
        profit_percentage: undefined,
      });
    },

    resetCalculator: (router: AppRouterInstance) => {
      const { reset } = get();
      reset();
      
      const firstPath = stepToPathMap[1];
      if (firstPath) {
        // Preserve language prefix if present
        const currentPath = window.location.pathname;
        const langMatch = currentPath.match(/^\/[a-z]{2}/);
        const finalPath = langMatch ? `${langMatch[0]}${firstPath}` : firstPath;
        router.push(finalPath);
      }
    },
  }))
);