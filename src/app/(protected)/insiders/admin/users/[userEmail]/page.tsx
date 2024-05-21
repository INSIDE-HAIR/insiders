import { getUserByEmail } from "@/prisma/query/user"; // app/users/[userEmail]/page.tsx
import React from "react";
import UserForm from "./_component/user-form";
import TailwindGrid from "@/src/components/grid/TailwindGrid";

export default async function Page({
  params,
}: {
  params: { userEmail: string };
}) {
  const user = await getUserByEmail(decodeURIComponent(params.userEmail));

  if (!user) {
    return (
      <div>
        <p>Usuario no encontrado</p>
      </div>
    );
  }

  return (
    <TailwindGrid fullSize>
      <UserForm user={user} />
    </TailwindGrid>
  );
}
