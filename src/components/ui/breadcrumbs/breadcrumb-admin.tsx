"use client";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/src/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import translation from "@/db/translations.json";
import React from "react";
import Link from "next/link";
import GoBackButton from "./go-back-button";

export default function BreadcrumbAdmin() {
  const pathname = usePathname() ?? "/";
  const pathSegments = pathname.split("/").filter(Boolean);

  // Función para obtener la traducción correspondiente al segmento de la ruta
  const getTranslation = (segment: string, locale: string) => {
    const route =
      translation.adminRoutes.find((route) => route.id === segment) ||
      translation.actionsRoutes.find((route) => route.id === segment) ||
      translation.authRoutes.find((route) => route.id === segment);

    return route
      ? route.translations[locale as keyof typeof route.translations]
      : segment;
  };

  // Prepara los segmentos para el menú desplegable
  const dropdownItems = pathSegments.slice(1, -1).map((segment, index) => (
    <DropdownMenuItem key={index} className="capitalize text-tiny">
      <Link href={`/${pathSegments.slice(0, index + 2).join("/")}`}>
        {getTranslation(segment, "es")}
      </Link>
    </DropdownMenuItem>
  ));

  const showDropdown = pathSegments.length > 3;

  // Crear el enlace para GoBackButton dinámicamente
  const goBackHref =
    pathSegments.length > 1 ? `/${pathSegments.slice(0, -1).join("/")}` : "/"; // Si sólo hay un segmento o ninguno, vuelve al inicio

  const goBackLabel =
    pathSegments.length > 1
      ? "Ir a " + getTranslation(pathSegments[pathSegments.length - 2], "es")
      : "Ir a Inicio";

  return (
    <>
      <GoBackButton href={goBackHref} label={goBackLabel} />

      <Breadcrumb className="[&>*]:text-zinc-800  [&>*]:text-tiny  ">
        <BreadcrumbList>
          <BreadcrumbItem className="capitalize underline [&>*]:hover:text-zinc-400">
            <BreadcrumbLink href="/insiders/">Insiders</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {showDropdown && (
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 capitalize">
                  <BreadcrumbEllipsis className="h-4 w-4 " />
                  <span className="sr-only">menú desplegable</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="capitalize underline [&>*]:hover:text-zinc-400"
                >
                  {dropdownItems}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          )}
          {showDropdown && <BreadcrumbSeparator />}

          <BreadcrumbItem className=" hover:underline [&>*]:hover:text-zinc-400 pointer-events-none [&>*]:text-tiny">
            <BreadcrumbPage>
              {getTranslation(pathSegments[pathSegments.length - 1], "es")}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
