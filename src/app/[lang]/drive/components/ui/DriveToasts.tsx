"use client";

import {
  toast,
  useToast,
  type Toast as ToastType,
} from "@/src/components/ui/use-toast";
import { ToastAction } from "@/src/components/ui/toast";

export { Toaster } from "@/src/components/ui/toaster";

export type NotificationType = "success" | "error" | "loading";

// Hook para usar notificaciones
export function useNotifications() {
  return {
    addNotification: (type: NotificationType, message: string): string => {
      const id = Date.now().toString();

      switch (type) {
        case "success":
          toast({
            id,
            variant: "success",
            title: "Success",
            description: message,
          });
          break;
        case "error":
          toast({
            id,
            variant: "error",
            title: "Error",
            description: message,
          });
          break;
        case "loading":
          toast({
            id,
            description: message,
            // Para loading no hay un tipo específico, usamos default
            // y podríamos agregar un spinner personalizado si lo necesitáramos
          });
          break;
        default:
          toast({
            id,
            description: message,
          });
      }

      return id;
    },

    dismissNotification: (id: string) => {
      toast({
        id,
        open: false,
      });
    },

    updateNotification: (
      id: string,
      type: NotificationType,
      message: string
    ): string => {
      // Primero cerramos la notificación anterior
      toast({
        id,
        open: false,
      });

      // Luego creamos una nueva con el mismo ID
      const newId = id;

      switch (type) {
        case "success":
          toast({
            id: newId,
            variant: "success",
            title: "Success",
            description: message,
          });
          break;
        case "error":
          toast({
            id: newId,
            variant: "error",
            title: "Error",
            description: message,
          });
          break;
        case "loading":
          toast({
            id: newId,
            description: message,
          });
          break;
        default:
          toast({
            id: newId,
            description: message,
          });
      }

      return newId;
    },
  };
}
