import { PropsWithLang } from "@/types";
import { MdxPartial } from "@/components/mdx";

import Wrapper from "@/components/documentation/wrapper";

import Importer from "./importer";
import ElementBlock from "./element-block";

const AddingIcons = async ({ lang }: PropsWithLang) => {
  return (
    <>
      <MdxPartial lang={lang} slug={"adding-icons"} path="docs" />
      <Importer lang={lang} />
      <Wrapper>
        <MdxPartial
          lang={lang}
          slug={"adding-icons/adding-icons-including"}
          path="docs"
        />
        <ElementBlock lang={lang} />
      </Wrapper>
      <Wrapper>
        <MdxPartial
          lang={lang}
          slug={"adding-icons/adding-icons-next"}
          path="docs"
        />
      </Wrapper>
    </>
  );
};

export default AddingIcons;
