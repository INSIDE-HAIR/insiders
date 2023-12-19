// MainComponent.tsx
import CardGroupList from "@/components/cards/cards-group/CardGroupList";
import { Button } from "@nextui-org/react";

function ActionPostsAndStories({
  list,
  lang,
  story = false,
}: {
  list: any[];
  lang: string;
  story?: boolean;
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
          {fileType}
        </Button>
      );
    });
  };

  return (
    <div className="w-full">
      <CardGroupList
        title={story ? (lang === "es" ? "Stories de Acción" : "Stories d’Acció") : (lang === "es" ? "Posts de Acción" : "Posts d’Acció")}
        list={list}
        renderButtons={renderButtons}
      />
    </div>
  );
}

export default ActionPostsAndStories;
