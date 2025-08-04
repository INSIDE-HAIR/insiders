"use client";

import React from "react";
import { useFieldArray } from "react-hook-form";
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
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
import { LogicOperator, AccessLevel } from "@prisma/client";
import { 
  PlusCircle, Trash2, ChevronDown, ChevronRight, 
  Shield, Clock, Settings, Filter 
} from "lucide-react";
import { ConditionBuilder } from "./ConditionBuilder";

interface ComplexRuleBuilderProps {
  groupIndex: number;
  ruleIndex: number;
  control: any;
  onRemove: () => void;
}

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export function ComplexRuleBuilder({ 
  groupIndex, 
  ruleIndex, 
  control, 
  onRemove 
}: ComplexRuleBuilderProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({
    control,
    name: `ruleGroups.${groupIndex}.rules.${ruleIndex}.conditions`,
  });

  const handleAddCondition = () => {
    appendCondition({
      fieldPath: 'user.groups',
      operator: 'CONTAINS',
      value: '',
      isNegated: false,
      priority: conditionFields.length,
    });
  };

  const ruleName = control._formValues?.ruleGroups?.[groupIndex]?.rules?.[ruleIndex]?.name || `Regla ${ruleIndex + 1}`;
  const ruleOperator = control._formValues?.ruleGroups?.[groupIndex]?.rules?.[ruleIndex]?.logicOperator || LogicOperator.AND;
  const accessLevel = control._formValues?.ruleGroups?.[groupIndex]?.rules?.[ruleIndex]?.accessLevel || AccessLevel.READ;
  const isEnabled = control._formValues?.ruleGroups?.[groupIndex]?.rules?.[ruleIndex]?.isEnabled ?? true;

  const getAccessLevelColor = (level: AccessLevel) => {
    const colors: Record<AccessLevel, string> = {
      [AccessLevel.READ]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      [AccessLevel.WRITE]: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
      [AccessLevel.CREATE]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      [AccessLevel.DELETE]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      [AccessLevel.MANAGE]: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      [AccessLevel.CONFIGURE]: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      [AccessLevel.UPDATE]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      [AccessLevel.FULL]: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    };
    return colors[level] || colors[AccessLevel.READ];
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className={`border-l-4 ${
        ruleOperator === LogicOperator.OR 
          ? "border-l-green-500 bg-green-50/30 dark:bg-green-900/10" 
          : "border-l-blue-500 bg-blue-50/30 dark:bg-blue-900/10"
      }`}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <Shield className="h-4 w-4" />
                <span className="font-medium">{ruleName}</span>
              </div>
              
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Badge 
                  variant="outline" 
                  className={
                    ruleOperator === LogicOperator.OR
                      ? "border-green-500 text-green-700"
                      : "border-blue-500 text-blue-700"
                  }
                >
                  {ruleOperator}
                </Badge>
                <Badge className={getAccessLevelColor(accessLevel)}>
                  {accessLevel}
                </Badge>
                <Badge 
                  variant={isEnabled ? "default" : "destructive"}
                  className="text-xs"
                >
                  {conditionFields.length} condiciones
                </Badge>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Configuración Básica de la Regla */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuración Básica
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name={`ruleGroups.${groupIndex}.rules.${ruleIndex}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Regla</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: Edición Enero 2025" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`ruleGroups.${groupIndex}.rules.${ruleIndex}.logicOperator`}
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
                            OR - Cualquier condición
                          </SelectItem>
                          <SelectItem value={LogicOperator.AND}>
                            AND - Todas las condiciones
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name={`ruleGroups.${groupIndex}.rules.${ruleIndex}.accessLevel`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel de Acceso</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={AccessLevel.READ}>Lectura</SelectItem>
                          <SelectItem value={AccessLevel.CREATE}>Crear</SelectItem>
                          <SelectItem value={AccessLevel.UPDATE}>Actualizar</SelectItem>
                          <SelectItem value={AccessLevel.DELETE}>Eliminar</SelectItem>
                          <SelectItem value={AccessLevel.FULL}>Completo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`ruleGroups.${groupIndex}.rules.${ruleIndex}.isEnabled`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-6">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Regla Habilitada</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name={`ruleGroups.${groupIndex}.rules.${ruleIndex}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe cuándo se aplica esta regla..."
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Restricciones de Tiempo Individuales */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Restricciones de Tiempo (Opcional)
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name={`ruleGroups.${groupIndex}.rules.${ruleIndex}.individualStartDate`}
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`ruleGroups.${groupIndex}.rules.${ruleIndex}.individualEndDate`}
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`ruleGroups.${groupIndex}.rules.${ruleIndex}.individualStartTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de Inicio</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`ruleGroups.${groupIndex}.rules.${ruleIndex}.individualEndTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de Fin</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name={`ruleGroups.${groupIndex}.rules.${ruleIndex}.individualDaysOfWeek`}
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
                    <FormDescription>
                      Si no seleccionas ninguno, la regla se aplicará todos los días
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            {/* Condiciones */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h5 className="text-sm font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Condiciones
                </h5>
                <Button
                  type="button"
                  onClick={handleAddCondition}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Añadir Condición
                </Button>
              </div>

              {conditionFields.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-6 text-center">
                    <Filter className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-3">
                      No hay condiciones configuradas
                    </p>
                    <Button
                      type="button"
                      onClick={handleAddCondition}
                      variant="outline"
                      size="sm"
                    >
                      Crear primera condición
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {conditionFields.map((condition, conditionIndex) => (
                    <ConditionBuilder
                      key={condition.id}
                      groupIndex={groupIndex}
                      ruleIndex={ruleIndex}
                      conditionIndex={conditionIndex}
                      control={control}
                      onRemove={() => removeCondition(conditionIndex)}
                    />
                  ))}
                </div>
              )}

              {/* Resumen de la Lógica */}
              {conditionFields.length > 1 && (
                <Card className="bg-gray-50 dark:bg-gray-900 border-dashed">
                  <CardContent className="py-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Filter className="h-4 w-4" />
                      <span className="text-gray-600">
                        Esta regla evalúa sus {conditionFields.length} condiciones con operador{" "}
                        <Badge 
                          variant="outline" 
                          className={
                            ruleOperator === LogicOperator.OR
                              ? "border-green-500 text-green-700"
                              : "border-blue-500 text-blue-700"
                          }
                        >
                          {ruleOperator}
                        </Badge>
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {ruleOperator === LogicOperator.OR
                        ? "La regla será verdadera si CUALQUIERA de las condiciones se cumple"
                        : "La regla será verdadera solo si TODAS las condiciones se cumplen"
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}