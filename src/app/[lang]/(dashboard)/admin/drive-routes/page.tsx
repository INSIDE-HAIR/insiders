"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  PlusIcon,
  RefreshCw,
  ExternalLink,
  FileJson,
  Loader2,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  InfoIcon,
} from "lucide-react";
import { format, differenceInHours } from "date-fns";
import { useToast } from "@/src/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Switch } from "@/src/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { Separator } from "@/src/components/ui/separator";

// Schema de validación para crear rutas
const formSchema = z.object({
  slug: z
    .string()
    .min(3, { message: "El slug debe tener al menos 3 caracteres" })
    .max(50, { message: "El slug no puede tener más de 50 caracteres" })
    .regex(/^[a-z0-9-]+$/, {
      message:
        "El slug solo puede contener letras minúsculas, números y guiones",
    }),
  folderId: z.string().min(5, {
    message: "El ID de carpeta de Drive es obligatorio",
  }),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  customSettings: z.string().optional(),
});

// Definir tipos para las propiedades
interface DriveRoute {
  id: string;
  slug: string;
  folderIds: string[];
  title: string | null;
  subtitle: string | null;
  description: string | null;
  lastUpdated: string;
  isActive: boolean;
  hierarchyData: any;
  customSettings?: any;
}

// Función para determinar el estado de actualización
function getUpdateStatus(lastUpdated: string, isActive: boolean) {
  if (!isActive) {
    return {
      status: "inactive",
      color: "gray",
      label: "Inactiva",
      icon: <AlertCircle className='h-4 w-4' />,
      variant: "outline" as const,
      tooltipText: "Ruta inactiva, no se sincroniza automáticamente.",
    };
  }

  const hours = differenceInHours(new Date(), new Date(lastUpdated));

  if (hours < 12) {
    return {
      status: "updated",
      color: "green",
      label: "Actualizada",
      icon: <CheckCircle className='h-4 w-4' />,
      variant: "default" as const,
      tooltipText: "Actualizada en las últimas 12 horas.",
    };
  } else if (hours < 24) {
    return {
      status: "warning",
      color: "yellow",
      label: "Actualización próxima",
      icon: <Clock className='h-4 w-4' />,
      variant: "warning" as const,
      tooltipText:
        "Entre 12-24 horas sin actualizar. Se actualizará automáticamente al acceder.",
    };
  } else {
    return {
      status: "outdated",
      color: "red",
      label: "Necesita actualización",
      icon: <AlertCircle className='h-4 w-4' />,
      variant: "destructive" as const,
      tooltipText:
        "Más de 24 horas sin actualizar. Requiere sincronización manual.",
    };
  }
}

