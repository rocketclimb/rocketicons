import { PropsWithLang } from "@/types";
import { MdxPartial } from "@/components/mdx";

import { getCurrentIconData } from "@/components/usage/utils";
import { Table, TableLine } from "@/components/table";
import Wrapper from "@/components/documentation/wrapper";

import ColorsAnimation from "./colors-animation";
import {
  shuffle,
  colors,
  colorsTable,
  variations,
  colorsUtilities,
} from "./utils";
import SampleBox from "@/components/documentation/sample-box";

const Colors = async ({
  lang,
  queryIcon,
}: PropsWithLang & { queryIcon?: string }) => {
  const { icon, collection, Icon } = getCurrentIconData(queryIcon);

  type ColorBoxProps = {
    name: string;
    tone: "dark" | "neutral" | "light";
  };
  const ColorBox = ({ name, tone }: ColorBoxProps) => (
    <div
      data-tone={tone}
      className="group/color text-center px-1 py-2 rounded-lg border border-slate-200 dark:border-slate-800/80 data-[tone=light]:dark:bg-transparent data-[tone=dark]:dark:bg-white/70 data-[tone=light]:bg-slate-700"
    >
      <div className="mx-auto size-14">
        <Icon className={`icon-${name}-4xl m-2`} />
      </div>
      <span className="text-slate-500 text-[11px] sm:text-xs font-mono lowercase dark:text-slate-400 group-data-[tone=light]/color:text-slate-400 group-data-[tone=dark]/color:dark:text-slate-500">
        {name}
      </span>
    </div>
  );

  type ColorViewerProps = {
    color: string;
  };
  const ColorViewer = ({ color }: ColorViewerProps) => (
    <div>
      <h5 className="text-sm capitalize font-semibold text-slate-900 dark:text-slate-200">
        {color}
      </h5>
      <div className="grid grid-cols-4 gap-x-2 md:gap-x-8 lg:gap-x-4 lg:grid-cols-6 xl:gap-x-2 xl:grid-cols-12 gap-y-5 mt-3 mb-12 justify-between">
        <ColorBox name={color} tone="neutral" />
        {variations.map((variation, i) => (
          <ColorBox
            key={`${color}-${variation}`}
            tone={(i > 6 && "dark") || (i < 5 && "light") || "neutral"}
            name={`${color}-${variation}`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      <MdxPartial lang={lang} slug={"colors"} path="docs" />
      <ColorsAnimation
        icon={icon}
        collection={collection}
        colors={shuffle(colors)}
      />
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
          <SampleBox
            locale={lang}
            icon={icon}
            Icon={Icon}
            options={colorsUtilities}
          />
        </div>
      </Wrapper>
      <Wrapper>
        <MdxPartial lang={lang} slug={"colors/colors-defaults"} path="docs" />
        <ul className="mt-8">
          {colors.map((color) => (
            <li key={color}>
              <ColorViewer color={color} />
            </li>
          ))}
        </ul>
      </Wrapper>
    </>
  );
};

export default Colors;
