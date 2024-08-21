// src/stores/backupStore.ts
import { create } from "zustand";
import { HoldedContactsBackupType } from "@prisma/client";

interface BackupStore {
  isCreatingBackup: HoldedContactsBackupType | null;
  setIsCreatingBackup: (type: HoldedContactsBackupType | null) => void;
}

export const useBackupStore = create<BackupStore>((set) => ({
  isCreatingBackup: null,
  setIsCreatingBackup: (type) => set({ isCreatingBackup: type }),
}));
