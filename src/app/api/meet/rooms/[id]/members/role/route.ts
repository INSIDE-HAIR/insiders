import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";
import { MeetStorageService } from "@/src/features/meet/services/MeetStorageService";
import { MeetMembersService } from "@/src/features/meet/services/MeetMembersService";
import { z } from "zod";

// Schema para cambiar rol de miembro
const changeRoleSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: z.enum(["ROLE_UNSPECIFIED", "COHOST"])
});

/**
 * PATCH /api/meet/rooms/[id]/members/role
 * Cambia el rol de un miembro existente en el espacio
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let storageService: MeetStorageService | null = null;
  
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar permisos de admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { id: spaceId } = await params;
    if (!spaceId) {
      return NextResponse.json({ error: "Space ID is required" }, { status: 400 });
    }

    // Parsear y validar body
    const body = await request.json();
    const validationResult = changeRoleSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid role change data", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { email, role } = validationResult.data;

    // Verificar que el space esté registrado localmente
    storageService = new MeetStorageService();
    const isRegistered = await storageService.isSpaceRegistered(spaceId);
    
    if (!isRegistered) {
      return NextResponse.json({ 
        error: "Space not found", 
        details: "Space no encontrado en registro local" 
      }, { status: 404 });
    }
    
    // Inicializar servicios de API
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();
    const membersService = new MeetMembersService(calendarService.auth);

    console.log(`🔄 Changing role for ${email} in space ${spaceId} to ${role}`);

    // 1. BUSCAR MIEMBRO POR EMAIL
    const targetMember = await membersService.findMemberByEmail(spaceId, email);

    if (!targetMember) {
      return NextResponse.json({ 
        error: "Member not found in space",
        details: `No member with email ${email} found in space ${spaceId}`
      }, { status: 404 });
    }

    // 2. VERIFICAR SI YA TIENE EL ROL DESEADO
    if (targetMember.role === role) {
      return NextResponse.json({
        message: "Member already has the requested role",
        memberEmail: email,
        currentRole: role,
        spaceId: spaceId,
        changed: false,
        source: "no-change-needed"
      });
    }

    // 3. EXTRAER MEMBER ID
    const memberId = membersService.extractMemberId(targetMember.name);
    if (!memberId) {
      return NextResponse.json({ 
        error: "Invalid member ID",
        details: "Could not extract member ID from member data"
      }, { status: 400 });
    }

    // 4. ACTUALIZAR ROL VIA API
    const updatedMember = await membersService.updateMemberRole(spaceId, memberId, role);

    // Log de la operación
    await storageService.logOperation(
      'change_member_role',
      spaceId,
      true,
      200,
      `${email}: ${targetMember.role} -> ${role}`,
      session.user.id
    );

    console.log(`✅ Role changed: ${email} from ${targetMember.role} to ${role} in space ${spaceId}`);

    return NextResponse.json({ 
      message: "Member role updated successfully",
      memberEmail: email,
      previousRole: targetMember.role,
      newRole: role,
      memberId: memberId,
      spaceId: spaceId,
      changed: true,
      updatedMember: updatedMember,
      source: "fresh-meet-api-v2beta",
      note: "Rol actualizado directamente via Google Meet API v2beta",
      _metadata: {
        apiSuccess: true,
        localStorage: false
      }
    });

  } catch (error: any) {
    console.error("Failed to change Meet space member role:", error);
    
    // Detectar si es limitación de Developer Preview
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isPreviewLimitation = errorMessage.includes('Developer Preview access') || 
                               errorMessage.includes('updateMemberRole') ||
                               errorMessage.includes('permission denied');
    
    return NextResponse.json(
      { 
        error: isPreviewLimitation 
          ? "Google Meet API v2beta Member role updates require Developer Preview access"
          : (error.message || "Error changing Meet space member role"),
        details: error.stack,
        source: "error",
        previewRequired: isPreviewLimitation,
        previewLink: isPreviewLimitation ? "https://developers.google.com/workspace/preview" : undefined,
        note: isPreviewLimitation 
          ? "Endpoints de member role updates requieren inscripción en programa de preview"
          : undefined
      },
      { status: isPreviewLimitation ? 202 : 500 }
    );
  } finally {
    if (storageService) {
      await storageService.disconnect();
    }
  }
}