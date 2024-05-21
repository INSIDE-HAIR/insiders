import { auth, signOut } from "@/src/lib/actions/auth/auth";
import prisma from "@/prisma/database";
import { Card, CardContent, CardHeader } from "@/src/components/ui/cards/card";
import { UpdateUser } from "@/src/next-auth";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import UpdateUserForm from "@/src/components/protected/update-user-form";

type Props = {};

const SettingsPage = async (props: Props) => {
  const session = await auth();

  if (!session) {
    redirect("/auth/login?error=unauthenticated");
  }

  const user = await prisma.user.findFirst({
    where: { email: session?.user?.email ?? "" },
  });

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

  return (
    <section className="pagewrapper mt-8">
      <Card className="w-[600px]">
        <CardHeader>
          <div className="flex justify-center items-center gap-4">
            <Settings className="w-8 h-8 " />
            <span className="text-2xl font-semibold text-center">Settings</span>
          </div>
        </CardHeader>
        <CardContent className="">
          <UpdateUserForm user={clientUser} />
        </CardContent>
      </Card>
    </section>
  );
};

export default SettingsPage;
