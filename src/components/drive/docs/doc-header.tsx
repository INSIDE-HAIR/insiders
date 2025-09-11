import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils/utils";

interface DocHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: ReactNode;
  className?: string;
  maxWidth?: boolean;
}

export function DocHeader({
  title,
  description,
  icon: Icon,
  children,
  className,
  maxWidth,
}: DocHeaderProps) {
  return (
    <div className='border-b border-zinc-700 px-8 py-6'>
      <div className={cn("mx-auto ", maxWidth ? "container" : "")}>
        <h1 className='text-3xl font-bold tracking-tight text-white flex items-center gap-3'>
          {Icon && <Icon className='h-8 w-8 text-primary' />}
          {title}
        </h1>
        {description && (
          <p className='mt-2 text-lg text-zinc-400'>{description}</p>
        )}
        {children}
      </div>
    </div>
  );
}
