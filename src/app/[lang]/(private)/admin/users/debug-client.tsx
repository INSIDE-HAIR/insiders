"use client";
import { useState, useEffect, useCallback } from "react";
import { UserSession } from "@/src/types/routes";

// Import components one by one to isolate issues
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";

// Test if these imports work
try {
  // @ts-ignore
  const { Toaster, toast } = require("sonner");
} catch (e) {
  console.error("Sonner import failed:", e);
}

interface DebugUsersClientProps {
  user: UserSession;
}

export function DebugUsersClient({ user }: DebugUsersClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Test fetch without complex dependencies
  const fetchUsers = useCallback(async () => {
    try {
      console.log("Testing users API...");
      setIsLoading(true);
      const response = await fetch("/api/users", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Test API response:", data);
      setDebugInfo(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className='p-6'>
      <div className='flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40'>
        <div className='flex flex-1 items-center justify-between'>
          <h1 className='text-2xl font-bold'>Users Management</h1>
          <Button onClick={fetchUsers} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Loading...
              </>
            ) : (
              "Refresh"
            )}
          </Button>
        </div>
      </div>

      <div className='p-6'>
        <div className='mb-4 p-4 bg-green-100 rounded'>
          <h2 className='font-semibold text-green-800'>
            ✅ Access Control Working
          </h2>
          <p>
            Welcome, {user.email} (Role: {user.role})
          </p>
          <p>Server-side validation successful!</p>
        </div>

        {error && (
          <div className='mb-4 p-4 bg-red-100 border border-red-300 rounded'>
            <h3 className='font-semibold text-red-800'>API Error:</h3>
            <p className='text-red-600'>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className='flex justify-center items-center h-64'>
            <Loader2 className='h-8 w-8 animate-spin' />
            <span className='ml-2'>Testing API connection...</span>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='p-4 bg-blue-100 rounded'>
              <h3 className='font-semibold text-blue-800'>API Test Results:</h3>
              <p>Check the console for detailed API response.</p>
              {debugInfo && (
                <pre className='mt-2 text-sm bg-white p-2 rounded overflow-auto'>
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              )}
            </div>

            <div className='flex gap-2 flex-wrap'>
              <Button
                onClick={() => window.open("/api/v1/health/debug", "_blank")}
                variant='outline'
              >
                Test Debug API
              </Button>
              <Button
                onClick={() => window.open("/api/v1/users/test", "_blank")}
                variant='outline'
              >
                Test Users API
              </Button>
              <Button
                onClick={() => window.open("/api/users", "_blank")}
                variant='outline'
              >
                Test Main Users API
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
