export const dynamic = "force-dynamic";

import { auth } from "@/src/config/auth/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (!session) {
    redirect("/auth/login");
  }
  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  return <></>;
}
