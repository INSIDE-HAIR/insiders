import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { CheckCircle, Star, Users, Clock, Award, Target } from "lucide-react";

export default function MasterSalonExperiencePage() {
  const tarifas = [
    {
      nombre: "Tarifa Principal",
      precio: "2.537,37€",
      precioSinIva: "2.097,00€",
      descripcion: "Precio público estándar",
      popular: false,
    },
    {
      nombre: "Tarifa Contado",
      precio: "2.030,77€",
      precioSinIva: "1.678,32€",
      descripcion: "Pago único anticipado",
      descuento: "-20%",
      popular: true,
    },
    {
      nombre: "Tarifa Club Inside",
      precio: "1.858,15€",
      precioSinIva: "1.535,66€",
      descripcion: "Miembros del Club Inside",
      descuento: "-27%",
      popular: false,
    },
    {
      nombre: "Tarifa Contado + Club",
      precio: "1.523,08€",
      precioSinIva: "1.258,74€",
      descripcion: "Máximo descuento disponible",
      descuento: "-40%",
      popular: false,
    },
  ];

  const caracteristicas = [
    "Programa formativo online en vivo de 12 semanas",
    "Modelo de salón disruptivo y diferenciado",
    "Desarrollo de experiencias únicas para el cliente",
    "Búsqueda de la excelencia en todos los procesos",
    "Clases grabadas de cada módulo",
    "Ejercicios prácticos y plantillas",
    "Guías de implementación paso a paso",
    "Mentorías de implementación personalizadas",
    "Trabajo fin de máster",
    "Certificación de conocimientos",
    "Certificación de finalización",
  ];

  const beneficios = [
    {
      icon: <Target className="h-6 w-6" />,
      titulo: "Diferenciación Competitiva",
      descripcion:
        "Crea un modelo de salón único que te diferencia de la competencia",
    },
    {
      icon: <Star className="h-6 w-6" />,
      titulo: "Experiencias Premium",
      descripcion:
        "Desarrolla experiencias únicas que fidelizan a tus clientes",
    },
    {
      icon: <Users className="h-6 w-6" />,
      titulo: "Excelencia Operativa",
      descripcion: "Implementa procesos orientados a la máxima calidad",
    },
    {
      icon: <Award className="h-6 w-6" />,
      titulo: "Certificación Oficial",
      descripcion:
        "Obtén tu certificación como Especialista en Experiencia de Salón",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center gap-2 mb-6">
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                🎓 FORMATIVO
              </Badge>
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                ⚡ INTENSIVO
              </Badge>
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                💎 PREMIUM
              </Badge>
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                🎪 EXPERIENCIAL
              </Badge>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Master SALÓN <span className="text-primary">EXPERIENCE</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Programa formativo online en vivo de 12 semanas para crear e
              implementar un modelo de salón disruptivo, desarrollando
              experiencias únicas para el cliente en búsqueda de la excelencia.
            </p>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>12 semanas</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Online en vivo</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>Certificación incluida</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              ¿Qué incluye el programa?
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                {caracteristicas.slice(0, 6).map((caracteristica, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {caracteristica}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {caracteristicas.slice(6).map((caracteristica, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {caracteristica}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Beneficios clave del programa
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {beneficios.map((beneficio, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="flex justify-center text-primary mb-4">
                      {beneficio.icon}
                    </div>
                    <CardTitle className="text-lg">
                      {beneficio.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {beneficio.descripcion}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Precios */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Opciones de inversión
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tarifas.map((tarifa, index) => (
                <Card
                  key={index}
                  className={`relative ${
                    tarifa.popular ? "border-primary shadow-lg" : ""
                  }`}
                >
                  {tarifa.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        MÁS POPULAR
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <CardTitle className="text-lg">{tarifa.nombre}</CardTitle>
                    <CardDescription>{tarifa.descripcion}</CardDescription>
                  </CardHeader>

                  <CardContent className="text-center">
                    <div className="mb-4">
                      {tarifa.descuento && (
                        <div className="text-sm text-primary font-semibold mb-1">
                          {tarifa.descuento}
                        </div>
                      )}
                      <div className="text-3xl font-bold text-primary">
                        {tarifa.precio}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ({tarifa.precioSinIva} + IVA)
                      </div>
                    </div>

                    <Button
                      className={`w-full ${
                        tarifa.popular ? "bg-primary" : "variant-outline"
                      }`}
                      variant={tarifa.popular ? "default" : "outline"}
                    >
                      Solicitar información
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground mb-4">
                ¿Necesitas financiación? Ofrecemos planes de pago personalizados
              </p>
              <Button size="lg">Consultoría gratuita</Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              ¿Listo para transformar tu salón en una experiencia única?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Únete a los profesionales que ya han revolucionado su negocio con
              nuestro método exclusivo de experiencias premium.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Descargar programa completo
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Agendar llamada
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
