"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  ClipboardDocumentIcon,
  ArrowDownCircleIcon,
} from "@heroicons/react/24/outline";
import {
  decodeFileNameAsync,
  decodeFileName,
  type DecodedFile,
} from "@/src/features/drive/utils/marketing-salon/file-decoder";

interface ReportErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileId?: string;
  isFileReport?: boolean;
  downloadError?: boolean;
  downloadUrl?: string;
}

export const ReportErrorModal = ({
  isOpen,
  onClose,
  fileName,
  fileId,
  isFileReport = false,
  downloadError = false,
  downloadUrl = "",
}: ReportErrorModalProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [decodedInfo, setDecodedInfo] = useState<DecodedFile | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<{
    isMobile: boolean;
    userAgent: string;
    networkInfo?: {
      effectiveType?: string;
      downlink?: number;
      saveData?: boolean;
    };
    isOnline: boolean;
  } | null>(null);

  // Detectar información del dispositivo y red al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const userAgent = navigator.userAgent;
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent
        );

      // Obtener información de red si está disponible
      const connection =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;

      const networkInfo = connection
        ? {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            saveData: connection.saveData,
          }
        : undefined;

      setDeviceInfo({
        isMobile,
        userAgent,
        networkInfo,
        isOnline: navigator.onLine,
      });
    }
  }, [isOpen]);

  // Decodificar el nombre del archivo cuando se abre el modal
  useEffect(() => {
    if (isOpen && fileName && fileName !== "archivo general") {
      const decodeFile = async () => {
        try {
          // Intentar decodificar el nombre del archivo
          const decoded = await decodeFileNameAsync(fileName);
          setDecodedInfo(decoded);

          // Si es un error de descarga, agregar información sobre la URL, nombre decodificado y dispositivo
          if (downloadError && deviceInfo) {
            const mobileInfo = deviceInfo.isMobile
              ? `
📱 DISPOSITIVO MÓVIL DETECTADO
- Tipo: ${deviceInfo.isMobile ? "Móvil" : "Desktop"}
- Navegador: ${deviceInfo.userAgent}
- Conexión: ${deviceInfo.isOnline ? "En línea" : "Sin conexión"}${
                  deviceInfo.networkInfo
                    ? `
- Velocidad de red: ${deviceInfo.networkInfo.effectiveType || "Desconocida"}
- Ancho de banda: ${
                        deviceInfo.networkInfo.downlink
                          ? `${deviceInfo.networkInfo.downlink} Mbps`
                          : "Desconocido"
                      }
- Ahorro de datos: ${
                        deviceInfo.networkInfo.saveData
                          ? "Activado"
                          : "Desactivado"
                      }`
                    : ""
                }

🔧 INFORMACIÓN TÉCNICA DEL ERROR:`
              : `
🖥️ INFORMACIÓN DEL DISPOSITIVO:
- Tipo: Desktop
- Navegador: ${deviceInfo.userAgent}
- Conexión: ${deviceInfo.isOnline ? "En línea" : "Sin conexión"}

🔧 INFORMACIÓN TÉCNICA DEL ERROR:`;

            setMessage(
              `❌ ERROR DE DESCARGA ${
                deviceInfo.isMobile ? "EN DISPOSITIVO MÓVIL" : ""
              }

${mobileInfo}
- URL de descarga: ${downloadUrl || "No disponible"}
- Nombre original: ${fileName}
- Nombre decodificado: ${decoded?.fullName || "No disponible"}
- ID del archivo: ${fileId || "No disponible"}

${
  deviceInfo.isMobile
    ? `
🚨 POSIBLES CAUSAS EN MÓVILES:
• Conexión inestable (2G/3G)
• Modo de ahorro de datos activado
• Memoria insuficiente del dispositivo
• Navegador con limitaciones de descarga
• Timeout por conexión lenta

💡 SOLUCIONES SUGERIDAS:
• Conectarse a WiFi estable
• Desactivar modo ahorro de datos
• Cerrar otras aplicaciones
• Intentar con navegador Chrome/Safari
• Reintentar la descarga más tarde`
    : `
🚨 POSIBLES CAUSAS:
• Problema de conectividad
• Error en el servidor proxy
• Archivo dañado o no disponible
• Restricciones de CORS

💡 SOLUCIONES SUGERIDAS:
• Verificar conexión a internet
• Reintentar la descarga
• Intentar descarga directa`
}

📝 DETALLES ADICIONALES DEL USUARIO:
`
            );
          }
        } catch (error) {
          console.error("Error al decodificar nombre:", error);
          // Fallback a la versión sincrónica
          const fallbackDecoded = decodeFileName(fileName);
          setDecodedInfo(fallbackDecoded);

          if (downloadError && deviceInfo) {
            const mobileInfo = deviceInfo.isMobile
              ? `
📱 DISPOSITIVO MÓVIL DETECTADO
- Tipo: ${deviceInfo.isMobile ? "Móvil" : "Desktop"}
- Navegador: ${deviceInfo.userAgent}
- Conexión: ${deviceInfo.isOnline ? "En línea" : "Sin conexión"}

🔧 INFORMACIÓN TÉCNICA DEL ERROR:`
              : `
🖥️ INFORMACIÓN DEL DISPOSITIVO:
- Tipo: Desktop  
- Navegador: ${deviceInfo.userAgent}
- Conexión: ${deviceInfo.isOnline ? "En línea" : "Sin conexión"}

🔧 INFORMACIÓN TÉCNICA DEL ERROR:`;

            setMessage(
              `❌ ERROR DE DESCARGA ${
                deviceInfo.isMobile ? "EN DISPOSITIVO MÓVIL" : ""
              }

${mobileInfo}
- URL de descarga: ${downloadUrl || "No disponible"}
- Nombre original: ${fileName}
- Nombre decodificado: ${fallbackDecoded?.fullName || "No disponible"}

${
  deviceInfo.isMobile
    ? `
🚨 POSIBLE PROBLEMA ESPECÍFICO DE MÓVIL:
Este error puede estar relacionado con limitaciones del navegador móvil o problemas de conectividad.

💡 SOLUCIONES RECOMENDADAS PARA MÓVILES:
• Conectarse a una red WiFi estable
• Intentar con el navegador Chrome o Safari
• Verificar que no esté activado el modo ahorro de datos
• Cerrar otras aplicaciones para liberar memoria`
    : ""
}

📝 DETALLES ADICIONALES DEL USUARIO:
`
            );
          }
        }
      };

      decodeFile();
    } else if (downloadError) {
      setMessage(
        `No fue posible descargar el archivo. \n\nURL de descarga: ${
          downloadUrl || "No disponible"
        }`
      );
    } else {
      setMessage("");
    }
  }, [isOpen, fileName, downloadError, downloadUrl, fileId, deviceInfo]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar datos
    if (!fullName.trim() || !email.trim() || !message.trim()) {
      setError("Por favor completa todos los campos");
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor ingresa un correo electrónico válido");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/drive/error-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName,
          fileId,
          message,
          fullName,
          email,
          decodedFileName: decodedInfo?.fullName || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar el reporte");
      }

      // Mostrar éxito
      setSuccess(true);

      // Limpiar formulario
      setFullName("");
      setEmail("");
      setMessage("");

      // Cerrar modal después de 3 segundos
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al enviar el reporte"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden text-white'>
        {/* Header */}
        <div className='bg-red-600 text-white px-6 py-4 flex justify-between items-center'>
          <div className='flex items-center space-x-2'>
            {downloadError ? (
              <ArrowDownCircleIcon className='h-6 w-6' />
            ) : (
              <ClipboardDocumentIcon className='h-6 w-6' />
            )}
            <h3 className='text-lg font-medium'>
              {downloadError
                ? "Reporte de error de descarga"
                : isFileReport || fileName !== "archivo general"
                ? "Reporte de error de archivo"
                : "Reporte de error general"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className='text-white hover:text-gray-300 focus:outline-none'
          >
            <XMarkIcon className='h-6 w-6' />
          </button>
        </div>

        {/* Content */}
        <div className='px-6 py-4'>
          {success ? (
            <div className='bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded mb-4'>
              <p className='text-center'>
                ¡Gracias! Tu reporte ha sido enviado correctamente.
              </p>
              <p className='text-center text-sm mt-2'>
                Hemos enviado una confirmación a tu correo electrónico.
              </p>
            </div>
          ) : (
            <>
              <p className='text-zinc-300 mb-4'>
                {downloadError
                  ? `Reporta un problema con la descarga del archivo`
                  : `Reporta cualquier problema${
                      fileName !== "archivo general"
                        ? ` con el archivo ${fileName}`
                        : ""
                    }`}
              </p>

              {error && (
                <div className='bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4'>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className='mb-4'>
                  <label
                    htmlFor='fullName'
                    className='block text-zinc-300 font-medium mb-1'
                  >
                    Nombre completo *
                  </label>
                  <input
                    id='fullName'
                    type='text'
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-white'
                    required
                  />
                </div>

                <div className='mb-4'>
                  <label
                    htmlFor='email'
                    className='block text-zinc-300 font-medium mb-1'
                  >
                    Correo electrónico *
                  </label>
                  <input
                    id='email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-white'
                    required
                  />
                </div>

                <div className='mb-4'>
                  <label
                    htmlFor='message'
                    className='block text-zinc-300 font-medium mb-1'
                  >
                    Mensaje *
                  </label>
                  <textarea
                    id='message'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-white'
                    required
                  ></textarea>
                </div>

                <div className='flex justify-end'>
                  <button
                    type='button'
                    onClick={onClose}
                    className='mr-2 px-4 py-2 border border-zinc-700 rounded-md text-zinc-300 hover:bg-zinc-800'
                  >
                    Cancelar
                  </button>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50'
                  >
                    {isSubmitting ? "Enviando..." : "Enviar reporte"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
