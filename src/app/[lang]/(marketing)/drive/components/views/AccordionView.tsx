import React, { useState } from "react";
import { HierarchyItem } from "@drive/types/hierarchy";
import ComponentFactory from "../factory/ComponentFactory";
import { cn } from "@/src/lib/utils";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { ChevronDown, ChevronUp, FolderOpen, FolderClosed } from "lucide-react";

interface AccordionViewProps {
  hierarchy: HierarchyItem[];
  className?: string;
}

export function AccordionView({ hierarchy, className }: AccordionViewProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (items: HierarchyItem[]) => {
      items.forEach((item) => {
        allIds.add(item.id);
        if (item.children?.length > 0) {
          collectIds(item.children);
        }
      });
    };
    collectIds(hierarchy);
    setExpandedItems(allIds);
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  const renderPrefixBadges = (prefixes: string[]) => {
    return prefixes.map((prefix, index) => (
      <Badge
        key={`${prefix}-${index}`}
        variant="outline"
        className="mr-1 bg-blue-50"
      >
        {prefix}
      </Badge>
    ));
  };

  const renderSuffixBadges = (suffixes: string[]) => {
    return suffixes.map((suffix, index) => (
      <Badge
        key={`${suffix}-${index}`}
        variant="outline"
        className="mr-1 bg-yellow-50"
      >
        {suffix}
      </Badge>
    ));
  };

  const renderItem = (item: HierarchyItem, depth: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className="border-b last:border-b-0">
        <div
          className={cn(
            "flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer",
            isExpanded && "bg-gray-50"
          )}
          style={{ paddingLeft: `${depth * 1.5}rem` }}
          onClick={() => hasChildren && toggleItem(item.id)}
        >
          {hasChildren && (
            <div className="w-6">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </div>
          )}
          <div className="w-6">
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="h-4 w-4 text-blue-500" />
              ) : (
                <FolderClosed className="h-4 w-4 text-blue-500" />
              )
            ) : null}
          </div>
          <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{item.displayName}</span>
              <span className="text-xs text-gray-400 font-mono">{item.id}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {renderPrefixBadges(item.prefixes)}
              {renderSuffixBadges(item.suffixes)}
            </div>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="border-l ml-6">
            {item.children.map((child) => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={expandAll}
          className="flex items-center gap-2"
        >
          <FolderOpen className="h-4 w-4" />
          Expandir todo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={collapseAll}
          className="flex items-center gap-2"
        >
          <FolderClosed className="h-4 w-4" />
          Contraer todo
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        {hierarchy.map((item) => renderItem(item))}
      </div>
    </div>
  );
}
