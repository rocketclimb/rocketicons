import { MdxPartial } from "@/components/mdx";
import { PropsWithLang } from "@/types";

const Colors = ({ lang }: PropsWithLang) => {
  return (
    <>
      {/* <MdxPartial lang={lang} slug={"colors-selector"} path="docs" /> */}
      <MdxPartial lang={lang} slug={"colors"} path="docs" />
    </>
  );
};

export default Colors;
