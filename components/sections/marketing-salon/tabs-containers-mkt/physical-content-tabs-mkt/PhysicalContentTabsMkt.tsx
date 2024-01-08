import { Tab, Tabs } from "@nextui-org/react";
import PostersMkt from "../../tab-mkt/posters-mkt/PostersMkt";
import StoppersMkt from "../../tab-mkt/stoppers-mkt/StoppersMkt";
import CardsMkt from "../../tab-mkt/cards-mkt/CardsMkt";
import TestsMkt from "../../tab-mkt/tests-mkt/TestMkt";
import { useEffect, useState } from "react";

function PhysicalContentTabsMkt({
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
          {(marketingSalonContent.postersCardsES ||
            marketingSalonContent.postersCardsCA) && (
            <Tab key="posters" title="Cartelería">
              <div className="flex w-full flex-col items-center mb-0">
                <Tabs aria-label="Options">
                  <Tab key="es" title="Español">
                    <PostersMkt
                      list={marketingSalonContent.postersCardsES}
                      lang={"es"}
                    />
                  </Tab>
                  <Tab key="ca" title="Catalán">
                    <PostersMkt
                      list={marketingSalonContent.postersCardsCA}
                      lang={"ca"}
                    />
                  </Tab>
                </Tabs>
              </div>
            </Tab>
          )}
          {(marketingSalonContent.stoppersCardsES ||
            marketingSalonContent.stoppersCardsCA) && (
            <Tab key="stoppers" title="Stopper">
              <div className="flex w-full flex-col items-center mb-0">
                <Tabs aria-label="Options">
                  <Tab key="es" title="Español">
                    <StoppersMkt
                      list={marketingSalonContent.stoppersCardsES}
                      lang={"es"}
                    />
                  </Tab>
                  <Tab key="ca" title="Catalán">
                    <StoppersMkt
                      list={marketingSalonContent.stoppersCardsCA}
                      lang={"ca"}
                    />
                  </Tab>
                </Tabs>
              </div>
            </Tab>
          )}
          {(marketingSalonContent.testsCardsES ||
            marketingSalonContent.testsCardsCA) && (
            <Tab key="tests" title="Tests">
              <div className="flex w-full flex-col items-center mb-0">
                <Tabs aria-label="Options">
                  <Tab key="es" title="Español">
                    <TestsMkt
                      list={marketingSalonContent.testsCardsES}
                      lang={"es"}
                    />
                  </Tab>
                  <Tab key="ca" title="Catalán">
                    <TestsMkt
                      list={marketingSalonContent.testsCardsCA}
                      lang={"ca"}
                    />
                  </Tab>
                </Tabs>
              </div>
            </Tab>
          )}
          {(marketingSalonContent.cardsCardsES ||
            marketingSalonContent.cardsCardsCA) && (
            <Tab key="cards" title="Tarjetas">
              <div className="flex w-full flex-col items-center mb-0">
                <Tabs aria-label="Options">
                  <Tab key="es" title="Español">
                    <CardsMkt
                      list={marketingSalonContent.cardsCardsES}
                      lang={"es"}
                    />
                  </Tab>
                  <Tab key="ca" title="Catalán">
                    <CardsMkt
                      list={marketingSalonContent.cardsCardsCA}
                      lang={"ca"}
                    />
                  </Tab>
                </Tabs>
              </div>
            </Tab>
          )}
          {(!marketingSalonContent.postersCardsES ||
            !marketingSalonContent.postersCardsCA ||
            !marketingSalonContent.stoppersCardsES ||
            !marketingSalonContent.stoppersCardsCA ||
            !marketingSalonContent.testsCardsES ||
            !marketingSalonContent.testsCardsCA ||
            !marketingSalonContent.cardsCardsES ||
            !marketingSalonContent.cardsCardsCA) && (
            <Tab key="comingSoon" title="Muy Pronto" className="cursor-default" />
          )}
        </Tabs>
      </div>
    </div>
  );
}

export default PhysicalContentTabsMkt;
