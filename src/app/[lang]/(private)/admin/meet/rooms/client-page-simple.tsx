"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/hooks/use-toast";
import { 
  VideoCameraIcon, 
  PlusIcon
} from "@heroicons/react/24/outline";
import { CreateRoomModal } from "@/src/features/meet/components/CreateRoomModalSimple";

interface MeetRoomsClientProps {
  lang: string;
}

export const MeetRoomsClient: React.FC<MeetRoomsClientProps> = ({ lang }) => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleTest = () => {
    toast({
      title: "Test",
      description: "Toast funcionando correctamente"
    });
  };

  const handleCreateRoom = async (data: any) => {
    console.log("Create room:", data);
    toast({
      title: "Sala creada",
      description: "Sala creada exitosamente"
    });
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VideoCameraIcon className="h-8 w-8 text-primary" />
            Google Meet Rooms - {lang}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Sistema de Google Meet en desarrollo</p>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleTest}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Test Toast
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              Test Modal
            </Button>
          </div>
        </CardContent>
      </Card>

      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCreateRoom}
      />
    </div>
  );
};