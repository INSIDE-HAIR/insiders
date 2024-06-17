export type ComponentsProps = {
  index: number;
  dataMarketingCards: any;
  item: {
    childrensCode?: Array<any> | [];
    id?: string;
    order?: number;
    type:
      | "slider"
      | "video"
      | "button"
      | "tabs"
      | "tab"
      | "tabsCardsList"
      | "modal"
      | "carousel"
      | "image"
      | string;
    title?: string;
    description?: string;
    name?: string;
    classType?: string | "default";
    url: string;
    darkModeUrl?: string;
    active: boolean | true;
    content?: Array<any>;
    available?: { startDateTime?: string; endDateTime?: string };
    buttonText?: string;
    footer?: Array<any>;
    childrensType?:
      | "downloadCarouselCards"
      | "copyTextCards"
      | "downloadImageAndCopyTextCards"
      | "downloadImageCards"
      | string;
  };
};
