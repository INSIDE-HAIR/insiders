import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/config/auth/auth';
import { evaluateComplexAccess, EvaluationContext } from '@/src/lib/rule-engine/complex-rule-evaluator';
import { z } from 'zod';

// Schema para testing de reglas complejas
const TestEvaluationSchema = z.object({
  resourceId: z.string().min(1, 'Resource ID es requerido'),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    role: z.string(),
    groups: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    services: z.array(z.string()).default([]),
    status: z.enum(['active', 'inactive', 'suspended']).default('active'),
    deactivation_date: z.string().datetime().optional(),
    subscription_end_date: z.string().datetime().optional(),
    last_login: z.string().datetime().optional(),
  }).optional(),
  simulatedDate: z.string().datetime().optional(),
  simulatedTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  request: z.object({
    ip: z.string().default('127.0.0.1'),
    user_agent: z.string().default('Mozilla/5.0'),
    geo: z.object({
      country: z.string().optional(),
      region: z.string().optional(),
      city: z.string().optional(),
    }).default({}),
  }).default({}),
});

// POST - Probar evaluación de reglas complejas
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado - Se requiere rol ADMIN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = TestEvaluationSchema.parse(body);

    // Crear contexto de evaluación basado en datos de prueba
    const simulatedDate = validatedData.simulatedDate ? new Date(validatedData.simulatedDate) : new Date();
    const simulatedTime = validatedData.simulatedTime || simulatedDate.toTimeString().slice(0, 5);
    const simulatedDay = simulatedDate.toLocaleDateString('en-US', { weekday: 'long' });

    const context: EvaluationContext = {
      user: validatedData.user ? {
        id: validatedData.user.id,
        email: validatedData.user.email,
        role: validatedData.user.role,
        groups: validatedData.user.groups,
        tags: validatedData.user.tags,
        services: validatedData.user.services,
        status: validatedData.user.status,
        deactivation_date: validatedData.user.deactivation_date ? new Date(validatedData.user.deactivation_date) : undefined,
        subscription_end_date: validatedData.user.subscription_end_date ? new Date(validatedData.user.subscription_end_date) : undefined,
        last_login: validatedData.user.last_login ? new Date(validatedData.user.last_login) : undefined,
      } : null,
      current_date: simulatedDate,
      current_time: simulatedTime,
      current_day: simulatedDay,
      request: validatedData.request,
      resource: {
        id: validatedData.resourceId,
        type: 'page',
      },
    };

    // Evaluar usando el motor complejo
    const result = await evaluateComplexAccess(validatedData.resourceId, context);

    if (!result) {
      return NextResponse.json({
        success: true,
        message: 'No se encontró control de acceso complejo para este recurso',
        result: null,
        fallbackToSimple: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Evaluación completada exitosamente',
      result: {
        allowed: result.allowed,
        accessLevel: result.accessLevel,
        reason: result.reason,
        evaluationStrategy: result.evaluationStrategy,
        mainOperator: result.mainOperator,
        executionTimeMs: result.executionTimeMs,
        groupResults: result.groupResults.map(gr => ({
          groupId: gr.groupId,
          groupName: gr.groupName,
          result: gr.result,
          operator: gr.operator,
          reason: gr.reason,
          ruleResults: gr.ruleResults.map(rr => ({
            ruleId: rr.ruleId,
            ruleName: rr.ruleName,
            result: rr.result,
            operator: rr.operator,
            accessLevel: rr.accessLevel,
            reason: rr.reason,
            conditionResults: rr.conditionResults.map(cr => ({
              conditionId: cr.conditionId,
              fieldPath: cr.fieldPath,
              operator: cr.operator,
              expectedValue: cr.expectedValue,
              actualValue: cr.actualValue,
              result: cr.result,
              reason: cr.reason,
            })),
          })),
        })),
        evaluationTrace: result.evaluationTrace,
      },
      context: {
        user: context.user,
        current_date: context.current_date,
        current_time: context.current_time,
        current_day: context.current_day,
        request: context.request,
        resource: context.resource,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Datos de entrada inválidos',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    console.error('Error en testing de evaluación compleja:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET - Obtener casos de prueba predefinidos
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado - Se requiere rol ADMIN' },
        { status: 403 }
      );
    }

    // Casos de prueba predefinidos
    const testCases = [
      {
        name: "Estudiante Edición Enero - Activa",
        description: "Usuario inscrito en edición enero durante período activo",
        resourceId: "marketing_digital_avanzado",
        user: {
          id: "user1",
          email: "juan.perez@empresa.com",
          role: "CLIENT",
          groups: ["marketing_digital_enero_2025"],
          tags: [],
          services: [],
          status: "active" as const,
        },
        simulatedDate: "2025-02-01T10:00:00Z",
        simulatedTime: "10:00",
        request: {
          ip: "192.168.1.100",
          user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          geo: {
            country: "Spain",
            region: "Madrid",
            city: "Madrid",
          },
        },
      },
      {
        name: "Estudiante Edición Enero - Expirada",
        description: "Usuario inscrito en edición enero después de fecha límite",
        resourceId: "marketing_digital_avanzado",
        user: {
          id: "user1",
          email: "juan.perez@empresa.com",
          role: "CLIENT",
          groups: ["marketing_digital_enero_2025"],
          tags: [],
          services: [],
          status: "active" as const,
        },
        simulatedDate: "2025-04-01T10:00:00Z",
        simulatedTime: "10:00",
        request: {
          ip: "192.168.1.100",
          user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          geo: {
            country: "Spain",
          },
        },
      },
      {
        name: "Cliente Premium Activo",
        description: "Usuario con servicio premium activo",
        resourceId: "marketing_digital_avanzado",
        user: {
          id: "user2",
          email: "maria.lopez@startup.com",
          role: "CLIENT",
          groups: [],
          tags: ["premium"],
          services: ["marketing_digital_premium"],
          status: "active" as const,
        },
        simulatedDate: "2025-03-01T15:30:00Z",
        simulatedTime: "15:30",
        request: {
          ip: "81.45.123.45",
          user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          geo: {
            country: "Spain",
            region: "Catalonia",
            city: "Barcelona",
          },
        },
      },
      {
        name: "Cliente Premium Inactivo - Período Gracia",
        description: "Usuario con servicio premium dado de baja hace 6 meses (dentro del año de gracia)",
        resourceId: "marketing_digital_avanzado",
        user: {
          id: "user3",
          email: "carlos.ruiz@empresa.com",
          role: "CLIENT",
          groups: [],
          tags: [],
          services: ["marketing_digital_premium"],
          status: "inactive" as const,
          deactivation_date: "2024-08-01T00:00:00Z", // 6 meses atrás
        },
        simulatedDate: "2025-02-01T12:00:00Z",
        simulatedTime: "12:00",
        request: {
          ip: "95.123.45.67",
          user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          geo: {
            country: "Spain",
          },
        },
      },
      {
        name: "Administrador - Acceso Completo",
        description: "Usuario administrador con acceso total",
        resourceId: "marketing_digital_avanzado",
        user: {
          id: "admin1",
          email: "admin@insidesalons.com",
          role: "ADMIN",
          groups: ["admin"],
          tags: ["admin"],
          services: [],
          status: "active" as const,
        },
        simulatedDate: "2025-02-01T09:00:00Z",
        simulatedTime: "09:00",
        request: {
          ip: "192.168.1.10",
          user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          geo: {
            country: "Spain",
          },
        },
      },
      {
        name: "Usuario Sin Acceso",
        description: "Usuario normal sin permisos específicos",
        resourceId: "marketing_digital_avanzado",
        user: {
          id: "user4",
          email: "random@email.com",
          role: "CLIENT",
          groups: [],
          tags: [],
          services: [],
          status: "active" as const,
        },
        simulatedDate: "2025-02-01T14:00:00Z",
        simulatedTime: "14:00",
        request: {
          ip: "203.45.67.89",
          user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
          geo: {
            country: "France",
          },
        },
      },
    ];

    return NextResponse.json({
      success: true,
      message: 'Casos de prueba predefinidos obtenidos',
      testCases,
    });

  } catch (error) {
    console.error('Error obteniendo casos de prueba:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}