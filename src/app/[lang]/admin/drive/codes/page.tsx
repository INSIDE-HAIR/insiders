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
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<"generate" | "decode">(
    "generate"
  );

  // Estados para los códigos organizados por tipo
  const [codesByType, setCodesByType] = useState<Record<string, Code[]>>({
    client: [],
    campaign: [],
    file: [],
    lang: [],
  });

  // Estados para el generador de nombres
  const [generator, setGenerator] = useState({
    client: "none",
    campaign: "none",
    date: "", // YYMM formato
    fileType: "none",
    language: "none",
    version: "00",
    number: "01",
  });

  // Estado para el decodificador
  const [fileCodeInput, setFileCodeInput] = useState("");
  const [decodedParts, setDecodedParts] = useState<Record<string, string>>({});

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

  // Cargar todos los códigos para el generador/decodificador
  const loadAllCodeTypes = async () => {
    try {
      const types = ["client", "campaign", "file", "lang"];
      const newCodesByType: Record<string, Code[]> = {
        client: [],
        campaign: [],
        file: [],
        lang: [],
      };

      for (const type of types) {
        const response = await fetch(`/api/codes?type=${type}`);
        if (response.ok) {
          const data = await response.json();
          newCodesByType[type] = data;
        }
      }

      setCodesByType(newCodesByType);
    } catch (error) {
      console.error("Error loading all code types:", error);
      toast.error("Error al cargar los códigos para la vista previa");
    }
  };

  // Cargar códigos cuando cambia el tipo seleccionado
  useEffect(() => {
    loadCodes();
  }, [selectedType]);

  // Cargar todos los tipos de códigos cuando se muestra la vista previa
  useEffect(() => {
    if (showPreview) {
      loadAllCodeTypes();
    }
  }, [showPreview]);

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

  // Manejar cambios en el generador
  const handleGeneratorChange = (field: string, value: string) => {
    setGenerator((prev) => ({ ...prev, [field]: value }));
  };

  // Generar el nombre del archivo basado en las selecciones
  const generateFileName = () => {
    if (
      !generator.client ||
      !generator.campaign ||
      !generator.date ||
      !generator.fileType ||
      !generator.language ||
      generator.client === "none" ||
      generator.campaign === "none" ||
      generator.fileType === "none" ||
      generator.language === "none"
    ) {
      return "Por favor, complete todos los campos requeridos";
    }

    return `${generator.client}-${generator.campaign}-${generator.date}-${generator.fileType}-${generator.language}-${generator.version}-${generator.number}`;
  };

  // Decodificar un nombre de archivo
  const decodeFileName = (filename: string) => {
    // Formato esperado: CLIENT-CAMPAIGN-YYMM-FILETYPE-LANG-VERSION-NUMBER
    const parts = filename.split("-");
    if (parts.length !== 7) {
      toast.error("Formato de nombre de archivo inválido");
      setDecodedParts({});
      return;
    }

    const [client, campaign, date, fileType, language, version, number] = parts;

    const decoded: Record<string, string> = {
      Cliente: findCodeName("client", client) || client,
      Campaña: findCodeName("campaign", campaign) || campaign,
      Fecha: `${date.slice(0, 2)}/${date.slice(2, 4)}`,
      "Tipo de archivo": findCodeName("file", fileType) || fileType,
      Idioma: findCodeName("lang", language) || language,
      Versión: version,
      Número: number,
    };

    setDecodedParts(decoded);
  };

  // Encontrar el nombre de un código por su valor y tipo
  const findCodeName = (type: string, code: string): string | undefined => {
    const found = codesByType[type as keyof typeof codesByType]?.find(
      (c) => c.code === code
    );
    return found?.name;
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
            <SelectTrigger className='text-white font-bold bg-zinc-900 border-zinc-700'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='bg-zinc-900 border-zinc-700 text-white'>
              {codeTypes.map((type) => (
                <SelectItem
                  key={type.value}
                  value={type.value}
                  className='text-white hover:bg-zinc-800 focus:bg-zinc-800'
                >
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
          className='bg-inside hover:bg-[#bfef33] text-zinc-900'
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

        <Button
          onClick={() => setShowPreview(!showPreview)}
          variant={showPreview ? "default" : "outline"}
          className={
            showPreview ? "bg-inside text-zinc-900" : "border-zinc-600"
          }
        >
          Vista Previa de Archivos
        </Button>
      </div>

      {/* Vista previa de nombres de archivo */}
      {showPreview && (
        <div className='mb-8 p-4 border border-zinc-700 rounded-md bg-zinc-800'>
          <h2 className='text-white text-xl font-bold mb-4'>
            Vista Previa de Nombres de Archivo
          </h2>

          <div className='flex gap-4 mb-4'>
            <Button
              onClick={() => setPreviewMode("generate")}
              variant={previewMode === "generate" ? "default" : "outline"}
              className={
                previewMode === "generate"
                  ? "bg-inside text-zinc-900 hover:bg-inside"
                  : "border-zinc-600 hover:bg-zinc-200"
              }
            >
              Generar Nombre
            </Button>
            <Button
              onClick={() => setPreviewMode("decode")}
              variant={previewMode === "decode" ? "default" : "outline"}
              className={
                previewMode === "decode"
                  ? "bg-inside text-zinc-900 hover:bg-inside"
                  : "border-zinc-600 hover:bg-zinc-200"
              }
            >
              Decodificar Nombre
            </Button>
          </div>

          {previewMode === "generate" ? (
            <div className='space-y-4'>
              <p className='text-zinc-400'>
                Seleccione las diferentes partes para generar un nombre de
                archivo:
              </p>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {/* Cliente */}
                <div>
                  <label className='text-white block text-sm mb-1'>
                    Cliente
                  </label>
                  <Select
                    value={generator.client}
                    onValueChange={(value) =>
                      handleGeneratorChange("client", value)
                    }
                  >
                    <SelectTrigger className='text-white font-bold bg-zinc-900 border-zinc-700'>
                      <SelectValue placeholder='Seleccionar cliente' />
                    </SelectTrigger>
                    <SelectContent className='bg-zinc-900 border-zinc-700 text-white'>
                      <SelectItem
                        value='none'
                        className='bg-zinc-800 text-zinc-400 hover:bg-zinc-800 focus:bg-zinc-800'
                      >
                        Sin cliente
                      </SelectItem>
                      {codesByType.client.map((code) => (
                        <SelectItem
                          key={code.id}
                          value={code.code}
                          className='text-white hover:bg-zinc-800 focus:bg-zinc-800'
                        >
                          {code.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Campaña */}
                <div>
                  <label className='text-white block text-sm mb-1'>
                    Campaña
                  </label>
                  <Select
                    value={generator.campaign}
                    onValueChange={(value) =>
                      handleGeneratorChange("campaign", value)
                    }
                  >
                    <SelectTrigger className='text-white font-bold bg-zinc-900 border-zinc-700'>
                      <SelectValue placeholder='Seleccionar campaña' />
                    </SelectTrigger>
                    <SelectContent className='bg-zinc-900 border-zinc-700 text-white'>
                      <SelectItem
                        value='none'
                        className='bg-zinc-800 text-zinc-400 hover:bg-zinc-800 focus:bg-zinc-800'
                      >
                        Sin campaña
                      </SelectItem>
                      {codesByType.campaign.map((code) => (
                        <SelectItem
                          key={code.id}
                          value={code.code}
                          className='text-white hover:bg-zinc-800 focus:bg-zinc-800'
                        >
                          {code.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fecha YYMM */}
                <div>
                  <label className='text-white block text-sm mb-1'>
                    Fecha (YYMM)
                  </label>
                  <Input
                    type='text'
                    value={generator.date}
                    onChange={(e) =>
                      handleGeneratorChange("date", e.target.value)
                    }
                    placeholder='Ej: 2404 (abril 2024)'
                    className='text-white font-bold bg-zinc-900 border-zinc-700'
                    maxLength={4}
                  />
                </div>

                {/* Tipo de archivo */}
                <div>
                  <label className='text-white block text-sm mb-1'>
                    Tipo de archivo
                  </label>
                  <Select
                    value={generator.fileType}
                    onValueChange={(value) =>
                      handleGeneratorChange("fileType", value)
                    }
                  >
                    <SelectTrigger className='text-white font-bold bg-zinc-900 border-zinc-700'>
                      <SelectValue placeholder='Seleccionar tipo' />
                    </SelectTrigger>
                    <SelectContent className='bg-zinc-900 border-zinc-700 text-white'>
                      <SelectItem
                        value='none'
                        className='bg-zinc-800 text-zinc-400 hover:bg-zinc-800 focus:bg-zinc-800'
                      >
                        Sin tipo
                      </SelectItem>
                      {codesByType.file.map((code) => (
                        <SelectItem
                          key={code.id}
                          value={code.code}
                          className='text-white hover:bg-zinc-800 focus:bg-zinc-800'
                        >
                          {code.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Idioma */}
                <div>
                  <label className='text-white block text-sm mb-1'>
                    Idioma
                  </label>
                  <Select
                    value={generator.language}
                    onValueChange={(value) =>
                      handleGeneratorChange("language", value)
                    }
                  >
                    <SelectTrigger className='text-white font-bold bg-zinc-900 border-zinc-700'>
                      <SelectValue placeholder='Seleccionar idioma' />
                    </SelectTrigger>
                    <SelectContent className='bg-zinc-900 border-zinc-700 text-white'>
                      <SelectItem
                        value='none'
                        className='bg-zinc-800 text-zinc-400 hover:bg-zinc-800 focus:bg-zinc-800'
                      >
                        Sin idioma
                      </SelectItem>
                      {codesByType.lang.map((code) => (
                        <SelectItem
                          key={code.id}
                          value={code.code}
                          className='text-white hover:bg-zinc-800 focus:bg-zinc-800'
                        >
                          {code.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Versión */}
                <div>
                  <label className='text-white block text-sm mb-1'>
                    Versión
                  </label>
                  <Input
                    type='text'
                    value={generator.version}
                    onChange={(e) =>
                      handleGeneratorChange("version", e.target.value)
                    }
                    placeholder='Ej: 00, 01, 02...'
                    className='text-white font-bold bg-zinc-900 border-zinc-700'
                    maxLength={2}
                  />
                </div>

                {/* Número */}
                <div>
                  <label className='text-white block text-sm mb-1'>
                    Número
                  </label>
                  <Input
                    type='text'
                    value={generator.number}
                    onChange={(e) =>
                      handleGeneratorChange("number", e.target.value)
                    }
                    placeholder='Ej: 01, 02, 03...'
                    className='text-white font-bold bg-zinc-900 border-zinc-700'
                    maxLength={2}
                  />
                </div>
              </div>

              <div className='mt-6 p-3 bg-zinc-900 border border-zinc-700 rounded-md'>
                <label className='text-white block text-sm mb-2 font-medium'>
                  Nombre Generado:
                </label>
                <div className='p-2 bg-black rounded flex items-center justify-between'>
                  <code className='text-inside'>{generateFileName()}</code>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      navigator.clipboard.writeText(generateFileName());
                      toast.success("Nombre copiado al portapapeles");
                    }}
                    className='ml-2'
                  >
                    <span className='sr-only'>Copiar</span>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <rect
                        x='9'
                        y='9'
                        width='13'
                        height='13'
                        rx='2'
                        ry='2'
                      ></rect>
                      <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'></path>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              <p className='text-zinc-400'>
                Introduzca un nombre de archivo para decodificarlo:
              </p>

              <div className='flex gap-2'>
                <Input
                  type='text'
                  value={fileCodeInput}
                  onChange={(e) => setFileCodeInput(e.target.value)}
                  placeholder='Ej: A-A-2404-0080-01-00-01'
                  className='text-white font-bold bg-zinc-900 border-zinc-700 flex-grow'
                />
                <Button
                  onClick={() => decodeFileName(fileCodeInput)}
                  className='bg-inside hover:bg-[#bfef33] text-zinc-900'
                >
                  Decodificar
                </Button>
              </div>

              {Object.keys(decodedParts).length > 0 && (
                <div className='mt-4 p-3 bg-zinc-900 border border-zinc-700 rounded-md'>
                  <label className='text-white block text-sm mb-2 font-medium'>
                    Resultado:
                  </label>
                  <div className='space-y-2'>
                    {Object.entries(decodedParts).map(([key, value]) => (
                      <div key={key} className='grid grid-cols-3 gap-2'>
                        <div className='text-zinc-400'>{key}:</div>
                        <div className='col-span-2 text-inside'>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
                <SelectTrigger className='text-white font-bold bg-zinc-900 border-zinc-700'>
                  <SelectValue placeholder={t("selectType")} />
                </SelectTrigger>
                <SelectContent className='bg-zinc-900 border-zinc-700 text-white'>
                  {codeTypes.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      className='text-white hover:bg-zinc-800 focus:bg-zinc-800'
                    >
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
              className='bg-inside hover:bg-[#bfef33] text-zinc-900'
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
                <SelectTrigger className='text-white font-bold bg-zinc-900 border-zinc-700'>
                  <SelectValue placeholder={t("selectType")} />
                </SelectTrigger>
                <SelectContent className='bg-zinc-900 border-zinc-700 text-white'>
                  {codeTypes.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      className='text-white hover:bg-zinc-800 focus:bg-zinc-800'
                    >
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
              className='border-zinc-700 text-zinc-900'
            >
              Cancelar
            </Button>
            <Button
              type='button'
              onClick={handleUpdateCode}
              disabled={isSubmitting}
              className='bg-inside hover:bg-[#bfef33] text-zinc-900'
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
