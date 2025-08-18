"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Switch } from "@/src/components/ui/switch";
import { Skeleton } from "@/src/components/ui/skeleton";
import { ArrowLeft, Save, Shield, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import {
  useVideoSpace,
  useUpdateVideoSpace,
} from "@/src/features/video-conferencing/hooks/useVideoSpaces";
import { useToast } from "@/src/hooks/use-toast";

// Form validation schema
const updateVideoSpaceSchema = z.object({
  title: z
    .string()
    .min(1, "El título es requerido")
    .max(255, "El título es muy largo"),
  description: z.string().optional(),
  maxParticipants: z
    .number()
    .min(1, "Mínimo 1 participante")
    .max(1000, "Máximo 1000 participantes")
    .optional(),
  alias: z.string().optional(),
  requiresAuth: z.boolean().default(false),
  recordingEnabled: z.boolean().default(false),
  chatEnabled: z.boolean().default(true),
  screenShareEnabled: z.boolean().default(true),
  waitingRoomEnabled: z.boolean().default(false),
});

type UpdateVideoSpaceFormData = z.infer<typeof updateVideoSpaceSchema>;

interface EditVideoSpaceClientProps {
  spaceId: string;
}

export default function EditVideoSpaceClient({
  spaceId,
}: EditVideoSpaceClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  // Fetch video space details
  const {
    data: videoSpace,
    isLoading,
    error,
    refetch,
  } = useVideoSpace(spaceId);

  // Update mutation
  const updateVideoSpaceMutation = useUpdateVideoSpace();

  // Form setup
  const form = useForm<UpdateVideoSpaceFormData>({
    resolver: zodResolver(updateVideoSpaceSchema),
    defaultValues: {
      title: "",
      description: "",
      maxParticipants: 100,
      requiresAuth: false,
      recordingEnabled: false,
      chatEnabled: true,
      screenShareEnabled: true,
      waitingRoomEnabled: false,
    },
  });

  // Update form when video space data is loaded
  useEffect(() => {
    if (videoSpace) {
      form.reset({
        title: videoSpace.title,
        description: videoSpace.description || "",
        maxParticipants: videoSpace.maxParticipants || undefined,
        alias: videoSpace.alias || "",
        requiresAuth: videoSpace.requiresAuth,
        recordingEnabled: videoSpace.recordingEnabled,
        chatEnabled: videoSpace.chatEnabled,
        screenShareEnabled: videoSpace.screenShareEnabled,
        waitingRoomEnabled: videoSpace.waitingRoomEnabled,
      });
    }
  }, [videoSpace, form]);

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
                No tienes permisos para editar espacios de video.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (data: UpdateVideoSpaceFormData) => {
    try {
      await updateVideoSpaceMutation.mutateAsync({
        id: spaceId,
        data: {
          ...data,
          settings: {
            requiresAuth: data.requiresAuth,
            recordingEnabled: data.recordingEnabled,
            chatEnabled: data.chatEnabled,
            screenShareEnabled: data.screenShareEnabled,
            waitingRoomEnabled: data.waitingRoomEnabled,
          },
        },
      });

      toast({
        title: "Espacio actualizado",
        description: `"${data.title}" ha sido actualizado correctamente`,
      });

      router.push(`/admin/video-conferencing/spaces/${spaceId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el espacio de video",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-4'>
          <Button variant='outline' size='sm' asChild>
            <Link href={`/admin/video-conferencing/spaces/${spaceId}`}>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Volver
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-center py-8'>
              <AlertCircle className='h-8 w-8 text-destructive mr-2' />
              <div className='text-center'>
                <h3 className='text-lg font-semibold mb-2'>
                  Error al cargar espacio
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
      </div>
    );
  }

  if (isLoading || !videoSpace) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-4'>
          <Button variant='outline' size='sm' asChild>
            <Link href={`/admin/video-conferencing/spaces/${spaceId}`}>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Volver
            </Link>
          </Button>
          <div className='space-y-2'>
            <Skeleton className='h-8 w-64' />
            <Skeleton className='h-4 w-48' />
          </div>
        </div>

        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-4'>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-20 w-full' />
              <div className='grid grid-cols-2 gap-4'>
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button variant='outline' size='sm' asChild>
          <Link href={`/admin/video-conferencing/spaces/${spaceId}`}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Editar Espacio de Video
          </h1>
          <p className='text-muted-foreground'>
            Modifica la configuración de "{videoSpace.title}"
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Espacio</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Basic Information */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Nombre del espacio de video'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='alias'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alias (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder='alias-personalizado' {...field} />
                      </FormControl>
                      <FormDescription>
                        URL personalizada para acceso rápido
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Describe el propósito de este espacio de video'
                        className='min-h-[100px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Configuration */}
              <FormField
                control={form.control}
                name='maxParticipants'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máximo de Participantes</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={1}
                        max={1000}
                        placeholder='100'
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Deja vacío para ilimitados (sujeto a límites del
                      proveedor)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Feature Toggles */}
              <div className='space-y-4'>
                <h3 className='text-lg font-medium'>
                  Configuración de Funcionalidades
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='requiresAuth'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                        <div className='space-y-0.5'>
                          <FormLabel className='text-base'>
                            Requiere Autenticación
                          </FormLabel>
                          <FormDescription>
                            Los participantes deben autenticarse para unirse
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='recordingEnabled'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                        <div className='space-y-0.5'>
                          <FormLabel className='text-base'>
                            Grabación Habilitada
                          </FormLabel>
                          <FormDescription>
                            Permite grabar las sesiones
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='chatEnabled'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                        <div className='space-y-0.5'>
                          <FormLabel className='text-base'>
                            Chat Habilitado
                          </FormLabel>
                          <FormDescription>
                            Permite el chat durante las sesiones
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='screenShareEnabled'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                        <div className='space-y-0.5'>
                          <FormLabel className='text-base'>
                            Compartir Pantalla
                          </FormLabel>
                          <FormDescription>
                            Permite compartir pantalla
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='waitingRoomEnabled'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                        <div className='space-y-0.5'>
                          <FormLabel className='text-base'>
                            Sala de Espera
                          </FormLabel>
                          <FormDescription>
                            Los participantes esperan aprobación para unirse
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className='flex gap-4 pt-6'>
                <Button
                  type='submit'
                  disabled={updateVideoSpaceMutation.isPending}
                  className='flex-1'
                >
                  {updateVideoSpaceMutation.isPending ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className='h-4 w-4 mr-2' />
                      Guardar Cambios
                    </>
                  )}
                </Button>
                <Button type='button' variant='outline' asChild>
                  <Link href={`/admin/video-conferencing/spaces/${spaceId}`}>
                    Cancelar
                  </Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
