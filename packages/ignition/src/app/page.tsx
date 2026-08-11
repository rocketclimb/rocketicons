"use client";

import Link from "next/link";
import { useEffect } from "react";

import { LOCALE_STORAGE_KEY } from "@/components/locale-preference";
import Logo from "@/components/logo";

const getPreferredLocale = () => {
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === "en" || stored === "pt-br") return stored;
  return window.navigator.languages.some((language) => language.toLowerCase().startsWith("pt"))
    ? "pt-br"
    : "en";
};

const RootPage = () => {
  useEffect(() => {
    window.location.replace(`/${getPreferredLocale()}/`);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-6 text-center">
      <Logo className="h-24 md:h-32" />
      <div>
        <h1 className="text-2xl font-semibold text-primary dark:text-primary-dark">
          Choose your language
        </h1>
        <p className="mt-2 text-primary-light dark:text-primary-dark">
          Escolha seu idioma
        </p>
      </div>
      <nav className="flex gap-4" aria-label="Language">
        <Link className="button-primary px-5 py-3 rounded" href="/en/">
          English
        </Link>
        <Link className="button-primary px-5 py-3 rounded" href="/pt-br/">
          Português
        </Link>
      </nav>
    </main>
  );
};

export default RootPage;
