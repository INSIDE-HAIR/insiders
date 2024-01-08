"use client";
import TailwindGrid from "@/components/grid/TailwindGrid";
import MarketingPlanTabsMkt from "@/components/sections/marketing-salon/tabs-containers-mkt/marketing-plan-tabs/MarketingPlanTabsMkt";
import DigitalcalContentTabs from "@/components/sections/marketing-salon/tabs-containers-mkt/digital-content-tabs-mkt/DigitalcalContentTabsMkt";
import CampaignFormationTabsMkt from "@/components/sections/marketing-salon/tabs-containers-mkt/campaign-formation-tabs/CampaignFormationTabsMkt";
import PhysicalContentTabs from "@/components/sections/marketing-salon/tabs-containers-mkt/physical-content-tabs-mkt/PhysicalContentTabsMkt";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { marketingPlanFebruary2024Data, marketingPlanJanuary2024Data } from "@/lib/helpers/mapperMarketingCampaignJSON";
import { marketingSalonJanuary2024, marketingSalonFebruary2024 } from "@/lib/helpers/mapperJSON";

const sideMenu = {
  name: "Plan de Enero",
  list: [
    { name: "Plan de Marketing", id: "marketingPlan" },
    { name: "Cartelería", id: "posters" },
    { name: "Redes Sociales", id: "socialNetworks" },
    { name: "Formación de Campaña", id: "campaignFormation" },
  ],
};

export default function MarketingSalon() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") ?? "marketingPlan");
  const [year, setYear] = useState(searchParams.get("year") ?? "2024");
  const [month, setMonth] = useState(searchParams.get("month") ?? "january");
  const [category, setCategory] = useState(searchParams.get("category"));
  const [categoryType, setCategoryType] = useState(searchParams.get("type"));
  // const [categoryTypeLanguage, setCategoryTypeLanguage] = useState(
  //   searchParams.get("language")
  // );
  const [itemlist, setItemList] = useState(false);
  const [marketingPlanContent, setmarketingPlanContent] = useState(marketingPlanJanuary2024Data);
  const [marketingSalonContent, setmarketingSalonContent] = useState(marketingSalonJanuary2024);

  const monthTranslations: { [key: string]: string } = {
    january: "Enero",
    february: "Febrero",
    march: "Marzo",
    april: "Abril",
    may: "Mayo",
    june: "Junio",
    july: "Julio",
    august: "Agosto",
    september: "Septiembre",
    october: "Octubre",
    november: "Noviembre",
    december: "Diciembre",
  };

  useEffect(() => {
    if (month === "january") {
      setmarketingPlanContent(marketingPlanJanuary2024Data)
      setmarketingSalonContent(marketingSalonJanuary2024)
    }
    if (month === "february") {
      setmarketingPlanContent(marketingPlanFebruary2024Data)
      setmarketingSalonContent(marketingSalonFebruary2024)
    }
    console.log(tab);
  }, [category, categoryType, month, tab]);



  return (
    <>
      <TailwindGrid fullSize>
        <div className="col-span-1 col-start-1 col-end-2 h-screen fixed w-2/12  top-0 z-30 border-r box-border border-zinc-500 bg-white-950/40 backdrop-blur-lg bg-clip-padding backdrop-filter opacity-75 hidden lg:block">
          <div className="mt-24 flex p-4">
            <ul
              aria-label={`Plan de Marketing ${
                monthTranslations[month] + " "
              } ${year ?? ""}`}
              className=" z-30 gap-y-0 self-center col-start-1 lg:col-start-3 col-end-5 md:col-end-9 lg:col-end-13 w-full flex flex-col bg-red-300/0 justify-center items-center overflow-hidden border-gray-700/30 border-4 rounded-2xl "
            >
              <strong className="font-bold py-2 bg-gray-900 text-white w-full text-center">
                {monthTranslations[month] + " "}
                {year}
              </strong>
              {sideMenu.list.map((items, index) => (
                <li
                  key={index + items.id}
                  className={`relative cursor-pointer  py-2   first:mt-0 flex items-center justify-center mx-auto text-center hover:font-semibold hover:bg-gray-700/30 w-full ${
                    items.id === tab && "font-semibold bg-gray-700/30  "
                  }}`}
                  onClick={(event: React.MouseEvent<HTMLLIElement>) => {
                    // Solo actualiza el estado si el id del item es diferente al tab actual
                    if (items.id !== tab) {
                      setTab(items.id);
                    }
                  }}
                >
                  {items.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="relative col-span-full max-w-full  mt-10 gap-10">
          <TailwindGrid>
            <ul
              aria-label={`Plan de Marketing ${
                monthTranslations[month] + " "
              } ${year ?? ""}`}
              className="h-full lg:hidden z-30 gap-y-0 self-center col-start-1 lg:col-start-3 col-end-5 md:col-end-9 lg:col-end-13 w-full flex flex-col bg-red-300/0 justify-center items-center overflow-hidden border-gray-700/30 border-4 rounded-2xl "
            >
              <strong className="font-bold py-2 bg-gray-900 text-white w-full text-center">
                {monthTranslations[month] + " "}
                {year}
              </strong>
              {sideMenu.list.map((items, index) => (
                <li
                  key={index + items.id}
                  className={`relative cursor-pointer  py-2   first:mt-0 flex items-center justify-center mx-auto text-center hover:font-semibold hover:bg-gray-700/30 w-full ${
                    items.id === tab && "font-semibold bg-gray-700/30  "
                  }}`}
                  onClick={(event: React.MouseEvent<HTMLLIElement>) => {
                    // Solo actualiza el estado si el id del item es diferente al tab actual
                    if (items.id !== tab) {
                      setTab(items.id);
                    }
                  }}
                >
                  {items.name}
                </li>
              ))}
            </ul>
          </TailwindGrid>

          <TailwindGrid>
            <main className="self-center col-start-1 lg:col-start-3 col-end-5 md:col-end-9 lg:col-end-13 w-full flex flex-col bg-red-300/0 justify-center items-center">
              <div className="flex-col center gap-4 inline-flex lg:pt-[1.5vw] justify-start items-center min-h-screen w-full">
                <h3 className="text-center w-full font-bold text-4xl mt-10">
                  {sideMenu.list.find((item) => item.id === tab)?.name}
                </h3>
                {sideMenu.list.find((item) => item.id === tab)?.id ===
                  "marketingPlan" && <MarketingPlanTabsMkt contentData={marketingPlanContent}/>}
                {sideMenu.list.find((item) => item.id === tab)?.id ===
                  "posters" && <PhysicalContentTabs marketingSalonContent={marketingSalonContent} />}
                {sideMenu.list.find((item) => item.id === tab)?.id ===
                  "socialNetworks" && <DigitalcalContentTabs marketingSalonContent={marketingSalonContent}/>}
                {sideMenu.list.find((item) => item.id === tab)?.id ===
                  "campaignFormation" && <CampaignFormationTabsMkt marketingSalonContent={marketingSalonContent}/>}
              </div>
            </main>
          </TailwindGrid>
        </div>
      </TailwindGrid>
    </>
  );
}
