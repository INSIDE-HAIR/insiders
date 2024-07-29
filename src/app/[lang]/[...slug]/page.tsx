// src/app/[lang]/[...slug]/page.tsx
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();

interface Params {
  slug: string | string[];
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
  const { slug } = params;
  const fullPath = Array.isArray(slug) ? slug.join("/") : slug;

  const page = await prisma.dynamicPage.findUnique({
    where: { fullPath },
  });

  if (!page) {
    return {
      title: "Page not found",
    };
  }

  return {
    title: page.title,
  };
}

export default async function DynamicPage({ params }: { params: Params }) {
  const { slug, lang } = params;
  const fullPath = Array.isArray(slug) ? slug.join("/") : slug;

  const page = await prisma.dynamicPage.findUnique({
    where: { fullPath },
  });

  if (!page) {
    notFound();
  }

  return (
    <div>
      <h1>{page.title}</h1>
      <div>
        {lang}
        {/* Aquí se renderizará el contenido del body en el futuro */}
      </div>
    </div>
  );
}
