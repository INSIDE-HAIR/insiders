import React from "react";
import {
  HierarchyItem,
  isFolderItem,
  isFileItem,
} from "@drive/types/hierarchy";
import { cn } from "@/src/lib/utils";
import { FolderElement } from "./FolderElement";
import { FileElement } from "./FileElement";

interface ExplorerElementProps {
  item: HierarchyItem;
  className?: string;
  onItemClick?: (item: HierarchyItem) => void;
}

export function ExplorerElement({
  item,
  className,
  onItemClick,
}: ExplorerElementProps) {
  const handleItemClick = (clickedItem: HierarchyItem) => {
    onItemClick?.(clickedItem);
  };

  return (
    <div className={cn("explorer-element w-full", className)}>
      {isFolderItem(item) ? (
        <FolderElement
          folder={item}
          onItemClick={handleItemClick}
          defaultExpanded={true}
        />
      ) : isFileItem(item) ? (
        <FileElement file={item} onItemClick={handleItemClick} />
      ) : null}
    </div>
  );
}
