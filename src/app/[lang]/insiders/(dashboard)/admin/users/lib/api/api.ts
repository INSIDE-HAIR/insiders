// src/app/users/lib/api/api.ts
import axios from "axios";
import { ServiceUser } from "../types/user";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
});

export async function getUsers(): Promise<ServiceUser[]> {
  try {
    const response = await apiClient.get("/api/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function syncUsersWithHolded(): Promise<void> {
  try {
    await apiClient.post("/api/users/sync");
  } catch (error) {
    console.error("Error syncing users with Holded:", error);
    throw error;
  }
}
