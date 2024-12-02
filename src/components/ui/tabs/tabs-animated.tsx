import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs/tabs";
import ComponentSelector from "../../components-selector/components-selector";
import { useEffect, useState } from "react";
import { ComponentsProps } from "@/src/types/components-schemas";

export default function TabsAnimatedChadCN({
  item,
  dataMarketingCards,
}: ComponentsProps) {
  const [defaultValue, setDefaultValue] = useState<string | undefined>();

  // Filtrar, ordenar y luego ajustar el `order` de las pestañas
  const activeAndOrderedTabs = item.content
    ?.filter((tab) => tab.active) // Filtra por activas
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) // Ordena por `order`
    .map((tab, index) => ({ ...tab, order: index + 1 })); // Ajusta `order` basándote en el índice

  // Efecto para establecer el tab por defecto una vez que los datos están listos
  useEffect(() => {
    if (activeAndOrderedTabs && activeAndOrderedTabs.length > 0) {
      setDefaultValue(activeAndOrderedTabs[0].id); // Establece el id de la primera pestaña como defaultValue
    }
  }, [activeAndOrderedTabs]); // Se recalcula si activeAndOrderedTabs cambia

  console.log(defaultValue);
  return (
    <div className="flex flex-row items-center justify-center w-full content-center align-middle ">
      {defaultValue && (
        <Tabs
          defaultValue={defaultValue}
          className="self-center w-full flex flex-col  "
        >
          <div className=" flex flex-wrap w-full justify-center">
            <TabsList className="rounded-none flex flex-wrap h-full  bg-transparent text-white border-none [&>[data-state=active]]:bg-primary [&>[data-state=active]]:font-semibold">
              {activeAndOrderedTabs &&
                activeAndOrderedTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="rounded-none bg-zinc-700 text-white border-none"
                  >
                    {tab.title}
                  </TabsTrigger>
                ))}
            </TabsList>
          </div>
          {activeAndOrderedTabs &&
            activeAndOrderedTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="w-full">
                <div className="flex flex-col items-center justify-center w-full mb-4 ">
                  {tab.content &&
                    tab.content.map(
                      (
                        contentItem: typeof item & { index: number },
                        contentIndex: number
                      ) => (
                        <ComponentSelector
                          key={contentItem.id}
                          index={contentIndex}
                          item={
                            {
                              ...contentItem,
                              index: contentIndex,
                            } as typeof item & { index: number }
                          } // Add 'index' property to the item object
                          dataMarketingCards={dataMarketingCards}
                        />
                      )
                    )}
                </div>
              </TabsContent>
            ))}
        </Tabs>
      )}
    </div>
  );
}
