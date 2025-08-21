"use client";

import React, { useState, useEffect, Fragment } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { Textarea } from "@/src/components/ui/textarea";
import { Checkbox } from "@/src/components/ui/checkbox";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { useToast } from "@/src/hooks/use-toast";
import { Icons } from "@/src/components/shared/icons";
import {
  FolderIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  TagIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  BuildingOfficeIcon,
  CheckIcon,
  ChevronUpDownIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ChartBarIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/src/lib/utils";
import { HierarchyTree } from "@/src/components/ui/hierarchy-tree";

interface MeetTag {
  id: string;
  name: string;
  slug: string;
  color: string;
  path: string;
  level: number;
  order: number;
  isActive: boolean;
  customId?: string;
  parentId?: string;
  children?: MeetTag[];
}

interface MeetGroupReference {
  id: string;
  sourceGroupId: string;
  targetGroupId: string;
  displayName?: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  targetGroup: {
    id: string;
    name: string;
    slug: string;
    color: string;
    customId?: string;
    internalDescription?: string;
    publicDescription?: string;
  };
}

interface MeetGroup {
  id: string;
  name: string;
  slug: string;
  internalDescription?: string;
  publicDescription?: string;
  color: string;
  parentId?: string;
  parent?: MeetGroup;
  children: MeetGroup[];
  path: string;
  level: number;
  customId?: string;
  order: number;
  allowsReferences?: boolean;
  referenceCount?: number;
  references?: MeetGroupReference[];
  referencedBy?: MeetGroupReference[];
  createdAt: string;
  createdBy?: string;
  isActive: boolean;
  isReference?: boolean; // Flag para indicar si es una referencia
  originalGroupId?: string; // ID del grupo original si es referencia
  defaultTags: Array<{
    tag: MeetTag;
  }>;
  _count: {
    children: number;
    spaceGroups: number;
    defaultTags: number;
  };
}

interface GroupsManagementProps {
  lang: string;
}

export const GroupsManagement: React.FC<GroupsManagementProps> = ({ lang }) => {
  const [groups, setGroups] = useState<MeetGroup[]>([]);
  const [flatGroups, setFlatGroups] = useState<MeetGroup[]>([]);
  const [tags, setTags] = useState<MeetTag[]>([]);
  const [hierarchicalTags, setHierarchicalTags] = useState<MeetTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<MeetGroup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [accordionValue, setAccordionValue] = useState<string | undefined>(
    undefined
  );
  const [showPublicView, setShowPublicView] = useState(false); // Toggle between internal/public view
  const [parentGroupComboboxOpen, setParentGroupComboboxOpen] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [referenceSearchTerm, setReferenceSearchTerm] = useState("");
  const [parentGroupSearchTerm, setParentGroupSearchTerm] = useState("");
  const [editingReference, setEditingReference] =
    useState<MeetGroupReference | null>(null);
  const [referenceEditForm, setReferenceEditForm] = useState({
    displayName: "",
    description: "",
    order: 0,
  });
  const [referencesModalOpen, setReferencesModalOpen] = useState(false);
  const [groupWithReferences, setGroupWithReferences] =
    useState<MeetGroup | null>(null);

  // Estado para referencias (ahora usamos flatGroups directamente)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    internalDescription: "",
    publicDescription: "",
    color: "#6B7280",
    parentId: "",
    customId: "",
    order: 0,
    defaultTagIds: [] as string[],
    isActive: true,
    allowsReferences: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Colores predefinidos para grupos
  const groupColors = [
    "#6B7280", // Gray (default)
    "#1F2937", // Gray 800
    "#374151", // Gray 700
    "#4B5563", // Gray 600
    "#9CA3AF", // Gray 400
    "#D1D5DB", // Gray 300
    "#3B82F6", // Blue
    "#1E40AF", // Blue 800
    "#2563EB", // Blue 600
    "#60A5FA", // Blue 400
  ];

  // Variables computadas para filtros jerárquicos se declaran más abajo

  // Filtrar grupos padre con jerarquía para el tab de organización
  // Función de búsqueda fuzzy muy permisiva para grupos
  const fuzzySearchGroup = (searchTerm: string, target: string): boolean => {
    if (!searchTerm || !target) return true;

    const normalizeText = (text: string) =>
      text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9\s]/g, "") // Keep alphanumeric and spaces
        .replace(/\s+/g, ""); // Remove all spaces

    const normalizedSearch = normalizeText(searchTerm);
    const normalizedTarget = normalizeText(target);

    // Si está vacío después de normalizar, mostrar todo
    if (!normalizedSearch) return true;

    // Método 1: Búsqueda simple de substring (más permisivo)
    if (normalizedTarget.includes(normalizedSearch)) {
      return true;
    }

    // Método 2: Búsqueda de todas las palabras por separado
    const searchWords = searchTerm.toLowerCase().split(/\s+/);
    const targetWords = target.toLowerCase().split(/\s+/);

    const allWordsFound = searchWords.every((searchWord) =>
      targetWords.some(
        (targetWord) =>
          targetWord.includes(searchWord) || searchWord.includes(targetWord)
      )
    );

    if (allWordsFound) {
      return true;
    }

    // Método 3: Búsqueda por caracteres en orden (más flexible)
    const searchChars = normalizedSearch.split("");
    let targetIndex = 0;

    for (let i = 0; i < searchChars.length; i++) {
      const char = searchChars[i];
      if (!char) continue; // Skip if char is undefined

      const foundIndex = normalizedTarget.indexOf(char, targetIndex);

      if (foundIndex === -1) {
        return false; // Si no encuentra un carácter, no coincide
      }

      targetIndex = foundIndex + 1;
    }

    return true;
  };

  const filteredParentGroups = React.useMemo(() => {
    let groupsToFilter = flatGroups;

    if (parentGroupSearchTerm.trim()) {
      groupsToFilter = flatGroups.filter((group) => {
        // Buscar en múltiples campos con búsqueda fuzzy
        const searchFields = [
          group.name,
          group.slug,
          group.customId,
          group.internalDescription,
          group.publicDescription,
        ].filter(Boolean); // Remove null/undefined values

        // Si cualquier campo coincide con la búsqueda fuzzy, incluir el grupo
        return searchFields.some((field) =>
          fuzzySearchGroup(parentGroupSearchTerm, field as string)
        );
      });
    }

    // Construir jerarquía de grupos para mostrar padre-hijo correctamente
    const buildGroupHierarchy = (groupList: MeetGroup[]): MeetGroup[] => {
      const groupMap = new Map<string, MeetGroup>();
      const roots: MeetGroup[] = [];

      // First pass: create a map of all groups
      groupList.forEach((group) => {
        groupMap.set(group.id, { ...group, children: [] });
      });

      // Second pass: build hierarchy
      groupList.forEach((group) => {
        const groupNode = groupMap.get(group.id)!;
        if (group.parentId) {
          const parent = groupMap.get(group.parentId);
          if (parent) {
            if (!parent.children) parent.children = [];
            parent.children.push(groupNode);
          } else {
            // Si el padre no está en la lista filtrada, agregar como raíz
            roots.push(groupNode);
          }
        } else {
          roots.push(groupNode);
        }
      });

      // Sort children recursively
      const sortGroupsRecursively = (groups: MeetGroup[]): MeetGroup[] => {
        return groups
          .sort((a, b) => {
            if (a.order !== b.order) return a.order - b.order;
            return a.name.localeCompare(b.name);
          })
          .map((group) => ({
            ...group,
            children: group.children
              ? sortGroupsRecursively(group.children)
              : [],
          }));
      };

      return sortGroupsRecursively(roots);
    };

    return buildGroupHierarchy(groupsToFilter);
  }, [flatGroups, parentGroupSearchTerm]);

  // Las variables filtradas se declaran más abajo

  useEffect(() => {
    Promise.all([fetchGroups(), fetchTags()]);
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/meet/groups");

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setGroups(data.groups || []);

      // También obtener lista plana para selección de parents
      const flatResponse = await fetch("/api/meet/groups?parentId=all");
      const flatData = await flatResponse.json();
      setFlatGroups(flatData.groups || []);
    } catch (error: any) {
      console.error("Error fetching groups:", error);
      toast({
        title: "Error al cargar grupos",
        description: error.message || "No se pudieron cargar los grupos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const buildTagHierarchy = (tagList: MeetTag[]): MeetTag[] => {
    const tagMap = new Map<string, MeetTag>();
    const roots: MeetTag[] = [];

    // First pass: create a map of all tags
    tagList.forEach((tag) => {
      tagMap.set(tag.id, { ...tag, children: [] });
    });

    // Second pass: build hierarchy
    tagList.forEach((tag) => {
      const tagNode = tagMap.get(tag.id)!;
      if (tag.parentId) {
        const parent = tagMap.get(tag.parentId);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(tagNode);
        }
      } else {
        roots.push(tagNode);
      }
    });

    // Sort children recursively
    const sortTagsRecursively = (tags: MeetTag[]): MeetTag[] => {
      return tags
        .sort((a, b) => {
          if (a.order !== b.order) return a.order - b.order;
          return a.name.localeCompare(b.name);
        })
        .map((tag) => ({
          ...tag,
          children: tag.children ? sortTagsRecursively(tag.children) : [],
        }));
    };

    return sortTagsRecursively(roots);
  };

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/meet/tags?parentId=all");

      if (response.ok) {
        const data = await response.json();
        const allTags = data.tags || [];

        // Sort flat list for backward compatibility
        const sortedTags = allTags.sort((a: MeetTag, b: MeetTag) => {
          if (a.level !== b.level) return a.level - b.level;
          if (a.order !== b.order) return a.order - b.order;
          return a.name.localeCompare(b.name);
        });

        // Build hierarchical structure
        const hierarchical = buildTagHierarchy(allTags);

        setTags(sortedTags);
        setHierarchicalTags(hierarchical);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const handleCreateGroup = async () => {
    try {
      // Validaciones básicas
      const errors: Record<string, string> = {};
      if (!formData.name.trim()) errors.name = "El nombre es requerido";
      if (!formData.slug.trim()) errors.slug = "El slug es requerido";
      if (!/^[a-z0-9-]+$/.test(formData.slug)) {
        errors.slug =
          "El slug debe contener solo letras minúsculas, números y guiones";
      }

      setFormErrors(errors);
      if (Object.keys(errors).length > 0) return;

      const response = await fetch("/api/meet/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          parentId:
            formData.parentId === "" || formData.parentId === "__root__"
              ? undefined
              : formData.parentId,
          isActive: formData.isActive,
          allowsReferences: formData.allowsReferences,
          defaultTagIds:
            formData.defaultTagIds.length > 0
              ? formData.defaultTagIds
              : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear grupo");
      }

      toast({
        title: "Grupo creado",
        description: `Grupo "${formData.name}" creado exitosamente`,
      });

      setIsModalOpen(false);
      resetForm();
      await fetchGroups();
    } catch (error: any) {
      toast({
        title: "Error al crear grupo",
        description: error.message || "No se pudo crear el grupo",
        variant: "destructive",
      });
    }
  };

  const handleEditGroup = async () => {
    if (!selectedGroup) return;

    try {
      const errors: Record<string, string> = {};
      if (!formData.name.trim()) errors.name = "El nombre es requerido";
      if (!formData.slug.trim()) errors.slug = "El slug es requerido";
      if (!/^[a-z0-9-]+$/.test(formData.slug)) {
        errors.slug =
          "El slug debe contener solo letras minúsculas, números y guiones";
      }

      setFormErrors(errors);
      if (Object.keys(errors).length > 0) return;

      const response = await fetch(`/api/meet/groups/${selectedGroup.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          parentId:
            formData.parentId === "" || formData.parentId === "__root__"
              ? null
              : formData.parentId,
          defaultTagIds: formData.defaultTagIds,
          isActive: formData.isActive,
          allowsReferences: formData.allowsReferences,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar grupo");
      }

      toast({
        title: "Grupo actualizado",
        description: `Grupo "${formData.name}" actualizado exitosamente`,
      });

      setIsModalOpen(false);
      setSelectedGroup(null);
      setModalMode("create");
      resetForm();
      await fetchGroups();
    } catch (error: any) {
      toast({
        title: "Error al actualizar grupo",
        description: error.message || "No se pudo actualizar el grupo",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGroup = async (group: MeetGroup) => {
    if (group._count.children > 0) {
      toast({
        title: "No se puede eliminar",
        description:
          "El grupo tiene elementos hijos. Muévalos o elimínelos primero.",
        variant: "destructive",
      });
      return;
    }

    if (
      !confirm(`¿Estás seguro de que deseas eliminar el grupo "${group.name}"?`)
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/meet/groups/${group.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();

        // Manejo específico para diferentes tipos de errores
        if (response.status === 400 && error.message && error.referencedIn) {
          // Error por referencias: el grupo está siendo usado en paquetes
          const packages = error.referencedIn
            .map((ref: any) => ref.packageName)
            .join(", ");
          toast({
            title: "No se puede eliminar",
            description: `Este grupo está referenciado en los siguientes paquetes: ${packages}. Elimina las referencias primero.`,
            variant: "destructive",
          });
        } else if (response.status === 409) {
          // Error por hijos (409 Conflict)
          toast({
            title: "No se puede eliminar",
            description:
              error.details ||
              "El grupo tiene elementos hijos. Muévalos o elimínelos primero.",
            variant: "destructive",
          });
        } else {
          // Otros errores
          throw new Error(
            error.error || error.message || "Error al eliminar grupo"
          );
        }
        return;
      }

      toast({
        title: "Grupo eliminado",
        description: `Grupo "${group.name}" eliminado exitosamente`,
      });

      await fetchGroups();
    } catch (error: any) {
      toast({
        title: "Error al eliminar grupo",
        description: error.message || "No se pudo eliminar el grupo",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      internalDescription: "",
      publicDescription: "",
      color: "#6B7280",
      parentId: "",
      customId: "",
      order: 0,
      defaultTagIds: [],
      isActive: true,
      allowsReferences: false,
    });
    setFormErrors({});
    setSelectedGroup(null);
    setModalMode("create");
    setParentGroupComboboxOpen(false);
    setTagSearchTerm("");
    setReferenceSearchTerm("");
    setParentGroupSearchTerm("");
    setEditingReference(null);
    setReferenceEditForm({ displayName: "", description: "", order: 0 });
    setReferencesModalOpen(false);
    setGroupWithReferences(null);
  };

  const openCreateModal = (parentGroup?: MeetGroup) => {
    resetForm();
    setModalMode("create");
    if (parentGroup) {
      setFormData((prev) => ({ ...prev, parentId: parentGroup.id }));
    }
    setIsModalOpen(true);
  };

  const openEditModal = (group: MeetGroup) => {
    setSelectedGroup(group);
    setModalMode("edit");
    setFormData({
      name: group.name,
      slug: group.slug,
      internalDescription: group.internalDescription || "",
      publicDescription: group.publicDescription || "",
      color: group.color,
      parentId: group.parentId || "",
      customId: group.customId || "",
      order: group.order || 0,
      defaultTagIds: group.defaultTags.map((dt) => dt.tag.id),
      isActive: group.isActive !== undefined ? group.isActive : true,
      allowsReferences: group.allowsReferences || false,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Referencias ahora se manejan directamente con flatGroups

  // Agregar una nueva referencia con contexto mejorado
  const handleAddReference = async (
    targetGroupId: string,
    contextData?: { displayName?: string; description?: string; order?: number }
  ) => {
    if (!selectedGroup) return;

    try {
      const response = await fetch(
        `/api/meet/groups/${selectedGroup.id}/references`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetGroupId,
            displayName: contextData?.displayName || "",
            description: contextData?.description || "",
            order: contextData?.order || 0,
          }),
        }
      );

      if (response.ok) {
        toast({
          title: "Referencia agregada",
          description: "La referencia se agregó exitosamente.",
        });
        await fetchGroups(); // Recargar grupos

        // Actualizar selectedGroup con los datos frescos
        const updatedGroupResponse = await fetch(
          `/api/meet/groups/${selectedGroup.id}`
        );
        if (updatedGroupResponse.ok) {
          const updatedGroup = await updatedGroupResponse.json();
          setSelectedGroup(updatedGroup);
        }
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "No se pudo agregar la referencia.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al agregar referencia.",
        variant: "destructive",
      });
    }
  };

  // Editar el contexto de una referencia
  const handleEditReference = async (referenceId: string) => {
    if (!selectedGroup || !editingReference) return;

    try {
      const response = await fetch(
        `/api/meet/groups/${selectedGroup.id}/references/${referenceId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: referenceEditForm.displayName || undefined,
            description: referenceEditForm.description || undefined,
            order: referenceEditForm.order,
          }),
        }
      );

      if (response.ok) {
        toast({
          title: "Referencia actualizada",
          description:
            "El contexto de la referencia se actualizó exitosamente.",
        });

        // Resetear estado de edición
        setEditingReference(null);
        setReferenceEditForm({ displayName: "", description: "", order: 0 });

        await fetchGroups(); // Recargar grupos

        // Actualizar selectedGroup con los datos frescos
        const updatedGroupResponse = await fetch(
          `/api/meet/groups/${selectedGroup.id}`
        );
        if (updatedGroupResponse.ok) {
          const updatedGroup = await updatedGroupResponse.json();
          setSelectedGroup(updatedGroup);
        }
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "No se pudo actualizar la referencia.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al actualizar referencia.",
        variant: "destructive",
      });
    }
  };

  // Iniciar edición de una referencia
  const startEditReference = (reference: MeetGroupReference) => {
    setEditingReference(reference);
    setReferenceEditForm({
      displayName: reference.displayName || "",
      description: reference.description || "",
      order: reference.order || 0,
    });
  };

  // Cancelar edición de referencia
  const cancelEditReference = () => {
    setEditingReference(null);
    setReferenceEditForm({ displayName: "", description: "", order: 0 });
  };

  // Ver y gestionar referencias de un grupo
  const handleViewReferences = async (group: MeetGroup) => {
    try {
      // Obtener información detallada del grupo con sus referencias
      const response = await fetch(`/api/meet/groups/${group.id}`);
      if (response.ok) {
        const detailedGroup = await response.json();
        setGroupWithReferences(detailedGroup);
        setReferencesModalOpen(true);
      } else {
        toast({
          title: "Error",
          description: "No se pudo obtener información de las referencias",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al obtener referencias",
        variant: "destructive",
      });
    }
  };

  // Eliminar una referencia huérfana
  const handleDeleteOrphanReference = async (referenceId: string) => {
    if (!groupWithReferences) return;

    if (
      !confirm("¿Estás seguro de que deseas eliminar esta referencia huérfana?")
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/meet/groups/${groupWithReferences.id}/references/${referenceId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast({
          title: "Referencia eliminada",
          description: "La referencia huérfana se eliminó exitosamente",
        });

        // Actualizar la vista de referencias
        await handleViewReferences(groupWithReferences);

        // Recargar grupos principales
        await fetchGroups();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "No se pudo eliminar la referencia",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al eliminar referencia",
        variant: "destructive",
      });
    }
  };

  // Eliminar una referencia
  const handleRemoveReference = async (referenceId: string) => {
    if (!selectedGroup) return;

    try {
      const response = await fetch(
        `/api/meet/groups/${selectedGroup.id}/references/${referenceId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast({
          title: "Referencia eliminada",
          description: "La referencia se eliminó exitosamente.",
        });
        await fetchGroups(); // Recargar grupos

        // Actualizar selectedGroup con los datos frescos
        const updatedGroupResponse = await fetch(
          `/api/meet/groups/${selectedGroup.id}`
        );
        if (updatedGroupResponse.ok) {
          const updatedGroup = await updatedGroupResponse.json();
          setSelectedGroup(updatedGroup);
        }
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "No se pudo eliminar la referencia.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al eliminar referencia.",
        variant: "destructive",
      });
    }
  };

  const toggleExpand = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    // Expand all hierarchy items
    const getAllGroupIds = (groupList: MeetGroup[]): string[] => {
      return groupList.reduce((acc: string[], group) => {
        acc.push(group.id);
        if (group.children && group.children.length > 0) {
          acc.push(...getAllGroupIds(group.children));
        }
        return acc;
      }, []);
    };

    setExpandedGroups(new Set(getAllGroupIds(filteredGroups)));

    // Expand accordion if there are orphan groups
    if (orphanGroups.length > 0) {
      setAccordionValue("orphan-groups");
    }
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
    setAccordionValue(undefined);
  };

  const generateSlug = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    setFormData((prev) => ({ ...prev, slug }));
  };

  const toggleDefaultTag = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      defaultTagIds: prev.defaultTagIds.includes(tagId)
        ? prev.defaultTagIds.filter((id) => id !== tagId)
        : [...prev.defaultTagIds, tagId],
    }));
  };

  // Render custom content for groups in hierarchy tree
  const renderGroupContent = (group: MeetGroup) => {
    // Verificar si es una referencia (detectar por propiedades específicas)
    const isReference = group.isReference || false;

    return (
      <div className='flex items-center gap-2 flex-1 min-w-0'>
        {/* Group Icon/Color con indicador de referencia */}
        <div className='flex items-center gap-1'>
          <div
            className={cn(
              "h-3 w-3 rounded border",
              isReference && "opacity-60"
            )}
            style={{ backgroundColor: group.color }}
          />
          {isReference && (
            <LinkIcon className='h-3 w-3 text-primary opacity-60' />
          )}
        </div>

        {/* Group Info */}
        <div className={cn("flex-1 min-w-0", isReference && "opacity-60")}>
          <div className='flex items-center gap-2'>
            <span className='font-medium truncate'>
              {isReference ? `${group.name} (Ref)` : group.name}
            </span>
            <Badge variant='outline' className='text-xs'>
              {group.slug}
            </Badge>
            {group.customId && (
              <Badge variant='secondary' className='text-xs'>
                {group.customId}
              </Badge>
            )}
            {isReference && (
              <Badge
                variant='outline'
                className='text-xs text-primary border-primary/30 bg-primary/5'
              >
                REF
              </Badge>
            )}
            {group._count?.spaceGroups > 0 && (
              <Badge variant='secondary' className='text-xs'>
                {group._count.spaceGroups} salas
              </Badge>
            )}
            {group._count?.defaultTags > 0 && (
              <Badge variant='default' className='text-xs'>
                {group._count.defaultTags} tags
              </Badge>
            )}
          </div>
          {(() => {
            const description = showPublicView
              ? group.publicDescription
              : group.internalDescription;
            return (
              description && (
                <p className='text-sm text-muted-foreground truncate'>
                  {description}
                </p>
              )
            );
          })()}
          {/* Default tags preview */}
          {group.defaultTags && group.defaultTags.length > 0 && (
            <div className='flex gap-1 mt-1 flex-wrap'>
              {group.defaultTags.slice(0, 10).map((dt) => (
                <TooltipProvider key={dt.tag.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className='flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs cursor-help'>
                        <div
                          className='h-2 w-2 rounded-full'
                          style={{ backgroundColor: dt.tag.color }}
                        />
                        <span>#{dt.tag.customId || dt.tag.name}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className='space-y-1'>
                        <div className='font-semibold'>
                          #{dt.tag.customId || dt.tag.name}
                        </div>
                        {dt.tag.customId && (
                          <div className='text-xs text-muted-foreground'>
                            Nombre: {dt.tag.name}
                          </div>
                        )}
                        {dt.tag.slug && (
                          <div className='text-xs text-muted-foreground'>
                            Slug: {dt.tag.slug}
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              {group.defaultTags.length > 10 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant='outline' className='text-xs cursor-help'>
                        +{group.defaultTags.length - 10}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className='space-y-2 max-w-xs max-h-64 overflow-y-auto'>
                        <div className='font-semibold text-sm'>
                          Tags adicionales:
                        </div>
                        {group.defaultTags.slice(10).map((dt) => (
                          <div
                            key={dt.tag.id}
                            className='flex items-center gap-2 text-xs'
                          >
                            <div
                              className='h-2 w-2 rounded-full'
                              style={{ backgroundColor: dt.tag.color }}
                            />
                            <span className='font-medium'>
                              #{dt.tag.customId || dt.tag.name}
                            </span>
                            {dt.tag.customId && (
                              <span className='text-muted-foreground'>
                                ({dt.tag.name})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render custom actions for groups
  const renderGroupActions = (group: MeetGroup) => {
    // Si es una referencia, solo permitir navegación al grupo original
    if (group.isReference) {
      return (
        <div className='flex items-center gap-1'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    // Encontrar el grupo original y editarlo
                    const originalGroup = flatGroups.find(
                      (g) => g.id === group.originalGroupId
                    );
                    if (originalGroup) {
                      openEditModal(originalGroup);
                    }
                  }}
                  className='text-primary hover:text-primary opacity-60'
                >
                  <LinkIcon className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver grupo original: {group.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    }

    // Verificar si el grupo puede ser eliminado y construir tooltip detallado
    const canDelete =
      group._count.children === 0 &&
      (!group.referenceCount || group.referenceCount === 0);

    const getDeleteTooltipContent = () => {
      if (canDelete) {
        return (
          <div className='space-y-1'>
            <p className='font-medium'>
              Eliminar grupo &ldquo;{group.name}&rdquo;
            </p>
            <p className='text-xs text-muted-foreground'>
              Este grupo puede eliminarse de forma segura
            </p>
          </div>
        );
      }

      const reasons = [];
      if (group._count.children > 0) {
        reasons.push(
          `Tiene ${group._count.children} sub-grupo${group._count.children !== 1 ? "s" : ""}`
        );
      }
      if (group.referenceCount && group.referenceCount > 0) {
        reasons.push(
          `Referenciado en ${group.referenceCount} paquete${group.referenceCount !== 1 ? "s" : ""}`
        );
      }

      return (
        <div className='space-y-2 max-w-sm'>
          <p className='font-medium text-orange-400'>⚠️ No se puede eliminar</p>
          <div className='space-y-1'>
            {reasons.map((reason, index) => (
              <p
                key={index}
                className='text-xs text-muted-foreground flex items-start gap-1'
              >
                <span className='text-orange-400'>•</span>
                {reason}
              </p>
            ))}
          </div>

          {/* Mostrar paquetes específicos si hay referencias */}
          {group.referencedBy && group.referencedBy.length > 0 && (
            <div className='pt-1 border-t border-muted'>
              <p className='text-xs font-medium text-muted-foreground mb-1'>
                📦 Paquetes que lo referencian:
              </p>
              <div className='space-y-1 max-h-20 overflow-y-auto'>
                {group.referencedBy.map((ref, index) => (
                  <div
                    key={index}
                    className='text-xs text-muted-foreground flex items-center gap-1'
                  >
                    <span className='text-blue-400'>•</span>
                    <span>Referencia desde paquete {ref.sourceGroupId}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewReferences(group);
                }}
                className='text-xs text-blue-400 hover:text-blue-300 underline mt-1'
              >
                Ver y gestionar referencias →
              </button>
            </div>
          )}

          <div className='pt-1 border-t border-muted'>
            <p className='text-xs text-muted-foreground'>
              💡 Para eliminar este grupo:
            </p>
            {group._count.children > 0 && (
              <p className='text-xs text-muted-foreground'>
                • Mueve o elimina sus sub-grupos primero
              </p>
            )}
            {group.referenceCount && group.referenceCount > 0 && (
              <p className='text-xs text-muted-foreground'>
                • Elimina las referencias desde los paquetes que lo usan
              </p>
            )}
          </div>
        </div>
      );
    };

    // Acciones normales para grupos no-referencia
    return (
      <TooltipProvider>
        <div className='flex items-center gap-1'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => openCreateModal(group)}
                className='text-primary hover:text-primary'
              >
                <PlusIcon className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Agregar sub-grupo a &ldquo;{group.name}&rdquo;</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => openEditModal(group)}
                className='text-muted-foreground hover:text-foreground'
              >
                <PencilIcon className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar grupo &ldquo;{group.name}&rdquo;</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "inline-flex",
                  !canDelete && "cursor-not-allowed"
                )}
                style={{ pointerEvents: !canDelete ? "auto" : undefined }}
              >
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => canDelete && handleDeleteGroup(group)}
                  className={cn(
                    canDelete
                      ? "text-destructive hover:text-destructive"
                      : "text-muted-foreground/50 pointer-events-none"
                  )}
                  disabled={!canDelete}
                  style={{ pointerEvents: !canDelete ? "none" : undefined }}
                >
                  <TrashIcon className='h-4 w-4' />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent className='p-0'>
              <div className='p-3'>{getDeleteTooltipContent()}</div>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  };

  // Legacy function kept for backward compatibility
  const renderGroupTree = (
    groupList: MeetGroup[],
    level: number = 0
  ): React.ReactNode => {
    return groupList.map((group) => (
      <div key={group.id} className='select-none'>
        <div
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors",
            level > 0 && "ml-6 border-l border-muted pl-4"
          )}
        >
          {/* Expand/Collapse button */}
          {group.children.length > 0 && (
            <Button
              variant='ghost'
              size='sm'
              className='h-6 w-6 p-0'
              onClick={() => toggleExpand(group.id)}
            >
              {expandedGroups.has(group.id) ? (
                <ChevronDownIcon className='h-4 w-4' />
              ) : (
                <ChevronRightIcon className='h-4 w-4' />
              )}
            </Button>
          )}

          {/* Group Icon/Color */}
          <div
            className='h-4 w-4 rounded border'
            style={{ backgroundColor: group.color }}
          />

          {/* Group Info */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2'>
              <span className='font-medium truncate'>{group.name}</span>
              <Badge variant='outline' className='text-xs'>
                {group.slug}
              </Badge>
              {group._count.spaceGroups > 0 && (
                <Badge variant='secondary' className='text-xs'>
                  {group._count.spaceGroups} salas
                </Badge>
              )}
              {group._count.defaultTags > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant='default' className='text-xs cursor-help'>
                        {group._count.defaultTags} tags
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className='space-y-2 max-w-xs max-h-64 overflow-y-auto'>
                        <div className='font-semibold text-sm'>
                          Tags automáticos del grupo:
                        </div>
                        {group.defaultTags.map((dt) => (
                          <div
                            key={dt.tag.id}
                            className='flex items-center gap-2 text-xs'
                          >
                            <div
                              className='h-2 w-2 rounded-full'
                              style={{ backgroundColor: dt.tag.color }}
                            />
                            <span className='font-medium'>
                              #{dt.tag.customId || dt.tag.name}
                            </span>
                            {dt.tag.customId && (
                              <span className='text-muted-foreground'>
                                ({dt.tag.name})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {(() => {
              const description = showPublicView
                ? group.publicDescription
                : group.internalDescription;
              return (
                description && (
                  <p className='text-sm text-muted-foreground truncate'>
                    {description}
                  </p>
                )
              );
            })()}
            {/* Default tags preview */}
            {group.defaultTags.length > 0 && (
              <div className='flex gap-1 mt-1 flex-wrap'>
                {group.defaultTags.slice(0, 10).map((dt) => (
                  <TooltipProvider key={dt.tag.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className='flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs cursor-help'>
                          <div
                            className='h-2 w-2 rounded-full'
                            style={{ backgroundColor: dt.tag.color }}
                          />
                          <span>#{dt.tag.customId || dt.tag.name}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className='space-y-1'>
                          <div className='font-semibold'>
                            #{dt.tag.customId || dt.tag.name}
                          </div>
                          {dt.tag.customId && (
                            <div className='text-xs text-muted-foreground'>
                              Nombre: {dt.tag.name}
                            </div>
                          )}
                          {dt.tag.slug && (
                            <div className='text-xs text-muted-foreground'>
                              Slug: {dt.tag.slug}
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {group.defaultTags.length > 10 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant='outline'
                          className='text-xs cursor-help'
                        >
                          +{group.defaultTags.length - 10}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className='space-y-2 max-w-xs max-h-64 overflow-y-auto'>
                          <div className='font-semibold text-sm'>
                            Tags adicionales:
                          </div>
                          {group.defaultTags.slice(10).map((dt) => (
                            <div
                              key={dt.tag.id}
                              className='flex items-center gap-2 text-xs'
                            >
                              <div
                                className='h-2 w-2 rounded-full'
                                style={{ backgroundColor: dt.tag.color }}
                              />
                              <span className='font-medium'>
                                #{dt.tag.customId || dt.tag.name}
                              </span>
                              {dt.tag.customId && (
                                <span className='text-muted-foreground'>
                                  ({dt.tag.name})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => openEditModal(group)}
            >
              <PencilIcon className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => handleDeleteGroup(group)}
              className='text-destructive hover:text-destructive'
            >
              <TrashIcon className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Render children if expanded */}
        {expandedGroups.has(group.id) && group.children.length > 0 && (
          <div className='mt-1'>
            {renderGroupTree(group.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  // Filtrar grupos por búsqueda
  // Helper function to add references as children to groups
  const addReferencesToGroups = (groupList: MeetGroup[]): MeetGroup[] => {
    return groupList.map((group) => {
      const groupWithRefs = { ...group };

      // Si el grupo tiene referencias, agregamos como hijos
      if (group.references && group.references.length > 0) {
        const referenceChildren = group.references.map((ref, index) => ({
          ...ref.targetGroup,
          id: `ref-${ref.id}`, // ID único para la referencia
          originalGroupId: ref.targetGroup.id, // Guardamos el ID original
          isReference: true,
          level: group.level + 1,
          path: `${group.path}.ref-${ref.id}`,
          parentId: group.id,
          children: [], // Las referencias no tienen hijos por ahora
          order: ref.order || 1000 + index, // Referencias al final
          _count: {
            children: 0,
            spaceGroups: 0, // Las referencias no tienen salas propias
            defaultTags: 0, // Las referencias no tienen tags propios
          },
          defaultTags: [],
          createdAt: ref.createdAt,
          isActive: true,
          allowsReferences: false, // Las referencias no permiten sub-referencias
        }));

        // Combinamos hijos normales con referencias
        groupWithRefs.children = [
          ...addReferencesToGroups(group.children), // Recursivo para hijos normales
          ...referenceChildren,
        ].sort((a, b) => {
          // Primero hijos normales, luego referencias
          if (!a.isReference && b.isReference) return -1;
          if (a.isReference && !b.isReference) return 1;
          // Dentro del mismo tipo, por order
          return a.order - b.order;
        });
      } else {
        // Solo procesar hijos recursivamente
        groupWithRefs.children = addReferencesToGroups(group.children);
      }

      return groupWithRefs;
    });
  };

  // Función auxiliar para buscar un grupo en la jerarquía
  const findGroupInHierarchy = React.useCallback(
    (groupList: MeetGroup[], targetId: string): MeetGroup | null => {
      for (const group of groupList) {
        if (group.id === targetId) return group;
        const found = findGroupInHierarchy(group.children, targetId);
        if (found) return found;
      }
      return null;
    },
    []
  );

  const { filteredGroups, orphanGroups } = React.useMemo(() => {
    // Primero agregamos las referencias como hijos
    const groupsWithReferences = addReferencesToGroups(groups);

    const filterGroups = (groupList: MeetGroup[]): MeetGroup[] => {
      return groupList.reduce((acc: MeetGroup[], group) => {
        let matchesSearch = !searchTerm.trim();

        if (searchTerm.trim()) {
          // Buscar en múltiples campos con búsqueda fuzzy
          const searchFields = [
            group.name,
            group.slug,
            group.customId,
            group.internalDescription,
            group.publicDescription,
          ].filter(Boolean);

          matchesSearch = searchFields.some((field) =>
            fuzzySearchGroup(searchTerm, field as string)
          );
        }

        const filteredChildren = filterGroups(group.children);

        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...group,
            children: filteredChildren,
          });
        }

        return acc;
      }, []);
    };

    const filtered = filterGroups(groupsWithReferences);

    // Separar grupos huérfanos (aquellos que deberían tener parent pero no lo tienen en la jerarquía actual)
    const findOrphanGroups = (flatGroupsList: MeetGroup[]): MeetGroup[] => {
      return flatGroupsList.filter((group) => {
        // Un grupo es huérfano si tiene parentId pero su parent no existe en la estructura actual
        if (!group.parentId) return false;

        // Verificar si existe el parent en la estructura jerárquica
        const parentExists = findGroupInHierarchy(filtered, group.parentId);
        return !parentExists;
      });
    };

    const orphans = findOrphanGroups(flatGroups);

    return {
      filteredGroups: filtered,
      orphanGroups: orphans,
    };
  }, [groups, flatGroups, searchTerm, findGroupInHierarchy]);

  // Filtrar tags por búsqueda
  const filteredTags = React.useMemo(() => {
    if (!tagSearchTerm.trim()) return hierarchicalTags;

    const filterTags = (tagList: MeetTag[]): MeetTag[] => {
      return tagList.reduce((acc: MeetTag[], tag) => {
        // Buscar en múltiples campos con búsqueda fuzzy
        const searchFields = [tag.name, tag.slug, tag.customId].filter(Boolean);

        const matchesSearch = searchFields.some((field) =>
          fuzzySearchGroup(tagSearchTerm, field as string)
        );

        const filteredChildren = tag.children ? filterTags(tag.children) : [];

        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...tag,
            children: filteredChildren,
          });
        }

        return acc;
      }, []);
    };

    return filterTags(hierarchicalTags);
  }, [hierarchicalTags, tagSearchTerm]);

  // Crear jerarquía para referencias, similar a como se hace con tags
  const filteredReferencesGroupsHierarchy = React.useMemo(() => {
    if (!referenceSearchTerm) return groups; // usar groups que contiene la jerarquía

    const filterGroups = (groupList: MeetGroup[]): MeetGroup[] => {
      return groupList.reduce((acc: MeetGroup[], group) => {
        const matchesSearch =
          group.name
            .toLowerCase()
            .includes(referenceSearchTerm.toLowerCase()) ||
          group.slug
            .toLowerCase()
            .includes(referenceSearchTerm.toLowerCase()) ||
          (group.customId &&
            group.customId
              .toLowerCase()
              .includes(referenceSearchTerm.toLowerCase())) ||
          group.internalDescription
            ?.toLowerCase()
            .includes(referenceSearchTerm.toLowerCase());
        const filteredChildren = group.children
          ? filterGroups(group.children)
          : [];
        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...group,
            children: filteredChildren,
          });
        }
        return acc;
      }, []);
    };
    return filterGroups(groups);
  }, [groups, referenceSearchTerm]);

  // Renderizar lista de tags para selección
  const renderTagList = () => {
    const renderTagsHierarchical = (
      tagList: MeetTag[],
      level: number = 0
    ): React.ReactNode => {
      return tagList.map((tag) => (
        <React.Fragment key={tag.id}>
          <div
            className={cn(
              "flex items-center space-x-2 py-1",
              !tag.isActive && "opacity-50"
            )}
          >
            <Checkbox
              id={tag.id}
              checked={formData.defaultTagIds.includes(tag.id)}
              onCheckedChange={() => toggleDefaultTag(tag.id)}
              disabled={!tag.isActive}
              className='h-4 w-4 rounded border-2 border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary'
            />
            <label
              htmlFor={tag.id}
              className={cn(
                "flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1",
                tag.isActive ? "cursor-pointer" : "cursor-not-allowed",
                !tag.isActive && "text-muted-foreground"
              )}
              style={{ paddingLeft: `${level * 20}px` }}
            >
              <div
                className={cn(
                  "h-3 w-3 rounded-full flex-shrink-0",
                  !tag.isActive && "opacity-50"
                )}
                style={{ backgroundColor: tag.color }}
              />
              <span
                className={cn(
                  tag.isActive ? "text-foreground" : "text-muted-foreground",
                  level === 0 && "font-semibold"
                )}
              >
                {tag.name}
              </span>
              <Badge
                variant='outline'
                className={cn(
                  "text-xs",
                  !tag.isActive && "border-muted text-muted-foreground"
                )}
              >
                {tag.slug}
              </Badge>
              {tag.customId && (
                <Badge
                  variant='secondary'
                  className={cn(
                    "text-xs",
                    !tag.isActive && "bg-muted/50 text-muted-foreground"
                  )}
                >
                  {tag.customId}
                </Badge>
              )}
              {!tag.isActive && (
                <Badge
                  variant='outline'
                  className='text-xs border-orange-300 text-orange-600'
                >
                  Inactivo
                </Badge>
              )}
            </label>
          </div>
          {tag.children &&
            tag.children.length > 0 &&
            renderTagsHierarchical(tag.children, level + 1)}
        </React.Fragment>
      ));
    };

    return renderTagsHierarchical(filteredTags);
  };

  // Renderizar selector de referencias
  // Función para alternar referencia (similar a toggleDefaultTag)
  const toggleReference = (groupId: string) => {
    if (!selectedGroup) return;

    const existingReference = selectedGroup.references?.find(
      (ref) => ref.targetGroupId === groupId
    );

    if (existingReference) {
      // Remover referencia
      handleRemoveReference(existingReference.id);
    } else {
      // Agregar referencia (sin contexto adicional por ahora)
      handleAddReference(groupId);
    }
  };

  // Renderizar grupos de referencia con jerarquía, similar a como se hace con tags
  const renderReferencesHierarchical = (
    groupList: MeetGroup[],
    level: number = 0
  ): React.ReactNode => {
    return groupList
      .filter((group) => group.id !== selectedGroup?.id) // No mostrar el grupo actual
      .map((group) => {
        const isReferenced =
          selectedGroup?.references?.some(
            (ref) => ref.targetGroupId === group.id
          ) || false;
        const canBeReferenced =
          group.allowsReferences === true && group.isActive;

        return (
          <React.Fragment key={group.id}>
            <div
              className={cn(
                "flex items-center space-x-2 py-1",
                !canBeReferenced && "opacity-50"
              )}
            >
              <Checkbox
                id={`ref-${group.id}`}
                checked={isReferenced}
                onCheckedChange={() => toggleReference(group.id)}
                disabled={!canBeReferenced}
                className='h-4 w-4 rounded border-2 border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary'
              />
              <label
                htmlFor={`ref-${group.id}`}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer",
                  canBeReferenced ? "cursor-pointer" : "cursor-not-allowed",
                  !canBeReferenced && "text-muted-foreground"
                )}
                style={{ paddingLeft: `${level * 20}px` }}
              >
                <div
                  className={cn(
                    "h-3 w-3 rounded-full flex-shrink-0 border border-border/50",
                    !canBeReferenced && "opacity-50"
                  )}
                  style={{ backgroundColor: group.color }}
                />
                <span
                  className={cn(
                    canBeReferenced
                      ? "text-foreground"
                      : "text-muted-foreground",
                    level === 0 && "font-semibold"
                  )}
                >
                  {group.name}
                </span>
                <Badge
                  variant='outline'
                  className={cn(
                    "text-xs",
                    !canBeReferenced && "border-muted text-muted-foreground"
                  )}
                >
                  {group.slug}
                </Badge>
                {group.customId && (
                  <Badge
                    variant='secondary'
                    className={cn(
                      "text-xs",
                      !canBeReferenced && "bg-muted/50 text-muted-foreground"
                    )}
                  >
                    {group.customId}
                  </Badge>
                )}
                {isReferenced && (
                  <Badge
                    variant='outline'
                    className='text-xs text-primary border-primary/30 bg-primary/5'
                  >
                    REF
                  </Badge>
                )}
                {!canBeReferenced && (
                  <Badge
                    variant='outline'
                    className='text-xs border-orange-300 text-orange-600'
                  >
                    No disponible
                  </Badge>
                )}
              </label>
            </div>
            {/* Renderizar hijos si los tiene */}
            {group.children &&
              group.children.length > 0 &&
              renderReferencesHierarchical(group.children, level + 1)}
          </React.Fragment>
        );
      });
  };

  // Función de renderizado completo para referencias
  const renderReferencesList = () => {
    return renderReferencesHierarchical(filteredReferencesGroupsHierarchy);
  };

  const renderReferenceSelector = () => {
    return (
      <div className='space-y-4'>
        <div className='space-y-3'>
          <div>
            <Label className='text-base font-semibold'>Referencias</Label>
            <p className='text-sm text-muted-foreground mt-1'>
              Selecciona los servicios/masters que este paquete debe incluir
              como referencias.
            </p>
          </div>

          {/* Buscador de referencias */}
          <div className='relative'>
            <Input
              placeholder='Buscar grupos por nombre, slug, ID o descripción...'
              value={referenceSearchTerm}
              onChange={(e) => setReferenceSearchTerm(e.target.value)}
              className='pl-8'
            />
            <div className='absolute left-2 top-1/2 transform -translate-y-1/2'>
              <MagnifyingGlassIcon className='h-4 w-4 text-muted-foreground' />
            </div>
          </div>
        </div>

        <ScrollArea className='h-[340px] border rounded-md p-3'>
          <div className='space-y-1'>
            {filteredReferencesGroupsHierarchy.length > 0 ? (
              renderReferencesList()
            ) : (
              <div className='text-center text-sm text-muted-foreground py-4'>
                {referenceSearchTerm
                  ? "No se encontraron grupos que coincidan con la búsqueda."
                  : "Cargando grupos disponibles..."}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Contador de referencias */}
        <div className='text-sm text-muted-foreground font-medium'>
          {selectedGroup?.references
            ? `${selectedGroup.references.length} referencia${selectedGroup.references.length !== 1 ? "s" : ""} seleccionada${selectedGroup.references.length !== 1 ? "s" : ""}`
            : "Sin referencias seleccionadas"}
        </div>

        {/* Resumen mejorado de referencias seleccionadas */}
        {selectedGroup?.references && selectedGroup.references.length > 0 && (
          <div className='space-y-3 p-4 bg-primary/5 border border-primary/20 rounded-lg'>
            <div className='flex items-center gap-2'>
              <LinkIcon className='h-4 w-4 text-primary' />
              <span className='text-sm font-medium text-foreground'>
                Referencias Activas
              </span>
            </div>
            <div className='grid gap-2'>
              {selectedGroup.references
                .sort((a, b) => a.order - b.order)
                .map((reference) => (
                  <div
                    key={reference.id}
                    className='space-y-3 p-3 bg-card border border-primary/10 rounded-lg'
                  >
                    {/* Header con información básica */}
                    <div className='flex items-center gap-3'>
                      <div
                        className='h-3 w-3 rounded-full flex-shrink-0 border border-border/50'
                        style={{ backgroundColor: reference.targetGroup.color }}
                      />
                      <span className='text-sm font-medium flex-1 text-foreground'>
                        {reference.displayName || reference.targetGroup.name}
                      </span>
                      <div className='flex items-center gap-1'>
                        {reference.targetGroup.customId && (
                          <Badge variant='secondary' className='text-xs'>
                            {reference.targetGroup.customId}
                          </Badge>
                        )}
                        {reference.displayName &&
                          reference.displayName !==
                            reference.targetGroup.name && (
                            <Badge variant='outline' className='text-xs'>
                              Original: {reference.targetGroup.name}
                            </Badge>
                          )}
                        <Badge variant='outline' className='text-xs'>
                          #{reference.order}
                        </Badge>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => startEditReference(reference)}
                        className='h-7 w-7 p-0'
                      >
                        <PencilIcon className='h-3 w-3' />
                      </Button>
                    </div>

                    {/* Descripción personalizada si existe */}
                    {reference.description && (
                      <div className='text-xs text-muted-foreground bg-muted/50 p-2 rounded'>
                        {reference.description}
                      </div>
                    )}

                    {/* Formulario de edición */}
                    {editingReference?.id === reference.id && (
                      <div className='space-y-3 border-t pt-3'>
                        <div className='grid gap-3'>
                          <div className='space-y-2'>
                            <Label className='text-xs'>
                              Nombre Personalizado
                            </Label>
                            <Input
                              value={referenceEditForm.displayName}
                              onChange={(e) =>
                                setReferenceEditForm((prev) => ({
                                  ...prev,
                                  displayName: e.target.value,
                                }))
                              }
                              placeholder={reference.targetGroup.name}
                              className='h-8 text-sm'
                            />
                          </div>
                          <div className='space-y-2'>
                            <Label className='text-xs'>
                              Descripción en el Paquete
                            </Label>
                            <Textarea
                              value={referenceEditForm.description}
                              onChange={(e) =>
                                setReferenceEditForm((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              placeholder='Descripción específica para este paquete...'
                              rows={2}
                              className='text-sm'
                            />
                          </div>
                          <div className='space-y-2'>
                            <Label className='text-xs'>Orden</Label>
                            <Input
                              type='number'
                              value={referenceEditForm.order}
                              onChange={(e) =>
                                setReferenceEditForm((prev) => ({
                                  ...prev,
                                  order: parseInt(e.target.value) || 0,
                                }))
                              }
                              className='h-8 text-sm'
                            />
                          </div>
                        </div>
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            onClick={() => handleEditReference(reference.id)}
                            className='h-7 text-xs'
                          >
                            Guardar
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={cancelEditReference}
                            className='h-7 text-xs'
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold flex items-center gap-2'>
            <FolderIcon className='h-8 w-8 text-primary' />
            Gestión de Grupos
          </h1>
          <p className='text-muted-foreground mt-1'>
            Organiza las salas de Meet con grupos jerárquicos y tags automáticos
          </p>
        </div>
        <div className='flex gap-2'>
          {/* Toggle View */}
          <div className='flex items-center gap-2 px-3 py-1 border rounded-md bg-background'>
            <BuildingOfficeIcon className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm text-muted-foreground'>Vista:</span>
            <Button
              variant={!showPublicView ? "default" : "ghost"}
              size='sm'
              onClick={() => setShowPublicView(false)}
              className='h-7 px-2 text-xs'
            >
              Interna
            </Button>
            <Button
              variant={showPublicView ? "default" : "ghost"}
              size='sm'
              onClick={() => setShowPublicView(true)}
              className='h-7 px-2 text-xs'
            >
              <EyeIcon className='h-3 w-3 mr-1' />
              Pública
            </Button>
          </div>

          {/* Expand/Collapse Controls */}
          {(filteredGroups.length > 0 || orphanGroups.length > 0) && (
            <div className='flex items-center gap-1 px-2 py-1 border rounded-md bg-background'>
              <Button
                variant='ghost'
                size='sm'
                onClick={expandAll}
                className='h-7 px-2 text-xs'
              >
                <ChevronDownIcon className='h-3 w-3 mr-1' />
                Expandir
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={collapseAll}
                className='h-7 px-2 text-xs'
              >
                <ChevronRightIcon className='h-3 w-3 mr-1' />
                Contraer
              </Button>
            </div>
          )}

          <Button
            onClick={fetchGroups}
            variant='outline'
            size='sm'
            disabled={loading}
          >
            <ArrowPathIcon
              className={cn("h-4 w-4 mr-2", loading && "animate-spin")}
            />
            Actualizar
          </Button>
          <Button onClick={() => openCreateModal()}>
            <PlusIcon className='h-4 w-4 mr-2' />
            Nuevo Grupo
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className='pt-6'>
          <div className='relative'>
            <Input
              placeholder='Buscar por nombre, slug, descripción interna o pública...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-4'
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Grupos</CardTitle>
            <FolderIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{flatGroups.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Grupos Raíz</CardTitle>
            <FolderIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{groups.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>En Uso</CardTitle>
            <FolderIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {flatGroups.filter((g) => g._count.spaceGroups > 0).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Con Tags Automáticos
            </CardTitle>
            <TagIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {flatGroups.filter((g) => g._count.defaultTags > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Groups Tree */}
      <Card>
        <CardHeader>
          <CardTitle>Estructura de Grupos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <Icons.SpinnerIcon className='h-8 w-8 animate-spin text-primary' />
            </div>
          ) : filteredGroups.length === 0 && orphanGroups.length === 0 ? (
            <div className='text-center py-12'>
              <FolderIcon className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-1'>No hay grupos</h3>
              <p className='text-muted-foreground mb-4'>
                {searchTerm
                  ? "No se encontraron grupos que coincidan con tu búsqueda"
                  : "Aún no has creado ningún grupo"}
              </p>
              {!searchTerm && (
                <Button onClick={() => openCreateModal()}>
                  <PlusIcon className='h-4 w-4 mr-2' />
                  Crear Primer Grupo
                </Button>
              )}
            </div>
          ) : (
            <div className='space-y-4'>
              {/* Grupos con jerarquía normal */}
              {filteredGroups.length > 0 && (
                <HierarchyTree
                  items={filteredGroups as any[]}
                  onEdit={openEditModal as any}
                  onDelete={handleDeleteGroup as any}
                  onAddChild={openCreateModal as any}
                  renderItemContent={renderGroupContent as any}
                  renderItemActions={renderGroupActions as any}
                  maxInitialLevel={0}
                  expandedItems={expandedGroups}
                  onToggleExpand={toggleExpand}
                />
              )}

              {/* Accordion para grupos huérfanos (sin parentID válido) */}
              {orphanGroups.length > 0 && (
                <Accordion
                  type='single'
                  collapsible
                  className='w-full'
                  value={accordionValue}
                  onValueChange={setAccordionValue}
                >
                  <AccordionItem value='orphan-groups'>
                    <AccordionTrigger className='text-orange-600'>
                      <div className='flex items-center gap-2'>
                        <ExclamationTriangleIcon className='h-4 w-4' />
                        Grupos sin parent identificado ({orphanGroups.length})
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className='space-y-2 pl-4'>
                        {orphanGroups.map((group) => (
                          <div
                            key={group.id}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors border border-orange-200",
                              !group.isActive && "opacity-50"
                            )}
                          >
                            {renderGroupContent(group)}
                            {renderGroupActions(group)}
                          </div>
                        ))}
                        <div className='pt-2 text-sm text-muted-foreground'>
                          <p>
                            Estos grupos tienen un parent ID asignado pero el
                            grupo padre no existe en la estructura actual.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unified Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='max-w-4xl h-[85vh] flex flex-col'>
          <DialogHeader className='flex-shrink-0'>
            <DialogTitle>
              {modalMode === "create"
                ? formData.parentId
                  ? "Crear Sub-Grupo"
                  : "Crear Nuevo Grupo"
                : "Editar Grupo"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? formData.parentId
                  ? `Crea un sub-grupo dentro de "${flatGroups.find((g) => g.id === formData.parentId)?.name}"`
                  : "Crea un grupo para organizar las salas de Meet con tags automáticos"
                : "Modifica la información del grupo y sus configuraciones"}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue='general' className='flex-1 flex flex-col min-h-0'>
            <TabsList
              className={cn(
                "flex-shrink-0",
                modalMode === "create"
                  ? "grid w-full grid-cols-3" // Solo 3 tabs en create (sin referencias ni metadata)
                  : "grid w-full grid-cols-5" // 5 tabs en edit
              )}
            >
              <TabsTrigger value='general'>General</TabsTrigger>
              <TabsTrigger value='organizacion'>Organización</TabsTrigger>
              <TabsTrigger value='tags'>Tags</TabsTrigger>
              {modalMode === "edit" && (
                <>
                  <TabsTrigger value='referencias'>Referencias</TabsTrigger>
                  <TabsTrigger value='metadata'>Metadata</TabsTrigger>
                </>
              )}
            </TabsList>

            <div className='flex-1 mt-4 min-h-0'>
              <TabsContent
                value='general'
                className='h-full m-0 data-[state=active]:flex data-[state=active]:flex-col'
              >
                <ScrollArea className='flex-1'>
                  <div className='space-y-4 pr-4'>
                    {modalMode === "edit" && (
                      <div className='space-y-2'>
                        <Label htmlFor='edit-id'>ID del Grupo</Label>
                        <Input
                          id='edit-id'
                          value={selectedGroup?.id || ""}
                          disabled
                          className='bg-muted'
                        />
                      </div>
                    )}
                    <div className='space-y-2'>
                      <Label htmlFor='name'>Nombre *</Label>
                      <Input
                        id='name'
                        value={formData.name}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }));
                          if (
                            !formData.slug ||
                            formData.slug ===
                              formData.name.toLowerCase().replace(/\s+/g, "-")
                          ) {
                            generateSlug(e.target.value);
                          }
                        }}
                        placeholder='Nombre del grupo'
                        className={formErrors.name ? "border-destructive" : ""}
                      />
                      {formErrors.name && (
                        <p className='text-sm text-destructive'>
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='slug'>Slug *</Label>
                      <Input
                        id='slug'
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            slug: e.target.value,
                          }))
                        }
                        placeholder='grupo-slug'
                        className={formErrors.slug ? "border-destructive" : ""}
                      />
                      {formErrors.slug && (
                        <p className='text-sm text-destructive'>
                          {formErrors.slug}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='internalDescription'>
                        Descripción Interna
                      </Label>
                      <Textarea
                        id='internalDescription'
                        value={formData.internalDescription}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            internalDescription: e.target.value,
                          }))
                        }
                        placeholder='Descripción para uso interno del equipo'
                        rows={2}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='publicDescription'>
                        Descripción Pública
                      </Label>
                      <Textarea
                        id='publicDescription'
                        value={formData.publicDescription}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            publicDescription: e.target.value,
                          }))
                        }
                        placeholder='Descripción visible para clientes'
                        rows={2}
                      />
                    </div>

                    {/* Active Status Toggle */}
                    <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                      <div>
                        <label className='text-sm font-medium text-gray-700'>
                          Estado del Grupo
                        </label>
                        <p className='text-xs text-gray-500 mt-1'>
                          Los grupos inactivos no aparecen en listados públicos
                        </p>
                      </div>
                      <label className='relative inline-flex items-center cursor-pointer'>
                        <input
                          type='checkbox'
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isActive: e.target.checked,
                            })
                          }
                          className='sr-only peer'
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        <span className='ml-3 text-sm font-medium text-gray-700'>
                          {formData.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </label>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='customId'>ID Personalizado</Label>
                        <Input
                          id='customId'
                          value={formData.customId}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              customId: e.target.value,
                            }))
                          }
                          placeholder='GRP-001'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='order'>Orden</Label>
                        <Input
                          id='order'
                          type='number'
                          value={formData.order}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              order: parseInt(e.target.value) || 0,
                            }))
                          }
                          placeholder='0'
                        />
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value='organizacion'
                className='h-full m-0 data-[state=active]:flex data-[state=active]:flex-col'
              >
                <ScrollArea className='flex-1'>
                  <div className='space-y-4 pr-4'>
                    <div className='space-y-3'>
                      <div>
                        <Label htmlFor='edit-parent'>Grupo Padre</Label>
                        <p className='text-sm text-muted-foreground mt-1'>
                          Selecciona el grupo padre para crear una jerarquía
                        </p>
                      </div>

                      {/* Buscador de grupos padre */}
                      <div className='relative'>
                        <Input
                          placeholder='Buscar grupo padre por nombre, slug o ID...'
                          value={parentGroupSearchTerm}
                          onChange={(e) =>
                            setParentGroupSearchTerm(e.target.value)
                          }
                          className='pl-8'
                        />
                        <div className='absolute left-2 top-1/2 transform -translate-y-1/2'>
                          <MagnifyingGlassIcon className='h-4 w-4 text-muted-foreground' />
                        </div>
                      </div>

                      {/* Grupo padre seleccionado actualmente */}
                      {formData.parentId && (
                        <div className='p-3 bg-primary/5 border border-primary/20 rounded-lg'>
                          <div className='flex items-center gap-2'>
                            <span className='text-sm font-medium text-foreground'>
                              Padre seleccionado:
                            </span>
                            {(() => {
                              const selectedParent = flatGroups.find(
                                (group) => group.id === formData.parentId
                              );
                              return selectedParent ? (
                                <div className='flex items-center gap-2'>
                                  <div
                                    className='h-3 w-3 rounded-full flex-shrink-0 border border-border/50'
                                    style={{
                                      backgroundColor: selectedParent.color,
                                    }}
                                  />
                                  <span className='text-sm'>
                                    {selectedParent.name}
                                  </span>
                                  {selectedParent.customId && (
                                    <Badge
                                      variant='secondary'
                                      className='text-xs'
                                    >
                                      {selectedParent.customId}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className='text-sm text-muted-foreground'>
                                  Grupo no encontrado
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Lista de grupos padre disponibles */}
                      <ScrollArea className='h-[340px] border rounded-md p-3'>
                        <div className='space-y-1'>
                          {/* Opción "Sin padre" - Estilo elegante como tags */}
                          <div className='flex items-center space-x-2 py-1 px-2'>
                            <input
                              type='radio'
                              id='parent-root'
                              name='parentGroup'
                              checked={!formData.parentId}
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  parentId: "",
                                }))
                              }
                              className='h-4 w-4 text-primary border-2 border-input bg-background rounded-full focus:ring-1  focus:ring-offset-0 f accent-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:border-primary'
                            />
                            <label
                              htmlFor='parent-root'
                              className='flex items-center gap-2 text-sm font-medium leading-none cursor-pointer flex-1'
                            >
                              <div className='h-3 w-3 rounded-full bg-muted border border-border flex-shrink-0' />
                              <span className='font-semibold text-foreground'>
                                Sin padre (grupo raíz)
                              </span>
                              <Badge variant='outline' className='text-xs'>
                                root
                              </Badge>
                            </label>
                          </div>

                          {/* Grupos disponibles con jerarquía - Similar al renderizado de tags */}
                          {(() => {
                            const renderGroupsHierarchical = (
                              groupList: MeetGroup[],
                              level: number = 0
                            ): React.ReactNode => {
                              return groupList
                                .filter(
                                  (group) => group.id !== selectedGroup?.id
                                ) // No puede ser padre de sí mismo
                                .map((group) => (
                                  <React.Fragment key={group.id}>
                                    <div className='flex items-center space-x-2 py-1 px-2'>
                                      <input
                                        type='radio'
                                        id={`parent-${group.id}`}
                                        name='parentGroup'
                                        checked={formData.parentId === group.id}
                                        onChange={() =>
                                          setFormData((prev) => ({
                                            ...prev,
                                            parentId: group.id,
                                          }))
                                        }
                                        className='h-4 w-4 text-primary border-2 border-input bg-background rounded-full focus:ring-1 focus:ring-offset-0 accent-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:border-primary'
                                      />
                                      <label
                                        htmlFor={`parent-${group.id}`}
                                        className='flex items-center gap-2 text-sm font-medium leading-none cursor-pointer flex-1'
                                        style={{
                                          paddingLeft: `${level * 20}px`,
                                        }}
                                      >
                                        <div
                                          className='h-3 w-3 rounded-full flex-shrink-0 border border-border/50'
                                          style={{
                                            backgroundColor: group.color,
                                          }}
                                        />
                                        <span
                                          className={cn(
                                            "text-foreground",
                                            level === 0 && "font-semibold"
                                          )}
                                        >
                                          {group.name}
                                        </span>
                                        <Badge
                                          variant='outline'
                                          className='text-xs'
                                        >
                                          {group.slug}
                                        </Badge>
                                        {group.customId && (
                                          <Badge
                                            variant='secondary'
                                            className='text-xs'
                                          >
                                            {group.customId}
                                          </Badge>
                                        )}
                                      </label>
                                    </div>
                                    {/* Renderizar hijos si los tiene */}
                                    {group.children &&
                                      group.children.length > 0 &&
                                      renderGroupsHierarchical(
                                        group.children,
                                        level + 1
                                      )}
                                  </React.Fragment>
                                ));
                            };

                            return renderGroupsHierarchical(
                              filteredParentGroups
                            );
                          })()}

                          {filteredParentGroups.filter(
                            (group) => group.id !== selectedGroup?.id
                          ).length === 0 && (
                            <div className='text-center text-sm text-muted-foreground py-4'>
                              {parentGroupSearchTerm
                                ? "No se encontraron grupos que coincidan con la búsqueda."
                                : "No hay grupos disponibles como padres."}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='edit-order'>Orden</Label>
                      <Input
                        id='edit-order'
                        type='number'
                        value={formData.order}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            order: parseInt(e.target.value) || 0,
                          }))
                        }
                        placeholder='0'
                      />
                      <p className='text-sm text-muted-foreground'>
                        Número que determina el orden de aparición del grupo
                      </p>
                    </div>

                    <div className='space-y-2'>
                      <Label>Color</Label>
                      <div className='flex gap-2 flex-wrap'>
                        {groupColors.map((color) => (
                          <button
                            key={color}
                            type='button'
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, color }))
                            }
                            className={cn(
                              "h-8 w-8 rounded border-2 transition-all",
                              formData.color === color
                                ? "border-foreground scale-110"
                                : "border-muted"
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Color que identificará este grupo en la interfaz
                      </p>
                    </div>

                    {/* Permite Referencias Toggle */}
                    <div className='flex items-center justify-between p-4 bg-blue-50 rounded-lg'>
                      <div>
                        <label className='text-sm font-medium text-gray-700'>
                          Permitir Referencias
                        </label>
                        <p className='text-xs text-gray-500 mt-1'>
                          Si está habilitado, este grupo puede ser referenciado
                          por paquetes
                        </p>
                      </div>
                      <label className='relative inline-flex items-center cursor-pointer'>
                        <input
                          type='checkbox'
                          checked={formData.allowsReferences}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              allowsReferences: e.target.checked,
                            })
                          }
                          className='sr-only peer'
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        <span className='ml-3 text-sm font-medium text-gray-700'>
                          {formData.allowsReferences
                            ? "Habilitado"
                            : "Deshabilitado"}
                        </span>
                      </label>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value='tags'
                className='h-full m-0 data-[state=active]:flex data-[state=active]:flex-col'
              >
                <div className='space-y-4 h-full overflow-hidden'>
                  <div className='flex-shrink-0 space-y-3'>
                    <div>
                      <Label>Tags por Defecto</Label>
                      <p className='text-sm text-muted-foreground mt-1'>
                        Los tags seleccionados se asignarán automáticamente a
                        las salas que se añadan a este grupo
                      </p>
                    </div>

                    {/* Buscador de tags */}
                    <div className='relative'>
                      <Input
                        placeholder='Buscar tags por nombre, slug o ID...'
                        value={tagSearchTerm}
                        onChange={(e) => setTagSearchTerm(e.target.value)}
                        className='pl-8'
                      />
                      <div className='absolute left-2 top-1/2 transform -translate-y-1/2'>
                        <MagnifyingGlassIcon className='h-4 w-4 text-muted-foreground' />
                      </div>
                    </div>
                  </div>
                  <ScrollArea className='h-[340px] border rounded-md p-3'>
                    <div className='space-y-1'>
                      {filteredTags.length === 0 ? (
                        <p className='text-sm text-muted-foreground text-center py-4'>
                          {tagSearchTerm
                            ? "No se encontraron tags que coincidan con la búsqueda."
                            : "No hay tags disponibles. Crea algunos tags primero."}
                        </p>
                      ) : (
                        renderTagList()
                      )}
                    </div>
                  </ScrollArea>

                  {/* Selected Tags Display */}
                  {formData.defaultTagIds.length > 0 && (
                    <div className='flex-shrink-0 space-y-2'>
                      <Label className='text-sm font-medium'>
                        Tags Seleccionados ({formData.defaultTagIds.length})
                      </Label>
                      <div className='flex flex-wrap gap-2 p-3 bg-muted/30 border rounded-md min-h-[60px]'>
                        {formData.defaultTagIds.map((tagId) => {
                          // Buscar el tag en la estructura jerárquica
                          const findTagById = (
                            tagList: MeetTag[],
                            targetId: string
                          ): MeetTag | null => {
                            for (const tag of tagList) {
                              if (tag.id === targetId) return tag;
                              if (tag.children) {
                                const found = findTagById(
                                  tag.children,
                                  targetId
                                );
                                if (found) return found;
                              }
                            }
                            return null;
                          };

                          const tag = findTagById(hierarchicalTags, tagId);
                          if (!tag) return null;
                          return (
                            <div
                              key={tagId}
                              className='inline-flex items-center gap-2 px-3 py-1.5 bg-background border rounded-md text-sm'
                            >
                              <div
                                className='h-2 w-2 rounded-full'
                                style={{ backgroundColor: tag.color }}
                              />
                              <span className='font-medium'>
                                #{tag.customId || tag.name}
                              </span>
                              <button
                                type='button'
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    defaultTagIds: prev.defaultTagIds.filter(
                                      (id) => id !== tagId
                                    ),
                                  }));
                                }}
                                className='ml-1 text-muted-foreground hover:text-destructive transition-colors'
                                title={`Eliminar ${tag.name}`}
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {modalMode === "edit" && (
                <>
                  <TabsContent
                    value='referencias'
                    className='h-full m-0 data-[state=active]:flex data-[state=active]:flex-col'
                  >
                    <div className='flex flex-col h-full'>
                      {selectedGroup && renderReferenceSelector()}

                      {/* Información sobre referencias hacia este grupo */}
                      {selectedGroup?.referenceCount !== undefined &&
                        selectedGroup.referenceCount > 0 && (
                          <div className='mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg'>
                            <div className='flex items-start justify-between'>
                              <div>
                                <h4 className='font-medium text-orange-800 flex items-center gap-2'>
                                  <ExclamationTriangleIcon className='h-4 w-4' />
                                  Referencias Entrantes
                                </h4>
                                <p className='text-sm text-orange-700 mt-1'>
                                  Este grupo está siendo referenciado en{" "}
                                  <strong>
                                    {selectedGroup.referenceCount}
                                  </strong>{" "}
                                  paquete
                                  {selectedGroup.referenceCount !== 1
                                    ? "s"
                                    : ""}
                                </p>
                                <p className='text-xs text-orange-600 mt-2'>
                                  💡 Estas referencias pueden impedir que
                                  elimines este grupo. Puedes revisar y
                                  gestionar estas dependencias.
                                </p>
                              </div>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() =>
                                  handleViewReferences(selectedGroup)
                                }
                                className='text-orange-700 border-orange-300 hover:bg-orange-100'
                              >
                                <LinkIcon className='h-3 w-3 mr-1' />
                                Gestionar
                              </Button>
                            </div>
                          </div>
                        )}

                      {/* Contador de referencias salientes */}
                      <div className='text-sm text-muted-foreground mt-4 p-3 bg-muted rounded-lg'>
                        <strong>Referencias Salientes:</strong>{" "}
                        {selectedGroup?.references
                          ? `${selectedGroup.references.length} referencia${selectedGroup.references.length !== 1 ? "s" : ""} seleccionada${selectedGroup.references.length !== 1 ? "s" : ""}`
                          : "Sin referencias seleccionadas"}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value='metadata'
                    className='h-full m-0 data-[state=active]:flex data-[state=active]:flex-col'
                  >
                    <ScrollArea className='flex-1'>
                      <div className='space-y-6 pr-4'>
                        {selectedGroup && (
                          <>
                            {/* Información de Auditoría */}
                            <div className='space-y-4'>
                              <div>
                                <h3 className='text-lg font-semibold flex items-center gap-2'>
                                  <ClockIcon className='h-5 w-5 text-muted-foreground' />
                                  Auditoría
                                </h3>
                                <p className='text-sm text-muted-foreground'>
                                  Información de creación y modificación del
                                  grupo
                                </p>
                              </div>

                              <div className='grid gap-4 md:grid-cols-2'>
                                <div className='space-y-2'>
                                  <Label className='text-sm font-medium'>
                                    Fecha de Creación
                                  </Label>
                                  <div className='p-3 bg-muted rounded-md'>
                                    <p className='text-sm'>
                                      {new Date(
                                        selectedGroup.createdAt
                                      ).toLocaleString("es-ES", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                </div>

                                {selectedGroup.createdBy && (
                                  <div className='space-y-2'>
                                    <Label className='text-sm font-medium'>
                                      Creado Por
                                    </Label>
                                    <div className='p-3 bg-muted rounded-md'>
                                      <p className='text-sm'>
                                        {selectedGroup.createdBy}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Información de Jerarquía */}
                            <div className='space-y-4'>
                              <div>
                                <h3 className='text-lg font-semibold flex items-center gap-2'>
                                  <FolderIcon className='h-5 w-5 text-muted-foreground' />
                                  Jerarquía
                                </h3>
                                <p className='text-sm text-muted-foreground'>
                                  Posición del grupo en la estructura jerárquica
                                </p>
                              </div>

                              <div className='grid gap-4 md:grid-cols-2'>
                                <div className='space-y-2'>
                                  <Label className='text-sm font-medium'>
                                    Nivel en la Jerarquía
                                  </Label>
                                  <div className='p-3 bg-muted rounded-md'>
                                    <p className='text-sm'>
                                      Nivel {selectedGroup.level}
                                    </p>
                                  </div>
                                </div>

                                <div className='space-y-2'>
                                  <Label className='text-sm font-medium'>
                                    Ruta Completa
                                  </Label>
                                  <div className='p-3 bg-muted rounded-md'>
                                    <p className='text-sm font-mono break-all'>
                                      {selectedGroup.path}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {selectedGroup.parent && (
                                <div className='space-y-2'>
                                  <Label className='text-sm font-medium'>
                                    Grupo Padre
                                  </Label>
                                  <div className='p-3 bg-muted rounded-md flex items-center gap-2'>
                                    <div
                                      className='h-3 w-3 rounded-full border'
                                      style={{
                                        backgroundColor:
                                          selectedGroup.parent.color,
                                      }}
                                    />
                                    <span className='text-sm'>
                                      {selectedGroup.parent.name}
                                    </span>
                                    <Badge
                                      variant='outline'
                                      className='text-xs'
                                    >
                                      {selectedGroup.parent.slug}
                                    </Badge>
                                  </div>
                                </div>
                              )}

                              {selectedGroup.children.length > 0 && (
                                <div className='space-y-2'>
                                  <Label className='text-sm font-medium'>
                                    Grupos Hijos (
                                    {selectedGroup.children.length})
                                  </Label>
                                  <div className='space-y-2 max-h-32 overflow-y-auto'>
                                    {selectedGroup.children.map((child) => (
                                      <div
                                        key={child.id}
                                        className='p-2 bg-muted/50 rounded flex items-center gap-2'
                                      >
                                        <div
                                          className='h-2 w-2 rounded-full border'
                                          style={{
                                            backgroundColor: child.color,
                                          }}
                                        />
                                        <span className='text-sm'>
                                          {child.name}
                                        </span>
                                        <Badge
                                          variant='outline'
                                          className='text-xs'
                                        >
                                          {child.slug}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Estadísticas de Uso */}
                            <div className='space-y-4'>
                              <div>
                                <h3 className='text-lg font-semibold flex items-center gap-2'>
                                  <ChartBarIcon className='h-5 w-5 text-muted-foreground' />
                                  Estadísticas de Uso
                                </h3>
                                <p className='text-sm text-muted-foreground'>
                                  Información sobre el uso actual del grupo
                                </p>
                              </div>

                              <div className='grid gap-4 md:grid-cols-3'>
                                <div className='space-y-2'>
                                  <Label className='text-sm font-medium'>
                                    Salas Asignadas
                                  </Label>
                                  <div className='p-3 bg-muted rounded-md'>
                                    <p className='text-sm font-semibold'>
                                      {selectedGroup._count.spaceGroups}
                                    </p>
                                  </div>
                                </div>

                                <div className='space-y-2'>
                                  <Label className='text-sm font-medium'>
                                    Tags por Defecto
                                  </Label>
                                  <div className='p-3 bg-muted rounded-md'>
                                    <p className='text-sm font-semibold'>
                                      {selectedGroup._count.defaultTags}
                                    </p>
                                  </div>
                                </div>

                                <div className='space-y-2'>
                                  <Label className='text-sm font-medium'>
                                    Sub-grupos
                                  </Label>
                                  <div className='p-3 bg-muted rounded-md'>
                                    <p className='text-sm font-semibold'>
                                      {selectedGroup._count.children}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {selectedGroup.referenceCount !== undefined &&
                                selectedGroup.referenceCount > 0 && (
                                  <div className='space-y-2'>
                                    <Label className='text-sm font-medium'>
                                      Referencias
                                    </Label>
                                    <div className='p-3 bg-primary/5 border border-primary/20 rounded-md'>
                                      <div className='flex items-center justify-between'>
                                        <p className='text-sm'>
                                          Este grupo está siendo referenciado en{" "}
                                          <strong>
                                            {selectedGroup.referenceCount}
                                          </strong>{" "}
                                          paquete
                                          {selectedGroup.referenceCount !== 1
                                            ? "s"
                                            : ""}
                                        </p>
                                        <Button
                                          variant='outline'
                                          size='sm'
                                          onClick={() =>
                                            handleViewReferences(selectedGroup)
                                          }
                                          className='text-xs'
                                        >
                                          <LinkIcon className='h-3 w-3 mr-1' />
                                          Ver detalles
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                            </div>

                            {/* Configuración Avanzada */}
                            <div className='space-y-4'>
                              <div>
                                <h3 className='text-lg font-semibold flex items-center gap-2'>
                                  <CogIcon className='h-5 w-5 text-muted-foreground' />
                                  Configuración
                                </h3>
                                <p className='text-sm text-muted-foreground'>
                                  Configuraciones especiales del grupo
                                </p>
                              </div>

                              <div className='grid gap-4 md:grid-cols-2'>
                                <div className='space-y-2'>
                                  <Label className='text-sm font-medium'>
                                    Estado
                                  </Label>
                                  <div className='p-3 bg-muted rounded-md'>
                                    <Badge
                                      variant={
                                        selectedGroup.isActive
                                          ? "default"
                                          : "secondary"
                                      }
                                    >
                                      {selectedGroup.isActive
                                        ? "Activo"
                                        : "Inactivo"}
                                    </Badge>
                                  </div>
                                </div>

                                <div className='space-y-2'>
                                  <Label className='text-sm font-medium'>
                                    Permite Referencias
                                  </Label>
                                  <div className='p-3 bg-muted rounded-md'>
                                    <Badge
                                      variant={
                                        selectedGroup.allowsReferences
                                          ? "default"
                                          : "outline"
                                      }
                                    >
                                      {selectedGroup.allowsReferences
                                        ? "Sí"
                                        : "No"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>

          <DialogFooter
            className={cn("flex-shrink-0", modalMode === "edit" && "mt-4")}
          >
            <Button variant='outline' onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={
                modalMode === "create" ? handleCreateGroup : handleEditGroup
              }
            >
              {modalMode === "create" ? "Crear Grupo" : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de gestión de referencias */}
      <Dialog open={referencesModalOpen} onOpenChange={setReferencesModalOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <LinkIcon className='h-5 w-5' />
              Referencias del grupo &ldquo;{groupWithReferences?.name}&rdquo;
            </DialogTitle>
            <DialogDescription>
              Gestiona las referencias que apuntan a este grupo desde otros
              paquetes
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            {groupWithReferences?.referencedBy &&
            groupWithReferences.referencedBy.length > 0 ? (
              <>
                <div className='flex items-center justify-between'>
                  <p className='text-sm text-muted-foreground'>
                    {groupWithReferences.referencedBy.length} referencia
                    {groupWithReferences.referencedBy.length !== 1 ? "s" : ""}{" "}
                    encontrada
                    {groupWithReferences.referencedBy.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <ScrollArea className='h-[400px] border rounded-md p-4'>
                  <div className='space-y-3'>
                    {groupWithReferences.referencedBy.map((reference) => {
                      return (
                        <div
                          key={reference.id}
                          className='p-4 border rounded-lg border-border bg-card'
                        >
                          <div className='flex items-start justify-between'>
                            <div className='space-y-2 flex-1'>
                              {/* Información del paquete */}
                              <div className='flex items-center gap-2'>
                                <div
                                  className='h-3 w-3 rounded-full border'
                                  style={{ backgroundColor: "#6B7280" }}
                                />
                                <span className='font-medium'>
                                  Paquete {reference.sourceGroupId}
                                </span>
                                <Badge variant='outline' className='text-xs'>
                                  Referencia
                                </Badge>
                              </div>

                              {/* Información de la referencia */}
                              <div className='space-y-1 text-sm text-muted-foreground'>
                                {reference.displayName && (
                                  <p>
                                    <strong>Nombre personalizado:</strong>{" "}
                                    {reference.displayName}
                                  </p>
                                )}
                                {reference.description && (
                                  <p>
                                    <strong>Descripción:</strong>{" "}
                                    {reference.description}
                                  </p>
                                )}
                                <p>
                                  <strong>Orden:</strong> {reference.order}
                                </p>
                                <p>
                                  <strong>Creado:</strong>{" "}
                                  {new Date(
                                    reference.createdAt
                                  ).toLocaleDateString("es-ES")}
                                </p>
                              </div>
                            </div>

                            {/* Acciones */}
                            <div className='flex gap-2'>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => {
                                  // Encontrar y abrir el grupo fuente para editar
                                  const sourceGroup = flatGroups.find(
                                    (g) => g.id === reference.sourceGroupId
                                  );
                                  if (sourceGroup) {
                                    setReferencesModalOpen(false);
                                    openEditModal(sourceGroup);
                                  }
                                }}
                              >
                                <PencilIcon className='h-4 w-4 mr-1' />
                                Editar paquete
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className='text-center py-8'>
                <LinkIcon className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <h3 className='text-lg font-semibold mb-1'>Sin referencias</h3>
                <p className='text-muted-foreground'>
                  Este grupo no está siendo referenciado por ningún paquete
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setReferencesModalOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
