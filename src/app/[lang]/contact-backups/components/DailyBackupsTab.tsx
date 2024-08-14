import React from "react";
import { DataTable } from "./DataTable";
import { columns } from "./columns/dailyColumns";
import { useBackups } from "@/src/hooks/useBackups";
import { HoldedContactsDailyBackup } from "@prisma/client";

const DailyBackupsTab: React.FC = () => {
  const { dailyBackups, loadingBackupId, deleteBackup } = useBackups();

  return (
    <div>
      <DataTable
        columns={columns}
        data={dailyBackups as HoldedContactsDailyBackup[]}
        loadingBackupId={loadingBackupId}
        onDelete={(backup) => deleteBackup(backup.id, "DAILY")}
        onViewDetails={() => {}}
        openDeleteModal={() => {}}
        pageSize={10}
      />
    </div>
  );
};

export default DailyBackupsTab;
