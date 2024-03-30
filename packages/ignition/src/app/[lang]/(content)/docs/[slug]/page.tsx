import MdxDoc from "@/app/components/mdx/mdx-doc";
import { PropsWithLangSlugParams } from "@/app/types/props-with-lang-slug-params";

const Page = ({ params: { lang, slug } }: PropsWithLangSlugParams) => {
  return (
    <div>
      <MdxDoc lang={lang} slug={slug} />
    </div>
  );
};

export default Page;
