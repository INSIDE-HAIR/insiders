import React from "react";
import { DataTable } from "./DataTable";
import { columns } from "./columns/monthlyColumns";
import { useBackups } from "@/src/hooks/useBackups";
import { HoldedContactsMonthlyBackup } from "@prisma/client";

const MonthlyBackupsTab: React.FC = () => {
  const { monthlyBackups, loadingBackupId, deleteBackup } = useBackups();

  return (
    <div>
      <DataTable
        columns={columns}
        data={monthlyBackups as HoldedContactsMonthlyBackup[]}
        loadingBackupId={loadingBackupId}
        onDelete={(backup) => deleteBackup(backup.id, "MONTHLY")}
        onViewDetails={() => {}}
        openDeleteModal={() => {}}
        pageSize={10}
      />
    </div>
  );
};

export default MonthlyBackupsTab;
