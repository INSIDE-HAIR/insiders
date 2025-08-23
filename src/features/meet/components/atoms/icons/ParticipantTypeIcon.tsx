import React from "react";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { cn } from "@/src/lib/utils";

export type ParticipantType = "signed_in" | "anonymous" | "phone";

export interface ParticipantTypeIconProps {
  type: ParticipantType;
  className?: string;
}

/**
 * Icono atómico para tipos de participante
 * signed_in: ShieldCheck, anonymous: User, phone: Phone
 * 
 * @example
 * <ParticipantTypeIcon type="signed_in" />
 * <ParticipantTypeIcon type="anonymous" className="h-4 w-4" />
 */
export const ParticipantTypeIcon: React.FC<ParticipantTypeIconProps> = ({
  type,
  className
}) => {
  
  const baseClasses = "h-3 w-3 text-primary";
  
  switch (type) {
    case "signed_in":
      return <ShieldCheckIcon className={cn(baseClasses, className)} />;
      
    case "anonymous":
      return (
        <svg className={cn(baseClasses, className)} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      );
      
    case "phone":
      return (
        <svg className={cn(baseClasses, className)} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
        </svg>
      );
      
    default:
      return <ShieldCheckIcon className={cn(baseClasses, className)} />;
  }
};