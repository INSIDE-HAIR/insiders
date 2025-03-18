"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Selector from "./Selector";
import {
  fetchFolderData,
  fetchFolderById,
  SelectorOption,
  isHiddenFolder,
  Folder,
  cleanFolderName,
  DriveResponse,
} from "../utils/folderUtils";

interface FolderNavigationProps {
  onFolderSelected: (folderId: string, folderPath: string) => void;
  initialYearId?: string | null;
  initialClientId?: string | null;
  initialCampaignId?: string | null;
}

const FolderNavigation: React.FC<FolderNavigationProps> = ({
  onFolderSelected,
  initialYearId = null,
  initialClientId = null,
  initialCampaignId = null,
}) => {
  const router = useRouter();

  // Estados para opciones de selectores
  const [yearOptions, setYearOptions] = useState<SelectorOption[]>([]);
  const [clientOptions, setClientOptions] = useState<SelectorOption[]>([]);
  const [campaignOptions, setCampaignOptions] = useState<SelectorOption[]>([]);

  // Estados para valores seleccionados
  const [selectedYearId, setSelectedYearId] = useState<string | null>(
    initialYearId
  );
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    initialClientId
  );
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    initialCampaignId
  );

  // Estados para nombres de selecciones (para UI)
  const [selectedYearName, setSelectedYearName] = useState<string | null>(null);
  const [selectedClientName, setSelectedClientName] = useState<string | null>(
    null
  );
  const [selectedCampaignName, setSelectedCampaignName] = useState<
    string | null
  >(null);

  // Estados para la vista previa de carpeta - Simplificado
  const [previewFolderId, setPreviewFolderId] = useState<string | null>(null);

  // Estados de carga
  const [loadingYears, setLoadingYears] = useState<boolean>(true);
  const [loadingClients, setLoadingClients] = useState<boolean>(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Función para navegar a la página de detalles de la carpeta
  const handleGoToFolderDetails = () => {
    if (previewFolderId) {
      router.push(`marketing-salon-drive-2/${previewFolderId}`);
    }
  };

  // Cargar años iniciales
  const fetchYears = async () => {
    setLoadingYears(true);
    setError(null);
    try {
      const data = await fetchFolderData(
        `/api/marketing-salon-drive/folders?type=year`
      );
      const years = data.data.folders || [];

      // Filtrar carpetas ocultas
      setYearOptions(
        years
          .filter((folder: Folder) => !isHiddenFolder(folder.name))
          .map((folder: Folder) => ({
            id: folder.id,
            name: folder.name,
            path: folder.path,
            type: folder.type,
          }))
      );
      return years;
    } catch (error) {
      setError(`Error al cargar años: ${error}`);
      console.error("Error al cargar años:", error);
      return [];
    } finally {
      setLoadingYears(false);
    }
  };

  // Cargar clientes para un año seleccionado
  const fetchClients = async (yearId: string) => {
    setLoadingClients(true);
    setClientOptions([]);
    setCampaignOptions([]);
    try {
      const data = await fetchFolderData(
        `/api/marketing-salon-drive/folders?folder=${yearId}&type=client`
      );
      const clientFolders = data.data.folders || [];

      // Filtrar carpetas ocultas
      const clientOpts = clientFolders
        .filter((folder) => !isHiddenFolder(folder.name))
        .map((folder) => ({
          id: folder.id,
          name: folder.name,
          path: folder.path,
          type: folder.type,
        }));

      setClientOptions(clientOpts);
      return clientOpts;
    } catch (error) {
      setError(`Error al cargar clientes: ${error}`);
      console.error("Error al cargar clientes:", error);
      return [];
    } finally {
      setLoadingClients(false);
    }
  };

  // Cargar campañas para un cliente seleccionado
  const fetchCampaigns = async (clientId: string) => {
    setLoadingCampaigns(true);
    setCampaignOptions([]);
    try {
      const data = await fetchFolderData(
        `/api/marketing-salon-drive/folders?folder=${clientId}&type=campaign`
      );
      const campaignFolders = data.data.folders || [];

      // Filtrar carpetas ocultas
      const campaignOpts = campaignFolders
        .filter((folder) => !isHiddenFolder(folder.name))
        .map((folder) => ({
          id: folder.id,
          name: folder.name,
          path: folder.path,
          type: folder.type,
        }));

      setCampaignOptions(campaignOpts);
      return campaignOpts;
    } catch (error) {
      setError(`Error al cargar campañas: ${error}`);
      console.error("Error al cargar campañas:", error);
      return [];
    } finally {
      setLoadingCampaigns(false);
    }
  };

  // Manejadores de eventos de selección
  const handleYearChange = (option: SelectorOption) => {
    setSelectedYearId(option.id);
    setSelectedYearName(option.name);
    setSelectedClientId(null);
    setSelectedClientName(null);
    setSelectedCampaignId(null);
    setSelectedCampaignName(null);

    // Actualizar ID para mostrar
    setPreviewFolderId(option.id);

    // Fetch clients for this year
    fetchClients(option.id);

    // Notificar la selección
    onFolderSelected(option.id, option.path || option.id);
  };

  const handleClientChange = (option: SelectorOption) => {
    setSelectedClientId(option.id);
    setSelectedClientName(option.name);
    setSelectedCampaignId(null);
    setSelectedCampaignName(null);

    // Actualizar ID para mostrar
    setPreviewFolderId(option.id);

    // Fetch campaigns for this client
    fetchCampaigns(option.id);

    // Notificar la selección
    onFolderSelected(option.id, option.path || option.id);
  };

  const handleCampaignChange = (option: SelectorOption) => {
    setSelectedCampaignId(option.id);
    setSelectedCampaignName(option.name);

    // Actualizar ID para mostrar
    setPreviewFolderId(option.id);

    // Notificar la selección
    onFolderSelected(option.id, option.path || option.id);
  };

  // Búsqueda inicial de datos al montar el componente
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Cargar años
        const years = await fetchYears();

        // Si tenemos un ID de año inicial proporcionado por props, cargar clientes
        if (initialYearId) {
          setSelectedYearId(initialYearId);

          // Buscar el nombre del año
          const yearOption = years.find(
            (year: Folder) => year.id === initialYearId
          );
          if (yearOption) {
            setSelectedYearName(yearOption.name);
            setPreviewFolderId(initialYearId);
          }

          const clients = await fetchClients(initialYearId);

          // Si tenemos un ID de cliente inicial proporcionado por props, cargar campañas
          if (initialClientId) {
            setSelectedClientId(initialClientId);

            // Buscar el nombre del cliente
            const clientOption = clients.find(
              (client: SelectorOption) => client.id === initialClientId
            );
            if (clientOption) {
              setSelectedClientName(clientOption.name);
              setPreviewFolderId(initialClientId);
            }

            const campaigns = await fetchCampaigns(initialClientId);

            // Si tenemos un ID de campaña inicial proporcionado por props, seleccionarlo
            if (initialCampaignId) {
              setSelectedCampaignId(initialCampaignId);

              // Buscar el nombre de la campaña
              const campaignOption = campaigns.find(
                (campaign: SelectorOption) => campaign.id === initialCampaignId
              );
              if (campaignOption) {
                setSelectedCampaignName(campaignOption.name);
                setPreviewFolderId(initialCampaignId);

                // Notificar la selección de carpeta
                onFolderSelected(
                  initialCampaignId,
                  campaignOption.path || initialCampaignId
                );
              }
            }
          }
        }
      } catch (error) {
        console.error("Error al inicializar datos:", error);
        setError("Error al inicializar datos");
      }
    };

    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar al montar el componente

  // Renderizar solo el ID de la carpeta, sin contador ni vista previa
  const renderFolderPreview = () => {
    if (!previewFolderId) {
      return (
        <div className="text-center text-gray-500 py-6">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay carpeta seleccionada
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Selecciona una carpeta para ver su ID.
          </p>
        </div>
      );
    }

    return (
      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-medium mb-3">ID de carpeta:</h3>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <code className="text-sm font-mono break-all">{previewFolderId}</code>
        </div>

        {/* Botón para ir a la página de detalles */}
        <div className="mt-4">
          <button
            onClick={handleGoToFolderDetails}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Ver detalles de carpeta
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Selecciona una carpeta</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-6">
        <Selector
          label="Año"
          options={yearOptions}
          value={selectedYearId}
          onChange={handleYearChange}
          loading={loadingYears}
        />

        <Selector
          label="Cliente"
          options={clientOptions}
          value={selectedClientId}
          onChange={handleClientChange}
          loading={loadingClients}
          disabled={!selectedYearId}
        />

        <Selector
          label="Campaña"
          options={campaignOptions}
          value={selectedCampaignId}
          onChange={handleCampaignChange}
          loading={loadingCampaigns}
          disabled={!selectedClientId}
        />
      </div>

      {/* Visualización simplificada del ID de carpeta */}
      {renderFolderPreview()}
    </div>
  );
};

export default FolderNavigation;
