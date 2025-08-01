"use client";

import { useTranslations } from "@/src/context/TranslationContext";
import { useDashboardRoutes } from "@/src/hooks/useDashboardRoutes";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/src/components/ui/breadcrumb";
import { AlertCircle, Home } from "lucide-react";
import { Spinner } from "../ui/spinner";

interface PageData {
  title: string;
  content: string;
  metadata?: {
    description?: string;
    lastUpdated?: string;
    status?: string;
  };
}

interface DynamicAdminPageProps {
  userRole?: string;
  team?: string;
}

export default function DynamicAdminPage({
  userRole = "admin",
  team = "gestion",
}: DynamicAdminPageProps) {
  const params = useParams();
  const t = useTranslations("Common.general");
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get route information
  const { getRoute, getRouteLabel, canAccessRoute } = useDashboardRoutes({
    team,
    locale: (params?.lang as "en" | "es") || "es",
    userRole,
  });

  // Handle params with defaults
  const lang = (params?.lang as string) || "es";
  const slug = params?.slug
    ? Array.isArray(params.slug)
      ? params.slug.join("/")
      : params.slug
    : "";

  // Build full path for route matching
  const fullPath = `/admin/${slug}`;
  const routeId = slug.split("/")[0] || "admin";

  // Get current route info
  const currentRoute = getRoute(routeId);
  const routeLabel = getRouteLabel(routeId);
  const hasAccess = canAccessRoute(routeId);

  // Build breadcrumb
  const breadcrumbItems = [
    { label: "Admin", href: "/admin" },
    ...slug.split("/").map((segment, index, array) => {
      const path = `/admin/${array.slice(0, index + 1).join("/")}`;
      const segmentRouteId = array.slice(0, index + 1).join("-");
      return {
        label:
          getRouteLabel(segmentRouteId) ||
          segment.charAt(0).toUpperCase() + segment.slice(1),
        href: path,
        isLast: index === array.length - 1,
      };
    }),
  ];

  useEffect(() => {
    async function fetchPageData() {
      if (!hasAccess) {
        setError("No tienes permisos para acceder a esta página");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Try to fetch dynamic content first
        const response = await fetch(
          `/api/admin/pages?lang=${lang}&slug=${slug}`
        );

        if (response.ok) {
          const data = await response.json();
          setPageData(data);
        } else if (response.status === 404) {
          // If no dynamic content, create default page data
          setPageData({
            title: routeLabel,
            content: `<div class="text-center py-8">
              <h2 class="text-2xl font-bold mb-4">${routeLabel}</h2>
              <p class="text-gray-600">Esta página está en desarrollo.</p>
              <p class="text-sm text-gray-500 mt-2">Ruta: ${fullPath}</p>
            </div>`,
            metadata: {
              description: `Página de administración para ${routeLabel}`,
              status: "En desarrollo",
            },
          });
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error fetching page data:", error);
        setError("Error al cargar la página");
        setPageData(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (lang && (slug || routeId === "admin")) {
      fetchPageData();
    } else {
      setIsLoading(false);
    }
  }, [lang, slug, hasAccess, routeLabel, fullPath, routeId]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <Spinner size='lg' show={true} />
          <p className='text-gray-600'>{t("loading") || "Cargando..."}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto p-6'>
        <Card className='border-red-200 bg-red-50'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-red-700'>
              <AlertCircle className='h-5 w-5' />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-red-700'>{error}</p>
            {!hasAccess && (
              <div className='mt-4 p-3 bg-red-100 rounded-md'>
                <p className='text-sm text-red-600'>
                  <strong>Ruta solicitada:</strong> {fullPath}
                  <br />
                  <strong>Tu rol actual:</strong> {userRole}
                  <br />
                  <strong>Tu equipo:</strong> {team}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className='container mx-auto p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Página No Encontrada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-gray-600'>
              {t("pageNotFound") || "La página solicitada no fue encontrada."}
            </p>
            <p className='text-sm text-gray-500 mt-2'>Ruta: {fullPath}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      {/* Breadcrumb */}
      <div className='mb-6'>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href='/admin' className='flex items-center gap-1'>
                <Home className='h-4 w-4' />
                Admin
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbItems.slice(1).map((item, index) => (
              <div key={index} className='flex items-center gap-2'>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {item.isLast ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Page Header */}
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>{pageData.title}</h1>
            {pageData.metadata?.description && (
              <p className='text-gray-600 mt-1'>
                {pageData.metadata.description}
              </p>
            )}
          </div>
          <div className='flex gap-2'>
            {pageData.metadata?.status && (
              <Badge variant='outline'>{pageData.metadata.status}</Badge>
            )}
            {currentRoute && (
              <Badge variant='secondary'>
                {currentRoute.access.roles.join(", ")}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <Card>
        <CardContent className='pt-6'>
          <div
            className='prose max-w-none'
            dangerouslySetInnerHTML={{ __html: pageData.content }}
          />
        </CardContent>
      </Card>

      {/* Debug Information (only in development) */}
      {process.env.NODE_ENV === "development" && (
        <Card className='mt-6 border-blue-200 bg-blue-50'>
          <CardHeader>
            <CardTitle className='text-blue-700 text-sm'>
              Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent className='text-sm text-blue-600'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <strong>Language:</strong> {lang}
                <br />
                <strong>Slug:</strong> {slug || "(empty)"}
                <br />
                <strong>Full Path:</strong> {fullPath}
                <br />
                <strong>Route ID:</strong> {routeId}
              </div>
              <div>
                <strong>User Role:</strong> {userRole}
                <br />
                <strong>Team:</strong> {team}
                <br />
                <strong>Has Access:</strong> {hasAccess ? "Yes" : "No"}
                <br />
                <strong>Route Label:</strong> {routeLabel}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
