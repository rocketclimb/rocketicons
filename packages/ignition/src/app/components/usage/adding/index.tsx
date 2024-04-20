import { PropsWithLang } from "@/types";
import { MdxPartial } from "@/components/mdx";

import Wrapper from "@/components/documentation/wrapper";

import Importer from "./importer";
import ElementBlock from "./element-block";

const Adding = async ({ lang }: PropsWithLang) => {
  return (
    <>
      <MdxPartial lang={lang} slug={"adding"} path="docs" />
      <Importer lang={lang} />
      <Wrapper>
        <MdxPartial lang={lang} slug={"adding/adding-including"} path="docs" />
        <ElementBlock lang={lang} />
      </Wrapper>
      <Wrapper>
        <MdxPartial lang={lang} slug={"adding/adding-next"} path="docs" />
      </Wrapper>
    </>
  );
};

export default Adding;
