// En la página TrainingIBMPage
import { useTranslations } from "next-intl";
import { createMetadataGenerator } from "@/src/lib/utils/generateMetadata";

export const generateMetadata = createMetadataGenerator({
  namespace: "Metadata",
  titleKey: "trainingIBMTitle",
  descriptionKey: "trainingIBMDescription",
});

export default function TrainingIBMPage() {
  const t = useTranslations("TrainingIBMPage");

  return (
    <div>
      <h1>{t("title")}</h1>
      <h2>{t("subtitle")}</h2>
      <p>{t("description")}</p>
      <button>{t("button")}</button>
    </div>
  );
}
