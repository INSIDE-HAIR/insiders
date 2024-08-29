import React, { useMemo } from "react";
import { DataTable } from "./components/DataTable";
import { useUsers2Columns } from "./users2Columns";

interface Users2TableProps {
  data: any[];
}

export const Users2Table: React.FC<Users2TableProps> = ({ data }) => {
  const columns = useUsers2Columns(data);

  const processedData = useMemo(() => {
    return data.map((item) => {
      const customFieldsObject: { [key: string]: string } = {};
      item.customFields.forEach((cf: { field: string; value: string }) => {
        customFieldsObject[cf.field] = cf.value;
      });

      return {
        ...item,
        customFields: customFieldsObject,
      };
    });
  }, [data]);

  return <DataTable columns={columns} data={processedData} />;
};
