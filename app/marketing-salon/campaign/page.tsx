"use client";
import TailwindGrid from "@/components/grid/TailwindGrid";
import DigitalcalContentTabs from "@/components/sections/marketing-salon/digital-content-tabs-mkt/DigitalcalContentTabsMkt";
import PhysicalContentTabs from "@/components/sections/marketing-salon/physical-content-tabs-mkt/PhysicalContentTabsMkt";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
    if (category === "physicalContent") {
      if (categoryType === "posters") {
        // if (categoryTypeLanguage === "es") {
        //   setList(postersCardsES);
        // } else if (categoryTypeLanguage === "ca") {
        //   setList(postersCardsCA);
        // }
      }
    }

    console.log(tab);
  }, [category, categoryType]);

  return (
    <>
      <TailwindGrid fullSize>
        <div className="col-span-1 col-start-1 col-end-2 h-screen fixed w-2/12  top-0 z-30 border-r box-border border-zinc-500 bg-white-950/40 backdrop-blur-lg bg-clip-padding backdrop-filter opacity-75 hidden lg:block">
          <ul
            aria-label={`Plan de Marketing ${monthTranslations[month] + " "} ${
              year ?? ""
            }`}
            className="w-full h-full z-30 flex items-center justify-center flex-col gap-y-0"
          >
            <strong className="font-extrabold mb-2 ">
              {monthTranslations[month] + " "}
              {year}
            </strong>
            {sideMenu.list.map((items, index) => (
              <li
                key={index + items.id}
                className={`relative cursor-pointer rounded-lg  py-2 mt-1  first:mt-0 flex items-center justify-center mx-auto text-center hover:font-semibold hover:bg-gray-700/30 w-11/12 ${
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
        <div className="relative col-span-full max-w-full  bg-orange-500/0 ">
          <TailwindGrid>
            <main className="self-center col-start-1 lg:col-start-3 col-end-5 md:col-end-9 lg:col-end-13 w-full flex flex-col bg-red-300/0 justify-center items-center">
              <div className="flex-col center gap-4 inline-flex lg:pt-[1.5vw] justify-start items-center min-h-screen">
                <h3 className="text-center w-full font-bold text-4xl ">
                  {sideMenu.list.find((item) => item.id === tab)?.name}
                </h3>
                {sideMenu.list.find((item) => item.id === tab)?.id ===
                  "posters" && <PhysicalContentTabs />}
                {sideMenu.list.find((item) => item.id === tab)?.id ===
                  "socialNetworks" && <DigitalcalContentTabs />}
              </div>
            </main>
          </TailwindGrid>
        </div>
      </TailwindGrid>
    </>
  );
}