export default function DriveRoutesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [routes, setRoutes] = useState<DriveRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJson, setSelectedJson] = useState<any>(null);
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<DriveRoute | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [legendModalOpen, setLegendModalOpen] = useState(false);

  // Formulario para crear/editar rutas
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: "",
      folderId: "",
      title: "",
      subtitle: "",
      description: "",
      customSettings: "",
    },
  });

  // Efecto para actualizar el formulario cuando se selecciona una ruta para editar
  useEffect(() => {
    if (selectedRoute) {
      form.reset({
        slug: selectedRoute.slug,
        folderId: selectedRoute.folderIds[0], // Tomamos el primer ID por ahora
        title: selectedRoute.title || "",
        subtitle: selectedRoute.subtitle || "",
        description: selectedRoute.description || "",
        customSettings: selectedRoute.customSettings
          ? JSON.stringify(selectedRoute.customSettings, null, 2)
          : "",
      });
    }
  }, [selectedRoute, form]);

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Verificar si hay rutas que necesitan actualización automática
  useEffect(() => {
    const autoSyncRoutes = async () => {
      for (const route of routes) {
        if (route.isActive) {
          const status = getUpdateStatus(route.lastUpdated, route.isActive);
          if (status.status === "warning") {
            await syncRoute(route.id, true);
          }
        }
      }
    };

    if (routes.length > 0) {
      autoSyncRoutes();
    }
  }, [routes]);

  // Redirigir si el usuario no está autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Si está cargando la sesión, mostrar loading
  if (status === "loading") {
    return (
      <div className='container py-10 flex justify-center items-center min-h-[50vh]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p>Verificando sesión...</p>
        </div>
      </div>
    );
  }

  async function fetchRoutes() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/drive-routes");
      if (!response.ok) {
        throw new Error("Error al cargar rutas de Drive");
      }
      const data = await response.json();
      setRoutes(data);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function syncRoute(id: string, silent = false) {
    try {
      if (!silent) {
        toast({
          title: "Sincronizando...",
          description: "Obteniendo datos de Drive",
        });
      }

      const response = await fetch(`/api/admin/drive-routes/${id}/fetch`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al sincronizar");
      }

      if (!silent) {
        toast({
          title: "Sincronización completada",
          description: "Datos actualizados correctamente",
          variant: "success",
        });
      }

      fetchRoutes(); // Actualizar la lista
    } catch (error) {
      if (!silent) {
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Error desconocido",
          variant: "destructive",
        });
      }
    }
  }

  function viewJson(route: DriveRoute) {
    setSelectedJson(route.hierarchyData);
    setJsonModalOpen(true);
  }

  function handleDeleteRoute(id: string) {
    // Implementar confirmación y eliminación
  }

  function handleEditRoute(route: DriveRoute) {
    setSelectedRoute(route);
    setEditModalOpen(true);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // Crear objeto de datos para enviar
      const requestData = {
        slug: values.slug,
        folderIds: [values.folderId], // Array para futuras extensiones
        title: values.title?.trim() === "" ? null : values.title,
        subtitle: values.subtitle?.trim() === "" ? null : values.subtitle,
        description:
          values.description?.trim() === "" ? null : values.description,
        customSettings: values.customSettings
          ? JSON.parse(values.customSettings)
          : null,
      };

      const isEditing = !!selectedRoute;
      const url = isEditing
        ? `/api/admin/drive-routes/${selectedRoute.id}`
        : "/api/admin/drive-routes";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Error al ${isEditing ? "actualizar" : "crear"} la ruta`
        );
      }

      toast({
        title: isEditing ? "Ruta actualizada" : "Ruta creada",
        description: isEditing
          ? "La ruta se ha actualizado correctamente. Ahora se sincronizará con Drive."
          : "La ruta se ha creado correctamente. Ahora se sincronizará con Drive.",
        variant: "success",
      });

      // Cerrar modal y actualizar la lista
      setCreateModalOpen(false);
      setEditModalOpen(false);
      setSelectedRoute(null);
      form.reset();
      fetchRoutes();
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleRouteStatus(id: string, status: boolean) {
    try {
      const response = await fetch(`/api/admin/drive-routes/${id}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: status }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el estado de la ruta");
      }

      toast({
        title: "Estado actualizado",
        description: `La ruta ha sido ${
          status ? "activada" : "desactivada"
        } correctamente.`,
        variant: "success",
      });

      fetchRoutes(); // Actualizar la lista
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  }

  return (
    <div className='container py-10'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold'>Rutas de Drive</h1>
          <p className='text-muted-foreground'>
            Administra tus rutas de integración con Google Drive
          </p>
        </div>
        <div className='flex space-x-2'>
          <Button onClick={() => setLegendModalOpen(true)} variant='outline'>
            <InfoIcon className='mr-2 h-4 w-4' /> Leyenda
          </Button>
          <Button onClick={() => router.push("/admin/drive-routes/docs")}>
            Documentación
          </Button>
          <Button onClick={() => setCreateModalOpen(true)}>
            <PlusIcon className='mr-2 h-4 w-4' /> Crear Ruta
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas las Rutas</CardTitle>
          <CardDescription>
            Gestiona las rutas de acceso a contenido de Google Drive
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex justify-center py-10'>
              <RefreshCw className='h-10 w-10 animate-spin text-muted-foreground' />
            </div>
          ) : (
            <Table>
              <TableCaption>
                Lista de rutas configuradas para Drive
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Estado</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Estado Actualización</TableHead>
                  <TableHead>Última Actualización</TableHead>
                  <TableHead className='text-right'>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center py-10'>
                      No hay rutas configuradas.
                      <div className='mt-2'>
                        <Button
                          variant='outline'
                          onClick={() => setCreateModalOpen(true)}
                        >
                          <PlusIcon className='mr-2 h-4 w-4' /> Crear la primera
                          ruta
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  routes.map((route) => {
                    const updateStatus = getUpdateStatus(
                      route.lastUpdated,
                      route.isActive
                    );
                    return (
                      <TableRow key={route.id}>
                        <TableCell>
                          <Switch
                            checked={route.isActive}
                            onCheckedChange={(checked) =>
                              toggleRouteStatus(route.id, checked)
                            }
                            aria-label='Toggle route status'
                          />
                        </TableCell>
                        <TableCell className='font-medium'>
                          {route.title || "Sin título"}
                        </TableCell>
                        <TableCell>{route.slug}</TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className='cursor-help'>
                                  <Badge
                                    variant={updateStatus.variant}
                                    className='flex items-center gap-1'
                                  >
                                    {updateStatus.icon}
                                    {updateStatus.label}
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{updateStatus.tooltipText}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(route.lastUpdated),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </TableCell>
                        <TableCell className='text-right space-x-2'>
                          <TooltipProvider>
                            <div className='flex items-center justify-end gap-2'>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant='outline'
                                    size='icon'
                                    onClick={() => handleEditRoute(route)}
                                  >
                                    <Pencil className='h-4 w-4' />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Editar</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant='outline'
                                    size='icon'
                                    onClick={() => syncRoute(route.id)}
                                  >
                                    <RefreshCw className='h-4 w-4' />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Sincronizar</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant='outline'
                                    size='icon'
                                    onClick={() => viewJson(route)}
                                  >
                                    <FileJson className='h-4 w-4' />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Ver JSON</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant='outline'
                                    size='icon'
                                    onClick={() =>
                                      window.open(`/${route.slug}`, "_blank")
                                    }
                                  >
                                    <ExternalLink className='h-4 w-4' />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Ver en nueva pestaña</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant='destructive'
                                    size='icon'
                                    onClick={() => handleDeleteRoute(route.id)}
                                  >
                                    <Trash2 className='h-4 w-4' />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Eliminar</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal para la leyenda */}
      <Dialog open={legendModalOpen} onOpenChange={setLegendModalOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-xl flex items-center gap-2'>
              <InfoIcon className='h-5 w-5' />
              Leyenda de Estados
            </DialogTitle>
            <DialogDescription>
              Información sobre el sistema de actualización automática
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 pt-2'>
            <div className='space-y-3'>
              {/* Estado: Actualizada */}
              <div className='flex items-start gap-3 p-3 rounded-lg border bg-background hover:bg-accent/50 transition-colors'>
                <Badge
                  variant='default'
                  className='flex items-center gap-1 mt-0.5'
                >
                  <CheckCircle className='h-4 w-4' />
                  Actualizada
                </Badge>
                <div>
                  <p className='font-medium text-sm'>
                    Actualizada en las últimas 12 horas
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Los datos están actualizados y no requieren acción.
                  </p>
                </div>
              </div>

              {/* Estado: Actualización próxima */}
              <div className='flex items-start gap-3 p-3 rounded-lg border bg-background hover:bg-accent/50 transition-colors'>
                <Badge
                  variant='warning'
                  className='flex items-center gap-1 mt-0.5'
                >
                  <Clock className='h-4 w-4' />
                  Actualización próxima
                </Badge>
                <div>
                  <p className='font-medium text-sm'>
                    Entre 12-24 horas sin actualizar
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Se actualizará automáticamente cuando un usuario acceda a la
                    ruta.
                  </p>
                </div>
              </div>

              {/* Estado: Necesita actualización */}
              <div className='flex items-start gap-3 p-3 rounded-lg border bg-background hover:bg-accent/50 transition-colors'>
                <Badge
                  variant='destructive'
                  className='flex items-center gap-1 mt-0.5'
                >
                  <AlertCircle className='h-4 w-4' />
                  Necesita actualización
                </Badge>
                <div>
                  <p className='font-medium text-sm'>
                    Más de 24 horas sin actualizar
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Requiere sincronización manual para garantizar que los datos
                    estén al día.
                  </p>
                </div>
              </div>

              {/* Estado: Inactiva */}
              <div className='flex items-start gap-3 p-3 rounded-lg border bg-background hover:bg-accent/50 transition-colors'>
                <Badge
                  variant='outline'
                  className='flex items-center gap-1 mt-0.5'
                >
                  <AlertCircle className='h-4 w-4' />
                  Inactiva
                </Badge>
                <div>
                  <p className='font-medium text-sm'>Ruta desactivada</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    No se actualiza automáticamente mientras esté desactivada.
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-muted p-4 rounded-lg text-sm mt-4'>
              <h4 className='font-semibold mb-2 flex items-center gap-1'>
                <RefreshCw className='h-4 w-4' /> Actualización Automática
              </h4>
              <p className='text-sm mb-2'>
                Las rutas con estado &quot;Actualización próxima&quot;
                (amarillo) se actualizarán automáticamente cuando un usuario
                acceda a ellas, siempre que estén activas.
              </p>
              <p className='text-sm'>
                Las rutas con estado &quot;Necesita actualización&quot; (rojo)
                requieren una sincronización manual para garantizar que los
                datos estén al día.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para ver JSON */}
      <Dialog open={jsonModalOpen} onOpenChange={setJsonModalOpen}>
        <DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Datos JSON</DialogTitle>
            <DialogDescription>
              Representación JSON de los datos de la ruta
            </DialogDescription>
          </DialogHeader>
          <pre className='bg-muted p-4 rounded-md overflow-x-auto text-xs'>
            {JSON.stringify(selectedJson, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>

      {/* Modal para crear/editar ruta */}
      <Dialog
        open={createModalOpen || editModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateModalOpen(false);
            setEditModalOpen(false);
            setSelectedRoute(null);
            form.reset();
          }
        }}
      >
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>
              {selectedRoute ? "Editar Ruta" : "Crear Nueva Ruta"}
            </DialogTitle>
            <DialogDescription>
              {selectedRoute
                ? "Modifica los detalles de la ruta existente"
                : "Completa los detalles para crear una nueva ruta de Drive"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='slug'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL (Slug)</FormLabel>
                    <FormControl>
                      <Input placeholder='mi-ruta-drive' {...field} />
                    </FormControl>
                    <FormDescription>
                      La URL donde se mostrará el contenido (ej: /mi-ruta-drive)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='folderId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID de Carpeta de Google Drive</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='1ABC123_ejemploDeIdDeCarpeta'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      El ID de la carpeta de Google Drive a mostrar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Contenido Drive'
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Un título descriptivo para esta ruta
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='subtitle'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtítulo (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Explora nuestro contenido de Drive'
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Descripción opcional' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='customSettings'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Configuraciones Personalizadas (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"key": "value"}'
                        className='font-mono'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Configuraciones adicionales en formato JSON
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type='submit' disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />{" "}
                      Creando...
                    </>
                  ) : (
                    "Crear Ruta"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
