import React, { useEffect, useState } from "react";
import { DataTable } from "./DataTable";
import { columns } from "./columns/currentColumns";
import { useBackups } from "@/src/hooks/useBackups";
import { HoldedContactsCurrentBackup } from "@prisma/client";

const CurrentBackupTab: React.FC = () => {
  const { currentBackup, loadingBackupId, deleteBackup } = useBackups();

  const [backupData, setBackupData] = useState<HoldedContactsCurrentBackup[]>(
    []
  );

  useEffect(() => {
    if (currentBackup) {
      setBackupData([currentBackup]);
    }
  }, [currentBackup]);

  return (
    <div>
      <DataTable
        columns={columns}
        data={backupData}
        loadingBackupId={loadingBackupId}
        onDelete={(backup) => deleteBackup(backup.id, "CURRENT")}
        onViewDetails={() => {}}
        openDeleteModal={() => {}}
        pageSize={1}
      />
    </div>
  );
};

export default CurrentBackupTab;
