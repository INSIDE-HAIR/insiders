export const dynamic = "force-dynamic"; // Forzar que esta ruta sea dinámica, necesaria porque las rutas en Next.js son estáticas por defecto.

import { NextRequest, NextResponse } from "next/server"; // Importa los tipos necesarios para manejar las solicitudes y respuestas HTTP en Next.js.
import { PrismaClient } from "@prisma/client"; // Importa PrismaClient, que se utiliza para interactuar con la base de datos.
import { getListHoldedContacts } from "@/src/lib/actions/vendors/holded/contacts"; // Función para obtener la lista de contactos desde Holded.
import moment from "moment-timezone"; // Importa Moment.js con soporte para zonas horarias.

const prisma = new PrismaClient(); // Crea una instancia de PrismaClient para interactuar con la base de datos.
const MADRID_TIMEZONE = "Europe/Madrid"; // Define la zona horaria de Madrid para manejar fechas y horas.

export async function GET(request: NextRequest) {
  try {
    const contactsData = await getListHoldedContacts(); // Obtiene los datos de contactos desde Holded.
    const now = moment().tz(MADRID_TIMEZONE); // Obtiene la hora actual en la zona horaria de Madrid.

    // Crear un nuevo backup diario
    const newBackup = await prisma.contactBackup.create({
      data: {
        data: contactsData, // Almacena los datos de los contactos.
        isDaily: true, // Marca este backup como un backup diario.
        expiresAt: now.clone().add(31, "days").toDate(), // Establece la fecha de expiración a 31 días desde la creación.
        createdAt: now.toDate(), // Fecha y hora de creación.
        updatedAt: now.toDate(), // Fecha y hora de última actualización.
      },
    });

    // Verifica si existe un backup actual (el más reciente) y lo marca como "current" si es necesario
    const existingCurrentBackup = await prisma.contactBackup.findFirst({
      where: { isDaily: true }, // Filtra solo los backups diarios.
      orderBy: { createdAt: "desc" }, // Ordena por la fecha de creación de forma descendente, obteniendo el más reciente.
    });

    if (
      !existingCurrentBackup || // Si no existe un backup actual, o
      moment(existingCurrentBackup.createdAt).isBefore(now, "day") // Si el backup actual es de un día anterior,
    ) {
      // Marca el nuevo backup como el "current"
      await prisma.contactBackup.update({
        where: { id: newBackup.id },
        data: {
          isCurrent: true, // Marca este backup como el "current".
        },
      });

      // Si existe un backup actual anterior, lo desmarca como "current"
      if (existingCurrentBackup && existingCurrentBackup.id !== newBackup.id) {
        await prisma.contactBackup.update({
          where: { id: existingCurrentBackup.id },
          data: {
            isCurrent: false, // Desmarca el backup anterior como "current".
          },
        });
      }
    }

    // Limpieza de backups antiguos: mantener solo los 31 más recientes
    const dailyBackupsCount = await prisma.contactBackup.count({
      where: { isDaily: true }, // Cuenta solo los backups diarios.
    });
    if (dailyBackupsCount > 31) {
      const backupsToDelete = await prisma.contactBackup.findMany({
        where: {
          isDaily: true,
          isFavorite: false, // Excluye los backups marcados como favoritos.
          isCurrent: false, // Excluye el backup marcado como "current".
        },
        orderBy: { createdAt: "asc" }, // Ordena los backups por fecha de creación ascendente (los más antiguos primero).
        take: dailyBackupsCount - 31, // Calcula cuántos backups deben ser eliminados para mantener solo los 31 más recientes.
      });

      // Elimina los backups que ya no se necesitan
      const deletePromises = backupsToDelete.map((backup) =>
        prisma.contactBackup.delete({
          where: { id: backup.id }, // Elimina el backup usando su ID.
        })
      );

      await Promise.all(deletePromises); // Ejecuta todas las eliminaciones en paralelo.
    }

    return NextResponse.json(newBackup); // Devuelve el nuevo backup creado en formato JSON.
  } catch (error) {
    console.error("Error creating daily backup:", error); // Registra cualquier error que ocurra durante el proceso.
    return NextResponse.json(
      { error: "Failed to create daily backup" }, // Devuelve un mensaje de error si algo falla.
      { status: 500 } // Establece el código de estado HTTP a 500 (Internal Server Error).
    );
  }
}
