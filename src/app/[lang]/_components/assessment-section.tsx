"use client";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/src/components/ui/card";
import { Icons } from "@/src/components/shared/icons";

export default function AssessmentSection() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const personas = [
    {
      id: "emprendedor",
      icon: "🌱",
      title: "Acabo de empezar",
      description: "Necesito orientación clara y un plan estructurado.",
    },
    {
      id: "acelerador",
      icon: "🚀",
      title: "Quiero crecer rápido",
      description: "Mi negocio está establecido, busco acelerar resultados.",
    },
    {
      id: "estratega",
      icon: "🧭",
      title: "Gestiono varios salones",
      description: "Necesito sistemas y planificación estratégica.",
    },
    {
      id: "digital",
      icon: "💻",
      title: "Busco dominar lo digital",
      description: "Quiero integrar y optimizar mi marketing online.",
    },
    {
      id: "experto",
      icon: "👑",
      title: "Soy experto del sector",
      description: "Busco una transformación para modernizarme.",
    },
  ];

  const handlePersonaAnalysis = async () => {
    if (!selectedPersona) return;
    setIsLoading(true);
    setAnalysis("");

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const personaData = personas.find((p) => p.id === selectedPersona);
    // Placeholder analysis - replace Google AI call
    const placeholderAnalysis = `
      <h3>Desafíos Comunes para: ${personaData?.title}</h3>
      <ul>
        <li> desafío común 1 específico para este perfil.</li>
        <li> desafío común 2 que suele enfrentar este tipo de salón.</li>
        <li> desafío común 3 relacionado con sus objetivos.</li>
      </ul>
      <h3>Oportunidades Clave</h3>
      <ul>
        <li> oportunidad clave 1 al implementar nuestros sistemas.</li>
        <li> oportunidad clave 2 para mejorar la rentabilidad.</li>
        <li> oportunidad clave 3 para el crecimiento estratégico.</li>
      </ul>
      <p class="mt-4">Este es un análisis preliminar. <strong>Agenda una consultoría gratuita</strong> para un plan detallado.</p>
    `;
    setAnalysis(placeholderAnalysis);
    setIsLoading(false);
  };

  return (
    <section
      id="para-quien"
      className="py-20 md:py-28 bg-background text-foreground"
    >
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold">
          Sea cual sea tu objetivo, tenemos un plan para ti.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto mb-12 text-lg">
          Elige la opción que mejor te describe para descubrir el camino más
          directo hacia tus metas.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {personas.map((persona) => (
            <button
              key={persona.id}
              onClick={() => setSelectedPersona(persona.id)}
              className={cn(
                "p-6 bg-secondary/30 border border-border rounded-lg text-left hover:-translate-y-1 transition-transform duration-300 group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                selectedPersona === persona.id
                  ? "border-primary ring-2 ring-primary"
                  : "hover:border-border/70"
              )}
            >
              <span className="text-4xl block mb-4">{persona.icon}</span>
              <h3 className="font-bold text-xl text-foreground mb-2">
                {persona.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {persona.description}
              </p>
            </button>
          ))}
        </div>
        {selectedPersona && (
          <div className="mt-12 max-w-3xl mx-auto">
            <Button
              size="lg"
              onClick={handlePersonaAnalysis}
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Icons.Sparkles className="mr-2 h-5 w-5" />
              {isLoading
                ? "Analizando tu Potencial..."
                : "Analizar mi Potencial"}
            </Button>
            {analysis && !isLoading && (
              <Card className="mt-8 text-left bg-secondary/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Análisis de Potencial para:{" "}
                    <span className="text-primary">
                      {personas.find((p) => p.id === selectedPersona)?.title}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert text-muted-foreground [&_h3]:text-foreground [&_h3]:font-semibold [&_li]:marker:text-primary"
                    dangerouslySetInnerHTML={{ __html: analysis }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// Helper function for cn if not available globally in this component context
const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");
