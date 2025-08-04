"use client";

import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Button } from "@/src/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { ResourceType, EvaluationStrategy, LogicOperator, ConditionOperator, AccessLevel } from "@prisma/client";
import { useToast } from "@/src/hooks/use-toast";
import { 
  PlusCircle, Trash2, Settings, GitBranch, TestTube, 
  Eye, Shield, Clock, ChevronRight, Layers, Copy 
} from "lucide-react";
import { RuleGroupBuilder } from "./RuleGroupBuilder";
import { TestingPanel } from "./TestingPanel";

// Schemas de validación
const ComplexRuleConditionSchema = z.object({
  fieldPath: z.string().min(1, 'Field path es requerido'),
  operator: z.nativeEnum(ConditionOperator),
  value: z.any(),
  isNegated: z.boolean().default(false),
  priority: z.number().default(0),
});

const ComplexRuleSchema = z.object({
  name: z.string().min(1, 'Nombre de regla es requerido'),
  description: z.string().optional(),
  logicOperator: z.nativeEnum(LogicOperator).default(LogicOperator.AND),
  accessLevel: z.nativeEnum(AccessLevel).default(AccessLevel.READ),
  priority: z.number().default(0),
  isEnabled: z.boolean().default(true),
  individualStartDate: z.string().optional(),
  individualEndDate: z.string().optional(),
  individualStartTime: z.string().regex(/^\\d{2}:\\d{2}$/).optional().or(z.literal('')),
  individualEndTime: z.string().regex(/^\\d{2}:\\d{2}$/).optional().or(z.literal('')),
  individualDaysOfWeek: z.array(z.string()).default([]),
  conditions: z.array(ComplexRuleConditionSchema).default([]),
});

const RuleGroupSchema = z.object({
  name: z.string().min(1, 'Nombre de grupo es requerido'),
  description: z.string().optional(),
  logicOperator: z.nativeEnum(LogicOperator).default(LogicOperator.AND),
  priority: z.number().default(0),
  isEnabled: z.boolean().default(true),
  rules: z.array(ComplexRuleSchema).default([]),
});

const ComplexAccessControlSchema = z.object({
  resourceType: z.nativeEnum(ResourceType),
  resourceId: z.string().min(1, 'Resource ID es requerido'),
  isEnabled: z.boolean().default(true),
  evaluationStrategy: z.literal(EvaluationStrategy.COMPLEX),
  mainLogicOperator: z.nativeEnum(LogicOperator).default(LogicOperator.OR),
  maxConcurrentUsers: z.number().min(0).optional(),
  maxAccessCount: z.number().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  startTime: z.string().regex(/^\\d{2}:\\d{2}$/).optional().or(z.literal('')),
  endTime: z.string().regex(/^\\d{2}:\\d{2}$/).optional().or(z.literal('')),
  daysOfWeek: z.array(z.string()).default([]),
  requiredAuthMethods: z.array(z.string()).default([]),
  ruleGroups: z.array(RuleGroupSchema).default([]),
});

type ComplexAccessControlData = z.infer<typeof ComplexAccessControlSchema>;

