"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { Badge } from "@/src/components/ui/badge";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Search,
  Filter,
  ChevronRight,
  Lock,
  Globe,
  Users,
  Shield,
  Eye,
  EyeOff,
  Edit,
  Save,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
import { cn } from "@/src/lib/utils";
import { RoutesConfiguration } from "@/src/types/routes";

interface RouteConfig {
  path: string;
  label: string;
  access: {
    type: "public" | "private" | "auth" | "admin" | "api";
    roles?: string[];
    emails?: string[];
    domains?: string[];
  };
  children?: RouteConfig[];
  component?: string;
  redirect?: string;
}

interface RouteCategory {
  name: string;
  routes: RouteConfig[];
}

export default function SitemapPage() {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [editingRoute, setEditingRoute] = useState<string | null>(null);
  const [routeData, setRouteData] = useState<RouteCategory[]>([]);

  useEffect(() => {
    loadRouteData();
  }, []);

  // Auto-expand categories with active routes
  useEffect(() => {
    const categoriesToExpand = new Set(expandedCategories);

    routeData.forEach((category) => {
      if (isCategoryActive(category)) {
        categoriesToExpand.add(category.name);
      }
    });

    if (categoriesToExpand.size !== expandedCategories.size) {
      setExpandedCategories(categoriesToExpand);
    }
  }, [routeData, pathname, expandedCategories]);

  // Function to check if a route is currently active
  const isRouteActive = (routePath: string): boolean => {
    // Remove language prefix from pathname for comparison
    if (!pathname) return false;
    const cleanPathname = pathname.replace(/^\/[a-z]{2}/, "");
    return (
      cleanPathname === routePath || cleanPathname.startsWith(routePath + "/")
    );
  };

  // Function to check if a category has any active routes
  const isCategoryActive = (category: RouteCategory): boolean => {
    return category.routes.some((route) => {
      if (isRouteActive(route.path)) return true;
      if (route.children) {
        return route.children.some((child) => isRouteActive(child.path));
      }
      return false;
    });
  };

  const loadRouteData = async () => {
    try {
      // Cargar configuración real de rutas
      const response = await fetch("/api/routes/config");
      if (response.ok) {
        const config = await response.json();
        const categorizedData = categorizeRoutes(config);
        setRouteData(categorizedData);
        return;
      }
    } catch (error) {
      console.error("Error loading route config:", error);
    }

    // Fallback a datos de ejemplo si no se puede cargar la configuración
    const exampleData: RouteCategory[] = [
      {
        name: "Public Routes",
        routes: [
          {
            path: "/",
            label: "Home",
            access: { type: "public" },
            component: "HomePage",
          },
          {
            path: "/formaciones",
            label: "Formaciones",
            access: { type: "public" },
            children: [
              {
                path: "/formaciones/master-ibm",
                label: "Master IBM",
                access: { type: "public" },
                children: [
                  {
                    path: "/formaciones/master-ibm/programa",
                    label: "Programa",
                    access: { type: "public" },
                  },
                  {
                    path: "/formaciones/master-ibm/precio-y-modalidades",
                    label: "Precio y Modalidades",
                    access: { type: "public" },
                  },
                ],
              },
            ],
          },
          {
            path: "/consultoria",
            label: "Consultoría",
            access: { type: "public" },
          },
        ],
      },
      {
        name: "Auth Routes",
        routes: [
          {
            path: "/auth/login",
            label: "Login",
            access: { type: "auth" },
          },
          {
            path: "/auth/register",
            label: "Register",
            access: { type: "auth" },
          },
          {
            path: "/auth/reset-password",
            label: "Reset Password",
            access: { type: "auth" },
          },
        ],
      },
      {
        name: "Private Routes",
        routes: [
          {
            path: "/profile",
            label: "Profile",
            access: { type: "private" },
          },
        ],
      },
      {
        name: "Admin Routes",
        routes: [
          {
            path: "/admin",
            label: "Admin Dashboard",
            access: {
              type: "admin",
              roles: ["admin", "super-admin"],
            },
            children: [
              {
                path: "/admin/users",
                label: "Users Management",
                access: {
                  type: "admin",
                  roles: ["admin", "super-admin"],
                },
              },
              {
                path: "/admin/calendar",
                label: "Calendar",
                access: {
                  type: "admin",
                  roles: ["admin"],
                  domains: ["@insidesalons.com"],
                },
              },
              {
                path: "/admin/sitemap",
                label: "Sitemap",
                access: {
                  type: "admin",
                  roles: ["super-admin"],
                },
              },
            ],
          },
        ],
      },
    ];

    setRouteData(exampleData);
  };

  const categorizeRoutes = (config: RoutesConfiguration): RouteCategory[] => {
    const categories: RouteCategory[] = [];

    Object.entries(config.routes).forEach(([categoryName, routes]) => {
      const categoryRoutes = routes.map((route) => ({
        path: route.path,
        label: route.label,
        access: {
          type: route.access.type,
          roles: route.access.roles,
          emails: route.access.emails,
          domains: route.access.domains,
        },
        children: route.children?.map((child) => ({
          path: child.path,
          label: child.label,
          access: {
            type: child.access.type,
            roles: child.access.roles,
            emails: child.access.emails,
            domains: child.access.domains,
          },
        })),
      }));

      categories.push({
        name:
          categoryName.charAt(0).toUpperCase() +
          categoryName.slice(1) +
          " Routes",
        routes: categoryRoutes,
      });
    });

    return categories;
  };

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const getAccessIcon = (access: RouteConfig["access"]) => {
    switch (access.type) {
      case "public":
        return <Globe className="h-4 w-4" />;
      case "private":
        return <Lock className="h-4 w-4" />;
      case "auth":
        return <Users className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "api":
        return <Shield className="h-4 w-4" />;
    }
  };

  const getAccessColor = (access: RouteConfig["access"]) => {
    switch (access.type) {
      case "public":
        return "default";
      case "private":
        return "secondary";
      case "auth":
        return "outline";
      case "admin":
        return "destructive";
      case "api":
        return "destructive";
    }
  };

  const RouteItem = ({
    route,
    depth = 0,
  }: {
    route: RouteConfig;
    depth?: number;
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isEditing = editingRoute === route.path;
    const hasChildren = route.children && route.children.length > 0;
    const isActive = isRouteActive(route.path);
    const hasActiveChild = route.children?.some((child) =>
      isRouteActive(child.path)
    );

    // Auto-expand if this route or any child is active
    React.useEffect(() => {
      if (isActive || hasActiveChild) {
        setIsExpanded(true);
      }
    }, [isActive, hasActiveChild]);

    const filteredChildren = route.children?.filter((child) => {
      if (filterType === "all") return true;
      return child.access.type === filterType;
    });

    const matchesSearch =
      searchTerm === "" ||
      route.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.label.toLowerCase().includes(searchTerm.toLowerCase());

    const hasMatchingChildren = filteredChildren?.some(
      (child) =>
        child.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        child.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!matchesSearch && !hasMatchingChildren) return null;
    if (
      filterType !== "all" &&
      route.access.type !== filterType &&
      !hasMatchingChildren
    )
      return null;

    return (
      <div
        className={cn(
          "border-l-2 transition-colors",
          isActive ? "border-primary" : "border-gray-100",
          depth > 0 && "ml-4"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md transition-colors",
            isEditing && "bg-blue-50",
            isActive && "bg-primary/5 border-l-2 border-primary"
          )}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform",
                  isExpanded && "rotate-90"
                )}
              />
            </Button>
          )}

          <div className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                "transition-colors",
                isActive ? "text-primary" : ""
              )}
            >
              {getAccessIcon(route.access)}
            </div>
            <span
              className={cn(
                "font-medium transition-colors",
                isActive ? "text-primary font-semibold" : ""
              )}
            >
              {route.label}
            </span>
            <code
              className={cn(
                "text-xs px-2 py-0.5 rounded transition-colors",
                isActive
                  ? "text-primary bg-primary/10 font-medium"
                  : "text-gray-500 bg-gray-100"
              )}
            >
              {route.path}
            </code>
            <Badge variant={getAccessColor(route.access)}>
              {route.access.type}
            </Badge>

            {route.access.roles && (
              <div className="flex gap-1">
                {route.access.roles.map((role) => (
                  <Badge key={role} variant="outline" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            )}

            {route.access.domains && (
              <Badge variant="secondary" className="text-xs">
                {route.access.domains.join(", ")}
              </Badge>
            )}
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setEditingRoute(isEditing ? null : route.path)}
            >
              {isEditing ? (
                <X className="h-3 w-3" />
              ) : (
                <Edit className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        {isEditing && (
          <div className="ml-8 p-3 bg-blue-50 rounded-md mt-1 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium">Access Type</label>
                <Select defaultValue={route.access.type}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="auth">Auth</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium">Roles</label>
                <Input
                  className="h-8"
                  placeholder="admin, user"
                  defaultValue={route.access.roles?.join(", ")}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingRoute(null)}
              >
                Cancel
              </Button>
              <Button size="sm">
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        )}

        {hasChildren && isExpanded && filteredChildren && (
          <div className="ml-4">
            {filteredChildren.map((child) => (
              <RouteItem key={child.path} route={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Sitemap & Route Management</h1>
          <p className="text-gray-500 mt-1">
            Manage application routes, permissions, and access control
          </p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search routes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by access" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Routes</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="auth">Auth</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Route Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {routeData.map((category) => {
                    const categoryActive = isCategoryActive(category);
                    return (
                      <div key={category.name}>
                        <div
                          className={cn(
                            "flex items-center gap-2 mb-2 cursor-pointer p-2 rounded-md transition-colors hover:bg-gray-50",
                            categoryActive &&
                              "bg-primary/5 border-l-4 border-primary"
                          )}
                          onClick={() => toggleCategory(category.name)}
                        >
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 transition-all",
                              expandedCategories.has(category.name) &&
                                "rotate-90",
                              categoryActive ? "text-primary" : "text-gray-500"
                            )}
                          />
                          <h3
                            className={cn(
                              "font-semibold transition-colors",
                              categoryActive ? "text-primary" : "text-gray-900"
                            )}
                          >
                            {category.name}
                          </h3>
                          <Badge
                            variant={categoryActive ? "default" : "outline"}
                            className={
                              categoryActive
                                ? "bg-primary text-primary-foreground"
                                : ""
                            }
                          >
                            {category.routes.length}
                          </Badge>
                        </div>

                        {expandedCategories.has(category.name) && (
                          <div className="ml-2">
                            {category.routes.map((route) => (
                              <RouteItem key={route.path} route={route} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                Current Route
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Current Path:
                  </p>
                  <code className="text-sm bg-primary/10 text-primary px-2 py-1 rounded font-mono">
                    {pathname}
                  </code>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Clean Path:
                  </p>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                    {pathname ? pathname.replace(/^\/[a-z]{2}/, "") : "/"}
                  </code>
                </div>
                {routeData.some((category) =>
                  category.routes.some((route) => isRouteActive(route.path))
                ) && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Routes:
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {routeData
                        .flatMap((category) =>
                          category.routes.filter((route) =>
                            isRouteActive(route.path)
                          )
                        )
                        .map((route) => (
                          <Badge
                            key={route.path}
                            className="bg-primary text-primary-foreground text-xs"
                          >
                            {route.label}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access Control Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Public Routes</span>
                  </div>
                  <Badge>24</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span>Private Routes</span>
                  </div>
                  <Badge variant="secondary">12</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Auth Routes</span>
                  </div>
                  <Badge variant="outline">5</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Admin Routes</span>
                  </div>
                  <Badge variant="destructive">18</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="space-y-1">
                <p className="font-medium">Domain Restrictions:</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded block">
                  @insidesalons.com
                </code>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Available Roles:</p>
                <div className="flex gap-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    admin
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    super-admin
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    user
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    editor
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                Export to JSON
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <EyeOff className="h-4 w-4 mr-2" />
                Import from JSON
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Sync to Database
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
