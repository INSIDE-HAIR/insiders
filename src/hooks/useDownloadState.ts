import { useState, useEffect } from "react";

interface DownloadState {
  isDownloading: boolean;
  downloadingUrl: string | null;
  downloadingFilename: string | null;
  isMobile: boolean;
  error: boolean;
  success: boolean;
}

export const useDownloadState = () => {
  const [downloadState, setDownloadState] = useState<DownloadState>({
    isDownloading: false,
    downloadingUrl: null,
    downloadingFilename: null,
    isMobile: false,
    error: false,
    success: false,
  });

  useEffect(() => {
    const handleDownloadStart = (event: CustomEvent) => {
      const { url, filename, isMobile } = event.detail;
      setDownloadState({
        isDownloading: true,
        downloadingUrl: url,
        downloadingFilename: filename,
        isMobile,
        error: false,
        success: false,
      });
    };

    const handleDownloadComplete = (event: CustomEvent) => {
      const { url, filename, success, error, isMobile } = event.detail;
      setDownloadState({
        isDownloading: false,
        downloadingUrl: null,
        downloadingFilename: null,
        isMobile,
        error: error || false,
        success: success || false,
      });

      // Reset success/error state after 3 seconds
      if (success || error) {
        setTimeout(() => {
          setDownloadState((prev) => ({
            ...prev,
            error: false,
            success: false,
          }));
        }, 3000);
      }
    };

    // Add event listeners
    document.addEventListener(
      "download-start",
      handleDownloadStart as EventListener
    );
    document.addEventListener(
      "download-complete",
      handleDownloadComplete as EventListener
    );

    // Cleanup
    return () => {
      document.removeEventListener(
        "download-start",
        handleDownloadStart as EventListener
      );
      document.removeEventListener(
        "download-complete",
        handleDownloadComplete as EventListener
      );
    };
  }, []);

  // Helper function to check if a specific URL is downloading
  const isUrlDownloading = (url: string) => {
    return downloadState.isDownloading && downloadState.downloadingUrl === url;
  };

  // Helper function to get download status for a specific URL
  const getDownloadStatus = (url: string) => {
    if (isUrlDownloading(url)) {
      return "downloading";
    }
    if (downloadState.error && downloadState.downloadingUrl === url) {
      return "error";
    }
    if (downloadState.success && downloadState.downloadingUrl === url) {
      return "success";
    }
    return "idle";
  };

  return {
    downloadState,
    isUrlDownloading,
    getDownloadStatus,
    isAnyDownloading: downloadState.isDownloading,
  };
};
