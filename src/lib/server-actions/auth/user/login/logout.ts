"use server";
import { signOut } from "@/src/lib/server-actions/auth/config/auth";

export const logout = async () => {
  await signOut();
};
