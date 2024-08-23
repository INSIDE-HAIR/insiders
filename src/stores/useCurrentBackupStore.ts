import { create } from "zustand";
import { HoldedContactsBackupType } from "@prisma/client";

interface CurrentBackupStore {
  isCreatingBackup: Record<HoldedContactsBackupType, boolean>;
  setIsCreatingBackup: (
    type: HoldedContactsBackupType,
    isCreating: boolean
  ) => void;
}

export const useCurrentBackupStore = create<CurrentBackupStore>((set) => ({
  isCreatingBackup: {
    CURRENT: false,
    DAILY: false,
    MONTHLY: false,
    FAVORITE: false,
  },
  setIsCreatingBackup: (type, isCreating) =>
    set((state) => ({
      isCreatingBackup: {
        ...state.isCreatingBackup,
        [type]: isCreating,
      },
    })),
}));
