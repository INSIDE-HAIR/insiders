import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/src/lib/prisma";
import { z } from "zod";
import {
  ResourceType,
  EvaluationStrategy,
  LogicOperator,
  ConditionOperator,
  AccessLevel,
} from "@prisma/client";

// Schema de validación para reglas complejas
const ComplexRuleConditionSchema = z.object({
  fieldPath: z.string().min(1, "Field path es requerido"),
  operator: z.nativeEnum(ConditionOperator),
  value: z.any(), // JSON flexible
  isNegated: z.boolean().default(false),
  priority: z.number().default(0),
});

const ComplexRuleSchema = z.object({
  name: z.string().min(1, "Nombre de regla es requerido"),
  description: z.string().optional(),
  logicOperator: z.nativeEnum(LogicOperator).default(LogicOperator.AND),
  accessLevel: z.nativeEnum(AccessLevel).default(AccessLevel.READ),
  priority: z.number().default(0),
  isEnabled: z.boolean().default(true),
  individualStartDate: z.string().datetime().optional(),
  individualEndDate: z.string().datetime().optional(),
  individualStartTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  individualEndTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  individualDaysOfWeek: z.array(z.string()).default([]),
  conditions: z.array(ComplexRuleConditionSchema).default([]),
});

const RuleGroupSchema = z.object({
  name: z.string().min(1, "Nombre de grupo es requerido"),
  description: z.string().optional(),
  logicOperator: z.nativeEnum(LogicOperator).default(LogicOperator.AND),
  priority: z.number().default(0),
  isEnabled: z.boolean().default(true),
  rules: z.array(ComplexRuleSchema).default([]),
});

const ComplexAccessControlSchema = z.object({
  resourceType: z.nativeEnum(ResourceType),
  resourceId: z.string().min(1, "Resource ID es requerido"),
  isEnabled: z.boolean().default(true),
  evaluationStrategy: z
    .nativeEnum(EvaluationStrategy)
    .default(EvaluationStrategy.COMPLEX),
  mainLogicOperator: z.nativeEnum(LogicOperator).default(LogicOperator.OR),
  maxConcurrentUsers: z.number().min(0).optional(),
  maxAccessCount: z.number().min(0).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  daysOfWeek: z.array(z.string()).default([]),
  requiredAuthMethods: z.array(z.string()).default([]),
  ruleGroups: z.array(RuleGroupSchema).default([]),
});

const updateComplexAccessControlSchema = ComplexAccessControlSchema.partial();

// Helper function to check admin authentication
async function checkAdminAuth(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return {
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  const userRole = (token.role as string) || "user";
  if (userRole !== "admin" && userRole !== "super-admin") {
    return {
      error: NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      ),
    };
  }

  return { user: { id: token.sub, email: token.email, role: userRole } };
}

