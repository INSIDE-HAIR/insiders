import { Tab, Tabs } from "@nextui-org/react";
import ActionPostsAndStories from "../../tab-mkt/action-post-and-stories-mkt/ActionPostsAndStoriesMkt";
import MonthlyContentPlanMkt from "../../tab-mkt/monthly-plan-mkt/MonthlyPlanMkt";
import ValueStoriesMkt from "../../tab-mkt/value-stories-mkt/ValueStoriesMkt";
import SmsAndWhatsAppMkt from "../../tab-mkt/sms-and-whatsapp-mkt/SmsAndWhatsAppMkt";
import VideosMkt from "../../tab-mkt/videos-mkt/VideosMkt";
import { useEffect, useState } from "react";

function DigitalcalContentTabsMkt({
  marketingSalonContent,
}: {
  marketingSalonContent: any;
}) {
  const [content, setContent] = useState(marketingSalonContent);

  useEffect(() => {
    setContent(marketingSalonContent);

    return () => {};
  }, [content, marketingSalonContent]);

  return (
    <div className="flex w-full flex-col items-center justify-center content-center  [&>*]:w-full ">
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
          {marketingSalonContent.monthlyContentPlanCardsES && (
            <Tab key="monthlyContentPlan" title="Plan Mensual">
              <MonthlyContentPlanMkt
                list={marketingSalonContent.monthlyContentPlanCardsES}
              />
            </Tab>
          )}
          {(marketingSalonContent.actionPostsCardsES ||
            marketingSalonContent.actionPostsCardsCA) && (
            <Tab key="actionPosts" title="Post de Acción">
              <div className="flex w-full flex-col items-center mb-0">
                <Tabs aria-label="Options">
                  <Tab key="es" title="Español">
                    <ActionPostsAndStories
                      list={marketingSalonContent.actionPostsCardsES}
                      lang={"es"}
                    />
                  </Tab>
                  <Tab key="ca" title="Catalán">
                    <ActionPostsAndStories
                      list={marketingSalonContent.actionPostsCardsCA}
                      lang={"ca"}
                    />
                  </Tab>
                </Tabs>
              </div>
            </Tab>
          )}
          {(marketingSalonContent.actionStoriesCardsES ||
            marketingSalonContent.actionStoriesCardsCA) && (
            <Tab key="actionStories" title="Story de Acción">
              <div className="flex w-full flex-col items-center mb-0">
                <Tabs aria-label="Options">
                  <Tab key="es" title="Español">
                    <ActionPostsAndStories
                      list={marketingSalonContent.actionStoriesCardsES}
                      lang={"es"}
                      story
                    />
                  </Tab>
                  <Tab key="ca" title="Catalán">
                    <ActionPostsAndStories
                      list={marketingSalonContent.actionStoriesCardsCA}
                      lang={"ca"}
                      story
                    />
                  </Tab>
                </Tabs>
              </div>
            </Tab>
          )}
          {marketingSalonContent.valueStoriesCardsES && (
            <Tab key="valueStories" title="Stories de Valor">
              <ValueStoriesMkt
                list={marketingSalonContent.valueStoriesCardsES}
              />
            </Tab>
          )}
          {(marketingSalonContent.videosCardsES ||
            marketingSalonContent.videosCardsCA) && (
            <Tab key="videos" title="Videos">
              <div className="flex w-full flex-col items-center mb-0">
                <Tabs aria-label="Options">
                  <Tab key="es" title="Español">
                    <VideosMkt
                      list={marketingSalonContent.videosCardsES}
                      lang={"es"}
                    />
                  </Tab>
                  <Tab key="ca" title="Catalán">
                    <VideosMkt
                      list={marketingSalonContent.videosCardsCA}
                      lang={"ca"}
                    />
                  </Tab>
                </Tabs>
              </div>
            </Tab>
          )}
          {marketingSalonContent.smsAndWhatsAppCardsES && (
            <Tab key="smsAndWhatsApp" title="SMS & WhatsApp">
              <div className="flex w-full flex-col items-center mb-0">
                <SmsAndWhatsAppMkt
                  list={marketingSalonContent.smsAndWhatsAppCardsES}
                />
              </div>
            </Tab>
          )}
          {(!marketingSalonContent.monthlyContentPlanCardsES ||
            !marketingSalonContent.actionPostsCardsES ||
            !marketingSalonContent.actionPostsCardsCA ||
            !marketingSalonContent.actionStoriesCardsES ||
            !marketingSalonContent.actionStoriesCardsCA ||
            !marketingSalonContent.actionPostsCardsES ||
            !marketingSalonContent.actionPostsCardsCA ||
            !marketingSalonContent.valueStoriesCardsES ||
            !marketingSalonContent.videosCardsES ||
            !marketingSalonContent.videosCardsCA ||
            !marketingSalonContent.smsAndWhatsAppCardsES) && (
            <Tab key="comingSoon" title="Muy Pronto" className="cursor-default" />
          )}
        </Tabs>
      </div>
    </div>
  );
}

export default DigitalcalContentTabsMkt;
