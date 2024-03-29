import { MDXContent } from "@content-collections/mdx/react";
import { PropsWithLangSlugParams } from "@/app/types/props-with-lang-slug-params";
import { allDocs } from "content-collections";

const Page = ({ params: { lang, slug } }: PropsWithLangSlugParams) => {
  const selectedComponent = allDocs.find(
    (model) => model._meta.directory === slug && model.locale === (lang || "en")
  );
  return (
    <div>
      {/* <p>{lang}</p>
      <p>{slug}</p> */}

      {selectedComponent && <MDXContent code={selectedComponent?.body} />}
    </div>
  );
};

export default Page;
