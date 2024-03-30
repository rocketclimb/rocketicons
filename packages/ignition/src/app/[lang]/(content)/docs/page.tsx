import { MdxDoc } from "@/components/mdx";
import { PropsWithLangSlugParams } from "@/app/types/props-with-lang-slug-params";

const Page = ({ params: { lang } }: PropsWithLangSlugParams) => {
  return (
    <div>
      <MdxDoc lang={lang} slug={"getting-started"} />
    </div>
  );
};

export default Page;
