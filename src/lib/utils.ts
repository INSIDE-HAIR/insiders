import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina múltiples clases CSS usando clsx y tailwind-merge
 * @param inputs Clases CSS a combinar
 * @returns Clases CSS combinadas y optimizadas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
