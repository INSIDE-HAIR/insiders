"use client";
import React, { ReactNode, useEffect, useState } from "react";
import { ThemeContextProvider } from "./ThemeContextProvider";
import { NextAuthSessionProvider } from "./AuthContextProvider";
import { HeroUIProvider } from "@heroui/react";

type Props = {
  children: ReactNode;
};

const Providers = ({ children }: Props) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContextProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <HeroUIProvider>
        <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
      </HeroUIProvider>
    </ThemeContextProvider>
  );
};

export default Providers;
