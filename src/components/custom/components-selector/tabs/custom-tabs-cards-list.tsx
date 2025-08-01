import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import React, { useEffect, useRef, useState } from "react";
import CustomCards from "../cards/custom-cards";
import { filesCodes } from "@/db/constants";
import { Toaster, toast } from "sonner";
import { Button } from "@nextui-org/react";

const langCodes = {
  "01": "ES",
  "02": "CA",
  ES: "Español",
  CA: "Catalá",
};

// El tipo de props puede ser más específico según la estructura de tus datos
type CustomTabCardsListProps = {
  dataMarketingCards: any;
  item: {
    childrensCode?: Array<any> | [];
    id?: string;
    order?: number;
    type:
      | "slider"
      | "video"
      | "button"
      | "tabs"
      | "tab"
      | "tabsCardsList"
      | string;
    title?: string;
    name?: string;
    classType?: string | "default";
    url: string;
    active: boolean | true;
    content?: Array<any>;
    available?: { startDateTime?: string; endDateTime?: string };
    childrensType?:
      | "downloadCarouselCards"
      | "copyTextCards"
      | "downloadImageAndCopyTextCards"
      | "downloadImageCards"
      | string;
  };
  index: number | string;
};

export default function CustomTabsCardsList({
  dataMarketingCards,
  item,
  index,
}: CustomTabCardsListProps) {
  const [groupedByLanguage, setGroupedByLanguage] = useState<any>(null);
  const [defaultValue, setDefaultValue] = useState<string | undefined>();

  useEffect(() => {
    const byLanguage: { [key: string]: any } = {};

    if (!item.childrensCode) {
      item.childrensCode = [];
    }

    item.childrensCode.forEach((code: string | number) => {
      Object.entries(dataMarketingCards[code] || {}).forEach(
        ([language, items]) => {
          if (!byLanguage[language]) {
            byLanguage[language] = {};
          }
          byLanguage[language][code] = items;
        }
      );
    });

    setGroupedByLanguage(byLanguage);
    console.log("byLanguage", byLanguage);
  }, [item.childrensCode, dataMarketingCards, item]);

  useEffect(() => {
    if (groupedByLanguage) {
      // Establecer ES como valor por defecto si existe, sino tomar el primer idioma
      const defaultLang = groupedByLanguage["ES"]
        ? "ES"
        : Object.keys(groupedByLanguage)[0];
      setDefaultValue(defaultLang);
    }
  }, [groupedByLanguage]);

  const languageEntries = groupedByLanguage
    ? Object.entries(groupedByLanguage)
    : [];

  return (
    <div className="flex w-full flex-col items-center justify-center content-center *:w-full ">
      {languageEntries.length === 1
        ? languageEntries.map(([language, categories]) =>
            Object.entries(categories as { [key: string]: any }).map(
              ([categoryCode, items]: [string, any[]]) => {
                const groupedByTitle = groupByGroupTitle(items);
                return (
                  <div
                    key={categoryCode}
                    className="gap-x-6 gap-y-4 flex flex-col flex-wrap items-center justify-center text-center mt-6 first:mt-0 "
                  >
                    {item.title !== null && (
                      <h3 className="text-center w-full font-bold text-2xl -mb-3">
                        {item.title ||
                          filesCodes[categoryCode as keyof typeof filesCodes] ||
                          categoryCode}
                      </h3>
                    )}
                    {groupedByTitle.map(([groupTitle, groupItems]) => (
                      <div
                        key={groupTitle}
                        style={{
                          order:
                            parseInt(groupTitle.split("-")[0]) === 0
                              ? groupTitle.split(" ")[1]
                              : groupTitle.split("-")[0],
                        }}
                      >
                        {groupTitle !== "Sin Grupo de Familia" && (
                          <h4 className="text-center w-full font-bold text-xl  mt-6 first:mt-0 ">
                            {groupTitle.split("-")[1].replace(/_/g, "")}
                          </h4>
                        )}
                        <div className="gap-x-6 gap-y-4 flex flex-row flex-wrap items-start justify-center text-center mt-6 first:mt-2 w-full ">
                          {groupItems.map((groupItem) => (
                            <CustomCards
                              item={groupItem}
                              key={groupItem.id}
                              renderButtons={RenderButtons}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }
            )
          )
        : defaultValue && (
            <Tabs
              defaultValue={defaultValue}
              className="max-w-full *:flex-wrap md:*:flex-nowrap items-center justify-center content-center reverse "
            >
              <TabsList className=" *:data-[state=active]:bg-inside *:data-[state=active]:font-semibold rounded-none flex flex-wrap h-full  bg-transparent  text-white border-none">
                {languageEntries
                  .sort(([a], [b]) => {
                    if (a === "ES") return -1;
                    if (b === "ES") return 1;
                    return a.localeCompare(b);
                  })
                  .map(([language]) => (
                    <TabsTrigger
                      key={language}
                      value={language}
                      className="rounded-none bg-zinc-700 text-white border-none"
                    >
                      {langCodes[language as keyof typeof langCodes] ||
                        language}
                    </TabsTrigger>
                  ))}
              </TabsList>
              {languageEntries.map(([language, categories]) =>
                Object.entries(categories as { [key: string]: any }).map(
                  ([categoryCode, items]: [string, any[]]) => {
                    const groupedByTitle = groupByGroupTitle(items);
                    return (
                      <TabsContent
                        key={categoryCode}
                        value={language}
                        className="w-full "
                      >
                        <div className="gap-x-6 gap-y-4 flex flex-col flex-wrap items-center justify-center text-center mt-6 first:mt-0   ">
                          {item.title !== null && (
                            <h3 className="text-center w-full font-bold text-2xl -mb-3">
                              {filesCodes[
                                categoryCode as keyof typeof filesCodes
                              ] || categoryCode}
                            </h3>
                          )}
                          {groupedByTitle.map(([groupTitle, groupItems]) => (
                            <div
                              key={groupTitle}
                              style={{
                                order:
                                  parseInt(groupTitle.split("-")[0]) === 0
                                    ? groupTitle.split(" ")[1]
                                    : groupTitle.split("-")[0],
                              }}
                            >
                              {groupTitle !== "Sin Grupo de Familia" && (
                                <h4 className="text-center w-full font-bold text-xl  mt-6 first:mt-0 ">
                                  {groupTitle.split("-")[1].replace(/_/g, "")}
                                </h4>
                              )}
                              <div className="gap-x-6 gap-y-4 flex flex-row flex-wrap items-start justify-center text-center mt-6 first:mt-2 w-full ">
                                {groupItems.map((groupItem) => (
                                  <CustomCards
                                    item={groupItem}
                                    key={groupItem.id}
                                    renderButtons={RenderButtons}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    );
                  }
                )
              )}
            </Tabs>
          )}
      <Toaster richColors />
    </div>
  );
}

const RenderButtons = (item: any) => {
  const copyRef = useRef<HTMLTextAreaElement>(null);

  const handleCopyText = () => {
    // Acceder al valor actual de la referencia y copiar su contenido
    const copyText = copyRef.current?.value;
    if (copyText) {
      navigator.clipboard.writeText(copyText).then(
        () => {
          toast.success("¡Texto copiado con éxito!");
        },
        (err) => {
          console.error("Error al copiar texto: ", err);
          toast.error("Error al copiar texto: ", err);
          // Manejar el error, por ejemplo, mostrando un mensaje al usuario
        }
      );
    }
  };

  return (
    <>
      {item.buttons && item.buttons.length > 0 ? (
        <>
          {item.buttons.map((button: any, index: number) => (
            <Button
              className={`text-tiny text-zinc-900 font-bold bg-inside m-1`}
              variant="flat"
              color="default"
              radius="none"
              size="sm"
              key={index}
              onClick={() => {
                window.open(button.url, "_blank");
              }}
            >
              {button.title}
            </Button>
          ))}
        </>
      ) : (
        <Button
          className={`text-tiny text-zinc-900 font-bold bg-inside m-1`}
          variant="flat"
          key={item.id}
          color="default"
          radius="none"
          size="sm"
          onClick={() => {
            window.open(item.transformedUrl.download, "_blank");
          }}
        >
          <a download={item.title}>Descargar {item.buttonTitle} </a>
        </Button>
      )}

      {item.copy && (
        <>
          <Button
            className={`text-tiny text-inside bg-zinc-900 m-1 rounded-none`}
            variant="flat"
            color="default"
            radius="lg"
            size="sm"
            id={"button" + item.name}
            onClick={handleCopyText}
          >
            Copiar Texto
          </Button>
          <textarea
            ref={copyRef}
            defaultValue={item.copy}
            disabled
            id={"copy" + item.name}
            rows={30}
            className="max-w-full flex border-2 rounded-sm mt-2 bg-zinc-900 text-zinc-50 p-2"
          />
        </>
      )}
    </>
  );
};

// Esta función ayuda a agrupar los ítems por su groupTitle
const groupByGroupTitle = (items: any[]) => {
  const groups: { [key: string]: any[] } = {}; // Add type annotation to the groups object
  items.forEach((item) => {
    const title =
      item.groupOrder + "-" + item.groupTitle || "Sin Grupo de Familia";
    if (!groups[title]) {
      groups[title] = [];
    }
    groups[title].push(item);
  });

  console.log("groups", groups);
  return Object.entries(groups);
};
