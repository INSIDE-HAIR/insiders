import React from "react";
import TailwindGrid from "../grid/TailwindGrid";
import BreadcrumbAdmin from "@/src/components/ui/breadcrumbs/breadcrumb-admin";

function AdminHeader() {
  return (
    <>
      <TailwindGrid fullSize>
        <header className="h-14 lg:h-[60px] align-middle  justify-between content-center gap-0 max-w-full col-start-1 col-end-full md:col-end-6 lg:col-start-3 flex-wrap lg:col-end-13 flex   items-center border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 col-span-full">
          <BreadcrumbAdmin />
        </header>
      </TailwindGrid>
    </>
  );
}

export default AdminHeader;
