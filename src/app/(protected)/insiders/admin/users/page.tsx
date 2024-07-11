// src\app\(protected)\insiders\admin\users\page.tsx
import React from "react";
import TailwindGrid from "@/src/components/grid/TailwindGrid";
import { getUsers } from "@/src/app/users/lib/api/api";
import UsersTable from "@/src/components/table/users-table";

export default async function Page() {
  let users = [];
  let error = null;

  try {
    users = await getUsers();
  } catch (e) {
    console.error("Failed to fetch users:", e);
    error = e instanceof Error ? e.message : "An unknown error occurred";
  }

  return (
    <>
      <TailwindGrid fullSize>
        <header className="max-w-full col-start-1 col-end-full lg:col-start-3 lg:col-end-13 flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 col-span-full">
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Lista de Usuarios</h1>
          </div>
        </header>
      </TailwindGrid>
      <TailwindGrid fullSize>
        <main className="col-start-1 max-w-full w-full col-end-full md:col-start-1 lg:col-start-3 lg:col-end-13 order-2 md:order-1 z-30 col-span-full p-4">
          {error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : (
            <UsersTable users={users} />
          )}
        </main>
      </TailwindGrid>
    </>
  );
}
