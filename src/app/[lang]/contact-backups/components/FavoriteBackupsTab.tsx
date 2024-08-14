import React from "react";
import { DataTable } from "./DataTable";
import { columns } from "./columns/favoriteColumns";
import { useBackups } from "@/src/hooks/useBackups";
import { HoldedContactsFavoriteBackup } from "@prisma/client";

const FavoriteBackupsTab: React.FC = () => {
  const { favoriteBackups, loadingBackupId, deleteBackup } = useBackups();

  return (
    <div>
      <DataTable
        columns={columns}
        data={favoriteBackups as HoldedContactsFavoriteBackup[]}
        loadingBackupId={loadingBackupId}
        onDelete={(backup) => deleteBackup(backup.id, "FAVORITE")}
        onViewDetails={() => {}}
        openDeleteModal={() => {}}
        pageSize={10}
      />
    </div>
  );
};

export default FavoriteBackupsTab;
