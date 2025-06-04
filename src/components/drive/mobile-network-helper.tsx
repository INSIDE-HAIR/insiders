"use client";

import { useEffect, useState } from "react";
import {
  Smartphone,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

interface NetworkInfo {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  saveData?: boolean;
}

interface MobileNetworkHelperProps {
  className?: string;
}

export function MobileNetworkHelper({ className }: MobileNetworkHelperProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [showHelper, setShowHelper] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Detectar si es móvil
    const checkMobile = () => {
      const mobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsMobile(mobile);

      // Solo mostrar helper si es móvil
      setShowHelper(mobile);
    };

    // Obtener información de red si está disponible
    const getNetworkInfo = () => {
      const connection =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;

      if (connection) {
        setNetworkInfo({
          type: connection.type,
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          saveData: connection.saveData,
        });
      }
    };

    // Detectar estado de conexión
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    checkMobile();
    getNetworkInfo();
    updateOnlineStatus();

    // Escuchar cambios en la conexión
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Escuchar cambios en la información de red
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener("change", getNetworkInfo);
    }

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
      if (connection) {
        connection.removeEventListener("change", getNetworkInfo);
      }
    };
  }, []);

  // Determinar el estado de la conexión
  const getConnectionStatus = () => {
    if (!isOnline) {
      return {
        status: "offline",
        color: "text-red-500",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: WifiOff,
        message: "Sin conexión",
        advice: "Verifica tu conexión a internet e intenta de nuevo.",
      };
    }

    if (!networkInfo) {
      return {
        status: "unknown",
        color: "text-gray-500",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        icon: Info,
        message: "Conexión detectada",
        advice: "Para mejores descargas, conectate a WiFi cuando sea posible.",
      };
    }

    const { effectiveType, saveData, downlink } = networkInfo;

    // Conexión muy lenta
    if (effectiveType === "slow-2g" || effectiveType === "2g") {
      return {
        status: "slow",
        color: "text-red-500",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: AlertTriangle,
        message: "Conexión muy lenta (2G)",
        advice:
          "Las descargas pueden fallar. Conéctate a WiFi para mejor rendimiento.",
      };
    }

    // Conexión lenta o modo ahorro de datos
    if (effectiveType === "3g" || saveData) {
      return {
        status: "limited",
        color: "text-orange-500",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        icon: AlertTriangle,
        message: saveData ? "Modo ahorro de datos activo" : "Conexión 3G",
        advice: "Las descargas están optimizadas pero pueden ser lentas.",
      };
    }

    // Conexión buena
    if (effectiveType === "4g" || (downlink && downlink > 1.5)) {
      return {
        status: "good",
        color: "text-green-500",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: CheckCircle,
        message: "Conexión rápida",
        advice: "Tu conexión es buena para descargas.",
      };
    }

    // Conexión moderada
    return {
      status: "moderate",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      icon: Wifi,
      message: "Conexión moderada",
      advice: "Para archivos grandes, considera conectarte a WiFi.",
    };
  };

  if (!showHelper || !isMobile) {
    return null;
  }

  const connectionStatus = getConnectionStatus();
  const StatusIcon = connectionStatus.icon;

  return (
    <div className={`${className || ""} bg-white border rounded-lg shadow-sm`}>
      {/* Header con estado de conexión */}
      <div
        className={`flex items-center gap-3 p-4 ${connectionStatus.bgColor} ${connectionStatus.borderColor} border rounded-t-lg`}
      >
        <StatusIcon className={`h-5 w-5 ${connectionStatus.color}`} />
        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <Smartphone className='h-4 w-4 text-gray-600' />
            <span className='text-sm font-medium text-gray-900'>
              Dispositivo móvil detectado
            </span>
          </div>
          <p className={`text-sm ${connectionStatus.color} font-medium`}>
            {connectionStatus.message}
          </p>
        </div>
      </div>

      {/* Consejo principal */}
      <div className='p-4 border-b'>
        <p className='text-sm text-gray-600'>{connectionStatus.advice}</p>
      </div>

      {/* Información técnica (solo si hay datos de red) */}
      {networkInfo && (
        <div className='p-4 bg-gray-50 rounded-b-lg border-b'>
          <h5 className='text-xs font-medium text-gray-700 mb-2'>
            Información técnica:
          </h5>
          <div className='grid grid-cols-2 gap-2 text-xs text-gray-600'>
            {networkInfo.effectiveType && (
              <div>
                <span className='font-medium'>Velocidad:</span>{" "}
                {networkInfo.effectiveType.toUpperCase()}
              </div>
            )}
            {networkInfo.downlink && (
              <div>
                <span className='font-medium'>Bajada:</span>{" "}
                {networkInfo.downlink} Mbps
              </div>
            )}
            {networkInfo.saveData !== undefined && (
              <div className='col-span-2'>
                <span className='font-medium'>Ahorro de datos:</span>{" "}
                {networkInfo.saveData ? "Activado" : "Desactivado"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botón para ocultar */}
      <div className='p-2 border-t'>
        <button
          onClick={() => setShowHelper(false)}
          className='w-full text-xs text-gray-500 hover:text-gray-700 transition-colors'
        >
          Ocultar ayuda móvil
        </button>
      </div>
    </div>
  );
}
