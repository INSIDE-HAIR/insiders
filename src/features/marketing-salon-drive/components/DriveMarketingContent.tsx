"use client";
import { useDriveCards } from "../hooks/useDriveCards";
import { DriveCardGrid } from "./Cards/DriveCardGrid";
import { DriveTabsCardGrid } from "./Cards/DriveTabsCardGrid";
import { DriveHeader } from "./Layout/DriveHeader";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function DriveMarketingContent() {
  const searchParams = useSearchParams();
  const client = searchParams?.get("client") ?? "insiders";
  const year = searchParams?.get("year") ?? new Date().getFullYear().toString();
  const month = searchParams?.get("month") ?? "january";

  // Estado para mostrar detalles técnicos de errores
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const { data, isLoading, error } = useDriveCards(client, year, month);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  if (error) {
    // Determinar el tipo de error para mostrar mensajes amigables
    let errorMessage = "Error cargando el contenido";
    let errorDetails = error instanceof Error ? error.message : String(error);
    let suggestedAction = "";

    if (errorDetails.includes("Missing required environment")) {
      errorMessage = "Error de configuración del servidor";
      suggestedAction =
        "Por favor, contacta al administrador para verificar la configuración del servidor.";
    } else if (errorDetails.includes("Carpeta no encontrada:")) {
      // Usar el mensaje mejorado que ya incluye la parte específica que falló
      errorMessage = errorDetails;
      suggestedAction =
        "Verifica que la carpeta exista en Google Drive con la estructura: [cliente]/[año]/[mes]. La carpeta marketing-salon no debe estar incluida en la ruta.";
    } else if (errorDetails.includes("Authentication")) {
      errorMessage = "Error de autenticación con Google Drive";
      suggestedAction =
        "Por favor, contacta al administrador para verificar las credenciales de acceso.";
    } else if (errorDetails.includes("Network Error")) {
      errorMessage = "Error de conexión";
      suggestedAction = "Verifica tu conexión a internet e intenta nuevamente.";
    } else if (errorDetails.includes("DECODER routines")) {
      errorMessage = "Error con el formato de las credenciales";
      suggestedAction =
        "Por favor, contacta al administrador para verificar el formato de las credenciales de Google Drive.";
    }

    return (
      <div className='flex flex-col items-center justify-center min-h-screen p-4'>
        <div className='bg-red-50 border-l-4 border-red-500 p-4 w-full max-w-2xl rounded shadow-md'>
          <div className='flex items-center mb-2'>
            <svg
              className='h-6 w-6 text-red-500 mr-3'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              />
            </svg>
            <h3 className='text-lg font-medium text-red-700'>{errorMessage}</h3>
          </div>

          {suggestedAction && (
            <p className='text-sm text-red-600 mb-3'>{suggestedAction}</p>
          )}

          <div className='mt-4'>
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className='text-sm text-gray-500 underline'
            >
              {showTechnicalDetails
                ? "Ocultar detalles técnicos"
                : "Mostrar detalles técnicos"}
            </button>

            {showTechnicalDetails && (
              <div className='mt-2 p-2 bg-gray-100 rounded text-xs font-mono overflow-auto'>
                {errorDetails}
              </div>
            )}
          </div>

          <div className='mt-4 flex space-x-3'>
            <button
              onClick={() => window.location.reload()}
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
            >
              Intentar nuevamente
            </button>

            <button
              onClick={() => window.history.back()}
              className='px-4 py-2 border border-gray-300 rounded hover:bg-gray-100'
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay datos pero tampoco hay error, mostrar mensaje de carpeta vacía
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className='container mx-auto px-4'>
        <DriveHeader />
        <div className='flex flex-col items-center justify-center min-h-[50vh] p-4'>
          <div className='bg-yellow-50 border-l-4 border-yellow-500 p-4 w-full max-w-2xl rounded shadow-md'>
            <div className='flex items-center mb-2'>
              <svg
                className='h-6 w-6 text-yellow-500 mr-3'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <h3 className='text-lg font-medium text-yellow-700'>
                No hay archivos disponibles
              </h3>
            </div>
            <p className='text-sm text-yellow-600'>
              No se encontraron archivos en la carpeta: {client}/{year}/{month}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4'>
      <DriveHeader />
      {data && data.data && <DriveTabsCardGrid files={data.data} />}
    </div>
  );
}
