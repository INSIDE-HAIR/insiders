import React from "react";
import TailwindGrid from "../grid/TailwindGrid";
import BreadcrumbNavigation from "./breadcrumb-navigation";

interface HeaderProps {
  type: "auth" | "admin";
  homeLabel: string;
  dropdownSliceEnd: number;
}

function Header({ type, homeLabel, dropdownSliceEnd }: HeaderProps) {
  return (
    <TailwindGrid fullSize>
      <header className="h-14 lg:h-[60px] align-middle justify-between content-center gap-0 max-w-full col-start-1 col-end-full flex-wrap flex items-center border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 col-span-full">
        <BreadcrumbNavigation
          type={type}
          homeLabel={homeLabel}
          dropdownSliceEnd={dropdownSliceEnd}
        />
      </header>
    </TailwindGrid>
  );
}

export default Header; 