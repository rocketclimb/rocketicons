import { PropsWithLang } from "@/types";
import { MdxPartial } from "@/components/mdx";

import { getCurrentIconData } from "@/components/usage/utils";
import GridContainer from "@/components/documentation/grid-container";
import UpdateAlert from "@/components/documentation/update-alert";
import { RocketIconsTextDefault } from "@/components/rocketicons-text";
import { TbCheckbox, TbUserQuestion, TbUserStar, TbUser } from "rocketicons/tb";

import CodeSample from "@/components/code-block/code-sample";
import StylingAnimation from "./styling-animation";

const StateManagement = async ({
  lang,
  queryIcon,
}: PropsWithLang & { queryIcon?: string }) => {
  const { icon, collection, Icon } = await getCurrentIconData(queryIcon);
  return (
    <>
      <MdxPartial lang={lang} slug={"styling"} path="docs" />
      <StylingAnimation icon={icon} collection={collection} />
      <GridContainer>
        <div className="mx-auto flex justify-center gap-6 my-8">
          <Icon className="size-16 md:size-20 lg:size-32 border border-slate-600" />
          <Icon className="size-16 md:size-20 lg:size-32 rounded border border-slate-600" />
          <Icon className="size-16 md:size-20 lg:size-32 rounded-md border border-slate-600" />
          <Icon className="size-16 md:size-20 lg:size-32 rounded-lg border border-slate-600" />
        </div>
      </GridContainer>
      <CodeSample>
        <div>
          <div data-tag={icon} className="border border-slate-600 ..." />
          <div
            data-tag={icon}
            className="rounded border border-slate-600 ..."
          />
          <div
            data-tag={icon}
            className="rounded-md border border-slate-600 ..."
          />
          <div
            data-tag={icon}
            className="rounded-lg border border-slate-600 ..."
          />
        </div>
      </CodeSample>
      <GridContainer>
        <div className="mx-auto flex justify-center gap-6 my-8">
          <Icon className="size-16 md:size-20 lg:size-32 border-2 border-slate-600" />
          <Icon className="size-16 md:size-20 lg:size-32 border-4 border-slate-600" />
          <Icon className="size-16 md:size-20 lg:size-32 border-8 border-slate-600" />
        </div>
      </GridContainer>
      <CodeSample>
        <div>
          <div data-tag={icon} className="border-2 border-slate-600 ..." />
          <div data-tag={icon} className="border-4 border-slate-600 ..." />
          <div data-tag={icon} className="border-8 border-slate-600 ..." />
        </div>
      </CodeSample>
      <GridContainer>
        <div className="mx-auto flex justify-center gap-6 my-8">
          <Icon className="size-16 md:size-20 lg:size-32 border-solid border-2 border-slate-600" />
          <Icon className="size-16 md:size-20 lg:size-32 border-dashed border-2 border-slate-600" />
          <Icon className="size-16 md:size-20 lg:size-32 border-dotted border-2 border-slate-600" />
          <Icon className="size-16 md:size-20 lg:size-32 border-double border-2 border-slate-600" />
        </div>
      </GridContainer>
      <CodeSample>
        <div>
          <div data-tag={icon} className="border-solid border-slate-600 ..." />
          <div data-tag={icon} className="border-dashed border-slate-600 ..." />
          <div data-tag={icon} className="border-dotted border-slate-600 ..." />
          <div data-tag={icon} className="border-double border-slate-600 ..." />
        </div>
      </CodeSample>
      <GridContainer>
        <div className="mx-auto flex justify-center gap-6 my-8">
          <Icon className="size-16 md:size-20 lg:size-32 outline outline-offset-2 outline-1 bg-slate-200" />
          <Icon className="size-16 md:size-20 lg:size-32 outline outline-offset-2 outline-2 bg-slate-200" />
          <Icon className="size-16 md:size-20 lg:size-32 outline outline-offset-2 outline-4 bg-slate-200" />
        </div>
      </GridContainer>
      <CodeSample>
        <div>
          <div
            data-tag={icon}
            className="outline outline-offset-2 outline-1 ..."
          />
          <div
            data-tag={icon}
            className="outline outline-offset-2 outline-2 ..."
          />
          <div
            data-tag={icon}
            className="outline outline-offset-2 outline-4 ..."
          />
        </div>
      </CodeSample>
      <GridContainer>
        <div className="mx-auto flex justify-center gap-6 my-8">
          <Icon className="size-16 md:size-20 lg:size-32 ring-offset-2 ring" />
          <Icon className="size-16 md:size-20 lg:size-32 ring-offset-2 ring-2" />
          <Icon className="size-16 md:size-20 lg:size-32 ring-offset-2 ring-4" />
        </div>
      </GridContainer>
      <CodeSample>
        <div>
          <div data-tag={icon} className="ring-offset-2 ring ..." />
          <div data-tag={icon} className="ring-offset-2 ring-2 ..." />
          <div data-tag={icon} className="ring-offset-2 ring-4 ..." />
        </div>
      </CodeSample>
      Shadow
      <GridContainer>
        <div className="mx-auto flex justify-center gap-6 my-8">
          <Icon className="size-16 md:size-20 lg:size-32 shadow-md" />
          <Icon className="size-16 md:size-20 lg:size-32 shadow-lg" />
          <Icon className="size-16 md:size-20 lg:size-32 shadow-xl" />
          <Icon className="size-16 md:size-20 lg:size-32 shadow-2xl" />
        </div>
      </GridContainer>
      <CodeSample>
        <div>
          <div data-tag={icon} className="shadow-md ..." />
          <div data-tag={icon} className="shadow-lg ..." />
          <div data-tag={icon} className="shadow-xl ..." />
          <div data-tag={icon} className="shadow-2xl ..." />
        </div>
      </CodeSample>
      <GridContainer>
        <div className="mx-auto flex justify-center gap-6 my-8">
          <Icon className="size-16 md:size-20 lg:size-32 animate-bounce" />
          <Icon className="size-16 md:size-20 lg:size-32 animate-ping" />
          <Icon className="size-16 md:size-20 lg:size-32 animate-pulse" />
          <Icon className="size-16 md:size-20 lg:size-32 animate-spin" />
        </div>
      </GridContainer>
      <CodeSample>
        <div>
          <div data-tag={icon} className="animate-bounce ..." />
          <div data-tag={icon} className="animate-ping ..." />
          <div data-tag={icon} className="animate-pulse ..." />
          <div data-tag={icon} className="animate-spin ..." />
        </div>
      </CodeSample>
      <GridContainer>
        <div className="mx-auto flex justify-center gap-6 my-8">
          <Icon className="size-16 md:size-20 lg:size-32 scale-75" />
          <Icon className="size-16 md:size-20 lg:size-32 rotate-45" />
          <Icon className="size-16 md:size-20 lg:size-32 skew-y-12" />
        </div>
      </GridContainer>
      <CodeSample>
        <div>
          <div data-tag={icon} className="scale-75 ..." />
          <div data-tag={icon} className="rotate-45 ..." />
          <div data-tag={icon} className="skew-y-12 ..." />
        </div>
      </CodeSample>
      <GridContainer>
        <div className="mx-auto flex justify-center gap-6 my-8">
          <Icon className="size-16 md:size-20 lg:size-32 cursor-pointer" />
          <Icon className="size-16 md:size-20 lg:size-32 cursor-move" />
          <Icon className="size-16 md:size-20 lg:size-32 cursor-wait" />
          <Icon className="size-16 md:size-20 lg:size-32 cursor-grab" />
        </div>
      </GridContainer>
      <CodeSample>
        <div>
          <div data-tag={icon} className="cursor-pointer ..." />
          <div data-tag={icon} className="cursor-move ..." />
          <div data-tag={icon} className="cursor-wait ..." />
          <div data-tag={icon} className="cursor-grab ..." />
        </div>
      </CodeSample>
      <GridContainer>
        <div className="mx-auto flex justify-center gap-6 my-8">
          <Icon className="size-16 md:size-20 lg:size-32 blur" />
          <Icon className="size-16 md:size-20 lg:size-32 brightness-50" />
          <Icon className="size-16 md:size-20 lg:size-32 drop-shadow-lg" />
          <Icon className="size-16 md:size-20 lg:size-32 saturate-200" />
        </div>
      </GridContainer>
      <CodeSample>
        <div>
          <div data-tag={icon} className="blur ..." />
          <div data-tag={icon} className="brightness-50 ..." />
          <div data-tag={icon} className="drop-shadow-lg ..." />
          <div data-tag={icon} className="saturate-200 ..." />
        </div>
      </CodeSample>
    </>
  );
};

export default StateManagement;
