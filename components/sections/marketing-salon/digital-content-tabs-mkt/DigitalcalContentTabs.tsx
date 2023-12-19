import {
  actionPostsCardsCA,
  actionPostsCardsES,
  actionStoriesCardsCA,
  actionStoriesCardsES,
} from "@/lib/helpers/postersCards";

import { Card, CardBody, Tab, Tabs } from "@nextui-org/react";
import ActionPostsAndStories from "../action-post-and-stories/ActionPostsAndStories";


function DigitalcalContentTabs() {
  return (
    <div className="flex w-full flex-col items-center">
      <Tabs aria-label="Options">
        <Tab key="actionPosts" title="Post de Acción">
          <div className="flex w-full flex-col items-center">
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
          <div className="flex w-full flex-col items-center">
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
        <Tab key="valueStories" title="Tests">
          <Card>
            <CardBody>Muy Pronto</CardBody>
          </Card>
        </Tab>
        <Tab key="videos" title="Videos">
          <div className="flex w-full flex-col items-center">
            <Card>
              <CardBody>Muy Pronto</CardBody>
            </Card>
          </div>
        </Tab>
        <Tab key="smsAndWhatsapp" title="SMS & WhatsApp">
          <div className="flex w-full flex-col items-center">
            <Card>
              <CardBody>Muy Pronto</CardBody>
            </Card>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

export default DigitalcalContentTabs;
