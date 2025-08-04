export const dynamic = "force-dynamic";

import { auth } from "@/src/config/auth/auth";
import { redirect } from "next/navigation";

interface AuthHomeProps {
  params: {
    lang: string;
  };
}

export default async function AuthHome({ params }: AuthHomeProps) {
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
