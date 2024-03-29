import { PropsWithLangSlugParams } from "@/app/types/props-with-lang-slug-params";

const Page = ({ params: { lang, slug } }: PropsWithLangSlugParams) => {
  return (
    <div>
      <p>{lang}</p>
      <p>{slug}</p>
    </div>
  );
};

export default Page;
