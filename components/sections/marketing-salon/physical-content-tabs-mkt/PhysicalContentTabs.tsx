import {
  postersCardsES,
  postersCardsCA,
  stoppersCardsES,
  stoppersCardsCA,
  cardsCardsES,
  cardsCardsCA,
} from "@/lib/helpers/postersCards";

import { Card, CardBody, Tab, Tabs } from "@nextui-org/react";
import React from "react";
import PostersMkt from "../posters-mkt/PostersMkt";
import StoppersMkt from "../stoppers-mkt/StoppersMkt";
import CardsMkt from "../cards-mkt/CardsMkt";

function PhysicalContentTabs() {
  return (
    <div className="flex w-full flex-col items-center">
      <Tabs aria-label="Options">
        <Tab key="posters" title="Cartelería">
          <div className="flex w-full flex-col items-center">
            <Tabs aria-label="Options">
              <Tab key="es" title="Español">
                <PostersMkt list={postersCardsES} lang={"es"} />
              </Tab>
              <Tab key="ca" title="Catalán">
                <PostersMkt list={postersCardsCA} lang={"ca"} />
              </Tab>
            </Tabs>
          </div>
        </Tab>
        <Tab key="stoppers" title="Stopper">
          <div className="flex w-full flex-col items-center">
            <Tabs aria-label="Options">
              <Tab key="es" title="Español">
                <StoppersMkt list={stoppersCardsES} lang={"es"} />
              </Tab>
              <Tab key="ca" title="Catalán">
                <StoppersMkt list={stoppersCardsCA} lang={"ca"} />
              </Tab>
            </Tabs>
          </div>
        </Tab>
        <Tab key="tests" title="Tests">
          <Card>
            <CardBody>Muy Pronto</CardBody>
          </Card>
        </Tab>
        <Tab key="cards" title="Tarjetas">
          <div className="flex w-full flex-col items-center">
            <Tabs aria-label="Options">
              <Tab key="es" title="Español">
                <CardsMkt list={cardsCardsES} lang={"es"} />
              </Tab>
              <Tab key="ca" title="Catalán">
                <CardsMkt list={cardsCardsCA} lang={"ca"} />
              </Tab>
            </Tabs>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

export default PhysicalContentTabs;
