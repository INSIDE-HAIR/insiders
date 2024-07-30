import { notFound } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import prisma from "@/prisma/database";

interface Params {
  slug: string[];
  lang: string;
}

export async function generateStaticParams() {
  const pages = await prisma.dynamicPage.findMany();
  return pages.map((page) => ({
    lang: page.lang,
    slug: page.fullPath.split("/"),
  }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug, lang } = params;
  const fullPath = slug.join("/");

  const page = await prisma.dynamicPage.findFirst({
    where: {
      AND: [{ fullPath: fullPath }, { lang: lang }],
    },
  });

  if (!page) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: page.title,
  };
}

export default async function DynamicPage({ params }: { params: Params }) {
  const { slug, lang } = params;

  // Set the locale for this request
  unstable_setRequestLocale(lang);

  const t = await getTranslations("Common");

  const fullPath = slug.join("/");

  const page = await prisma.dynamicPage.findFirst({
    where: {
      AND: [{ fullPath: fullPath }, { lang: lang }],
    },
  });

  if (!page) {
    notFound();
  }

  return (
    <div>
      <h1>{page.title}</h1>
      <div>
        {t("currentLanguage")}: {lang}
        <pre>{JSON.stringify(JSON.parse(page.content as string), null, 2)}</pre>
      </div>
    </div>
  );
}
