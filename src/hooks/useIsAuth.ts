import { useState, useEffect } from "react";
import { PrismaClient } from "@prisma/client";
import { useSession } from "next-auth/react";

const prisma = new PrismaClient();

const useIsAuth = (auth: string[] = []): boolean => {
  const [isAuth, setIsAuth] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const checkAndUpdateAuth = async () => {
      if (auth.length === 0) {
        setIsAuth(true);
        return;
      }

      if (status !== "authenticated" || !session?.user?.email) {
        setIsAuth(false);
        return;
      }

      try {
        const userEmail = session.user.email;

        // Obtener el usuario de la base de datos
        const user = await prisma.user.findUnique({
          where: {
            email: userEmail,
          },
          select: {
            email: true,
            role: true,
          },
        });

        if (user) {
          // Verificar cada elemento en auth para ver si el usuario está autorizado
          const isAuthorized = auth.some((authItem: string) => {
            if (authItem.includes("@")) {
              // Es un correo electrónico
              return authItem === user.email;
            } else {
              // Es un rol
              return user.role === authItem;
            }
          });
          setIsAuth(isAuthorized);
        } else {
          setIsAuth(false);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsAuth(false);
      }
    };

    checkAndUpdateAuth();
  }, [auth, session, status]);

  return isAuth;
};

export default useIsAuth;
