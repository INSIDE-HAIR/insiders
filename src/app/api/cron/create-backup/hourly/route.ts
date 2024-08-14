export const dynamic = "force-dynamic"; // Forzar que esta ruta sea dinámica. Esto es importante porque las rutas en Next.js son estáticas por defecto, pero en este caso necesitamos que se ejecute en tiempo real, por lo que forzamos el comportamiento dinámico.

import { NextRequest, NextResponse } from "next/server"; // Importa los tipos de Next.js necesarios para manejar solicitudes y respuestas HTTP.
import { PrismaClient } from "@prisma/client"; // Importa PrismaClient, que se utiliza para interactuar con la base de datos.
import { getListHoldedContacts } from "@/src/lib/actions/vendors/holded/contacts"; // Importa la función que obtiene la lista de contactos de Holded.
import moment from "moment-timezone"; // Importa Moment.js con soporte para zonas horarias, utilizado para manejar fechas y horas.

const prisma = new PrismaClient(); // Crea una instancia de PrismaClient para interactuar con la base de datos.
const MADRID_TIMEZONE = "Europe/Madrid"; // Define la zona horaria de Madrid, que se usará para ajustar las fechas y horas.

export async function GET(request: NextRequest) { // Define una función asíncrona para manejar las solicitudes GET.
  try {
    const contactsData = await getListHoldedContacts(); // Obtiene los datos de los contactos desde Holded.
    const now = moment().tz(MADRID_TIMEZONE); // Obtiene la hora actual en la zona horaria de Madrid.

    const newBackup = await prisma.contactBackup.create({ // Crea un nuevo registro de backup en la base de datos utilizando Prisma.
      data: {
        data: contactsData, // Guarda los datos de los contactos en el backup.
        isDaily: false, // Indica que este no es un backup diario (es horario).
        expiresAt: now.clone().add(24, "hours").toDate(), // Establece la fecha de expiración del backup a 24 horas desde el momento actual.
        createdAt: now.toDate(), // Establece la fecha de creación del backup.
        updatedAt: now.toDate(), // Establece la fecha de última actualización del backup.
      },
    });

    // Limpiar los backups horarios antiguos (mantener solo las últimas 24 horas)
    const hourlyBackups = await prisma.contactBackup.findMany({
      where: { isDaily: false }, // Filtra los backups que no son diarios (es decir, los horarios).
      orderBy: { createdAt: "desc" }, // Ordena los backups desde el más reciente al más antiguo.
    });

    const oldestAllowedBackup = moment().subtract(24, "hours").toDate(); // Calcula la fecha y hora límite (24 horas atrás) para determinar qué backups deben ser eliminados.
    for (const backup of hourlyBackups) { // Recorre la lista de backups horarios.
      if (backup.createdAt < oldestAllowedBackup) { // Si el backup fue creado hace más de 24 horas...
        await prisma.contactBackup.delete({ // ...elimínalo de la base de datos.
          where: { id: backup.id }, // Utiliza el ID del backup para borrarlo.
        });
      }
    }

    return NextResponse.json(newBackup); // Devuelve una respuesta con el nuevo backup creado en formato JSON.
  } catch (error) {
    console.error("Error creating hourly backup:", error); // Si ocurre un error, se registra en la consola.
    return NextResponse.json(
      { error: "Failed to create hourly backup" }, // Devuelve una respuesta de error en formato JSON.
      { status: 500 } // Establece el código de estado HTTP a 500 (Internal Server Error).
    );
  }
}
