"use client";

import React from "react";
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
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { ConditionOperator } from "@prisma/client";
import { Trash2, Filter, AlertCircle, Info } from "lucide-react";

interface ConditionBuilderProps {
  groupIndex: number;
  ruleIndex: number;
  conditionIndex: number;
  control: any;
  onRemove: () => void;
}

// Definición de field paths comunes
const FIELD_PATHS = [
  { value: 'user.groups', label: 'Grupos del Usuario', description: 'Ej: marketing_digital_enero_2025' },
  { value: 'user.tags', label: 'Tags del Usuario', description: 'Ej: premium, vip' },
  { value: 'user.services', label: 'Servicios del Usuario', description: 'Ej: marketing_digital_premium' },
  { value: 'user.status', label: 'Estado del Usuario', description: 'Ej: active, inactive' },
  { value: 'user.role', label: 'Rol del Usuario', description: 'Ej: ADMIN, CLIENT' },
  { value: 'user.email', label: 'Email del Usuario', description: 'Dirección de correo electrónico' },
  { value: 'user.deactivation_date', label: 'Fecha de Desactivación', description: 'Fecha cuando fue desactivado' },
  { value: 'user.subscription_end_date', label: 'Fin de Suscripción', description: 'Fecha de fin de suscripción' },
  { value: 'user.last_login', label: 'Último Login', description: 'Fecha del último acceso' },
  { value: 'current_date', label: 'Fecha Actual', description: 'Fecha de evaluación' },
  { value: 'current_time', label: 'Hora Actual', description: 'Hora de evaluación' },
  { value: 'current_day', label: 'Día Actual', description: 'Día de la semana' },
  { value: 'request.ip', label: 'IP del Request', description: 'Dirección IP del usuario' },
  { value: 'request.geo.country', label: 'País', description: 'País desde donde accede' },
];

// Operadores disponibles por tipo de campo
const OPERATORS_BY_TYPE = {
  string: [
    { value: ConditionOperator.EQUALS, label: 'Igual a', description: 'Valor exacto' },
    { value: ConditionOperator.NOT_EQUALS, label: 'Diferente de', description: 'No igual al valor' },
    { value: ConditionOperator.CONTAINS, label: 'Contiene', description: 'Contiene el texto' },
    { value: ConditionOperator.NOT_CONTAINS, label: 'No contiene', description: 'No contiene el texto' },
    { value: ConditionOperator.STARTS_WITH, label: 'Empieza con', description: 'Inicia con el texto' },
    { value: ConditionOperator.ENDS_WITH, label: 'Termina con', description: 'Termina con el texto' },
  ],
  array: [
    { value: ConditionOperator.CONTAINS, label: 'Contiene elemento', description: 'El array contiene el valor' },
    { value: ConditionOperator.NOT_CONTAINS, label: 'No contiene elemento', description: 'El array no contiene el valor' },
    { value: ConditionOperator.IN, label: 'Está en lista', description: 'El valor está en la lista' },
    { value: ConditionOperator.NOT_IN, label: 'No está en lista', description: 'El valor no está en la lista' },
  ],
  date: [
    { value: ConditionOperator.EQUALS, label: 'En fecha', description: 'Fecha exacta' },
    { value: ConditionOperator.GREATER_THAN, label: 'Después de', description: 'Fecha posterior' },
    { value: ConditionOperator.LESS_THAN, label: 'Antes de', description: 'Fecha anterior' },
    { value: ConditionOperator.BETWEEN, label: 'Entre fechas', description: 'Rango de fechas' },
    { value: ConditionOperator.WITHIN_LAST, label: 'En los últimos', description: 'Últimos X días/meses' },
  ],
  number: [
    { value: ConditionOperator.EQUALS, label: 'Igual a', description: 'Valor exacto' },
    { value: ConditionOperator.NOT_EQUALS, label: 'Diferente de', description: 'No igual al valor' },
    { value: ConditionOperator.GREATER_THAN, label: 'Mayor que', description: 'Valor superior' },
    { value: ConditionOperator.LESS_THAN, label: 'Menor que', description: 'Valor inferior' },
    { value: ConditionOperator.BETWEEN, label: 'Entre valores', description: 'Rango numérico' },
  ],
};

// Determinar el tipo de campo basado en el fieldPath
const getFieldType = (fieldPath: string): keyof typeof OPERATORS_BY_TYPE => {
  if (fieldPath.includes('groups') || fieldPath.includes('tags') || fieldPath.includes('services')) {
    return 'array';
  }
  if (fieldPath.includes('date') || fieldPath.includes('time') || fieldPath === 'current_date') {
    return 'date';
  }
  if (fieldPath.includes('count') || fieldPath.includes('number')) {
    return 'number';
  }
  return 'string';
};

