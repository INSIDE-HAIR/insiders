// src/app/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/src/components/DataTable/DataTable";
import { columns } from "@/src/components/DataTable/columns";
import { User } from "@/src/lib/types/user";
import { getPaginatedUsers } from "@/src/lib/server-actions/auth/user/list/users";
import { Button } from "@/src/components/ui/button";
import TailwindGrid from "@/src/components/grid/TailwindGrid";

const UsersPage = () => {
  const [data, setData] = useState<{
    data: User[];
    page: number;
    pageSize: number;
    total: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getPaginatedUsers(page, pageSize);
        setData(result);
      } catch (err) {
        setError("Error fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [page, pageSize]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  if (!data) return null;

  return (
    <>
      <TailwindGrid fullSize>
        <header className="max-w-full col-start-1 col-end-full  lg:col-start-3 lg:col-end-13 flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 col-span-full">
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Lista de Usuarios</h1>
          </div>
        </header>
      </TailwindGrid>
      <TailwindGrid fullSize>
        <main className="col-start-1 max-w-full w-full col-end-full md:col-start-1  lg:col-start-3 lg:col-end-13  order-2 md:order-1 z-30  col-span-full p-4">
          <DataTable columns={columns} data={data.data} />
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {data.data.filter((row) => row.isSelected).length} of{" "}
              {data.data.length} row(s) selected.
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((old) => Math.max(old - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((old) =>
                    !data || data.total <= old * pageSize ? old : old + 1
                  )
                }
                disabled={!data || data.total <= page * pageSize}
              >
                Next
              </Button>
            </div>
          </div>
        </main>
      </TailwindGrid>
    </>
  );
};

export default UsersPage;
