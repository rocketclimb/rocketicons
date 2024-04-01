import { MdxDoc } from "@/components/mdx";
import { PropsWithLangSlugParams } from "@/app/types/props-with-lang-and-slug-param";

const Page = ({ params: { lang, slug } }: PropsWithLangSlugParams) => {
  return (
    <div>
      <MdxDoc lang={lang} slug={slug} />
    </div>
  );
};

export default Page;
