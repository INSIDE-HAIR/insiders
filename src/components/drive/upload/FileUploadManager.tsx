"use client";

import React from "react";
import { DropZone } from "./DropZone";
import { UploadProgressModal } from "./UploadProgressModal";
import { useFileUpload } from "./useFileUpload";

interface FileUploadManagerProps {
  folderId: string;
  folderName: string;
  className?: string;
}

export function FileUploadManager({
  folderId,
  folderName,
  className,
}: FileUploadManagerProps) {
  const {
    files,
    isUploading,
    isModalOpen,
    addFiles,
    updateFileName,
    startUpload,
    cancelUpload,
    closeModal,
  } = useFileUpload();

  const handleFilesSelected = (
    selectedFiles: File[],
    targetFolderId: string
  ) => {
    addFiles(selectedFiles, targetFolderId);
  };

  return (
    <>
      <DropZone
        folderId={folderId}
        folderName={folderName}
        onFilesSelected={handleFilesSelected}
        className={className}
        disabled={isUploading}
      />

      <UploadProgressModal
        isOpen={isModalOpen}
        onClose={closeModal}
        files={files}
        onUpdateFileName={updateFileName}
        onStartUpload={startUpload}
        onCancelUpload={cancelUpload}
        isUploading={isUploading}
        folderId={folderId}
        folderName={folderName}
      />
    </>
  );
}
