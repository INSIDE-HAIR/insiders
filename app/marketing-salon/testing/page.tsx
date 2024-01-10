"use client";
import TailwindGrid from "@/components/grid/TailwindGrid";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import dataMonths from "@/db/dates/months.json";
import MarketingPlanTabsMkt from "@/components/sections/marketing-salon/tabs-containers-mkt/marketing-plan-tabs/MarketingPlanTabsMkt";
import PhysicalContentTabsMkt from "@/components/sections/marketing-salon/tabs-containers-mkt/physical-content-tabs-mkt/PhysicalContentTabsMkt";
import DigitalcalContentTabsMkt from "@/components/sections/marketing-salon/tabs-containers-mkt/digital-content-tabs-mkt/DigitalcalContentTabsMkt";
import RepeatsTabsMkt from "@/components/sections/marketing-salon/tabs-containers-mkt/repeats-tabs/RepeatsTabsMkt";
import { Button } from "@nextui-org/react";

interface VideoTab {
  id: string;
  title: string;
  type: string;
  url: string;
}

interface FormButton {
  title: string;
  active: boolean;
  url: string;
}

interface Slides {
  url: string;
  active: boolean;
}

interface MarketingPlan {
  id: string;
  name: string;
  tabs: VideoTab[];
  formButton: FormButton;
  slides: Slides;
}

interface ContentPlan {
  es: any[]; // Reemplaza any con una interfaz más específica si es necesario
  ca: any[]; // Reemplaza any con una interfaz más específica si es necesario
}

interface DigitalContent {
  id: string;
  name: string;
  monthlyContentPlan: ContentPlan;
  actionStories: ContentPlan;
  valueStories: ContentPlan;
  videos: ContentPlan;
  smsAndWhatsApp: ContentPlan;
}

interface PhysicalContent {
  id: string;
  name: string;
  posters: ContentPlan;
  stoppers: ContentPlan;
  tests: ContentPlan;
  cards: ContentPlan;
}

interface Repeats {
  id: string;
  title: string;
  tabs: any[]; // Reemplaza any con una interfaz más específica si es necesario
}

interface MonthlyData {
  marketingPlan?: MarketingPlan;
  digitalContent?: DigitalContent;
  physicalContent?: PhysicalContent;
  repeats?: Repeats;
}

const sideMenu = {
  name: "Plan de Enero",
  list: [
    { name: "Plan de Marketing", id: "marketingPlan" },
    { name: "Cartelería", id: "posters" },
    { name: "Redes Sociales", id: "socialNetworks" },
    { name: "Repeticiones", id: "repeats" },
  ],
};

function Page() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams?.get("tab") ?? "marketingPlan");
  const [data, setData] = useState<MonthlyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [year, setYear] = useState<string>(
    (searchParams?.get("year") as string) ?? new Date().getFullYear().toString()
  );
  const [month, setMonth] = useState<string>(
    (searchParams?.get("month") as string) ?? "january"
  );

  const monthTranslations = dataMonths.months.find((item) => item.id === month);

  useEffect(() => {
    async function fetchData(year: string, month: string) {
      setLoading(true);
      try {
        const response = await fetch(`/api/data/${year}/${month}`);
        if (!response.ok) {
          throw new Error(`Data fetch failed: ${response.status}`);
        }
        const newData = await response.json();
        console.log(newData);

        setData(newData);
      } catch (err) {
        // Ahora TypeScript está de acuerdo con esta asignación
        setError(err instanceof Error ? err : new Error("An error occurred"));
      } finally {
        setLoading(false);
      }
    }

    fetchData(year, month);
  }, [year, month]);

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  // Renderizado condicional basado en los datos
  return data ? (
    <>
      <TailwindGrid fullSize>
        <div className="col-span-1 col-start-1 col-end-2 h-screen fixed w-2/12  top-0 z-30 border-r box-border border-zinc-500 bg-white-950/40 backdrop-blur-lg bg-clip-padding backdrop-filter opacity-75 hidden lg:block">
          <div className="mt-24 flex p-4">
            <ul
              aria-label={`Plan de Marketing ${monthTranslations?.name + " "} ${
                year ?? ""
              }`}
              className=" z-30 gap-y-0 self-center col-start-1 lg:col-start-3 col-end-5 md:col-end-9 lg:col-end-13 w-full flex flex-col bg-red-300/0 justify-center items-center overflow-hidden border-gray-700/30 border-4 rounded-2xl "
            >
              <strong className="font-bold py-2 bg-gray-900 text-white w-full text-center">
                {monthTranslations?.name + " "}
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
              aria-label={`Plan de Marketing ${monthTranslations?.name + " "} ${
                year ?? ""
              }`}
              className="h-full lg:hidden z-30 gap-y-0 self-center col-start-1 lg:col-start-3 col-end-5 md:col-end-9 lg:col-end-13 w-full flex flex-col bg-red-300/0 justify-center items-center overflow-hidden border-gray-700/30 border-4 rounded-2xl "
            >
              <strong className="font-bold py-2 bg-gray-900 text-white w-full text-center">
                {monthTranslations?.name + " "}
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
                {data.marketingPlan &&
                  sideMenu.list.find((item) => item.id === tab)?.id ===
                    "marketingPlan" && (
                    <MarketingPlanTabsMkt contentData={data.marketingPlan} />
                  )}
                {data.physicalContent &&
                  sideMenu.list.find((item) => item.id === tab)?.id ===
                    "posters" && (
                    <PhysicalContentTabsMkt
                      marketingSalonContent={data.physicalContent}
                    />
                  )}
                {data.digitalContent &&
                  sideMenu.list.find((item) => item.id === tab)?.id ===
                    "socialNetworks" && (
                    <DigitalcalContentTabsMkt
                      marketingSalonContent={data.digitalContent}
                    />
                  )}
                {data &&
                  sideMenu.list.find((item) => item.id === tab)?.id ===
                    "repeats" && (
                    <RepeatsTabsMkt marketingSalonContent={data.repeats} />
                  )}
              </div>
            </main>
          </TailwindGrid>
        </div>
      </TailwindGrid>
    </>
  ) : (
    <>
      {loading && (
        <div className="h-screen w-screen flex items-center justify-center"></div>
      )}
    </>
  );
}

export default Page;
