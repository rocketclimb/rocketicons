import { PropsWithLang } from "@/types";
import { MdxPartial } from "@/components/mdx";

import ColorsAnimation from "./colors-animation";

import { shuffle, colors, variations } from "./utils";
import { getIconsData } from "../../icons/get-icons-data";
import { CollectionID } from "rocketicons/data";

const Colors = async ({ lang }: PropsWithLang) => {
  const icon = "RcRocketIcon";
  const collection: CollectionID = "rc";

  const icons = await getIconsData(collection);

  const Icon = icons[icon];

  type ColorViewerProps = {
    color: string;
  };
  const ColorViewer = ({ color }: ColorViewerProps) => (
    <div>
      <h5 className="text-sm capitalize font-semibold text-slate-900 dark:text-slate-200">
        {color}
      </h5>
      <div className="grid grid-cols-6 gap-x-14 gap-y-5 mt-3 mb-12 justify-between">
        <ColorBox name={color} tone="neutral" />
        {variations.map((variation, i) => (
          <ColorBox
            key={i}
            tone={(i > 5 && "dark") || (i < 5 && "light") || "neutral"}
            name={`${color}-${variation}`}
          />
        ))}
      </div>
    </div>
  );

  type ColorBoxProps = {
    name: string;
    tone: "dark" | "neutral" | "light";
  };
  const ColorBox = ({ name, tone }: ColorBoxProps) => (
    <div className="text-center px-1 pt-2  rounded-lg dark:border dark:border-slate-800">
      <div
        data-tone={tone}
        className="border mx-auto size-14 rounded-lg data-[tone=light]:dark:bg-transparent data-[tone=dark]:dark:bg-white/70 data-[tone=light]:bg-slate-700 border-slate-200  dark:border-slate-800/80"
      >
        <Icon className={`icon-${name}-4xl m-2`} />
      </div>
      <span className="text-slate-500 text-xs font-mono lowercase dark:text-slate-400 sm:text-[0.625rem] md:text-xs lg:text-[0.625rem] 2xl:text-xs">
        icon-{name}
      </span>
    </div>
  );

  return (
    <>
      <MdxPartial lang={lang} slug={"cores"} path="docs" />
      <ColorsAnimation
        icon={icon}
        collection={collection}
        colors={shuffle(colors)}
      />
      <ul>
        {colors.map((color, i) => (
          <li key={i}>
            <ColorViewer color={color} />
          </li>
        ))}
      </ul>
    </>
  );
};

export default Colors;
