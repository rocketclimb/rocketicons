import { PropsWithLang } from "@/app/types";
import { MdxPartial } from "@/components/mdx";
import { Table, TableLine } from "@/components/table";

import Wrapper from "@/components/documentation/wrapper";
import SampleBox from "@/components/documentation/sample-box";
import { getCurrentIconData } from "@/components/usage/utils";

import { sizes, sizesUtilities, hwUtilities } from "./utils";
import SizingAnimation from "./sizing-animation";

const Sizing = async ({
  lang,
  queryIcon,
}: PropsWithLang & { queryIcon?: string }) => {
  const { icon, collection, Icon } = await getCurrentIconData(queryIcon);
  return (
    <>
      <MdxPartial lang={lang} slug={"sizing-elements"} path="docs" />
      <SizingAnimation collection={collection} icon={icon} />
      <div className="md:px-5">
        <Table lang={lang}>
          {Object.entries(sizes).map(([attr, value], i) => (
            <TableLine
              key={i}
              attr={`icon-${attr}`}
              value={value.tw}
              props={value.props}
            />
          ))}
        </Table>
      </div>
      <Wrapper>
        <MdxPartial
          lang={lang}
          slug={"sizing-elements/sizing-utilities"}
          path="docs"
        />
        <div className="mt-12 mb-8">
          <SampleBox
            locale={lang}
            icon={icon}
            Icon={Icon}
            options={Object.keys(sizes).map((key) => `icon-${key}`)}
          />
        </div>
        <MdxPartial
          lang={lang}
          slug={"sizing-elements/sizing-customizing"}
          path="docs"
        />
      </Wrapper>
      <Wrapper>
        <MdxPartial
          lang={lang}
          slug={"sizing-elements/sizing-tw-sizes"}
          path="docs"
        />
        <div className="mt-12">
          <SampleBox
            locale={lang}
            icon={icon}
            Icon={Icon}
            options={sizesUtilities}
          />
        </div>
      </Wrapper>
      <Wrapper>
        <MdxPartial
          lang={lang}
          slug={"sizing-elements/sizing-tw-hw"}
          path="docs"
        />
        <div className="mt-12">
          <SampleBox
            locale={lang}
            icon={icon}
            Icon={Icon}
            options={hwUtilities}
          />
        </div>
      </Wrapper>
    </>
  );
};

export default Sizing;
