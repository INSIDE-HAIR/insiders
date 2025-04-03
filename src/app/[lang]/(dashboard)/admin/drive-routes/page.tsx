"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DriveRouteMapping {
  id: string;
  routeType: string;
  routeSubtype: string;
  displayName: string;
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const [currentJsonData, setCurrentJsonData] = useState<any>(null);
  const [currentJsonStats, setCurrentJsonStats] =
    useState<HierarchyStats | null>(null);
  const [loadingJson, setLoadingJson] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Estado para el formulario de nueva ruta
  const [newRoute, setNewRoute] = useState({
    routeType: "",
    routeSubtype: "",
    displayName: "",
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
  const handleNewRouteChange = (field: string, value: any) => {
    setNewRoute((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Crear una nueva ruta
  const handleCreateRoute = async () => {
    try {
      setIsSubmitting(true);

      // Validaciones básicas
      if (
        !newRoute.routeType ||
        !newRoute.routeSubtype ||
        !newRoute.displayName ||
        !newRoute.rootFolderId
      ) {
        toast({
          title: "Error",
          description: "Todos los campos son obligatorios",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/drive/config/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRoute),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la ruta");
      }

      const data = await response.json();
      setRoutes((prev) => [...prev, data.route]);

      // Limpiar formulario y cerrar diálogo
      setNewRoute({
        routeType: "",
        routeSubtype: "",
        displayName: "",
        rootFolderId: "",
        defaultDepth: 3,
        isActive: true,
      });
      setShowAddDialog(false);

      toast({
        title: "Ruta creada",
        description: `La ruta ${data.route.displayName} ha sido creada correctamente`,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al crear la ruta",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar una ruta
  const handleDeleteRoute = async () => {
    if (!routeToDelete) return;

    const [routeType, routeSubtype] = routeToDelete.split(":");

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `/api/drive/config/routes?routeType=${routeType}&routeSubtype=${routeSubtype}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar la ruta");
      }

      // Actualizar la lista de rutas eliminando la ruta borrada
      setRoutes((prev) =>
        prev.filter(
          (route) =>
            route.routeType !== routeType || route.routeSubtype !== routeSubtype
        )
      );

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
    routeType: string,
    routeSubtype: string,
    currentValue: boolean
  ) => {
    try {
      const updatedRoute = routes.find(
        (r) => r.routeType === routeType && r.routeSubtype === routeSubtype
      );

      if (!updatedRoute) return;

      const newValue = !currentValue;

      // Optimistic update
      setRoutes((prev) =>
        prev.map((route) => {
          if (
            route.routeType === routeType &&
            route.routeSubtype === routeSubtype
          ) {
            return { ...route, isActive: newValue };
          }
          return route;
        })
      );

      const response = await fetch("/api/drive/config/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          routeType,
          routeSubtype,
          isActive: newValue,
          // Mantener los valores existentes
          displayName: updatedRoute.displayName,
          rootFolderId: updatedRoute.rootFolderId,
          defaultDepth: updatedRoute.defaultDepth,
        }),
      });

      if (!response.ok) {
        // Revertir cambio en caso de error
        setRoutes((prev) =>
          prev.map((route) => {
            if (
              route.routeType === routeType &&
              route.routeSubtype === routeSubtype
            ) {
              return { ...route, isActive: currentValue };
            }
            return route;
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
  const handleInvalidateCache = async (
    routeType: string,
    routeSubtype: string
  ) => {
    try {
      const response = await fetch("/api/drive/cache/invalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          routeType,
          routeSubtype,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al invalidar la caché");
      }

      toast({
        title: "Caché invalidada",
        description:
          "La caché para esta ruta ha sido invalidada. Los próximos accesos obtendrán datos frescos.",
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
    }
  };

  // Ver el JSON de la jerarquía completa de una ruta
  const handleViewJson = async (routeType: string, routeSubtype: string) => {
    try {
      setLoadingJson(true);
      setShowJsonDialog(true);
      setCurrentJsonData(null);
      setCurrentJsonStats(null);

      // Obtener el JSON completo con alta profundidad
      const response = await fetch(
        `/api/drive/${routeType}/${routeSubtype}?maxDepth=10`
      );

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
  const navigateToRoute = (routeType: string, routeSubtype: string) => {
    router.push(`/${routeType}/${routeSubtype}`);
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
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className='h-4 w-4' />
              <span>Agregar Ruta</span>
            </Button>
          </div>

          <div className='border rounded-md'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estado</TableHead>
                  <TableHead>Tipo de Ruta</TableHead>
                  <TableHead>Subtipo</TableHead>
                  <TableHead>Nombre para Mostrar</TableHead>
                  <TableHead>ID Carpeta Raíz</TableHead>
                  <TableHead>Profundidad</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.length > 0 ? (
                  routes.map((route) => (
                    <TableRow key={`${route.routeType}:${route.routeSubtype}`}>
                      <TableCell>
                        <div className='flex items-center space-x-2'>
                          <Switch
                            checked={route.isActive}
                            onCheckedChange={() =>
                              handleToggleActive(
                                route.routeType,
                                route.routeSubtype,
                                route.isActive
                              )
                            }
                            id={`active-${route.routeType}-${route.routeSubtype}`}
                          />
                          <Badge
                            variant={route.isActive ? "default" : "destructive"}
                            className='ml-2'
                          >
                            {route.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{route.routeType}</TableCell>
                      <TableCell>{route.routeSubtype}</TableCell>
                      <TableCell className='font-medium'>
                        {route.displayName}
                      </TableCell>
                      <TableCell className='font-mono text-xs'>
                        {route.rootFolderId.substring(0, 16)}...
                      </TableCell>
                      <TableCell>{route.defaultDepth}</TableCell>
                      <TableCell>
                        <div className='flex space-x-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              handleInvalidateCache(
                                route.routeType,
                                route.routeSubtype
                              );
                            }}
                            title='Invalidar caché'
                          >
                            <RefreshCw className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              handleViewJson(
                                route.routeType,
                                route.routeSubtype
                              )
                            }
                            title='Ver datos JSON'
                          >
                            <Code className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              navigateToRoute(
                                route.routeType,
                                route.routeSubtype
                              )
                            }
                            title='Abrir ruta'
                          >
                            <ExternalLink className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='destructive'
                            size='sm'
                            onClick={() => {
                              setRouteToDelete(
                                `${route.routeType}:${route.routeSubtype}`
                              );
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
                    <TableCell colSpan={7} className='h-24 text-center'>
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
                }
              }}
            >
              <RefreshCw className='h-4 w-4' />
              <span>Invalidar Toda la Caché</span>
            </Button>

            <Button
              variant='outline'
              className='flex items-center gap-2'
              onClick={async () => {
                try {
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
                }
              }}
            >
              <ClipboardList className='h-4 w-4' />
              <span>Eliminar Caché Antigua</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo para agregar una nueva ruta */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Agregar Nueva Ruta</DialogTitle>
            <DialogDescription>
              Completa la información para crear una nueva ruta de acceso a
              Google Drive
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='routeType'>Tipo de Ruta</Label>
                <Input
                  id='routeType'
                  value={newRoute.routeType}
                  onChange={(e) =>
                    handleNewRouteChange("routeType", e.target.value)
                  }
                  placeholder='Ej: marketing'
                />
                <p className='text-xs text-gray-500'>
                  Ejemplo: marketing, academy, eventos
                </p>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='routeSubtype'>Subtipo</Label>
                <Input
                  id='routeSubtype'
                  value={newRoute.routeSubtype}
                  onChange={(e) =>
                    handleNewRouteChange("routeSubtype", e.target.value)
                  }
                  placeholder='Ej: marketing-salon'
                />
                <p className='text-xs text-gray-500'>
                  Ejemplo: marketing-salon, ibm, lmadrid
                </p>
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='displayName'>Nombre para Mostrar</Label>
              <Input
                id='displayName'
                value={newRoute.displayName}
                onChange={(e) =>
                  handleNewRouteChange("displayName", e.target.value)
                }
                placeholder='Ej: Marketing Salón'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='rootFolderId'>
                ID de Carpeta Raíz en Google Drive
              </Label>
              <Input
                id='rootFolderId'
                value={newRoute.rootFolderId}
                onChange={(e) =>
                  handleNewRouteChange("rootFolderId", e.target.value)
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
                value={newRoute.defaultDepth}
                onChange={(e) =>
                  handleNewRouteChange("defaultDepth", parseInt(e.target.value))
                }
              />
              <p className='text-xs text-gray-500'>
                Número de niveles que se cargarán por defecto (1-10)
              </p>
            </div>
            <div className='flex items-center space-x-2 pt-2'>
              <Switch
                id='isActive'
                checked={newRoute.isActive}
                onCheckedChange={(checked) =>
                  handleNewRouteChange("isActive", checked)
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
              onClick={handleCreateRoute}
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
