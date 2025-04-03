import { notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/src/config/auth/auth";
import DriveExplorer from "@/src/components/DriveExplorer";

interface RoutePageProps {
  params: {
    lang: string;
    routeType: string;
    routeSubtype: string;
  };
}

export default async function RoutePage({ params }: RoutePageProps) {
  const { routeType, routeSubtype } = params;
  const prisma = new PrismaClient();

  // Verificar si tenemos una sesión válida
  const session = await auth();

  // Verificar si la ruta existe en la base de datos
  const routeMapping = await prisma.driveRootMapping.findUnique({
    where: {
      routeType_routeSubtype: {
        routeType,
        routeSubtype,
      },
    },
  });

  await prisma.$disconnect();

  // Si la ruta no existe, mostrar 404
  if (!routeMapping) {
    notFound();
  }

  // Si la ruta no está activa, mostrar 404 (opcional, puede ser útil para deshabilitar rutas temporalmente)
  if (!routeMapping.isActive) {
    notFound();
  }

  return (
    <main className='flex flex-col min-h-screen'>
      <div className='flex-grow'>
        <DriveExplorer
          routeType={routeType}
          routeSubtype={routeSubtype}
          initialMaxDepth={routeMapping.defaultDepth || 3}
        />
      </div>
    </main>
  );
}
