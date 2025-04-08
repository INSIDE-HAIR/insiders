"use client";

import { toast, useToast } from "@/src/components/ui/use-toast";
import { ToastAction } from "@/src/components/ui/toast";

export { Toaster } from "@/src/components/ui/toaster";

export type NotificationType = "success" | "error" | "loading";

// Mapa para almacenar referencias a los toasts por ID personalizado
const toastRefs = new Map<
  string,
  { dismiss: () => void; update: (props: any) => void }
>();

// Hook para usar notificaciones
export function useNotifications() {
  const addNotification = (type: NotificationType, message: string): string => {
    const customId = Date.now().toString();

    switch (type) {
      case "success":
        const successToast = toast({
          variant: "success",
          title: "Success",
          description: message,
        });
        toastRefs.set(customId, successToast);
        break;
      case "error":
        const errorToast = toast({
          variant: "error",
          title: "Error",
          description: message,
        });
        toastRefs.set(customId, errorToast);
        break;
      case "loading":
        const loadingToast = toast({
          description: message,
          // Para loading no hay un tipo específico, usamos default
        });
        toastRefs.set(customId, loadingToast);
        break;
      default:
        const defaultToast = toast({
          description: message,
        });
        toastRefs.set(customId, defaultToast);
    }

    return customId;
  };

  const dismissNotification = (id: string) => {
    const toastRef = toastRefs.get(id);
    if (toastRef) {
      toastRef.dismiss();
      toastRefs.delete(id);
    }
  };

  const updateNotification = (
    id: string,
    type: NotificationType,
    message: string
  ): string => {
    // Primero cerramos la notificación anterior
    dismissNotification(id);

    // Luego creamos una nueva con el mismo ID
    return addNotification(type, message);
  };

  return {
    addNotification,
    dismissNotification,
    updateNotification,
  };
}
