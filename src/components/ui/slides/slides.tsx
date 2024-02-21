type ComponentsProps = {
  index: number;
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
      | string;
    title?: string;
    name?: string;
    classType?: string | "default";
    url: string;
    active: boolean | true;
    content?: Array<any>;
    available?: { startDateTime?: string; endDateTime?: string };
    childrensType?:
      | "downloadCarouselCards"
      | "copyTextCards"
      | "downloadImageAndCopyTextCards"
      | "downloadImageCards"
      | string;
  };
};

export default function Slides({ index, item }: ComponentsProps) {
  return (
    item.active && (
      <iframe
        src={item.url}
        className="border-5 rounded-2xl border-black overflow-hidden max-w-full bg-zinc-300 "
        width="750"
        height="460"
        style={{ order: item.order || index }}
        allowFullScreen={true}
      ></iframe>
    )
  );
}
