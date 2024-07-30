// translations.ts
import enCommon from "../../../public/locales/en/common.json";
import esCommon from "../../..//public/locales/es/common.json";
import { Translations } from "../types/translations";

export const translations: { [key in "en" | "es"]: Translations } = {
  en: enCommon,
  es: esCommon,
};
