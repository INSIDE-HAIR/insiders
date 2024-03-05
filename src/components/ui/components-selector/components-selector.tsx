import { Button } from "@nextui-org/react";
import VideosPlayers from "../videos-players/videos-players";
import Slides from "../slides/slides";
import TabsAnimated from "../tabs/tabs-animated";
import MarketingTabCardsList from "../../aaa/marketing-tab-cards-list";
import { array } from "zod";

type ComponentsProps = {
  index: number;
  dataMarketingCards?: any;
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
};

export default function ComponentsSelector({
  index,
  item,
  dataMarketingCards,
}: ComponentsProps) {
  console.log(dataMarketingCards);

  return (
    <>
      {item.type === "video" && item.active === true && (
        <VideosPlayers item={{ ...item }} index={index} />
      )}
      {item.type === "button" && item.active === true && (
        <Button
          variant="faded"
          className="flex bg-gray-700 text-white"
          style={{ order: item.order || index }}
          onClick={() => {
            window.open(item && item.url, "_blank");
          }}
        >
          {item && item.title}
        </Button>
      )}
      {item.type === "slider" && item.active === true && (
        <Slides item={{ ...item }} index={index}></Slides>
      )}
      {item.type === "tabs" && item.active === true && (
        <TabsAnimated
          item={{ ...item }}
          index={index}
          dataMarketingCards={dataMarketingCards}
        />
      )}

      {item.type === "tabsCardsList" && item.active === true && dataMarketingCards && (
        <MarketingTabCardsList
          dataMarketingCards={dataMarketingCards}
          item={{ ...item }}
          index={index}
        />
      )}
      
    </>
  );
}
