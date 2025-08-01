import React from 'react';
import { cn } from '@/src/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const spinnerVariants = cva('flex-col items-center justify-center', {
  variants: {
    show: {
      true: 'flex',
      false: 'hidden',
    },
  },
  defaultVariants: {
    show: true,
  },
});

const loaderVariants = cva('animate-spin text-primary', {
  variants: {
    size: {
      xs: 'size-3',
      sm: 'size-4', 
      md: 'size-6',
      lg: 'size-8',
      xl: 'size-12',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface SpinnerProps
  extends VariantProps<typeof spinnerVariants>,
    VariantProps<typeof loaderVariants> {
  className?: string;
  children?: React.ReactNode;
}

const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ size, show, children, className, ...props }, ref) => {
    return (
      <span 
        ref={ref}
        className={spinnerVariants({ show })}
        {...props}
      >
        <Loader2 className={cn(loaderVariants({ size }), className)} />
        {children}
      </span>
    );
  }
);

Spinner.displayName = 'Spinner';

export { Spinner, spinnerVariants, loaderVariants };