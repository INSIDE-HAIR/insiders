import {
  postersCardsES,
  postersCardsCA,
  stoppersCardsES,
  stoppersCardsCA,
  cardsCardsES,
  cardsCardsCA,
  testsCardsES,
  testsCardsCA,
} from "@/lib/helpers/mapperJSON";

import { Card, CardBody, Tab, Tabs } from "@nextui-org/react";
import PostersMkt from "../posters-mkt/PostersMkt";
import StoppersMkt from "../stoppers-mkt/StoppersMkt";
import CardsMkt from "../cards-mkt/CardsMkt";
import TestsMkt from "../tests-mkt/TestMkt";

function PhysicalContentTabsMkt() {
  return (
    <div className="flex w-full flex-col items-center">
      <Tabs aria-label="Options">
        <Tab key="posters" title="Cartelería">
          <div className="flex w-full flex-col items-center mb-0">
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
          <div className="flex w-full flex-col items-center mb-0">
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
          <div className="flex w-full flex-col items-center mb-0">
            <Tabs aria-label="Options">
              <Tab key="es" title="Español">
                <TestsMkt list={testsCardsES} lang={"es"} />
              </Tab>
              <Tab key="ca" title="Catalán">
                <TestsMkt list={testsCardsCA} lang={"ca"} />
              </Tab>
            </Tabs>
          </div>
        </Tab>
        <Tab key="cards" title="Tarjetas">
          <div className="flex w-full flex-col items-center mb-0">
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

export default PhysicalContentTabsMkt;
