import { MDXContent } from "@content-collections/mdx/react";
import { allDocs } from "content-collections";

export const MdxDoc = ({ lang, slug }: { lang: string; slug: string }) => {
  const selectedDoc = allDocs.find(
    (model) => model.slug === slug && model.locale === (lang || "en")
  );
  return (
    <div className="flex flex-row">
      <div className="flex-grow">
        {selectedDoc && <MDXContent code={selectedDoc?.body} />}
      </div>
      <nav className="order-last hidden w-56 shrink-0 lg:block">
        right panel (insert TOC here)
      </nav>
    </div>
  );
};
