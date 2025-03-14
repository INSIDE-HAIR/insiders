"use client";
import { ReactNode } from "react";

interface CardContainerProps {
  children: ReactNode;
}

export function CardContainer({ children }: CardContainerProps) {
  return (
    <div className='border-2 border-black bg-black text-white rounded-none overflow-hidden shadow-lg hover:shadow-xl transition-shadow max-w-xs w-full'>
      {children}
    </div>
  );
}
