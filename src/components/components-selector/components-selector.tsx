import VideosPlayers from "../ui/videos-players/videos-players";
import Slides from "../ui/slides/slides";
import TabsAnimated from "../ui/tabs/tabs-animated";
import Button from "@/src/components/ui/buttons/button";
import MarketingTabCardsList from "../marketing-salon/marketing-tab-cards-list";
import useIsAvailable from "@/src/hooks/useIsAvailable";
import CustomModal from "../customizable/modal/TabsAnimatedChadCN";
import { ComponentsProps } from "@/src/lib/types/components-schemas";
import CustomCarouselModal from "../customizable/images/custom-mondal-carousel";
import CustomImageModal from "../customizable/images/custom-modal-image";

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
        <VideosPlayers
          item={{ ...item }}
          index={index}
          dataMarketingCards={undefined}
        />
      )}
      {item.type === "button" && available && (
        <Button
          item={{ ...item }}
          index={index}
          dataMarketingCards={undefined}
        />
      )}
      {item.type === "slider" && available && (
        <Slides
          item={{ ...item }}
          index={index}
          dataMarketingCards={undefined}
        />
      )}
      {item.type === "tabs" && available && (
        <TabsAnimated
          item={{ ...item }}
          index={index}
          dataMarketingCards={dataMarketingCards}
        />
      )}
      {item.type === "modal" && available && (
        <CustomModal
          item={{ ...item }}
          index={index}
          dataMarketingCards={dataMarketingCards}
        />
      )}

      {item.type === "carousel" && available && (
        <CustomCarouselModal
          item={{ ...item }}
          index={index}
          dataMarketingCards={dataMarketingCards}
        />
      )}

      {item.type === "image" && available && (
        <CustomImageModal
          item={{ ...item }}
          index={index}
          dataMarketingCards={undefined}
        />
      )}

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
