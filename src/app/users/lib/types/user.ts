import { UserRole } from "@prisma/client";

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
  salesFields: SalesField[];
  clientsFields: ClientField[];
  consultingAndMentoringFields: ConsultingAndMentoringField[];
  trainingsFields: TrainingField[];
  marketingFields: MarketingField[];
  creativitiesFields: CreativityField[];
  customFields: CustomField[];
  // Añade cualquier otro campo que necesites de tu modelo User
}

// Definir las interfaces para los campos específicos
interface SalesField {
  id: string;
  holdedFieldName: string;
  es: string;
  en: string;
  value: string;
  options: string[];
  type: string;
  categoryId?: string;
  categoryName?: string;
  subCategoryId?: string;
  subCategoryName?: string;
  updatedAt: Date;
  createdAt: Date | null;
}

// Repite el mismo patrón para ClientField, ConsultingAndMentoringField, etc.

interface CustomField {
  id: string;
  holdedFieldName: string;
  es: string;
  en: string;
  value: string;
  options: string[];
  type: string;
  categoryId?: string;
  categoryName?: string;
  subCategoryId?: string;
  subCategoryName?: string;
  updatedAt: Date;
  createdAt: Date | null;
}

interface CreativityField {
  id: string;
  holdedFieldName: string;
  es: string;
  en: string;
  value: string;
  options: string[];
  type: string;
  categoryId?: string;
  categoryName?: string;
  subCategoryId?: string;
  subCategoryName?: string;
  updatedAt: Date;
  createdAt: Date | null;
}

interface TrainingField {
  id: string;
  holdedFieldName: string;
  es: string;
  en: string;
  value: string;
  options: string[];
  type: string;
  categoryId?: string;
  categoryName?: string;
  subCategoryId?: string;
  subCategoryName?: string;
  updatedAt: Date;
  createdAt: Date | null;
}

interface MarketingField {
  id: string;
  holdedFieldName: string;
  es: string;
  en: string;
  value: string;
  options: string[];
  type: string;
  categoryId?: string;
  categoryName?: string;
  subCategoryId?: string;
  subCategoryName?: string;
  updatedAt: Date;
  createdAt: Date | null;
}

interface ConsultingAndMentoringField {
  id: string;
  holdedFieldName: string;
  es: string;
  en: string;
  value: string;
  options: string[];
  type: string;
  categoryId?: string;
  categoryName?: string;
  subCategoryId?: string;
  subCategoryName?: string;
  updatedAt: Date;
  createdAt: Date | null;
}

interface ClientField {
  id: string;
  holdedFieldName: string;
  es: string;
  en: string;
  value: string;
  options: string[];
  type: string;
  categoryId?: string;
  categoryName?: string;
  subCategoryId?: string;
  subCategoryName?: string;
  updatedAt: Date;
  createdAt: Date | null;
}
