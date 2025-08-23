import React from "react";
import { cn } from "@/src/lib/utils";
import { useToast } from "@/src/hooks/use-toast";
import { AccordionSection } from "../../molecules/layout/AccordionSection";
import { TagGroup } from "../../molecules/groups/TagGroup";
import { GroupSection } from "../../molecules/groups/GroupSection";
import { LoadingMessage } from "../../atoms/loading/LoadingMessage";
import { ReferencesSkeleton } from "../../molecules/loading/ReferencesSkeleton";

export interface Tag {
  name: string;
  color: string;
  slug?: string;
}

export interface Group {
  name: string;
  path: string;
  color: string;
}

export interface ReferencesSectionDemoData {
  tags: {
    assigned: Tag[];
    available: Tag[];
  };
  groups: {
    assigned: Group[];
    available: Group[];
  };
}

export interface ReferencesSectionDemoProps {
  data: ReferencesSectionDemoData;
  onTagRemove?: (tagName: string) => void;
  onTagAdd?: (tagName: string) => void;
  onGroupRemove?: (groupName: string) => void;
  onGroupAdd?: (groupName: string) => void;
  loading?: boolean;
  className?: string;
}

/**
 * Sección References completa usando componentes atómicos
 * Replica exactamente la funcionalidad del ResponsiveModalDemo
 * 
 * @example
 * <ReferencesSectionDemo 
 *   data={modalDummyData.references} 
 *   onTagRemove={(name) => console.log('Remover tag:', name)}
 *   onTagAdd={(name) => console.log('Agregar tag:', name)}
 *   onGroupRemove={(name) => console.log('Desasignar grupo:', name)}
 *   onGroupAdd={(name) => console.log('Asignar grupo:', name)}
 * />
 */
export const ReferencesSectionDemo: React.FC<ReferencesSectionDemoProps> = ({
  data,
  onTagRemove,
  onTagAdd,
  onGroupRemove,
  onGroupAdd,
  loading = false,
  className
}) => {
  const { toast } = useToast();
  
  const handleTagRemove = (tagName: string) => {
    onTagRemove?.(tagName);
    console.log('🏷️ Remover tag:', tagName);
  };

  const handleTagAdd = (tagName: string) => {
    onTagAdd?.(tagName);
    console.log('➕ Agregar tag:', tagName);
    toast({
      title: "Tag asignado",
      description: `Se ha asignado el tag "${tagName}" correctamente.`,
    });
  };

  const handleGroupRemove = (groupName: string) => {
    onGroupRemove?.(groupName);
    console.log('👥 Desasignar grupo:', groupName);
    toast({
      title: "Grupo desasignado",
      description: `Se ha desasignado el grupo "${groupName}" correctamente.`,
    });
  };

  const handleGroupAdd = (groupName: string) => {
    onGroupAdd?.(groupName);
    console.log('➕ Asignar grupo:', groupName);
    toast({
      title: "Grupo asignado",
      description: `Se ha asignado el grupo "${groupName}" correctamente.`,
    });
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <LoadingMessage 
          message="Cargando datos de organización..."
          variant="primary"
          size="md"
          spinnerSize="md"
          spinnerVariant="primary"
        />
        <ReferencesSkeleton />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      
      {/* Accordion para Tags y Grupos */}
      <div className="space-y-2">
        
        {/* Tags Accordion */}
        <AccordionSection 
          icon="tag" 
          title="Tags" 
          count={data.tags.assigned.length} 
          countLabel="asignados"
          defaultOpen={false}
        >
          <TagGroup 
            label="Tags Asignados"
            tags={data.tags.assigned}
            variant="assigned"
            onTagRemove={handleTagRemove}
          />
          
          <TagGroup 
            label="Tags Disponibles"
            tags={data.tags.available}
            variant="available"
            onTagAdd={handleTagAdd}
          />
        </AccordionSection>

        {/* Grupos Accordion */}
        <AccordionSection 
          icon="users" 
          title="Grupos" 
          count={data.groups.assigned.length} 
          countLabel="asignados"
          defaultOpen={false}
        >
          <GroupSection 
            label="Grupos Asignados"
            groups={data.groups.assigned}
            variant="assigned"
            onGroupRemove={handleGroupRemove}
          />
          
          <GroupSection 
            label="Grupos Disponibles"
            groups={data.groups.available}
            variant="available"
            onGroupAdd={handleGroupAdd}
          />
        </AccordionSection>
        
      </div>
    </div>
  );
};