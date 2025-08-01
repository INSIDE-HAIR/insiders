import useIsAuth from "@/src/hooks/useIsAuth";
import useIsAvailable from "@/src/hooks/useIsAvailable";
import CustomVideosPlayer from "@/src/components/shared/components-selector/videos-players/custom-video-player";
import CustomSlides from "@/src/components/shared/components-selector/sliders/slides";
import CustomTabs from "@/src/components/shared/components-selector/tabs/custom-tabs";
import CustomButton from "@/src/components/shared/components-selector/buttons/custom-button";
import CustomTabsCardsList from "@/src/components/shared/components-selector/tabs/custom-tabs-cards-list";
import CustomCarouselModal from "@/src/components/shared/components-selector/modal/custom-modal-carousel";
import CustomImageModal from "@/src/components/shared/components-selector/modal/custom-modal-image";
import CustomModal from "@/src/components/shared/components-selector/modal/custom-modal";
import { ComponentsProps } from "@/src/types/components-schemas";

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
        <CustomVideosPlayer
          item={{ ...item }}
          index={index}
          dataMarketingCards={undefined}
        />
      )}
      {item.type === "button" && available && isAuth && (
        <CustomButton
          item={{ ...item }}
          index={index}
          dataMarketingCards={undefined}
        />
      )}
      {item.type === "slider" && available && isAuth && (
        <CustomSlides
          item={{ ...item }}
          index={index}
          dataMarketingCards={undefined}
        />
      )}
      {item.type === "tabs" && available && isAuth && (
        <CustomTabs
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
          <CustomTabsCardsList
            dataMarketingCards={dataMarketingCards}
            item={{ ...item }}
            index={index}
          />
        )}
    </>
  );
}
