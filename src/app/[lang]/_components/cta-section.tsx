import { Button } from "@/src/components/ui/button";
import { Icons } from "@/src/components/shared/icons";

export default function CtaSection() {
  return (
    <section className="py-20 md:py-28 bg-background text-foreground">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold">
          ¿Listo para transformar tu salón?
        </h2>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto mb-10 text-lg">
          Realiza el diagnóstico gratuito y sin compromiso. Descubre en menos de
          2 minutos los puntos ciegos de tu negocio y cómo podemos ayudarte a
          solucionarlos.
        </p>
        <Button
          size="lg"
          asChild
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <a href="#para-quien">
            Empezar mi Diagnóstico Ahora{" "}
            <Icons.ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </Button>
      </div>
    </section>
  );
}
