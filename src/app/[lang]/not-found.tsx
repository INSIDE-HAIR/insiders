import { unstable_setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

export default function NotFound({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = useTranslations("NotFound");

  return (
    <div>
      <h2>{t("title")}</h2>
      <p>{t("description")}</p>
    </div>
  );
}

export function generateStaticParams() {
  return ["en", "es"].map((locale) => ({ locale }));
}
