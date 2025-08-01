import React from "react";
import { HierarchyItem } from "@drive/types/hierarchy";
import ComponentFactory from "../factory/ComponentFactory";
import { cn } from "@/src/lib/utils";
import { useSession } from "next-auth/react";
import { DirectFileUploadManager } from "@/src/components/drive/upload/DirectFileUploadManager";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Upload } from "lucide-react";

interface AccordionViewProps {
  hierarchy: HierarchyItem[];
  className?: string;
  onItemClick?: (item: HierarchyItem) => void;
}

export function AccordionView({
  hierarchy,
  className,
  onItemClick,
}: AccordionViewProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  // Función para obtener el primer folderId válido de la jerarquía
  const getFirstFolderId = (): string | null => {
    for (const item of hierarchy) {
      if (item.driveType === "folder" && item.id) {
        return item.id;
      }
    }
    return null;
  };

  const folderId = getFirstFolderId();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Manager - Solo para administradores */}
      {isAdmin && folderId && (
        <Card className='border-dashed border-2 border-blue-200 bg-blue-50/30'>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-sm font-medium text-blue-700'>
              <Upload className='h-4 w-4' />
              Subir Archivos (Administrador)
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-0'>
            <DirectFileUploadManager
              folderId={folderId}
              folderName='Contenido Dinámico'
              onUploadComplete={(files) => {
                console.log("Archivos subidos:", files);
                // Aquí podrías refrescar la jerarquía si es necesario
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Contenido de la jerarquía */}
      {hierarchy.map((item) => (
        <ComponentFactory key={item.id} item={item} onItemClick={onItemClick} />
      ))}
    </div>
  );
}
