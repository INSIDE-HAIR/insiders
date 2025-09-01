/**
 * ActionTooltip - Atomic Component
 * 
 * Tooltip IDÉNTICO estéticamente al original BulkActionTooltip.tsx
 * + Estado de loading con skeleton
 * Copiado exacto de: BulkActionTooltip.tsx líneas 84-107
 */

"use client";

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { Icons } from "@/src/components/shared/icons";
import { ActionTooltipProps } from "../types";

export const ActionTooltip: React.FC<ActionTooltipProps> = ({
  title,
  description,
  count,
  icon: Icon = Icons.Info,
  children,
  isLoading = false,
}) => {
  // Loading skeleton - mantiene estructura original
  if (isLoading) {
    return (
      <div className="animate-pulse">
        {children}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{children}</div>
        </TooltipTrigger>
        <TooltipContent side='top' className='max-w-sm'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Icon className='h-4 w-4' />
              <span className='font-semibold'>{title}</span>
            </div>
            <p className='text-sm text-muted-foreground'>{description}</p>
            {count !== undefined && (
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <Icons.Info className='h-3 w-3' />
                <span>
                  {count} elemento{count !== 1 ? "s" : ""} será
                  {count !== 1 ? "n" : ""} procesado{count !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

ActionTooltip.displayName = "ActionTooltip";