import { Languages } from "@/types";
import en from "./en.json";
import ptBr from "./pt-br.json";

export const useLocale = (lang: Languages) => {
  const locales: Record<Languages, any> = {
    en: en,
    "pt-br": ptBr,
  };
  return locales[lang];
};