// Obtener placeholder para el valor basado en el operador y fieldPath
const getValuePlaceholder = (fieldPath: string, operator: string) => {
  if (operator === ConditionOperator.BETWEEN) {
    return fieldPath.includes('date') ? '["2025-01-01", "2025-12-31"]' : '[1, 10]';
  }
  if (operator === ConditionOperator.WITHIN_LAST) {
    return '30_days, 6_months, 1_year';
  }
  if (operator === ConditionOperator.IN || operator === ConditionOperator.NOT_IN) {
    return '["valor1", "valor2", "valor3"]';
  }
  
  // Ejemplos específicos por fieldPath
  const examples = {
    'user.groups': 'marketing_digital_enero_2025',
    'user.tags': 'premium',
    'user.services': 'marketing_digital_premium',
    'user.status': 'active',
    'user.role': 'CLIENT',
    'user.email': 'user@example.com',
    'current_date': '2025-01-15',
    'current_time': '14:30',
    'current_day': 'Monday',
    'request.ip': '192.168.1.100',
    'request.geo.country': 'Spain',
  };
  
  return examples[fieldPath as keyof typeof examples] || 'valor';
};

export function ConditionBuilder({ 
  groupIndex, 
  ruleIndex, 
  conditionIndex, 
  control, 
  onRemove 
}: ConditionBuilderProps) {
  const fieldPath = control._formValues?.ruleGroups?.[groupIndex]?.rules?.[ruleIndex]?.conditions?.[conditionIndex]?.fieldPath || '';
  const operator = control._formValues?.ruleGroups?.[groupIndex]?.rules?.[ruleIndex]?.conditions?.[conditionIndex]?.operator || ConditionOperator.EQUALS;
  const isNegated = control._formValues?.ruleGroups?.[groupIndex]?.rules?.[ruleIndex]?.conditions?.[conditionIndex]?.isNegated || false;

  const fieldType = getFieldType(fieldPath);
  const availableOperators = OPERATORS_BY_TYPE[fieldType] || OPERATORS_BY_TYPE.string;
  const selectedField = FIELD_PATHS.find(f => f.value === fieldPath);
  const selectedOperator = availableOperators.find(op => op.value === operator);

  const renderValueInput = () => {
    const fieldName = `ruleGroups.${groupIndex}.rules.${ruleIndex}.conditions.${conditionIndex}.value`;
    const placeholder = getValuePlaceholder(fieldPath, operator);

    if (operator === ConditionOperator.BETWEEN || operator === ConditionOperator.IN || operator === ConditionOperator.NOT_IN) {
      return (
        <FormField
          control={control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor (JSON Array)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={placeholder}
                  rows={2}
                  value={typeof field.value === 'string' ? field.value : JSON.stringify(field.value || [])}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      field.onChange(parsed);
                    } catch {
                      field.onChange(e.target.value);
                    }
                  }}
                />
              </FormControl>
              <FormDescription>
                Formato JSON array. Ej: {placeholder}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (fieldPath.includes('date') && operator !== ConditionOperator.WITHIN_LAST) {
      return (
        <FormField
          control={control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha</FormLabel>
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
      );
    }

    return (
      <FormField
        control={control}
        name={fieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valor</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={placeholder}
                value={typeof field.value === 'object' ? JSON.stringify(field.value) : field.value || ''}
                onChange={(e) => field.onChange(e.target.value)}
              />
            </FormControl>
            <FormDescription>
              {selectedOperator?.description}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Card className="border-l-2 border-l-gray-300 bg-gray-50/50 dark:bg-gray-900/50">
      <CardContent className="py-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Condición {conditionIndex + 1}</span>
              {isNegated && (
                <Badge variant="outline" className="text-xs border-red-500 text-red-700">
                  Negada
                </Badge>
              )}
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={control}
              name={`ruleGroups.${groupIndex}.rules.${ruleIndex}.conditions.${conditionIndex}.fieldPath`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona campo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FIELD_PATHS.map((path) => (
                        <SelectItem key={path.value} value={path.value}>
                          <div className="flex flex-col">
                            <span>{path.label}</span>
                            <span className="text-xs text-gray-500">{path.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedField && (
                    <FormDescription className="text-xs">
                      {selectedField.description}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`ruleGroups.${groupIndex}.rules.${ruleIndex}.conditions.${conditionIndex}.operator`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operador</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona operador" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableOperators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          <div className="flex flex-col">
                            <span>{op.label}</span>
                            <span className="text-xs text-gray-500">{op.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              {renderValueInput()}
              
              <FormField
                control={control}
                name={`ruleGroups.${groupIndex}.rules.${ruleIndex}.conditions.${conditionIndex}.isNegated`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm">Negar condición</FormLabel>
                      <FormDescription className="text-xs">
                        Invierte el resultado de la evaluación
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Vista previa de la condición */}
          {fieldPath && operator && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Vista previa de la condición:
                  </p>
                  <code className="text-xs bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                    {isNegated && 'NOT '}
                    {fieldPath} {operator} {
                      control._formValues?.ruleGroups?.[groupIndex]?.rules?.[ruleIndex]?.conditions?.[conditionIndex]?.value
                        ? JSON.stringify(control._formValues.ruleGroups[groupIndex].rules[ruleIndex].conditions[conditionIndex].value)
                        : '"valor"'
                    }
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}