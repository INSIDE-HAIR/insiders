"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => Promise<void>;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Crear Nueva Sala de Meet</DialogTitle>
          <DialogDescription>
            Configura una nueva sala de reuniones
          </DialogDescription>
        </DialogHeader>

        <div className='p-4'>
          <p>Modal simplificado para testing</p>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm({})}>Crear Sala</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
