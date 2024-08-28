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

  // Function to toggle visibility of all columns in a category
  const handleToggleCategoryVisibility = (
    category: string,
    isVisible: boolean
  ) => {
    table.getAllColumns().forEach((column) => {
      const meta = column.columnDef.meta as { category?: string } | undefined;
      if (meta?.category === category) {
        column.toggleVisibility(isVisible);
      }
    });
  };

  // Memoized computation of categories and subcategories
  const categories = React.useMemo(() => {
    const cats: Record<string, Record<string, any[]>> = {};
    table.getAllColumns().forEach((column) => {
      const meta = column.columnDef.meta as
        | { category?: string; subCategory?: string }
        | undefined;
      if (meta?.category && meta?.subCategory) {
        if (!cats[meta.category]) cats[meta.category] = {};
        if (!cats[meta.category][meta.subCategory])
          cats[meta.category][meta.subCategory] = [];
        cats[meta.category][meta.subCategory].push(column);
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
    category: string,
    subCategory: string,
    fieldId: string
  ) => {
    // Remove prefix (e.g., 'clientsFields_' or 'salesFields_')
    const cleanFieldId = fieldId.replace(/^.*?_/, "");

    // Construct possible translation keys
    const possibleKeys = [
      `fields.${category}Fields.groups.${subCategory}.fields.${cleanFieldId}.title`,
      `fields.${category}Fields.groups.${subCategory}.fields.${fieldId}.title`,
      `fields.${category}Fields.groups.${subCategory}.fields.${cleanFieldId}`,
      `fields.${category}Fields.groups.${subCategory}.fields.${fieldId}`,
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
        {Object.entries(categories).map(([category, subCategories]) => (
          <DropdownMenuSub key={category}>
            <DropdownMenuSubTrigger>
              <DropdownMenuCheckboxItem
                checked={table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      (column.columnDef.meta as any)?.category === category
                  )
                  .every((column) => column.getIsVisible())}
                onCheckedChange={(value) =>
                  handleToggleCategoryVisibility(category, !!value)
                }
              >
                {getTranslation(`fields.${category}Fields.title`, category)}
              </DropdownMenuCheckboxItem>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="max-h-[400px] overflow-y-auto">
              {Object.entries(subCategories).map(([subCategory, columns]) => (
                <React.Fragment key={subCategory}>
                  <DropdownMenuLabel>
                    {getTranslation(
                      `fields.${category}Fields.groups.${subCategory}.title`,
                      subCategory
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
                      {getFieldTranslation(category, subCategory, column.id)}
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
