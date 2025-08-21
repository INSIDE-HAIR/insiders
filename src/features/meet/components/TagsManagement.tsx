"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Textarea } from "@/src/components/ui/textarea";
import { useToast } from "@/src/hooks/use-toast";
import { Icons } from "@/src/components/shared/icons";
import {
  TagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CheckIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/src/lib/utils";
import { HierarchyTree } from "@/src/components/ui/hierarchy-tree";

interface MeetTag {
  id: string;
  name: string;
  slug: string;
  internalDescription?: string;
  publicDescription?: string;
  color: string;
  icon?: string;
  parentId?: string;
  parent?: MeetTag;
  children: MeetTag[];
  path: string;
  level: number;
  customId?: string;
  order: number;
  createdAt: string;
  createdBy?: string;
  isActive: boolean;
  _count: {
    children: number;
    spaceTags: number;
  };
}

interface TagsManagementProps {
  lang: string;
}

export const TagsManagement: React.FC<TagsManagementProps> = ({ lang }) => {
  const [tags, setTags] = useState<MeetTag[]>([]);
  const [flatTags, setFlatTags] = useState<MeetTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<MeetTag | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());
  const [accordionValue, setAccordionValue] = useState<string | undefined>(undefined);
  const [showPublicView, setShowPublicView] = useState(false); // Toggle between internal/public view
  const [parentTagComboboxOpen, setParentTagComboboxOpen] = useState(false);
  const [parentTagSearchValue, setParentTagSearchValue] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    internalDescription: "",
    publicDescription: "",
    color: "#3B82F6",
    icon: "",
    parentId: "",
    customId: "",
    order: 0,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Colores predefinidos para tags
  const tagColors = [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#8B5CF6", // Purple
    "#06B6D4", // Cyan
    "#F97316", // Orange
    "#84CC16", // Lime
    "#EC4899", // Pink
    "#6B7280", // Gray
  ];

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/meet/tags");
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setTags(data.tags || []);
      
      // También obtener lista plana para selección de parents
      const flatResponse = await fetch("/api/meet/tags?parentId=all");
      const flatData = await flatResponse.json();
      setFlatTags(flatData.tags || []);
      
    } catch (error: any) {
      console.error("Error fetching tags:", error);
      toast({
        title: "Error al cargar tags",
        description: error.message || "No se pudieron cargar los tags",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    try {
      // Validaciones básicas
      const errors: Record<string, string> = {};
      if (!formData.name.trim()) errors.name = "El nombre es requerido";
      if (!formData.slug.trim()) errors.slug = "El slug es requerido";
      if (!/^[a-z0-9-]+$/.test(formData.slug)) {
        errors.slug = "El slug debe contener solo letras minúsculas, números y guiones";
      }
      
      setFormErrors(errors);
      if (Object.keys(errors).length > 0) return;

      const response = await fetch("/api/meet/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          parentId: formData.parentId === "" || formData.parentId === "__root__" ? undefined : formData.parentId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear tag");
      }

      toast({
        title: "Tag creado",
        description: `Tag "${formData.name}" creado exitosamente`,
      });

      setIsCreateModalOpen(false);
      resetForm();
      await fetchTags();
    } catch (error: any) {
      toast({
        title: "Error al crear tag",
        description: error.message || "No se pudo crear el tag",
        variant: "destructive",
      });
    }
  };

  const handleEditTag = async () => {
    if (!selectedTag) return;

    try {
      const errors: Record<string, string> = {};
      if (!formData.name.trim()) errors.name = "El nombre es requerido";
      if (!formData.slug.trim()) errors.slug = "El slug es requerido";
      if (!/^[a-z0-9-]+$/.test(formData.slug)) {
        errors.slug = "El slug debe contener solo letras minúsculas, números y guiones";
      }
      
      setFormErrors(errors);
      if (Object.keys(errors).length > 0) return;

      const response = await fetch(`/api/meet/tags/${selectedTag.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          parentId: formData.parentId === "" || formData.parentId === "__root__" ? null : formData.parentId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar tag");
      }

      toast({
        title: "Tag actualizado",
        description: `Tag "${formData.name}" actualizado exitosamente`,
      });

      setIsEditModalOpen(false);
      setSelectedTag(null);
      resetForm();
      await fetchTags();
    } catch (error: any) {
      toast({
        title: "Error al actualizar tag",
        description: error.message || "No se pudo actualizar el tag",
        variant: "destructive",
      });
    }
  };

  const handleToggleTagActive = async (tag: MeetTag) => {
    try {
      const response = await fetch(`/api/meet/tags/${tag.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !tag.isActive,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar tag");
      }

      toast({
        title: tag.isActive ? "Tag desactivado" : "Tag activado",
        description: `Tag "${tag.name}" ${tag.isActive ? "desactivado" : "activado"} exitosamente`,
      });

      await fetchTags();
    } catch (error: any) {
      toast({
        title: "Error al actualizar tag",
        description: error.message || "No se pudo actualizar el tag",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTag = async (tag: MeetTag) => {
    if (tag._count.children > 0) {
      toast({
        title: "No se puede eliminar",
        description: "El tag tiene elementos hijos. Muévalos o elimínelos primero.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar el tag "${tag.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/meet/tags/${tag.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar tag");
      }

      toast({
        title: "Tag eliminado",
        description: `Tag "${tag.name}" eliminado exitosamente`,
      });

      await fetchTags();
    } catch (error: any) {
      toast({
        title: "Error al eliminar tag",
        description: error.message || "No se pudo eliminar el tag",
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
      color: "#3B82F6",
      icon: "",
      parentId: "",
      customId: "",
      order: 0,
    });
    setFormErrors({});
    setParentTagComboboxOpen(false);
    setParentTagSearchValue("");
  };

  const openCreateModal = (parentTag?: MeetTag) => {
    resetForm();
    if (parentTag) {
      setFormData(prev => ({ ...prev, parentId: parentTag.id }));
    }
    setIsCreateModalOpen(true);
  };

  const openEditModal = (tag: MeetTag) => {
    setSelectedTag(tag);
    setFormData({
      name: tag.name,
      slug: tag.slug,
      internalDescription: tag.internalDescription || "",
      publicDescription: tag.publicDescription || "",
      color: tag.color,
      icon: tag.icon || "",
      parentId: tag.parentId || "",
      customId: tag.customId || "",
      order: tag.order || 0,
    });
    setFormErrors({});
    setParentTagComboboxOpen(false);
    setParentTagSearchValue("");
    setIsEditModalOpen(true);
  };

  const toggleExpand = (tagId: string) => {
    setExpandedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tagId)) {
        newSet.delete(tagId);
      } else {
        newSet.add(tagId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    // Expand all hierarchy items
    const getAllTagIds = (tagList: MeetTag[]): string[] => {
      return tagList.reduce((acc: string[], tag) => {
        acc.push(tag.id);
        if (tag.children && tag.children.length > 0) {
          acc.push(...getAllTagIds(tag.children));
        }
        return acc;
      }, []);
    };
    
    setExpandedTags(new Set(getAllTagIds(filteredTags)));
    
    // Expand accordion if there are orphan tags
    if (orphanTags.length > 0) {
      setAccordionValue("orphan-tags");
    }
  };

  const collapseAll = () => {
    setExpandedTags(new Set());
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
    
    setFormData(prev => ({ ...prev, slug }));
  };

  // Función de búsqueda fuzzy muy permisiva
  const fuzzySearch = (searchTerm: string, target: string): boolean => {
    if (!searchTerm || !target) return true;
    
    const normalizeText = (text: string) => 
      text.toLowerCase()
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
    
    const allWordsFound = searchWords.every(searchWord => 
      targetWords.some(targetWord => 
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

  // Filtrar tags para el combobox de tag padre con búsqueda fuzzy
  const getFilteredParentTags = (excludeTagId?: string) => {
    let tagsToFilter = flatTags;
    
    // Excluir el tag actual para evitar ciclos (no puede ser padre de sí mismo)
    if (excludeTagId) {
      tagsToFilter = flatTags.filter(tag => tag.id !== excludeTagId);
    }
    
    if (!parentTagSearchValue.trim()) return tagsToFilter;
    
    return tagsToFilter.filter(tag => {
      // Buscar en múltiples campos con búsqueda fuzzy
      const searchFields = [
        tag.name,
        tag.slug,
        tag.customId,
        tag.internalDescription,
        tag.publicDescription
      ].filter(Boolean); // Remove null/undefined values
      
      // Si cualquier campo coincide con la búsqueda fuzzy, incluir el tag
      return searchFields.some(field => 
        fuzzySearch(parentTagSearchValue, field as string)
      );
    });
  };

  // Obtener el tag padre seleccionado
  const getSelectedParentTag = () => {
    if (!formData.parentId) return null;
    return flatTags.find(tag => tag.id === formData.parentId) || null;
  };

  // Renderizar componente ParentTagCombobox
  const renderParentTagCombobox = (idPrefix: string = "", excludeTagId?: string) => {
    const selectedParent = getSelectedParentTag();
    const filteredTags = getFilteredParentTags(excludeTagId);

    return (
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}parent`}>Tag Padre</Label>
        <Popover open={parentTagComboboxOpen} onOpenChange={setParentTagComboboxOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={parentTagComboboxOpen}
              className="w-full justify-between"
            >
              {selectedParent ? (
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: selectedParent.color }}
                  />
                  <span className="truncate">{selectedParent.name}</span>
                  {selectedParent.customId && (
                    <Badge variant="secondary" className="text-xs">
                      #{selectedParent.customId}
                    </Badge>
                  )}
                </div>
              ) : (
                "Sin padre (tag raíz)"
              )}
              <ChevronUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Buscar tag padre..."
                value={parentTagSearchValue}
                onValueChange={setParentTagSearchValue}
              />
              <CommandList>
                <CommandEmpty>No se encontraron tags.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="__root__"
                    onSelect={() => {
                      setFormData(prev => ({ ...prev, parentId: "" }));
                      setParentTagComboboxOpen(false);
                      setParentTagSearchValue("");
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded border bg-muted" />
                      <span>Sin padre (tag raíz)</span>
                    </div>
                    {!formData.parentId && (
                      <CheckIcon className="ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                  {filteredTags.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      value={tag.id}
                      onSelect={(currentValue) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          parentId: currentValue === formData.parentId ? "" : currentValue 
                        }));
                        setParentTagComboboxOpen(false);
                        setParentTagSearchValue("");
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className="h-3 w-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="truncate" style={{ paddingLeft: `${tag.level * 8}px` }}>
                          {tag.name}
                        </span>
                        {tag.customId && (
                          <Badge variant="secondary" className="text-xs">
                            #{tag.customId}
                          </Badge>
                        )}
                      </div>
                      {formData.parentId === tag.id && (
                        <CheckIcon className="ml-2 h-4 w-4" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  // Render custom content for tags in hierarchy tree
  const renderTagContent = (tag: MeetTag) => (
    <div className={cn(
      "flex items-center gap-2 flex-1 min-w-0",
      !tag.isActive && "opacity-50"
    )}>
      {/* Tag Icon/Color */}
      <div
        className="h-3 w-3 rounded-full border"
        style={{ backgroundColor: tag.color }}
      />
      
      {/* Tag Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-medium truncate",
            tag.isActive ? "text-foreground" : "text-muted-foreground"
          )}>
            {tag.name}
          </span>
          <Badge variant="outline" className="text-xs">
            {tag.slug}
          </Badge>
          {tag.customId && (
            <Badge variant="secondary" className="text-xs">
              #{tag.customId}
            </Badge>
          )}
          {!tag.isActive && (
            <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
              Inactivo
            </Badge>
          )}
          {tag._count.spaceTags > 0 && (
            <Badge variant="secondary" className="text-xs">
              {tag._count.spaceTags} salas
            </Badge>
          )}
        </div>
        {(() => {
          const description = showPublicView ? tag.publicDescription : tag.internalDescription;
          return description && (
            <p className={cn(
              "text-sm truncate",
              tag.isActive ? "text-muted-foreground" : "text-muted-foreground/70"
            )}>
              {description}
            </p>
          );
        })()}
      </div>
    </div>
  );

  // Render custom actions for tags
  const renderTagActions = (tag: MeetTag) => (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleToggleTagActive(tag)}
        className={cn(
          tag.isActive 
            ? "text-green-600 hover:text-green-700" 
            : "text-orange-600 hover:text-orange-700"
        )}
        title={tag.isActive ? `Desactivar ${tag.name}` : `Activar ${tag.name}`}
      >
        {tag.isActive ? (
          <CheckCircleIcon className="h-4 w-4" />
        ) : (
          <XCircleIcon className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => openCreateModal(tag)}
        className="text-primary hover:text-primary"
        title={`Agregar sub-tag a ${tag.name}`}
      >
        <PlusIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => openEditModal(tag)}
        className="text-muted-foreground hover:text-foreground"
      >
        <PencilIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDeleteTag(tag)}
        className="text-destructive hover:text-destructive"
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  );

  // Legacy function kept for backward compatibility
  const renderTagTree = (tagList: MeetTag[], level: number = 0): React.ReactNode => {
    return tagList.map((tag) => (
      <div key={tag.id} className="select-none">
        <div
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors",
            level > 0 && "ml-6 border-l border-muted pl-4"
          )}
        >
          {/* Expand/Collapse button */}
          {tag.children.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => toggleExpand(tag.id)}
            >
              {expandedTags.has(tag.id) ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {/* Tag Icon/Color */}
          <div
            className="h-4 w-4 rounded-full border"
            style={{ backgroundColor: tag.color }}
          />
          
          {/* Tag Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{tag.name}</span>
              <Badge variant="outline" className="text-xs">
                {tag.slug}
              </Badge>
              {tag._count.spaceTags > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tag._count.spaceTags} salas
                </Badge>
              )}
            </div>
            {(() => {
              const description = showPublicView ? tag.publicDescription : tag.internalDescription;
              return description && (
                <p className="text-sm text-muted-foreground truncate">
                  {description}
                </p>
              );
            })()}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEditModal(tag)}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteTag(tag)}
              className="text-destructive hover:text-destructive"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Render children if expanded */}
        {expandedTags.has(tag.id) && tag.children.length > 0 && (
          <div className="mt-1">
            {renderTagTree(tag.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  // Función auxiliar para buscar un tag en la jerarquía
  const findTagInHierarchy = React.useCallback((tagList: MeetTag[], targetId: string): MeetTag | null => {
    for (const tag of tagList) {
      if (tag.id === targetId) return tag;
      const found = findTagInHierarchy(tag.children, targetId);
      if (found) return found;
    }
    return null;
  }, []);

  // Filtrar tags por búsqueda y separar los que no tienen parentID
  const { filteredTags, orphanTags } = React.useMemo(() => {
    const allTags = tags;
    
    const filterTags = (tagList: MeetTag[]): MeetTag[] => {
      return tagList.reduce((acc: MeetTag[], tag) => {
        let matchesSearch = !searchTerm.trim();
        
        if (searchTerm.trim()) {
          // Buscar en múltiples campos con búsqueda fuzzy
          const searchFields = [
            tag.name,
            tag.slug,
            tag.customId,
            tag.internalDescription,
            tag.publicDescription
          ].filter(Boolean);
          
          matchesSearch = searchFields.some(field => 
            fuzzySearch(searchTerm, field as string)
          );
        }

        const filteredChildren = filterTags(tag.children);

        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...tag,
            children: filteredChildren,
          });
        }

        return acc;
      }, []);
    };

    const filtered = filterTags(allTags);
    
    // Separar tags huérfanos (aquellos que deberían tener parent pero no lo tienen en la jerarquía actual)
    // Estos serían tags con parentId pero que no están siendo mostrados como hijos de ningún tag
    const findOrphanTags = (flatTagsList: MeetTag[]): MeetTag[] => {
      return flatTagsList.filter(tag => {
        // Un tag es huérfano si tiene parentId pero su parent no existe en la estructura actual
        if (!tag.parentId) return false;
        
        // Verificar si existe el parent en la estructura jerárquica
        const parentExists = findTagInHierarchy(filtered, tag.parentId);
        return !parentExists;
      });
    };
    
    const orphans = findOrphanTags(flatTags);
    
    return { 
      filteredTags: filtered, 
      orphanTags: orphans 
    };
  }, [tags, flatTags, searchTerm, findTagInHierarchy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TagIcon className="h-8 w-8 text-primary" />
            Gestión de Tags
          </h1>
          <p className="text-muted-foreground mt-1">
            Organiza las salas de Meet con etiquetas jerárquicas
          </p>
        </div>
        <div className="flex gap-2">
          {/* Toggle View */}
          <div className="flex items-center gap-2 px-3 py-1 border rounded-md bg-background">
            <BuildingOfficeIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Vista:</span>
            <Button
              variant={!showPublicView ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowPublicView(false)}
              className="h-7 px-2 text-xs"
            >
              Interna
            </Button>
            <Button
              variant={showPublicView ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowPublicView(true)}
              className="h-7 px-2 text-xs"
            >
              <EyeIcon className="h-3 w-3 mr-1" />
              Pública
            </Button>
          </div>

          {/* Expand/Collapse Controls */}
          {(filteredTags.length > 0 || orphanTags.length > 0) && (
            <div className="flex items-center gap-1 px-2 py-1 border rounded-md bg-background">
              <Button
                variant="ghost"
                size="sm"
                onClick={expandAll}
                className="h-7 px-2 text-xs"
              >
                <ChevronDownIcon className="h-3 w-3 mr-1" />
                Expandir
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={collapseAll}
                className="h-7 px-2 text-xs"
              >
                <ChevronRightIcon className="h-3 w-3 mr-1" />
                Contraer
              </Button>
            </div>
          )}

          <Button
            onClick={fetchTags}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <ArrowPathIcon className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Actualizar
          </Button>
          <Button onClick={() => openCreateModal()}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nuevo Tag
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Input
              placeholder="Buscar por nombre, slug, descripción interna o pública..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
            <TagIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flatTags.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags Raíz</CardTitle>
            <TagIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Uso</CardTitle>
            <TagIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flatTags.filter(t => t._count.spaceTags > 0).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nivel Máximo</CardTitle>
            <TagIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flatTags.length > 0 ? Math.max(...flatTags.map(t => t.level)) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tags Tree */}
      <Card>
        <CardHeader>
          <CardTitle>Estructura de Tags</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Icons.SpinnerIcon className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTags.length === 0 && orphanTags.length === 0 ? (
            <div className="text-center py-12">
              <TagIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1">No hay tags</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No se encontraron tags que coincidan con tu búsqueda" : "Aún no has creado ningún tag"}
              </p>
              {!searchTerm && (
                <Button onClick={() => openCreateModal()}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Crear Primer Tag
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tags con jerarquía normal */}
              {filteredTags.length > 0 && (
                <HierarchyTree
                  items={filteredTags as any[]}
                  onEdit={openEditModal as any}
                  onDelete={handleDeleteTag as any}
                  onAddChild={openCreateModal as any}
                  renderItemContent={renderTagContent as any}
                  renderItemActions={renderTagActions as any}
                  maxInitialLevel={0}
                  expandedItems={expandedTags}
                  onToggleExpand={toggleExpand}
                />
              )}
              
              {/* Accordion para tags huérfanos (sin parentID válido) */}
              {orphanTags.length > 0 && (
                <Accordion 
                  type="single" 
                  collapsible 
                  className="w-full"
                  value={accordionValue}
                  onValueChange={setAccordionValue}
                >
                  <AccordionItem value="orphan-tags">
                    <AccordionTrigger className="text-orange-600">
                      <div className="flex items-center gap-2">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        Tags sin parent identificado ({orphanTags.length})
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-4">
                        {orphanTags.map((tag) => (
                          <div
                            key={tag.id}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors border border-orange-200",
                              !tag.isActive && "opacity-50"
                            )}
                          >
                            {renderTagContent(tag)}
                            {renderTagActions(tag)}
                          </div>
                        ))}
                        <div className="pt-2 text-sm text-muted-foreground">
                          <p>Estos tags tienen un parent ID asignado pero el tag padre no existe en la estructura actual.</p>
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

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formData.parentId ? "Crear Sub-Tag" : "Crear Nuevo Tag"}
            </DialogTitle>
            <DialogDescription>
              {formData.parentId 
                ? `Crea un sub-tag dentro de "${flatTags.find(t => t.id === formData.parentId)?.name}"`
                : "Crea un tag para organizar las salas de Meet"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  if (!formData.slug || formData.slug === formData.name.toLowerCase().replace(/\s+/g, '-')) {
                    generateSlug(e.target.value);
                  }
                }}
                placeholder="Nombre del tag"
                className={formErrors.name ? "border-destructive" : ""}
              />
              {formErrors.name && (
                <p className="text-sm text-destructive">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="tag-slug"
                className={formErrors.slug ? "border-destructive" : ""}
              />
              {formErrors.slug && (
                <p className="text-sm text-destructive">{formErrors.slug}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="internalDescription">Descripción Interna</Label>
              <Textarea
                id="internalDescription"
                value={formData.internalDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, internalDescription: e.target.value }))}
                placeholder="Descripción para uso interno del equipo"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publicDescription">Descripción Pública</Label>
              <Textarea
                id="publicDescription"
                value={formData.publicDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, publicDescription: e.target.value }))}
                placeholder="Descripción visible para clientes"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customId">ID Personalizado</Label>
                <Input
                  id="customId"
                  value={formData.customId}
                  onChange={(e) => setFormData(prev => ({ ...prev, customId: e.target.value }))}
                  placeholder="ID-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Orden</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>

            {renderParentTagCombobox()}

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {tagColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition-all",
                      formData.color === color ? "border-foreground scale-110" : "border-muted"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateTag}>
              Crear Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tag</DialogTitle>
            <DialogDescription>
              Modifica la información del tag
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-id">ID del Tag</Label>
              <Input
                id="edit-id"
                value={selectedTag?.id || ""}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del tag"
                className={formErrors.name ? "border-destructive" : ""}
              />
              {formErrors.name && (
                <p className="text-sm text-destructive">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-slug">Slug *</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="tag-slug"
                className={formErrors.slug ? "border-destructive" : ""}
              />
              {formErrors.slug && (
                <p className="text-sm text-destructive">{formErrors.slug}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-internalDescription">Descripción Interna</Label>
              <Textarea
                id="edit-internalDescription"
                value={formData.internalDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, internalDescription: e.target.value }))}
                placeholder="Descripción para uso interno del equipo"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-publicDescription">Descripción Pública</Label>
              <Textarea
                id="edit-publicDescription"
                value={formData.publicDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, publicDescription: e.target.value }))}
                placeholder="Descripción visible para clientes"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-customId">ID Personalizado</Label>
                <Input
                  id="edit-customId"
                  value={formData.customId}
                  onChange={(e) => setFormData(prev => ({ ...prev, customId: e.target.value }))}
                  placeholder="ID-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-order">Orden</Label>
                <Input
                  id="edit-order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>

            {renderParentTagCombobox("edit-", selectedTag?.id)}

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {tagColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition-all",
                      formData.color === color ? "border-foreground scale-110" : "border-muted"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditTag}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};