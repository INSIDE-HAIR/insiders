"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Edit, Trash, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
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

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
}

interface CategoryManagerProps {
  onCategoryChange?: () => void;
}

export function CategoryManager({ onCategoryChange }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#6366F1",
  });
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Colores predefinidos para seleccionar
  const predefinedColors = [
    "#EF4444", // Red
    "#F97316", // Orange
    "#FACC15", // Yellow
    "#22C55E", // Green
    "#06B6D4", // Cyan
    "#3B82F6", // Blue
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#6B7280", // Gray
    "#1F2937", // Dark Gray
  ];

  // Cargar categorías
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/drive/error-categories");

      if (!response.ok) {
        throw new Error("Error al cargar categorías");
      }

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      setError("No se pudieron cargar las categorías");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar categorías al iniciar
  useEffect(() => {
    fetchCategories();
  }, []);

  // Manejo de cambios en los campos del formulario
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Abre el modal para crear una nueva categoría
  const handleNewCategory = () => {
    setFormData({
      name: "",
      description: "",
      color: "#6366F1",
    });
    setCurrentCategory(null);
    setIsEditing(false);
    setIsModalOpen(true);
    setError(null);
  };

  // Abre el modal para editar una categoría existente
  const handleEditCategory = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color,
    });
    setCurrentCategory(category);
    setIsEditing(true);
    setIsModalOpen(true);
    setError(null);
  };

  // Abre el diálogo de confirmación para eliminar
  const handleDeleteConfirm = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  // Guarda la categoría (nueva o editada)
  const handleSaveCategory = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.name.trim()) {
        setError("El nombre de la categoría es obligatorio");
        setIsSubmitting(false);
        return;
      }

      if (isEditing && currentCategory) {
        const response = await fetch(
          `/api/drive/error-categories/${currentCategory.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: formData.name,
              description: formData.description,
              color: formData.color,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Error al actualizar la categoría"
          );
        }
      } else {
        const response = await fetch("/api/drive/error-categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            color: formData.color,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al crear la categoría");
        }
      }

      // Recargar categorías después de guardar
      await fetchCategories();

      // Cerrar modal y notificar cambio
      setIsModalOpen(false);

      if (onCategoryChange) {
        onCategoryChange();
      }
    } catch (error) {
      console.error("Error al guardar la categoría:", error);
      setError(
        error instanceof Error ? error.message : "Error al guardar la categoría"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Elimina la categoría
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `/api/drive/error-categories/${categoryToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar la categoría");
      }

      // Recargar categorías después de eliminar
      await fetchCategories();

      // Cerrar diálogo y notificar cambio
      setIsDeleteDialogOpen(false);

      if (onCategoryChange) {
        onCategoryChange();
      }
    } catch (error) {
      console.error("Error al eliminar la categoría:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Error al eliminar la categoría"
      );
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Categorías de Errores</h2>
        <Button
          onClick={handleNewCategory}
          size="sm"
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Nueva Categoría
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>
      ) : categories.length === 0 ? (
        <div className="p-4 bg-gray-50 text-gray-500 rounded-md text-center">
          No hay categorías disponibles. ¡Crea la primera!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="border rounded-md p-3 flex flex-col hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <h3 className="font-medium">{category.name}</h3>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleEditCategory(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteConfirm(category)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {category.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {category.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal para Crear/Editar Categoría */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Categoría *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej: Error de Diseño"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descripción opcional"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color
                        ? "border-black"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  >
                    {formData.color === color && (
                      <Check className="h-4 w-4 text-white mx-auto" />
                    )}
                  </button>
                ))}
                <div className="flex items-center">
                  <Input
                    type="color"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-8 h-8 p-0 border-0"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveCategory}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminarás permanentemente la
              categoría &quot;{categoryToDelete?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
