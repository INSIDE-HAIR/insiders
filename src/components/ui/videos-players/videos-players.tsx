import { ComponentsProps } from "@/src/lib/types/components-schemas";

function VideosPlayers({ item, index }: ComponentsProps) {
  return (
    <>
      <div className='first:mt-0 mb-4 aspect-video  border-2 border-zinc-200 overflow-hidden flex w-screen max-w-3xl relative '>
        <iframe
          width='100%'
          height='100%'
          src={item.url}
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          className='absolute top-0 left-0 w-full h-full'
          title={item.title}
        ></iframe>
      </div>
    </>
  );
}

export default VideosPlayers;
