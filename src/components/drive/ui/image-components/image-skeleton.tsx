import { Loader2 } from "lucide-react"

export function ImageSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Skeleton con proporción similar a una tarjeta (3:4 o 2:3) */}
      <div className="relative w-[280px] h-[400px] bg-zinc-800 rounded-md overflow-hidden">
        {/* Gradiente animado para efecto de skeleton */}
        <div className="absolute inset-0 bg-linear-to-r from-zinc-800 via-zinc-700 to-zinc-800 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-zinc-400 animate-spin" />
        </div>
      </div>

      {/* Texto de carga */}
      <div className="mt-4 text-zinc-400 text-sm">Cargando imagen...</div>
    </div>
  )
}

