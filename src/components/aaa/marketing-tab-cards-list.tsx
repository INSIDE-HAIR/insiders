import { Button, Tab, Tabs } from "@nextui-org/react";
import { useEffect, useState } from "react";
import MarketingSalonCards from "../ui/cards/marketing-salon-cards";

// El tipo de props puede ser más específico según la estructura de tus datos
type MarketingTabCardsListProps = {
  dataMarketingCards: any;
  item: any;
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

  return (
    <div className="flex w-full flex-col items-center justify-center content-center  [&>*]:w-full ">
      <Tabs
        aria-label="Languages"
        className={`max-w-full [&>*]:flex-wrap md:[&>*]:flex-nowrap items-center justify-center content-center  reverse `}
        defaultSelectedKey={"ES"}
      >
        {groupedByLanguage &&
          Object.entries(groupedByLanguage).map(
            ([language, categories], index: number) => (
              <Tab
                key={language}
                title={language}
                style={{ order: index * -1 }}
              >
                {Object.entries(categories as { [key: string]: any }).map(
                  ([categoryCode, items]: [string, any[]]) => (
                    <div
                      key={categoryCode}
                      className="gap-2 flex flex-row flex-wrap items-start justify-center text-center mt-6 first:mt-2"
                    >
                      <h3 className="text-center w-full font-bold text-2xl mb-2 ">
                        Categoría: {categoryCode}
                      </h3>

                      {/* Aquí puedes renderizar los ítems de la categoría para el idioma actual */}
                      {items.map((item, index) => (
                        <div key={index} style={{ order: item.order }}>
                          {/* Agregar lógica de renderizado basada en el tipo de ítem, como en el ejemplo anterior */}
                          <MarketingSalonCards
                            item={item}
                            key={item.id}
                            renderButtons={renderButtons}
                          ></MarketingSalonCards>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </Tab>
            )
          )}
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
      Descargar
    </Button>
  );
};
