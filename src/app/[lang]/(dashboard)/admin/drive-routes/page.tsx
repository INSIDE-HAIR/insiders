"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import { Badge } from "@/src/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { useToast } from "@/src/components/ui/use-toast";
import {
  Loader2,
  Plus,
  Trash,
  ClipboardList,
  RefreshCw,
  BookOpen,
  Code,
  Copy,
  ExternalLink,
  Maximize,
  Edit,
  FilePlus,
} from "lucide-react";
import Link from "next/link";

interface DriveRouteMapping {
  id: string;
  routeLevel1: string;
  routeLevel2: string | null;
  routeLevel3: string | null;
  routeLevel4: string | null;
  routeLevel5: string | null;
  title: string;
  subtitle: string | null;
  rootFolderId: string;
  defaultDepth: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface HierarchyStats {
  totalItems: number;
  maxDepth: number;
  fromCache: boolean;
  cacheAge?: number;
  buildTimeMs?: number;
}

export default function DriveRouteAdmin() {
  const { data: session, status } = useSession();
  const [routes, setRoutes] = useState<DriveRouteMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<string | null>(null);
  const [routeToEdit, setRouteToEdit] = useState<DriveRouteMapping | null>(
    null
  );
  const [refreshingRoutes, setRefreshingRoutes] = useState<string[]>([]);
  const [invalidatingAllCache, setInvalidatingAllCache] = useState(false);
  const [cleaningCache, setCleaningCache] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const [currentJsonData, setCurrentJsonData] = useState<any>(null);
  const [currentJsonStats, setCurrentJsonStats] =
    useState<HierarchyStats | null>(null);
  const [loadingJson, setLoadingJson] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Estado para el formulario
  const [routeForm, setRouteForm] = useState({
    id: "",
    routeLevel1: "",
    routeLevel2: "",
    routeLevel3: "",
    routeLevel4: "",
    routeLevel5: "",
    title: "",
    subtitle: "",
    rootFolderId: "",
    defaultDepth: 3,
    isActive: true,
  });

  // Cargar datos de rutas
  const fetchRoutes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/drive/config/routes");
      if (!response.ok) {
        throw new Error("Error al cargar las rutas");
      }
      const data = await response.json();
      setRoutes(data.routes || []);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones de rutas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos cuando el componente se monta
  useEffect(() => {
    if (status === "authenticated") {
      fetchRoutes();
    }
  }, [status]);

  // Manejar los cambios en el formulario
  const handleFormChange = (field: string, value: any) => {
    setRouteForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Abrir formulario para editar
  const handleEditRoute = (route: DriveRouteMapping) => {
    setRouteToEdit(route);
    setRouteForm({
      id: route.id,
      routeLevel1: route.routeLevel1,
      routeLevel2: route.routeLevel2 || "",
      routeLevel3: route.routeLevel3 || "",
      routeLevel4: route.routeLevel4 || "",
      routeLevel5: route.routeLevel5 || "",
      title: route.title,
      subtitle: route.subtitle || "",
      rootFolderId: route.rootFolderId,
      defaultDepth: route.defaultDepth,
      isActive: route.isActive,
    });
    setShowAddDialog(true);
  };

  // Abrir formulario para nueva ruta
  const handleNewRoute = () => {
    setRouteToEdit(null);
    setRouteForm({
      id: "",
      routeLevel1: "",
      routeLevel2: "",
      routeLevel3: "",
      routeLevel4: "",
      routeLevel5: "",
      title: "",
      subtitle: "",
      rootFolderId: "",
      defaultDepth: 3,
      isActive: true,
    });
    setShowAddDialog(true);
  };

  // Validar formulario antes de enviar
  const validateRouteForm = () => {
    // Validar campos obligatorios
    if (!routeForm.routeLevel1 || !routeForm.title || !routeForm.rootFolderId) {
      toast({
        title: "Error",
        description:
          "El nivel 1 de ruta, título e ID de carpeta son obligatorios",
        variant: "destructive",
      });
      return false;
    }

    // Validar niveles jerárquicos
    if (routeForm.routeLevel3 && !routeForm.routeLevel2) {
      toast({
        title: "Error",
        description:
          "No puedes añadir el nivel 3 sin antes especificar el nivel 2",
        variant: "destructive",
      });
      return false;
    }

    if (routeForm.routeLevel4 && !routeForm.routeLevel3) {
      toast({
        title: "Error",
        description:
          "No puedes añadir el nivel 4 sin antes especificar el nivel 3",
        variant: "destructive",
      });
      return false;
    }

    if (routeForm.routeLevel5 && !routeForm.routeLevel4) {
      toast({
        title: "Error",
        description:
          "No puedes añadir el nivel 5 sin antes especificar el nivel 4",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Guardar ruta (crear o actualizar)
  const handleSaveRoute = async () => {
    try {
      setIsSubmitting(true);

      // Validaciones
      if (!validateRouteForm()) {
        setIsSubmitting(false);
        return;
      }

      // Preparar datos para envío - convertir cadenas vacías a null para niveles opcionales
      const formData = {
        ...routeForm,
        routeLevel2: routeForm.routeLevel2 || null,
        routeLevel3: routeForm.routeLevel3 || null,
        routeLevel4: routeForm.routeLevel4 || null,
        routeLevel5: routeForm.routeLevel5 || null,
      };

      const response = await fetch("/api/drive/config/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar la ruta");
      }

      const data = await response.json();

      if (routeToEdit) {
        // Actualizar ruta existente en la lista
        setRoutes((prev) =>
          prev.map((route) =>
            route.id === routeToEdit.id ? data.route : route
          )
        );
      } else {
        // Añadir nueva ruta a la lista
        setRoutes((prev) => [...prev, data.route]);
      }

      // Cerrar diálogo
      setShowAddDialog(false);

      toast({
        title: routeToEdit ? "Ruta actualizada" : "Ruta creada",
        description: `La ruta ${data.route.title} ha sido ${
          routeToEdit ? "actualizada" : "creada"
        } correctamente`,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al guardar la ruta",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar una ruta
  const handleDeleteRoute = async () => {
    if (!routeToDelete) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `/api/drive/config/routes?id=${routeToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar la ruta");
      }

      // Actualizar la lista de rutas eliminando la ruta borrada
      setRoutes((prev) => prev.filter((route) => route.id !== routeToDelete));

      setShowDeleteDialog(false);
      setRouteToDelete(null);

      toast({
        title: "Ruta eliminada",
        description: "La ruta ha sido eliminada correctamente",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al eliminar la ruta",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cambiar el estado activo/inactivo de una ruta
  const handleToggleActive = async (
    route: DriveRouteMapping,
    currentValue: boolean
  ) => {
    try {
      const newValue = !currentValue;

      // Optimistic update
      setRoutes((prev) =>
        prev.map((r) => {
          if (r.id === route.id) {
            return { ...r, isActive: newValue };
          }
          return r;
        })
      );

      const response = await fetch("/api/drive/config/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: route.id,
          routeLevel1: route.routeLevel1,
          routeLevel2: route.routeLevel2,
          routeLevel3: route.routeLevel3,
          routeLevel4: route.routeLevel4,
          routeLevel5: route.routeLevel5,
          isActive: newValue,
          // Mantener los valores existentes
          title: route.title,
          subtitle: route.subtitle,
          rootFolderId: route.rootFolderId,
          defaultDepth: route.defaultDepth,
        }),
      });

      if (!response.ok) {
        // Revertir cambio en caso de error
        setRoutes((prev) =>
          prev.map((r) => {
            if (r.id === route.id) {
              return { ...r, isActive: currentValue };
            }
            return r;
          })
        );

        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar la ruta");
      }

      toast({
        title: "Ruta actualizada",
        description: `La ruta ha sido ${
          newValue ? "activada" : "desactivada"
        } correctamente`,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al actualizar la ruta",
        variant: "destructive",
      });
    }
  };

  // Invalidar caché para una ruta específica
  const handleInvalidateCache = async (route: DriveRouteMapping) => {
    try {
      // Add this route to the refreshing list
      setRefreshingRoutes((prev) => [...prev, route.id]);

      const response = await fetch("/api/drive/cache/invalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          routeLevel1: route.routeLevel1,
          routeLevel2: route.routeLevel2,
          routeLevel3: route.routeLevel3,
          routeLevel4: route.routeLevel4,
          routeLevel5: route.routeLevel5,
          invalidateHierarchies: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al invalidar la caché");
      }

      toast({
        title: "Caché invalidada",
        description:
          "La caché para esta ruta y sus jerarquías asociadas han sido invalidadas. Los próximos accesos obtendrán datos frescos.",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al invalidar la caché",
        variant: "destructive",
      });
    } finally {
      // Remove this route from the refreshing list
      setRefreshingRoutes((prev) => prev.filter((id) => id !== route.id));
    }
  };

  // Ver el JSON de la jerarquía completa de una ruta
  const handleViewJson = async (route: DriveRouteMapping) => {
    try {
      setLoadingJson(true);
      setShowJsonDialog(true);
      setCurrentJsonData(null);
      setCurrentJsonStats(null);

      // Construir la URL de la ruta
      const routePath = [
        route.routeLevel1,
        route.routeLevel2,
        route.routeLevel3,
        route.routeLevel4,
        route.routeLevel5,
      ]
        .filter(Boolean)
        .join("/");

      // Obtener el JSON completo con alta profundidad
      const response = await fetch(`/api/drive/${routePath}?maxDepth=10`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al obtener los datos de jerarquía"
        );
      }

      const data = await response.json();
      setCurrentJsonData(data.root);
      setCurrentJsonStats(data.stats);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al obtener los datos de jerarquía",
        variant: "destructive",
      });
      setShowJsonDialog(false);
    } finally {
      setLoadingJson(false);
    }
  };

  // Copiar JSON al portapapeles
  const handleCopyJson = () => {
    try {
      if (!currentJsonData) return;

      navigator.clipboard.writeText(JSON.stringify(currentJsonData, null, 2));

      toast({
        title: "JSON copiado",
        description: "Los datos de la jerarquía se han copiado al portapapeles",
      });
    } catch (error) {
      console.error("Error al copiar JSON:", error);
      toast({
        title: "Error",
        description: "No se pudo copiar el JSON al portapapeles",
        variant: "destructive",
      });
    }
  };

  // Navegar a la ruta creada
  const navigateToRoute = (route: DriveRouteMapping) => {
    const routePath = [
      route.routeLevel1,
      route.routeLevel2,
      route.routeLevel3,
      route.routeLevel4,
      route.routeLevel5,
    ]
      .filter(Boolean)
      .join("/");

    router.push(`/${routePath}`);
  };

  // Formatear la ruta para mostrarla
  const formatRoutePath = (route: DriveRouteMapping) => {
    return [
      route.routeLevel1,
      route.routeLevel2,
      route.routeLevel3,
      route.routeLevel4,
      route.routeLevel5,
    ]
      .filter(Boolean)
      .join(" / ");
  };

  // Si no está autenticado o no está cargado
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className='min-h-screen flex justify-center items-center'>
        <Loader2 className='h-10 w-10 animate-spin text-gray-500' />
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-10'>
      <Card className='mb-8'>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <div>
              <CardTitle>Administración de Rutas de Google Drive</CardTitle>
              <CardDescription>
                Configura y gestiona las diferentes rutas para acceder a
                contenido de Google Drive
              </CardDescription>
            </div>
            <Button
              asChild
              variant='outline'
              className='flex items-center gap-2'
            >
              <Link href='/admin/drive-routes/manual'>
                <BookOpen className='h-4 w-4' />
                <span>Manual de Usuario</span>
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-lg font-semibold'>
              Rutas Configuradas
              {isLoading && (
                <Loader2 className='ml-2 h-4 w-4 inline animate-spin' />
              )}
            </h2>
            <Button
              variant='default'
              className='flex items-center gap-2'
              onClick={handleNewRoute}
            >
              <FilePlus className='h-4 w-4' />
              <span>Crear Nueva Ruta</span>
            </Button>
          </div>

          <div className='border rounded-md'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estado</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Ruta</TableHead>
                  <TableHead>ID Carpeta</TableHead>
                  <TableHead>Prof.</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.length > 0 ? (
                  routes.map((route) => (
                    <TableRow key={route.id}>
                      <TableCell>
                        <div className='flex items-center space-x-2'>
                          <Switch
                            checked={route.isActive}
                            onCheckedChange={() =>
                              handleToggleActive(route, route.isActive)
                            }
                            id={`active-${route.id}`}
                          />
                          <Badge
                            variant={route.isActive ? "default" : "destructive"}
                            className='ml-2'
                          >
                            {route.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className='font-medium'>
                        <div>
                          <div>{route.title}</div>
                          {route.subtitle && (
                            <div className='text-xs text-muted-foreground'>
                              {route.subtitle}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className='px-1 py-0.5 rounded bg-muted'>
                          {formatRoutePath(route)}
                        </code>
                      </TableCell>
                      <TableCell className='font-mono text-xs'>
                        {route.rootFolderId.substring(0, 10)}...
                      </TableCell>
                      <TableCell>{route.defaultDepth}</TableCell>
                      <TableCell>
                        <div className='flex space-x-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleInvalidateCache(route)}
                            title='Invalidar caché'
                            disabled={refreshingRoutes.includes(route.id)}
                          >
                            {refreshingRoutes.includes(route.id) ? (
                              <Loader2 className='h-4 w-4 animate-spin' />
                            ) : (
                              <RefreshCw className='h-4 w-4' />
                            )}
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleViewJson(route)}
                            title='Ver datos JSON'
                          >
                            <Code className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => navigateToRoute(route)}
                            title='Abrir ruta'
                          >
                            <ExternalLink className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleEditRoute(route)}
                            title='Editar ruta'
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='destructive'
                            size='sm'
                            onClick={() => {
                              setRouteToDelete(route.id);
                              setShowDeleteDialog(true);
                            }}
                            title='Eliminar ruta'
                          >
                            <Trash className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className='h-24 text-center'>
                      {isLoading ? (
                        <div className='flex justify-center items-center'>
                          <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
                        </div>
                      ) : (
                        <div className='text-gray-500'>
                          No hay rutas configuradas aún. Comienza agregando una.
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Sección de herramientas de caché */}
      <Card>
        <CardHeader>
          <CardTitle>Herramientas de Caché</CardTitle>
          <CardDescription>
            Administra y limpia la caché de Google Drive para todas las rutas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Button
              variant='outline'
              className='flex items-center gap-2'
              onClick={async () => {
                try {
                  setInvalidatingAllCache(true);
                  const response = await fetch("/api/drive/cache/invalidate", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      invalidateAll: true,
                    }),
                  });

                  if (!response.ok) {
                    throw new Error("Error al invalidar toda la caché");
                  }

                  toast({
                    title: "Caché invalidada",
                    description:
                      "Toda la caché ha sido invalidada. Los próximos accesos obtendrán datos frescos.",
                  });
                } catch (error) {
                  console.error("Error:", error);
                  toast({
                    title: "Error",
                    description: "No se pudo invalidar la caché",
                    variant: "destructive",
                  });
                } finally {
                  setInvalidatingAllCache(false);
                }
              }}
              disabled={invalidatingAllCache}
            >
              {invalidatingAllCache ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <RefreshCw className='h-4 w-4' />
              )}
              <span>Invalidar Toda la Caché</span>
            </Button>

            <Button
              variant='outline'
              className='flex items-center gap-2'
              onClick={async () => {
                try {
                  setCleaningCache(true);
                  const response = await fetch("/api/drive/cache/cleanup", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  });

                  if (!response.ok) {
                    throw new Error("Error al limpiar la caché antigua");
                  }

                  const data = await response.json();

                  toast({
                    title: "Limpieza completada",
                    description: `Se eliminaron ${
                      data.deletedCount || 0
                    } entradas de caché antiguas.`,
                  });
                } catch (error) {
                  console.error("Error:", error);
                  toast({
                    title: "Error",
                    description: "No se pudo limpiar la caché antigua",
                    variant: "destructive",
                  });
                } finally {
                  setCleaningCache(false);
                }
              }}
              disabled={cleaningCache}
            >
              {cleaningCache ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <ClipboardList className='h-4 w-4' />
              )}
              <span>Eliminar Caché Antigua</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo para crear/editar ruta */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>
              {routeToEdit ? "Editar Ruta" : "Crear Nueva Ruta"}
            </DialogTitle>
            <DialogDescription>
              {routeToEdit
                ? "Actualiza la información de la ruta existente"
                : "Completa la información para crear una nueva ruta de acceso a Google Drive"}
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='routeLevel1'>Nivel 1 (Obligatorio)</Label>
              <Input
                id='routeLevel1'
                value={routeForm.routeLevel1}
                onChange={(e) =>
                  handleFormChange("routeLevel1", e.target.value)
                }
                placeholder='Ej: marketing'
              />
              <p className='text-xs text-gray-500'>
                Primer nivel de la ruta: marketing, academy, eventos...
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='routeLevel2'>Nivel 2 (Opcional)</Label>
              <Input
                id='routeLevel2'
                value={routeForm.routeLevel2}
                onChange={(e) =>
                  handleFormChange("routeLevel2", e.target.value)
                }
                placeholder='Ej: eventos'
                disabled={!routeForm.routeLevel1}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='routeLevel3'>Nivel 3 (Opcional)</Label>
              <Input
                id='routeLevel3'
                value={routeForm.routeLevel3}
                onChange={(e) =>
                  handleFormChange("routeLevel3", e.target.value)
                }
                placeholder='Ej: 2023'
                disabled={!routeForm.routeLevel2}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='routeLevel4'>Nivel 4 (Opcional)</Label>
              <Input
                id='routeLevel4'
                value={routeForm.routeLevel4}
                onChange={(e) =>
                  handleFormChange("routeLevel4", e.target.value)
                }
                placeholder='Ej: q1'
                disabled={!routeForm.routeLevel3}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='routeLevel5'>Nivel 5 (Opcional)</Label>
              <Input
                id='routeLevel5'
                value={routeForm.routeLevel5}
                onChange={(e) =>
                  handleFormChange("routeLevel5", e.target.value)
                }
                placeholder='Ej: enero'
                disabled={!routeForm.routeLevel4}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='title'>Título</Label>
              <Input
                id='title'
                value={routeForm.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
                placeholder='Ej: Marketing Eventos 2023 Q1'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='subtitle'>Subtítulo (Opcional)</Label>
              <Input
                id='subtitle'
                value={routeForm.subtitle}
                onChange={(e) => handleFormChange("subtitle", e.target.value)}
                placeholder='Ej: Recursos y materiales'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='rootFolderId'>
                ID de Carpeta Raíz en Google Drive
              </Label>
              <Input
                id='rootFolderId'
                value={routeForm.rootFolderId}
                onChange={(e) =>
                  handleFormChange("rootFolderId", e.target.value)
                }
                placeholder='ID de la carpeta de Google Drive'
              />
              <p className='text-xs text-gray-500'>
                El ID de la carpeta se encuentra en la URL de Google Drive
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='defaultDepth'>Profundidad por Defecto</Label>
              <Input
                id='defaultDepth'
                type='number'
                min='1'
                max='10'
                value={routeForm.defaultDepth}
                onChange={(e) =>
                  handleFormChange("defaultDepth", parseInt(e.target.value))
                }
              />
              <p className='text-xs text-gray-500'>
                Número de niveles que se cargarán por defecto (1-10)
              </p>
            </div>

            <div className='flex items-center space-x-2 pt-2'>
              <Switch
                id='isActive'
                checked={routeForm.isActive}
                onCheckedChange={(checked) =>
                  handleFormChange("isActive", checked)
                }
              />
              <Label htmlFor='isActive'>Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowAddDialog(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              onClick={handleSaveRoute}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar eliminación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta ruta? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setShowDeleteDialog(false);
                setRouteToDelete(null);
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteRoute}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para ver el JSON de la jerarquía */}
      <Dialog open={showJsonDialog} onOpenChange={setShowJsonDialog}>
        <DialogContent className='sm:max-w-[80vw] max-h-[80vh]'>
          <DialogHeader>
            <DialogTitle className='flex justify-between items-center'>
              <span>Datos de Jerarquía JSON</span>
              {currentJsonStats && (
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='flex items-center gap-1'>
                    <Maximize className='h-3 w-3' />
                    <span>Altura máxima: {currentJsonStats.maxDepth}</span>
                  </Badge>
                  <Badge
                    variant={
                      currentJsonStats.fromCache ? "secondary" : "default"
                    }
                  >
                    {currentJsonStats.fromCache
                      ? "Desde caché"
                      : "Datos frescos"}
                  </Badge>
                  {currentJsonStats.buildTimeMs && (
                    <Badge variant='outline'>
                      Tiempo de construcción:{" "}
                      {Math.round(currentJsonStats.buildTimeMs / 1000)}s
                    </Badge>
                  )}
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              Visualiza y copia los datos completos de la jerarquía de carpetas
              y archivos
            </DialogDescription>
          </DialogHeader>

          <div className='relative'>
            <div className='absolute top-2 right-2 z-10'>
              <Button
                variant='secondary'
                size='sm'
                className='flex items-center gap-2'
                onClick={handleCopyJson}
                disabled={!currentJsonData}
              >
                <Copy className='h-4 w-4' />
                <span>Copiar JSON</span>
              </Button>
            </div>

            <div className='overflow-auto max-h-[50vh] border rounded-md bg-gray-50 dark:bg-gray-900 p-4'>
              {loadingJson ? (
                <div className='h-64 flex justify-center items-center'>
                  <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
                </div>
              ) : currentJsonData ? (
                <pre className='text-xs font-mono whitespace-pre-wrap'>
                  {JSON.stringify(currentJsonData, null, 2)}
                </pre>
              ) : (
                <div className='h-64 flex justify-center items-center text-gray-500'>
                  No hay datos disponibles
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowJsonDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
