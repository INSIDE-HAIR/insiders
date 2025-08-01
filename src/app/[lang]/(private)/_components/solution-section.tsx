import { Icons } from "@/src/components/shared/icons"

export default function SolutionSection() {
  const areas = [
    "Finanzas y Rentabilidad",
    "Marketing y Ventas",
    "Productividad y Sistemas",
    "Equipo y Liderazgo",
    "Estrategia de Crecimiento",
  ]

  return (
    <section id="metodo" className="py-20 md:py-28 bg-background text-foreground overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              El sistema de resultados garantizados: <br />
              Método <span className="text-primary">SALÓN 360°</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              No es un curso más, es un sistema de implementación. Te entregamos los procesos, las herramientas y el
              acompañamiento para tomar el control de las 5 áreas clave de tu negocio, transformando tu salón en una
              empresa rentable y autónoma.
            </p>
            <div className="space-y-3">
              {areas.map((area) => (
                <p key={area} className="flex items-center text-lg text-foreground/90">
                  <Icons.CheckSquare className="text-primary mr-3 h-5 w-5 flex-shrink-0" /> {area}
                </p>
              ))}
            </div>
          </div>
          <div className="relative flex items-center justify-center h-80 w-80 md:h-96 md:w-96 mx-auto">
            <div className="absolute inset-0 border-2 border-dashed border-border/50 rounded-full animate-spin [animation-duration:40s]"></div>
            <div className="absolute w-[75%] h-[75%] border border-border/30 rounded-full"></div>
            <div className="absolute text-center">
              <p className="font-bold text-xl text-primary uppercase">Método</p>
              <p className="text-5xl md:text-6xl font-black text-foreground">360°</p>
              <p className="text-muted-foreground">Salón Rentable</p>
            </div>
            {areas.map((label, i) => {
              const angle = i * (360 / areas.length) - 90 // Adjust angle based on number of items
              const radiusPercentage = 38 // Adjust to control distance from center
              const x = 50 + radiusPercentage * Math.cos((angle * Math.PI) / 180)
              const y = 50 + radiusPercentage * Math.sin((angle * Math.PI) / 180)
              return (
                <div
                  key={label}
                  className="absolute text-center bg-secondary px-2.5 py-1 rounded-full border border-border shadow-sm"
                  style={{
                    top: `${y}%`,
                    left: `${x}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <p className="text-xs font-medium text-black uppercase">{label.split(" ")[0]}</p>{" "}
                  {/* Show first word for brevity */}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
