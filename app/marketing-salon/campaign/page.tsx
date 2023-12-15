"use client";
import TailwindGrid from "@/components/grid/TailwindGrid";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CardsPressable from "@/components/cards/Cards";
import { postersCardsES, postersCardsCA } from "@/lib/helpers/postersCards";
import { Tabs, Tab } from "@nextui-org/tabs";
import { Card, CardBody } from "@nextui-org/react";

const sideMenu = {
  name: "Plan de Enero",
  list: [
    { name: "Plan de Marketing", id: "marketingPlan" },
    { name: "Cartelería", id: "signage" },
    { name: "Redes Sociales", id: "socialNetworks" },
    { name: "Contenido SMS y WhatsApp", id: "smsWhatsap" },
    { name: "Formación de Campaña", id: "campaignFormation" },
  ],
};

let tabs = [
  {
    id: "es",
    label: "Español",
    content: postersCardsES,
  },
  {
    id: "ca",
    label: "Catalán",
    content: postersCardsCA,
  },
];

export default function MarketingSalon() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab"));
  const [year, setYear] = useState(searchParams.get("year"));
  const [month, setMonth] = useState(searchParams.get("month"));
  const [category, setCategory] = useState(searchParams.get("category"));
  const [categoryType, setCategoryType] = useState(searchParams.get("type"));
  // const [categoryTypeLanguage, setCategoryTypeLanguage] = useState(
  //   searchParams.get("language")
  // );
  const [list, setList] = useState<any[]>([]);

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
  }, [category, categoryType]);

  return (
    <>
      <TailwindGrid fullSize>
        <div className="col-span-1 col-start-1 col-end-2 h-screen fixed w-2/12  top-0 z-30 border-r box-border border-zinc-500 bg-white-950/40 backdrop-blur-lg bg-clip-padding backdrop-filter opacity-75 hidden lg:block">
          <ul
            aria-label={`Plan de Marketing ${
              month && month?.charAt(0).toUpperCase() + month?.slice(1)
            } ${year ?? ""}`}
            className="w-full h-full z-30 flex items-center   justify-center flex-col gap-y-10"
          >
            <strong className="font-extrabold">
              {month && month?.charAt(0).toUpperCase() + month?.slice(1)}{" "}
              {year ?? ""}
            </strong>
            {sideMenu.list.map((items, index) => (
              <li
                key={index + items.id}
                className="relative cursor-pointer mt-2 first:mt-0 flex items-center justify-start mx-auto text-center"
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
              <div className="flex-col center gap-4 inline-flex lg:pt-[1.5vw] justify-center items-center">
                <h3 className="text-center w-full font-bold text-4xl ">
                  {sideMenu.list.find((item) => item.id === tab)?.name}
                </h3>
                <div className="flex w-full flex-col items-center">
                  <Tabs aria-label="Options">
                    <Tab key="posters" title="Cartelería">
                      <div className="flex w-full flex-col items-center">
                        <Tabs aria-label="Options">
                          <Tab key="es" title="Español">
                            <CardsPressable list={postersCardsES} lang={"es"} />
                          </Tab>
                          <Tab key="ca" title="Catalán">
                            <CardsPressable list={postersCardsCA} lang={"ca"} />
                          </Tab>
                        </Tabs>
                      </div>
                    </Tab>
                    <Tab key="stoppers" title="Stopper">
                      <Card>
                        <CardBody>
                          Ut enim ad minim veniam, quis nostrud exercitation
                          ullamco laboris nisi ut aliquip ex ea commodo
                          consequat. Duis aute irure dolor in reprehenderit in
                          voluptate velit esse cillum dolore eu fugiat nulla
                          pariatur.
                        </CardBody>
                      </Card>
                    </Tab>
                    <Tab key="tests" title="Tests">
                      <Card>
                        <CardBody>
                          Excepteur sint occaecat cupidatat non proident, sunt
                          in culpa qui officia deserunt mollit anim id est
                          laborum.
                        </CardBody>
                      </Card>
                    </Tab>
                    <Tab key="cards" title="Tarjetas">
                      <Card>
                        <CardBody>
                          Excepteur sint occaecat cupidatat non proident, sunt
                          in culpa qui officia deserunt mollit anim id est
                          laborum.
                        </CardBody>
                      </Card>
                    </Tab>
                  </Tabs>
                </div>
              </div>
            </main>
          </TailwindGrid>
        </div>
      </TailwindGrid>
    </>
  );
}
