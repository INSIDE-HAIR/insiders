import useIsAuth from "@/src/hooks/useIsAuth";
import useIsAvailable from "@/src/hooks/useIsAvailable";
import VideosPlayers from "../ui/videos-players/videos-players";
import Slides from "../ui/slides/slides";
import TabsAnimated from "../ui/tabs/tabs-animated";
import Button from "@/src/components/ui/buttons/button";
import MarketingTabCardsList from "../marketing-salon/marketing-tab-cards-list";
import CustomModal from "../customizable/modal/TabsAnimatedChadCN";
import CustomCarouselModal from "../customizable/images/custom-mondal-carousel";
import CustomImageModal from "../customizable/images/custom-modal-image";
import { ComponentsProps } from "@/src/lib/types/components-schemas";

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

  const isAuth = useIsAuth(item.auth ?? []);

  return (
    <>
      {item.type === "video" && available && isAuth && (
        <VideosPlayers
          item={{ ...item }}
          index={index}
          dataMarketingCards={undefined}
        />
      )}
      {item.type === "button" && available && isAuth && (
        <Button
          item={{ ...item }}
          index={index}
          dataMarketingCards={undefined}
        />
      )}
      {item.type === "slider" && available && isAuth && (
        <Slides
          item={{ ...item }}
          index={index}
          dataMarketingCards={undefined}
        />
      )}
      {item.type === "tabs" && available && isAuth && (
        <TabsAnimated
          item={{ ...item }}
          index={index}
          dataMarketingCards={dataMarketingCards}
        />
      )}
      {item.type === "modal" && available && isAuth && (
        <CustomModal
          item={{ ...item }}
          index={index}
          dataMarketingCards={dataMarketingCards}
        />
      )}
      {item.type === "carousel" && available && isAuth && (
        <CustomCarouselModal
          item={{ ...item }}
          index={index}
          dataMarketingCards={dataMarketingCards}
        />
      )}
      {item.type === "image" && available && isAuth && (
        <CustomImageModal
          item={{ ...item }}
          index={index}
          dataMarketingCards={undefined}
        />
      )}
      {item.type === "tabsCardsList" &&
        available &&
        isAuth &&
        dataMarketingCards && (
          <MarketingTabCardsList
            dataMarketingCards={dataMarketingCards}
            item={{ ...item }}
            index={index}
          />
        )}
    </>
  );
}
