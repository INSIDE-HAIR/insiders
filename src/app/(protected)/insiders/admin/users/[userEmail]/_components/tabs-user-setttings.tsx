import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/src/components/ui/tabs/tabs";
import {
  Card,
  CardHeader,
  CardDescription,
  CardFooter,
  CardTitle,
  CardContent,
} from "@/src/components/ui/cards/card";
import { User } from "@prisma/client";
import UpdateUserForm from "@/src/components/protected/update-user-form";

type Props = {
  user: User;
};

export default function TabsUserSettings({ user }: Props) {
  return (
    <Tabs defaultValue="services" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="services">Servicios</TabsTrigger>
        <TabsTrigger value="settings">Configuraciones</TabsTrigger>
        <TabsTrigger value="agreements">Acuerdos</TabsTrigger>
      </TabsList>
      <TabsContent value="services">
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services">Mis servicios</TabsTrigger>
            <TabsTrigger value="schedule">Mi agenda</TabsTrigger>
          </TabsList>
          <TabsContent value="services">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="uppercase">Mis Servicios</CardTitle>
                <CardDescription>
                  <b> MUY PRONTO.</b> Un nuevo panel para poder ver tus
                  servicios contratados, y la información de contacto de tus
                  responsables de crecimiento, marketing y mentorías
                  individuales.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2"></CardContent>
              <CardFooter></CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="schedule">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="uppercase">Mi agenda</CardTitle>
                <CardDescription>
                  <b> MUY PRONTO.</b> Tendras un espacio para poder ver tus
                  próximas formaciones y mentorías grupales con consultores.
                </CardDescription>
                <CardContent className="space-y-2"></CardContent>
                <CardFooter></CardFooter>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </TabsContent>
      <TabsContent value="settings">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="uppercase">Configuraciones</CardTitle>
            <CardDescription>
              El lugar perfecto para cambiar tu información pública comó tu
              imagen de perfil, teléfono, apodo o recupera tu contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <UpdateUserForm user={user} />
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="agreements">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="uppercase">Acuerdos</CardTitle>
            <CardDescription>
              <b> MUY PRONTO.</b> Un espacio para tener a la mano los acuerdos y
              contratos que has firmado con nosotros.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2"></CardContent>
          <CardFooter></CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
