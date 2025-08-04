"use client";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/src/components/ui/card";
import { Icons } from "@/src/components/shared/icons";

export default function MarketingStrategyGenerator() {
  const [salonDescription, setSalonDescription] = useState("");
  const [marketingIdeas, setMarketingIdeas] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateIdeas = async () => {
    if (!salonDescription) return;
    setIsLoading(true);
    setMarketingIdeas("");

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Placeholder marketing ideas - replace Google AI call
    const placeholderIdeas = `
      <ol class="list-decimal pl-5 space-y-3">
        <li><strong>Programa de Referidos VIP:</strong> Incentiva a tus clientes actuales a traer amigos con descuentos exclusivos o servicios extra. Crea un sistema de puntos acumulables.</li>
        <li><strong>Colaboraciones Locales Estratégicas:</strong> Asóciate con negocios complementarios (boutiques, spas, wedding planners) para ofrecer paquetes conjuntos o promociones cruzadas.</li>
        <li><strong>Contenido Educativo en Redes Sociales:</strong> Publica tutoriales rápidos, consejos de cuidado capilar y transformaciones (antes y después) para posicionarte como experto y atraer engagement.</li>
      </ol>
      <p class="mt-4">Estas son ideas iniciales. Para una estrategia completa, considera nuestros <a href="#metodo" class="text-primary hover:underline">programas de marketing avanzado</a>.</p>
    `;
    setMarketingIdeas(placeholderIdeas);
    setIsLoading(false);
  };

  return (
    <section
      id="recursos"
      className="py-20 md:py-28 bg-secondary/20 text-foreground"
    >
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold">
          Generador de Estrategias de Marketing
        </h2>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto mb-12 text-lg">
          Describe tu salón en pocas palabras y te daremos 3 ideas de marketing
          personalizadas para empezar a implementar hoy mismo.
        </p>
        <div className="max-w-2xl mx-auto space-y-4">
          <Textarea
            placeholder="Ej: Salón de lujo en el centro de la ciudad, especializado en coloración y tratamientos capilares para un público de alto poder adquisitivo."
            value={salonDescription}
            onChange={(e) => setSalonDescription(e.target.value)}
            className="text-base min-h-[100px] bg-background border-border focus:ring-primary"
          />
          <Button
            size="lg"
            onClick={handleGenerateIdeas}
            disabled={isLoading || !salonDescription}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Icons.Sparkles className="mr-2 h-5 w-5" />
            {isLoading
              ? "Generando Estrategias..."
              : "Generar Ideas de Marketing"}
          </Button>
        </div>
        {marketingIdeas && !isLoading && (
          <Card className="mt-12 text-left bg-background border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Tus Ideas de Marketing Personalizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert text-muted-foreground [&_strong]:text-foreground/90 [&_li]:marker:text-primary"
                dangerouslySetInnerHTML={{ __html: marketingIdeas }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
