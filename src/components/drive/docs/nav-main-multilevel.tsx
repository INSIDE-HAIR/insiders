"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/src/components/ui/sidebar";
import type { NavItem } from "@/src/types";
import { useCallback, useState, useEffect } from "react";
import { cn } from "@/src/lib/utils";

interface NavMainMultilevelProps {
  items: NavItem[];
  level?: number;
}

export function NavMainMultilevel({ items, level = 0 }: NavMainMultilevelProps) {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  // Function to check if a route is currently active (exact match only)
  const isRouteActive = useCallback((routePath: string): boolean => {
    const cleanPathname = pathname ? pathname.replace(/^\/[a-z]{2}/, "") : "";
    return cleanPathname === routePath;
  }, [pathname]);

  // Function to check if any child route is active
  const hasActiveChild = useCallback((item: NavItem): boolean => {
    if (!item.items) return false;
    
    for (const child of item.items) {
      if (isRouteActive(child.url)) return true;
      if (hasActiveChild(child)) return true;
    }
    return false;
  }, [isRouteActive]);

  // Function to check if a parent route should be highlighted
  const shouldHighlightParent = useCallback((item: NavItem): boolean => {
    const cleanPathname = pathname ? pathname.replace(/^\/[a-z]{2}/, "") : "";
    
    // If any subitem is exactly active, don't highlight parent
    if (hasActiveChild(item)) return false;
    
    // If parent is exactly active, highlight it
    if (item.url === cleanPathname) return true;
    
    // If we're in a child path but no specific subitem matches, highlight parent
    if (item.url !== '/admin' && item.url !== '/' && cleanPathname.startsWith(item.url + '/')) {
      return true;
    }
    
    return false;
  }, [pathname, hasActiveChild]);

  // Auto-expand items that have active children
  useEffect(() => {
    const newOpenItems: Record<string, boolean> = { ...openItems };
    let hasChanges = false;

    const checkAndExpand = (items: NavItem[], prefix = "") => {
      items.forEach(item => {
        const key = `${prefix}${item.title}`;
        const shouldBeOpen = hasActiveChild(item) || isRouteActive(item.url);
        if (shouldBeOpen && !newOpenItems[key]) {
          newOpenItems[key] = true;
          hasChanges = true;
        }
        if (item.items) {
          checkAndExpand(item.items, `${key}-`);
        }
      });
    };

    checkAndExpand(items);

    if (hasChanges) {
      setOpenItems(newOpenItems);
    }
  }, [items, hasActiveChild, isRouteActive, openItems]);

  const handleCollapsibleClick = useCallback((title: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  }, []);

  // Render navigation items recursively
  const renderNavItems = (navItems: NavItem[], currentLevel: number = 0) => {
    return navItems.map((item) => {
      const hasSubItems = item.items && item.items.length > 0;
      const itemKey = `${currentLevel}-${item.title}`;
      
      if (!hasSubItems) {
        const isActive = isRouteActive(item.url);
        const MenuComponent = currentLevel === 0 ? SidebarMenuItem : SidebarMenuSubItem;
        const ButtonComponent = currentLevel === 0 ? SidebarMenuButton : SidebarMenuSubButton;
        
        return (
          <MenuComponent key={item.title}>
            <ButtonComponent 
              asChild 
              tooltip={item.title}
              className="touch-target android-click-fix"
            >
              <a href={item.url}>
                {item.icon && currentLevel === 0 && <item.icon />}
                <span className={cn(
                  "transition-colors",
                  isActive && "text-primary font-medium"
                )}>{item.title}</span>
              </a>
            </ButtonComponent>
          </MenuComponent>
        );
      }

      // Render collapsible items
      const isOpen = openItems[itemKey] || item.isActive;
      const itemIsActive = isRouteActive(item.url);
      const hasActiveSub = hasActiveChild(item);
      const shouldHighlight = (itemIsActive || shouldHighlightParent(item)) && !hasActiveSub;
      
      if (currentLevel === 0) {
        return (
          <Collapsible
            key={item.title}
            asChild
            open={isOpen}
            onOpenChange={() => handleCollapsibleClick(itemKey)}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={item.title}
                  data-collapsible-trigger="true"
                  className="android-click-fix touch-target"
                >
                  {item.icon && <item.icon />}
                  <span className={cn(
                    "transition-colors",
                    shouldHighlight && "text-primary font-medium"
                  )}>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {renderNavItems(item.items, currentLevel + 1)}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        );
      } else {
        return (
          <Collapsible
            key={item.title}
            asChild
            open={isOpen}
            onOpenChange={() => handleCollapsibleClick(itemKey)}
            className="group/collapsible"
          >
            <SidebarMenuSubItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuSubButton
                  className="android-click-fix touch-target"
                >
                  <span className={cn(
                    "transition-colors",
                    shouldHighlight && "text-primary font-medium"
                  )}>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuSubButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {renderNavItems(item.items, currentLevel + 1)}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuSubItem>
          </Collapsible>
        );
      }
    });
  };

  if (level === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Documentación</SidebarGroupLabel>
        <SidebarMenu>
          {renderNavItems(items)}
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return <>{renderNavItems(items, level)}</>;
}