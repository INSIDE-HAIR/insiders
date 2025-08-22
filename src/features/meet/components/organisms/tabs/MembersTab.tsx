import React from "react";
import { MembersSection } from "../sections/MembersSection";
import { RoomMember } from "../../../hooks/useRoomMembers";
import { cn } from "@/src/lib/utils";

export interface MembersTabProps {
  members: RoomMember[];
  onMembersChange: (members: RoomMember[]) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Tab completa de gestión de miembros
 * Wrapper simple alrededor de MembersSection
 */
export const MembersTab: React.FC<MembersTabProps> = ({
  members,
  onMembersChange,
  disabled,
  className,
}) => {
  return (
    <div className={cn("mt-4", className)}>
      <MembersSection
        initialMembers={members}
        onMembersChange={onMembersChange}
        disabled={disabled}
      />
    </div>
  );
};