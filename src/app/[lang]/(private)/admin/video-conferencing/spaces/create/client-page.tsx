"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
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
import { ArrowLeft, Plus, Shield, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useCreateVideoSpace } from "@/src/features/video-conferencing/hooks/useVideoSpaces";
import { useIntegrationAccounts } from "@/src/features/video-conferencing/hooks/useIntegrations";
import { VideoProvider } from "@/src/features/video-conferencing/types/video-conferencing";
import { useToast } from "@/src/hooks/use-toast";

// Form validation schema
const createVideoSpaceSchema = z
  .object({
    title: z
      .string()
      .min(1, "El título es requerido")
      .max(255, "El título es muy largo"),
    description: z.string().optional(),
    provider: z.enum(["GOOGLE_MEET", "ZOOM", "VIMEO"], {
      required_error: "Selecciona un proveedor",
    }),
    scheduledStartTime: z
      .string()
      .min(1, "La fecha de inicio es requerida")
      .refine((date) => {
        const selectedDate = new Date(date);
        const now = new Date();
        return selectedDate > now;
      }, "La fecha de inicio debe ser en el futuro"),
    scheduledEndTime: z.string().min(1, "La fecha de fin es requerida"),
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
    integrationAccountId: z
      .string()
      .min(1, "Selecciona una cuenta de integración"),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.scheduledStartTime);
      const endDate = new Date(data.scheduledEndTime);
      return endDate > startDate;
    },
    {
      message: "La fecha de fin debe ser posterior a la fecha de inicio",
      path: ["scheduledEndTime"],
    }
  );

type CreateVideoSpaceFormData = z.infer<typeof createVideoSpaceSchema>;

export default function CreateVideoSpaceClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  // Fetch integration accounts
  const { data: integrationAccounts, isLoading: integrationsLoading } =
    useIntegrationAccounts();

  // Create mutation
  const createVideoSpaceMutation = useCreateVideoSpace();

  // Form setup
  const form = useForm<CreateVideoSpaceFormData>({
    resolver: zodResolver(createVideoSpaceSchema),
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
                No tienes permisos para crear espacios de video.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedProvider = form.watch("provider");
  const availableIntegrations =
    integrationAccounts?.filter(
      (account) =>
        account.provider === selectedProvider && account.status === "ACTIVE"
    ) || [];

  const onSubmit = async (data: CreateVideoSpaceFormData) => {
    try {
      // Map provider values to match API expectations
      const providerMapping: Record<string, string> = {
        GOOGLE_MEET: "MEET",
        ZOOM: "ZOOM",
        VIMEO: "VIMEO",
      };

      const videoSpace = await createVideoSpaceMutation.mutateAsync({
        title: data.title,
        description: data.description,
        provider: providerMapping[data.provider] as any,
        maxParticipants: data.maxParticipants,
        alias: data.alias,
        requiresAuth: data.requiresAuth,
        recordingEnabled: data.recordingEnabled,
        chatEnabled: data.chatEnabled,
        screenShareEnabled: data.screenShareEnabled,
        waitingRoomEnabled: data.waitingRoomEnabled,
        integrationAccountId: data.integrationAccountId,
        scheduledStartTime: data.scheduledStartTime,
        scheduledEndTime: data.scheduledEndTime,
      });

      toast({
        title: "Espacio creado",
        description: `"${data.title}" ha sido creado correctamente`,
      });

      router.push(`/es/admin/video-conferencing/spaces/${videoSpace.id}`);
    } catch (error: any) {
      console.error("Error creating video space:", error);

      let errorMessage = "No se pudo crear el espacio de video";

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button variant='outline' size='sm' asChild>
          <Link href='/admin/video-conferencing/spaces'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Crear Espacio de Video
          </h1>
          <p className='text-muted-foreground'>
            Configura un nuevo espacio de videoconferencia
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

              {/* Provider and Integration */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <FormField
                  control={form.control}
                  name='provider'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proveedor *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Selecciona un proveedor' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='GOOGLE_MEET'>
                            Google Meet
                          </SelectItem>
                          <SelectItem value='ZOOM'>Zoom</SelectItem>
                          <SelectItem value='VIMEO'>Vimeo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='integrationAccountId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuenta de Integración *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={
                          !selectedProvider ||
                          availableIntegrations.length === 0
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Selecciona una cuenta' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableIntegrations.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.accountName} ({account.accountEmail})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedProvider &&
                        availableIntegrations.length === 0 && (
                          <FormDescription className='text-destructive'>
                            No hay cuentas activas para {selectedProvider}.
                            <Link
                              href='/admin/video-conferencing/integrations'
                              className='underline ml-1'
                            >
                              Configura una integración
                            </Link>
                          </FormDescription>
                        )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Schedule */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <FormField
                  control={form.control}
                  name='scheduledStartTime'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha y Hora de Inicio *</FormLabel>
                      <FormControl>
                        <Input type='datetime-local' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='scheduledEndTime'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha y Hora de Fin *</FormLabel>
                      <FormControl>
                        <Input type='datetime-local' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                  disabled={
                    createVideoSpaceMutation.isPending || integrationsLoading
                  }
                  className='flex-1'
                >
                  {createVideoSpaceMutation.isPending ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus className='h-4 w-4 mr-2' />
                      Crear Espacio
                    </>
                  )}
                </Button>
                <Button type='button' variant='outline' asChild>
                  <Link href='/admin/video-conferencing/spaces'>Cancelar</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
