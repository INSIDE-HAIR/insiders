import VideoPlayer from "@/components/video-player/VideoPlayer";
import { Button, Tab, Tabs } from "@nextui-org/react";
import { marketingPlanJanuary2024Data } from "@/lib/helpers/mapperMarketingCampaignJSON";

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
        <Button
          variant="faded"
          className="flex bg-gray-700 mb-4 text-white"
          onClick={() => {
            window.open(marketingPlanJanuary2024Data.formButton.url, "_blank");
          }}
        >
          {marketingPlanJanuary2024Data.formButton.active &&
            marketingPlanJanuary2024Data.formButton.title}
        </Button>
        <Tabs
          aria-label="Options"
          className={`max-w-full  [&>*]:flex-wrap md:[&>*]:flex-nowrap `}
        >
          {marketingPlanJanuary2024Data.tabs.map((tab, index) => (
            <Tab
              key={tab.id}
              title={tab.title}
              className="[&>*]:items-center [&>*]:flex-col [&>*]:justify-center [&>*]:content-center [&>*]:flex [&>*]:w-full w-full"
            >
              <div className="flex w-full flex-col items-center self-center  ">
                {tab.type === "video" && (
                  <VideoPlayer title={tab.title} url={tab.url} />
                )}
                {tab.type === "button" && (
                  <Button
                    variant="faded"
                    className="flex bg-gray-700 text-white mt-4"
                    onClick={() => {
                      window.open(tab.url, "_blank");
                    }}
                  >
                    {tab.title}
                  </Button>
                )}
              </div>
            </Tab>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

export default MarketingPlanTabsMkt;
