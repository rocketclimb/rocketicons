import { MDXContent } from "@content-collections/mdx/react";
import { allComponents } from "content-collections";

const MdxComponent = ({ lang, slug }: { lang: string; slug: string }) => {
  const selectedComponent = allComponents.find(
    (model) => model._meta.directory === slug && model.locale === (lang || "en")
  );
  return (
    <div>
      {selectedComponent && <MDXContent code={selectedComponent?.body} />}
    </div>
  );
};

export default MdxComponent;
