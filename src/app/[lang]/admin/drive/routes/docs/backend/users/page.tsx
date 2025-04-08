"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Info,
  FolderPlus,
  Settings,
  RefreshCw,
  Shield,
  ChevronDown,
  ChevronRight,
  InfoIcon,
  AlertTriangle,
  Bookmark,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { cn } from "@/src/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";

// Componentes de documentación
const IntroduccionSection = () => (
  <Card>
    <CardHeader>
      <CardTitle id='introduccion'>Introducción a las Rutas de Drive</CardTitle>
      <CardDescription>
        Visualiza contenido de Google Drive en tu sitio web
      </CardDescription>
    </CardHeader>
    <CardContent className='space-y-4'>
      <p>
        Las <strong>Rutas de Drive</strong> te permiten mostrar contenido desde
        tus carpetas de Google Drive directamente en tu sitio web, creando una
        experiencia integrada para tus usuarios.
      </p>

      <h3 className='text-xl font-bold mt-4'>¿Qué puedes hacer?</h3>
      <ul className='list-disc pl-6 space-y-2'>
        <li>
          <strong>Crear rutas personalizadas</strong> que muestran contenido de
          carpetas específicas de Google Drive
        </li>
        <li>
          <strong>Personalizar la presentación</strong> con título, subtítulo y
          descripción
        </li>
        <li>
          <strong>Sincronizar automáticamente</strong> para mantener el
          contenido actualizado
        </li>
        <li>
          <strong>Compartir contenido</strong> con URLs amigables y
          personalizadas
        </li>
      </ul>

      <h3 className='text-xl font-bold mt-4'>Beneficios</h3>
      <ul className='list-disc pl-6 space-y-2'>
        <li>
          <strong>Mantenimiento sencillo:</strong> Actualiza archivos en Google
          Drive y los cambios se reflejarán automáticamente
        </li>
        <li>
          <strong>Ahorro de tiempo:</strong> No necesitas subir los archivos dos
          veces
        </li>
        <li>
          <strong>Conserva la estructura:</strong> La organización de carpetas y
          archivos se mantiene intacta
        </li>
        <li>
          <strong>Interfaz amigable:</strong> Los usuarios navegan por el
          contenido con una interfaz limpia y profesional
        </li>
      </ul>

      <Separator className='my-4' />

      <div className='bg-slate-50 p-4 rounded-lg border border-slate-200'>
        <h4 className='font-semibold text-slate-800 mb-2'>¿Sabías que...?</h4>
        <p className='text-slate-700'>
          El sistema sincroniza automáticamente tu contenido cada 24 horas, pero
          también puedes forzar la sincronización manual en cualquier momento.
        </p>
      </div>
    </CardContent>
  </Card>
);

