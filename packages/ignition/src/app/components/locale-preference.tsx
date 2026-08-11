"use client";

import { useEffect } from "react";

import type { Languages } from "@/types";

export const LOCALE_STORAGE_KEY = "rocketicons-locale";

const LocalePreference = ({ lang }: { lang: Languages }) => {
  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
};

export default LocalePreference;
