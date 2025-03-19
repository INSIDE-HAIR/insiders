import React from "react";
import {
  FolderItem,
  HierarchyItem,
  isFolderItem,
  isFileItem,
} from "@drive/types/hierarchy";
import { cn } from "@/src/lib/utils";
import { ChevronDown, ChevronRight, Folder } from "lucide-react";
import { FileElement } from "./FileElement";

interface FolderElementProps {
  folder: FolderItem;
  className?: string;
  onItemClick?: (item: HierarchyItem) => void;
  defaultExpanded?: boolean;
}

export function FolderElement({
  folder,
  className,
  onItemClick,
  defaultExpanded = false,
}: FolderElementProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onItemClick?.(folder);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={cn(
        "folder-element rounded-lg border hover:border-blue-500 transition-colors",
        className
      )}
    >
      <div
        className="folder-header p-4 flex items-center gap-2 cursor-pointer"
        onClick={handleToggle}
      >
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
        <Folder className="w-5 h-5 text-blue-500" />
        <span className="font-medium">{folder.displayName}</span>
      </div>

      {isExpanded && (
        <div className="folder-content p-4 pt-0">
          {folder.children.length > 0 ? (
            <div className="space-y-2">
              {folder.children.map((child) => (
                <div key={child.id} onClick={handleClick}>
                  {isFolderItem(child) ? (
                    <FolderElement folder={child} onItemClick={onItemClick} />
                  ) : isFileItem(child) ? (
                    <FileElement file={child} onItemClick={onItemClick} />
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm italic">Carpeta vacía</div>
          )}
        </div>
      )}
    </div>
  );
}
