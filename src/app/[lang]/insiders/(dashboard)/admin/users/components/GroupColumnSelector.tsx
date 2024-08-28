import React from "react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/src/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import { Table } from "@tanstack/react-table";
import { useTranslations } from "@/src/context/TranslationContext";

interface GroupColumnSelectorProps<TData> {
  table: Table<TData>;
}

export function GroupColumnSelector<TData>({
  table,
}: GroupColumnSelectorProps<TData>) {
  const t = useTranslations();

  // Function to toggle visibility of all columns in a categoryId
  const handleToggleCategoryVisibility = (
    categoryId: string,
    isVisible: boolean
  ) => {
    table.getAllColumns().forEach((column) => {
      const meta = column.columnDef.meta as { categoryId?: string } | undefined;
      if (meta?.categoryId === categoryId) {
        column.toggleVisibility(isVisible);
      }
    });
  };

  // Memoized computation of categories and subcategories
  const categories = React.useMemo(() => {
    const cats: Record<string, Record<string, any[]>> = {};
    table.getAllColumns().forEach((column) => {
      const meta = column.columnDef.meta as
        | { categoryId?: string; subCategoryId?: string }
        | undefined;
      if (meta?.categoryId && meta?.subCategoryId) {
        if (!cats[meta.categoryId]) cats[meta.categoryId] = {};
        if (!cats[meta.categoryId][meta.subCategoryId])
          cats[meta.categoryId][meta.subCategoryId] = [];
        cats[meta.categoryId][meta.subCategoryId].push(column);
      }
    });

    console.log("Generated categories:", cats); // Debugging log
    return cats;
  }, [table]);

  // Function to get translation or fallback
  const getTranslation = (key: string, fallback: string) => {
    const translation = t(key);
    return translation === key ? fallback : translation;
  };

  // Function to get translation for a field
  const getFieldTranslation = (
    categoryId: string,
    subCategoryId: string,
    fieldId: string
  ) => {
    // Remove prefix (e.g., 'clientsFields_' or 'salesFields_')
    const cleanFieldId = fieldId.replace(/^.*?_/, "");

    // Construct possible translation keys
    const possibleKeys = [
      `fields.${categoryId}.groups.${subCategoryId}.fields.${cleanFieldId}.title`,
      `fields.${categoryId}.groups.${subCategoryId}.fields.${fieldId}.title`,
      `fields.${categoryId}.groups.${subCategoryId}.fields.${cleanFieldId}`,
      `fields.${categoryId}.groups.${subCategoryId}.fields.${fieldId}`,
    ];

    // Try each translation key
    for (const key of possibleKeys) {
      const translation = t(key);
      if (translation !== key) {
        return translation;
      }
    }

    // Return the clean field ID if no translation is found
    return cleanFieldId.replace(/^CLIENTES - /, "");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          {getTranslation("fields.common.columns", "Columnas")}{" "}
          <ChevronDownIcon className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[200px] max-h-[400px] overflow-y-auto"
      >
        <DropdownMenuCheckboxItem
          checked={table
            .getAllColumns()
            .every((column) => column.getIsVisible())}
          onCheckedChange={(value) => table.toggleAllColumnsVisible(!!value)}
        >
          {getTranslation("Common.columns.all", "Mostrar todo")}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {Object.entries(categories).map(([categoryId, subCategories]) => (
          <DropdownMenuSub key={categoryId}>
            <DropdownMenuSubTrigger>
              <DropdownMenuCheckboxItem
                checked={table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      (column.columnDef.meta as any)?.categoryId === categoryId
                  )
                  .every((column) => column.getIsVisible())}
                onCheckedChange={(value) =>
                  handleToggleCategoryVisibility(categoryId, !!value)
                }
              >
                {getTranslation(`fields.${categoryId}.title`, categoryId)}
              </DropdownMenuCheckboxItem>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="max-h-[400px] overflow-y-auto">
              {Object.entries(subCategories).map(([subCategoryId, columns]) => (
                <React.Fragment key={subCategoryId}>
                  <DropdownMenuLabel>
                    {getTranslation(
                      `fields.${categoryId}.groups.${subCategoryId}.title`,
                      subCategoryId
                    )}
                  </DropdownMenuLabel>
                  {columns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {getFieldTranslation(
                        categoryId,
                        subCategoryId,
                        column.id
                      )}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                </React.Fragment>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
