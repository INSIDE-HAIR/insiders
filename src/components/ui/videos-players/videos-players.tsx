import { ComponentsProps } from "@/src/lib/types/components-schemas";

function VideosPlayers({ item, index }: ComponentsProps) {
  return (
    <div className="firt:mt-0 mb-4 mx-2 md:mx-14 lg:mx-32 aspect-video rounded-3xl overflow-hidden flex w-full  max-w-3xl">
      <iframe
        className="aspect-video"
        width="100%"
        height="100%"
        src={item.url}
        title={item.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export default VideosPlayers;
