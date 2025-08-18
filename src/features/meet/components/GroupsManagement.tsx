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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { Checkbox } from "@/src/components/ui/checkbox";
import { ScrollArea } from "@/src/components/ui/scroll-area";
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
  createdAt: string;
  createdBy?: string;
  isActive: boolean;
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<MeetGroup | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showPublicView, setShowPublicView] = useState(false); // Toggle between internal/public view
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

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/meet/tags?parentId=all");
      
      if (response.ok) {
        const data = await response.json();
        // Sort tags by hierarchy and order for proper display in modals
        const sortedTags = (data.tags || []).sort((a: MeetTag, b: MeetTag) => {
          // First sort by level (hierarchy)
          if (a.level !== b.level) {
            return a.level - b.level;
          }
          // Then by order within the same level
          if (a.order !== b.order) {
            return a.order - b.order;
          }
          // Finally by name as fallback
          return a.name.localeCompare(b.name);
        });
        setTags(sortedTags);
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
        errors.slug = "El slug debe contener solo letras minúsculas, números y guiones";
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
          parentId: formData.parentId === "" || formData.parentId === "__root__" ? undefined : formData.parentId,
          defaultTagIds: formData.defaultTagIds.length > 0 ? formData.defaultTagIds : undefined,
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

      setIsCreateModalOpen(false);
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
        errors.slug = "El slug debe contener solo letras minúsculas, números y guiones";
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
          parentId: formData.parentId === "" || formData.parentId === "__root__" ? null : formData.parentId,
          defaultTagIds: formData.defaultTagIds,
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

      setIsEditModalOpen(false);
      setSelectedGroup(null);
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
        description: "El grupo tiene elementos hijos. Muévalos o elimínelos primero.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar el grupo "${group.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/meet/groups/${group.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar grupo");
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
    });
    setFormErrors({});
  };

  const openCreateModal = (parentGroup?: MeetGroup) => {
    resetForm();
    if (parentGroup) {
      setFormData(prev => ({ ...prev, parentId: parentGroup.id }));
    }
    setIsCreateModalOpen(true);
  };

  const openEditModal = (group: MeetGroup) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      slug: group.slug,
      internalDescription: group.internalDescription || "",
      publicDescription: group.publicDescription || "",
      color: group.color,
      parentId: group.parentId || "",
      customId: group.customId || "",
      order: group.order || 0,
      defaultTagIds: group.defaultTags.map(dt => dt.tag.id),
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const toggleExpand = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
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

  const toggleDefaultTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      defaultTagIds: prev.defaultTagIds.includes(tagId)
        ? prev.defaultTagIds.filter(id => id !== tagId)
        : [...prev.defaultTagIds, tagId]
    }));
  };

  // Render custom content for groups in hierarchy tree
  const renderGroupContent = (group: MeetGroup) => (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      {/* Group Icon/Color */}
      <div
        className="h-3 w-3 rounded border"
        style={{ backgroundColor: group.color }}
      />
      
      {/* Group Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{group.name}</span>
          <Badge variant="outline" className="text-xs">
            {group.slug}
          </Badge>
          {group.customId && (
            <Badge variant="secondary" className="text-xs">
              {group.customId}
            </Badge>
          )}
          {group._count.spaceGroups > 0 && (
            <Badge variant="secondary" className="text-xs">
              {group._count.spaceGroups} salas
            </Badge>
          )}
          {group._count.defaultTags > 0 && (
            <Badge variant="default" className="text-xs">
              {group._count.defaultTags} tags
            </Badge>
          )}
        </div>
        {(() => {
          const description = showPublicView ? group.publicDescription : group.internalDescription;
          return description && (
            <p className="text-sm text-muted-foreground truncate">
              {description}
            </p>
          );
        })()}
        {/* Default tags preview */}
        {group.defaultTags.length > 0 && (
          <div className="flex gap-1 mt-1">
            {group.defaultTags.slice(0, 3).map((dt) => (
              <div
                key={dt.tag.id}
                className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs"
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: dt.tag.color }}
                />
                <span>{dt.tag.name}</span>
              </div>
            ))}
            {group.defaultTags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{group.defaultTags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Render custom actions for groups
  const renderGroupActions = (group: MeetGroup) => (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => openCreateModal(group)}
        className="text-primary hover:text-primary"
        title={`Agregar sub-grupo a ${group.name}`}
      >
        <PlusIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => openEditModal(group)}
        className="text-muted-foreground hover:text-foreground"
      >
        <PencilIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDeleteGroup(group)}
        className="text-destructive hover:text-destructive"
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  );

  // Legacy function kept for backward compatibility
  const renderGroupTree = (groupList: MeetGroup[], level: number = 0): React.ReactNode => {
    return groupList.map((group) => (
      <div key={group.id} className="select-none">
        <div
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors",
            level > 0 && "ml-6 border-l border-muted pl-4"
          )}
        >
          {/* Expand/Collapse button */}
          {group.children.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => toggleExpand(group.id)}
            >
              {expandedGroups.has(group.id) ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {/* Group Icon/Color */}
          <div
            className="h-4 w-4 rounded border"
            style={{ backgroundColor: group.color }}
          />
          
          {/* Group Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{group.name}</span>
              <Badge variant="outline" className="text-xs">
                {group.slug}
              </Badge>
              {group._count.spaceGroups > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {group._count.spaceGroups} salas
                </Badge>
              )}
              {group._count.defaultTags > 0 && (
                <Badge variant="default" className="text-xs">
                  {group._count.defaultTags} tags
                </Badge>
              )}
            </div>
            {(() => {
              const description = showPublicView ? group.publicDescription : group.internalDescription;
              return description && (
                <p className="text-sm text-muted-foreground truncate">
                  {description}
                </p>
              );
            })()}
            {/* Default tags preview */}
            {group.defaultTags.length > 0 && (
              <div className="flex gap-1 mt-1">
                {group.defaultTags.slice(0, 3).map((dt) => (
                  <div
                    key={dt.tag.id}
                    className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs"
                  >
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: dt.tag.color }}
                    />
                    <span>{dt.tag.name}</span>
                  </div>
                ))}
                {group.defaultTags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{group.defaultTags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEditModal(group)}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteGroup(group)}
              className="text-destructive hover:text-destructive"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Render children if expanded */}
        {expandedGroups.has(group.id) && group.children.length > 0 && (
          <div className="mt-1">
            {renderGroupTree(group.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  // Filtrar grupos por búsqueda
  const filteredGroups = React.useMemo(() => {
    if (!searchTerm) return groups;
    
    const filterGroups = (groupList: MeetGroup[]): MeetGroup[] => {
      return groupList.reduce((acc: MeetGroup[], group) => {
        const matchesSearch = 
          group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.internalDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.publicDescription?.toLowerCase().includes(searchTerm.toLowerCase());

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

    return filterGroups(groups);
  }, [groups, searchTerm]);

  // Renderizar lista de tags para selección
  const renderTagList = () => {
    const renderTags = (tagList: MeetTag[]): React.ReactNode => {
      return tagList.map((tag) => (
        <div key={tag.id} className={cn(
          "flex items-center space-x-2 py-1",
          !tag.isActive && "opacity-50"
        )}>
          <Checkbox
            id={tag.id}
            checked={formData.defaultTagIds.includes(tag.id)}
            onCheckedChange={() => toggleDefaultTag(tag.id)}
            disabled={!tag.isActive}
          />
          <label
            htmlFor={tag.id}
            className={cn(
              "flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              tag.isActive ? "cursor-pointer" : "cursor-not-allowed",
              !tag.isActive && "text-muted-foreground"
            )}
            style={{ paddingLeft: `${tag.level * 16}px` }}
          >
            <div
              className={cn(
                "h-3 w-3 rounded-full",
                !tag.isActive && "opacity-50"
              )}
              style={{ backgroundColor: tag.color }}
            />
            <span className={cn(
              tag.isActive ? "text-foreground" : "text-muted-foreground"
            )}>
              {tag.name}
            </span>
            <Badge variant="outline" className={cn(
              "text-xs",
              !tag.isActive && "border-muted text-muted-foreground"
            )}>
              {tag.slug}
            </Badge>
            {tag.customId && (
              <Badge variant="secondary" className={cn(
                "text-xs",
                !tag.isActive && "bg-muted/50 text-muted-foreground"
              )}>
                {tag.customId}
              </Badge>
            )}
            {!tag.isActive && (
              <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
                Inactivo
              </Badge>
            )}
          </label>
        </div>
      ));
    };

    return renderTags(tags);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderIcon className="h-8 w-8 text-primary" />
            Gestión de Grupos
          </h1>
          <p className="text-muted-foreground mt-1">
            Organiza las salas de Meet con grupos jerárquicos y tags automáticos
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

          <Button
            onClick={fetchGroups}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <ArrowPathIcon className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Actualizar
          </Button>
          <Button onClick={() => openCreateModal()}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nuevo Grupo
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
            <CardTitle className="text-sm font-medium">Total Grupos</CardTitle>
            <FolderIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flatGroups.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grupos Raíz</CardTitle>
            <FolderIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groups.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Uso</CardTitle>
            <FolderIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flatGroups.filter(g => g._count.spaceGroups > 0).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Tags Automáticos</CardTitle>
            <TagIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flatGroups.filter(g => g._count.defaultTags > 0).length}
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
            <div className="flex items-center justify-center py-12">
              <Icons.SpinnerIcon className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-12">
              <FolderIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1">No hay grupos</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No se encontraron grupos que coincidan con tu búsqueda" : "Aún no has creado ningún grupo"}
              </p>
              {!searchTerm && (
                <Button onClick={() => openCreateModal()}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Crear Primer Grupo
                </Button>
              )}
            </div>
          ) : (
            <HierarchyTree
              items={filteredGroups as any[]}
              onEdit={openEditModal as any}
              onDelete={handleDeleteGroup as any}
              onAddChild={openCreateModal as any}
              renderItemContent={renderGroupContent as any}
              renderItemActions={renderGroupActions as any}
              maxInitialLevel={2}
            />
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {formData.parentId ? "Crear Sub-Grupo" : "Crear Nuevo Grupo"}
            </DialogTitle>
            <DialogDescription>
              {formData.parentId 
                ? `Crea un sub-grupo dentro de "${flatGroups.find(g => g.id === formData.parentId)?.name}"`
                : "Crea un grupo para organizar las salas de Meet con tags automáticos"
              }
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1">
            <div className="space-y-4 pr-4">
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
                  placeholder="Nombre del grupo"
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
                  placeholder="grupo-slug"
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
                    placeholder="GRP-001"
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

              <div className="space-y-2">
                <Label htmlFor="parent">Grupo Padre</Label>
                <Select
                  value={formData.parentId || "__root__"}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value === "__root__" ? "" : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin padre (grupo raíz)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__root__">Sin padre (grupo raíz)</SelectItem>
                    {flatGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {"  ".repeat(group.level)}
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {groupColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={cn(
                        "h-8 w-8 rounded border-2 transition-all",
                        formData.color === color ? "border-foreground scale-110" : "border-muted"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags por Defecto</Label>
                <p className="text-sm text-muted-foreground">
                  Los tags seleccionados se asignarán automáticamente a las salas que se añadan a este grupo
                </p>
                <ScrollArea className="h-48 border rounded-md p-3">
                  <div className="space-y-1">
                    {tags.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay tags disponibles. Crea algunos tags primero.
                      </p>
                    ) : (
                      renderTagList()
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateGroup}>
              Crear Grupo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Editar Grupo</DialogTitle>
            <DialogDescription>
              Modifica la información del grupo y sus tags por defecto
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1">
            <div className="space-y-4 pr-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre del grupo"
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
                  placeholder="grupo-slug"
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
                    placeholder="GRP-001"
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

              <div className="space-y-2">
                <Label htmlFor="edit-parent">Grupo Padre</Label>
                <Select
                  value={formData.parentId || "__root__"}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value === "__root__" ? "" : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin padre (grupo raíz)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__root__">Sin padre (grupo raíz)</SelectItem>
                    {flatGroups
                      .filter(group => group.id !== selectedGroup?.id) // No puede ser padre de sí mismo
                      .map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {"  ".repeat(group.level)}
                          {group.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {groupColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={cn(
                        "h-8 w-8 rounded border-2 transition-all",
                        formData.color === color ? "border-foreground scale-110" : "border-muted"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags por Defecto</Label>
                <p className="text-sm text-muted-foreground">
                  Los tags seleccionados se asignarán automáticamente a las salas que se añadan a este grupo
                </p>
                <ScrollArea className="h-48 border rounded-md p-3">
                  <div className="space-y-1">
                    {tags.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay tags disponibles. Crea algunos tags primero.
                      </p>
                    ) : (
                      renderTagList()
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditGroup}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};