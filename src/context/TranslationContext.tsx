// context/TranslationContext.tsx
"use client";

import React, {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useContext,
  useCallback,
} from "react";
import { getCookie, setCookie } from "cookies-next";
import { Translations } from "@/src/lib/types/translations";
import { AnimatePresence, motion } from "framer-motion";

type Locale = "en" | "es";

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type TranslationParams = Record<string, string | number>;

type TranslationFunction = (key: string, params?: TranslationParams) => string;

interface TranslationContextProps {
  locale: Locale;
  messages: Translations;
  changeLocale: (locale: Locale) => Promise<void>;
  getTranslation: (namespace: NestedKeyOf<Translations>) => TranslationFunction;
}

const TranslationContext = createContext<TranslationContextProps | undefined>(
  undefined
);

interface TranslationProviderProps {
  children: ReactNode;
  initialLocale: Locale;
  initialMessages: Translations;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({
  children,
  initialLocale,
  initialMessages,
}) => {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState<Translations>(initialMessages);
  const [loading, setLoading] = useState<boolean>(true);

  const loadMessages = useCallback(async (locale: Locale): Promise<void> => {
    try {
      setLoading(true);
      const messages: Translations = await import(
        `@/public/locales/${locale}/common.json`
      ).then((module) => module.default);
      setMessages(messages);
    } catch (error) {
      console.error(`Error loading messages for locale ${locale}:`, error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedLocale = getCookie("NEXT_LOCALE") as Locale | undefined;
    if (savedLocale && savedLocale !== locale) {
      setLocale(savedLocale);
      void loadMessages(savedLocale);
    } else {
      void loadMessages(locale);
    }
  }, [locale, loadMessages]);

  const changeLocale = useCallback(async (newLocale: Locale): Promise<void> => {
    setLocale(newLocale);
    try {
      const newMessages: Translations = await import(
        `@/public/locales/${newLocale}/common.json`
      ).then((module) => module.default);
      setMessages(newMessages);
      setCookie("NEXT_LOCALE", newLocale, {
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });
    } catch (error) {
      console.error(`Error changing locale to ${newLocale}:`, error);
    }
  }, []);

  const getTranslation = useCallback(
    (namespace: NestedKeyOf<Translations>): TranslationFunction =>
      (key: string, params?: TranslationParams): string => {
        const parts = namespace.split(".");
        let current: any = messages;
        for (const part of parts) {
          if (current[part] === undefined) {
            console.warn(`Missing translation: ${namespace}.${key}`);
            return key;
          }
          current = current[part];
        }
        let translation = current[key] as string;
        if (!translation) {
          console.warn(`Missing translation: ${namespace}.${key}`);
          return key;
        }
        if (params) {
          Object.entries(params).forEach(([paramKey, paramValue]) => {
            translation = translation.replace(
              new RegExp(`{${paramKey}}`, "g"),
              String(paramValue)
            );
          });
        }
        return translation;
      },
    [messages]
  );

  const contextValue: TranslationContextProps = {
    locale,
    messages,
    changeLocale,
    getTranslation,
  };

  return (
    <AnimatePresence>
      {loading ? (
        <motion.div
          key="loader"
          className="h-[100dvh] grid grid-cols-1 align-middle justify-around overflow-hidden max-w-full bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      ) : (
        <TranslationContext.Provider value={contextValue}>
          {children}
        </TranslationContext.Provider>
      )}
    </AnimatePresence>
  );
};

export const useTranslations = (
  namespace: NestedKeyOf<Translations>
): TranslationFunction => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error(
      "useTranslations must be used within a TranslationProvider"
    );
  }
  return context.getTranslation(namespace);
};
