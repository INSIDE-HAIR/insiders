import { Button } from "@/src/components/ui/button";
import { Icons } from "@/src/components/shared/icons";

export default function HeroSection() {
  return (
    <section className="bg-background text-foreground py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://source.unsplash.com/random/1920x1080?Abstract+Business+Consulting')] bg-cover bg-center opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
      <div className="container mx-auto px-6 text-center relative z-10">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-tight">
          Transformamos tu salón en un{" "}
          <span className="text-primary">negocio rentable</span>
        </h1>
        <p className="max-w-3xl mx-auto mt-6 text-lg md:text-xl text-muted-foreground">
          Deja de ser el empleado más caro de tu peluquería. Te damos el sistema
          de gestión, el control financiero y el plan de marketing para que
          dirijas el negocio que siempre has soñado.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Button
            size="lg"
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <a href="#para-quien">Empezar el Diagnóstico</a>
          </Button>
          <Button
            variant="outline"
            size="lg"
            asChild
            className="border-primary text-primary hover:bg-primary/10"
          >
            {/* This link should ideally go to a programs page */}
            <a href="#metodo">
              Ver Programas <Icons.ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
