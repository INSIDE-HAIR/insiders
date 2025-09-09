import { LucideIcon } from "lucide-react";
import { Icons } from "@/src/components/shared/icons";

// Tipos existentes mejorados
export type IconKeys = keyof typeof Icons;

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: NavItem[];
}

export interface Project {
  name: string;
  url: string;
  icon: LucideIcon;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
}

export interface Team {
  name: string;
  logo: LucideIcon;
  plan: string;
  routes: Route[];
}

export interface Route {
  id: string;
  icon: IconKeys;
  path: string;
  translations: {
    en: string;
    es: string;
  };
}
