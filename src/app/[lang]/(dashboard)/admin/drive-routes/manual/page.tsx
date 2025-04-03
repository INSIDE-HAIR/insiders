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
            contenido de Google Drive a través de rutas personalizadas. Por
            ejemplo, puedes tener rutas como:
          </p>
          <ul>
            <li>
              <code>/marketing/marketing-salon/</code> - Accede al contenido de
              marketing para salones
            </li>
            <li>
              <code>/academy/ibm/</code> - Contenido formativo específico para
              IBM
            </li>
            <li>
              <code>/eventos/lmadrid/</code> - Archivos relacionados con eventos
              en Madrid
            </li>
          </ul>
          <p>
            Cada ruta se conecta a una carpeta específica de Google Drive,
            permitiendo un acceso organizado a diferentes secciones de
            contenido.
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
                En el panel de administración, haz clic en el botón &quot;Agregar
                Ruta&quot; y completa los siguientes campos:
              </p>
              <ul>
                <li>
                  <strong>Tipo de Ruta:</strong> Categoría principal (ej:
                  marketing, academy, eventos)
                </li>
                <li>
                  <strong>Subtipo:</strong> Subcategoría específica (ej:
                  marketing-salon, ibm, lmadrid)
                </li>
                <li>
                  <strong>Nombre para Mostrar:</strong> Nombre amigable que
                  verán los usuarios
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
                generará la URL <code>/[lang]/[routeType]/[routeSubtype]/</code>{" "}
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
              <code>/es/marketing/marketing-salon/</code> - Vista principal del
              contenido
            </li>
            <li>
              <code>/es/marketing/marketing-salon/folders/[id]</code> - Vista de
              una carpeta específica
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
              <strong>Carga bajo demanda:</strong> El contenido se carga
              progresivamente al expandir carpetas
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
              <strong>Duración de la caché:</strong>
              <ul>
                <li>Las rutas principales tienen una caché que dura 4 horas</li>
                <li>
                  Las carpetas específicas tienen una caché que dura 2 horas
                </li>
              </ul>
            </li>
            <li>
              <strong>Invalidación de caché:</strong> Puedes invalidar
              manualmente la caché de una ruta específica usando el botón de
              actualización
            </li>
            <li>
              <strong>Limpieza de caché:</strong> El sistema limpia
              automáticamente las entradas de caché antiguas para mantener un
              rendimiento óptimo
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
                administración.
              </p>
            </div>

            <div className='p-4 border rounded-lg bg-gray-50'>
              <h4 className='font-semibold flex items-center'>
                <span className='text-red-500 mr-2'>●</span>
                Una ruta muestra un error 404
              </h4>
              <p className='mt-1'>
                <strong>Solución:</strong> Verifica que la ruta esté
                configurada correctamente y que el estado esté &quot;Activo&quot;
                en el panel.
              </p>
            </div>

            <div className='p-4 border rounded-lg bg-gray-50'>
              <h4 className='font-semibold flex items-center'>
                <span className='text-red-500 mr-2'>●</span>
                El sistema se vuelve lento al cargar carpetas con muchos
                archivos
              </h4>
              <p className='mt-1'>
                <strong>Solución:</strong> Reduce la &quot;Profundidad por
                Defecto&quot; en la configuración de la ruta para limitar la
                cantidad de datos cargados inicialmente.
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
                Configurar cada ruta con su tipo, subtipo y carpeta raíz
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
                Monitorear el rendimiento y limpiar la caché periódicamente
              </span>
            </li>
            <li className='flex items-start'>
              <CheckCircle2 className='h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5' />
              <span>
                Ajustar la configuración de profundidad según las necesidades
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
