"use client";
import { Button } from "@/src/components/ui/button";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import { DriveFile } from "../../../types/drive";

interface PreviewModalProps {
  file: DriveFile;
  isOpen: boolean;
  title: string;
  previewUrl: string;
  onClose: () => void;
}

export function PreviewModal({
  file,
  isOpen,
  title,
  previewUrl,
  onClose,
}: PreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-7xl max-h-[95vh] p-0 bg-black border-0 rounded-none flex flex-col'>
        <div className='flex justify-between items-center p-4 bg-black text-white'>
          <DialogTitle className='text-xl font-medium'>{title}</DialogTitle>
          <Button
            onClick={onClose}
            variant='ghost'
            className='p-0 h-8 w-8 rounded-full bg-red-700 text-white hover:bg-red-800'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>

        <div className='flex-1 flex justify-center items-center overflow-hidden p-2 bg-black'>
          <iframe
            src={previewUrl}
            width='100%'
            height='100%'
            title={file.name}
            className='border-0 min-h-[70vh] bg-black'
            allowFullScreen
          ></iframe>
        </div>

        <div className='p-4 flex justify-center'>
          <Button
            onClick={onClose}
            className='bg-red-700 hover:bg-red-800 text-white font-medium px-8 py-2 rounded-none'
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
