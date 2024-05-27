import { getUserByEmail } from "@/prisma/query/user"; // app/users/[userEmail]/page.tsx
import React from "react";
import TailwindGrid from "@/src/components/grid/TailwindGrid";
import { Button } from "@/src/components/ui/buttons/chadcn-button";
import { UpdateUser } from "@/src/next-auth";
import UpdateUserForm from "@/src/components/protected/update-user-form";
import { auth, signOut } from "@/src/lib/actions/auth/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/src/components/ui/cards/card";

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

  const clientUser: UpdateUser = {
    id: user?.id ?? undefined,
    lastName: user?.lastName ?? "",
    name: user?.name ?? "",
    email: user?.email ?? "",
    emailVerified: user?.emailVerified ?? null,
    image: user?.image ?? "",
    password: "",
    newPassword: null,
    contactNumber: user?.contactNumber ?? null,
    terms: user?.terms ?? undefined,
    role: user?.role ?? "CLIENT",
    isTwoFactorEnabled: user?.isTwoFactorEnabled ?? false,
    holdedId: user?.holdedId ?? null,
    createdAt: user?.createdAt ?? null,
    updatedAt: user?.updatedAt ?? null,
    isOAuth: session?.user.isOAuth || false,
  };

  if (!user) {
    return (
      <div>
        <p>Usuario no encontrado</p>
      </div>
    );
  }

  return (
    <>
      <TailwindGrid fullSize>
        <header className="max-w-full col-start-1 col-end-full md:col-end-6 lg:col-start-3 lg:col-end-13 flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 col-span-full">
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Usuario: {user?.email}</h1>
          </div>
        </header>
      </TailwindGrid>
      <TailwindGrid fullSize>
        <main className="col-start-1 max-w-full w-full col-end-full md:col-start-1 md:col-end-6 lg:col-start-3 lg:col-end-13  order-2 md:order-1 z-30  col-span-full">
          <Card className="w-full rounded-none">
            <CardContent className="">
              <UpdateUserForm user={clientUser} />
            </CardContent>
          </Card>{" "}
        </main>
      </TailwindGrid>
    </>
  );
}
