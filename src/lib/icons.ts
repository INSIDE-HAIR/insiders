import {
  ChevronDown,
  Code,
  Play,
  Image,
  Music,
  File,
  Frame,
  Video,
  Square,
  Type,
  Minus,
  ArrowUpDown,
  FileText,
  FolderGit2,
  Grid,
  LayoutGrid,
  PanelLeftClose,
  LayoutPanelTop,
  Lock,
  Plus,
  Search,
  Ban,
  Star,
  Heart,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Settings,
  User,
  Users,
  Bell,
  Home,
  Folder,
  Download,
  Upload,
  ExternalLink,
  Link,
  Bookmark,
  Save,
  Trash,
  Pencil,
  Edit,
  Share,
  Info,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Hash,
  List,
  ListChecks,
  CheckSquare,
  Circle,
  AlignLeft,
  TextIcon,
  ShapesIcon as Form,
  CalendarDays,
  ListOrdered,
  Radio,
  TextIcon as TextArea,
  MessageCircle,
} from "lucide-react";

import {
  FaGoogle,
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";

import { FaXTwitter } from "react-icons/fa6";

export const Icons = {
  ChevronDown,
  Code,
  Play,
  Image,
  Music,
  File,
  Frame,
  Video,
  Square,
  Type,
  Minus,
  ArrowUpDown,
  FileText,
  FolderGit2,
  Grid,
  LayoutGrid,
  PanelLeftClose,
  LayoutPanelTop,
  Lock,
  Plus,
  Search,
  Ban,
  Star,
  Heart,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Settings,
  User,
  Users,
  Bell,
  Home,
  Folder,
  Download,
  Upload,
  ExternalLink,
  Link,
  Bookmark,
  Save,
  Trash,
  Pencil,
  Edit,
  Share,
  Info,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Hash,
  List,
  ListChecks,
  CheckSquare,
  Circle,
  AlignLeft,
  Form,
  TextIcon,
  CalendarDays,
  ListOrdered,
  Radio,
  TextArea,
  // Social Media Icons
  Facebook: FaFacebookF,
  Linkedin: FaLinkedinIn,
  Google: FaGoogle,
  Twitter: FaXTwitter,
  Instagram: FaInstagram,
  WhatsApp: FaWhatsapp,
  MessageCircle,
} as const;

export type Icon = keyof typeof Icons;

// Icon categories for the block picker
export const iconCategories = {
  Formulario: [
    { name: "Form", icon: "Form" },
    { name: "Text Input", icon: "TextIcon" },
    { name: "Number", icon: "Hash" },
    { name: "Date", icon: "CalendarDays" },
    { name: "Select", icon: "ListOrdered" },
    { name: "Multiselect", icon: "ListChecks" },
    { name: "Checkbox", icon: "CheckSquare" },
    { name: "Radio", icon: "Radio" },
    { name: "Textarea", icon: "TextArea" },
  ],
  Navegación: [
    { name: "ArrowRight", icon: "ArrowRight" },
    { name: "ArrowLeft", icon: "ArrowLeft" },
    { name: "ArrowUp", icon: "ArrowUp" },
    { name: "ArrowDown", icon: "ArrowDown" },
    { name: "ChevronDown", icon: "ChevronDown" },
    { name: "ExternalLink", icon: "ExternalLink" },
    { name: "Link", icon: "Link" },
  ],
  Acciones: [
    { name: "Plus", icon: "Plus" },
    { name: "Minus", icon: "Minus" },
    { name: "Check", icon: "Check" },
    { name: "X", icon: "X" },
    { name: "Download", icon: "Download" },
    { name: "Upload", icon: "Upload" },
    { name: "Save", icon: "Save" },
    { name: "Trash", icon: "Trash" },
    { name: "Edit", icon: "Edit" },
    { name: "Share", icon: "Share" },
  ],
  Notificaciones: [
    { name: "Bell", icon: "Bell" },
    { name: "Info", icon: "Info" },
    { name: "AlertCircle", icon: "AlertCircle" },
    { name: "AlertTriangle", icon: "AlertTriangle" },
    { name: "CheckCircle", icon: "CheckCircle" },
    { name: "XCircle", icon: "XCircle" },
  ],
  Contenido: [
    { name: "File", icon: "File" },
    { name: "FileText", icon: "FileText" },
    { name: "Image", icon: "Image" },
    { name: "Video", icon: "Video" },
    { name: "Music", icon: "Music" },
    { name: "Code", icon: "Code" },
  ],
  Usuario: [
    { name: "User", icon: "User" },
    { name: "Users", icon: "Users" },
    { name: "Settings", icon: "Settings" },
    { name: "Star", icon: "Star" },
    { name: "Heart", icon: "Heart" },
    { name: "Bookmark", icon: "Bookmark" },
  ],
  Contacto: [
    { name: "Mail", icon: "Mail" },
    { name: "Phone", icon: "Phone" },
    { name: "MapPin", icon: "MapPin" },
    { name: "Calendar", icon: "Calendar" },
    { name: "Clock", icon: "Clock" },
  ],
};
