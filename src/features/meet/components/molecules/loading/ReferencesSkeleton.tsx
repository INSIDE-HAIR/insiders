import React from "react";
import { cn } from "@/src/lib/utils";
import { SkeletonBox } from "../../atoms/loading/SkeletonBox";

export interface ReferencesSkeletonProps {
  className?: string;
}

/**
 * Componente molecular ReferencesSkeleton
 * Skeleton específico para la sección Referencias
 * Simula la estructura de acordeones de Tags y Grupos
 * 
 * @example
 * <ReferencesSkeleton />
 */
export const ReferencesSkeleton: React.FC<ReferencesSkeletonProps> = ({
  className
}) => {
  const AccordionSkeleton = ({ title }: { title: string }) => (
    <div className="border border-gray-700 rounded-lg">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <SkeletonBox width="w-4" height="h-4" rounded="sm" />
          <SkeletonBox width="w-12" height="h-4" rounded="sm" />
          <SkeletonBox width="w-16" height="h-4" rounded="sm" />
        </div>
        <SkeletonBox width="w-4" height="h-4" rounded="sm" />
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-2", className)}>
      {/* Tags Skeleton */}
      <AccordionSkeleton title="Tags" />
      
      {/* Groups Skeleton */}
      <AccordionSkeleton title="Grupos" />
    </div>
  );
};