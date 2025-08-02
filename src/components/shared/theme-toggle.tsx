"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/src/components/ui/button";
import { Icons } from "@/src/components/shared/icons";
import { cn } from "@/src/lib/utils";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "ghost" | "outline" | "default";
}

export function ThemeToggle({ 
  className, 
  size = "sm", 
  variant = "ghost" 
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn("h-9 w-9 px-0", className)}
        disabled
      >
        <Icons.Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={cn(
        "h-9 w-9 px-0 hover:bg-primary hover:text-primary-foreground transition-all duration-200 relative overflow-hidden",
        className
      )}
    >
      <div className="relative w-4 h-4">
        {/* Sun Icon */}
        <Icons.Sun 
          className={cn(
            "h-4 w-4 absolute inset-0 transition-all duration-300 rotate-0 scale-100",
            theme === "dark" && "rotate-90 scale-0"
          )}
        />
        {/* Moon Icon */}
        <Icons.Moon 
          className={cn(
            "h-4 w-4 absolute inset-0 transition-all duration-300 rotate-90 scale-0", 
            theme === "dark" && "rotate-0 scale-100"
          )}
        />
      </div>
      <span className="sr-only">
        {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      </span>
    </Button>
  );
}