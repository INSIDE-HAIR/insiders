export const dynamic = "force-dynamic";

import { auth } from "@/src/config/auth/auth";
import { redirect } from "next/navigation";

interface AuthHomeProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function AuthHome(props: AuthHomeProps) {
  const params = await props.params;
  const { lang } = params;

  const session = await auth();
  if (!session) {
    redirect(`/${lang}/auth/login`);
  }
  if (session.user.role === "ADMIN" || session.user.role === "EMPLOYEE") {
    redirect(`/${lang}/admin`);
  } else {
    redirect(`/${lang}`);
  }
}
