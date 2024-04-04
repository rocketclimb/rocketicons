import { PropsWithLang } from "@/types";
import { MdxPartial } from "@/components/mdx";

const Colors = ({ lang }: PropsWithLang) => {
  return (
    <>
      <MdxPartial lang={lang} slug={"colors-selector"} path="docs" />
      <MdxPartial lang={lang} slug={"cores"} path="docs" />
    </>
  );
};

export default Colors;
