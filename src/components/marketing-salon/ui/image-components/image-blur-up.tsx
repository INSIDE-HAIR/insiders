"use client"

import { useState, useRef } from "react"
import { Loader2 } from "lucide-react"

interface ImageBlurUpProps {
  src: string
  alt: string
  isLoading: boolean
  onLoad: () => void
  onError: () => void
}

export function ImageBlurUp({ src, alt, isLoading, onLoad, onError }: ImageBlurUpProps) {
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  // Create a thumbnail version of the image URL (if possible)
  const thumbnailSrc = src.replace(/\.(jpg|jpeg|png|gif|webp)/, "_thumb.$1")

  // Handle thumbnail load
  const handleThumbnailLoad = () => {
    setThumbnailLoaded(true)
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Blurred thumbnail background */}
      {thumbnailLoaded && (
        <div
          className="absolute inset-0 bg-no-repeat bg-center bg-cover"
          style={{
            backgroundImage: `url(${thumbnailSrc})`,
            filter: "blur(20px)",
            transform: "scale(1.1)",
            opacity: isLoading ? 0.7 : 0,
            transition: "opacity 0.5s ease-in-out",
          }}
        />
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="w-[280px] h-[400px] bg-zinc-800/50 rounded-md overflow-hidden backdrop-blur-md flex items-center justify-center">
            {/* Animated loading lines */}
            <div className="absolute inset-0">
              <div className="h-2 w-3/4 bg-zinc-700/70 rounded-full mx-auto mt-4 animate-pulse"></div>
              <div className="h-2 w-1/2 bg-zinc-700/70 rounded-full mx-auto mt-4 animate-pulse delay-75"></div>
              <div className="h-2 w-2/3 bg-zinc-700/70 rounded-full mx-auto mt-4 animate-pulse delay-150"></div>
              <div className="h-2 w-3/5 bg-zinc-700/70 rounded-full mx-auto mt-4 animate-pulse delay-300"></div>
            </div>

            <div className="z-10 flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-zinc-400 animate-spin mb-4" />
              <span className="text-zinc-400 text-sm">Cargando imagen...</span>
            </div>
          </div>
        </div>
      )}

      {/* Hidden thumbnail loader */}
      <img
        src={thumbnailSrc || "/placeholder.svg"}
        alt=""
        className="hidden"
        onLoad={handleThumbnailLoad}
        onError={() => {}}
      />

      {/* Main image */}
      <img
        ref={imageRef}
        src={src || "/placeholder.svg"}
        alt={alt}
        className="max-w-full object-contain z-10 relative transition-all duration-500 ease-in-out"
        onLoad={onLoad}
        onError={onError}
        crossOrigin="anonymous"
        style={{
          opacity: isLoading ? 0 : 1,
          transform: isLoading ? "scale(0.95)" : "scale(1)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
          maxHeight: "calc(70vh - 40px)",
        }}
      />
    </div>
  )
}

