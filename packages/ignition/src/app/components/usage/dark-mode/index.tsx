import { PropsWithLang } from "@/types";
import { MdxPartial } from "@/components/mdx";
import { getCurrentIconData } from "@/components/usage/utils";
import GridContainer from "@/components/documentation/grid-container";
import { withLocale } from "@/locales";

import CodeSample from "@/components/code-block/code-sample";
import Wrapper from "@/components/documentation/wrapper";
import SampleBox from "@/components/documentation/sample-box";

const DarkMode = ({ lang, queryIcon }: PropsWithLang & { queryIcon?: string }) => {
  const locale = withLocale(lang);
  const { icon, Icon } = getCurrentIconData(queryIcon);

  const { "dark-mode": darModeLabel, "light-mode": ligthModeLabel } = locale.config(
    "dark-mode",
    "light-mode"
  );
  return (
    <>
      <MdxPartial lang={lang} slug={"dark-mode"} path="docs" />
      <div></div>
      <div className="mx-auto mt-12 w-full max-w-xl lg:max-w-2xl">
        <GridContainer>
          <div className="flex gap-5 p-8">
            <div className="text-slate-700 bg-white rounded-lg px-6 py-8 ring-1 ring-slate-900/5 shadow-xl w-1/2">
              <p>{ligthModeLabel}</p>
              <Icon className="icon-sky-900-6xl" />
            </div>
            <div className="text-slate-400 bg-slate-800 rounded-lg px-6 py-8 ring-1 ring-slate-900/5 shadow-xl w-1/2">
              <p>{darModeLabel}</p>
              <Icon className="icon-6xl" />
            </div>
          </div>
        </GridContainer>
        <CodeSample>
          <div className="text-slate-400 bg-slate-800 ... shadow-xl">
            <p>{`{modeLabel}`}</p>
            <div data-cb-tag={icon} className="icon-sky-900-6xl dark:icon-sky-500-6xl" />
          </div>
        </CodeSample>
      </div>
      <Wrapper>
        <MdxPartial lang={lang} slug={"dark-mode/dark-mode-action"} path="docs" />
        <div className="mt-6">
          <SampleBox
            locale={lang}
            icon={icon}
            Icon={Icon}
            options={[
              "icon-4xl dark:icon-7xl",
              "icon-yellow size-12 dark:icon-red-600 dark:size-14",
              "icon-7xl dark:rounded-xl dark:border dark:border-slate-900 dark:bg-white"
            ]}
          />
        </div>
      </Wrapper>
      <Wrapper>
        <MdxPartial lang={lang} slug={"dark-mode/dark-mode-refer"} path="docs" />
      </Wrapper>
    </>
  );
};

export default DarkMode;
