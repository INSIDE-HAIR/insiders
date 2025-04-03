import { notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/src/config/auth/auth";
import DriveExplorer from "@/src/components/DriveExplorer";

interface RoutePageProps {
  params: {
    lang: string;
    path: string[];
  };
}

export default async function DrivePage({ params }: RoutePageProps) {
  const { lang, path } = params;

  // Verificar que tenemos al menos un segmento de ruta
  if (!path || path.length === 0) {
    notFound();
  }

  // Determinar si es una ruta de carpeta específica
  let folderId: string | null = null;
  let routePath = [...path];

  // Verificar si la ruta incluye 'folders' seguido de un ID
  const folderIndex = path.indexOf("folders");
  if (folderIndex !== -1 && folderIndex < path.length - 1) {
    folderId = path[folderIndex + 1];
    // Extraer la ruta principal (sin folders/id)
    routePath = path.slice(0, folderIndex);
  }

  // Mapear los segmentos de la ruta a niveles
  const routeLevels: Record<string, string> = {};
  for (let i = 0; i < Math.min(routePath.length, 5); i++) {
    routeLevels[`routeLevel${i + 1}`] = routePath[i];
  }

  const prisma = new PrismaClient();

  // Verificar si tenemos una sesión válida
  const session = await auth();

  // Verificar si la ruta existe en la base de datos
  const routeMapping = await prisma.driveRootMapping.findFirst({
    where: {
      ...routeLevels,
    },
  });

  await prisma.$disconnect();

  // Si la ruta no existe, mostrar 404
  if (!routeMapping) {
    notFound();
  }

  // Si la ruta no está activa, mostrar 404
  if (!routeMapping.isActive) {
    notFound();
  }

  return (
    <main className='flex flex-col min-h-screen'>
      <div className='flex-grow'>
        <DriveExplorer
          path={routePath}
          folderId={folderId}
          initialMaxDepth={routeMapping.defaultDepth || 3}
        />
      </div>
    </main>
  );
}
