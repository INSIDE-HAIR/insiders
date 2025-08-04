import prisma from '@/src/lib/prisma';
import { LogicOperator, ConditionOperator, EvaluationStrategy, AccessLevel } from '@prisma/client';

// Tipos para el contexto de evaluación
export interface EvaluationContext {
  // Usuario y sus propiedades
  user: {
    id: string;
    email: string;
    role: string;
    groups: string[];
    tags: string[];
    services: string[];
    status: 'active' | 'inactive' | 'suspended';
    deactivation_date?: Date;
    subscription_end_date?: Date;
    last_login?: Date;
  } | null;
  
  // Información temporal
  current_date: Date;
  current_time: string;
  current_day: string;
  
  // Información de request
  request: {
    ip: string;
    user_agent: string;
    geo: { country?: string; region?: string; city?: string };
  };
  
  // Información de servicio/recurso
  resource: {
    id: string;
    type: string;
    category?: string;
    edition?: string;
  };
}

// Tipos para resultados de evaluación
export interface ConditionResult {
  conditionId: string;
  fieldPath: string;
  operator: ConditionOperator;
  expectedValue: any;
  actualValue: any;
  result: boolean;
  reason: string;
}

export interface RuleResult {
  ruleId: string;
  ruleName: string;
  result: boolean;
  operator: LogicOperator;
  accessLevel?: AccessLevel;
  conditionResults: ConditionResult[];
  reason: string;
}

export interface GroupResult {
  groupId: string;
  groupName: string;
  result: boolean;
  operator: LogicOperator;
  ruleResults: RuleResult[];
  reason: string;
}

export interface AccessResult {
  allowed: boolean;
  accessLevel?: AccessLevel;
  reason: string;
  evaluationStrategy: EvaluationStrategy;
  mainOperator?: LogicOperator;
  groupResults: GroupResult[];
  evaluationTrace: string[];
  executionTimeMs: number;
}

