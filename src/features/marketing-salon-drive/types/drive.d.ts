export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink?: string;
  parents?: string[];
  description?: string;
  year?: string;
  campaign?: string;
  client?: string;
  folder?: string;
  subFolder?: string;
  subSubFolder?: string;
  nestedPath?: string[];
  transformedUrl?: GoogleDriveLinks;
  category?: string;
  order?: number;
  groupTitle?: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  mimeType: "application/vnd.google-apps.folder";
  parents?: string[];
  isFolder?: boolean;
  subfoldersIds?: string[];
  parentFolder?: string;
  year?: string;
  campaign?: string;
  client?: string;
}

export interface GoogleDriveLinks {
  preview: string;
  imgEmbed: string;
  download: string;
  alternativeUrls?: {
    direct: string;
    thumbnail: string;
    proxy: string;
    video?: string;
    photos?: string;
  };
}

export interface DriveMarketingCard extends DriveFile {
  transformedUrl: GoogleDriveLinks;
  category?: string;
  order?: number;
  groupTitle?: string;
  copy?: string;
}