const CrearRutasSection = () => (
  <Card>
    <CardHeader>
      <CardTitle id='crear-rutas'>Crear una Nueva Ruta</CardTitle>
      <CardDescription>
        Aprende a configurar nuevas rutas para mostrar contenido de Drive
      </CardDescription>
    </CardHeader>
    <CardContent className='space-y-6'>
      <section>
        <h3 className='text-xl font-bold mb-3'>Paso a paso</h3>
        <ol className='list-decimal pl-6 space-y-3'>
          <li>
            <strong>Accede al panel de administración</strong> de rutas de Drive
            en <code>/admin/drive/routes</code>
          </li>
          <li>
            <strong>Haz clic en &quot;Crear Ruta&quot;</strong> en la esquina
            superior derecha
          </li>
          <li>
            <strong>Completa el formulario</strong> con la siguiente
            información:
            <ul className='list-disc pl-6 mt-2 space-y-1'>
              <li>
                <strong>URL (Slug):</strong> La dirección amigable donde se
                mostrará el contenido (ej: <code>mi-ruta-drive</code>)
              </li>
              <li>
                <strong>ID de Carpeta de Google Drive:</strong> El identificador
                único de la carpeta que quieres mostrar
              </li>
              <li>
                <strong>Título, Subtítulo, Descripción:</strong> Información
                opcional para personalizar la página
              </li>
            </ul>
          </li>
          <li>
            <strong>Guarda los cambios</strong> haciendo clic en &quot;Crear
            Ruta&quot;
          </li>
          <li>
            La nueva ruta se <strong>sincronizará automáticamente</strong> por
            primera vez
          </li>
        </ol>
      </section>

      <section>
        <h3 className='text-xl font-bold mb-3'>
          Encontrar el ID de carpeta en Google Drive
        </h3>
        <ol className='list-decimal pl-6 space-y-2'>
          <li>
            Abre <strong>Google Drive</strong> y navega hasta la carpeta que
            deseas mostrar
          </li>
          <li>
            Observa la URL en tu navegador, que tendrá un formato similar a:
            <pre className='bg-slate-100 p-2 rounded mt-1 text-xs'>
              https://drive.google.com/drive/folders/
              <span className='font-bold text-blue-600'>
                1ABCd123XYZ_exampleFolderId
              </span>
            </pre>
          </li>
          <li>
            El ID de la carpeta es la parte final de la URL (resaltada en azul
            arriba)
          </li>
          <li>
            Copia este ID y pégalo en el campo &quot;ID de Carpeta de Google
            Drive&quot;
          </li>
        </ol>
      </section>

      <section>
        <h3 className='text-xl font-bold mb-3'>Recomendaciones</h3>
        <ul className='list-disc pl-6 space-y-2'>
          <li>
            Usa <strong>slugs descriptivos</strong> pero cortos que indiquen el
            contenido (ej: <code>recursos-marketing</code>)
          </li>
          <li>
            Asegúrate de que la{" "}
            <strong>carpeta tiene permisos de acceso</strong> adecuados en
            Google Drive
          </li>
          <li>
            Proporciona un <strong>título claro</strong> para que los usuarios
            entiendan de qué trata el contenido
          </li>
          <li>
            Usa la <strong>descripción</strong> para añadir contexto o
            instrucciones sobre cómo utilizar los documentos
          </li>
        </ul>
      </section>
    </CardContent>
  </Card>
);

