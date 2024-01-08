import { Tab, Tabs } from "@nextui-org/react";
import { useEffect, useState } from "react";

function CampaignFormationTabsMkt({
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
    <div className="flex w-full flex-col items-center mb-0">
      <Tabs
        aria-label="Options"
        className={`max-w-full  [&>*]:flex-wrap md:[&>*]:flex-nowrap `}
      >
        <Tab key="comingSoon" title="Muy Pronto" className="cursor-default" />
      </Tabs>
    </div>
  );
}

export default CampaignFormationTabsMkt;
