import { MDXContent } from "@content-collections/mdx/react";
import { PropsWithLang } from "@/types";
import { useLocale } from "@/app/locales";

export const MdxDoc = ({ lang, slug }: PropsWithLang & { slug: string }) => {
  const selectedDoc = useLocale(lang, slug).doc();

  return (
    <div className="flex flex-row">
      <div className="flex-grow">
        {selectedDoc && <MDXContent code={selectedDoc?.body} />}
      </div>
      {/* <nav className="order-last hidden w-56 shrink-0 lg:block">
        right panel (insert TOC here)
      </nav> */}
    </div>
  );
};