const GestionarRutasSection = () => (
  <Card>
    <CardHeader>
      <CardTitle id='gestionar-rutas'>Gestionar Rutas Existentes</CardTitle>
    </CardHeader>
    <CardContent className='space-y-6'>
      <section>
        <h3 className='text-xl font-bold mb-3'>Funciones Disponibles</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='border rounded-lg p-4'>
            <h4 className='font-semibold mb-2'>Editar Ruta</h4>
            <p className='text-sm mb-2'>
              Modifica la configuración de una ruta existente para cambiar su
              título, descripción, slug, etc.
            </p>
            <ol className='list-decimal pl-4 text-sm'>
              <li>Accede al panel de rutas</li>
              <li>Despliega el menú de acciones</li>
              <li>Selecciona &quot;Editar&quot;</li>
            </ol>
          </div>

          <div className='border rounded-lg p-4'>
            <h4 className='font-semibold mb-2'>Sincronizar con Drive</h4>
            <p className='text-sm mb-2'>
              Actualiza manualmente los datos para reflejar cambios recientes en
              Google Drive.
            </p>
            <ol className='list-decimal pl-4 text-sm'>
              <li>Accede al panel de rutas</li>
              <li>Despliega el menú de acciones</li>
              <li>Selecciona &quot;Sincronizar con Drive&quot;</li>
            </ol>
          </div>

          <div className='border rounded-lg p-4'>
            <h4 className='font-semibold mb-2'>Ver JSON</h4>
            <p className='text-sm mb-2'>
              Examina los datos estructurados que se han obtenido de Google
              Drive.
            </p>
            <ol className='list-decimal pl-4 text-sm'>
              <li>Accede al panel de rutas</li>
              <li>Despliega el menú de acciones</li>
              <li>Selecciona &quot;Ver JSON&quot;</li>
            </ol>
          </div>

          <div className='border rounded-lg p-4'>
            <h4 className='font-semibold mb-2'>Eliminar Ruta</h4>
            <p className='text-sm mb-2'>
              Elimina permanentemente una ruta cuando ya no se necesite.
            </p>
            <ol className='list-decimal pl-4 text-sm'>
              <li>Accede al panel de rutas</li>
              <li>Despliega el menú de acciones</li>
              <li>Selecciona &quot;Eliminar&quot;</li>
              <li>Confirma la eliminación</li>
            </ol>
          </div>
        </div>
      </section>

      <section>
        <h3 className='text-xl font-bold mb-3'>Visitar la Ruta</h3>
        <p className='mb-2'>
          Después de crear o actualizar una ruta, puedes ver cómo se muestra al
          público:
        </p>
        <ol className='list-decimal pl-6 space-y-1'>
          <li>En el panel de rutas, despliega el menú de acciones</li>
          <li>
            Selecciona &quot;Visitar ruta&quot; para abrir la página en una
            nueva pestaña
          </li>
          <li>
            Alternativamente, puedes navegar directamente a{" "}
            <code>https://tudominio.com/[slug]</code>
          </li>
        </ol>
      </section>

      <section>
        <h3 className='text-xl font-bold mb-3'>Estadísticas</h3>
        <p>Cada ruta registra automáticamente estadísticas básicas:</p>
        <ul className='list-disc pl-6 space-y-1'>
          <li>
            <strong>Última actualización:</strong> Momento en que se sincronizó
            por última vez
          </li>
          <li>
            <strong>Contador de visitas:</strong> Número de veces que se ha
            accedido a la ruta
          </li>
        </ul>
      </section>
    </CardContent>
  </Card>
);

const SincronizacionSection = () => (
  <Card>
    <CardHeader>
      <CardTitle id='sincronizacion'>Sincronización</CardTitle>
    </CardHeader>
    <CardContent className='space-y-6'>
      <section>
        <h3 className='text-xl font-bold mb-3'>
          Cómo funciona la sincronización
        </h3>
        <p className='mb-4'>
          El sistema mantiene actualizados los datos de Google Drive mediante
          dos métodos:
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='border rounded-lg p-4 bg-blue-50'>
            <h4 className='font-semibold mb-2'>Sincronización Automática</h4>
            <ul className='list-disc pl-4 space-y-1'>
              <li>
                Se ejecuta <strong>cada 24 horas</strong>
              </li>
              <li>Actualiza todas las rutas activas</li>
              <li>No requiere acción manual</li>
              <li>Se ejecuta en horario de baja carga</li>
            </ul>
          </div>

          <div className='border rounded-lg p-4 bg-green-50'>
            <h4 className='font-semibold mb-2'>Sincronización Manual</h4>
            <ul className='list-disc pl-4 space-y-1'>
              <li>Iniciada por el administrador</li>
              <li>Ideal para ver cambios inmediatos</li>
              <li>Se realiza desde el panel de rutas</li>
              <li>Muestra notificación de resultado</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className='text-xl font-bold mb-3'>
          ¿Cuándo realizar sincronización manual?
        </h3>
        <p className='mb-2'>
          La sincronización manual es útil en estos escenarios:
        </p>
        <ul className='list-disc pl-6 space-y-1'>
          <li>
            <strong>Cambios importantes:</strong> Has añadido o modificado
            archivos críticos en Drive
          </li>
          <li>
            <strong>Reorganización:</strong> Has cambiado la estructura de
            carpetas en Drive
          </li>
          <li>
            <strong>Correcciones:</strong> Necesitas corregir errores
            rápidamente sin esperar la sincronización automática
          </li>
          <li>
            <strong>Nuevas rutas:</strong> Tras crear una ruta, para cargar los
            datos iniciales
          </li>
        </ul>
      </section>

      <section>
        <h3 className='text-xl font-bold mb-3'>Solución de problemas</h3>
        <div className='bg-slate-50 p-4 rounded-lg border border-slate-200'>
          <h4 className='font-semibold mb-2'>
            ¿Problemas con la sincronización?
          </h4>
          <p className='mb-2'>
            Si experimentas problemas con la sincronización, prueba estos pasos:
          </p>
          <ol className='list-decimal pl-6 space-y-1'>
            <li>Verifica que el ID de carpeta sea correcto</li>
            <li>Comprueba los permisos de acceso en Google Drive</li>
            <li>Intenta realizar una sincronización manual</li>
            <li>
              Revisa que la estructura de carpetas no haya cambiado
              significativamente
            </li>
            <li>
              Contacta al administrador del sistema si el problema persiste
            </li>
          </ol>
        </div>
      </section>
    </CardContent>
  </Card>
);

