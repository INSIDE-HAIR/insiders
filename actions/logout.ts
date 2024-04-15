"use server"
import { signOut } from "@/src/lib/actions/auth/auth";

export const logout = async () => {
  await signOut();
};