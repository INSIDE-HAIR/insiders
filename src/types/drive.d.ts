// Tipos para la funcionalidad de Drive y gestión de errores
import { User } from "./user";

export interface DriveErrorCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriveErrorReport {
  id: string;
  fileName: string;
  fileId?: string;
  message: string;
  fullName: string;
  email: string;
  status: "pending" | "in-progress" | "resolved";
  category?: string;
  categoryRef?: DriveErrorCategory;
  assignedTo?: string[];
  assignedUsers?: User[]; // Usuarios asignados completos (opcional)
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedById?: string;
  notes?: string;
}

export interface DriveErrorReminder {
  id: string;
  status: "pending" | "in-progress";
  frequency: "hourly" | "daily" | "weekly" | "monthly";
  interval: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lastSent?: string;
}

export interface DriveErrorReportConfig {
  id: string;
  recipients: string[];
  ccRecipients: string[];
  bccRecipients: string[];
  active: boolean;
  updatedAt: string;
}
