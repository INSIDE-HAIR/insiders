import { notFound } from "next/navigation";
import { unstable_setRequestLocale, getTranslations } from "next-intl/server";

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

export async function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export default async function LocaleLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  // Validate that the incoming `lang` parameter is valid
  if (!locales.includes(lang)) {
    notFound();
  }

  // Set the locale for this request
  unstable_setRequestLocale(lang);

  // Get translations
  const t = await getTranslations("Common");

  // Get locale messages
  const localeMessages = await getLocaleMessages(lang);

  return (
    <html lang={lang}>
      <body>
        {children}
        <div>
          {t("currentLanguage")}: {lang}
        </div>
      </body>
    </html>
  );
}
