// MainComponent.tsx
import CardGroupList from "@/components/cards/cards-group/CardGroupList";
import { Button } from "@nextui-org/react";

function MonthlyContentPlanMkt({
  list,
}: {
  list: any[];
}) {
  const renderButtons = (item: any) => {
    return Object.keys(item.files).map((fileType: string, index: number) => {
      const file = item.files[fileType];

      return (
        <Button
          className={`text-tiny text-white bg-gray-700 m-1`}
          variant="flat"
          key={index}
          color="default"
          radius="lg"
          size="sm"
          onClick={() => {
            window.open(file.download, "_blank");
          }}
        >
          Post {fileType.replace(/-/g, " ")}
        </Button>
      );
    });
  };

  return (
    <div className="w-full">
      <CardGroupList
        title={"Plan de Contenido Mensual"}
        list={list}
        renderButtons={renderButtons}
      />
    </div>
  );
}

export default MonthlyContentPlanMkt;
