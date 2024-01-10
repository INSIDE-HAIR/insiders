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


    console.log(content);

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
          {marketingSalonContent.monthlyContentPlan.es && (
            <Tab key="monthlyContentPlan" title="Plan Mensual">
              <MonthlyContentPlanMkt
                list={marketingSalonContent.monthlyContentPlan.es}
              />
            </Tab>
          )}
          {(marketingSalonContent.actionPosts.es ||
            marketingSalonContent.actionPosts.ca) && (
            <Tab key="actionPosts" title="Post de Acción">
              <div className="flex w-full flex-col items-center mb-0">
                <Tabs aria-label="Options">
                  <Tab key="es" title="Español">
                    <ActionPostsAndStories
                      list={marketingSalonContent.actionPosts.es}
                      lang={"es"}
                    />
                  </Tab>
                  <Tab key="ca" title="Catalán">
                    <ActionPostsAndStories
                      list={marketingSalonContent.actionPosts.ca}
                      lang={"ca"}
                    />
                  </Tab>
                </Tabs>
              </div>
            </Tab>
          )}
          {(marketingSalonContent.actionStories.es ||
            marketingSalonContent.actionStories.ca) && (
            <Tab key="actionStories" title="Story de Acción">
              <div className="flex w-full flex-col items-center mb-0">
                <Tabs aria-label="Options">
                  <Tab key="es" title="Español">
                    <ActionPostsAndStories
                      list={marketingSalonContent.actionStories.es}
                      lang={"es"}
                      story
                    />
                  </Tab>
                  <Tab key="ca" title="Catalán">
                    <ActionPostsAndStories
                      list={marketingSalonContent.actionStories.ca}
                      lang={"ca"}
                      story
                    />
                  </Tab>
                </Tabs>
              </div>
            </Tab>
          )}
          {marketingSalonContent.valueStories.es && (
            <Tab key="valueStories" title="Stories de Valor">
              <ValueStoriesMkt
                list={marketingSalonContent.valueStories.es}
              />
            </Tab>
          )}
          {(marketingSalonContent.videos.es ||
            marketingSalonContent.videos.ca) && (
            <Tab key="videos" title="Videos">
              <div className="flex w-full flex-col items-center mb-0">
                <Tabs aria-label="Options">
                  <Tab key="es" title="Español">
                    <VideosMkt
                      list={marketingSalonContent.videos.es}
                      lang={"es"}
                    />
                  </Tab>
                  <Tab key="ca" title="Catalán">
                    <VideosMkt
                      list={marketingSalonContent.videos.ca}
                      lang={"ca"}
                    />
                  </Tab>
                </Tabs>
              </div>
            </Tab>
          )}
          {marketingSalonContent.smsAndWhatsApp.es && (
            <Tab key="smsAndWhatsApp" title="SMS & WhatsApp">
              <div className="flex w-full flex-col items-center mb-0">
                <SmsAndWhatsAppMkt
                  list={marketingSalonContent.smsAndWhatsApp.es}
                />
              </div>
            </Tab>
          )}
          {(!marketingSalonContent.monthlyContentPlan.es ||
            !marketingSalonContent.actionPosts.es ||
            !marketingSalonContent.actionPosts.ca ||
            !marketingSalonContent.actionStories.es ||
            !marketingSalonContent.actionStories.ca ||
            !marketingSalonContent.actionPosts.es ||
            !marketingSalonContent.actionPosts.ca ||
            !marketingSalonContent.valueStories.es ||
            !marketingSalonContent.videos.es ||
            !marketingSalonContent.videos.ca ||
            !marketingSalonContent.smsAndWhatsApp.es) && (
            <Tab key="comingSoon" title="Muy Pronto" className="cursor-default" />
          )}
        </Tabs>
      </div>
    </div>
  );
}

export default DigitalcalContentTabsMkt;
