// src/types/user.ts
import {
  User as PrismaUser,
  SalesField as PrismaSalesField,
  ClientField as PrismaClientField,
  ConsultingAndMentoringField as PrismaConsultingAndMentoringField,
  TrainingField as PrismaTrainingField,
  MarketingField as PrismaMarketingField,
  CreativityField as PrismaCreativityField,
} from "@prisma/client";

export interface Field {
  holdedFieldName: string;
  es: string;
  en: string;
  value: string;
}

export interface User extends PrismaUser {
  salesFields: PrismaSalesField[];
  clientsFields: PrismaClientField[];
  consultingAndMentoringFields: PrismaConsultingAndMentoringField[];
  trainingsFields: PrismaTrainingField[];
  marketingFields: PrismaMarketingField[];
  creativitiesFields: PrismaCreativityField[];
  isSelected?: boolean;
}
