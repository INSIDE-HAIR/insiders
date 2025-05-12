"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { ReportErrorModal } from "./report-error-modal";

interface ReportErrorButtonProps {
  fileName?: string;
  fileId?: string;
  size?: "small" | "normal";
  isFileReport?: boolean;
  downloadError?: boolean;
  downloadUrl?: string;
}

export function ReportErrorButton({
  fileName = "archivo general",
  fileId,
  size = "normal",
  isFileReport = false,
  downloadError = false,
  downloadUrl = "",
}: ReportErrorButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // Detener la propagación para evitar que otros elementos capturen el clic
    e.stopPropagation();
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleClick}
              className={`flex items-center justify-center rounded-full transition-colors hover:bg-red-700/20 focus:outline-none ${
                size === "small" ? "h-5 w-5 p-0.5" : "h-8 w-8"
              }`}
              aria-label="Reportar problema"
            >
              <Flag
                className={`text-red-600 hover:text-red-500 transition-colors ${
                  size === "small" ? "h-4 w-4" : "h-5 w-5"
                }`}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Reportar problema</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <ReportErrorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fileName={fileName}
        fileId={fileId}
        isFileReport={isFileReport}
        downloadError={downloadError}
        downloadUrl={downloadUrl}
      />
    </>
  );
}
