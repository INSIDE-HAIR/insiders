import TailwindGrid from "@/src/components/grid/TailwindGrid";
import { Button } from "@/src/components/ui/buttons/chadcn-button";
import { Package2Icon, SearchIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

function page() {
  return (
    <>
      <TailwindGrid fullSize>
        <header className="max-w-full col-start-1 col-end-full  lg:col-start-3 lg:col-end-13 flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 col-span-full">
          <Link className="lg:hidden" href="#">
            <Package2Icon className="h-6 w-6" />
            <span className="sr-only">Home</span>
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Crear Usuario</h1>
          </div>
          <div className=" flex gap-2 items-center">
            <Button className="ml-auto h-8 w-8 lg:hidden" size="icon">
              <SearchIcon className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
            <Link href={"/insiders/admin/users/create"}>
              <Button size="sm">Guardar</Button>
            </Link>
          </div>
        </header>
      </TailwindGrid>
      <TailwindGrid>
        <main className="col-start-1 max-w-full w-full col-end-full md:col-start-1  lg:col-start-3 lg:col-end-13  order-2 md:order-1 z-30  col-span-full"></main>
      </TailwindGrid>
    </>
  );
}

export default page;
