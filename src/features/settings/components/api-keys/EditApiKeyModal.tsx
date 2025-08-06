"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/src/components/shared/ui/responsive-modal";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { DateTimePicker } from "@/src/components/ui/date-picker";
import { 
  ApiKey,
  UpdateApiKeyRequest
} from "../../types";
import { Key, X, Edit } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";

// Form schema for editing API keys
const EditFormSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_\.\(\)]+$/, "Name contains invalid characters"),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'REVOKED']),
  expiresAt: z.date().optional().nullable()
});

type EditApiKeyFormData = z.infer<typeof EditFormSchema>;

interface EditApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: ApiKey | null;
  onSubmit: (keyId: string, data: UpdateApiKeyRequest) => Promise<void>;
  loading?: boolean;
}

export function EditApiKeyModal({
  open,
  onOpenChange,
  apiKey,
  onSubmit,
  loading = false
}: EditApiKeyModalProps) {
  const { toast } = useToast();

  const form = useForm<EditApiKeyFormData>({
    resolver: zodResolver(EditFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: 'ACTIVE',
      expiresAt: null
    }
  });

  // Reset form when apiKey changes
  React.useEffect(() => {
    if (apiKey) {
      form.reset({
        name: apiKey.name,
        description: apiKey.description || "",
        status: apiKey.status,
        expiresAt: apiKey.expiresAt ? new Date(apiKey.expiresAt) : null
      });
    }
  }, [apiKey, form]);

  const handleSubmit = async (data: EditApiKeyFormData) => {
    if (!apiKey) return;

    try {
      // Transform the data to match the API schema
      const submitData: UpdateApiKeyRequest = {
        name: data.name,
        description: data.description || undefined,
        status: data.status,
        expiresAt: data.expiresAt ? data.expiresAt.toISOString() : undefined
      };
      
      await onSubmit(apiKey.id, submitData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating API key:', error);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  if (!apiKey) return null;

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-lg">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>Editar API Key</span>
          </ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Modifica los detalles de la API Key "{apiKey.name}".
            Los cambios se aplicarán inmediatamente.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej: Mobile App - iOS" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Nombre descriptivo para identificar esta API Key
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe el propósito de esta API Key..."
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Activa</SelectItem>
                        <SelectItem value="INACTIVE">Inactiva</SelectItem>
                        <SelectItem value="REVOKED">Revocada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Estado actual de la API Key
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Expiración</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <DateTimePicker
                          value={field.value || undefined}
                          onChange={field.onChange}
                          placeholder="Seleccionar fecha (opcional)"
                          granularity="minute"
                          hourCycle={24}
                          className="flex-1"
                        />
                        {field.value && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => field.onChange(null)}
                            className="h-10 w-10 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Opcional. La clave se desactivará automáticamente en esta fecha
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <ResponsiveModalFooter className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </ResponsiveModalFooter>
          </form>
        </Form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}