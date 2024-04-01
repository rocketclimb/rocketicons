import { MDXContent } from "@content-collections/mdx/react";
import { useLocale } from "@/app/locales";
import { PropsWithLang } from "@/types";

export const MdxComponent = ({
  lang,
  slug,
}: PropsWithLang & {
  slug: string;
}) => {
  const selectedComponent = useLocale(lang, slug).component();
  return (
    <div>
      {selectedComponent && <MDXContent code={selectedComponent?.body} />}
    </div>
  );
};
