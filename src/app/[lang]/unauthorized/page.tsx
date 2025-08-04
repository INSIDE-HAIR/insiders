import { Icons } from "@/src/components/shared/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";

export default async function UnauthorizedPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isSpanish = lang === "es";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <Icons.Shield className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">
            {isSpanish ? "Acceso Denegado" : "Access Denied"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {isSpanish
              ? "No tienes permisos para acceder a esta página. Contacta con tu administrador si crees que esto es un error."
              : "You don't have permission to access this page. Contact your administrator if you think this is an error."}
          </p>
          
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href={`/${lang}`}>
                <Icons.Home className="w-4 h-4 mr-2" />
                {isSpanish ? "Ir al Inicio" : "Go Home"}
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href={`/${lang}/auth/login`}>
                <Icons.LogOutIcon className="w-4 h-4 mr-2" />
                {isSpanish ? "Iniciar Sesión" : "Sign In"}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}