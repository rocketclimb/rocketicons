import { PropsWithLang } from "@/app/types";
import { MdxPartial } from "@/components/mdx";

import Wrapper from "@/components/documentation/wrapper";
import CodeSample from "@/components/code-block/code-sample";

import Demo from "./demo";

const ResponsiveDesign = ({ lang }: PropsWithLang) => {
  return (
    <>
      <MdxPartial lang={lang} slug={"responsive-design"} path="docs" />
      <Wrapper className="mx-auto">
        <Demo lang={lang} />
      </Wrapper>
      <Wrapper>
        <CodeSample>
          <div className="bg-white border grid grid-cols-6 grid-rows-4 sm:pt-6 h-96">
            <div className="col-span-2 self-center md:row-span-4 sm:border-r border-gray-200">
              <div
                data-cb-tag="RcRocketIcon"
                className="icon-sky-900 mx-auto block size-16 max-[300px]:size-12 sm:size-20 md:size-56"
              />
            </div>
            <div className="col-span-4 self-center sm:ml-14 md:ml-6 md:mt-16 md:row-span-2">
              <p className="font-semibold text-xs sm:text-sm md:text-sm max-[300px]:text-[10px] text-sky-500 tracking-normal dark:text-sky-400">
                A funny way handling icons
              </p>
              <span className="text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl max-[300px]:text-2xl">
                <span className="font-quicksand">rocket</span>
                <span className="font-quicksand font-semibold">icons</span>
              </span>
            </div>
            <div className="col-span-6 row-span-3 sm:mt-6 sm:pl-6 md:col-span-4 md:pl-2 md:mt-0 md:row-span-2">
              <p className="mx-4 mt-2 sm:text-lg md:text-sm text-slate-700 dark:text-slate-400 font-normal">
                Styling in a way
                <div
                  data-cb-tag="RcRocketIcon"
                  className="icon-slate-900-base sm:icon-slate-900-lg md:icon-slate-900-sm"
                />
                you&apos;ve never seen before.
              </p>
              <p className="mx-4 mt-2 sm:text-lg md:text-sm text-slate-700 dark:text-slate-400 font-normal">
                Looking for a way to share code between web and native applications?
              </p>
              <p className="mx-4 mt-2 sm:text-lg md:text-sm text-slate-700 dark:text-slate-400 font-normal">
                This tool can help you achieve that goal.
              </p>
            </div>
          </div>
        </CodeSample>
      </Wrapper>
      <div className="my-8">
        <MdxPartial
          lang={lang}
          slug={"responsive-design/responsive-design-explanation"}
          path="docs"
        />
      </div>
    </>
  );
};

export default ResponsiveDesign;
