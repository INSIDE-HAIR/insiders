"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  CreateApiKeyRequestInput
} from "../../types";
import { CreateApiKeyRequestSchema } from "../../validations/api-keys";
import { Key, X } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";

// Form schema for the client-side form
const FormSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_\.]+$/, "Name contains invalid characters"),
  description: z.string().optional(),
  expiresAt: z.date().optional().nullable()
});

type CreateApiKeyFormData = z.infer<typeof FormSchema>;

interface CreateApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateApiKeyRequestInput) => Promise<void>;
  loading?: boolean;
}

export function CreateApiKeyDialog({
  open,
  onOpenChange,
  onSubmit,
  loading = false
}: CreateApiKeyDialogProps) {
  const { toast } = useToast();

  const form = useForm<CreateApiKeyFormData>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      expiresAt: null
    }
  });


  const handleSubmit = async (data: CreateApiKeyFormData) => {
    try {
      // Transform the data to match the API schema
      const submitData: CreateApiKeyRequestInput = {
        name: data.name,
        description: data.description || undefined,
        expiresAt: data.expiresAt ? data.expiresAt.toISOString() : undefined
      };
      
      await onSubmit(submitData);
      form.reset({
        name: "",
        description: "",
        expiresAt: null
      });
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Crear Nueva API Key</span>
          </DialogTitle>
          <DialogDescription>
            Crea una nueva API Key para acceder programáticamente a los servicios. 
            Asegúrate de guardar la clave de forma segura.
          </DialogDescription>
        </DialogHeader>

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

            <DialogFooter className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear API Key"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}