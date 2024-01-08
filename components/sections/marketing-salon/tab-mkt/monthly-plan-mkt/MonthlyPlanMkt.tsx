// MainComponent.tsx
import CardGroupList from "@/components/cards/cards-group/CardGroupList";
import { Button } from "@nextui-org/react";

function MonthlyPlanMkt({ list }: { list: any[] }) {
  const renderButtons = (item: any) => {
    return Object.keys(item.files).map((fileType: string, index: number) => {
      const file = item.files[fileType];

      return (
        <>
          <Button
            className={`text-tiny text-white bg-gray-700 m-1`}
            variant="flat"
            key={index}
            color="default"
            radius="lg"
            size="sm"
            id={"button" + item.name}
            onClick={() => {
              const textarea = document.getElementById(
                "copy" + item.name
              ) as HTMLTextAreaElement;
              navigator.clipboard.writeText(textarea.value);
            }}
          >
            Copiar Texto
          </Button>
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
            Descargar Imagen
          </Button>

          <textarea
            defaultValue={item.copy}
            disabled
            id={"copy" + item.name}
            rows={30}
            className="max-w-full  flex border-2 rounded-sm mt-2"
          />
        </>
      );
    });
  };

  // Obtén un conjunto único de nombres de grupo
  const groupNames = new Set(list?.map((item) => item.groupName));

  return list ? (
    <div className="w-full">
      <h3 className="text-center w-full font-bold text-2xl mt-4">
        Plan Mensual
      </h3>
      {Array.from(groupNames).map((groupName) => (
        <CardGroupList
          key={groupName}
          title={groupName}
          list={list.filter((item) => item.groupName === groupName)}
          renderButtons={renderButtons}
        />
      ))}
    </div>
  ) : (
    <div>Muy Pronto</div>
  );
}

export default MonthlyPlanMkt;
