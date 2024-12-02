import { getUserByEmail } from "@/prisma/query/user"; // app/users/[userEmail]/page.tsx
import React from "react";
import TailwindGrid from "@/src/components/grid/TailwindGrid";
import { auth, signOut } from "@/src/config/auth/auth";
import { redirect } from "next/navigation";
import { HoldedProvider } from "@/src/components/providers/HoldedProvider";
import { User } from "@prisma/client";
import TabsUserSettings from "@/src/app/[lang]/admin/users/[userEmail]/_components/tabs/tabs-user-setttings";

export default async function Page({
  params,
}: {
  params: { userEmail: string };
}) {
  const user = await getUserByEmail(decodeURIComponent(params.userEmail));
  const session = await auth();

  if (!session) {
    redirect("/auth/login?error=unauthenticated");
  }

  if (!user) {
    await signOut();
  }

  interface UserWithOauth extends User {
    isOAuth: boolean;
    groupIds: string[];
    tagIds: string[];
    resourceIds: string[];
  }

  const clientUser: UserWithOauth = {
    id: user?.id ?? "",
    lastName: user?.lastName ?? "",
    name: user?.name ?? "",
    email: user?.email ?? "",
    emailVerified: user?.emailVerified ?? null,
    image: user?.image ?? "",
    password: "",
    contactNumber: user?.contactNumber ?? null,
    terms: user?.terms || true,
    role: user?.role ?? "CLIENT",
    isTwoFactorEnabled: user?.isTwoFactorEnabled ?? false,
    holdedId: user?.holdedId ?? null,
    createdHoldedSyncAt: user?.createdHoldedSyncAt ?? null,
    lastHoldedSyncAt: user?.lastHoldedSyncAt ?? null,
    lastLogin: user?.lastLogin ?? null,
    createdAt: (user?.createdAt as Date) ?? null,
    updatedAt: (user?.updatedAt as Date) ?? null,
    isOAuth: session?.user.isOAuth || false,
    groupIds: user?.groupIds ?? [],
    tagIds: user?.tagIds ?? [],
    resourceIds: user?.resourceIds ?? [],
  };

  if (!user) {
    return (
      <div>
        <p>Usuario no encontrado</p>
      </div>
    );
  }

  return (
    <HoldedProvider>
      <TailwindGrid fullSize>
        <header className="max-w-full col-start-1 col-end-full  lg:col-start-3 lg:col-end-13 flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 col-span-full">
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Usuario: {user?.email}</h1>
          </div>
        </header>
      </TailwindGrid>
      <TailwindGrid fullSize>
        <main className="col-start-1 max-w-full w-full col-end-full md:col-start-1  lg:col-start-3 lg:col-end-13  order-2 md:order-1 z-30  col-span-full">
          <TabsUserSettings user={clientUser} />
        </main>
      </TailwindGrid>
    </HoldedProvider>
  );
}
