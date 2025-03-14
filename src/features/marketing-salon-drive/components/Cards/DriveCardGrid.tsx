"use client";
import { DriveFile } from "../../types/drive";
import { CardFactory } from "./CardFactory";
import { Eye } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface DriveCardGridProps {
  files: DriveFile[];
  onPreviewClick?: (file: DriveFile) => void;
}

export function DriveCardGrid({ files, onPreviewClick }: DriveCardGridProps) {
  if (!files || files.length === 0) {
    return (
      <div className='my-8 text-center text-gray-500'>
        No se encontraron archivos
      </div>
    );
  }

  return (
    <div
      className='gap-x-6 gap-y-4 flex flex-row flex-wrap items-start justify-center text-center my-6 w-full'
      data-testid='drive-grid'
    >
      {files.map((file) => (
        <div key={file.id} className='relative'>
          <CardFactory file={file} />
          {onPreviewClick && (
            <div className='absolute top-2 right-2'>
              <Button
                size='sm'
                variant='ghost'
                className='h-8 w-8 rounded-full bg-black/50 p-0 hover:bg-black/70'
                onClick={() => onPreviewClick(file)}
                title='Vista previa'
              >
                <Eye className='h-4 w-4 text-white' />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
