// src/lib/api.ts
import axios from "axios";
import { User } from "../types/user";

export async function getUsers(): Promise<User[]> {
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
