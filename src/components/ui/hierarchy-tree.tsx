"use client";

import React, { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/src/lib/utils";

interface HierarchyItem {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  icon?: string;
  level: number;
  path: string;
  children: HierarchyItem[];
  _count?: {
    children: number;
    [key: string]: number;
  };
  [key: string]: any; // Allow additional properties
}

interface HierarchyTreeProps {
  items: HierarchyItem[];
  onEdit?: (item: HierarchyItem) => void;
  onDelete?: (item: HierarchyItem) => void;
  onAddChild?: (parentItem: HierarchyItem) => void;
  renderItemContent?: (item: HierarchyItem) => React.ReactNode;
  renderItemActions?: (item: HierarchyItem) => React.ReactNode;
  className?: string;
  maxInitialLevel?: number; // Auto-expand up to this level
}

export const HierarchyTree: React.FC<HierarchyTreeProps> = ({
  items,
  onEdit,
  onDelete,
  onAddChild,
  renderItemContent,
  renderItemActions,
  className,
  maxInitialLevel = 1,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    // Auto-expand items up to maxInitialLevel
    const expanded = new Set<string>();
    
    const expandUpToLevel = (itemList: HierarchyItem[]) => {
      itemList.forEach(item => {
        if (item.level < maxInitialLevel) {
          expanded.add(item.id);
          if (item.children.length > 0) {
            expandUpToLevel(item.children);
          }
        }
      });
    };
    
    expandUpToLevel(items);
    return expanded;
  });

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const renderDefaultContent = (item: HierarchyItem) => (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      {/* Color indicator */}
      {item.color && (
        <div
          className="h-3 w-3 rounded-full border"
          style={{ backgroundColor: item.color }}
        />
      )}
      
      {/* Name and slug */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{item.name}</span>
          {item.slug && (
            <Badge variant="outline" className="text-xs">
              {item.slug}
            </Badge>
          )}
        </div>
        {item.description && (
          <p className="text-sm text-muted-foreground truncate">
            {item.description}
          </p>
        )}
      </div>

      {/* Counts */}
      {item._count && (
        <div className="flex gap-1">
          {Object.entries(item._count)
            .filter(([key]) => key !== 'children')
            .map(([key, count]) => (
              <Badge key={key} variant="secondary" className="text-xs">
                {count} {key}
              </Badge>
            ))}
        </div>
      )}
    </div>
  );

  const renderDefaultActions = (item: HierarchyItem) => (
    <div className="flex items-center gap-1">
      {onAddChild && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddChild(item)}
          className="text-muted-foreground hover:text-foreground"
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      )}
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(item)}
          className="text-muted-foreground hover:text-foreground"
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item)}
          className="text-destructive hover:text-destructive"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  const renderTree = (itemList: HierarchyItem[], level: number = 0): React.ReactNode => {
    return itemList.map((item) => (
      <div key={item.id} className="select-none">
        <div
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors",
            level > 0 && "ml-6 border-l border-muted pl-4"
          )}
        >
          {/* Expand/Collapse button */}
          {item.children.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => toggleExpand(item.id)}
            >
              {expandedItems.has(item.id) ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="h-6 w-6" />
          )}
          
          {/* Item content */}
          {renderItemContent ? renderItemContent(item) : renderDefaultContent(item)}

          {/* Actions */}
          {renderItemActions ? renderItemActions(item) : renderDefaultActions(item)}
        </div>

        {/* Render children if expanded */}
        {expandedItems.has(item.id) && item.children.length > 0 && (
          <div className="mt-1">
            {renderTree(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className={cn("space-y-1", className)}>
      {renderTree(items)}
    </div>
  );
};

// Hook for managing hierarchy state
export const useHierarchyExpansion = (initialExpanded: string[] = []) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(initialExpanded)
  );

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const expandAll = (items: HierarchyItem[]) => {
    const allIds = new Set<string>();
    
    const collectIds = (itemList: HierarchyItem[]) => {
      itemList.forEach(item => {
        allIds.add(item.id);
        if (item.children.length > 0) {
          collectIds(item.children);
        }
      });
    };
    
    collectIds(items);
    setExpandedItems(allIds);
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  const expandToLevel = (items: HierarchyItem[], level: number) => {
    const expanded = new Set<string>();
    
    const expandUpTo = (itemList: HierarchyItem[]) => {
      itemList.forEach(item => {
        if (item.level < level) {
          expanded.add(item.id);
          if (item.children.length > 0) {
            expandUpTo(item.children);
          }
        }
      });
    };
    
    expandUpTo(items);
    setExpandedItems(expanded);
  };

  return {
    expandedItems,
    toggleExpand,
    expandAll,
    collapseAll,
    expandToLevel,
    isExpanded: (itemId: string) => expandedItems.has(itemId),
  };
};