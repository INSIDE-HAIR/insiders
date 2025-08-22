"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MeetRoomsClientRefactored } from "./client-page.refactored";
import { useState } from "react";

interface ClientWrapperProps {
  lang: string;
}

export const MeetRoomsClientWrapper: React.FC<ClientWrapperProps> = ({ lang }) => {
  // Create QueryClient instance on client side
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MeetRoomsClientRefactored lang={lang} />
    </QueryClientProvider>
  );
};