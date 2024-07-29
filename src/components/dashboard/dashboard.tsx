import {
  BellIcon,
  Package2Icon,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/buttons/chadcn-button";
import LogoutButton from "../share/LogoutButton";
import translations from "@/db/translations.json";
import { Icons } from "../icons";

function Dashboard() {
  const navLinks = translations.adminRoutes.map((route) => {
    const IconComponent = Icons[route.icon as keyof typeof Icons];

    return (
      <Link
        key={route.id}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
        href={`/insiders/admin/${route.path}`}
      >
        <IconComponent className="h-4 w-4 " />
        {route.translations.es}
      </Link>
    );
  });

  return (
    <div className="col-span-1 col-start-1 col-end-2 h-screen fixed w-2/12  top-0 z-50 border-r box-border border-zinc-500  backdrop-blur-lg bg-clip-padding backdrop-filter hidden lg:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-[60px] items-center border-b px-6">
          <Link className="flex items-center gap-2 font-semibold" href="/">
            <Package2Icon className="h-6 w-6" />
            <span>INSIDERS</span>
          </Link>
          <Button className="ml-auto h-8 w-8" size="icon" variant="outline">
            <BellIcon className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-2  content-between   max-h-screen flex-col relative">
          <nav className="grid items-start px-4 text-sm font-medium   ">
            {navLinks} {/* Render the dynamically created nav links */}
          </nav>
          <div className=" px-4 text-sm font-medium self-end items-end   py-2 absolute bottom-0 w-full flex ">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
