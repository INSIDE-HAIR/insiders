// src/contect/ReactQueryProvider.tsx
"use client";

import { QueryClientProvider } from "react-query";
import queryClient from "../lib/react-query";

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
