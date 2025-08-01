"use client"; // For handling mobile menu state

import { useState } from "react";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/src/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/src/components/ui/sheet";
import { Icons } from "@/src/components/shared/icons";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";

interface NavbarProps {
  session: Session | null;
  onSignOut: () => Promise<void>;
}

export default function Navbar({ session, onSignOut }: NavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      href: "/calculadora-de-beneficios",
      label: "Calculadora",
      icon: Icons.Calculator,
    },
    // Add other public links here if needed
  ];

  const commonButtonClasses = "text-white hover:bg-gray-800";
  const ctaButtonClasses = "bg-[#D6FD79] text-black hover:bg-[#c4e66b]";

  return (
    <nav className="bg-black text-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center space-x-2"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <Image
            src="http://www.salons.insidehair.es/wp-content/uploads/2025/05/logo.png"
            alt="Inside Salons Logo"
            width={150}
            height={40}
            priority
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-2">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              className={`${commonButtonClasses} ${
                pathname === link.href ? "bg-gray-700" : ""
              }`}
              asChild
            >
              <Link href={link.href}>
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </Link>
            </Button>
          ))}
          {session?.user ? (
            <>
              <Button
                variant="ghost"
                className={`${commonButtonClasses} ${
                  pathname === "/dashboard" ? "bg-gray-700" : ""
                }`}
                asChild
              >
                <Link href="/dashboard">
                  <Icons.BarChart3 className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <form
                action={onSignOut}
                onSubmit={async (e) => {
                  e.preventDefault();
                  await onSignOut();
                }}
              >
                <Button
                  type="submit"
                  variant="outline"
                  className={`border-gray-700 ${commonButtonClasses}`}
                >
                  <Icons.LogOutIcon className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className={`border-gray-700 ${commonButtonClasses}`}
                asChild
              >
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button className={ctaButtonClasses} asChild>
                <Link href="/auth/sign-up">Register</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={commonButtonClasses}
              >
                <Icons.Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-black text-white w-[250px] p-0"
            >
              <div className="p-6 space-y-4">
                <Link
                  href="/"
                  className="flex items-center space-x-2 mb-6"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Image
                    src="http://www.salons.insidehair.es/wp-content/uploads/2025/05/logo.png"
                    alt="Inside Salons Logo"
                    width={120}
                    height={32}
                  />
                </Link>
                {navLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className={`w-full justify-start ${commonButtonClasses} ${
                      pathname === link.href ? "bg-gray-700" : ""
                    }`}
                    asChild
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <link.icon className="mr-2 h-5 w-5" />
                      {link.label}
                    </Link>
                  </Button>
                ))}
                <hr className="border-gray-700 my-2" />
                {session?.user ? (
                  <>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${commonButtonClasses} ${
                        pathname === "/dashboard" ? "bg-gray-700" : ""
                      }`}
                      asChild
                    >
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icons.BarChart3 className="mr-2 h-5 w-5" />
                        Dashboard
                      </Link>
                    </Button>
                    <form
                      action={onSignOut}
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await onSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Button
                        type="submit"
                        variant="outline"
                        className={`w-full justify-start border-gray-700 ${commonButtonClasses}`}
                      >
                        <Icons.LogOutIcon className="mr-2 h-5 w-5" />
                        Sign Out
                      </Button>
                    </form>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className={`w-full justify-start border-gray-700 ${commonButtonClasses}`}
                      asChild
                    >
                      <Link
                        href="/auth/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                    </Button>
                    <Button
                      className={`w-full justify-start ${ctaButtonClasses}`}
                      asChild
                    >
                      <Link
                        href="/auth/sign-up"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
