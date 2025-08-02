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

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  // Estado para tracking de qué menús están abiertos
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  // Get all possible routes from items for more precise matching
  const getAllRoutes = useCallback((items: NavItem[]): string[] => {
    const routes: string[] = [];
    items.forEach(item => {
      routes.push(item.url);
      if (item.items) {
        item.items.forEach(subItem => {
          routes.push(subItem.url);
        });
      }
    });
    return routes.sort((a, b) => b.length - a.length); // Sort by length descending for most specific first
  }, []);

  // Function to check if a route is currently active (exact match only)
  const isRouteActive = useCallback((routePath: string): boolean => {
    // Remove language prefix from pathname for comparison
    const cleanPathname = pathname ? pathname.replace(/^\/[a-z]{2}/, "") : "";
    
    // Only exact match
    return cleanPathname === routePath;
  }, [pathname]);

  // Function to check if a parent route should be highlighted (only if no more specific child is active)
  const shouldHighlightParent = useCallback((item: NavItem): boolean => {
    const cleanPathname = pathname ? pathname.replace(/^\/[a-z]{2}/, "") : "";
    
    // If any subitem is exactly active, don't highlight parent
    if (item.items && item.items.some(subItem => subItem.url === cleanPathname)) {
      return false;
    }
    
    // If parent is exactly active, highlight it
    if (item.url === cleanPathname) {
      return true;
    }
    
    // If we're in a child path but no specific subitem matches, highlight parent
    if (item.url !== '/admin' && item.url !== '/' && cleanPathname.startsWith(item.url + '/')) {
      // But only if there's no more specific route that matches
      const allRoutes = getAllRoutes(items);
      const moreSpecificRoute = allRoutes.find(route => 
        route !== item.url && 
        route.startsWith(item.url) && 
        cleanPathname.startsWith(route)
      );
      return !moreSpecificRoute;
    }
    
    return false;
  }, [pathname, items, getAllRoutes]);

  // Function to check if an item has any active subitems (exact match only)
  const hasActiveSubItem = useCallback((item: NavItem): boolean => {
    if (!item.items || item.items.length === 0) return false;
    return item.items.some(subItem => isRouteActive(subItem.url));
  }, [isRouteActive]);

  // Auto-expand items that have active subitems
  useEffect(() => {
    const newOpenItems: Record<string, boolean> = { ...openItems };
    let hasChanges = false;

    items.forEach(item => {
      const shouldBeOpen = hasActiveSubItem(item) || isRouteActive(item.url);
      if (shouldBeOpen && !newOpenItems[item.title]) {
        newOpenItems[item.title] = true;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setOpenItems(newOpenItems);
    }
  }, [items, hasActiveSubItem, isRouteActive, openItems]);

  // Callback para manejar el clic en un elemento desplegable
  const handleCollapsibleClick = useCallback((title: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  }, []);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // Check if item has subitems to determine if it should be a dropdown
          const hasSubItems = item.items && item.items.length > 0;

          // If it has no subitems, render a direct link
          if (!hasSubItems) {
            const isActive = isRouteActive(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  tooltip={item.title}
                >
                  <a href={item.url}>
                    {item.icon && <item.icon />}
                    <span className={cn(
                      "transition-colors",
                      isActive && "text-primary font-medium"
                    )}>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          // Otherwise render a collapsible dropdown
          const isOpen = openItems[item.title] || item.isActive;
          const itemIsActive = isRouteActive(item.url);
          const hasActiveSub = hasActiveSubItem(item);
          const parentShouldHighlight = shouldHighlightParent(item);
          // Only highlight parent if no subitem is active
          const shouldHighlight = (itemIsActive || parentShouldHighlight) && !hasActiveSub;

          return (
            <Collapsible
              key={item.title}
              asChild
              open={isOpen}
              onOpenChange={() => handleCollapsibleClick(item.title)}
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
                    {item.items?.map((subItem) => {
                      const subIsActive = isRouteActive(subItem.url);
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className="touch-target android-click-fix"
                          >
                            <a href={subItem.url}>
                              <span className={cn(
                                "transition-colors",
                                subIsActive && "text-primary font-medium"
                              )}>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
