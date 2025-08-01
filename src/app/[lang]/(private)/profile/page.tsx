export const dynamic = "force-dynamic";

import { auth } from "@/src/config/auth/auth";
import { UserCard } from "@/src/components/custom/auth/card/user-card";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (!session) {
    redirect("/auth/login");
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24">
      <section className="py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <UserCard
            user={{
              ...session.user,
              name: session.user.name || "Usuario",
              image: session.user.image || "/default-avatar.png",
            }}
          />
        </div>
      </section>
    </main>
  );
}
