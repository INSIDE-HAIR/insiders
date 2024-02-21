import { Button, Tab, Tabs } from "@nextui-org/react";
import { useEffect, useState } from "react";
import MarketingSalonCards from "../ui/cards/marketing-salon-cards";

// El tipo de props puede ser más específico según la estructura de tus datos
type MarketingTabCardsListProps = {
  dataMarketingCards: any;
  item: {
    childrensCode: Array<any> | [];
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
export default function MarketingTabCardsList({
  dataMarketingCards,
  item,
  index,
}: MarketingTabCardsListProps) {
  const [groupedByLanguage, setGroupedByLanguage] = useState<any>(null);

  useEffect(() => {
    // Primero agrupamos por idioma
    const byLanguage: { [key: string]: any } = {};
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
  }, [item.childrensCode, dataMarketingCards]);

  const langCodes = {
    "01": "ES",
    "02": "CA",
    ES: "Español",
    CA: "Catalá",
  };

  // Diccionarios para mapear códigos
  const filesCodes = {
    "0000": "Stopper",
    "0080": "Alup80",
    "0050": "Alup50",
    "0004": "A4",
    "0005": "A5",
    "0085": "Tarjeta",
    "0048": "Díptico/Tríptico",
    "0010": "Test",
    "0100": "Revista",
    "0360": "Escaparatismo",
    "0090": "GMB",
    "0216": "Videos",
    "1080": "Post Acción",
    "0108": "Post Mensual",
    "1920": "Story Acción",
    "0192": "Story Mensuel",
    "0002": "Guía",
    "0500": "Filtro de Instagram",
    "6969": "SMS/WhatsApp",
  };

  return (
    <div className="flex w-full flex-col items-center justify-center content-center [&>*]:w-full ">
      <Tabs
        aria-label="Languages"
        className={`max-w-full [&>*]:flex-wrap md:[&>*]:flex-nowrap items-center justify-center content-center reverse`}
      >
        {groupedByLanguage &&
          Object.entries(groupedByLanguage)
            .sort()
            .reverse()
            .map(([language, categories]) => {
              // Filtrar para asegurarnos de que solo renderizamos Tabs con ítems.
              const categoriesWithItems = Object.entries(
                categories as { [key: string]: any }
              ).filter(([_, items]) => items.length > 0);

              console.log("categoriesWithItems", categoriesWithItems);
              console.log("categoriesWithItems", categories);
              console.log("categoriesWithItems", language);

              // No renderizar el Tab si no hay categorías con ítems.
              if (categoriesWithItems.length === 0) {
                return null;
              }

              return (
                <Tab
                  key={language}
                  title={
                    langCodes[language as keyof typeof langCodes] || language
                  }
                >
                  {categoriesWithItems.map(
                    ([categoryCode, items]: [string, any[]]) => (
                      <div
                        key={categoryCode}
                        className="gap-x-6 gap-y-4 flex flex-row flex-wrap items-start justify-center text-center mt-6 first:mt-2"
                      >
                        <h3 className="text-center w-full font-bold text-2xl mb-2 ">
                          {filesCodes[
                            categoryCode as keyof typeof filesCodes
                          ] || categoryCode}
                        </h3>
                        {items.map((item, itemIndex) => (
                          <MarketingSalonCards
                            item={item}
                            key={item.id}
                            renderButtons={renderButtons}
                          />
                        ))}
                      </div>
                    )
                  )}
                </Tab>
              );
            })}
      </Tabs>
    </div>
  );
}

const renderButtons = (item: any) => {
  return (
    <Button
      className={`text-tiny text-white bg-gray-700 m-1`}
      variant="flat"
      key={item.id}
      color="default"
      radius="lg"
      size="sm"
      onClick={() => {
        window.open(item.transformedUrl.download, "_blank");
      }}
    >
      <a download={item.name}>Descargar</a>
    </Button>
  );
};
