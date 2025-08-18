"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Separator } from "@/src/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Monitor,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Users,
  Calendar,
  Clock,
  ExternalLink,
  Copy,
  Play,
  Pause,
  MoreHorizontal,
  Shield,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  useVideoSpaces,
  useDeleteVideoSpace,
} from "@/src/features/video-conferencing/hooks/useVideoSpaces";
import {
  VideoProvider,
  VideoSpaceStatus,
} from "@/src/features/video-conferencing/types/video-conferencing";
import { useToast } from "@/src/hooks/use-toast";

export default function VideoSpacesClient() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProvider, setFilterProvider] = useState<VideoProvider | "ALL">(
    "ALL"
  );
  const [filterStatus, setFilterStatus] = useState<VideoSpaceStatus | "ALL">(
    "ALL"
  );
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch video spaces with filters
  const {
    data: videoSpacesResponse,
    isLoading,
    error,
    refetch,
  } = useVideoSpaces({
    page,
    limit,
    provider: filterProvider === "ALL" ? undefined : filterProvider,
    status: filterStatus === "ALL" ? undefined : filterStatus,
    search: searchTerm || undefined,
  });

  // Delete mutation
  const deleteVideoSpaceMutation = useDeleteVideoSpace();

  // Verificación adicional del rol
  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Card className='w-full max-w-md'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <Shield className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>Acceso Restringido</h3>
              <p className='text-muted-foreground'>
                No tienes permisos para acceder a los espacios de video.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: VideoSpaceStatus) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className='bg-green-500'>Activo</Badge>;
      case "SCHEDULED":
        return <Badge className='bg-blue-500'>Programado</Badge>;
      case "COMPLETED":
        return <Badge variant='secondary'>Completado</Badge>;
      case "CANCELLED":
        return <Badge variant='destructive'>Cancelado</Badge>;
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  const getProviderBadge = (provider: VideoProvider) => {
    switch (provider) {
      case "GOOGLE_MEET":
        return (
          <Badge variant='outline' className='text-blue-600'>
            Google Meet
          </Badge>
        );
      case "ZOOM":
        return (
          <Badge variant='outline' className='text-purple-600'>
            Zoom
          </Badge>
        );
      case "VIMEO":
        return (
          <Badge variant='outline' className='text-green-600'>
            Vimeo
          </Badge>
        );
      default:
        return <Badge variant='outline'>{provider}</Badge>;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado",
        description: "URL copiada al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar la URL",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSpace = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${name}"?`)) {
      try {
        await deleteVideoSpaceMutation.mutateAsync(id);
        toast({
          title: "Espacio eliminado",
          description: `"${name}" ha sido eliminado correctamente`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el espacio",
          variant: "destructive",
        });
      }
    }
  };

  const videoSpaces = videoSpacesResponse?.videoSpaces || [];
  const totalSpaces = videoSpacesResponse?.total || 0;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center gap-3'>
          <Monitor className='h-8 w-8 text-primary' />
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Espacios de Video
            </h1>
            <p className='text-muted-foreground'>
              Gestiona y crea espacios de videoconferencia
            </p>
          </div>
        </div>
      </div>

      {/* Actions and Filters */}
      <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
        <div className='flex flex-col sm:flex-row gap-4 flex-1'>
          {/* Search */}
          <div className='relative flex-1 max-w-sm'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Buscar espacios...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>

          {/* Filters */}
          <div className='flex gap-2'>
            <Select
              value={filterProvider}
              onValueChange={(value) =>
                setFilterProvider(value as VideoProvider | "ALL")
              }
            >
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='Proveedor' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>Todos</SelectItem>
                <SelectItem value='GOOGLE_MEET'>Google Meet</SelectItem>
                <SelectItem value='ZOOM'>Zoom</SelectItem>
                <SelectItem value='VIMEO'>Vimeo</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterStatus}
              onValueChange={(value) =>
                setFilterStatus(value as VideoSpaceStatus | "ALL")
              }
            >
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='Estado' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>Todos</SelectItem>
                <SelectItem value='ACTIVE'>Activo</SelectItem>
                <SelectItem value='SCHEDULED'>Programado</SelectItem>
                <SelectItem value='COMPLETED'>Completado</SelectItem>
                <SelectItem value='CANCELLED'>Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Create Button */}
        <Button asChild>
          <Link href='/admin/video-conferencing/spaces/create'>
            <Plus className='h-4 w-4 mr-2' />
            Crear Espacio
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <Monitor className='h-4 w-4 text-blue-500' />
              <div className='text-2xl font-bold'>{totalSpaces}</div>
            </div>
            <p className='text-xs text-muted-foreground'>Espacios Totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <Play className='h-4 w-4 text-green-500' />
              <div className='text-2xl font-bold'>
                {videoSpaces.filter((s) => s.status === "ACTIVE").length}
              </div>
            </div>
            <p className='text-xs text-muted-foreground'>Activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-purple-500' />
              <div className='text-2xl font-bold'>
                {videoSpaces.filter((s) => s.status === "SCHEDULED").length}
              </div>
            </div>
            <p className='text-xs text-muted-foreground'>Programados</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4 text-orange-500' />
              <div className='text-2xl font-bold'>
                {videoSpaces.reduce(
                  (sum, s) => sum + (s._count?.meetingRecords || 0),
                  0
                )}
              </div>
            </div>
            <p className='text-xs text-muted-foreground'>Reuniones</p>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
              <span className='ml-2 text-muted-foreground'>
                Cargando espacios...
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-center py-8'>
              <AlertCircle className='h-8 w-8 text-destructive mr-2' />
              <div className='text-center'>
                <h3 className='text-lg font-semibold mb-2'>
                  Error al cargar espacios
                </h3>
                <p className='text-muted-foreground mb-4'>
                  {error instanceof Error
                    ? error.message
                    : "Ha ocurrido un error inesperado"}
                </p>
                <Button onClick={() => refetch()} variant='outline'>
                  Reintentar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Spaces List */}
      {!isLoading && !error && (
        <div className='space-y-4'>
          {videoSpaces.map((space) => (
            <Card key={space.id} className='hover:shadow-md transition-shadow'>
              <CardContent className='pt-6'>
                <div className='flex flex-col lg:flex-row gap-4'>
                  {/* Main Info */}
                  <div className='flex-1 space-y-3'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <h3 className='text-lg font-semibold'>{space.name}</h3>
                        <p className='text-sm text-muted-foreground'>
                          {space.description}
                        </p>
                      </div>
                      <div className='flex gap-2'>
                        {getStatusBadge(space.status)}
                        {getProviderBadge(space.provider)}
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                      <div className='flex items-center gap-2'>
                        <Calendar className='h-4 w-4 text-muted-foreground' />
                        <span>
                          {space.createdAt
                            ? new Date(space.createdAt).toLocaleDateString(
                                "es-ES",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )
                            : "N/A"}
                        </span>
                      </div>

                      <div className='flex items-center gap-2'>
                        <Clock className='h-4 w-4 text-muted-foreground' />
                        <span>
                          {space.lastActiveAt
                            ? new Date(space.lastActiveAt).toLocaleTimeString(
                                "es-ES",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "Sin actividad"}
                        </span>
                      </div>

                      <div className='flex items-center gap-2'>
                        <Users className='h-4 w-4 text-muted-foreground' />
                        <span>
                          {space._count?.meetingRecords || 0} reuniones
                          {space.maxParticipants &&
                            ` (máx: ${space.maxParticipants})`}
                        </span>
                      </div>
                    </div>

                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <span>Proveedor: {space.provider}</span>
                      <span>•</span>
                      <span>
                        Creado:{" "}
                        {new Date(space.createdAt).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex flex-col gap-2 min-w-[200px]'>
                    {space.providerJoinUri && (
                      <div className='flex items-center gap-2'>
                        <Input
                          value={space.providerJoinUri}
                          readOnly
                          className='text-xs'
                        />
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() =>
                            copyToClipboard(space.providerJoinUri!)
                          }
                        >
                          <Copy className='h-4 w-4' />
                        </Button>
                      </div>
                    )}

                    <div className='flex gap-2'>
                      {space.providerJoinUri && (
                        <Button
                          size='sm'
                          variant='outline'
                          className='flex-1'
                          onClick={() =>
                            window.open(space.providerJoinUri, "_blank")
                          }
                        >
                          <ExternalLink className='h-4 w-4 mr-1' />
                          Unirse
                        </Button>
                      )}
                      <Button size='sm' variant='outline' asChild>
                        <Link
                          href={`/admin/video-conferencing/spaces/${space.id}`}
                        >
                          <Eye className='h-4 w-4' />
                        </Link>
                      </Button>
                      <Button size='sm' variant='outline' asChild>
                        <Link
                          href={`/admin/video-conferencing/spaces/${space.id}/edit`}
                        >
                          <Edit className='h-4 w-4' />
                        </Link>
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleDeleteSpace(space.id, space.name)}
                        disabled={deleteVideoSpaceMutation.isPending}
                      >
                        {deleteVideoSpaceMutation.isPending ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <Trash2 className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {videoSpacesResponse && videoSpacesResponse.hasMore && (
            <div className='flex justify-center pt-4'>
              <Button
                variant='outline'
                onClick={() => setPage(page + 1)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                ) : null}
                Cargar más
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && videoSpaces.length === 0 && (
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center py-8'>
              <Monitor className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>
                No se encontraron espacios
              </h3>
              <p className='text-muted-foreground mb-4'>
                {searchTerm ||
                filterProvider !== "ALL" ||
                filterStatus !== "ALL"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Crea tu primer espacio de videoconferencia"}
              </p>
              <Button asChild>
                <Link href='/admin/video-conferencing/spaces/create'>
                  <Plus className='h-4 w-4 mr-2' />
                  Crear Primer Espacio
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
