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
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 bg-background-dark px-6 text-center text-primary-dark">
      <div className="dark">
        <Logo className="h-24 md:h-32" />
      </div>
      <div>
        <h1 className="font-quicksand text-2xl font-semibold">Choose your language</h1>
        <p className="mt-2 font-inter text-primary-lighter">
          Select a language to explore Rocketicons.
        </p>
      </div>
      <nav className="flex gap-4 font-inter" aria-label="Language">
        <Link
          className="rounded-lg bg-secondary px-5 py-3 font-semibold text-on-secondary shadow-sm hover:bg-secondary-lighter focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-background-dark"
          href="/en/"
        >
          English
        </Link>
        <Link
          className="rounded-lg border border-surface-medium px-5 py-3 font-semibold text-primary-dark hover:border-secondary hover:text-secondary-lighter focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-background-dark"
          href="/pt-br/"
        >
          Portuguese
        </Link>
      </nav>
    </main>
  );
};

export default RootPage;
