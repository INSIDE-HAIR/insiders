import { notFound } from "next/navigation";
import { unstable_setRequestLocale } from "next-intl/server";

// Can be imported from a shared config
const locales = ["en", "es"];

export async function getLocaleMessages(locale: string) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) {
    notFound();
  }
  return {
    messages: (await import(`../../../../public/locales/${locale}/common.json`))
      .default,
  };
}

export default async function handler(req: any) {
  const locale = req.headers["accept-language"]?.split(",")[0] || "en";
  unstable_setRequestLocale(locale);
  const localeMessages = await getLocaleMessages(locale);
  return localeMessages;
}
