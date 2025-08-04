import { Icons } from "@/src/components/shared/icons";

export default function ProblemSection() {
  const problems = [
    "Sientes que trabajas sin parar, pero la rentabilidad no lo refleja.",
    "Tu equipo depende constantemente de ti para tomar decisiones.",
    "Inviertes en marketing pero no atraes a los clientes que realmente quieres.",
    "Te sientes abrumado por la gestión, apagando fuegos en lugar de crear estrategias.",
    "No tienes un plan claro a 1, 3 o 5 años. Operas por inercia.",
  ];
  return (
    <section className="py-20 md:py-28 bg-background text-foreground">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold">
            ¿Atrapado en el <span className="text-primary">día a día</span> de
            tu salón?
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Si gestionas un salón, esto te sonará. Marca las casillas que
            definen tu realidad:
          </p>
        </div>
        <div className="max-w-2xl mx-auto space-y-4">
          {problems.map((problem, index) => (
            <label
              key={index}
              className="flex items-start p-5 sm:p-6 bg-secondary/30 border border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors group"
            >
              {/* For actual checkbox functionality, you'd need state and an input */}
              <Icons.CheckSquare className="text-muted-foreground/70 group-hover:text-primary mt-1 flex-shrink-0 h-5 w-5 sm:h-6 sm:w-6" />
              <span className="ml-4 text-base sm:text-lg text-foreground/90">
                {problem}
              </span>
            </label>
          ))}
        </div>
        <p className="text-center text-md sm:text-lg text-muted-foreground mt-12">
          Si has marcado más de una, no estás solo. Es el síntoma de que tu
          negocio ha superado sus sistemas. <br className="hidden sm:inline" />{" "}
          La buena noticia es que tiene solución.
        </p>
      </div>
    </section>
  );
}
