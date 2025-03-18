// Utility functions to handle folder name formatting and operations

// Check if a folder is hidden based on its name
export const isHiddenFolder = (name: string): boolean => {
  return name.toLowerCase().endsWith("_hidden");
};

// Clean a folder name by removing prefixes and suffixes
export const cleanFolderName = (name: string): string => {
  // Remove prefixes like "01_", "02_client_", etc.
  const cleanedName = name.replace(/^\d+_([a-zA-Z]+_)?/, "");
  // Remove suffix "_hidden" if exists
  return cleanedName.replace(/_hidden$/i, "");
};

// Types for folder data structure
export interface Folder {
  id: string;
  name: string;
  path: string;
  parents?: string[];
  children?: Folder[];
  type?: string;
}

export interface DriveResponse {
  success: boolean;
  data: {
    folders?: Folder[];
    yearFolders?: Folder[];
    clientFolders?: Folder[];
    campaignFolders?: Folder[];
    hierarchyComplete?: boolean;
  };
  metadata: {
    folderCount?: number;
    timestamp: string;
    params: {
      folderPath: string;
      folderType?: string;
    };
  };
  error?: string;
}

// Interface for the selector options
export interface SelectorOption {
  id: string;
  name: string;
  path?: string;
  type?: string;
}

// Function to fetch folder data from the API
export const fetchFolderData = async (
  endpoint: string
): Promise<DriveResponse> => {
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Error desconocido en la respuesta");
  }

  return data;
};

// Function to fetch folder by ID
export const fetchFolderById = async (id: string): Promise<DriveResponse> => {
  return fetchFolderData(`/api/marketing-salon-drive/folders/${id}`);
};
