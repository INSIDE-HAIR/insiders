"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import summerSyle2024Data from "@/db/insiders/services-data/marketing-salon/summer-style-2024.json";
import { useParams } from "next/navigation";
import { Be_Vietnam_Pro } from "next/font/google";
import moment from "moment-timezone";
import CountdownTimer from "@/src/components/timer/CountdownTimer";

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
      odd: {
        vertical: string;
        horizontal: string;
      };
      even: {
        vertical: string;
        horizontal: string;
      };
    };
  };
  languages: string[];
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
  colors: string[];
};

// Type assertion for the imported JSON
const summerSyle2024DataTyped: SummerStyleObject =
  summerSyle2024Data as unknown as SummerStyleObject;

export default function DynamicJulyPage() {
  const [currentContent, setCurrentContent] = useState<DailyTip | null>(null);
  const [bgColor, setBgColor] = useState<string>("");
  const { client, language } = useParams<{
    client: string;
    language: string;
  }>();

  // Get the current date using moment-timezone
  const currentDate = moment().tz("Europe/Madrid"); // Zona horaria de Madrid
  const month = currentDate.format("MMMM");
  const day = currentDate.format("D");

  useEffect(() => {
    if (client) {
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

      const dailyContent = monthContent[language];
      if (!dailyContent) {
        console.warn(`No content found for language ${language}.`);
        return;
      }

      if (dailyContent[day]) {
        setCurrentContent(dailyContent[day]);
        setBgColor(summerSyle2024DataTyped.colors[(parseInt(day) - 1) % 4]);
      } else {
        console.warn(
          `No content found for day ${day} for client ${client} in language ${language}.`
        );
        setCurrentContent(null);
      }
    }
  }, [client, language, day, month]);

  const getNextMidnight = () => {
    const nextMidnight = moment()
      .tz("Europe/Madrid")
      .add(1, "days")
      .startOf("day");
    return nextMidnight.format();
  };

  const firstContentDate = moment("2024-07-01T00:00:00+02:00").format(); // Hora de Madrid

  const getRandomColor = () => {
    const colors = summerSyle2024DataTyped.colors;
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (!currentContent) {
    const targetDate = currentDate.isBefore(firstContentDate)
      ? firstContentDate
      : getNextMidnight();

    const clientData = summerSyle2024DataTyped.clients[client];
    const clientImages = clientData.images[language];
    const isEvenDay = parseInt(day) % 2 === 0;

    const message = currentDate.isBefore(firstContentDate)
      ? "Pronto comenzaremos la campaña."
      : "Campaña finalizada.";

    return (
      <div
        style={{
          fontFamily: beVietnamPro.style.fontFamily,
          backgroundColor: getRandomColor(),
        }}
        className="min-h-screen flex flex-col items-center justify-center p-4 w-screen"
      >
        <div className="w-full flex justify-center mb-4 md:mb-0">
          <div className="md:hidden">
            <Image
              src={
                isEvenDay
                  ? clientImages.even.vertical
                  : clientImages.odd.vertical
              }
              alt="Client Image Vertical"
              width={300}
              height={600}
              className="rounded w-full h-full object-cover max-w-96 md:max-w-full"
            />
          </div>
          <div className="hidden md:block">
            <Image
              src={
                isEvenDay
                  ? clientImages.even.horizontal
                  : clientImages.odd.horizontal
              }
              alt="Client Image Horizontal"
              width={600}
              height={300}
              className="rounded w-full h-full object-cover max-w-96 md:max-w-full"
            />
          </div>
        </div>
        <p className="text-white mt-6 text-2xl">{message}</p>
        <div className="text-white mt-6">
          <CountdownTimer targetDate={targetDate} />
        </div>
      </div>
    );
  }

  const isEvenDay = parseInt(day) % 2 === 0;
  const clientData = summerSyle2024DataTyped.clients[client];
  const clientImages = clientData.images[language];

  return (
    <div
      style={{
        fontFamily: beVietnamPro.style.fontFamily,
        backgroundColor: bgColor,
      }}
      className="min-h-screen flex flex-col items-center justify-center p-4 w-screen"
    >
      <div className="flex flex-col md:flex-row items-center p-6 uppercase">
        <div className="w-full flex justify-center mb-4 md:mb-0">
          <div className="md:hidden">
            <Image
              src={
                isEvenDay
                  ? clientImages.even.vertical
                  : clientImages.odd.vertical
              }
              alt="Holiday Image Vertical"
              width={300}
              height={600}
              className="rounded w-full h-full object-cover max-w-96 md:max-w-full"
            />
          </div>
          <div className="hidden md:block">
            <Image
              src={
                isEvenDay
                  ? clientImages.even.horizontal
                  : clientImages.odd.horizontal
              }
              alt="Holiday Image Horizontal"
              width={600}
              height={300}
              className="rounded w-full h-full object-cover max-w-96 md:max-w-full"
            />
          </div>
        </div>
        <div className="w-full max-w-[50rem] text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            {currentContent.header}
          </h1>
          <p className="text-white mb-4 text-xl px-10">
            {currentContent.desciption}
          </p>
          {currentContent.footer && (
            <p className="text-white">{currentContent.footer}</p>
          )}
        </div>
      </div>
      <div className="text-white mt-6">
        <CountdownTimer
          targetDate={getNextMidnight()}
          header="No te pierdas el siguiente consejo:"
        />
      </div>
    </div>
  );
}
