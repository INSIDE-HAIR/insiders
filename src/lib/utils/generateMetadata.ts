// src/lib/utils/generateMetadata.ts
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type MetadataConfig = {
  namespace: string;
  titleKey: string;
  descriptionKey: string;
};

export function createMetadataGenerator(config: MetadataConfig) {
  return async function generateMetadata({
    params,
  }: {
    params: { locale: string };
  }): Promise<Metadata> {
    const { locale } = params;
    const { namespace, titleKey, descriptionKey } = config;
    const t = await getTranslations({ locale, namespace });

    return {
      title: t(titleKey),
      description: t(descriptionKey),
    };
  };
}
