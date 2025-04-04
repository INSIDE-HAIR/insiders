import React from "react";
import {
  HierarchyItem,
  isFileItem,
  isFolderItem,
  hasPrefix,
  hasSuffix,
} from "@drive/types/hierarchy";
import { Prefix } from "@drive/types/prefix";
import { Suffix } from "@drive/types/suffix";
import { cn } from "@/src/lib/utils";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import { Separator } from "@ui/separator";
import {
  ChevronDown,
  ChevronRight,
  FolderIcon,
  FileIcon,
  ExternalLink,
} from "lucide-react";

interface HierarchyViewProps {
  items: HierarchyItem[];
  onItemClick?: (item: HierarchyItem) => void;
  depth?: number;
}

export function HierarchyView({
  items,
  onItemClick,
  depth = 0,
}: HierarchyViewProps) {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
    new Set()
  );

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const renderPrefixBadges = (prefixes: string[]) => {
    return prefixes.map((prefix) => (
      <Badge key={prefix} variant="secondary" className="text-xs">
        {prefix}
      </Badge>
    ));
  };

  const renderSuffixBadges = (suffixes: string[]) => {
    return suffixes.map((suffix) => (
      <Badge key={suffix} variant="outline" className="text-xs">
        {suffix}
      </Badge>
    ));
  };



  const renderTabsContent = (item: HierarchyItem) => {
    if (!isFolderItem(item)) return null;

    const tabs = item.children.filter((child) => hasPrefix(child, Prefix.TAB));
    if (tabs.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>{item.displayName}</span>
            <div className="flex gap-1">
              {renderPrefixBadges(item.prefixes)}
              {renderSuffixBadges(item.suffixes)}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={tabs[0].id} className="w-full">
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.displayName}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                <HierarchyView
                  items={tab.children}
                  onItemClick={onItemClick}
                  depth={depth + 1}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    );
  };

  const renderItem = (item: HierarchyItem) => {
    // Si el elemento tiene el sufijo _hidden, no mostrarlo
    if (hasSuffix(item, Suffix.HIDDEN)) return null;

    // Si es un contenedor de tabs, renderizar el componente de tabs
    if (hasPrefix(item, Prefix.TABS)) {
      return renderTabsContent(item);
    }

    const isExpanded = expandedItems.has(item.id);
    const hasChildren = isFolderItem(item) && item.children.length > 0;

    return (
      <div key={item.id} style={{ marginLeft: `${depth * 16}px` }}>
        <div
          className={cn(
            "flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer",
            isExpanded && "bg-gray-50"
          )}
          onClick={() => {
            if (hasChildren) {
              toggleItem(item.id);
            }
            onItemClick?.(item);
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <div className="w-4" />
          )}

          {isFolderItem(item) ? (
            <FolderIcon className="h-4 w-4 text-blue-500" />
          ) : (
            <FileIcon className="h-4 w-4 text-gray-500" />
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{item.displayName}</span>
              <div className="flex gap-1">
                {renderPrefixBadges(item.prefixes)}
                {renderSuffixBadges(item.suffixes)}
              </div>
            </div>
          </div>

          {isFileItem(item) && item.transformedUrl && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                if (item.transformedUrl?.preview) {
                  window.open(item.transformedUrl.preview, "_blank");
                }
              }}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isExpanded && hasChildren && (
          <div className="mt-1">
            <HierarchyView
              items={isFolderItem(item) ? item.children : []}
              onItemClick={onItemClick}
              depth={depth + 1}
            />
          </div>
        )}

        {depth === 0 && <Separator className="my-2" />}
      </div>
    );
  };

  return (
    <div className="space-y-1">{items.map((item) => renderItem(item))}</div>
  );
}
