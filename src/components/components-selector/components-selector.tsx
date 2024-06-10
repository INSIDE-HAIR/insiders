import VideosPlayers from "../ui/videos-players/videos-players";
import Slides from "../ui/slides/slides";
import TabsAnimated from "../ui/tabs/tabs-animated";
import Button from "@/src/components/ui/buttons/button";
import MarketingTabCardsList from "../marketing-salon/marketing-tab-cards-list";
import useIsAvailable from "@/src/hooks/useIsAvailable";
import CustomModal from "../customizable/modal/custom-modal";

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
      | "modal"
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
  const available = useIsAvailable(
    item.active,
    item.available?.startDateTime ?? "",
    item.available?.endDateTime ?? ""
  );

  return (
    <>
      {item.type === "video" && available && (
        <VideosPlayers item={{ ...item }} index={index} />
      )}
      {item.type === "button" && available && (
        <Button item={{ ...item }} index={index} />
      )}
      {item.type === "slider" && available && (
        <Slides item={{ ...item }} index={index} />
      )}
      {item.type === "tabs" && available && (
        <TabsAnimated
          item={{ ...item }}
          index={index}
          dataMarketingCards={dataMarketingCards}
        />
      )}
      {/* {item.type === "modal" && available && (
        <CustomModal item={{ ...item }} index={index} />
      )} */}

      {item.type === "tabsCardsList" && available && dataMarketingCards && (
        <MarketingTabCardsList
          dataMarketingCards={dataMarketingCards}
          item={{ ...item }}
          index={index}
        />
      )}
    </>
  );
}
