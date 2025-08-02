"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { useTranslationContext } from "@/src/context/TranslationContext";

const languages = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇺🇸" },
] as const;

type Locale = typeof languages[number]["code"];

export function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, setLocale } = useTranslationContext();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  const handleLanguageChange = async (newLocale: Locale) => {
    // Extract the current path without the locale
    const pathWithoutLocale = pathname?.replace(/^\/[a-z]{2}/, '') || '/';
    
    // Create new URL with the new locale
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    
    // Update the translation context
    await setLocale(newLocale);
    
    // Navigate to the new URL
    router.push(newPath);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="relative"
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 px-0 hover:bg-primary"
          >
            <Globe className="h-4 w-4" />
            <span className="sr-only">Select language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[160px]">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="cursor-pointer focus:bg-primary"
            >
              <div className={`block w-full px-2 py-1.5 text-sm cursor-pointer ${
                language.code === locale 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}>
                <span className="mr-2">{language.flag}</span>
                <span>{language.name}</span>
                {language.code === locale && (
                  <span className="ml-auto text-xs float-right">✓</span>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </div>
    </DropdownMenu>
  );
}