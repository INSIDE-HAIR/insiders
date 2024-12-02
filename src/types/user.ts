// src/types/user.ts
import {
  User as PrismaUser,
  SalesField as PrismaSalesField,
  ClientField as PrismaClientField,
  ConsultingAndMentoringField as PrismaConsultingAndMentoringField,
  TrainingField as PrismaTrainingField,
  MarketingField as PrismaMarketingField,
} from "@prisma/client";

export interface User extends PrismaUser {
  salesFields: PrismaSalesField[];
  clientsFields: PrismaClientField[];
  consultingAndMentoringFields: PrismaConsultingAndMentoringField[];
  trainingsFields: PrismaTrainingField[];
  marketingFields: PrismaMarketingField[];
  isSelected?: boolean;
}