const PermisosSection = () => (
  <Card>
    <CardHeader>
      <CardTitle id='permisos'>Permisos de Google Drive</CardTitle>
    </CardHeader>
    <CardContent className='space-y-6'>
      <section>
        <h3 className='text-xl font-bold mb-3'>Configuración de permisos</h3>
        <p className='mb-4'>
          Para que el sistema pueda acceder y mostrar el contenido de tus
          carpetas, asegúrate de configurar correctamente los permisos:
        </p>

        <h4 className='text-lg font-semibold mb-2'>Opciones de permisos:</h4>
        <div className='grid grid-cols-1 gap-4'>
          <div className='border rounded-lg p-4 bg-green-50'>
            <h5 className='font-semibold mb-1'>
              Opción recomendada: Compartir con la cuenta de servicio
            </h5>
            <p className='text-sm mb-2'>
              Compartir directamente con la cuenta de servicio del sistema:
            </p>
            <ol className='list-decimal pl-4 text-sm'>
              <li>En Google Drive, haz clic derecho en la carpeta</li>
              <li>Selecciona &quot;Compartir&quot;</li>
              <li>
                Introduce la dirección de correo de la cuenta de servicio:{" "}
                <code>g-drive@insiders-vercel.iam.gserviceaccount.com</code>
              </li>
              <li>Otorga permisos de &quot;Lector&quot;</li>
              <li>Haz clic en &quot;Listo&quot;</li>
            </ol>
          </div>

          <div className='border rounded-lg p-4 bg-yellow-50'>
            <h5 className='font-semibold mb-1'>
              Alternativa: Hacer la carpeta pública
            </h5>
            <p className='text-sm mb-2'>
              Si prefieres hacer la carpeta accesible para cualquiera con el
              enlace:
            </p>
            <ol className='list-decimal pl-4 text-sm'>
              <li>En Google Drive, haz clic derecho en la carpeta</li>
              <li>Selecciona &quot;Compartir&quot;</li>
              <li>
                Haz clic en &quot;Configuración general de uso compartido&quot;
              </li>
              <li>Cambia a &quot;Cualquiera con el enlace&quot;</li>
              <li>Asegúrate de que el rol sea &quot;Lector&quot;</li>
              <li>Haz clic en &quot;Listo&quot;</li>
            </ol>
            <p className='text-xs text-yellow-700 mt-2'>
              ⚠️ Ten en cuenta que esto hará que el contenido sea accesible para
              cualquier persona que tenga el enlace directo.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className='text-xl font-bold mb-3'>Verificar permisos</h3>
        <p className='mb-2'>
          Para comprobar que los permisos están configurados correctamente:
        </p>
        <ol className='list-decimal pl-6 space-y-1'>
          <li>Crea una ruta con el ID de carpeta</li>
          <li>Intenta sincronizar manualmente</li>
          <li>
            Si la sincronización tiene éxito, los permisos están correctos
          </li>
          <li>
            Si hay error, verifica que la cuenta de servicio tenga acceso a la
            carpeta
          </li>
        </ol>
      </section>

      <section>
        <h3 className='text-xl font-bold mb-3'>Limitaciones</h3>
        <div className='bg-slate-50 p-4 rounded-lg border border-slate-200'>
          <h4 className='font-semibold mb-2'>Ten en cuenta:</h4>
          <ul className='list-disc pl-6 space-y-1'>
            <li>
              Los archivos con restricciones adicionales podrían no ser
              accesibles
            </li>
            <li>
              Si cambias permisos en Drive, realiza una sincronización manual
            </li>
            <li>
              Algunas características avanzadas de Drive (como comentarios) no
              se mostrarán
            </li>
            <li>
              Los archivos muy grandes pueden tener limitaciones de
              visualización
            </li>
          </ul>
        </div>
      </section>
    </CardContent>
  </Card>
);

