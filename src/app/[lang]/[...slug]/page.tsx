"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

interface PageData {
  title: string;
  content: string;
}

export default function DynamicPage() {
  const params = useParams();
  const t = useTranslations("Common");
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const lang = params.lang as string;
  const slug = Array.isArray(params.slug) ? params.slug.join("/") : params.slug;

  useEffect(() => {
    async function fetchPageData() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/pages?lang=${lang}&slug=${slug}`);
        if (!response.ok) {
          throw new Error("Failed to fetch page data");
        }
        const data = await response.json();
        setPageData(data);
      } catch (error) {
        console.error("Error fetching page data:", error);
        setPageData(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPageData();
  }, [lang, slug]);

  if (isLoading) {
    return <div>{t("loading")}</div>;
  }

  if (!pageData) {
    return <div>{t("pageNotFound")}</div>;
  }

  return (
    <div>
      <h1>{pageData.title}</h1>
      <div>
        {t("currentLanguage")}: {lang}
        <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
      </div>
    </div>
  );
}
