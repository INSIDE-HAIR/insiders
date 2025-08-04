"use client";

import React from "react";
import { useFieldArray } from "react-hook-form";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { LogicOperator, AccessLevel } from "@prisma/client";
import { 
  PlusCircle, Trash2, GitBranch, Settings, 
  Copy, ChevronDown, Layers, Shield 
} from "lucide-react";
import { ComplexRuleBuilder } from "./ComplexRuleBuilder";

interface RuleGroupBuilderProps {
  groupIndex: number;
  control: any;
  onRemove: () => void;
  onUpdate: (data: any) => void;
}

export function RuleGroupBuilder({ 
  groupIndex, 
  control, 
  onRemove, 
  onUpdate 
}: RuleGroupBuilderProps) {
  const {
    fields: ruleFields,
    append: appendRule,
    remove: removeRule,
  } = useFieldArray({
    control,
    name: `ruleGroups.${groupIndex}.rules`,
  });

  const handleAddRule = () => {
    appendRule({
      name: `Regla ${ruleFields.length + 1}`,
      description: '',
      logicOperator: LogicOperator.AND,
      accessLevel: AccessLevel.READ,
      priority: ruleFields.length,
      isEnabled: true,
      individualStartDate: '',
      individualEndDate: '',
      individualStartTime: '',
      individualEndTime: '',
      individualDaysOfWeek: [],
      conditions: [],
    });
  };

  const getOperatorColor = (operator: LogicOperator) => {
    return operator === LogicOperator.OR 
      ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
      : "border-blue-500 bg-blue-50 dark:bg-blue-900/20";
  };

  return (
    <AccordionItem 
      value={`group-${groupIndex}`}
      className={`border rounded-lg ${getOperatorColor(control._formValues?.ruleGroups?.[groupIndex]?.logicOperator || LogicOperator.AND)}`}
    >
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-3 w-full">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span className="font-medium">
              {control._formValues?.ruleGroups?.[groupIndex]?.name || `Grupo ${groupIndex + 1}`}
            </span>
          </div>
          
          <div className="flex items-center gap-2 ml-auto mr-4">
            <Badge 
              variant="outline" 
              className={
                control._formValues?.ruleGroups?.[groupIndex]?.logicOperator === LogicOperator.OR
                  ? "border-green-500 text-green-700"
                  : "border-blue-500 text-blue-700"
              }
            >
              {control._formValues?.ruleGroups?.[groupIndex]?.logicOperator || LogicOperator.AND}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {ruleFields.length} reglas
            </Badge>
            <Badge 
              variant={control._formValues?.ruleGroups?.[groupIndex]?.isEnabled ? "default" : "destructive"}
              className="text-xs"
            >
              {control._formValues?.ruleGroups?.[groupIndex]?.isEnabled ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
        </div>
      </AccordionTrigger>
      
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-6">
          {/* Configuración del Grupo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuración del Grupo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name={`ruleGroups.${groupIndex}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Grupo</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: Acceso por Edición" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`ruleGroups.${groupIndex}.logicOperator`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operador Lógico</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={LogicOperator.OR}>
                            OR - Cualquier regla permite acceso
                          </SelectItem>
                          <SelectItem value={LogicOperator.AND}>
                            AND - Todas las reglas deben cumplirse
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Cómo se evalúan las reglas dentro de este grupo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name={`ruleGroups.${groupIndex}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe qué tipo de acceso gestiona este grupo..."
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <FormField
                  control={control}
                  name={`ruleGroups.${groupIndex}.isEnabled`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Grupo Habilitado</FormLabel>
                        <FormDescription>
                          Si está deshabilitado, este grupo no se evaluará
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={onRemove}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar Grupo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reglas del Grupo */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Reglas del Grupo
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Define las reglas específicas que se evaluarán en este grupo
                </p>
              </div>
              <Button
                type="button"
                onClick={handleAddRule}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Añadir Regla
              </Button>
            </div>

            {ruleFields.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-3">
                    No hay reglas configuradas en este grupo
                  </p>
                  <Button
                    type="button"
                    onClick={handleAddRule}
                    variant="outline"
                    size="sm"
                  >
                    Crear primera regla
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {ruleFields.map((rule, ruleIndex) => (
                  <ComplexRuleBuilder
                    key={rule.id}
                    groupIndex={groupIndex}
                    ruleIndex={ruleIndex}
                    control={control}
                    onRemove={() => removeRule(ruleIndex)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Indicador de Lógica Visual */}
          {ruleFields.length > 1 && (
            <Card className="bg-gray-50 dark:bg-gray-900 border-dashed">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 text-sm">
                  <GitBranch className="h-4 w-4" />
                  <span className="text-gray-600">
                    Este grupo evalúa sus {ruleFields.length} reglas con operador{" "}
                    <Badge 
                      variant="outline" 
                      className={
                        control._formValues?.ruleGroups?.[groupIndex]?.logicOperator === LogicOperator.OR
                          ? "border-green-500 text-green-700"
                          : "border-blue-500 text-blue-700"
                      }
                    >
                      {control._formValues?.ruleGroups?.[groupIndex]?.logicOperator || LogicOperator.AND}
                    </Badge>
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {control._formValues?.ruleGroups?.[groupIndex]?.logicOperator === LogicOperator.OR
                    ? "El acceso se permitirá si CUALQUIERA de las reglas es verdadera"
                    : "El acceso se permitirá solo si TODAS las reglas son verdaderas"
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}