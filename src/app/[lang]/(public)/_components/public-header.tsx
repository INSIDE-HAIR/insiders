"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/src/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/src/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Icons } from "@/src/components/shared/icons";
import { cn } from "@/src/lib/utils";
import { LanguageSelector } from "@/src/components/custom/language-selector";
import MyAccountButton from "./my-account-button";
import { ThemeToggle } from "@/src/components/shared/theme-toggle";
import { useSession } from "next-auth/react";

import navRoutesData from "@/src/routes/public-nav-routes.json";
import footerRoutes from "@/src/routes/footer-routes.json";

type SubRoute = { path: string; sub?: Record<string, SubRoute> };
type FooterRoutesType = Record<string, SubRoute>;
type NavRoute = { label: string; href: string; mainCategory?: string };

const typedFooterRoutes = footerRoutes as FooterRoutesType;
const navRoutes = navRoutesData as NavRoute[];

export default function PublicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
  const { data: session } = useSession();
  const logoSrc =
    "https://lh3.googleusercontent.com/d/1EKdctOIcuowPzQ8aLZXe14EkPKIWPfnT";

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className='bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b border-borde col-span-full'>
      <nav className='container mx-auto px-4 sm:px-6 py-3 flex items-center'>
        <Link
          href='/'
          className='text-2xl font-bold text-foreground uppercase flex items-center '
        >
          <Image
            src={logoSrc || "/placeholder.svg?width=150&height=40&text=Logo"}
            alt='Inside Hair Logo'
            width={150}
            height={40}
            priority
            className='mr-2'
          />
        </Link>

        {/* Desktop Navigation */}
        <div className='flex items-center space-x-4 ml-auto'>
          <div className='hidden md:flex items-center space-x-1'>
            {navRoutes.map((route) => {
              const categoryKey = route.mainCategory as keyof FooterRoutesType;
              const subItems = categoryKey
                ? typedFooterRoutes[categoryKey]?.sub
                : null;

              if (subItems) {
                return (
                  <DropdownMenu
                    key={route.label}
                    open={hoveredDropdown === route.label}
                    onOpenChange={(open) =>
                      setHoveredDropdown(open ? route.label : null)
                    }
                  >
                    <div
                      onMouseEnter={() => setHoveredDropdown(route.label)}
                      onMouseLeave={() => setHoveredDropdown(null)}
                      className='relative'
                    >
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='hover:bg-primary '>
                          {route.label}
                          <Icons.ChevronDown className='ml-1 h-3 w-3' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='start' className='w-[250px]'>
                        {Object.entries(subItems).map(
                          ([subLabel, subRoute]) => (
                            <DropdownMenuItem
                              key={subLabel}
                              asChild
                              className='focus:bg-primary'
                            >
                              <Link
                                href={subRoute.path}
                                className='block w-full px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer'
                              >
                                {subLabel}
                              </Link>
                            </DropdownMenuItem>
                          )
                        )}
                      </DropdownMenuContent>
                    </div>
                  </DropdownMenu>
                );
              } else {
                return (
                  <Button
                    key={route.label}
                    variant='ghost'
                    asChild
                    className='text-sm font-medium text-muted-foreground hover:text-primary bg-transparent h-10 px-4 py-2'
                  >
                    <Link href={route.href}>{route.label}</Link>
                  </Button>
                );
              }
            })}
          </div>

          <div className='hidden md:flex items-center space-x-3'>
            <ThemeToggle />
            <LanguageSelector />
            {session?.user ? (
              <MyAccountButton />
            ) : (
              <Button variant='outline' size='sm' asChild>
                <Link href='/auth/login'>
                  <Icons.User className='mr-2 h-4 w-4' />
                  Iniciar Sesión
                </Link>
              </Button>
            )}
            <Button size='sm' asChild>
              <a href='#para-quien'>Empezar Diagnóstico</a>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className='md:hidden'>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon' className='text-foreground'>
                {isMobileMenuOpen ? (
                  <Icons.X className='h-6 w-6' />
                ) : (
                  <Icons.Menu className='h-6 w-6' />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side='right' className='bg-background w-[300px] p-0'>
              <div className='p-6 space-y-2 overflow-y-auto h-full'>
                <Link
                  href='/'
                  className='flex items-center space-x-2 mb-6'
                  onClick={handleMobileLinkClick}
                >
                  <Image
                    src={
                      logoSrc ||
                      "/placeholder.svg?width=120&height=32&text=Logo"
                    }
                    alt='Inside Hair Logo'
                    width={120}
                    height={32}
                  />
                </Link>
                {navRoutes.map((route) => (
                  <div key={route.label}>
                    <Link
                      href={route.href}
                      onClick={handleMobileLinkClick}
                      className='flex justify-between items-center py-2 px-3 rounded-md text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    >
                      {route.label}
                    </Link>
                    {route.mainCategory &&
                      typedFooterRoutes[
                        route.mainCategory as keyof FooterRoutesType
                      ]?.sub && (
                        <div className='pl-4 mt-1 border-l border-border ml-2'>
                          {Object.entries(
                            typedFooterRoutes[
                              route.mainCategory as keyof FooterRoutesType
                            ]!.sub!
                          ).map(([subLabel, subRoute]) => (
                            <Link
                              key={subLabel}
                              href={subRoute.path}
                              onClick={handleMobileLinkClick}
                              className='block py-1.5 px-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md'
                            >
                              {subLabel}
                            </Link>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
                <div className='pt-6 space-y-3 border-t border-border mt-4'>
                  <div className='flex justify-center items-center space-x-3 mb-4'>
                    <ThemeToggle />
                    <LanguageSelector />
                  </div>
                  {session?.user ? (
                    <Button
                      variant='outline'
                      className='w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                      asChild
                    >
                      <Link
                        href='/admin/dashboard'
                        onClick={handleMobileLinkClick}
                      >
                        <Icons.LayoutGrid className='mr-2 h-4 w-4' />
                        Dashboard
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      variant='outline'
                      className='w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                      asChild
                    >
                      <Link href='/auth/login' onClick={handleMobileLinkClick}>
                        <Icons.User className='mr-2 h-4 w-4' />
                        Iniciar Sesión
                      </Link>
                    </Button>
                  )}
                  <Button className='w-full' asChild>
                    <a href='#para-quien' onClick={handleMobileLinkClick}>
                      Empezar Diagnóstico
                    </a>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
