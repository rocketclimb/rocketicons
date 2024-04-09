import { PropsWithLang } from "@/app/types";
import { CollectionID } from "rocketicons/data";
import { MdxPartial } from "@/components/mdx";
import { getIconsData } from "@/components/icons/get-icons-data";
import { Table, TableLine } from "@/components/table";

import Title2 from "@/components/documentation/title2";
import Title3 from "@/components/documentation/title3";

import Code from "@/components/documentation/code";
import Paragraph from "@/components/documentation/paragraph";
import SampleBox from "@/app/components/documentation/sample-box";

import { sizes } from "./utils";
import SizingAnimation from "./sizing-animation";

const Sizing = async ({ lang }: PropsWithLang) => {
  const icon = "RcRocketIcon";
  const collection: CollectionID = "rc";

  const icons = await getIconsData(collection);

  const Icon = icons[icon];
  return (
    <>
      <MdxPartial lang={lang} slug={"dimensionando-elementos"} path="docs" />
      <SizingAnimation collection={collection} icon={icon} />
      <div className="px-5">
        <Table>
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

      <div className="mt-12 px-5">
        <Title2>Basic usage</Title2>
        <Title3>Fixed heights</Title3>
        <Paragraph>
          Use <Code>h-*</Code> and <Code>w-*</Code> to set the
        </Paragraph>

        <SampleBox
          locale={lang}
          icon={icon}
          Icon={Icon}
          options={[
            "w-10 h-10",
            "w-12 h-12",
            "w-14 h-14",
            "w-16 h-16",
            "w-20 h-20",
          ]}
        />
      </div>
    </>
  );
};

export default Sizing;
