"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "@/src/context/TranslationContext";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/src/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Download,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

// Tipos
interface Code {
  id: string;
  type: string;
  code: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos de códigos disponibles
const codeTypes = [
  { value: "lang", label: "Idiomas" },
  { value: "file", label: "Archivos" },
  { value: "client", label: "Clientes" },
  { value: "campaign", label: "Campañas" },
];

export default function CodesAdminPage() {
  const t = useTranslations("Admin.codes");

  // Estados
  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("lang");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState<{
    id?: string;
    type: string;
    code: string;
    name: string;
    description?: string;
  }>({
    type: selectedType,
    code: "",
    name: "",
    description: "",
  });

  // Cargar códigos
  const loadCodes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/codes?type=${selectedType}`);
      if (!response.ok) {
        throw new Error("Error al cargar códigos");
      }
      const data = await response.json();
      setCodes(data);
    } catch (error) {
      console.error("Error fetching codes:", error);
      toast.error("Error al cargar los códigos");
    } finally {
      setLoading(false);
    }
  };

  // Cargar códigos cuando cambia el tipo seleccionado
  useEffect(() => {
    loadCodes();
  }, [selectedType]);

  // Importar códigos estáticos
  const importCodes = async () => {
    setImportLoading(true);
    try {
      const response = await fetch("/api/codes/import", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Error al importar códigos");
      }

      toast.success("Códigos importados correctamente");
      loadCodes(); // Recargar los códigos
    } catch (error) {
      console.error("Error importing codes:", error);
      toast.error("Error al importar los códigos");
    } finally {
      setImportLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar cambios en selects
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Abrir modal para añadir
  const handleOpenAddDialog = () => {
    setFormData({
      type: selectedType,
      code: "",
      name: "",
      description: "",
    });
    setShowAddDialog(true);
  };

  // Abrir modal para editar
  const handleOpenEditDialog = (code: Code) => {
    setFormData({
      id: code.id,
      type: code.type,
      code: code.code,
      name: code.name,
      description: code.description,
    });
    setShowEditDialog(true);
  };

  // Abrir modal para eliminar
  const handleOpenDeleteDialog = (code: Code) => {
    setFormData({
      id: code.id,
      type: code.type,
      code: code.code,
      name: code.name,
    });
    setShowDeleteDialog(true);
  };

  // Guardar nuevo código
  const handleAddCode = async () => {
    if (!formData.code || !formData.name) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear el código");
      }

      toast.success("Código creado correctamente");
      setShowAddDialog(false);
      loadCodes();
    } catch (error) {
      console.error("Error adding code:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al crear el código"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Actualizar código existente
  const handleUpdateCode = async () => {
    if (!formData.id || !formData.code || !formData.name) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/codes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el código");
      }

      toast.success("Código actualizado correctamente");
      setShowEditDialog(false);
      loadCodes();
    } catch (error) {
      console.error("Error updating code:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar el código"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar código
  const handleDeleteCode = async () => {
    if (!formData.id) {
      toast.error("ID de código no válido");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/codes?id=${formData.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el código");
      }

      toast.success("Código eliminado correctamente");
      setShowDeleteDialog(false);
      loadCodes();
    } catch (error) {
      console.error("Error deleting code:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar el código"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Descargar códigos como JSON
  const handleExportCodes = () => {
    const jsonStr = JSON.stringify(codes, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedType}-codes.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className='container p-4'>
      <h1 className='text-2xl font-bold mb-6'>Administración de Códigos</h1>

      {/* Filtros y controles */}
      <div className='flex flex-wrap gap-4 mb-6 items-center'>
        <div className='flex-grow max-w-xs'>
          <Select
            value={selectedType}
            onValueChange={(value) => setSelectedType(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder='Seleccionar tipo' />
            </SelectTrigger>
            <SelectContent>
              {codeTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={loadCodes} className='bg-zinc-700 hover:bg-zinc-600'>
          <RefreshCw size={18} className='mr-2' />
          Recargar
        </Button>

        <Button
          onClick={handleOpenAddDialog}
          className='bg-[#CEFF66] hover:bg-[#bfef33] text-zinc-900'
        >
          <Plus size={18} className='mr-2' />
          Nuevo código
        </Button>

        <Button
          onClick={handleExportCodes}
          variant='outline'
          className='border-zinc-600'
        >
          <Download size={18} className='mr-2' />
          Exportar
        </Button>

        <Button
          onClick={importCodes}
          disabled={importLoading}
          variant='outline'
          className='border-zinc-600'
        >
          <Upload size={18} className='mr-2' />
          {importLoading ? "Importando..." : "Importar estáticos"}
        </Button>
      </div>

      {/* Tabla de códigos */}
      <div className='rounded-md border border-zinc-700 overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-zinc-800 hover:bg-zinc-800'>
              <TableHead className='text-zinc-300 w-40'>Código</TableHead>
              <TableHead className='text-zinc-300'>Nombre</TableHead>
              <TableHead className='text-zinc-300'>Descripción</TableHead>
              <TableHead className='text-zinc-300 text-right w-40'>
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className='text-center py-10'>
                  Cargando códigos...
                </TableCell>
              </TableRow>
            ) : codes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='text-center py-10'>
                  No hay códigos disponibles
                </TableCell>
              </TableRow>
            ) : (
              codes.map((code) => (
                <TableRow key={code.id} className='hover:bg-zinc-900'>
                  <TableCell className='font-medium'>{code.code}</TableCell>
                  <TableCell>{code.name}</TableCell>
                  <TableCell className='text-sm text-zinc-400'>
                    {code.description || "-"}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button
                        onClick={() => handleOpenEditDialog(code)}
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8'
                        title='Editar'
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        onClick={() => handleOpenDeleteDialog(code)}
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-red-500 hover:text-red-600'
                        title='Eliminar'
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal para añadir código */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className='bg-zinc-900 text-white'>
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Código</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <label htmlFor='type'>Tipo</label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id='type'>
                  <SelectValue placeholder='Seleccionar tipo' />
                </SelectTrigger>
                <SelectContent>
                  {codeTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-2'>
              <label htmlFor='code'>Código *</label>
              <Input
                id='code'
                name='code'
                value={formData.code}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder='Ej: 01, A, 0001'
                className='bg-zinc-800 border-zinc-700'
              />
            </div>
            <div className='grid gap-2'>
              <label htmlFor='name'>Nombre *</label>
              <Input
                id='name'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder='Nombre del código'
                className='bg-zinc-800 border-zinc-700'
              />
            </div>
            <div className='grid gap-2'>
              <label htmlFor='description'>Descripción</label>
              <Textarea
                id='description'
                name='description'
                value={formData.description || ""}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder='Descripción opcional'
                className='bg-zinc-800 border-zinc-700'
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setShowAddDialog(false)}
              disabled={isSubmitting}
              className='border-zinc-700'
            >
              Cancelar
            </Button>
            <Button
              type='button'
              onClick={handleAddCode}
              disabled={isSubmitting}
              className='bg-[#CEFF66] hover:bg-[#bfef33] text-zinc-900'
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar código */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className='bg-zinc-900 text-white'>
          <DialogHeader>
            <DialogTitle>Editar Código</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <label htmlFor='edit-type'>Tipo</label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id='edit-type'>
                  <SelectValue placeholder='Seleccionar tipo' />
                </SelectTrigger>
                <SelectContent>
                  {codeTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-2'>
              <label htmlFor='edit-code'>Código *</label>
              <Input
                id='edit-code'
                name='code'
                value={formData.code}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder='Ej: 01, A, 0001'
                className='bg-zinc-800 border-zinc-700'
              />
            </div>
            <div className='grid gap-2'>
              <label htmlFor='edit-name'>Nombre *</label>
              <Input
                id='edit-name'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder='Nombre del código'
                className='bg-zinc-800 border-zinc-700'
              />
            </div>
            <div className='grid gap-2'>
              <label htmlFor='edit-description'>Descripción</label>
              <Textarea
                id='edit-description'
                name='description'
                value={formData.description || ""}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder='Descripción opcional'
                className='bg-zinc-800 border-zinc-700'
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setShowEditDialog(false)}
              disabled={isSubmitting}
              className='border-zinc-700'
            >
              Cancelar
            </Button>
            <Button
              type='button'
              onClick={handleUpdateCode}
              disabled={isSubmitting}
              className='bg-[#CEFF66] hover:bg-[#bfef33] text-zinc-900'
            >
              {isSubmitting ? "Guardando..." : "Actualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para confirmar eliminación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className='bg-zinc-900 text-white'>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <div className='py-4'>
            <p>
              ¿Estás seguro de que deseas eliminar el código{" "}
              <strong>{formData.code}</strong> ({formData.name})?
            </p>
            <p className='text-red-400 mt-2'>
              Esta acción no se puede deshacer.
            </p>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setShowDeleteDialog(false)}
              disabled={isSubmitting}
              className='border-zinc-700'
            >
              Cancelar
            </Button>
            <Button
              type='button'
              onClick={handleDeleteCode}
              disabled={isSubmitting}
              variant='destructive'
            >
              {isSubmitting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
