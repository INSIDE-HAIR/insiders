import {
  actionPostsCardsCA,
  actionPostsCardsES,
  actionStoriesCardsCA,
  actionStoriesCardsES,
  monthlyContentPlanCardsES,
  smsAndWhatsAppCardsES,
  valueStoriesCardsES,
} from "@/lib/helpers/mapperJSON";

import { Card, CardBody, Tab, Tabs } from "@nextui-org/react";
import ActionPostsAndStories from "../../tab-mkt/action-post-and-stories-mkt/ActionPostsAndStoriesMkt";
import MonthlyContentPlanMkt from "../../tab-mkt/monthly-plan-mkt/MonthlyPlanMkt";
import ValueStoriesMkt from "../../tab-mkt/value-stories-mkt/ValueStoriesMkt";
import SmsAndWhatsAppMkt from "../../tab-mkt/sms-and-whatsapp-mkt/SmsAndWhatsAppMkt";

function DigitalcalContentTabsMkt() {
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
          <Tab key="monthlyContentPlan" title="Plan Mensual">
            <MonthlyContentPlanMkt list={monthlyContentPlanCardsES} />
          </Tab>
          <Tab key="actionPosts" title="Post de Acción">
            <div className="flex w-full flex-col items-center mb-0">
              <Tabs aria-label="Options">
                <Tab key="es" title="Español">
                  <ActionPostsAndStories
                    list={actionPostsCardsES}
                    lang={"es"}
                  />
                </Tab>
                <Tab key="ca" title="Catalán">
                  <ActionPostsAndStories
                    list={actionPostsCardsCA}
                    lang={"ca"}
                  />
                </Tab>
              </Tabs>
            </div>
          </Tab>
          <Tab key="actionStories" title="Story de Acción">
            <div className="flex w-full flex-col items-center mb-0">
              <Tabs aria-label="Options">
                <Tab key="es" title="Español">
                  <ActionPostsAndStories
                    list={actionStoriesCardsES}
                    lang={"es"}
                    story
                  />
                </Tab>
                <Tab key="ca" title="Catalán">
                  <ActionPostsAndStories
                    list={actionStoriesCardsCA}
                    lang={"ca"}
                    story
                  />
                </Tab>
              </Tabs>
            </div>
          </Tab>
          <Tab key="valueStories" title="Stories de Valor">
            <ValueStoriesMkt list={valueStoriesCardsES} />
          </Tab>
          <Tab key="videos" title="Videos">
            <div className="flex w-full flex-col items-center mb-0">
              <Card>
                <CardBody>Muy Pronto</CardBody>
              </Card>
            </div>
          </Tab>
          <Tab key="smsAndWhatsApp" title="SMS & WhatsApp">
            <div className="flex w-full flex-col items-center mb-0">
              <SmsAndWhatsAppMkt list={smsAndWhatsAppCardsES} />
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

export default DigitalcalContentTabsMkt;
