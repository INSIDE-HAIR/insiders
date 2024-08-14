import React from "react";
import {
  HoldedContactsCurrentBackup,
  HoldedContactsDailyBackup,
  HoldedContactsMonthlyBackup,
  HoldedContactsFavoriteBackup,
} from "@prisma/client";

interface BackupDetailsProps {
  backup:
    | HoldedContactsCurrentBackup
    | HoldedContactsDailyBackup
    | HoldedContactsMonthlyBackup
    | HoldedContactsFavoriteBackup;
}

const BackupDetails: React.FC<BackupDetailsProps> = ({ backup }) => {
  return (
    <div className="border rounded-md p-4 bg-gray-100">
      <h3 className="text-lg font-semibold mb-2">Backup Details</h3>
      <div>
        <strong>ID:</strong> {backup.id}
      </div>
      <div>
        <strong>Created At:</strong>{" "}
        {new Date(backup.createdAt).toLocaleString()}
      </div>
      {backup.updatedAt && (
        <div>
          <strong>Updated At:</strong>{" "}
          {new Date(backup.updatedAt).toLocaleString()}
        </div>
      )}
      {backup.hasOwnProperty("dayOfMonth") && (
        <div>
          <strong>Day of Month:</strong>{" "}
          {"dayOfMonth" in backup ? backup.dayOfMonth : "-"}
        </div>
      )}
      {backup.hasOwnProperty("month") && (
        <div>
          <strong>Month:</strong> {"month" in backup ? backup.month : "-"}
        </div>
      )}
      {backup.hasOwnProperty("year") && (
        <div>
          <strong>Year:</strong> {"year" in backup ? backup.year : "-"}
        </div>
      )}
      <div>
        <strong>Data:</strong>
        <pre className="mt-2 p-2 bg-white rounded">
          {JSON.stringify(backup.data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default BackupDetails;
