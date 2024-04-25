import { PropsWithLang } from "@/types";
import { MdxPartial } from "@/components/mdx";

import { getCurrentIconData } from "@/components/usage/utils";
import GridContainer from "@/components/documentation/grid-container";
import UpdateAlert from "@/components/documentation/update-alert";

import CodeSample from "@/components/code-block/code-sample";
import StylingAnimation from "./styling-animation";
import Wrapper from "@/components/documentation/wrapper";

const StateManagement = ({ lang, queryIcon }: PropsWithLang & { queryIcon?: string }) => {
  const { icon, collection, Icon } = getCurrentIconData(queryIcon);
  return (
    <>
      <MdxPartial lang={lang} slug={"styling"} path="docs" />
      <StylingAnimation icon={icon} collection={collection} />
      <Wrapper>
        <MdxPartial lang={lang} slug={"styling/styling-bg"} path="docs" />
        <GridContainer>
          <div className="mx-auto flex justify-center gap-6 my-8">
            <Icon className="size-16 md:size-20 lg:size-32 rounded-xl bg-white" />
            <Icon className="size-16 md:size-20 lg:size-32 rounded-xl bg-red-200" />
            <Icon className="size-16 md:size-20 lg:size-32 rounded-xl bg-orange-200" />
            <Icon className="size-16 md:size-20 lg:size-32 rounded-xl bg-lime-200" />
          </div>
        </GridContainer>
        <CodeSample>
          <div>
            <div data-cb-tag={icon} className="bg-white ..." />
            <div data-cb-tag={icon} className="bg-red-200 ..." />
            <div data-cb-tag={icon} className="bg-orange-200 ..." />
            <div data-cb-tag={icon} className="bg-lime-200 ..." />
          </div>
        </CodeSample>
      </Wrapper>
      <Wrapper>
        <MdxPartial lang={lang} slug={"styling/styling-border"} path="docs" />
        <GridContainer>
          <div className="mx-auto flex justify-center gap-6 my-8">
            <Icon className="size-16 md:size-20 lg:size-32 border border-slate-600" />
            <Icon className="size-16 md:size-20 lg:size-32 rounded-md border border-slate-600" />
            <Icon className="size-16 md:size-20 lg:size-32 rounded-lg border border-slate-600" />
            <Icon className="size-16 md:size-20 lg:size-32 rounded-xl border border-slate-600" />
          </div>
        </GridContainer>
        <CodeSample>
          <div>
            <div data-cb-tag={icon} className="border border-slate-600 ..." />
            <div data-cb-tag={icon} className="rounded border border-slate-600 ..." />
            <div data-cb-tag={icon} className="rounded-md border border-slate-600 ..." />
            <div data-cb-tag={icon} className="rounded-lg border border-slate-600 ..." />
          </div>
        </CodeSample>
      </Wrapper>
      <Wrapper>
        <MdxPartial lang={lang} slug={"styling/styling-border-w"} path="docs" />
        <GridContainer>
          <div className="mx-auto flex justify-center gap-6 my-8">
            <Icon className="size-16 md:size-20 lg:size-32 border-2 border-slate-600" />
            <Icon className="size-16 md:size-20 lg:size-32 border-4 border-slate-600" />
            <Icon className="size-16 md:size-20 lg:size-32 border-8 border-slate-600" />
          </div>
        </GridContainer>
        <CodeSample>
          <div>
            <div data-cb-tag={icon} className="border-2 border-slate-600 ..." />
            <div data-cb-tag={icon} className="border-4 border-slate-600 ..." />
            <div data-cb-tag={icon} className="border-8 border-slate-600 ..." />
          </div>
        </CodeSample>
      </Wrapper>
      <Wrapper>
        <MdxPartial lang={lang} slug={"styling/styling-border-s"} path="docs" />
        <GridContainer>
          <div className="mx-auto flex justify-center gap-6 my-8">
            <Icon className="size-16 md:size-20 lg:size-32 border-solid border-2 border-slate-600" />
            <Icon className="size-16 md:size-20 lg:size-32 border-dashed border-2 border-slate-600" />
            <Icon className="size-16 md:size-20 lg:size-32 border-dotted border-2 border-slate-600" />
            <Icon className="size-16 md:size-20 lg:size-32 border-double border-4 border-slate-600" />
          </div>
        </GridContainer>
        <CodeSample>
          <div>
            <div data-cb-tag={icon} className="border-solid border-slate-600 ..." />
            <div data-cb-tag={icon} className="border-dashed border-slate-600 ..." />
            <div data-cb-tag={icon} className="border-dotted border-slate-600 ..." />
            <div data-cb-tag={icon} className="border-double border-slate-600 ..." />
          </div>
        </CodeSample>
      </Wrapper>
      <Wrapper>
        <MdxPartial lang={lang} slug={"styling/styling-outline"} path="docs" />
        <GridContainer>
          <div className="mx-auto flex justify-center gap-6 my-8">
            <Icon className="size-16 md:size-20 lg:size-32 outline outline-offset-2 outline-1 bg-slate-200" />
            <Icon className="size-16 md:size-20 lg:size-32 outline outline-offset-2 outline-2 bg-slate-200" />
            <Icon className="size-16 md:size-20 lg:size-32 outline outline-offset-2 outline-4 bg-slate-200" />
          </div>
        </GridContainer>
        <CodeSample>
          <div>
            <div data-cb-tag={icon} className="outline outline-offset-2 outline-1 ..." />
            <div data-cb-tag={icon} className="outline outline-offset-2 outline-2 ..." />
            <div data-cb-tag={icon} className="outline outline-offset-2 outline-4 ..." />
          </div>
        </CodeSample>
      </Wrapper>
      <Wrapper>
        <MdxPartial lang={lang} slug={"styling/styling-ring"} path="docs" />
        <GridContainer>
          <div className="mx-auto flex justify-center gap-6 my-8">
            <Icon className="size-16 md:size-20 lg:size-32 ring-offset-2 ring" />
            <Icon className="size-16 md:size-20 lg:size-32 ring-offset-2 ring-2" />
            <Icon className="size-16 md:size-20 lg:size-32 ring-offset-2 ring-4" />
          </div>
        </GridContainer>
        <CodeSample>
          <div>
            <div data-cb-tag={icon} className="ring-offset-2 ring ..." />
            <div data-cb-tag={icon} className="ring-offset-2 ring-2 ..." />
            <div data-cb-tag={icon} className="ring-offset-2 ring-4 ..." />
          </div>
        </CodeSample>
      </Wrapper>
      <Wrapper>
        <MdxPartial lang={lang} slug={"styling/styling-effects"} path="docs" />
        <GridContainer>
          <div className="mx-auto flex justify-center gap-6 my-8">
            <Icon className="size-16 md:size-20 lg:size-32 shadow-md dark:shadow-slate-700" />
            <Icon className="size-16 md:size-20 lg:size-32 shadow-lg dark:shadow-slate-700" />
            <Icon className="size-16 md:size-20 lg:size-32 shadow-xl dark:shadow-slate-700" />
            <Icon className="size-16 md:size-20 lg:size-32 shadow-2xl dark:shadow-slate-700" />
          </div>
        </GridContainer>
        <CodeSample>
          <div>
            <div data-cb-tag={icon} className="shadow-md ..." />
            <div data-cb-tag={icon} className="shadow-lg ..." />
            <div data-cb-tag={icon} className="shadow-xl ..." />
            <div data-cb-tag={icon} className="shadow-2xl ..." />
          </div>
        </CodeSample>
      </Wrapper>
      <Wrapper>
        <MdxPartial lang={lang} slug={"styling/styling-animate"} path="docs" />
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
            <div data-cb-tag={icon} className="animate-bounce ..." />
            <div data-cb-tag={icon} className="animate-ping ..." />
            <div data-cb-tag={icon} className="animate-pulse ..." />
            <div data-cb-tag={icon} className="animate-spin ..." />
          </div>
        </CodeSample>
      </Wrapper>
      <Wrapper>
        <MdxPartial lang={lang} slug={"styling/styling-transform"} path="docs" />
        <GridContainer>
          <div className="mx-auto flex justify-center gap-6 my-8">
            <Icon className="size-16 md:size-20 lg:size-32 scale-50" />
            <Icon className="size-16 md:size-20 lg:size-32 rotate-45" />
            <Icon className="size-16 md:size-20 lg:size-32 skew-y-12" />
          </div>
        </GridContainer>
        <CodeSample>
          <div>
            <div data-cb-tag={icon} className="scale-50 ..." />
            <div data-cb-tag={icon} className="rotate-45 ..." />
            <div data-cb-tag={icon} className="skew-y-12 ..." />
          </div>
        </CodeSample>
      </Wrapper>
      <Wrapper>
        <MdxPartial lang={lang} slug={"styling/styling-cursor"} path="docs" />
        <GridContainer>
          <div className="mx-auto flex justify-center gap-6 my-8">
            <Icon className="size-16 md:size-20 lg:size-32 cursor-pointer" />
            <Icon className="size-16 md:size-20 lg:size-32 cursor-move" />
            <Icon className="size-16 md:size-20 lg:size-32 cursor-wait" />
            <Icon className="size-16 md:size-20 lg:size-32 cursor-grab" />
          </div>
        </GridContainer>
        <UpdateAlert alert="hover" lang={lang} />
        <CodeSample>
          <div>
            <div data-cb-tag={icon} className="cursor-pointer ..." />
            <div data-cb-tag={icon} className="cursor-move ..." />
            <div data-cb-tag={icon} className="cursor-wait ..." />
            <div data-cb-tag={icon} className="cursor-grab ..." />
          </div>
        </CodeSample>
      </Wrapper>
      <Wrapper>
        <MdxPartial lang={lang} slug={"styling/styling-filters"} path="docs" />
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
            <div data-cb-tag={icon} className="blur ..." />
            <div data-cb-tag={icon} className="brightness-50 ..." />
            <div data-cb-tag={icon} className="drop-shadow-lg ..." />
            <div data-cb-tag={icon} className="saturate-200 ..." />
          </div>
        </CodeSample>
      </Wrapper>
    </>
  );
};

export default StateManagement;
