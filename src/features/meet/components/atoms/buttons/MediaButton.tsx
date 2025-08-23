import React from "react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import {
  PlayIcon,
  PauseIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

export type MediaType = 
  | "play"        // Play video/audio
  | "pause"       // Pause media  
  | "download"    // Download file
  | "share"       // Share link
  | "transcript"  // View transcript
  | "recording"   // View recording
  | "audio"       // Audio related
  | "external"    // Open external link
  | "smart_notes"; // View smart notes

export type MediaFormat = 
  | "video"       // MP4, recording files
  | "audio"       // MP3, audio files  
  | "document"    // PDF, transcript files
  | "link"        // URLs, external links
  | "notes";      // Smart notes, summaries

export interface MediaButtonProps {
  type: MediaType;
  format?: MediaFormat;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost" | "secondary";
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  className?: string;
  tooltip?: string;
  label?: string; // Para botones con texto
}

/**
 * Botón atómico especializado para acciones de media
 * Optimizado para reproducir, descargar y compartir archivos multimedia
 * 
 * @example
 * <MediaButton type="play" format="video" onClick={() => playRecording()} />
 * <MediaButton type="download" format="document" label="Descargar PDF" />
 * <MediaButton type="transcript" onClick={() => openTranscript()} />
 * <MediaButton type="external" loading={isOpening} onClick={() => openMeetLink()} />
 */
export const MediaButton: React.FC<MediaButtonProps> = ({
  type,
  format,
  size = "sm",
  variant = "outline",
  disabled = false,
  loading = false,
  onClick,
  className,
  tooltip,
  label
}) => {
  // Configuración de iconos por tipo de media
  const mediaConfig = {
    play: {
      icon: <PlayIcon className="h-4 w-4" />,
      defaultLabel: "Reproducir",
      hoverColor: "hover:bg-green-50 hover:text-green-700 hover:border-green-200"
    },
    pause: {
      icon: <PauseIcon className="h-4 w-4" />,
      defaultLabel: "Pausar",
      hoverColor: "hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200"
    },
    download: {
      icon: <ArrowDownTrayIcon className="h-4 w-4" />,
      defaultLabel: format === "document" ? "PDF" : "Descargar",
      hoverColor: "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
    },
    share: {
      icon: <ShareIcon className="h-4 w-4" />,
      defaultLabel: "Compartir",
      hoverColor: "hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
    },
    transcript: {
      icon: <DocumentTextIcon className="h-4 w-4" />,
      defaultLabel: "Ver completa",
      hoverColor: "hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
    },
    recording: {
      icon: <VideoCameraIcon className="h-4 w-4" />,
      defaultLabel: "Ver grabación",
      hoverColor: "hover:bg-red-50 hover:text-red-700 hover:border-red-200"
    },
    audio: {
      icon: <SpeakerWaveIcon className="h-4 w-4" />,
      defaultLabel: "Audio",
      hoverColor: "hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200"
    },
    external: {
      icon: <ArrowTopRightOnSquareIcon className="h-4 w-4" />,
      defaultLabel: "Abrir",
      hoverColor: "hover:bg-gray-50 hover:text-gray-700 hover:border-gray-200"
    },
    smart_notes: {
      icon: <SparklesIcon className="h-4 w-4" />,
      defaultLabel: "Ver completas",
      hoverColor: "hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200"
    }
  };

  const config = mediaConfig[type];
  const displayLabel = label || config.defaultLabel;
  const isIconOnly = !label;

  // Icono con animación de loading si aplica
  const getIcon = () => {
    if (loading && type === "download") {
      return <ArrowDownTrayIcon className="h-4 w-4 animate-pulse" />;
    }
    return config.icon;
  };

  // Clases de tamaño
  const sizeClasses = {
    sm: isIconOnly ? "h-8 w-8" : "h-8 px-3",
    default: isIconOnly ? "h-10 w-10" : "h-10 px-4", 
    lg: isIconOnly ? "h-12 w-12" : "h-12 px-6"
  };

  return (
    <Button
      variant={variant}
      size="sm"
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        sizeClasses[size],
        "cursor-pointer transition-all duration-200",
        !disabled && !loading && config.hoverColor,
        // Estilos especiales por formato
        format === "video" && "border-red-200 text-red-600",
        format === "document" && "border-blue-200 text-blue-600", 
        format === "notes" && "border-yellow-200 text-yellow-600",
        className
      )}
      title={tooltip || displayLabel}
      aria-label={tooltip || displayLabel}
    >
      <div className="flex items-center gap-1">
        {getIcon()}
        {label && <span className="text-sm font-medium">{displayLabel}</span>}
      </div>
    </Button>
  );
};