// Cache para controles de acceso complejos (5 minutos)
const COMPLEX_ACCESS_CACHE = new Map<string, {
  data: any;
  timestamp: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export class ComplexRuleEvaluator {
  
  /**
   * Punto de entrada principal para evaluación de acceso complejo
   */
  async evaluateComplexAccess(resourceId: string, context: EvaluationContext): Promise<AccessResult | null> {
    const startTime = Date.now();
    const trace: string[] = [];
    
    try {
      trace.push(`🔍 Iniciando evaluación compleja para recurso: ${resourceId}`);
      
      // Buscar control de acceso con estrategia COMPLEX
      const accessControl = await this.getComplexAccessControl(resourceId);
      
      if (!accessControl) {
        trace.push(`❌ No se encontró control de acceso complejo para: ${resourceId}`);
        return null; // Fallback al sistema simple
      }
      
      if (accessControl.evaluationStrategy !== EvaluationStrategy.COMPLEX) {
        trace.push(`⚠️ Control encontrado pero usa estrategia ${accessControl.evaluationStrategy}, fallback al sistema simple`);
        return null;
      }
      
      trace.push(`✅ Control de acceso complejo encontrado con operador principal: ${accessControl.mainLogicOperator}`);
      
      // Evaluar grupos de reglas
      const groupResults = await Promise.all(
        accessControl.ruleGroups.map((group: any) => this.evaluateRuleGroup(group, context, trace))
      );
      
      // Aplicar operador principal entre grupos
      const finalResult = this.applyLogicOperator(
        groupResults.map(gr => gr.result), 
        accessControl.mainLogicOperator
      );
      
      // Determinar nivel de acceso
      const accessLevel = this.determineAccessLevel(groupResults);
      
      const executionTime = Date.now() - startTime;
      trace.push(`⏱️ Evaluación completada en ${executionTime}ms`);
      trace.push(`🎯 Resultado final: ${finalResult ? '✅ PERMITIDO' : '❌ DENEGADO'}`);
      
      return {
        allowed: finalResult,
        accessLevel,
        reason: this.generateReason(finalResult, groupResults, accessControl.mainLogicOperator),
        evaluationStrategy: EvaluationStrategy.COMPLEX,
        mainOperator: accessControl.mainLogicOperator,
        groupResults,
        evaluationTrace: trace,
        executionTimeMs: executionTime
      };
      
    } catch (error) {
      trace.push(`❌ Error durante evaluación: ${error}`);
      console.error('Error en evaluación compleja:', error);
      return null; // Fallback al sistema simple
    }
  }
  
  /**
   * Evalúa un grupo de reglas
   */
  private async evaluateRuleGroup(ruleGroup: any, context: EvaluationContext, trace: string[]): Promise<GroupResult> {
    trace.push(`📂 Evaluando grupo: "${ruleGroup.name}" (${ruleGroup.logicOperator})`);
    
    if (!ruleGroup.isEnabled) {
      trace.push(`⚠️ Grupo "${ruleGroup.name}" está deshabilitado`);
      return {
        groupId: ruleGroup.id,
        groupName: ruleGroup.name,
        result: false,
        operator: ruleGroup.logicOperator,
        ruleResults: [],
        reason: 'Grupo deshabilitado'
      };
    }
    
    // Evaluar reglas del grupo ordenadas por prioridad
    const sortedRules = ruleGroup.rules.sort((a: any, b: any) => a.priority - b.priority);
    
    const ruleResults = await Promise.all(
      sortedRules.map((rule: any) => this.evaluateComplexRule(rule, context, trace))
    );
    
    // Aplicar operador lógico del grupo
    const groupResult = this.applyLogicOperator(
      ruleResults.map(rr => rr.result),
      ruleGroup.logicOperator
    );
    
    trace.push(`📊 Grupo "${ruleGroup.name}": ${groupResult ? '✅ VERDADERO' : '❌ FALSO'}`);
    
    return {
      groupId: ruleGroup.id,
      groupName: ruleGroup.name,
      result: groupResult,
      operator: ruleGroup.logicOperator,
      ruleResults,
      reason: this.generateGroupReason(groupResult, ruleResults, ruleGroup.logicOperator)
    };
  }
  
  /**
   * Evalúa una regla compleja
   */
  private async evaluateComplexRule(rule: any, context: EvaluationContext, trace: string[]): Promise<RuleResult> {
    trace.push(`  🔧 Evaluando regla: "${rule.name}" (${rule.logicOperator})`);
    
    if (!rule.isEnabled) {
      trace.push(`  ⚠️ Regla "${rule.name}" está deshabilitada`);
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        result: false,
        operator: rule.logicOperator,
        conditionResults: [],
        reason: 'Regla deshabilitada'
      };
    }
    
    // Verificar timeRange individual de la regla
    const timeRangeResult = this.evaluateIndividualTimeRange(rule, context);
    if (!timeRangeResult.valid) {
      trace.push(`  ⏰ Regla "${rule.name}" falló verificación temporal: ${timeRangeResult.reason}`);
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        result: false,
        operator: rule.logicOperator,
        conditionResults: [],
        reason: `Restricción temporal: ${timeRangeResult.reason}`
      };
    }
    
    // Evaluar condiciones de la regla ordenadas por prioridad
    const sortedConditions = rule.conditions.sort((a: any, b: any) => a.priority - b.priority);
    
    const conditionResults = await Promise.all(
      sortedConditions.map((condition: any) => this.evaluateCondition(condition, context, trace))
    );
    
    // Aplicar operador lógico de la regla
    const ruleResult = this.applyLogicOperator(
      conditionResults.map(cr => cr.result),
      rule.logicOperator
    );
    
    trace.push(`    🎯 Regla "${rule.name}": ${ruleResult ? '✅ VERDADERO' : '❌ FALSO'}`);
    
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      result: ruleResult,
      operator: rule.logicOperator,
      accessLevel: rule.accessLevel,
      conditionResults,
      reason: this.generateRuleReason(ruleResult, conditionResults, rule.logicOperator)
    };
  }
  
  /**
   * Evalúa una condición individual
   */
  private async evaluateCondition(condition: any, context: EvaluationContext, trace: string[]): Promise<ConditionResult> {
    const { fieldPath, operator, value, isNegated } = condition;
    
    // Obtener valor del contexto usando path dinámico
    const actualValue = this.getFieldValue(context, fieldPath);
    
    // Aplicar operador
    let result = false;
    let reason = '';
    
    try {
      switch (operator) {
        case ConditionOperator.EQUALS:
          result = actualValue === value;
          reason = `${fieldPath} (${actualValue}) ${result ? '==' : '!='} ${value}`;
          break;
          
        case ConditionOperator.CONTAINS:
          result = Array.isArray(actualValue) && actualValue.includes(value);
          reason = `${fieldPath} ${result ? 'contiene' : 'no contiene'} ${value}`;
          break;
          
        case ConditionOperator.BETWEEN:
          result = this.isBetween(actualValue, value[0], value[1]);
          reason = `${fieldPath} (${actualValue}) ${result ? 'está entre' : 'no está entre'} ${value[0]} y ${value[1]}`;
          break;
          
        case ConditionOperator.WITHIN_LAST:
          result = this.isWithinLast(actualValue, value);
          reason = `${fieldPath} ${result ? 'está dentro de' : 'no está dentro de'} los últimos ${value}`;
          break;
          
        case ConditionOperator.GREATER_THAN:
          result = actualValue > value;
          reason = `${fieldPath} (${actualValue}) ${result ? '>' : '<='} ${value}`;
          break;
          
        case ConditionOperator.LESS_THAN:
          result = actualValue < value;
          reason = `${fieldPath} (${actualValue}) ${result ? '<' : '>='} ${value}`;
          break;
          
        case ConditionOperator.NOT_EQUALS:
          result = actualValue !== value;
          reason = `${fieldPath} (${actualValue}) ${result ? '!=' : '=='} ${value}`;
          break;
          
        case ConditionOperator.NOT_CONTAINS:
          result = !Array.isArray(actualValue) || !actualValue.includes(value);
          reason = `${fieldPath} ${result ? 'no contiene' : 'contiene'} ${value}`;
          break;
          
        default:
          throw new Error(`Operador no soportado: ${operator}`);
      }
      
      // Aplicar negación si está configurada
      if (isNegated) {
        result = !result;
        reason = `NOT (${reason})`;
      }
      
      trace.push(`      ⚖️ ${reason} → ${result ? '✅' : '❌'}`);
      
    } catch (error) {
      trace.push(`      ❌ Error evaluando condición: ${error}`);
      result = false;
      reason = `Error: ${error}`;
    }
    
    return {
      conditionId: condition.id,
      fieldPath,
      operator,
      expectedValue: value,
      actualValue,
      result,
      reason
    };
  }
  
  /**
   * Obtiene valor del contexto usando path dinámico
   */
  private getFieldValue(context: EvaluationContext, fieldPath: string): any {
    try {
      return fieldPath.split('.').reduce((obj, key) => {
        if (obj === null || obj === undefined) return undefined;
        return obj[key];
      }, context as any);
    } catch (error) {
      console.error(`Error accediendo a ${fieldPath}:`, error);
      return undefined;
    }
  }
  
  /**
   * Aplica operador lógico a array de resultados
   */
  private applyLogicOperator(results: boolean[], operator: LogicOperator): boolean {
    if (results.length === 0) return false;
    
    switch (operator) {
      case LogicOperator.AND:
        return results.every(r => r === true);
      case LogicOperator.OR:
        return results.some(r => r === true);
      default:
        throw new Error(`Operador lógico no soportado: ${operator}`);
    }
  }
  
  /**
   * Evalúa timeRange individual de una regla
   */
  private evaluateIndividualTimeRange(rule: any, context: EvaluationContext): { valid: boolean; reason?: string } {
    const now = context.current_date;
    
    // Verificar fechas
    if (rule.individualStartDate && now < new Date(rule.individualStartDate)) {
      return { 
        valid: false, 
        reason: `Regla activa desde ${new Date(rule.individualStartDate).toLocaleDateString()}` 
      };
    }
    
    if (rule.individualEndDate && now > new Date(rule.individualEndDate)) {
      return { 
        valid: false, 
        reason: `Regla expiró el ${new Date(rule.individualEndDate).toLocaleDateString()}` 
      };
    }
    
    // Verificar horarios
    if (rule.individualStartTime || rule.individualEndTime) {
      const currentTime = context.current_time;
      
      if (rule.individualStartTime && currentTime < rule.individualStartTime) {
        return { valid: false, reason: `Regla activa desde ${rule.individualStartTime}` };
      }
      
      if (rule.individualEndTime && currentTime > rule.individualEndTime) {
        return { valid: false, reason: `Regla activa hasta ${rule.individualEndTime}` };
      }
    }
    
    // Verificar días de la semana
    if (rule.individualDaysOfWeek && rule.individualDaysOfWeek.length > 0) {
      const currentDay = context.current_day;
      if (!rule.individualDaysOfWeek.includes(currentDay)) {
        return { 
          valid: false, 
          reason: `Regla activa solo: ${rule.individualDaysOfWeek.join(', ')}` 
        };
      }
    }
    
    return { valid: true };
  }
  
  /**
   * Obtiene control de acceso complejo desde DB o cache
   */
  private async getComplexAccessControl(resourceId: string) {
    const cacheKey = `complex:${resourceId}`;
    
    // Verificar cache
    const cached = COMPLEX_ACCESS_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    try {
      const accessControl = await prisma.accessControl.findFirst({
        where: {
          resourceType: 'PAGE',
          resourceId: resourceId,
          isEnabled: true,
          evaluationStrategy: EvaluationStrategy.COMPLEX
        },
        include: {
          ruleGroups: {
            include: {
              rules: {
                include: {
                  conditions: true
                },
                orderBy: { priority: 'asc' }
              }
            },
            orderBy: { priority: 'asc' }
          }
        }
      });
      
      // Guardar en cache
      if (accessControl) {
        COMPLEX_ACCESS_CACHE.set(cacheKey, {
          data: accessControl,
          timestamp: Date.now()
        });
      }
      
      return accessControl;
    } catch (error) {
      console.error('Error obteniendo control de acceso complejo:', error);
      return null;
    }
  }
  
  /**
   * Funciones auxiliares
   */
  private isBetween(value: any, start: any, end: any): boolean {
    if (value instanceof Date) {
      return value >= new Date(start) && value <= new Date(end);
    }
    return value >= start && value <= end;
  }
  
  private isWithinLast(date: any, period: string): boolean {
    if (!date) return false;
    
    const targetDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - targetDate.getTime();
    
    // Parsear período (ej: "365_days", "30_days", "24_hours")
    const [amount, unit] = period.split('_');
    const amountNum = parseInt(amount || '0');
    
    let periodMs = 0;
    switch (unit) {
      case 'days':
        periodMs = amountNum * 24 * 60 * 60 * 1000;
        break;
      case 'hours':
        periodMs = amountNum * 60 * 60 * 1000;
        break;
      case 'minutes':
        periodMs = amountNum * 60 * 1000;
        break;
      default:
        return false;
    }
    
    return diffMs <= periodMs;
  }
  
  private determineAccessLevel(groupResults: GroupResult[]): AccessLevel | undefined {
    // Encuentra el nivel de acceso más alto de las reglas que fueron verdaderas
    const validResults = groupResults
      .flatMap(gr => gr.ruleResults)
      .filter(rr => rr.result && rr.accessLevel);
      
    if (validResults.length === 0) return undefined;
    
    // Jerarquía de niveles de acceso
    const hierarchy = [AccessLevel.READ, AccessLevel.WRITE, AccessLevel.CREATE, AccessLevel.UPDATE, AccessLevel.DELETE, AccessLevel.MANAGE, AccessLevel.CONFIGURE, AccessLevel.FULL];
    
    const maxLevel = validResults.reduce((max: AccessLevel, result: RuleResult) => {
      const currentIndex = hierarchy.indexOf(result.accessLevel! as any);
      const maxIndex = hierarchy.indexOf(max as any);
      return currentIndex > maxIndex ? result.accessLevel! : max;
    }, AccessLevel.READ);
    
    return maxLevel;
  }
  
  private generateReason(finalResult: boolean, groupResults: GroupResult[], mainOperator: LogicOperator): string {
    if (finalResult) {
      const trueGroups = groupResults.filter(gr => gr.result);
      return `Acceso permitido: ${trueGroups.map(gr => gr.groupName).join(mainOperator === LogicOperator.OR ? ' O ' : ' Y ')}`;
    } else {
      return `Acceso denegado: Ningún grupo de reglas cumple los criterios`;
    }
  }
  
  private generateGroupReason(result: boolean, ruleResults: RuleResult[], operator: LogicOperator): string {
    if (result) {
      const trueRules = ruleResults.filter(rr => rr.result);
      return `Grupo verdadero: ${trueRules.map(rr => rr.ruleName).join(operator === LogicOperator.OR ? ' O ' : ' Y ')}`;
    } else {
      return `Grupo falso: No se cumplieron las reglas requeridas`;
    }
  }
  
  private generateRuleReason(result: boolean, conditionResults: ConditionResult[], operator: LogicOperator): string {
    if (result) {
      const trueConditions = conditionResults.filter(cr => cr.result);
      return `Regla verdadera: ${trueConditions.length} condiciones cumplidas`;
    } else {
      return `Regla falsa: Condiciones no cumplidas`;
    }
  }
}

// Función de conveniencia para usar en el sistema principal
export async function evaluateComplexAccess(
  resourceId: string, 
  context: EvaluationContext
): Promise<AccessResult | null> {
  const evaluator = new ComplexRuleEvaluator();
  return await evaluator.evaluateComplexAccess(resourceId, context);
}

// Limpiar cache
export function clearComplexAccessCache(resourceId?: string) {
  if (resourceId) {
    COMPLEX_ACCESS_CACHE.delete(`complex:${resourceId}`);
  } else {
    COMPLEX_ACCESS_CACHE.clear();
  }
}