interface ComplexAccessModalProps {
  control: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const COMMON_ROUTES = [
  { value: '/[lang]/admin/drive', label: 'Admin - Drive' },
  { value: '/[lang]/admin/users', label: 'Admin - Users' },
  { value: '/[lang]/admin/calendar', label: 'Admin - Calendar' },
  { value: '/[lang]/admin/holded', label: 'Admin - Holded' },
  { value: '/[lang]/training', label: 'Training' },
  { value: '/[lang]/marketing-salon', label: 'Marketing Salon' },
  { value: 'marketing_digital_avanzado', label: 'Marketing Digital Avanzado' },
  { value: 'formacion_ventas_2025', label: 'Formación Ventas 2025' },
];

// Componente reutilizable para campos de tiempo
function TimeRangeFields({ control, prefix }: { control: any; prefix: string }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`${prefix}.startDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de Inicio</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field}
                  value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                  onChange={(e) => field.onChange(e.target.value ? e.target.value + 'T00:00:00Z' : '')}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`${prefix}.endDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de Fin</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field}
                  value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                  onChange={(e) => field.onChange(e.target.value ? e.target.value + 'T23:59:59Z' : '')}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`${prefix}.startTime`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hora de Inicio</FormLabel>
              <FormControl>
                <Input type="time" {...field} value={field.value || ''} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`${prefix}.endTime`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hora de Fin</FormLabel>
              <FormControl>
                <Input type="time" {...field} value={field.value || ''} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name={`${prefix}.daysOfWeek`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Días de la Semana</FormLabel>
            <div className="flex flex-wrap gap-4 mt-2">
              {DAYS_OF_WEEK.map((day) => (
                <FormItem
                  key={day}
                  className="flex flex-row items-center space-x-2 space-y-0"
                >
                  <FormControl>
                    <Checkbox
                      checked={field.value?.includes(day)}
                      onCheckedChange={(checked) => {
                        const updatedValue = checked
                          ? [...(field.value || []), day]
                          : (field.value || []).filter((d: string) => d !== day);
                        field.onChange(updatedValue);
                      }}
                    />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    {day.slice(0, 3)}
                  </FormLabel>
                </FormItem>
              ))}
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}

export function ComplexAccessModal({ control, onClose, onSuccess }: ComplexAccessModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("general");

  const form = useForm<ComplexAccessControlData>({
    resolver: zodResolver(ComplexAccessControlSchema),
    defaultValues: {
      resourceType: ResourceType.PAGE,
      resourceId: '',
      isEnabled: true,
      evaluationStrategy: EvaluationStrategy.COMPLEX,
      mainLogicOperator: LogicOperator.OR,
      maxConcurrentUsers: 0,
      maxAccessCount: 0,
      daysOfWeek: [],
      requiredAuthMethods: [],
      ruleGroups: [],
    },
  });

  const {
    fields: ruleGroupFields,
    append: appendRuleGroup,
    remove: removeRuleGroup,
    update: updateRuleGroup,
  } = useFieldArray({
    control: form.control,
    name: "ruleGroups",
  });

  // Cargar datos si estamos editando
  useEffect(() => {
    if (control) {
      const formData = {
        ...control,
        evaluationStrategy: EvaluationStrategy.COMPLEX,
        startDate: control.startDate || undefined,
        endDate: control.endDate || undefined,
        startTime: control.startTime || '',
        endTime: control.endTime || '',
      };
      form.reset(formData);
    }
  }, [control, form]);

  const onSubmit = async (data: ComplexAccessControlData) => {
    try {
      setIsLoading(true);
      
      const endpoint = control?.id 
        ? '/api/admin/complex-access-control'
        : '/api/admin/complex-access-control';
      
      const method = control?.id ? 'PUT' : 'POST';
      
      const body = control?.id 
        ? { id: control.id, ...data }
        : data;

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al guardar');
      }

      toast({
        title: "Éxito",
        description: control?.id 
          ? "Control de acceso actualizado correctamente"
          : "Control de acceso creado correctamente",
      });

      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar el control de acceso",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRuleGroup = () => {
    appendRuleGroup({
      name: `Grupo ${ruleGroupFields.length + 1}`,
      description: '',
      logicOperator: LogicOperator.AND,
      priority: ruleGroupFields.length,
      isEnabled: true,
      rules: [],
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            {control?.id ? 'Editar' : 'Crear'} Control de Acceso Complejo
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[calc(90vh-200px)] pr-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">
                    <Settings className="h-4 w-4 mr-2" />
                    General
                  </TabsTrigger>
                  <TabsTrigger value="rule-groups">
                    <Layers className="h-4 w-4 mr-2" />
                    Grupos de Reglas
                  </TabsTrigger>
                  <TabsTrigger value="testing">
                    <TestTube className="h-4 w-4 mr-2" />
                    Testing
                  </TabsTrigger>
                  <TabsTrigger value="preview">
                    <Eye className="h-4 w-4 mr-2" />
                    Vista Previa
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuración Básica</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="resourceType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Recurso</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={ResourceType.PAGE}>Página</SelectItem>
                                  <SelectItem value={ResourceType.FOLDER}>Carpeta</SelectItem>
                                  <SelectItem value={ResourceType.MEDIA}>Media</SelectItem>
                                  <SelectItem value={ResourceType.OTHER}>Otro</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="resourceId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ID/Ruta del Recurso</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona o escribe..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {COMMON_ROUTES.map((route) => (
                                    <SelectItem key={route.value} value={route.value}>
                                      {route.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="mainLogicOperator"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Operador Principal</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={LogicOperator.OR}>
                                    OR - Cualquier grupo permite acceso
                                  </SelectItem>
                                  <SelectItem value={LogicOperator.AND}>
                                    AND - Todos los grupos deben cumplirse
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Define cómo se evalúan los grupos de reglas entre sí
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <FormField
                          control={form.control}
                          name="isEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Control Habilitado
                                </FormLabel>
                                <FormDescription>
                                  Si está deshabilitado, este control no se evaluará
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="maxConcurrentUsers"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Usuarios Concurrentes Máx.</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormDescription>
                                0 = sin límite
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="maxAccessCount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Accesos Máximos</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormDescription>
                                0 = sin límite
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Restricciones de Tiempo Globales
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TimeRangeFields control={form.control} prefix="" />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="rule-groups" className="space-y-4 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Grupos de Reglas</h3>
                      <p className="text-sm text-gray-600">
                        Define grupos de reglas con lógica OR/AND anidada
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddRuleGroup}
                      className="flex items-center gap-2"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Añadir Grupo
                    </Button>
                  </div>

                  {ruleGroupFields.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No hay grupos de reglas configurados</p>
                        <Button
                          type="button"
                          onClick={handleAddRuleGroup}
                          variant="outline"
                        >
                          Crear primer grupo
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Accordion type="single" collapsible className="space-y-4">
                      {ruleGroupFields.map((group, index) => (
                        <RuleGroupBuilder
                          key={group.id}
                          groupIndex={index}
                          control={form.control}
                          onRemove={() => removeRuleGroup(index)}
                          onUpdate={(data) => updateRuleGroup(index, data)}
                        />
                      ))}
                    </Accordion>
                  )}
                </TabsContent>

                <TabsContent value="testing" className="mt-6">
                  <TestingPanel 
                    resourceId={form.watch("resourceId")}
                    control={form.getValues()}
                  />
                </TabsContent>

                <TabsContent value="preview" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Vista Previa de la Configuración</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4  rounded-lg">
                          <h4 className="font-semibold mb-2">Lógica de Evaluación:</h4>
                          <div className="pl-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {form.watch("mainLogicOperator")}
                              </Badge>
                              <span className="text-sm">Operador Principal</span>
                            </div>
                            {ruleGroupFields.map((group, index) => {
                              const groupData = form.watch(`ruleGroups.${index}`);
                              return (
                                <div key={group.id} className="ml-4 border-l-2 border-gray-300 pl-4">
                                  <div className="flex items-center gap-2">
                                    <ChevronRight className="h-4 w-4" />
                                    <span className="font-medium">{groupData.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {groupData.logicOperator}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      ({groupData.rules?.length || 0} reglas)
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Información General:</h4>
                            <dl className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <dt className="text-gray-600">Recurso:</dt>
                                <dd className="font-medium">{form.watch("resourceId") || 'No definido'}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-gray-600">Tipo:</dt>
                                <dd className="font-medium">{form.watch("resourceType")}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-gray-600">Estado:</dt>
                                <dd className="font-medium">
                                  {form.watch("isEnabled") ? 'Habilitado' : 'Deshabilitado'}
                                </dd>
                              </div>
                            </dl>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Restricciones:</h4>
                            <dl className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <dt className="text-gray-600">Usuarios concurrentes:</dt>
                                <dd className="font-medium">
                                  {form.watch("maxConcurrentUsers") || 'Ilimitado'}
                                </dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-gray-600">Accesos máximos:</dt>
                                <dd className="font-medium">
                                  {form.watch("maxAccessCount") || 'Ilimitado'}
                                </dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-gray-600">Días activos:</dt>
                                <dd className="font-medium">
                                  {form.watch("daysOfWeek")?.length || 'Todos'}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </ScrollArea>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : control?.id ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}