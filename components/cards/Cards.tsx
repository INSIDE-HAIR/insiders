import React from "react";
import { Button, Card, CardFooter, Image } from "@nextui-org/react";

export default function CardsPressable({
  list,
  lang,
}: {
  list: Array<any>;
  lang: string;
}) {
  const renderButtons = (item: any) => {
    return Object.keys(item.files).map((fileType: string, index: number) => {
      const file = item.files[fileType];

      return (
        <Button
          className="text-tiny text-white bg-gray-700 m-1"
          variant="flat"
          key={index}
          color="default"
          radius="lg"
          size="sm"
          onClick={() => {
            window.open(file.download, "_blank");
          }}
        >
          {fileType}
        </Button>
      );
    });
  };

  return (
    <div className="w-full">
      <div className="gap-2 flex flex-row flex-wrap items-start justify-center">
        <h3 className="text-center w-full font-bold text-2xl mt-2">
          {lang === "es" ? "Acciones Principales" : "Accions Principals"}
        </h3>

        {list &&
          list
            .filter((item) => Object.keys(item.files).length === 4)
            .map((item: any, index: number) => (
              <CustomCard
                key={index}
                item={item}
                renderButtons={renderButtons}
              />
            ))}
      </div>
      <div className="gap-2 flex flex-row flex-wrap items-start justify-center">
        <h3 className="text-center w-full font-bold text-2xl mt-4">
          {lang === "es" ? "Acciones Secundarias" : "Accions Secundàries"}
        </h3>
        {list &&
          list
            .filter((item) => Object.keys(item.files).length === 2)
            .map((item: any, index: number) => (
              <CustomCard
                key={index}
                item={item}
                renderButtons={renderButtons}
              />
            ))}
      </div>
    </div>
  );
}

const CustomCard = ({
  item,
  renderButtons,
}: {
  item: any;
  renderButtons: any;
}) => {
  return (
    <Card
      isFooterBlurred
      radius="lg"
      className="border-none gap-2 px-2 py-3 flex items-center justify-center col-span-1 bg-white"
      key={item.name}
    >
      <Image
        alt={item.name}
        className="object-cover border-gray-700/20 border-1 shadow-sm w-52"
        height={200}
        src={item.files.A5.imgEmbed}
        width={200}
      />
      <CardFooter className="flex mx-auto flex-row flex-wrap self-start justify-center before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 before:rounded-xl rounded-large bottom-1 w-52 shadow-small z-10">
        {renderButtons(item)}
      </CardFooter>
    </Card>
  );
};
