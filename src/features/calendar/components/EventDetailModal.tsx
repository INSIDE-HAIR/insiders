"use client";

import React from "react";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
import {
  ResponsiveModal,
  ResponsiveModalContent,
} from "@/src/components/shared/ui/responsive-modal";
import { EventDetailContent } from "./EventDetailContent";

interface EventDetailModalProps {
  event: GoogleCalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEvent: Partial<GoogleCalendarEvent>) => Promise<void>;
  onDelete: () => Promise<void>;
  calendars: Array<{
    id: string;
    summary: string;
    backgroundColor?: string;
    foregroundColor?: string;
  }>;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  calendars,
}) => {
  if (!event) return null;

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onClose}>
      <ResponsiveModalContent
        side="top"
        className="max-w-6xl w-full max-h-[95vh] p-0 bg-background border border-border shadow-2xl"
      >
        <EventDetailContent
          event={event}
          onSave={onSave}
          onDelete={onDelete}
          calendars={calendars}
          showCloseButton={true}
          onClose={onClose}
        />
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
};