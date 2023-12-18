import { Card, CardFooter } from "@nextui-org/react";
import Image from "next/image";
import React from "react";

function CardsPosters({
  item,
  renderButtons,
}: {
  item: any;
  renderButtons: any;
}) {
  return (
    <Card
      isFooterBlurred
      radius="lg"
      className="border-none gap-2 px-2 py-3 flex items-center justify-center col-span-1 bg-white"
      key={item.name}
    >
      {item.files.A5 && item.files.A5.imgEmbed && (
        <Image
          alt={item.name}
          className="object-cover border-gray-700/20 border-1 shadow-sm w-52"
          height={200}
          src={item.files.A5.imgEmbed}
          width={200}
        />
      )}

      {!item.files.Preview && item.files.Stopper && item.files.Stopper.imgEmbed && (
        <Image
          alt={item.name}
          className="object-cover border-gray-700/20 border-1 shadow-sm w-52"
          height={200}
          src={item.files.Stopper.imgEmbed}
          width={200}
        />
      )}

      {item.files.TARJETAS && item.files.TARJETAS.imgEmbed && (
        <Image
          alt={item.name}
          className="object-cover border-gray-700/20 border-1 shadow-sm w-52"
          height={200}
          src={item.files.TARJETAS.imgEmbed}
          width={200}
        />
      )}

      {item.files.Preview && item.files.Preview.imgEmbed && (
        <Image
          alt={item.name}
          className="object-cover border-gray-700/20 border-1 shadow-sm w-52"
          height={200}
          src={item.files.Preview.imgEmbed}
          width={200}
        />
      )}
      <CardFooter className="flex mx-auto flex-row flex-wrap self-start justify-center before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 before:rounded-xl rounded-large bottom-1 w-52 shadow-small z-10">
        {renderButtons(item)}
      </CardFooter>
    </Card>
  );
}

export default CardsPosters;
