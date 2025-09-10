"use client";
import React, {
  Fragment,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { MapIcon, InboxIcon } from "@heroicons/react/24/outline";
import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { Map as LucideMapIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { toast, Toaster } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { useTranslations } from "@/src/context/TranslationContext";
import { DynamicPage, Template } from "@prisma/client";
import {
  Copy,
  Eye,
  Lock,
  Pencil,
  Trash,
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  MoveHorizontal,
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  Edit,
  Loader2,
  FileText,
  Globe,
  Plus,
} from "lucide-react";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { Badge } from "@/src/components/ui/badge";
import { Info } from "lucide-react";
import { Switch } from "@/src/components/ui/switch";
import { ChipInput as TagInput } from "@/src/components/ui/chip-input";
import { SeoProgress } from "@/src/components/ui/seo-progress";
import { Progress } from "@/src/components/ui/progress";
import { cn } from "@/src/lib/utils";
import { MoveToModal } from "./components/MoveToModal";
import { AccessControlModule } from "./components/AccessControlModule";

type Page = DynamicPage & {
  children?: Page[];
  order: number;
  status: PageStatus;
  indexable: boolean;
  showInMenu: boolean;
  tags: string[];
};

const GroupSchema = z.object({
  name: z.enum(["INSIDERS", "TONY&GUY", "Josep Pons", "Salón TORO"]),
  tags: z.array(z.string()),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const PageStatus = {
  draft: "draft",
  published: "published",
  deleted: "deleted",
} as const;

type PageStatus = (typeof PageStatus)[keyof typeof PageStatus];

const FormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "Title is required" }),
  slug: z.string().optional(),
  content: z.string().optional(),
  lang: z.string(),
  parentId: z.string().nullable(),
  author: z.string(),
  template: z.nativeEnum(Template),
  status: z.nativeEnum(PageStatus).default("draft"),
  indexable: z.boolean().default(true),
  showInMenu: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  level: z.number().min(1, { message: "Level must be at least 1." }),
  order: z.number().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaImage: z.string().optional(),
});

type FormData = z.infer<typeof FormSchema>;
type Group = z.infer<typeof GroupSchema>;

function generateSlug(title: string): string {
  return title
    .normalize("NFD") // Normalizar caracteres Unicode
    .replace(/[\u0300-\u036f]/g, "") // Remover diacríticos
    .toLowerCase() // Convertir a minúsculas
    .replace(/[^a-z0-9]+/g, "-") // Reemplazar caracteres no alfanuméricos con guiones
    .replace(/^-+|-+$/g, ""); // Remover guiones al inicio y final
}

interface DeleteDialogState {
  isOpen: boolean;
  hasChildren: boolean;
  childCount: number;
  pageToDelete: Page | null;
}

interface MoveToModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (targetParentId: string | null) => void;
  pages: Page[];
  currentPage: Page | null;
}

interface PageCreatorProps {}

// Función para calcular el ancho aproximado en píxeles
function calculatePixelWidth(text: string): number {
  if (typeof window === "undefined") return 0;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return 0;
  context.font = "16px Arial"; // Fuente estándar de Google
  return context.measureText(text).width;
}

