"use client";
import TailwindGrid from "@/components/grid/TailwindGrid";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import CardsPressable from "@/components/cards/Cards";
import { postersCardsES, postersCardsCA } from '@/lib/helpers/postersCards';

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



export default function MarketingSalon() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab"));
  const [year, setYear] = useState(searchParams.get("year"));
  const [month, setMonth] = useState(searchParams.get("month"));

  console.log(postersCardsES)
  return (
    <>
      <TailwindGrid fullSize>
        <div className="col-span-1 col-start-1 col-end-2 h-screen fixed w-2/12  top-0 z-30 border-r box-border border-zinc-500 bg-white-950/40 backdrop-blur-lg bg-clip-padding backdrop-filter opacity-75 hidden lg:block">
          <ul  aria-label={`Plan de Marketing ${month && month?.charAt(0).toUpperCase() + month?.slice(1)} ${year ?? ''}`} className="w-full h-full z-30 flex items-center   justify-center flex-col gap-y-10">
            <strong className="font-extrabold">
              {month && month?.charAt(0).toUpperCase() + month?.slice(1)} {year ?? ''}
              </strong>
            {sideMenu.list.map((items, index) => (
              <li
                key={index + items.id}
                className="relative cursor-pointer mt-2 first:mt-0 flex items-center justify-start mx-auto text-center"
                onClick={(event: React.MouseEvent<HTMLLIElement>) =>
                  setTab(items.id)
                }
              >
                {items.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative col-span-full max-w-full  bg-orange-500/50 ">
          <TailwindGrid>
            <main className="self-center col-start-1 lg:col-start-3 col-end-5 md:col-end-9 lg:col-end-13 w-full flex flex-col bg-red-300">
              <div className="flex-col justify-start items-start gap-4 inline-flex lg:pt-[1.5vw]">
                <h3 className="text-center w-full font-bold text-4xl">
                  {sideMenu.list.find((item) => item.id === tab)?.name}
                </h3>
                <CardsPressable/>
              </div>
            </main>
          </TailwindGrid>
        </div>
      </TailwindGrid>
    </>
  );
}
