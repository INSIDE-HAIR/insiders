"use client";
import * as React from "react";
import {
  CaretSortIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons";
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
  DropdownMenuGroup,
} from "@/src/components/ui/dropdown-menu";
import { Input } from "@/src/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Package2Icon, SearchIcon } from "lucide-react";
import Link from "next/link";
import TailwindGrid from "@/src/components/grid/TailwindGrid";
import { getListUsers } from "@/src/server-actions/contacts/list-contacts";
import { UserRole } from "@prisma/client";
import { getListHoldedContacts } from "@/src/server-actions/holded/list-contacts";
import { Client } from "@/src/next-auth";


const columns: ColumnDef<Client>[] = [
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
    cell: ({ row }) => (
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Holded ID
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("holdedId")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Apellido
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("lastName")}</div>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Roles
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue("role")}</div>,
  },
  {
    accessorKey: "marketingServices",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          S. de Marketing
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const activeServicesIds = row.getValue("marketingServices") as any[];
      return (
        <div className="flex flex-wrap gap-2">
          {activeServicesIds &&
            activeServicesIds.map((service: any) => (
              <div
                key={service.id}
                className="bg-blue-200 text-blue-800 py-1 px-3 rounded-lg text-xs"
              >
                {service.name.toUpperCase()}
              </div>
            ))}
        </div>
      );
    },
  },
  {
    accessorKey: "formationServices",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          S. de Formación
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const activeServicesIds = row.getValue("formationServices") as any[];
      return (
        <div className="flex flex-wrap gap-2">
          {activeServicesIds &&
            activeServicesIds.map((service: any) => (
              <div
                key={service.id}
                className="bg-blue-200 text-blue-800 py-1 px-3 rounded-lg text-xs"
              >
                {service.name.toUpperCase()}
              </div>
            ))}
        </div>
      );
    },
  },
  {
    accessorKey: "mentoringServices",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          S. de Mentoría
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const activeServicesIds = row.getValue("mentoringServices") as any[];
      return (
        <div className="flex flex-wrap gap-2">
          {activeServicesIds &&
            activeServicesIds.map((service: any) => (
              <div
                key={service.id}
                className="bg-blue-200 text-blue-800 py-1 px-3 rounded-lg text-xs"
              >
                {service.name.toUpperCase()}
              </div>
            ))}
        </div>
      );
    },
  },
  {
    accessorKey: "toolsServices",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          S. de Herramienta
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const activeServicesIds = row.getValue("toolsServices") as any[];
      return (
        <div className="flex flex-wrap gap-2">
          {activeServicesIds &&
            activeServicesIds.map((service: any) => (
              <div
                key={service.id}
                className="bg-blue-200 text-blue-800 py-1 px-3 rounded-lg text-xs"
              >
                {service.name.toUpperCase()}
              </div>
            ))}
        </div>
      );
    },
  },
  {
    accessorKey: "lastLogin",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Última conexión
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => new Date(row.getValue("lastLogin")).toLocaleDateString(),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha de Creación
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      function formatDate(dateString: string | number | Date) {
        const date = new Date(dateString);
        let day = date.getDate().toString().padStart(2, "0");
        let month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
        let year = date.getFullYear().toString().slice(2); // Get last two digits of the year
        let hours = date.getHours().toString().padStart(2, "0");
        let minutes = date.getMinutes().toString().padStart(2, "0");

        return `${day}/${month}/${year} ${hours}:${minutes}`; // Returns the date in dd/mm/yy HH:mm format
      }

      return (
        <div className="lowercase">{formatDate(row.getValue("createdAt"))}</div>
      );
    },
  },
  {
    accessorKey: "endDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha de Baja
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => new Date(row.getValue("endDate")).toLocaleDateString(),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const client = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones:</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(client.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(client.email)}
            >
              Copiar Email
            </DropdownMenuItem>
            {client.contactNumber && (
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(client.contactNumber ?? "")
                }
              >
                Copiar Teléfono
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sincronizar con Holded</DropdownMenuItem>
            <DropdownMenuSeparator />
            <Link href={`/insiders/admin/users/${client.id}`}>
              <DropdownMenuItem>Ver</DropdownMenuItem>
            </Link>
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem className="text-danger-500">
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function Page() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pageSize, setPageSize] = React.useState(10); // TODO: Tengo que hacer que este valor sea dinámico
  const [data, setData] = React.useState<Client[]>([]); // TypeScript now knows that data is an array of User objects
  const [dataListHoldedContacts, setDataListHoldedContacts] = React.useState<
    HoldedContact[]
  >([]); // TypeScript now knows that data is an array of User objects

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Block I added to update the data:
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await getListUsers();

        if (users !== null) {
          setData(users);
        } else {
          // Handle the null case, maybe set data to an empty array
          setData([]);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setData([]); // Set an empty array in case of an error
      }

      try {
        const holdedContacts = await getListHoldedContacts();

        if (holdedContacts !== null) {
          setDataListHoldedContacts(holdedContacts);

          console.log(holdedContacts);
        } else {
          // Handle the null case, maybe set data to an empty array
          setDataListHoldedContacts([]);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setDataListHoldedContacts([]); // Set an empty array in case of an error
      }
    };
    fetchData();
  }, []); // Dependency array includes pageSize which triggers re-fetching when changed

  let emailColumn = table.getColumn("role");
  if (emailColumn) {
    // Now TypeScript knows that emailColumn is not undefined in this block
    let emailFilterValue = emailColumn.getFilterValue() as Array<string>;
    // Use emailFilterValue...
  }

  const dataListId = "role" + "list";

  return (
    <>
      <TailwindGrid fullSize>
        <header className="max-w-full col-start-1 col-end-full md:col-end-6 lg:col-start-3 lg:col-end-13 flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 col-span-full">
          <Link className="lg:hidden" href="#">
            <Package2Icon className="h-6 w-6" />
            <span className="sr-only">Home</span>
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Usuarios</h1>
          </div>
          <div className=" flex gap-2 items-center">
            <Button className="ml-auto h-8 w-8 lg:hidden" size="icon">
              <SearchIcon className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
            <Link href={"/insiders/admin/users/create"}>
              <Button size="sm">Crear nuevo cliente</Button>
            </Link>
          </div>
        </header>
      </TailwindGrid>
      <TailwindGrid>
        <main className="col-start-1 max-w-full w-full col-end-full md:col-start-1 md:col-end-6 lg:col-start-3 lg:col-end-13  order-2 md:order-1 z-30  col-span-full">
          <fieldset className="flex items-center  mt-2">
            <legend> Filtros: </legend>
            <Input
              placeholder="Correo"
              value={
                (table.getColumn("email")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("email")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />

            <Input
              placeholder="Nombre"
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <Input
              placeholder="Apellido"
              value={
                (table.getColumn("lastName")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("lastName")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </fieldset>
          <div className="flex items-center py-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
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
                        <TableHead key={header.id}>
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
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </main>
      </TailwindGrid>
    </>
  );
}
