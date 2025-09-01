/**
 * StatusBadge - Atomic Component
 * 
 * Badge IDÉNTICO estéticamente al original en columns.tsx
 * + Estado de loading con skeleton
 * Copiado exacto de: columns.tsx línea 498-500
 */

"use client";

import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { StatusBadgeProps } from "../types";

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  isLoading = false,
}) => {
  // Loading skeleton - mantiene mismo tamaño que original
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-5 w-16 bg-muted-foreground/20 rounded-sm"></div>
      </div>
    );
  }

  // Copiado EXACTO de columns.tsx getEventStatus
  const statusLabels = {
    upcoming: "Próximo",
    ongoing: "En curso", 
    past: "Pasado"
  };

  return (
    <Badge className='bg-muted-foreground text-card border-card-foreground/20 font-semibold shadow-sm hover:bg-muted-foreground/90 transition-colors'>
      {statusLabels[status]}
    </Badge>
  );
};

StatusBadge.displayName = "StatusBadge";