// Categorías para el sidebar
const userCategories = [
  {
    id: "basicos",
    title: "Conceptos Básicos",
    icon: <Info className='h-4 w-4' />,
    items: [
      {
        id: "introduccion",
        title: "Introducción",
        icon: <Info className='h-4 w-4' />,
      },
    ],
  },
  {
    id: "gestion",
    title: "Gestión de Rutas",
    icon: <Settings className='h-4 w-4' />,
    items: [
      {
        id: "crear-rutas",
        title: "Crear Rutas",
        icon: <FolderPlus className='h-4 w-4' />,
      },
      {
        id: "gestionar-rutas",
        title: "Gestionar Rutas",
        icon: <Settings className='h-4 w-4' />,
      },
    ],
  },
  {
    id: "avanzado",
    title: "Funciones Avanzadas",
    icon: <Settings className='h-4 w-4' />,
    items: [
      {
        id: "sincronizacion",
        title: "Sincronización",
        icon: <RefreshCw className='h-4 w-4' />,
      },
      {
        id: "permisos",
        title: "Permisos",
        icon: <Shield className='h-4 w-4' />,
      },
    ],
  },
];

// Componente principal
export default function BackendUserGuide() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("introduccion");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Determinar qué acordeón debe estar abierto basado en la sección activa
  const getExpandedValue = () => {
    for (const category of userCategories) {
      if (category.items.some((item) => item.id === activeSection)) {
        return [category.id];
      }
    }
    return [];
  };

  // Función para renderizar la sección activa
  const renderActiveSection = () => {
    switch (activeSection) {
      case "introduccion":
        return <IntroduccionSection />;
      case "crear-rutas":
        return <CrearRutasSection />;
      case "gestionar-rutas":
        return <GestionarRutasSection />;
      case "sincronizacion":
        return <SincronizacionSection />;
      case "permisos":
        return <PermisosSection />;
      default:
        return <IntroduccionSection />;
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold mb-2'>Guía de Usuario - Backend</h1>
        <p className='text-lg text-muted-foreground mb-6'>
          Administración y configuración del backend de Rutas de Drive.
        </p>

        <Alert>
          <InfoIcon className='h-4 w-4' />
          <AlertTitle>Documentación en desarrollo</AlertTitle>
          <AlertDescription>
            Esta documentación está siendo actualizada constantemente. Última
            actualización: Abril 2024.
          </AlertDescription>
        </Alert>
      </div>

      <Tabs defaultValue='permissions' className='mt-6'>
        <TabsList className='grid w-full md:w-auto grid-cols-1 md:grid-cols-4'>
          <TabsTrigger value='permissions'>Permisos</TabsTrigger>
          <TabsTrigger value='configuration'>Configuración</TabsTrigger>
          <TabsTrigger value='monitoring'>Monitoreo</TabsTrigger>
          <TabsTrigger value='troubleshooting'>
            Solución de problemas
          </TabsTrigger>
        </TabsList>

        <TabsContent value='permissions' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Shield className='h-5 w-5 mr-2 text-blue-600' />
                Permisos de Google Drive
              </CardTitle>
              <CardDescription>
                Configuración de permisos para el acceso a carpetas
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <h3 className='text-lg font-medium'>Configuración de permisos</h3>
              <p>
                Para que el sistema pueda acceder y mostrar el contenido de tus
                carpetas, asegúrate de configurar correctamente los permisos:
              </p>

              <div className='bg-green-50 p-4 rounded-md border border-green-200'>
                <h4 className='font-medium text-green-800'>
                  Opción recomendada: Compartir con la cuenta de servicio
                </h4>
                <p className='text-green-700 mb-2'>
                  Compartir directamente con la cuenta de servicio del sistema:
                </p>
                <ol className='list-decimal ml-5 text-green-700 space-y-1'>
                  <li>En Google Drive, haz clic derecho en la carpeta</li>
                  <li>Selecciona "Compartir"</li>
                  <li>
                    Introduce la dirección de correo de la cuenta de servicio:{" "}
                    <code className='bg-green-100 px-1 rounded'>
                      g-drive@insiders-vercel.iam.gserviceaccount.com
                    </code>
                  </li>
                  <li>Otorga permisos de "Lector"</li>
                  <li>Haz clic en "Listo"</li>
                </ol>
              </div>

              <div className='bg-yellow-50 p-4 rounded-md border border-yellow-200 mt-4'>
                <h4 className='font-medium text-yellow-800'>
                  Alternativa: Hacer la carpeta pública
                </h4>
                <p className='text-yellow-700 mb-2'>
                  Si prefieres hacer la carpeta accesible para cualquiera con el
                  enlace:
                </p>
                <ol className='list-decimal ml-5 text-yellow-700 space-y-1'>
                  <li>En Google Drive, haz clic derecho en la carpeta</li>
                  <li>Selecciona "Compartir"</li>
                  <li>Haz clic en "Configuración general de uso compartido"</li>
                  <li>Cambia a "Cualquiera con el enlace"</li>
                  <li>Asegúrate de que el rol sea "Lector"</li>
                  <li>Haz clic en "Listo"</li>
                </ol>
                <p className='text-yellow-600 mt-2 text-sm flex items-center'>
                  <AlertTriangle className='h-4 w-4 mr-1' /> Ten en cuenta que
                  esto hará que el contenido sea accesible para cualquier
                  persona que tenga el enlace directo.
                </p>
              </div>

              <h3 className='text-lg font-medium mt-6'>Verificar permisos</h3>
              <p>
                Para comprobar que los permisos están configurados
                correctamente:
              </p>
              <ol className='list-decimal pl-6 space-y-1'>
                <li>Crea una ruta con el ID de carpeta</li>
                <li>Intenta sincronizar manualmente</li>
                <li>
                  Si la sincronización tiene éxito, los permisos están correctos
                </li>
                <li>
                  Si hay error, verifica que la cuenta de servicio tenga acceso
                  a la carpeta
                </li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='configuration' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Settings className='h-5 w-5 mr-2 text-slate-600' />
                Configuración del sistema
              </CardTitle>
              <CardDescription>
                Opciones de configuración avanzadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground italic'>
                Contenido en desarrollo. Esta sección explicará las diferentes
                opciones de configuración del sistema backend.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='monitoring' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Bookmark className='h-5 w-5 mr-2 text-indigo-600' />
                Monitoreo y auditoría
              </CardTitle>
              <CardDescription>Seguimiento de actividad y uso</CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground italic'>
                Contenido en desarrollo. Esta sección explicará cómo monitorear
                el uso del sistema y revisar registros de actividad.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='troubleshooting' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <AlertTriangle className='h-5 w-5 mr-2 text-amber-600' />
                Solución de problemas comunes
              </CardTitle>
              <CardDescription>
                Respuestas a problemas frecuentes del backend
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground italic'>
                Contenido en desarrollo. Esta sección proporcionará respuestas a
                preguntas frecuentes y soluciones a problemas comunes del
                backend.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
