import { FaGoogle, FaGithub } from "react-icons/fa";
import {
  Home,
  Users,
  LineChart,
  Mail,
  Workflow,
  Database,
  Palette,
  Rocket,
  Settings,
  Package,
  Files,
  LucideIcon,
  Loader2,
} from "lucide-react";

export type Icon = LucideIcon | React.ComponentType<any>;

export const Icons = {
  HomeIcon: Home,
  UsersIcon: Users,
  LineChartIcon: LineChart,
  PackageIcon: Package,
  EnvelopeClosedIcon: Mail,
  FilesIcon: Files,
  WorkflowIcon: Workflow,
  DatabaseIcon: Database,
  PaletteIcon: Palette,
  RocketIcon: Rocket,
  SettingsIcon: Settings,
  GitHubIcon: FaGithub,
  GoogleIcon: FaGoogle,
  SpinnerIcon: Loader2,
} as const;

export type IconKeys = keyof typeof Icons;
