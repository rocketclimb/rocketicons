import { PropsWithLang } from "@/types";
import { MdxPartial } from "@/components/mdx";

import { getCurrentIconData } from "@/components/usage/utils";
import { Table, TableLine } from "@/components/table";
import Wrapper from "@/components/documentation/wrapper";

import ColorsAnimation from "./colors-animation";
import { colors, forAnimation, colorsTable, variations, colorsUtilities } from "./utils";
import SampleBox from "@/components/documentation/sample-box";
import { IconType } from "rocketicons";

type ColorBoxProps = {
  name: string;
  tone: "dark" | "neutral" | "light";
  Icon: IconType;
};
const ColorBox = ({ name, tone, Icon }: ColorBoxProps) => (
  <div
    data-tone={tone}
    className="group/color text-center px-1 py-2 rounded-lg border border-surface-border dark:border-surface-border-dark/60 data-[tone=light]:dark:bg-transparent data-[tone=dark]:dark:bg-white/70 data-[tone=light]:bg-surface-medium"
  >
    <div className="mx-auto size-14">
      <Icon className={`icon-${name}-4xl m-2`} />
    </div>
    <span className="text-primary-light text-[0.55rem] xs:text-[0.65rem] sm:text-[0.67rem] font-mono lowercase dark:text-primary-lighter group-data-[tone=light]/color:text-primary-lighter group-data-[tone=dark]/color:dark:text-primary-light">
      {name}
    </span>
  </div>
);

type ColorViewerProps = {
  color: string;
  Icon: IconType;
};
const ColorViewer = ({ color, Icon }: ColorViewerProps) => (
  <div>
    <h5 className="text-sm capitalize font-semibold text-primary dark:text-primary-dark">
      {color}
    </h5>
    <div className="grid grid-cols-4 gap-x-2 md:gap-x-8 lg:gap-x-4 lg:grid-cols-6 xl:gap-x-2 xl:grid-cols-12 gap-y-5 mt-3 mb-12 justify-between">
      <ColorBox name={color} tone="neutral" Icon={Icon} />
      {variations.map((variation, i) => (
        <ColorBox
          Icon={Icon}
          key={`${color}-${variation}`}
          tone={(i > 6 && "dark") || (i < 5 && "light") || "neutral"}
          name={`${color}-${variation}`}
        />
      ))}
    </div>
  </div>
);

const Colors = async ({ lang, queryIcon }: PropsWithLang & { queryIcon?: string }) => {
  const { icon, collection, Icon } = getCurrentIconData(queryIcon);

  return (
    <>
      <MdxPartial lang={lang} slug={"colors"} path="docs" />
      <ColorsAnimation icon={icon} collection={collection} colors={forAnimation} />
      <div className="md:px-5">
        <Table lang={lang} hasAdditional collapse>
          {colorsTable.map(([utility, color], i) => (
            <TableLine
              key={utility}
              attr={utility}
              value={`color: ${color}`}
              aditional={<Icon className={utility} />}
            />
          ))}
        </Table>
      </div>
      <Wrapper>
        <MdxPartial lang={lang} slug={"colors/colors-utilities"} path="docs" />
        <div className="mt-12">
          <SampleBox locale={lang} icon={icon} Icon={Icon} options={colorsUtilities} />
        </div>
      </Wrapper>
      <Wrapper>
        <MdxPartial lang={lang} slug={"colors/colors-defaults"} path="docs" />
        <ul className="mt-8">
          {colors.map((color) => (
            <li key={color}>
              <ColorViewer color={color} Icon={Icon} />
            </li>
          ))}
        </ul>
      </Wrapper>
    </>
  );
};

export default Colors;
