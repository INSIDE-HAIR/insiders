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
import GoBackButton from "../share/go-back-button";

interface BreadcrumbNavigationProps {
  type: "auth" | "admin";
  homeLabel?: string;
  dropdownSliceEnd?: number;
}

export default function BreadcrumbNavigation({
  type,
  homeLabel = "INSIDERS",
  dropdownSliceEnd = -1,
}: BreadcrumbNavigationProps) {
  const pathname = usePathname() ?? "/";
  const pathSegments = pathname.split("/").filter(Boolean);

  const getTranslation = (segment: string, locale: string) => {
    const route =
      translation.adminRoutes.find((route) => route.id === segment) ||
      translation.actionsRoutes.find((route) => route.id === segment) ||
      translation.authRoutes.find((route) => route.id === segment);

    return route
      ? route.translations[locale as keyof typeof route.translations]
      : segment;
  };

  const dropdownItems = pathSegments
    .slice(1, dropdownSliceEnd)
    .map((segment, index) => (
      <DropdownMenuItem key={index} className="capitalize text-tiny">
        <Link href={`/${pathSegments.slice(0, index + 2).join("/")}`}>
          {getTranslation(segment, "es")}
        </Link>
      </DropdownMenuItem>
    ));

  const showDropdown = pathSegments.length > 3;

  const goBackHref =
    pathSegments.length > 1 ? `/${pathSegments.slice(0, -1).join("/")}` : "/";

  const getGoBackLabel = () => {
    if (type === "auth") {
      return pathSegments.length > 1
        ? `Ir a ${getTranslation("auth", "es")}`
        : `Ir a ${homeLabel}`;
    }
    return pathSegments.length > 2
      ? `Ir a ${getTranslation(pathSegments[pathSegments.length - 2], "es")}`
      : homeLabel;
  };

  return (
    <>
      <GoBackButton href={goBackHref} label={getGoBackLabel()} />

      <Breadcrumb className="[&>*]:text-zinc-800 [&>*]:text-tiny">
        <BreadcrumbList>
          <BreadcrumbItem className="capitalize underline [&>*]:hover:text-zinc-400">
            <BreadcrumbLink href="/">{homeLabel}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {showDropdown && (
            <>
              <BreadcrumbItem>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 capitalize">
                    <BreadcrumbEllipsis className="h-4 w-4" />
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
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem className="hover:underline [&>*]:hover:text-zinc-400 pointer-events-none [&>*]:text-tiny">
            <BreadcrumbPage>
              {getTranslation(pathSegments[pathSegments.length - 1], "es")}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
