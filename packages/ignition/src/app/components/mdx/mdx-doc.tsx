import { MDXContent } from "@content-collections/mdx/react";
import { allDocs } from "content-collections";

export const MdxDoc = ({ lang, slug }: { lang: string; slug: string }) => {
  const selectedDoc = allDocs.find(
    (model) => model.slug === slug && model.locale === (lang || "en")
  );
  return <div>{selectedDoc && <MDXContent code={selectedDoc?.body} />}</div>;
};
