import { DocHeader } from "@/src/components/marketing-salon/docs/doc-header"
import { DocContent } from "@/src/components/marketing-salon/docs/doc-content"
import Link from "next/link"
import { ArrowRight, Users, Code } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"

export default function DocsPage() {
  return (
    <div>
      <DocHeader title="Documentación Marketing Salón" description="Guía completa para usuarios y desarrolladores" />

      <DocContent>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="bg-[#CEFF66] text-zinc-900">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Manual para Usuarios
              </CardTitle>
              <CardDescription className="text-zinc-700">Guía para el uso diario de la plataforma</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="mb-4">Aprende a utilizar la plataforma Marketing Salón, incluyendo:</p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Estructura de carpetas en Google Drive</li>
                <li>Convenciones de nomenclatura</li>
                <li>Uso del campo Description</li>
                <li>Tipos de componentes disponibles</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-black hover:bg-zinc-800 text-white rounded-none">
                <Link href="/docs/marketing-salon/users" className="flex items-center justify-center">
                  Ver manual de usuario
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="bg-[#CEFF66] text-zinc-900">
              <CardTitle className="flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Manual para Desarrolladores
              </CardTitle>
              <CardDescription className="text-zinc-700">
                Documentación técnica para extender la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="mb-4">Documentación técnica para desarrolladores, incluyendo:</p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Arquitectura del sistema</li>
                <li>Procesamiento del campo Description</li>
                <li>Cómo añadir nuevos tipos de componentes</li>
                <li>Estructura de archivos y componentes actuales</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-black hover:bg-zinc-800 text-white rounded-none">
                <Link href="/docs/marketing-salon/devs" className="flex items-center justify-center">
                  Ver manual de desarrollador
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DocContent>
    </div>
  )
}

