// MainComponent.tsx
import CardGroupList from "@/components/cards/cards-group/CardGroupList";
import { Button } from "@nextui-org/react";

function CardsMkt({ list, lang }: { list: any[]; lang: string }) {
  const renderButtons = (item: any) => {
    return Object.keys(item.files).map((fileType: string, index: number) => {
      const file = item.files[fileType];

      return (
        <>
          {fileType !== "Preview" && (
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
              {fileType.replace(/_/g, " ")}
            </Button>
          )}
        </>
      );
    });
  };

  return (
    <div className="w-full">
      <CardGroupList
        title={lang === "es" ? "Tarjetas" : "Targetes"}
        list={list.filter((item) => Object.keys(item.files).length >= 0)}
        renderButtons={renderButtons}
      />
    </div>
  );
}

export default CardsMkt;
