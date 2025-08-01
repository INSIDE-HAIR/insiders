import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/src/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar"; // Using Shadcn Avatar

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "Estaba estancado. Con el programa 'Salón HIPERVENTAS', aumentamos el ticket medio un 35% en solo 3 meses. Es la mejor inversión que he hecho en mi negocio, sin duda.",
      name: "Carlos A.",
      role: "Salón Crecimiento Rápido",
      avatarText: "CA",
      avatarImage: "https://source.unsplash.com/random/40x40?Portrait",
    },
    {
      quote:
        "Gestionar dos salones era un caos. El 'Master SCALING' me dio la visión y los sistemas para delegar con confianza y empezar a planificar la apertura del tercero.",
      name: "Ana E.",
      role: "Grupo de Salones Visión",
      avatarText: "AE",
      avatarImage: "https://source.unsplash.com/random/40x40?Portrait",
    },
    {
      quote:
        "Empezar daba miedo. El 'Plan de Negocio' fue mi hoja de ruta. Me ahorró errores carísimos y me dio la seguridad para lanzar mi proyecto con una base sólida.",
      name: "María G.",
      role: "Mi Nuevo Salón",
      avatarText: "MG",
      avatarImage: "https://source.unsplash.com/random/40x40?Portrait",
    },
  ];

  return (
    <section
      id="exito"
      className="py-20 md:py-28 bg-background text-foreground"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold">
            Dueños de salones que ya{" "}
            <span className="text-primary">han tomado el control</span>.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-secondary/30 border-border flex flex-col"
            >
              <CardContent className="pt-6 flex-grow">
                <blockquote className="text-base sm:text-lg text-muted-foreground italic">
                  &quot;{testimonial.quote}&quot;
                </blockquote>
              </CardContent>
              <CardHeader>
                <div className="flex items-center">
                  <Avatar>
                    <AvatarImage
                      src={testimonial.avatarImage || "/placeholder.svg"}
                      alt={testimonial.name}
                    />
                    <AvatarFallback>{testimonial.avatarText}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <CardTitle className="text-md sm:text-lg text-foreground">
                      {testimonial.name}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                      {testimonial.role}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
