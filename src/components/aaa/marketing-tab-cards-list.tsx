import { Button, Tab, Tabs } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import MarketingSalonCards from "../ui/cards/marketing-salon-cards";
import { filesCodes } from "@/src/db/constants";
import {Toaster, toast} from "sonner"

const langCodes = {
  "01": "ES",
  "02": "CA",
  ES: "Español",
  CA: "Catalá",
};

// El tipo de props puede ser más específico según la estructura de tus datos
type MarketingTabCardsListProps = {
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
export default function MarketingTabCardsList({
  dataMarketingCards,
  item,
  index,
}: MarketingTabCardsListProps) {
  const [groupedByLanguage, setGroupedByLanguage] = useState<any>(null);

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
  }, [item.childrensCode, dataMarketingCards, item]);

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
                            renderButtons={RenderButtons}
                          />
                        ))}
                      </div>
                    )
                  )}
                </Tab>
              );
            })}
      </Tabs>
      <Toaster richColors/>
    </div>
  );
}

const RenderButtons = (item: any) => {
  const copyRef = useRef<HTMLTextAreaElement>(null);

  const handleCopyText = () => {
    // Acceder al valor actual de la referencia y copiar su contenido
    const copyText = copyRef.current?.value;
    if (copyText) {
      navigator.clipboard.writeText(copyText).then(() => {
        toast.success("¡Texto copiado con éxito!");
      }, (err) => {
        console.error('Error al copiar texto: ', err);
        toast.error('Error al copiar texto: ', err);
        // Manejar el error, por ejemplo, mostrando un mensaje al usuario
      });
    }
  };

  return (
    <>
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
      {item.copy && (
        <>
          <Button
            className={`text-tiny text-white bg-gray-700 m-1`}
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
            className="max-w-full  flex border-2 rounded-sm mt-2"
          />
        </>
      )}
    </>
  );
};
