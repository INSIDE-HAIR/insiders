"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import summerSyle2024Data from "@/db/insiders/services-data/marketing-salon/summer-style-2024.json";
import { Be_Vietnam_Pro } from "next/font/google";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

type DailyTip = {
  header: string;
  desciption: string;
  footer: string;
};

type Client = {
  images: {
    [language: string]: {
      odd: string;
      even: string;
    };
  };
  languages: string[];
  bgColors: string[];
  textColors: string[];
};

type SummerStyleObject = {
  clients: {
    [key: string]: Client;
  };
  content: {
    [month: string]: {
      [lang: string]: {
        [day: string]: DailyTip;
      };
    };
  };
};

// Type assertion for the imported JSON
const summerSyle2024DataTyped: SummerStyleObject =
  summerSyle2024Data as unknown as SummerStyleObject;

export default function DynamicJulyPage() {
  const [currentContent, setCurrentContent] = useState<DailyTip | null>(null);
  const [bgColor, setBgColor] = useState<string>("");
  const [textColor, setTextColor] = useState<string>("");
  const [client, setClient] = useState<string>("insiders");
  const [lang, setLang] = useState<string>("es");
  const [day, setDay] = useState<string>("1");
  const [month, setMonth] = useState<string>("July");

  useEffect(() => {
    const clientData = summerSyle2024DataTyped.clients[client];
    if (!clientData) {
      console.warn(`No client data found for client ${client}.`);
      return;
    }

    const monthContent = summerSyle2024DataTyped.content[month];
    if (!monthContent) {
      console.warn(`No content found for month ${month}.`);
      return;
    }

    const dailyContent = monthContent[lang];
    if (!dailyContent) {
      console.warn(`No content found for language ${lang}.`);
      return;
    }

    if (dailyContent[day]) {
      setCurrentContent(dailyContent[day]);
      setBgColor(clientData.bgColors[(parseInt(day) - 1) % clientData.bgColors.length] || '#000000');
      setTextColor(clientData.textColors[(parseInt(day) - 1) % clientData.textColors.length] || '#ffffff');
    } else {
      console.warn(
        `No content found for day ${day} for client ${client} in language ${lang}.`
      );
      setCurrentContent(null);
    }
  }, [client, lang, day, month]);

  if (!currentContent) {
    return (
      <div className="bg-green-500 min-h-screen flex items-center justify-center p-4 w-screen">
        <p className="text-black">No content available for today.</p>
      </div>
    );
  }

  const isEvenDay = parseInt(day) % 2 === 0;

  const clientData = summerSyle2024DataTyped.clients[client];
  const clientImages = clientData?.images?.[lang];

  const isCaSelected = lang === "ca";

  return (
    <div
      style={{
        fontFamily: beVietnamPro.style.fontFamily,
        backgroundColor: bgColor,
        color: textColor,
      }}
      className="min-h-screen flex flex-col items-center justify-center p-4 w-screen"
    >
      <div className="flex flex-row gap-4 items-center mb-6">
        <div className="flex flex-col">
          <label className="text-black mb-2">Selecciona el Cliente:</label>
          <select
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="mb-4 p-2 rounded text-black"
            disabled={isCaSelected}
          >
            {Object.keys(summerSyle2024DataTyped.clients).map((client) => (
              <option className="text-black" key={client} value={client}>
                {client}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-black mb-2">Selecciona el Mes:</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="mb-4 p-2 rounded text-black"
          >
            {Object.keys(summerSyle2024DataTyped.content).map((m) => (
              <option className="text-black" key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-black mb-2">Selecciona el Día:</label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="mb-4 p-2 rounded text-black"
          >
            {[...Array(31).keys()].map((d) => (
              <option className="text-black" key={d + 1} value={d + 1}>
                {d + 1}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-black mb-2">Selecciona el Idioma:</label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="mb-4 p-2 rounded text-black"
          >
            {clientData?.languages?.map((language) => (
              <option className="text-black" key={language} value={language}>
                {language === "es" ? "Español" : "Catalán"}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center p-6 uppercase">
        <div className="w-full flex justify-center mb-4 md:mb-0 max-w-(--breakpoint-sm)">
          {clientImages && (
            <Image
              src={isEvenDay ? clientImages.even : clientImages.odd}
              alt="Client Image"
              width={600}
              height={600}
              className="rounded w-full h-full object-cover md:max-w-full aspect-square max-w-[720px]"
            />
          )}
        </div>
        <div className="w-full max-w-200 text-center">
          <h1 className="text-3xl font-bold mb-4" style={{ color: textColor }}>
            {currentContent.header}
          </h1>
          <p className="mb-4 text-xl px-10" style={{ color: textColor }}>
            {currentContent.desciption}
          </p>
          {currentContent.footer && (
            <p style={{ color: textColor }}>{currentContent.footer}</p>
          )}
        </div>
      </div>
    </div>
  );
}
