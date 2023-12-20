import VideoPlayer from "@/components/video-player/VideoPlayer";
import { Tab, Tabs } from "@nextui-org/react";

function MarketingPlanTabsMkt() {
  return (
    <div
      className="flex w-full flex-col items-center justify-center content-center  [&>*]:w-full "
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tabs
          aria-label="Options"
          className={`max-w-full  [&>*]:flex-wrap md:[&>*]:flex-nowrap `}
        >
          <Tab
            key="contextAndOpportunities"
            title="Contexto & Oportunidades"
            className="[&>*]:items-center [&>*]:flex-col [&>*]:justify-center [&>*]:content-center [&>*]:flex [&>*]:w-full w-full"
          >
            <div className="flex w-full flex-col items-center self-center  ">
              <VideoPlayer
                title="Contexto & Oportunidades"
                url="https://player.vimeo.com/video/880849604?h=684733f68c&amp;badge=0&amp;autopause=0&amp;quality_selector=1&amp;player_id=0&amp;app_id=58479"
              />
            </div>
          </Tab>
          <Tab
            key="marketingPlan"
            title="Plan de Marketing"
            className="[&>*]:items-center [&>*]:flex-col [&>*]:justify-center [&>*]:content-center [&>*]:flex [&>*]:w-full w-full"
          >
            <div className="flex w-full flex-col items-center self-center  ">
              <VideoPlayer
                title="Plan de Marketing"
                url="https://player.vimeo.com/video/880849685?h=e3d7c0773b&amp;badge=0&amp;autopause=0&amp;quality_selector=1&amp;player_id=0&amp;app_id=58479"
              />
            </div>
          </Tab>
          <Tab
            key="SellingPlan"
            title="Plan de Ventas"
            className="[&>*]:items-center [&>*]:flex-col [&>*]:justify-center [&>*]:content-center [&>*]:flex [&>*]:w-full w-full"
          >
            <div className="flex w-full flex-col items-center self-center  ">
            <VideoPlayer
                title="Plan de Marketing"
                url="https://player.vimeo.com/video/880850715?h=cac4284ef1&amp;badge=0&amp;autopause=0&amp;quality_selector=1&amp;player_id=0&amp;app_id=58479"
              />
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

export default MarketingPlanTabsMkt;
