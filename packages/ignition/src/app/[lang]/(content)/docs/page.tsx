import Link from "next/link";

import { customMetadata } from "@/components/metadata-custom";
import docs from "@/data-helpers/params/docs.json";
import { withLocale } from "@/locales";
import type { PropsWithLangParams } from "@/types";
import type { Languages } from "@/types";

export const generateMetadata = async ({ params }: PropsWithLangParams) => {
  const { lang: rawLang } = await params;
  const lang = rawLang as Languages;
  const label = withLocale(lang).config("nav").docs;
  return customMetadata(lang, "page", "docs", label);
};

const DocsIndex = async ({ params }: PropsWithLangParams) => {
  const { lang: rawLang } = await params;
  const lang = rawLang as Languages;
  const locale = withLocale(lang);
  const localizedDocs = docs.filter((doc) => doc.lang === lang);
  return (
    <section className="content-area w-full px-5 py-10 md:px-10">
      <h1 className="text-3xl font-semibold text-primary dark:text-primary-dark">
        {locale.config("nav").docs}
      </h1>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {localizedDocs.map(({ slug }) => {
          const doc = locale.doc(slug);
          return (
            <li key={slug}>
              <Link
                className="block h-full rounded-lg border border-surface-border p-5 hover:border-secondary hover:bg-surface dark:hover:bg-surface-medium"
                href={`/${lang}/docs/${slug}/`}
              >
                <h2 className="font-semibold text-primary dark:text-primary-dark">{doc.title}</h2>
                <p className="mt-2 text-sm">{doc.description}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default DocsIndex;