// GET - Listar controles de acceso complejos
export async function GET(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth(request);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const resourceType = searchParams.get("resourceType");
    const search = searchParams.get("search");

    // Construir filtros
    const where: any = {
      evaluationStrategy: EvaluationStrategy.COMPLEX,
    };

    if (resourceType) {
      where.resourceType = resourceType;
    }

    if (search) {
      where.OR = [
        { resourceId: { contains: search, mode: "insensitive" } },
        {
          ruleGroups: {
            some: { name: { contains: search, mode: "insensitive" } },
          },
        },
      ];
    }

    // Obtener controles de acceso complejos con paginación
    const [complexControls, totalCount] = await Promise.all([
      prisma.accessControl.findMany({
        where,
        include: {
          ruleGroups: {
            include: {
              rules: {
                include: {
                  conditions: true,
                },
                orderBy: { priority: "asc" },
              },
            },
            orderBy: { priority: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.accessControl.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      complexControls,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error obteniendo controles de acceso complejos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo control de acceso complejo
export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth(request);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const validatedData = ComplexAccessControlSchema.parse(body);

    // Verificar si ya existe un control para este recurso
    const existingControl = await prisma.accessControl.findFirst({
      where: {
        resourceType: validatedData.resourceType,
        resourceId: validatedData.resourceId,
      },
    });

    if (existingControl) {
      return NextResponse.json(
        { error: "Ya existe un control de acceso para este recurso" },
        { status: 409 }
      );
    }

    // Crear el control de acceso complejo con transacción
    const complexControl = await prisma.$transaction(async (tx) => {
      // Crear control principal
      const control = await tx.accessControl.create({
        data: {
          resourceType: validatedData.resourceType,
          resourceId: validatedData.resourceId,
          isEnabled: validatedData.isEnabled,
          evaluationStrategy: EvaluationStrategy.COMPLEX,
          mainLogicOperator: validatedData.mainLogicOperator,
          maxConcurrentUsers: validatedData.maxConcurrentUsers,
          maxAccessCount: validatedData.maxAccessCount,
          startDate: validatedData.startDate
            ? new Date(validatedData.startDate)
            : null,
          endDate: validatedData.endDate
            ? new Date(validatedData.endDate)
            : null,
          startTime: validatedData.startTime,
          endTime: validatedData.endTime,
          daysOfWeek: validatedData.daysOfWeek,
          requiredAuthMethods: validatedData.requiredAuthMethods,
        },
      });

      // Crear grupos de reglas
      for (const groupData of validatedData.ruleGroups) {
        const group = await tx.ruleGroup.create({
          data: {
            accessControlId: control.id,
            name: groupData.name,
            description: groupData.description,
            logicOperator: groupData.logicOperator,
            priority: groupData.priority,
            isEnabled: groupData.isEnabled,
          },
        });

        // Crear reglas del grupo
        for (const ruleData of groupData.rules) {
          const rule = await tx.complexRule.create({
            data: {
              ruleGroupId: group.id,
              name: ruleData.name,
              description: ruleData.description,
              logicOperator: ruleData.logicOperator,
              accessLevel: ruleData.accessLevel,
              priority: ruleData.priority,
              isEnabled: ruleData.isEnabled,
              individualStartDate: ruleData.individualStartDate
                ? new Date(ruleData.individualStartDate)
                : null,
              individualEndDate: ruleData.individualEndDate
                ? new Date(ruleData.individualEndDate)
                : null,
              individualStartTime: ruleData.individualStartTime,
              individualEndTime: ruleData.individualEndTime,
              individualDaysOfWeek: ruleData.individualDaysOfWeek,
            },
          });

          // Crear condiciones de la regla
          for (const conditionData of ruleData.conditions) {
            await tx.ruleCondition.create({
              data: {
                ruleId: rule.id,
                fieldPath: conditionData.fieldPath,
                operator: conditionData.operator,
                value: conditionData.value,
                isNegated: conditionData.isNegated,
                priority: conditionData.priority,
              },
            });
          }
        }
      }

      return control;
    });

    // Obtener el control completo con todas las relaciones
    const fullControl = await prisma.accessControl.findUnique({
      where: { id: complexControl.id },
      include: {
        ruleGroups: {
          include: {
            rules: {
              include: {
                conditions: true,
              },
              orderBy: { priority: "asc" },
            },
          },
          orderBy: { priority: "asc" },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Control de acceso complejo creado exitosamente",
        complexControl: fullControl,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Datos de entrada inválidos",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Error creando control de acceso complejo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar control de acceso complejo
export async function PUT(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth(request);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID del control es requerido" },
        { status: 400 }
      );
    }

    const validatedData = updateComplexAccessControlSchema.parse(updateData);

    // Verificar que el control existe
    const existingControl = await prisma.accessControl.findUnique({
      where: { id },
      include: {
        ruleGroups: {
          include: {
            rules: {
              include: {
                conditions: true,
              },
            },
          },
        },
      },
    });

    if (!existingControl) {
      return NextResponse.json(
        { error: "Control de acceso no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar usando transacción completa
    const updatedControl = await prisma.$transaction(async (tx) => {
      // Actualizar control principal
      const control = await tx.accessControl.update({
        where: { id },
        data: {
          resourceType: validatedData.resourceType,
          resourceId: validatedData.resourceId,
          isEnabled: validatedData.isEnabled,
          mainLogicOperator: validatedData.mainLogicOperator,
          maxConcurrentUsers: validatedData.maxConcurrentUsers,
          maxAccessCount: validatedData.maxAccessCount,
          startDate: validatedData.startDate
            ? new Date(validatedData.startDate)
            : null,
          endDate: validatedData.endDate
            ? new Date(validatedData.endDate)
            : null,
          startTime: validatedData.startTime,
          endTime: validatedData.endTime,
          daysOfWeek: validatedData.daysOfWeek,
          requiredAuthMethods: validatedData.requiredAuthMethods,
        },
      });

      // Eliminar grupos de reglas existentes (cascade elimina reglas y condiciones)
      await tx.ruleGroup.deleteMany({
        where: { accessControlId: id },
      });

      // Crear nuevos grupos de reglas si se proporcionan
      if (validatedData.ruleGroups) {
        for (const groupData of validatedData.ruleGroups) {
          const group = await tx.ruleGroup.create({
            data: {
              accessControlId: control.id,
              name: groupData.name,
              description: groupData.description,
              logicOperator: groupData.logicOperator,
              priority: groupData.priority,
              isEnabled: groupData.isEnabled,
            },
          });

          // Crear reglas del grupo
          for (const ruleData of groupData.rules) {
            const rule = await tx.complexRule.create({
              data: {
                ruleGroupId: group.id,
                name: ruleData.name,
                description: ruleData.description,
                logicOperator: ruleData.logicOperator,
                accessLevel: ruleData.accessLevel,
                priority: ruleData.priority,
                isEnabled: ruleData.isEnabled,
                individualStartDate: ruleData.individualStartDate
                  ? new Date(ruleData.individualStartDate)
                  : null,
                individualEndDate: ruleData.individualEndDate
                  ? new Date(ruleData.individualEndDate)
                  : null,
                individualStartTime: ruleData.individualStartTime,
                individualEndTime: ruleData.individualEndTime,
                individualDaysOfWeek: ruleData.individualDaysOfWeek,
              },
            });

            // Crear condiciones de la regla
            for (const conditionData of ruleData.conditions) {
              await tx.ruleCondition.create({
                data: {
                  ruleId: rule.id,
                  fieldPath: conditionData.fieldPath,
                  operator: conditionData.operator,
                  value: conditionData.value,
                  isNegated: conditionData.isNegated,
                  priority: conditionData.priority,
                },
              });
            }
          }
        }
      }

      return control;
    });

    // Obtener el control actualizado con todas las relaciones
    const fullControl = await prisma.accessControl.findUnique({
      where: { id },
      include: {
        ruleGroups: {
          include: {
            rules: {
              include: {
                conditions: true,
              },
              orderBy: { priority: "asc" },
            },
          },
          orderBy: { priority: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Control de acceso complejo actualizado exitosamente",
      complexControl: fullControl,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Datos de entrada inválidos",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Error actualizando control de acceso complejo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar control de acceso complejo
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth(request);
    if (authResult.error) return authResult.error;

    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "IDs requeridos para eliminación" },
        { status: 400 }
      );
    }

    // Eliminar controles complejos (cascade elimina grupos, reglas y condiciones)
    const deletedCount = await prisma.accessControl.deleteMany({
      where: {
        id: { in: ids },
        evaluationStrategy: EvaluationStrategy.COMPLEX,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${deletedCount.count} controles de acceso complejos eliminados`,
      deletedCount: deletedCount.count,
    });
  } catch (error) {
    console.error("Error eliminando controles de acceso complejos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
