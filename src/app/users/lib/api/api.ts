// src/app/users/lib/api/api.ts
import axios from "axios";
import { ServiceUser } from "../types/user";

export async function getUsers(): Promise<ServiceUser[]> {
  try {
    const response = await axios.get("/api/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function syncUsersWithHolded(): Promise<void> {
  try {
    await axios.post("/api/users/sync");
  } catch (error) {
    console.error("Error syncing users with Holded:", error);
    throw error;
  }
}
