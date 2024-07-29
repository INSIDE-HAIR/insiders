"use server";
import { signOut } from "@/src/lib/actions/auth/config/auth";
import { useRouter } from "next/navigation";

export const logout = async () => {
  try {
    await signOut();
    return { success: "Cierre de sesión exitoso." };
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return {
      error:
        "Hubo un problema al cerrar sesión. Por favor, inténtalo de nuevo más tarde.",
    };
  }
};
