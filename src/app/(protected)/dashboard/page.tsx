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
import { serviceOptions } from "@/db/constants";
import { SelectScrollable } from "@/src/components/select/select-scrollable";

const data: Client[] = [
  {
    id: "1",
    name: "Alejandra",
    lastName: "González",
    email: "alejandra.gonzalez@example.com",
    phone: "555-0101",
    role: "Administrador",
    marketingServices: [
      { id: "marketingSalon", name: "Marketing Salón", order: 1 },
      { id: "guiaMarketingDigital", name: "Guía Marketing Digital", order: 2 },
      { id: "startMarketing", name: "Start Marketing", order: 3 },
      { id: "teams", name: "Teams", order: 4 },
    ],
    formationServices: [
      { id: "scalingS", name: "Scaling-S", order: 1 },
      { id: "salonHiperventas", name: "Salón Hiperventas", order: 2 },
      { id: "consultoria360", name: "Consultoría 360º", order: 3 },
      { id: "ibm", name: "IBM", order: 4 },
      { id: "starClub", name: "Star Club", order: 5 },
      { id: "salonExperience", name: "Salón Experience", order: 6 },
    ],
    mentoringServices: [
      { id: "gestionDirectiva", name: "Gestión Directiva", order: 1 },
      { id: "sesionesIndividuales", name: "Sesiones Individuales", order: 2 },
      { id: "insideClub", name: "INSIDE Club", order: 3 },
      { id: "consultoriasGrupales", name: "Consultorías Grupales", order: 4 },
    ],
    toolsServices: [],
    lastConnection: "2024-04-15T10:00:00Z",
    startDate: "2023-01-01T00:00:00Z",
    endDate: "2025-12-31T23:59:59Z",
  },
  {
    id: "2",
    name: "Carlos",
    lastName: "Martínez",
    email: "carlos.martinez@example.com",
    phone: "555-0102",
    role: "Cliente",
    marketingServices: [
      { id: "marketingSalon", name: "Marketing Salón", order: 1 },
      { id: "guiaMarketingDigital", name: "Guía Marketing Digital", order: 2 },
      { id: "startMarketing", name: "Start Marketing", order: 3 },
      { id: "teams", name: "Teams", order: 4 },
    ],
    formationServices: [
      { id: "scalingS", name: "Scaling-S", order: 1 },
      { id: "salonHiperventas", name: "Salón Hiperventas", order: 2 },
      { id: "consultoria360", name: "Consultoría 360º", order: 3 },
      { id: "ibm", name: "IBM", order: 4 },
      { id: "starClub", name: "Star Club", order: 5 },
      { id: "salonExperience", name: "Salón Experience", order: 6 },
    ],
    mentoringServices: [],
    toolsServices: [],
    lastConnection: "2024-04-14T09:30:00Z",
    startDate: "2023-02-15T00:00:00Z",
    endDate: "2025-11-15T23:59:59Z",
  },
  {
    id: "3",
    name: "Sofía",
    lastName: "López",
    email: "sofia.lopez@example.com",
    phone: "555-0103",
    role: "Cliente",
    marketingServices: [],
    formationServices: [
      { id: "scalingS", name: "Scaling-S", order: 1 },
      { id: "salonHiperventas", name: "Salón Hiperventas", order: 2 },
      { id: "consultoria360", name: "Consultoría 360º", order: 3 },
      { id: "ibm", name: "IBM", order: 4 },
      { id: "starClub", name: "Star Club", order: 5 },
      { id: "salonExperience", name: "Salón Experience", order: 6 },
    ],
    mentoringServices: [],
    toolsServices: [],
    lastConnection: "2024-04-13T11:20:00Z",
    startDate: "2023-03-20T00:00:00Z",
    endDate: "2025-10-20T23:59:59Z",
  },
  {
    id: "4",
    name: "Miguel",
    lastName: "Hernández",
    email: "miguel.hernandez@example.com",
    phone: "555-0104",
    role: "Cliente",
    marketingServices: [],
    formationServices: [
      { id: "scalingS", name: "Scaling-S", order: 1 },
      { id: "salonHiperventas", name: "Salón Hiperventas", order: 2 },
      { id: "consultoria360", name: "Consultoría 360º", order: 3 },
      { id: "ibm", name: "IBM", order: 4 },
      { id: "starClub", name: "Star Club", order: 5 },
      { id: "salonExperience", name: "Salón Experience", order: 6 },
    ],
    mentoringServices: [],
    toolsServices: [
      { id: "menuServicios", name: "Menú de Servicios", order: 1 },
    ],
    lastConnection: "2024-04-16T12:45:00Z",
    startDate: "2023-04-25T00:00:00Z",
    endDate: "2025-09-25T23:59:59Z",
  },
  {
    id: "5",
    name: "Daniela",
    lastName: "Pérez",
    email: "daniela.perez@example.com",
    phone: "555-0105",
    role: "Empleado",
    marketingServices: [],
    formationServices: [],
    mentoringServices: [],
    toolsServices: [
      { id: "menuServicios", name: "Menú de Servicios", order: 1 },
    ],
    lastConnection: "2024-04-17T08:00:00Z",
    startDate: "2023-05-30T00:00:00Z",
    endDate: "2025-08-30T23:59:59Z",
  },
];

