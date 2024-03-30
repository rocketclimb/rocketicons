import { MdxDoc } from "@/components/mdx";
import { PropsWithLangSlugParams } from "@/app/types/props-with-lang-and-slug-param";

const Page = ({ params: { lang } }: PropsWithLangSlugParams) => {
  return (
    <div>
      <MdxDoc lang={lang} slug={"docs-home"} />
    </div>
  );
};

export default Page;
