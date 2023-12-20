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
import ActionPostsAndStories from "../action-post-and-stories-mkt/ActionPostsAndStoriesMkt";
import MonthlyContentPlanMkt from "../monthly-plan-mkt/MonthlyPlanMkt";
import { useEffect } from "react";
import ValueStoriesMkt from "../value-stories-mkt/ValueStoriesMkt";
import SmsAndWhatsAppMkt from "../sms-and-whatsapp-mkt/SmsAndWhatsAppMkt";

function DigitalcalContentTabsMkt() {
  useEffect(() => {
    window.addEventListener("DOMContentLoaded", (event) => {
      const tabContainer = document.getElementById("tabContainer");
      if (tabContainer && tabContainer.firstChild) {
        (tabContainer.firstChild as HTMLElement).classList.add("flex-wrap");
      }
    });

    return () => {};
  }, []);

  return (
    <div className="flex  flex-col items-center max-w-full mb-4">
      <Tabs
        aria-label="Options"
        id="tabContainer"
        className={`max-w-full  [&>*]:flex-wrap md:[&>*]:flex-nowrap `}
      >
        <Tab key="monthlyContentPlan" title="Plan Mensual">
          <MonthlyContentPlanMkt list={monthlyContentPlanCardsES} />
        </Tab>
        <Tab key="actionPosts" title="Post de Acción">
          <div className="flex w-full flex-col items-center mb-0">
            <Tabs aria-label="Options">
              <Tab key="es" title="Español">
                <ActionPostsAndStories list={actionPostsCardsES} lang={"es"} />
              </Tab>
              <Tab key="ca" title="Catalán">
                <ActionPostsAndStories list={actionPostsCardsCA} lang={"ca"} />
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
  );
}

export default DigitalcalContentTabsMkt;