type Client = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  marketingServices: Service[];
  formationServices: Service[];
  mentoringServices: Service[];
  toolsServices: Service[];
  lastConnection: string; // ISO date string
  startDate: string; // ISO date string
  endDate: string; // ISO date string;
};

interface Category {
  id: string;
  name: string;
  order: number;
  services: Service[];
}

interface Service {
  id: string;
  name: string;
  order: number;
}

interface ServiceSelection {
  id: string;
  name: string;
}

interface ServiceFilter {
  [category: string]: ServiceSelection[];
}

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
    accessorKey: "lastConnection",
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
    cell: ({ row }) =>
      new Date(row.getValue("lastConnection")).toLocaleDateString(),
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha de Alta
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => new Date(row.getValue("startDate")).toLocaleDateString(),
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
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(client.id)}
            >
              Copy client ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View client details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function DataTableDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [serviceFilter, setServiceFilter] = React.useState<ServiceFilter>({});

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

  return (
    <div className=" flex-col flex col-span-full items-start">
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
            <Button size="sm">Crear nuevo cliente</Button>
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
            <div className="flex items-center py-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    Services <ChevronDownIcon className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {serviceOptions
                    .sort((a, b) => a.order - b.order) // Ordena las categorías de servicios por su orden
                    .map((category) => (
                      <DropdownMenuGroup key={category.id}>
                        <DropdownMenuLabel>
                          {category.name.toUpperCase()}
                        </DropdownMenuLabel>
                        {category.services
                          .sort((a, b) => a.order - b.order) // Ordena los servicios por su orden
                          .map((service) => (
                            <DropdownMenuCheckboxItem
                              key={service.id}
                              checked={
                                serviceFilter[category.id]?.some(
                                  (selectedService) =>
                                    selectedService.id === service.id
                                ) || false
                              }
                              onCheckedChange={(checked) => {
                                // Obtiene la lista actual de servicios seleccionados para esta categoría,
                                // o inicialízala como un array vacío si aún no hay nada seleccionado.
                                const currentServices =
                                  serviceFilter[category.id] || [];

                                // Determina si el servicio actual ya está seleccionado.
                                const isServiceSelected = currentServices.some(
                                  (selectedService) =>
                                    selectedService.id === service.id
                                );

                                // Si `checked` es true y el servicio no está ya seleccionado, añádelo.
                                // Si `checked` es false, filtra el servicio para eliminarlo.
                                const updatedServices = checked
                                  ? isServiceSelected
                                    ? currentServices // Si ya está seleccionado, no hagas cambios.
                                    : [
                                        ...currentServices,
                                        { id: service.id, name: service.name },
                                      ] // Añade el servicio.
                                  : currentServices.filter(
                                      (selectedService) =>
                                        selectedService.id !== service.id
                                    ); // Elimina el servicio.

                                // Actualiza el filtro completo con los servicios actualizados para esta categoría.
                                const newFilter = {
                                  ...serviceFilter,
                                  [category.id]: updatedServices,
                                };

                                setServiceFilter(newFilter);
                                console.log("serviceFilter", serviceFilter);
                                // A continuación, debes adaptar cómo quieres aplicar este estado de filtro a la tabla.
                                // Esto podría implicar convertir `serviceFilter` a un formato que tu lógica de filtrado en la tabla pueda manejar.
                              }}
                            >
                              {service.name.toUpperCase()}
                            </DropdownMenuCheckboxItem>
                          ))}
                      </DropdownMenuGroup>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
    </div>
  );
}
