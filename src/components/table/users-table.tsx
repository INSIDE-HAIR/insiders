"use client";
import * as React from "react";
import { ChevronDownIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/src/components/ui/buttons/chadcn-button";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import Link from "next/link";
import { getUsers } from "@/prisma/query/user";
import { User, HoldedData, CustomField } from "@prisma/client";
import { Field, dataBaseTranslation } from "@/db/constants";
import TextFilterHeader from "@/src/components/table/filters/text-filter-header";
import CheckboxFilterHeader from "@/src/components/table/filters/checkbox-filter-header";
import DateRangeFilterHeader from "@/src/components/table/filters/date-range-filter-header";
import FilterBadges from "@/src/components/table/filters/filter-badges";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Pagination } from "@/src/components/table/pagination/pagination";

// Extend the User type to include HoldedData and CustomFields
type ExtendedUser = User & {
  holdedData?: HoldedData & {
    customFields: CustomField[];
  };
};

export default function UsersTable() {
  const pageSizeOptions = [1, 5, 10, 25, 50, 100, 500, 1000, 2000];
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [data, setData] = React.useState<ExtendedUser[]>([]);
  const [pageSize, setPageSize] = React.useState(10);

  const [insidersFieldsActive, setInsidersFieldsActive] = React.useState(false);
  const [marketingActive, setMarketingActive] = React.useState(false);
  const [salesFieldsActive, setSalesFieldsActive] = React.useState(false);
  const [clientFieldsActive, setClientFieldsActive] = React.useState(false);
  const [consultoriaMentoringActive, setConsultoriaMentoringActive] =
    React.useState(false);
  const [formacionesActive, setFormacionesActive] = React.useState(false);
  const [creativitiesActive, setCreativitiesActive] = React.useState(false);
  const [pageIndex, setPageIndex] = React.useState(0);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await getUsers();
        if (users !== null) {
          // Verifica si los datos incluyen holdedData y customFields
          console.log(users);
          setData(users as unknown as ExtendedUser[]);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setData([]);
      }
    };
    fetchData();
  }, []);
  
  React.useEffect(() => {
    table.setPageCount(Math.ceil(data.length / pageSize));
  }, [data, pageSize]);

  const handleRemoveFilter = (
    id: string,
    value?: string | { from?: number; to?: number }
  ) => {
    setColumnFilters((filters) => {
      if (value) {
        if (typeof value === "object") {
          return filters
            .map((filter) => {
              if (filter.id === id) {
                const newValue = { ...(filter.value as object) };
                if (value.from) delete (newValue as { from?: number }).from;
                if (value.to) delete (newValue as { to?: number }).to;
                return {
                  ...filter,
                  value:
                    Object.keys(newValue).length === 0 ? undefined : newValue,
                };
              }
              return filter;
            })
            .filter((filter) => filter.value !== undefined);
        } else {
          return filters
            .map((filter) => {
              if (filter.id === id && Array.isArray(filter.value)) {
                return {
                  ...filter,
                  value: (filter.value as string[]).filter(
                    (v: string) => v !== value
                  ),
                };
              }
              return filter;
            })
            .filter((filter) => (filter.value as string[]).length !== 0);
        }
      }
      return filters.filter((filter) => filter.id !== id);
    });
  };

  const handleAddFilter = (
    id: string,
    value: { from?: number; to?: number }
  ) => {
    setColumnFilters((filters) => {
      const existingFilter = filters.find((filter) => filter.id === id);
      if (existingFilter) {
        const newValue = { ...(existingFilter.value as object), ...value };
        return filters.map((filter) =>
          filter.id === id ? { ...filter, value: newValue } : filter
        );
      } else {
        return [...filters, { id, value }];
      }
    });
  };

  const createCustomColumns = (
    fields: Record<string, Field>,
    category: string,
    data: ExtendedUser[] // Pasar los datos para los encabezados
  ): ColumnDef<ExtendedUser>[] => {
    return Object.entries(fields || {}).map(([key, field]) => {
      return {
        accessorKey: `${category}.${field.es}`,
        header: ({ column }) => {
          if (field.type === "selection") {
            return (
              <CheckboxFilterHeader
                column={column}
                title={field.es}
                data={data}
                accessorKey={`${category}.${field.es}` as keyof ExtendedUser}
                options={field.options} // Pasar las opciones si están disponibles
              />
            );
          } else if (field.type === "date") {
            return (
              <DateRangeFilterHeader
                column={column}
                title={field.es}
                onAddFilter={handleAddFilter}
              />
            );
          } else {
            return <TextFilterHeader column={column} title={field.es} />;
          }
        },
        cell: ({ row }: any) => {
          const customField = row.original.holdedData?.customFields?.find(
            (cf: { field: string }) => cf.field === field.es
          );
          return <div>{customField?.value || "N/A"}</div>;
        },
        filterFn:
          field.type === "text" || field.type === "selection"
            ? (row, columnId, filterValue) => {
                if (!Array.isArray(filterValue) || filterValue.length === 0)
                  return true;
                const customField = row.original.holdedData?.customFields?.find(
                  (cf: { field: string }) => cf.field === field.es
                );
                const rowValue =
                  (customField?.value as string)?.toLowerCase() ?? "";
                return (filterValue as string[]).some((value) =>
                  rowValue.includes(value.toLowerCase())
                );
              }
            : undefined,
      };
    });
  };

  const columns: ColumnDef<ExtendedUser>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: { row: any }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "holdedId",
      header: ({ column }) => (
        <TextFilterHeader column={column} title="Holded ID" />
      ),
      cell: ({ row }) => (
        <div>{row.original.holdedData?.holdedId || "N/A"}</div>
      ),
      filterFn: (row, columnId, filterValue) => {
        if (!Array.isArray(filterValue) || filterValue.length === 0)
          return true;
        const rowValue =
          (row.getValue(columnId) as string)?.toLowerCase() ?? "";
        return (filterValue as string[]).some((value) =>
          rowValue.includes(value.toLowerCase())
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <TextFilterHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("email")}</div>
      ),
      filterFn: (row, columnId, filterValue) => {
        if (!Array.isArray(filterValue) || filterValue.length === 0)
          return true;
        const rowValue =
          (row.getValue(columnId) as string)?.toLowerCase() ?? "";
        return (filterValue as string[]).some((value) =>
          rowValue.includes(value.toLowerCase())
        );
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <TextFilterHeader column={column} title="Nombre" />
      ),
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("name")}</div>
      ),
      filterFn: (row, columnId, filterValue) => {
        if (!Array.isArray(filterValue) || filterValue.length === 0)
          return true;
        const rowValue =
          (row.getValue(columnId) as string)?.toLowerCase() ?? "";
        return (filterValue as string[]).some((value) =>
          rowValue.includes(value.toLowerCase())
        );
      },
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => (
        <TextFilterHeader column={column} title="Apellido" />
      ),
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("lastName")}</div>
      ),
      filterFn: (row, columnId, filterValue) => {
        if (!Array.isArray(filterValue) || filterValue.length === 0)
          return true;
        const rowValue =
          (row.getValue(columnId) as string)?.toLowerCase() ?? "";
        return (filterValue as string[]).some((value) =>
          rowValue.includes(value.toLowerCase())
        );
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <CheckboxFilterHeader
          column={column}
          title="Rol"
          data={data}
          accessorKey="role"
        />
      ),
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("role")}</div>
      ),
      filterFn: (row, columnId, filterValue) => {
        if (!Array.isArray(filterValue) || filterValue.length === 0) {
          return true;
        }
        const rowValue =
          (row.getValue(columnId) as string)?.toLowerCase() ?? "";
        return (filterValue as string[])
          .map((val) => val.toLowerCase())
          .includes(rowValue);
      },
    },
    ...(salesFieldsActive
      ? createCustomColumns(
          dataBaseTranslation.salesFields.sales,
          "sales",
          data
        )
      : []),
    ...(clientFieldsActive
      ? createCustomColumns(
          dataBaseTranslation.clientsFields.client,
          "clientFields",
          data
        )
      : []),
    ...(insidersFieldsActive
      ? createCustomColumns(
          dataBaseTranslation.clientsFields.insiders,
          "clientFields",
          data
        )
      : []),
    ...(marketingActive
      ? createCustomColumns(
          dataBaseTranslation.servicesFields.marketing,
          "marketing",
          data
        )
      : []),
    ...(consultoriaMentoringActive
      ? createCustomColumns(
          dataBaseTranslation.servicesFields.consultoriaMentoring,
          "consultoriaMentoring",
          data
        )
      : []),
    ...(formacionesActive
      ? createCustomColumns(
          dataBaseTranslation.servicesFields.formaciones,
          "formaciones",
          data
        )
      : []),
    ...(creativitiesActive
      ? createCustomColumns(
          dataBaseTranslation.servicesFields.creativities,
          "creativities",
          data
        )
      : []),
    {
      accessorKey: "lastLogin",
      header: ({ column }) => (
        <DateRangeFilterHeader
          column={column}
          title="Última conexión"
          onAddFilter={handleAddFilter}
        />
      ),
      cell: ({ row }) =>
        new Date(row.getValue("lastLogin")).toLocaleDateString(),
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const rowValue = new Date(row.getValue(columnId)).getTime();
        const { from, to } = filterValue as { from?: number; to?: number };
        if (from && to) {
          return rowValue >= from && rowValue <= to;
        } else if (from) {
          return rowValue >= from;
        } else if (to) {
          return rowValue <= to;
        }
        return true;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DateRangeFilterHeader
          column={column}
          title="Fecha de Creación"
          onAddFilter={handleAddFilter}
        />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const rowValue = new Date(row.getValue(columnId)).getTime();
        const { from, to } = filterValue as { from?: number; to?: number };
        if (from && to) {
          return rowValue >= from && rowValue <= to;
        } else if (from) {
          return rowValue >= from;
        } else if (to) {
          return rowValue <= to;
        }
        return true;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.id)}
              >
                Copiar ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.email)}
              >
                Copiar Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Link href={`/insiders/admin/users/${user.email}`}>
                <DropdownMenuItem>Ver o Editar</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Dentro de tu componente UsersTable
  const paginatedData = React.useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, pageIndex, pageSize]);

  const table = useReactTable({
    data: paginatedData,
    columns,
    pageCount: Math.ceil(data.length / pageSize),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageSize,
        pageIndex,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex, pageSize });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      }
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
  });

  const appliedFilters = columnFilters.map((filter) => ({
    id: filter.id,
    value: filter.value as string | string[] | { from?: number; to?: number },
  }));

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <h2 className="text-sm font-medium">Filtros aplicados</h2>
        <FilterBadges filters={appliedFilters} onRemove={handleRemoveFilter} />
      </div>

      <div className="flex items-center justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Grupos de Columnas <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuCheckboxItem
              checked={salesFieldsActive}
              onCheckedChange={setSalesFieldsActive}
            >
              Ventas
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={clientFieldsActive}
              onCheckedChange={setClientFieldsActive}
            >
              Clientes
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={insidersFieldsActive}
              onCheckedChange={setInsidersFieldsActive}
            >
              Insiders
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={marketingActive}
              onCheckedChange={setMarketingActive}
            >
              Marketing
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={consultoriaMentoringActive}
              onCheckedChange={setConsultoriaMentoringActive}
            >
              Consultoría y Mentoring
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={formacionesActive}
              onCheckedChange={setFormacionesActive}
            >
              Formaciones
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={creativitiesActive}
              onCheckedChange={setCreativitiesActive}
            >
              Creatividades
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columnas Individuales <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="table-header py-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
        </div>
        <Pagination
          table={table}
          pageIndex={pageIndex}
          pageCount={table.getPageCount()}
          setPageIndex={setPageIndex}
        />
      </div>
      <div className="flex gap-2 items-center">
        <h2 className="text-sm text-slate-600">Mostrar en lista:</h2>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => {
            const newPageSize = Number(value);
            table.setPageSize(newPageSize);
            setPageSize(newPageSize);
            setPageIndex(0); // Resetear a la primera página
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Usuarios por página" />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
