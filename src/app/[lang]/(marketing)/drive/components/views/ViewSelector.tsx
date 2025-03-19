import React from "react";
import { HierarchyItem } from "@drive/types/hierarchy";
import { cn } from "@/src/lib/utils";
import { LayoutList, Code, LineChart } from "lucide-react";
import { Button } from "@ui/button";
import { AccordionView } from "./AccordionView";
import { JsonView } from "./JsonView";
import { ProgressView } from "./ProgressView";

export type ViewType = "accordion" | "json" | "progress";

interface ViewSelectorProps {
  hierarchy: HierarchyItem[];
  className?: string;
  onItemClick?: (item: HierarchyItem) => void;
}

export function ViewSelector({
  hierarchy,
  className,
  onItemClick,
}: ViewSelectorProps) {
  const [currentView, setCurrentView] = React.useState<ViewType>("accordion");

  const views: { type: ViewType; icon: React.ReactNode; label: string }[] = [
    {
      type: "accordion",
      icon: <LayoutList className="w-4 h-4" />,
      label: "Vista Acordeón",
    },
    { type: "json", icon: <Code className="w-4 h-4" />, label: "Vista JSON" },
    {
      type: "progress",
      icon: <LineChart className="w-4 h-4" />,
      label: "Vista en Progreso",
    },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Selector de vistas */}
      <div className="flex gap-2 mb-4">
        {views.map(({ type, icon, label }) => (
          <Button
            key={type}
            variant={currentView === type ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentView(type)}
            className="flex items-center gap-2"
          >
            {icon}
            <span>{label}</span>
          </Button>
        ))}
      </div>

      {/* Vista actual */}
      <div className="view-content">
        {currentView === "accordion" && (
          <AccordionView hierarchy={hierarchy} onItemClick={onItemClick} />
        )}
        {currentView === "json" && <JsonView hierarchy={hierarchy} />}
        {currentView === "progress" && <ProgressView hierarchy={hierarchy} />}
      </div>
    </div>
  );
}