export default function PageCreator({}) {
  const t = useTranslations("PageCreator");
  const a = useTranslations("PageCreator.actions");
  const s = useTranslations("PageCreator.search");
  const ta = useTranslations("PageCreator.table");
  const m = useTranslations("PageCreator.messages");
  const d = useTranslations("PageCreator.deleteDialog");
  const f = useTranslations("PageCreator.form");
  const e = useTranslations("PageCreator.errors");

  const router = useRouter();

  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreatingSubpage, setIsCreatingSubpage] = useState(false);
  const [deleteDialogState, setDeleteDialogState] = useState<DeleteDialogState>(
    {
      isOpen: false,
      hasChildren: false,
      childCount: 0,
      pageToDelete: null,
    }
  );
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<PageStatus>("published");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAccessControlOpen, setIsAccessControlOpen] = useState(false);
  const [isMoveToModalOpen, setIsMoveToModalOpen] = useState(false);
  const [pageToMove, setPageToMove] = useState<Page | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [pageCountByStatus, setPageCountByStatus] = useState<
    Record<PageStatus, number>
  >({
    published: 0,
    draft: 0,
    deleted: 0,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

  // Función para contar páginas por estado
  const getPageCountByStatus = useCallback(
    (status: PageStatus) => {
      return pageCountByStatus[status] || 0;
    },
    [pageCountByStatus]
  );

  // Función para cargar los conteos de páginas por estado
  const fetchPageCounts = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/pages/counts?search=${search}&tags=${selectedTags.join(",")}`
      );
      if (!response.ok) throw new Error("Failed to fetch page counts");
      const data = await response.json();
      setPageCountByStatus(data);
    } catch (error) {
      console.error("Error loading page counts:", error);
    }
  }, [search, selectedTags]);

  // Función para cargar las páginas del estado seleccionado
  const fetchPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams({
        search,
        status: selectedStatus,
        tags: selectedTags.join(","),
      });

      const response = await fetch(`/api/pages?${searchParams}`);
      if (!response.ok) throw new Error("Failed to fetch pages.");
      const data = await response.json();
      setPages(data);
    } catch (error) {
      console.error("Error loading pages:", error);
      toast.error(m("errorLoadingPages"));
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedStatus, selectedTags, m]);

  // Cargar los conteos de páginas al iniciar y cuando cambien los criterios de búsqueda
  useEffect(() => {
    fetchPageCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedTags]);

  // Cargar las páginas cuando cambien los criterios de búsqueda o el estado seleccionado
  useEffect(() => {
    fetchPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedStatus, selectedTags]);

  const renderTemplateOptions = () => {
    return Object.values(Template)
      .filter((template) => template !== "custom")
      .map((template) => (
        <SelectItem key={template} value={template}>
          {template}
        </SelectItem>
      ));
  };

  const organizePages = (pages: Page[]): Page[] => {
    const pageMap = new Map<string, Page>();
    const rootPages: Page[] = [];

    // Primero, crear el mapa de páginas
    pages.forEach((page) => {
      pageMap.set(page.id, { ...page, children: [] });
    });

    // Luego, organizar la jerarquía
    pageMap.forEach((page) => {
      if (page.parentId) {
        const parent = pageMap.get(page.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(page);
          // Ordenar los hijos por el campo order
          parent.children.sort((a, b) => a.order - b.order);
        }
      } else {
        rootPages.push(page);
      }
    });

    // Ordenar las páginas raíz por el campo order
    return rootPages.sort((a, b) => a.order - b.order);
  };

  const handleViewPage = (page: Page) => {
    router.push(`/${page.fullPath}`);
  };

  const handleDuplicatePage = async (page: Page) => {
    if (!page.isEditable) {
      toast.error(m("pageNotEditableMessage"));
      return;
    }

    setIsLoading(true);
    try {
      // Obtener el orden máximo actual
      const orderResponse = await fetch(
        `/api/pages/maxOrder?parentId=${page.parentId || "root"}`
      );
      if (!orderResponse.ok) {
        throw new Error("Failed to get max order");
      }
      const { maxOrder } = await orderResponse.json();

      // Validar y obtener un nuevo slug único
      const validateResponse = await fetch("/api/pages/validate-slug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseSlug: page.slug
            .replace(/-(?:draft|deleted)$/, "")
            .replace(/-copy(?:-\d+)?$/, ""),
          parentId: page.parentId || "root",
          excludeId: page.id,
        }),
      });

      if (!validateResponse.ok) {
        throw new Error("Failed to validate slug");
      }

      const { slug: newSlug } = await validateResponse.json();

      // Crear la nueva página
      const newPage = {
        title: `${page.title} (Copy)`,
        content: page.content
          ? JSON.stringify({ body: JSON.parse(page.content).body })
          : "",
        slug: newSlug,
        lang: page.lang,
        parentId: page.parentId,
        level: page.level,
        status: "draft" as const,
        indexable: page.indexable,
        showInMenu: page.showInMenu,
        tags: page.tags || [],
        author: page.author,
        template: page.template,
        order: maxOrder + 1,
      };

      const createResponse = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPage),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || "Failed to duplicate page");
      }

      await fetchPages();
      toast.success(m("duplicateSuccess"));
    } catch (error: any) {
      console.error("Error duplicating page:", error);
      toast.error(error.message || m("duplicateError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveUp = async (page: Page) => {
    if (!page.isEditable) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/pages/${page.id}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "moveUp" }),
      });

      if (!response.ok) throw new Error("Failed to move page up");
      await fetchPages();
      toast.success(m("moveSuccess"));
    } catch (error) {
      console.error("Error moving page up:", error);
      toast.error(m("moveError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveDown = async (page: Page) => {
    if (!page.isEditable) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/pages/${page.id}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "moveDown" }),
      });

      if (!response.ok) throw new Error("Failed to move page down");
      await fetchPages();
      toast.success(m("moveSuccess"));
    } catch (error) {
      console.error("Error moving page down:", error);
      toast.error(m("moveError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveLeft = async (page: Page) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/pages/${page.id}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "moveLeft" }),
      });

      if (!response.ok) throw new Error("Failed to move page left");
      await fetchPages();
      toast.success(m("moveSuccess", { title: page.title }));
    } catch (error) {
      toast.error(m("moveError", { title: page.title }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveRight = async (page: Page) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/pages/${page.id}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "moveRight" }),
      });

      if (!response.ok) throw new Error("Failed to move page right");
      await fetchPages();
      toast.success(m("moveSuccess", { title: page.title }));
    } catch (error) {
      toast.error(m("moveError", { title: page.title }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakeRoot = async (page: Page) => {
    if (!page.isEditable || !page.parentId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/pages/${page.id}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "makeRoot" }),
      });

      if (!response.ok) throw new Error("Failed to make page root");
      await fetchPages();
      toast.success(m("moveSuccess"));
    } catch (error) {
      console.error("Error making page root:", error);
      toast.error(m("moveError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveTo = (page: Page) => {
    setPageToMove(page);
    setIsMoveToModalOpen(true);
  };

  const handleDeleteConfirm = (page: Page) => {
    setDeleteDialogState({
      isOpen: true,
      hasChildren: !!(page.children && page.children.length > 0),
      childCount: page.children ? page.children.length : 0,
      pageToDelete: page,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(pages.map((page) => page.id));
      setSelectedPages(newSelected);
    } else {
      setSelectedPages(new Set());
    }
  };

  const handleSelectOne = (pageId: string) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageId)) {
      newSelected.delete(pageId);
    } else {
      newSelected.add(pageId);
    }
    setSelectedPages(newSelected);
  };

  const handleBulkAction = async (
    action: "draft" | "published" | "deleted"
  ) => {
    if (selectedPages.size === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/pages/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedPages),
          action,
        }),
      });

      if (!response.ok) throw new Error("Failed to update pages");
      await fetchPages();
      setSelectedPages(new Set());
      toast.success(m("bulkUpdateSuccess"));
    } catch (error) {
      console.error("Error updating pages:", error);
      toast.error(m("bulkUpdateError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmptyTrash = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/pages/bulk", {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to empty trash");
      await fetchPages();
      toast.success(m("emptyTrashSuccess"));
    } catch (error) {
      console.error("Error emptying trash:", error);
      toast.error(m("emptyTrashError"));
    } finally {
      setIsLoading(false);
    }
  };

  const renderPageHierarchy = (pages: Page[], level = 0) => {
    return pages.map((page) => (
      <Fragment key={page.id}>
        <TableRow>
          <TableCell>
            <Checkbox
              checked={selectedPages.has(page.id)}
              onCheckedChange={() => handleSelectOne(page.id)}
              aria-label={`Select ${page.title}`}
            />
          </TableCell>
          <TableCell>
            <div style={{ marginLeft: `${level * 20}px` }}>
              <div className='flex items-center space-x-2'>
                <span>{page.title}</span>
                {page.status === "published" && (
                  <Badge variant='default'>
                    {t("status.published")}
                  </Badge>
                )}
                {page.status === "draft" && (
                  <Badge variant='secondary'>{t("status.draft")}</Badge>
                )}
                {page.status === "deleted" && (
                  <Badge variant='outline'>{t("status.deleted")}</Badge>
                )}
              </div>
            </div>
          </TableCell>
          <TableCell>{page.author}</TableCell>
          <TableCell>{page.status}</TableCell>
          <TableCell>{new Date(page.updatedAt).toLocaleDateString()}</TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <span className='sr-only'>Open menu</span>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem
                  onClick={() => handleEditPage(page)}
                  disabled={!page.isEditable}
                >
                  <Edit className='mr-2 h-4 w-4' />
                  {a("editPage")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDuplicatePage(page)}
                  disabled={!page.isEditable}
                >
                  <Copy className='mr-2 h-4 w-4' />
                  {a("duplicatePage")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAccessControl(page)}
                  disabled={!page.isEditable}
                >
                  <Lock className='mr-2 h-4 w-4' />
                  {a("accessControl")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleMoveUp(page)}
                  disabled={!page.isEditable}
                >
                  <ArrowUp className='mr-2 h-4 w-4' />
                  {a("moveUp")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleMoveDown(page)}
                  disabled={!page.isEditable}
                >
                  <ArrowDown className='mr-2 h-4 w-4' />
                  {a("moveDown")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleMakeRoot(page)}
                  disabled={!page.isEditable || !page.parentId}
                >
                  <ArrowUpToLine className='mr-2 h-4 w-4' />
                  {a("makeRoot")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleMoveTo(page)}
                  disabled={!page.isEditable}
                >
                  <MoveHorizontal className='mr-2 h-4 w-4' />
                  {a("moveTo")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteConfirm(page)}
                  disabled={!page.isEditable}
                  className='text-red-600'
                >
                  <Trash className='mr-2 h-4 w-4' />
                  {a("deletePage")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {page.children && renderPageHierarchy(page.children, level + 1)}
      </Fragment>
    ));
  };

  const renderSelectOptions = (
    pages: Page[],
    level: number = 0
  ): React.ReactElement[] => {
    const options = [
      level === 0 ? (
        <SelectItem key='root' value='root'>
          {f("noParent")}
        </SelectItem>
      ) : null,
      ...pages.map((page) => (
        <Fragment key={page.id}>
          <SelectItem value={page.id}>
            {"\u00A0".repeat(level * 2)}
            {page.title}
          </SelectItem>
          {page.children && renderSelectOptions(page.children, level + 1)}
        </Fragment>
      )),
    ].flat();

    return options.filter(
      (option): option is React.ReactElement => option !== null
    );
  };

  const handleParentChange = (parentId: string) => {
    const isRoot = parentId === "root";
    form.setValue("parentId", isRoot ? null : parentId);
    const parentPage = isRoot
      ? null
      : pages.find((page) => page.id === parentId);
    const newLevel = parentPage ? parentPage.level + 1 : 1;
    form.setValue("level", newLevel);
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setIsUpdating(true);
    try {
      const method = data.id ? "PUT" : "POST";

      // Si es una nueva página, obtener el orden máximo actual
      let order = 0;
      if (!data.id) {
        const response = await fetch(
          `/api/pages/maxOrder?parentId=${data.parentId || "root"}`
        );
        if (response.ok) {
          const { maxOrder } = await response.json();
          order = maxOrder + 1;
        }
      }

      const submitData = {
        ...data,
        parentId: data.parentId === null ? "root" : data.parentId,
        order: order,
      };

      const response = await fetch("/api/pages", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          if (errorData.error.includes("slug already exists")) {
            toast.error(e("duplicateFullPath"));
          } else if (errorData.error.includes("full path already exists")) {
            toast.error(e("duplicateFullPath"));
          } else {
            toast.error(data.id ? e("updatePageError") : e("createPageError"));
          }
        } else {
          toast.error(data.id ? e("updatePageError") : e("createPageError"));
        }
        return;
      }
      const updatedPage: Page = await response.json();

      if (data.id) {
        toast.success(f("updateSuccessDescription", { title: data.title }));
        setSelectedPage(updatedPage);
      } else {
        toast.success(f("createSuccessDescription", { title: data.title }));
        setSelectedPage(null);
        form.reset();
      }

      await fetchPages();
      setIsFormOpen(false);
    } catch (error: unknown) {
      console.error("Submit error:", error);
      toast.error(data.id ? e("updatePageError") : e("createPageError"));
    } finally {
      setIsLoading(false);
      setIsUpdating(false);
    }
  };

  const handleCreatePage = () => {
    setSelectedPage(null);
    form.reset({
      title: "",
      slug: "",
      content: "",
      lang: "es",
      parentId: null,
      level: 1,
      status: "draft",
      indexable: true,
      showInMenu: true,
      tags: [],
      author: "admin",
      template: Template.sideMenuAndTabs,
    });
    setIsFormOpen(true);
  };

  const handleEditPage = (page: Page) => {
    if (!page.isEditable) {
      toast.error(m("pageNotEditableMessage"));
      return;
    }

    setSelectedPage(page);
    form.reset({
      id: page.id,
      title: page.title,
      content: page.content ? JSON.parse(page.content).body : "",
      slug: page.slug,
      lang: page.lang,
      parentId: page.parentId || null,
      level: page.level,
      status: page.status,
      indexable: page.indexable,
      showInMenu: page.showInMenu,
      tags: page.tags,
      author: page.author,
      template: page.template,
    });
    setIsFormOpen(true);
  };

  const handleDeletePage = (page: Page) => {
    if (!page.isEditable) {
      toast.error(m("pageNotEditableMessage"));
      return;
    }

    setDeleteDialogState({
      isOpen: true,
      hasChildren: !!(page.children && page.children.length > 0),
      childCount: page.children ? page.children.length : 0,
      pageToDelete: page,
    });
  };

  const handleAccessControl = (page: Page) => {
    setSelectedPage(page);
    setIsAccessControlOpen(true);
  };

  const handleMoveToSubmit = async (targetParentId: string | null) => {
    if (!pageToMove) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/pages/${pageToMove.id}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "moveTo",
          targetParentId,
        }),
      });

      if (!response.ok) throw new Error("Failed to move page");
      await fetchPages();
      setIsMoveToModalOpen(false);
      setPageToMove(null);
      toast.success(m("moveSuccess"));
    } catch (error) {
      console.error("Error moving page:", error);
      toast.error(m("moveError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubmit = async (option?: "cascade" | "moveUp") => {
    if (!deleteDialogState.pageToDelete) return;

    setIsLoading(true);
    try {
      const queryParams = option ? `?deleteOption=${option}` : "";
      const response = await fetch(
        `/api/pages/${deleteDialogState.pageToDelete.id}${queryParams}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete page");
      }

      await fetchPages();
      setDeleteDialogState({
        isOpen: false,
        hasChildren: false,
        childCount: 0,
        pageToDelete: null,
      });
      toast.success(m("deleteSuccess"));
    } catch (error) {
      console.error("Error deleting page:", error);
      toast.error(m("deleteError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <DocHeader
        title='Gestión de Sitemaps'
        description='Administra los sitemaps de tu sitio web con sistema de múltiples sitemaps para mejor organización'
        icon={LucideMapIcon}
      />

      <DocContent>
        <div className='container mx-auto p-4'>
          <Toaster position='top-right' />

          {/* Alert informativo sobre múltiples sitemaps */}
          <Alert className='mb-6 border-primary/20 bg-primary/5'>
            <InboxIcon className='h-4 w-4 text-primary' />
            <AlertDescription className='text-foreground'>
              <strong>Sistema de múltiples sitemaps:</strong> Esta opción te
              permite crear diferentes sitemaps para organizar mejor tu
              contenido. Puedes tener sitemaps específicos para el blog, la web
              principal, y cualquier otra sección que necesites. Esto mejora el
              SEO y facilita la indexación por parte de los motores de búsqueda.
            </AlertDescription>
          </Alert>

          {/* Badges informativos */}
          <div className='flex flex-wrap gap-2 mb-6'>
            <Badge variant='outline' className='flex items-center gap-2'>
              <MapIcon className='h-3 w-3' />
              Sitemap General
            </Badge>
            <Badge variant='secondary' className='flex items-center gap-2'>
              <FileText className='h-3 w-3' />
              Sitemap del Blog
            </Badge>
            <Badge variant='secondary' className='flex items-center gap-2'>
              <Globe className='h-3 w-3' />
              Sitemap Web
            </Badge>
            <Badge variant='secondary' className='flex items-center gap-2'>
              <Plus className='h-3 w-3' />
              Sitemaps Personalizados
            </Badge>
          </div>

          <div className='mb-4 flex space-x-2'>
            <Button onClick={handleCreatePage}>{a("createNewPage")}</Button>
          </div>

          <div className='mb-6'>
            <Tabs
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as PageStatus)}
              className='w-full'
            >
              <TabsList className='w-full justify-start'>
                <TabsTrigger value='published'>
                  {t("published")} ({getPageCountByStatus("published")})
                </TabsTrigger>
                <TabsTrigger value='draft'>
                  {t("draft")} ({getPageCountByStatus("draft")})
                </TabsTrigger>
                <TabsTrigger value='deleted'>
                  {t("deleted")} ({getPageCountByStatus("deleted")})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className='mb-4 flex space-x-2'>
            <Input
              placeholder={s("searchPages")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='max-w-sm'
            />
            <div className='w-[300px]'>
              <TagInput
                value={selectedTags}
                onChange={setSelectedTags}
                placeholder={s("searchTags")}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[50px]'>
                  <Checkbox
                    checked={
                      selectedPages.size > 0 &&
                      selectedPages.size === pages.length
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label='Select all'
                  />
                </TableHead>
                <TableHead>{ta("title")}</TableHead>
                <TableHead>{ta("author")}</TableHead>
                <TableHead>{ta("status")}</TableHead>
                <TableHead>{ta("lastModified")}</TableHead>
                <TableHead>{ta("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className='text-center'>
                    {m("loading")}
                  </TableCell>
                </TableRow>
              ) : pages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className='text-center'>
                    {m("noPages")}
                  </TableCell>
                </TableRow>
              ) : (
                renderPageHierarchy(organizePages(pages))
              )}
            </TableBody>
          </Table>

          {selectedPages.size > 0 && (
            <div className='mt-4 flex gap-2'>
              <Button
                variant='secondary'
                onClick={() => handleBulkAction("draft")}
                disabled={isLoading}
              >
                {t("setBulkDraft")}
              </Button>
              <Button
                variant='secondary'
                onClick={() => handleBulkAction("published")}
                disabled={isLoading}
              >
                {t("setBulkPublished")}
              </Button>
              <Button
                variant='destructive'
                onClick={() => handleBulkAction("deleted")}
                disabled={isLoading}
              >
                {t("setBulkDeleted")}
              </Button>
            </div>
          )}

          {selectedStatus === "deleted" && pages.length > 0 && (
            <div className='mt-4'>
              <Button
                variant='destructive'
                onClick={handleEmptyTrash}
                disabled={isLoading}
              >
                {t("emptyTrash")}
              </Button>
            </div>
          )}

          <Dialog
            open={isFormOpen}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedPage(null);
                form.reset({
                  title: "",
                  slug: "",
                  content: "",
                  lang: "es",
                  parentId: null,
                  level: 1,
                  status: "draft",
                  indexable: true,
                  showInMenu: true,
                  tags: [],
                  author: "admin",
                  template: Template.sideMenuAndTabs,
                });
              }
              setIsFormOpen(open);
            }}
          >
            <DialogContent className='max-w-4xl'>
              <DialogHeader>
                <DialogTitle>
                  {selectedPage ? a("editPage") : a("createPage")}
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className='h-[80vh] pr-4'>
                <FormProvider {...form}>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className='space-y-8'
                    >
                      <Tabs defaultValue='config'>
                        <TabsList className='mb-4'>
                          <TabsTrigger value='config'>Config</TabsTrigger>
                          <TabsTrigger value='content'>Content</TabsTrigger>
                          <TabsTrigger value='seo'>
                            SEO
                            <Badge variant='outline' className='ml-2'>
                              {form.watch("slug") ? "0/3" : "0/3"}
                            </Badge>
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value='config'>
                          <div className='space-y-4'>
                            <FormField
                              control={form.control}
                              name='title'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{f("titleLabel")}</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder={f("titlePlaceholder")}
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        const currentSlug =
                                          form.getValues("slug");
                                        if (!currentSlug) {
                                          form.setValue(
                                            "slug",
                                            generateSlug(e.target.value)
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name='slug'
                              render={({ field }) => {
                                const status = form.watch("status");
                                const pageId = form.watch("id");
                                const isPublished = status === "published";
                                const generatedSlug = generateSlug(
                                  form.watch("title")
                                );
                                const placeholderSlug = isPublished
                                  ? field.value || generatedSlug
                                  : pageId
                                    ? `${pageId}-${status}`
                                    : `[id]-${status}`;
                                const currentValue = field.value || "";

                                return (
                                  <FormItem>
                                    <FormLabel>{f("slugLabel")}</FormLabel>
                                    <FormControl>
                                      <div className='space-y-2'>
                                        <Input
                                          {...field}
                                          placeholder={
                                            isPublished
                                              ? generatedSlug
                                              : placeholderSlug
                                          }
                                          value={
                                            isPublished
                                              ? currentValue
                                              : placeholderSlug
                                          }
                                          disabled={!isPublished}
                                          className={
                                            !isPublished ? "bg-muted" : ""
                                          }
                                          onClick={() => {
                                            if (
                                              isPublished &&
                                              !currentValue &&
                                              generatedSlug
                                            ) {
                                              field.onChange(generatedSlug);
                                            }
                                          }}
                                          onChange={(e) => {
                                            if (isPublished) {
                                              const validSlug = generateSlug(
                                                e.target.value
                                              );
                                              field.onChange(validSlug);
                                            }
                                          }}
                                        />
                                        <Progress
                                          value={
                                            (currentValue.length / 60) * 100
                                          }
                                          className={cn(
                                            "h-1",
                                            currentValue.length > 60
                                              ? "bg-red-500"
                                              : "bg-green-500"
                                          )}
                                        />
                                        <div className='flex justify-between text-xs text-muted-foreground'>
                                          <span>URL amigable</span>
                                          <span>{currentValue.length}/60</span>
                                        </div>
                                      </div>
                                    </FormControl>
                                    <FormDescription className='text-xs'>
                                      {isPublished ? (
                                        <>
                                          • Usa solo letras minúsculas, números
                                          y guiones
                                          <br />
                                          • Evita palabras vacías (el, la, los,
                                          de, etc.)
                                          <br />
                                          • Mantén el slug corto y descriptivo
                                          <br />• Incluye palabras clave
                                          relevantes
                                        </>
                                      ) : (
                                        "El slug se generará automáticamente cuando la página sea publicada"
                                      )}
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
                            />

                            <FormField
                              control={form.control}
                              name='author'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{f("authorLabel")}</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue
                                          placeholder={f("authorPlaceholder")}
                                        />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value='admin'>
                                        Admin
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name='template'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{f("templateLabel")}</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={selectedPage !== null}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue
                                          placeholder={f("selectTemplate")}
                                        />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {renderTemplateOptions()}
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    {f("templateDescription")}
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name='parentId'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{f("parentPageLabel")}</FormLabel>
                                  <Select
                                    onValueChange={handleParentChange}
                                    value={field.value || "root"}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue
                                          placeholder={f("selectParentPage")}
                                        />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {renderSelectOptions(
                                        organizePages(pages)
                                      )}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name='status'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{f("statusLabel")}</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue
                                          placeholder={f("selectStatus")}
                                        />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value='draft'>
                                        {f("statusDraft")}
                                      </SelectItem>
                                      <SelectItem value='published'>
                                        {f("statusPublished")}
                                      </SelectItem>
                                      <SelectItem value='deleted'>
                                        {f("statusDeleted")}
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name='indexable'
                              render={({ field }) => (
                                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                                  <div className='space-y-0.5'>
                                    <FormLabel className='text-base'>
                                      {f("indexableLabel")}
                                    </FormLabel>
                                    <FormDescription>
                                      {f("indexableDescription")}
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name='showInMenu'
                              render={({ field }) => (
                                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                                  <div className='space-y-0.5'>
                                    <FormLabel className='text-base'>
                                      {f("showInMenuLabel")}
                                    </FormLabel>
                                    <FormDescription>
                                      {f("showInMenuDescription")}
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name='tags'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{f("tagsLabel")}</FormLabel>
                                  <FormControl>
                                    <TagInput
                                      value={field.value}
                                      onChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    {f("tagsDescription")}
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value='content'>
                          <div className='space-y-4'>
                            <FormField
                              control={form.control}
                              name='content'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{f("contentLabel")}</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder={f("contentPlaceholder")}
                                      {...field}
                                      className='min-h-[200px]'
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value='seo'>
                          <div className='space-y-6'>
                            <div className='flex items-center gap-2 text-muted-foreground'>
                              <Info size={16} />
                              <p className='text-sm'>
                                Complete estos campos para mejorar el SEO de tu
                                página
                              </p>
                            </div>

                            <FormField
                              control={form.control}
                              name='metaTitle'
                              render={({ field }) => {
                                const currentValue = field.value || "";
                                const pixelWidth =
                                  calculatePixelWidth(currentValue);

                                return (
                                  <FormItem>
                                    <FormLabel>Título SEO</FormLabel>
                                    <FormControl>
                                      <div className='space-y-2'>
                                        <Input
                                          {...field}
                                          placeholder='Título optimizado para motores de búsqueda'
                                          value={currentValue}
                                        />
                                        <Progress
                                          value={
                                            (currentValue.length / 60) * 100
                                          }
                                          className={cn(
                                            "h-1",
                                            currentValue.length < 50
                                              ? "bg-red-500"
                                              : currentValue.length > 60
                                                ? "bg-red-500"
                                                : "bg-green-500"
                                          )}
                                        />
                                        <div className='flex justify-between text-xs text-muted-foreground'>
                                          <span>Caracteres</span>
                                          <span>
                                            {currentValue.length}/60 (
                                            {Math.round(pixelWidth)}px/580px)
                                          </span>
                                        </div>
                                      </div>
                                    </FormControl>
                                    <FormDescription className='text-xs'>
                                      • Usa palabras clave relevantes al
                                      principio
                                      <br />
                                      • Incluye el nombre de la marca al final
                                      <br />• Entre 50-60 caracteres para mejor
                                      visibilidad
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
                            />

                            <FormField
                              control={form.control}
                              name='metaDescription'
                              render={({ field }) => {
                                const currentValue = field.value || "";
                                const pixelWidth =
                                  calculatePixelWidth(currentValue);

                                return (
                                  <FormItem>
                                    <FormLabel>Meta descripción</FormLabel>
                                    <FormControl>
                                      <div className='space-y-2'>
                                        <Textarea
                                          {...field}
                                          placeholder='Descripción que aparecerá en los resultados de búsqueda'
                                          value={currentValue}
                                          className='h-20'
                                        />
                                        <Progress
                                          value={
                                            (currentValue.length / 160) * 100
                                          }
                                          className={cn(
                                            "h-1",
                                            currentValue.length < 120
                                              ? "bg-red-500"
                                              : currentValue.length > 160
                                                ? "bg-red-500"
                                                : "bg-green-500"
                                          )}
                                        />
                                        <div className='flex justify-between text-xs text-muted-foreground'>
                                          <span>Caracteres</span>
                                          <span>
                                            {currentValue.length}/160 (
                                            {Math.round(pixelWidth)}px/920px)
                                          </span>
                                        </div>
                                      </div>
                                    </FormControl>
                                    <FormDescription className='text-xs'>
                                      • Resume el contenido de forma atractiva
                                      <br />
                                      • Incluye un llamado a la acción
                                      <br />• Entre 120-160 caracteres para
                                      mejor visibilidad
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
                            />

                            <FormField
                              control={form.control}
                              name='metaImage'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Imagen social</FormLabel>
                                  <FormControl>
                                    <div className='flex items-center gap-2'>
                                      <Input
                                        {...field}
                                        placeholder='ID de la imagen (próximamente selector de media)'
                                        value={field.value || ""}
                                        disabled
                                      />
                                      <Button
                                        type='button'
                                        variant='outline'
                                        disabled
                                        onClick={() => {
                                          // TODO: Implementar selector de media
                                        }}
                                      >
                                        Seleccionar
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <FormDescription className='text-xs'>
                                    • Imagen que se mostrará al compartir en
                                    redes sociales
                                    <br />
                                    • Tamaño recomendado: 1200x630 píxeles
                                    <br />• Próximamente: Selector de medios
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <SeoProgress
                              title={form.watch("title") || ""}
                              slug={form.watch("slug") || ""}
                              description={form.watch("content") || ""}
                              tags={form.watch("tags") || []}
                              metaTitle={form.watch("metaTitle") || ""}
                              metaDescription={
                                form.watch("metaDescription") || ""
                              }
                              metaImage={form.watch("metaImage") || ""}
                              lang={form.watch("lang")}
                            />
                          </div>
                        </TabsContent>
                      </Tabs>

                      <Button type='submit' disabled={isLoading}>
                        {isLoading ? (
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        ) : selectedPage ? (
                          a("updatePage")
                        ) : (
                          a("createPage")
                        )}
                      </Button>
                    </form>
                  </Form>
                </FormProvider>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <AlertDialog
            open={deleteDialogState.isOpen}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setDeleteDialogState({
                  isOpen: false,
                  hasChildren: false,
                  childCount: 0,
                  pageToDelete: null,
                });
              }
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{a("deletePage")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {deleteDialogState.hasChildren
                    ? m("deletePageWithChildrenDescription", {
                        count: deleteDialogState.childCount,
                      })
                    : m("deleteConfirm")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{a("cancel")}</AlertDialogCancel>
                {deleteDialogState.hasChildren ? (
                  <>
                    <Button
                      variant='destructive'
                      onClick={() => handleDeleteSubmit("cascade")}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      ) : (
                        d("deleteCascade")
                      )}
                    </Button>
                    <Button
                      variant='destructive'
                      onClick={() => handleDeleteSubmit("moveUp")}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      ) : (
                        d("deleteMoveUp")
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant='destructive'
                    onClick={() => handleDeleteSubmit()}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                      a("confirmDelete")
                    )}
                  </Button>
                )}
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AccessControlModule
            isOpen={isAccessControlOpen}
            onClose={() => setIsAccessControlOpen(false)}
            pageId={selectedPage?.id || ""}
          />
          <MoveToModal
            isOpen={isMoveToModalOpen}
            onClose={() => {
              setIsMoveToModalOpen(false);
              setPageToMove(null);
            }}
            onMove={handleMoveToSubmit}
            pages={pages}
            currentPage={pageToMove}
          />
        </div>
      </DocContent>
    </div>
  );
}
