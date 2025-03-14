"use client";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { DriveMarketingContent } from "@/src/features/marketing-salon-drive/components/DriveMarketingContent";

// Create a client
const queryClient = new QueryClient();

export default function MarketingSalonDrivePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <DriveMarketingContent />
    </QueryClientProvider>
  );
}
