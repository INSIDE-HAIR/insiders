"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

type HoldedContextType = {
  holdedId: string | null | undefined;
  insidersId: string | null | undefined;
  setHoldedId: (id: string | null | undefined) => void;
  setInsidersId: (id: string | null | undefined) => void;
};

const HoldedContext = createContext<HoldedContextType | undefined>(undefined);

export const HoldedProvider = ({ children }: { children: ReactNode }) => {
  const [holdedId, setHoldedId] = useState<string | null | undefined>(null);
  const [insidersId, setInsidersId] = useState<string | null | undefined>(null);

  return (
    <HoldedContext.Provider value={{ holdedId, insidersId, setHoldedId, setInsidersId }}>
      {children}
    </HoldedContext.Provider>
  );
};

export const useHolded = () => {
  const context = useContext(HoldedContext);
  if (context === undefined) {
    throw new Error('useHolded must be used within a HoldedProvider');
  }
  return context;
};
