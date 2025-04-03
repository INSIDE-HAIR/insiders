"use client";

import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function DriveRoutesManual() {
  return (
    <div className='container mx-auto px-4 py-10 max-w-5xl'>
      <div className='mb-8 flex items-center'>
        <Button variant='outline' size='sm' asChild className='mr-4'>
          <Link href='/admin/drive-routes'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Volver al panel
          </Link>
        </Button>
        <h1 className='text-3xl font-bold'>
          Manual de Usuario - Rutas de Google Drive
        </h1>
      </div>

      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Introducción al Sistema de Rutas</CardTitle>
          <CardDescription>
            Descubre cómo funciona el sistema de múltiples rutas para acceder al
            contenido de Google Drive
          </CardDescription>
        </CardHeader>
        <CardContent className='prose max-w-none'>
          <p>
            Este sistema permite configurar múltiples puntos de acceso al
            contenido de Google Drive a través de rutas personalizadas de hasta
            5 niveles. Solo el primer nivel es obligatorio, los demás son
            opcionales. Por ejemplo, puedes tener rutas como:
          </p>
          <ul>
            <li>
              <code>/marketing/marketing-salon/</code> - Accede al contenido de
              marketing para salones (2 niveles)
            </li>
            <li>
              <code>/marketing/eventos/2023/</code> - Contenido de eventos de
              marketing del año 2023 (3 niveles)
            </li>
            <li>
              <code>/comunicacion/interna/2025/marzo/insiders/</code> -
              Comunicación interna para Insiders de marzo 2025 (5 niveles)
            </li>
          </ul>
          <p>
            Cada ruta se conecta a una carpeta específica de Google Drive,
            permitiendo un acceso organizado a diferentes secciones de
            contenido. La estructura de niveles permite una organización
            jerárquica y flexible que se adapta a tus necesidades.
          </p>
          <p>
            El nuevo sistema de carga optimizada permite una navegación
            instantánea sin esperas al expandir carpetas, ya que todo el
            contenido se carga de una sola vez, aprovechando el sistema de caché
            para un rendimiento óptimo.
          </p>
        </CardContent>
      </Card>

      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Creación de Rutas</CardTitle>
          <CardDescription>
            Cómo crear y configurar nuevas rutas de acceso
          </CardDescription>
        </CardHeader>
        <CardContent className='prose max-w-none'>
          <h3>Paso a paso para crear una ruta</h3>
          <ol>
            <li>
              <strong>Identificar la carpeta en Google Drive</strong>
              <p>
                Primero, identifica la carpeta de Google Drive a la que quieres
                conectar. Necesitarás el ID de la carpeta, que puedes obtener de
                la URL cuando estás viendo la carpeta en Google Drive.
              </p>
              <p className='text-sm text-gray-500'>
                Ejemplo: En la URL{" "}
                <code>
                  https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i
                </code>
                , el ID es <code>1a2b3c4d5e6f7g8h9i</code>
              </p>
            </li>
            <li>
              <strong>Agregar nueva ruta</strong>
              <p>
                En el panel de administración, haz clic en el botón &quot;Crear
                Nueva Ruta&quot; y completa los siguientes campos:
              </p>
              <ul>
                <li>
                  <strong>Nivel 1 de Ruta:</strong> Categoría principal
                  (obligatorio, ej: marketing, academy, eventos)
                </li>
                <li>
                  <strong>Nivel 2 de Ruta:</strong> Primera subcategoría
                  (opcional, ej: marketing-salon, ibm, lmadrid)
                </li>
                <li>
                  <strong>Nivel 3 de Ruta:</strong> Segunda subcategoría
                  (opcional, ej: 2025)
                </li>
                <li>
                  <strong>Nivel 4 de Ruta:</strong> Tercera subcategoría
                  (opcional, ej: marzo)
                </li>
                <li>
                  <strong>Nivel 5 de Ruta:</strong> Cuarta subcategoría
                  (opcional, ej: insiders)
                </li>
                <li>
                  <strong>Título:</strong> Nombre amigable que verán los
                  usuarios
                </li>
                <li>
                  <strong>ID de Carpeta Raíz:</strong> El ID de la carpeta de
                  Google Drive
                </li>
                <li>
                  <strong>Profundidad por Defecto:</strong> Cuántos niveles de
                  carpetas se cargarán inicialmente
                </li>
              </ul>
            </li>
            <li>
              <strong>Guardar la configuración</strong>
              <p>
                Haz clic en &quot;Guardar&quot; para crear la ruta. Esto
                generará la URL basada en los niveles de ruta que has
                configurado, como{" "}
                <code>
                  /[lang]/marketing/marketing-salon/2025/marzo/insiders
                </code>{" "}
                donde los usuarios podrán acceder al contenido.
              </p>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Acceso y Navegación</CardTitle>
          <CardDescription>
            Cómo los usuarios acceden y navegan por el contenido
          </CardDescription>
        </CardHeader>
        <CardContent className='prose max-w-none'>
          <p>
            Una vez configurada una ruta, los usuarios pueden acceder al
            contenido a través de URLs como:
          </p>
          <ul>
            <li>
              <code>/es/marketing/marketing-salon/2025/marzo/insiders</code> -
              Vista principal del contenido
            </li>
            <li>
              <code>
                /es/marketing/marketing-salon/2025/marzo/insiders/folders/[id]
              </code>{" "}
              - Vista de una carpeta específica
            </li>
          </ul>

          <h3>Características de navegación</h3>
          <ul>
            <li>
              <strong>Vista en acordeón:</strong> El contenido se muestra en un
              formato de acordeón expandible
            </li>
            <li>
              <strong>Vista JSON:</strong> Los usuarios pueden alternar a una
              vista JSON para inspeccionar la estructura de datos
            </li>
            <li>
              <strong>Carga optimizada:</strong> El contenido se carga
              completamente en la primera solicitud para navegación instantánea
            </li>
            <li>
              <strong>Caché inteligente:</strong> El sistema almacena en caché
              las estructuras de carpetas para mejorar el rendimiento
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Gestión de Caché</CardTitle>
          <CardDescription>
            Optimización del rendimiento y gestión de la caché
          </CardDescription>
        </CardHeader>
        <CardContent className='prose max-w-none'>
          <p>
            El sistema implementa un sofisticado mecanismo de caché para mejorar
            el rendimiento:
          </p>

          <h3>Información importante sobre la caché</h3>
          <ul>
            <li>
              <strong>Tipos de caché:</strong>
              <ul>
                <li>
                  Caché de rutas: Almacena el contenido de una ruta específica
                </li>
                <li>
                  Caché de jerarquía: Almacena la estructura de carpetas y
                  archivos
                </li>
              </ul>
            </li>
            <li>
              <strong>Duración de la caché:</strong>
              <ul>
                <li>Las rutas principales tienen una caché que dura 4 horas</li>
                <li>
                  Las carpetas específicas tienen una caché que dura 2 horas
                </li>
              </ul>
            </li>
            <li>
              <strong>Invalidación de caché:</strong> Al hacer clic en el botón
              de actualización, se invalidan tanto la caché de la ruta como las
              jerarquías asociadas
            </li>
            <li>
              <strong>Estado de carga:</strong> Los botones de actualización
              mostrarán un estado de carga mientras se procesa la invalidación
              de caché
            </li>
          </ul>

          <h3>Herramientas de caché</h3>
          <p>
            En el panel de administración dispones de dos herramientas
            principales:
          </p>
          <ul>
            <li>
              <strong>Invalidar Toda la Caché:</strong> Fuerza la actualización
              de todos los datos en el próximo acceso
            </li>
            <li>
              <strong>Eliminar Caché Antigua:</strong> Elimina entradas de caché
              con baja frecuencia de uso o muy antiguas
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Solución de Problemas</CardTitle>
          <CardDescription>
            Guía para resolver problemas comunes
          </CardDescription>
        </CardHeader>
        <CardContent className='prose max-w-none'>
          <h3>Problemas comunes y soluciones</h3>

          <div className='space-y-4'>
            <div className='p-4 border rounded-lg bg-gray-50'>
              <h4 className='font-semibold flex items-center'>
                <span className='text-red-500 mr-2'>●</span>
                El contenido no se actualiza aunque haya cambios en Google Drive
              </h4>
              <p className='mt-1'>
                <strong>Solución:</strong> Invalidar la caché de la ruta
                específica usando el botón de actualización en el panel de
                administración. El botón mostrará un estado de carga mientras se
                procesa.
              </p>
            </div>

            <div className='p-4 border rounded-lg bg-gray-50'>
              <h4 className='font-semibold flex items-center'>
                <span className='text-red-500 mr-2'>●</span>
                Una ruta muestra un error 404
              </h4>
              <p className='mt-1'>
                <strong>Solución:</strong> Verifica que la ruta esté configurada
                correctamente y que el estado esté &quot;Activo&quot; en el
                panel. Confirma que todos los niveles de ruta están
                correctamente escritos.
              </p>
            </div>

            <div className='p-4 border rounded-lg bg-gray-50'>
              <h4 className='font-semibold flex items-center'>
                <span className='text-red-500 mr-2'>●</span>
                El sistema se vuelve lento al cargar carpetas con muchos
                archivos
              </h4>
              <p className='mt-1'>
                <strong>Solución:</strong> La carga optimizada ya no debería
                presentar este problema, pero si ocurre, reduce la
                &quot;Profundidad por Defecto&quot; en la configuración de la
                ruta.
              </p>
            </div>

            <div className='p-4 border rounded-lg bg-gray-50'>
              <h4 className='font-semibold flex items-center'>
                <span className='text-red-500 mr-2'>●</span>
                No se puede acceder a ciertos archivos o carpetas
              </h4>
              <p className='mt-1'>
                <strong>Solución:</strong> Asegúrate de que la cuenta de
                servicio de Google Drive tiene acceso a esos archivos o
                carpetas.
              </p>
            </div>

            <div className='p-4 border rounded-lg bg-gray-50'>
              <h4 className='font-semibold flex items-center'>
                <span className='text-red-500 mr-2'>●</span>
                Los botones de invalidación de caché parecen no responder
              </h4>
              <p className='mt-1'>
                <strong>Solución:</strong> Los botones se desactivan durante el
                proceso de invalidación para evitar múltiples solicitudes.
                Espera a que termine el proceso actual, indicado por el icono de
                carga.
              </p>
            </div>

            <div className='p-4 border rounded-lg bg-gray-50'>
              <h4 className='font-semibold flex items-center'>
                <span className='text-red-500 mr-2'>●</span>
                Cambios en la estructura de Google Drive no se reflejan
                automáticamente
              </h4>
              <p className='mt-1'>
                <strong>Solución:</strong> El sistema utiliza caché para mejorar
                el rendimiento. Cuando hagas cambios en Google Drive, utiliza el
                botón de invalidación de caché para que los cambios se reflejen
                inmediatamente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de Pasos a Seguir</CardTitle>
          <CardDescription>
            Lista de verificación para configurar y mantener el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='space-y-3'>
            <li className='flex items-start'>
              <CheckCircle2 className='h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5' />
              <span>
                Identificar las carpetas de Google Drive que deseas exponer
              </span>
            </li>
            <li className='flex items-start'>
              <CheckCircle2 className='h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5' />
              <span>
                Configurar cada ruta con sus niveles de acceso (nivel 1
                obligatorio, niveles 2-5 opcionales)
              </span>
            </li>
            <li className='flex items-start'>
              <CheckCircle2 className='h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5' />
              <span>Probar el acceso a cada ruta configurada</span>
            </li>
            <li className='flex items-start'>
              <CheckCircle2 className='h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5' />
              <span>Compartir las URLs con los usuarios correspondientes</span>
            </li>
            <li className='flex items-start'>
              <CheckCircle2 className='h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5' />
              <span>
                Invalidar la caché cuando se hagan cambios importantes en Google
                Drive
              </span>
            </li>
            <li className='flex items-start'>
              <CheckCircle2 className='h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5' />
              <span>
                Ajustar la configuración de profundidad según las necesidades
              </span>
            </li>
            <li className='flex items-start'>
              <CheckCircle2 className='h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5' />
              <span>
                Utilizar el sistema de carga optimizada para mejor experiencia
                de usuario
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
