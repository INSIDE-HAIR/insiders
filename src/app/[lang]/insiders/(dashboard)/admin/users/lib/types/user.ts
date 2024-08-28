import { UserRole } from "@prisma/client";

// Interfaz genérica para los campos personalizados
export interface Field {
  id: string;
  holdedFieldName: string;
  value: string;
  options: string[];
  type: string;
  categoryId?: string;
  subCategoryId?: string;
  updatedAt: Date;
  createdAt: Date | null;
}

export type FieldType =
  | "clientsFields"
  | "salesFields"
  | "consultingAndMentoringFields"
  | "marketingFields"
  | "trainingsFields"
  | "creativitiesFields";

// Interfaz para el usuario del servicio
export interface ServiceUser {
  id: string;
  name: string | null;
  lastName: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  contactNumber: string | null;
  terms: boolean;
  role: UserRole;
  isTwoFactorEnabled: boolean;
  holdedId: string | null;
  createdHoldedSyncAt: Date | null;
  lastHoldedSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
  salesFields: Field[];
  clientsFields: Field[];
  consultingAndMentoringFields: Field[];
  trainingsFields: Field[];
  marketingFields: Field[];
  creativitiesFields: Field[];
  customFields: Field[];
  // Añade cualquier otro campo que necesites de tu modelo User
}
