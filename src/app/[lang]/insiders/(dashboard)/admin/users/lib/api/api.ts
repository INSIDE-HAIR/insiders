// src/app/users/lib/api/api.ts
import axios from "axios";
import { ServiceUser } from "../types/user";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/",
});

export async function getUsers(): Promise<ServiceUser[]> {
  try {
    const response = await apiClient.get("users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function syncUsersWithHolded(): Promise<void> {
  try {
    await apiClient.post("users/sync");
  } catch (error) {
    console.error("Error syncing users with Holded:", error);
    throw error;
  }
}
